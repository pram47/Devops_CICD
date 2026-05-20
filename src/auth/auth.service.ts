import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
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

  constructor(private readonly config: ConfigService) {
    this.seedDefaultUser();
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

  signUpEmail(dto: SignUpEmailDto) {
    const user = this.createUser(dto.email, dto.password, dto.name);
    return this.buildAuthResponse(user);
  }

  signInEmail(dto: SignInEmailDto) {
    const normalizedEmail = this.normalizeEmail(dto.email);
    const user = this.usersByEmail.get(normalizedEmail);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const submittedHash = this.hashPassword(dto.password);
    if (submittedHash !== user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  resolveSessionFromToken(token: string): {
    user: { id: string; email: string; name: string };
    session: { userId: string; token: string };
  } {
    const payload = verifyAuthToken(token, this.getSecret());
    if (!payload) {
      throw new UnauthorizedException('Invalid session');
    }

    const user = this.usersById.get(payload.sub);
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
