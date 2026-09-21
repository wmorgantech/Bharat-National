// admin.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ACCESS_TOKEN_TTL, getJwtSecret } from '../config/env';
import { RefreshTokenModule } from '../auth/refresh-token.module';

@Module({
  imports: [
    RefreshTokenModule,
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: { expiresIn: ACCESS_TOKEN_TTL },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}