
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { Roles } from 'src/auth/roles.decorator';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('stats')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  async getUserStats() {
    return this.userService.getUserStats();
  }
}
