// dto/login.dto.ts
import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '9876543210', description: '10-digit mobile number' })
  @IsString()
  @Length(10, 10, { message: 'Mobile number must be exactly 10 digits' })
  mobilenumber: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  password: string;
}