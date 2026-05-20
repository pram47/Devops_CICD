import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { verifyAuthToken } from '../token.util';

type RequestWithAuthUser = {
  headers: Record<string, string | undefined>;
  auth_user_id?: string;
  body?: Record<string, unknown>;
  params?: Record<string, string | undefined>;
  query?: Record<string, string | string[] | undefined>;
};

type UserIdSource = 'body.user_id' | 'body.id' | 'param.userId' | 'param.id' | 'query.user_id';

export const AUTH_USER_ID_SOURCES_METADATA_KEY = 'auth_user_id_sources';
export const UseAuthUserIdSources = (...sources: UserIdSource[]) =>
  SetMetadata(AUTH_USER_ID_SOURCES_METADATA_KEY, sources);

@Injectable()
export class SessionUserMatchGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  private getSecret(): string {
    return this.config.get<string>('AUTH_JWT_SECRET')?.trim() || 'dev-jobby-secret-change-me';
  }

  private extractSessionToken(cookieHeader?: string): string | null {
    if (!cookieHeader) {
      return null;
    }
    const cookiePairs = cookieHeader.split(';').map((part) => part.trim());
    const sessionPair = cookiePairs.find((pair) => pair.startsWith('better-auth.session_token='));
    if (!sessionPair) {
      return null;
    }
    const [, value] = sessionPair.split('=');
    return value ? decodeURIComponent(value) : null;
  }

  private extractBearerToken(authorizationHeader?: string): string | null {
    if (!authorizationHeader) {
      return null;
    }
    if (!authorizationHeader.toLowerCase().startsWith('bearer ')) {
      return null;
    }
    const token = authorizationHeader.slice(7).trim();
    return token.length > 0 ? token : null;
  }

  private resolveAuthUserId(token: string): string | undefined {
    const payload = verifyAuthToken(token, this.getSecret());
    return payload?.sub;
  }

  private trimString(input: unknown): string | undefined {
    if (typeof input !== 'string') {
      return undefined;
    }
    const value = input.trim();
    return value.length > 0 ? value : undefined;
  }

  canActivate(context: ExecutionContext): Promise<boolean> | boolean {
    return this.authorize(context);
  }

  private pickClaimedUserId(
    request: RequestWithAuthUser,
    sources: UserIdSource[],
  ): string | undefined {
    for (const source of sources) {
      const value =
        source === 'body.user_id'
          ? this.trimString(request.body?.user_id)
          : source === 'body.id'
            ? this.trimString(request.body?.id)
            : source === 'param.userId'
              ? this.trimString(request.params?.userId)
              : source === 'param.id'
                ? this.trimString(request.params?.id)
                : this.trimString(request.query?.user_id);

      if (value) {
        return value;
      }
    }
    return undefined;
  }

  private async authorize(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuthUser>();
    const cookieHeader = this.trimString(request.headers.cookie);
    const sessionToken = this.extractSessionToken(cookieHeader);
    const bearerToken = this.extractBearerToken(this.trimString(request.headers.authorization));
    const authToken = bearerToken ?? sessionToken;

    if (!authToken) {
      throw new UnauthorizedException('Missing auth token (cookie session or Bearer token)');
    }

    const authUserId = this.resolveAuthUserId(authToken);
    if (!authUserId) {
      throw new UnauthorizedException('Session user not found');
    }
    request.auth_user_id = authUserId;

    const defaultSources: UserIdSource[] = [
      'body.user_id',
      'body.id',
      'param.userId',
      'param.id',
      'query.user_id',
    ];
    const configuredSources =
      this.reflector.getAllAndOverride<UserIdSource[]>(AUTH_USER_ID_SOURCES_METADATA_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? defaultSources;

    // Allow auth-only usage by explicitly setting @UseAuthUserIdSources() with no args.
    if (configuredSources.length === 0) {
      return true;
    }

    const claimedUserId = this.pickClaimedUserId(request, configuredSources);

    if (!claimedUserId) {
      throw new BadRequestException('Request user id is required');
    }

    if (claimedUserId !== authUserId) {
      throw new ForbiddenException('Request user id does not match authenticated user');
    }

    return true;
  }
}
