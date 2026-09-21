// admin.controller.ts
import {
  Controller,
  Post,
  Body,
  Request,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto, LoginAdminDto } from './dto/create-admin.dto';

import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';
import {
  ADMIN_LOGIN_THROTTLE,
  ADMIN_REGISTER_THROTTLE,
  REFRESH_THROTTLE,
} from '../common/throttle.config';
import {
  clearAdminRefreshCookie,
  readAdminRefreshCookie,
  setAdminRefreshCookie,
} from '../auth/refresh-cookie';


@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /** Moves the issued refresh token into an HttpOnly cookie. */
  private withRefreshCookie<T extends { refresh_token?: string }>(
    res: Response,
    payload: T,
  ): Omit<T, 'refresh_token'> {
    const { refresh_token, ...rest } = payload;

    if (refresh_token) {
      setAdminRefreshCookie(res, refresh_token);
    }

    return rest;
  }

  /**
   * Creating an admin requires an existing admin session. This endpoint is not
   * public: it is how an admin provisions another admin.
   *
   * The refresh token minted for the NEW admin is deliberately discarded rather
   * than set as a cookie: this response goes to the admin doing the creating,
   * so setting it would swap their own session to the new account. The new
   * admin signs in normally.
   */
  @Post('register')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Throttle(ADMIN_REGISTER_THROTTLE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new admin (existing admin only)' })
  async register(@Body() createAdminDto: CreateAdminDto) {
    const { refresh_token, ...rest } =
      await this.adminService.register(createAdminDto);

    return rest;
  }

  @Public()
  @Throttle(ADMIN_LOGIN_THROTTLE)
  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  async login(
    @Body() loginAdminDto: LoginAdminDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.withRefreshCookie(res, await this.adminService.login(loginAdminDto));
  }

  @Public()
  @Throttle(REFRESH_THROTTLE)
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate admin refresh token' })
  async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
    const token = readAdminRefreshCookie(req);

    if (!token) {
      throw new UnauthorizedException('Missing refresh token');
    }

    return this.withRefreshCookie(res, await this.adminService.refresh(token));
  }

  @Public()
  @Throttle(REFRESH_THROTTLE)
  @Post('logout')
  @ApiOperation({ summary: 'Revoke the current admin refresh token' })
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    const token = readAdminRefreshCookie(req);

    clearAdminRefreshCookie(res);

    if (!token) {
      return { success: true, message: 'Logged out' };
    }

    return this.adminService.logout(token);
  }

  @Post('logout-all')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all refresh tokens for the current admin' })
  async logoutAll(@Request() req, @Res({ passthrough: true }) res: Response) {
    clearAdminRefreshCookie(res);

    return this.adminService.logoutAll(req.user.userId);
  }

}
