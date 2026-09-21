import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'The refresh token issued by login, signup or a prior refresh',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
