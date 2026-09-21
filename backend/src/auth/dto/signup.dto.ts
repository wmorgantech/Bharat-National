// dto/signup.dto.ts
import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsString()
  name: string;

  @ApiProperty({ example: '9876543210', description: '10-digit mobile number' })
  @IsString()
  @Length(10, 10, { message: 'Mobile number must be exactly 10 digits' })
  mobilenumber: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
  password: string;

  // NOTE: `role` is deliberately not accepted here. Public signup always
  // creates a USER; admin accounts are issued only from the Admin module.
}

