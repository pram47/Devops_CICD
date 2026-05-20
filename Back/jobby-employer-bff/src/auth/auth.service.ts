import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import { PostgresService } from '../database/postgres.service';
import { SignInEmailDto } from './dto/sign-in-email.dto';
import { SignUpEmailDto } from './dto/sign-up-email.dto';
import { AuthTokenPayload, createAuthToken, verifyAuthToken } from './token.util';

type AuthUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
};

@Injectable()
export class AuthService {
  private readonly usersByEmail = new Map<string, AuthUser>();
  private readonly usersById = new Map<string, AuthUser>();
  private schemaReady = false;

  constructor(
    private readonly config: ConfigService,
    private readonly postgres: PostgresService,
  ) {
    this.seedDefaultUser();
  }

  private async ensureAuthTable(): Promise<void> {
    if (this.schemaReady || !this.postgres.isConfigured()) {
      return;
    }

    await this.postgres.query(`
      create table if not exists bff_auth_users (
        id uuid primary key,
        email text not null unique,
        name text not null,
        password_hash text not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `);

    this.schemaReady = true;
  }

  private getSecret(): string {
    return this.config.get<string>('AUTH_JWT_SECRET')?.trim() || 'dev-jobby-secret-change-me';
  }

  private getPasswordSalt(): string {
    return this.config.get<string>('AUTH_PASSWORD_SALT')?.trim() || 'jobby-salt';
  }

  private getTokenTtlSeconds(): number {
    const raw = Number(this.config.get<string>('AUTH_TOKEN_TTL_SECONDS') ?? '86400');
    if (Number.isNaN(raw) || raw <= 0) {
      return 86400;
    }
    return Math.floor(raw);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private hashPassword(password: string): string {
    return createHash('sha256').update(`${this.getPasswordSalt()}::${password}`).digest('hex');
  }

  private createUser(email: string, password: string, name?: string): AuthUser {
    const normalizedEmail = this.normalizeEmail(email);
    const existing = this.usersByEmail.get(normalizedEmail);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const user: AuthUser = {
      id: randomUUID(),
      email: normalizedEmail,
      name: name?.trim() || normalizedEmail.split('@')[0] || 'Employer',
      passwordHash: this.hashPassword(password),
    };

    this.usersByEmail.set(normalizedEmail, user);
    this.usersById.set(user.id, user);
    return user;
  }

  private async createUserInDb(email: string, password: string, name?: string): Promise<AuthUser> {
    await this.ensureAuthTable();
    const normalizedEmail = this.normalizeEmail(email);
    const user: AuthUser = {
      id: randomUUID(),
      email: normalizedEmail,
      name: name?.trim() || normalizedEmail.split('@')[0] || 'Employer',
      passwordHash: this.hashPassword(password),
    };

    try {
      await this.postgres.query(
        `
          insert into bff_auth_users (id, email, name, password_hash)
          values ($1, $2, $3, $4)
        `,
        [user.id, user.email, user.name, user.passwordHash],
      );
    } catch (error) {
      if (error instanceof Error && /duplicate key|unique/i.test(error.message)) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }

    return user;
  }

  private async findUserByEmail(email: string): Promise<AuthUser | null> {
    const normalizedEmail = this.normalizeEmail(email);
    if (!this.postgres.isConfigured()) {
      return this.usersByEmail.get(normalizedEmail) ?? null;
    }

    await this.ensureAuthTable();
    const result = await this.postgres.query<{
      id: string;
      email: string;
      name: string;
      password_hash: string;
    }>(
      `
        select id, email, name, password_hash
        from bff_auth_users
        where email = $1
        limit 1
      `,
      [normalizedEmail],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      passwordHash: row.password_hash,
    };
  }

  private async findUserById(id: string): Promise<AuthUser | null> {
    if (!this.postgres.isConfigured()) {
      return this.usersById.get(id) ?? null;
    }

    await this.ensureAuthTable();
    const result = await this.postgres.query<{
      id: string;
      email: string;
      name: string;
      password_hash: string;
    }>(
      `
        select id, email, name, password_hash
        from bff_auth_users
        where id = $1
        limit 1
      `,
      [id],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      passwordHash: row.password_hash,
    };
  }

  private buildAuthResponse(user: AuthUser): {
    token: string;
    redirect: boolean;
    user: { id: string; email: string; name: string };
  } {
    const now = Math.floor(Date.now() / 1000);
    const payload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      iat: now,
      exp: now + this.getTokenTtlSeconds(),
    };

    const token = createAuthToken(payload, this.getSecret());

    return {
      token,
      redirect: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  private seedDefaultUser(): void {
    const email =
      this.config.get<string>('AUTH_DEFAULT_EMAIL')?.trim() || 'company2.123@gmail.com';
    const password =
      this.config.get<string>('AUTH_DEFAULT_PASSWORD')?.trim() || '12345678';
    const name = this.config.get<string>('AUTH_DEFAULT_NAME')?.trim() || 'Company 2';

    if (!this.usersByEmail.has(this.normalizeEmail(email))) {
      this.createUser(email, password, name);
    }
  }

  async ensureDefaultUserInDb(): Promise<void> {
    if (!this.postgres.isConfigured()) {
      return;
    }

    const email =
      this.config.get<string>('AUTH_DEFAULT_EMAIL')?.trim() || 'company2.123@gmail.com';
    const password =
      this.config.get<string>('AUTH_DEFAULT_PASSWORD')?.trim() || '12345678';
    const name = this.config.get<string>('AUTH_DEFAULT_NAME')?.trim() || 'Company 2';

    const existing = await this.findUserByEmail(email);
    if (existing) {
      return;
    }

    await this.createUserInDb(email, password, name);
  }

  async signUpEmail(dto: SignUpEmailDto) {
    const user = this.postgres.isConfigured()
      ? await this.createUserInDb(dto.email, dto.password, dto.name)
      : this.createUser(dto.email, dto.password, dto.name);
    return this.buildAuthResponse(user);
  }

  async signInEmail(dto: SignInEmailDto) {
    await this.ensureDefaultUserInDb();
    const user = await this.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const submittedHash = this.hashPassword(dto.password);
    if (submittedHash !== user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async resolveSessionFromToken(token: string): Promise<{
    user: { id: string; email: string; name: string };
    session: { userId: string; token: string };
  }> {
    const payload = verifyAuthToken(token, this.getSecret());
    if (!payload) {
      throw new UnauthorizedException('Invalid session');
    }

    const user = await this.findUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      session: {
        userId: user.id,
        token,
      },
    };
  }
}
