// admin.controller.ts
import {
  Controller,
  Post,
  Body,
  Request,
} from '@nestjs/common';
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
import { RefreshTokenDto } from '../auth/dto/refresh.dto';


@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Creating an admin requires an existing admin session. This endpoint is not
   * public: it is how an admin provisions another admin.
   */
  @Post('register')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Throttle(ADMIN_REGISTER_THROTTLE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new admin (existing admin only)' })
  register(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.register(createAdminDto);
  }

  @Public()
  @Throttle(ADMIN_LOGIN_THROTTLE)
  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  login(@Body() loginAdminDto: LoginAdminDto) {
    return this.adminService.login(loginAdminDto);
  }

  @Public()
  @Throttle(REFRESH_THROTTLE)
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate admin refresh token' })
  refresh(@Body() body: RefreshTokenDto) {
    return this.adminService.refresh(body.refresh_token);
  }

  @Public()
  @Throttle(REFRESH_THROTTLE)
  @Post('logout')
  @ApiOperation({ summary: 'Revoke a single admin refresh token' })
  logout(@Body() body: RefreshTokenDto) {
    return this.adminService.logout(body.refresh_token);
  }

  @Post('logout-all')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all refresh tokens for the current admin' })
  logoutAll(@Request() req) {
    return this.adminService.logoutAll(req.user.userId);
  }

}
