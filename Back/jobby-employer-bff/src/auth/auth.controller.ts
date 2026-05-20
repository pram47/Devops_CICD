import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignInEmailDto } from './dto/sign-in-email.dto';
import { SignUpEmailDto } from './dto/sign-up-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getHeaderValue(value: string | string[] | undefined): string | undefined {
    if (!value) {
      return undefined;
    }
    return Array.isArray(value) ? value[0] : value;
  }

  private readTokenFromRequest(req: Request): string | null {
    const authorization = this.getHeaderValue(req.headers.authorization);
    if (authorization?.toLowerCase().startsWith('bearer ')) {
      const token = authorization.slice(7).trim();
      if (token.length > 0) {
        return token;
      }
    }

    const cookieHeader = this.getHeaderValue(req.headers.cookie);
    if (!cookieHeader) {
      return null;
    }

    const pair = cookieHeader
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('better-auth.session_token='));

    if (!pair) {
      return null;
    }

    const [, value] = pair.split('=');
    return value ? decodeURIComponent(value) : null;
  }

  private applySessionCookie(res: Response, token: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('better-auth.session_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  @Post('sign-up/email')
  signUpEmail(@Body() dto: SignUpEmailDto, @Res({ passthrough: true }) res: Response) {
    const result = this.authService.signUpEmail(dto);
    this.applySessionCookie(res, result.token);
    return result;
  }

  @Post('sign-in/email')
  signInEmail(@Body() dto: SignInEmailDto, @Res({ passthrough: true }) res: Response) {
    const result = this.authService.signInEmail(dto);
    this.applySessionCookie(res, result.token);
    return result;
  }

  @Post('sign-out')
  signOut(@Res({ passthrough: true }) res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('better-auth.session_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });

    return { success: true };
  }

  @Get('session')
  getSession(@Req() req: Request) {
    const token = this.readTokenFromRequest(req);
    if (!token) {
      throw new UnauthorizedException('Missing auth token');
    }

    return this.authService.resolveSessionFromToken(token);
  }

  @Get('internal/session-user')
  getSessionUser(@Req() req: Request) {
    const token = this.readTokenFromRequest(req);
    if (!token) {
      throw new UnauthorizedException('Missing auth token');
    }

    const session = this.authService.resolveSessionFromToken(token);
    return { userId: session.user.id };
  }
}
