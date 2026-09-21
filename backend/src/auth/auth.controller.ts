// auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiBody, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import {
  clearUserRefreshCookie,
  readUserRefreshCookie,
  setUserRefreshCookie,
} from './refresh-cookie';
import {
  LOGIN_THROTTLE,
  REFRESH_THROTTLE,
  SIGNUP_THROTTLE,
} from '../common/throttle.config';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Moves the issued refresh token out of the JSON body and into an HttpOnly
   * cookie, so it is never readable by page scripts.
   */
  private withRefreshCookie<T extends { refresh_token?: string }>(
    res: Response,
    payload: T,
  ): Omit<T, 'refresh_token'> {
    const { refresh_token, ...rest } = payload;

    if (refresh_token) {
      setUserRefreshCookie(res, refresh_token);
    }

    return rest;
  }

  @Public()
  @Throttle(SIGNUP_THROTTLE)
  @Post('signup')
  @ApiOperation({ summary: 'User signup' })
  @ApiBody({ type: SignupDto })
  async signup(@Body() body: SignupDto, @Res({ passthrough: true }) res: Response) {
    return this.withRefreshCookie(res, await this.authService.signup(body));
  }

  @Public()
  @Throttle(LOGIN_THROTTLE)
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.withRefreshCookie(res, await this.authService.login(body));
  }

  /**
   * Exchanges the refresh cookie for a new token pair. Public because the
   * access token it replaces has, by definition, usually expired.
   */
  @Public()
  @Throttle(REFRESH_THROTTLE)
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate refresh token and issue a new access token' })
  async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
    const token = readUserRefreshCookie(req);

    if (!token) {
      throw new UnauthorizedException('Missing refresh token');
    }

    return this.withRefreshCookie(res, await this.authService.refresh(token));
  }

  /** Per-device logout: revokes the refresh token held in the cookie. */
  @Public()
  @Throttle(REFRESH_THROTTLE)
  @Post('logout')
  @ApiOperation({ summary: 'Revoke the current refresh token' })
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    const token = readUserRefreshCookie(req);

    // Always clear the cookie, even if it carried nothing usable.
    clearUserRefreshCookie(res);

    if (!token) {
      return { success: true, message: 'Logged out' };
    }

    return this.authService.logout(token);
  }

  /** Revokes every session for the authenticated user. */
  @Post('logout-all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all refresh tokens for the current user' })
  async logoutAll(@Request() req, @Res({ passthrough: true }) res: Response) {
    clearUserRefreshCookie(res);

    return this.authService.logoutAll(req.user.userId);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current authenticated principal' })
  me(@Request() req) {
    return req.user;
  }
}
