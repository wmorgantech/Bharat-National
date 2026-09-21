// admin.controller.ts
import {
  Controller,
  Post,
  Body,
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
} from '../common/throttle.config';


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

}
