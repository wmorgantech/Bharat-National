// auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { ACCESS_TOKEN_TTL, getJwtSecret } from '../config/env';
import { RefreshTokenModule } from './refresh-token.module';


@Module({
  imports: [
    PassportModule,
    RefreshTokenModule,
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: { expiresIn: ACCESS_TOKEN_TTL },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}