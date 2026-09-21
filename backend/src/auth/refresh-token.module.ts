import { Module } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';

/** Shared by AuthModule (storefront) and AdminModule (back office). */
@Module({
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
