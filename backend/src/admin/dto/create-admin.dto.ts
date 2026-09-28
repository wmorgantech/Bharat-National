// dto/create-admin.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  MinLength,
  IsOptional,
  IsBoolean,
  IsString,
  IsNotEmpty
} from 'class-validator';

/**
 * Body for creating an admin.
 *
 * There is intentionally no `role` property. This project has exactly one admin
 * role, ADMIN, and it is assigned server-side. Accepting a role from the client
 * would let a caller nominate their own authority, and the field previously
 * advertised here was silently discarded anyway - which is worse than absent,
 * because Swagger promised something the service never honoured.
 */
export class CreateAdminDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Unique email address of the admin',
    required: true,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({
    example: 'StrongPass123',
    description: 'Password for the admin (minimum 6 characters)',
    minLength: 6,
    required: true,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the admin account is active',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}



export class LoginAdminDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Admin email address',
    required: true,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({
    example: 'StrongPass123',
    description: 'Admin password (minimum 6 characters)',
    minLength: 6,
    required: true,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}


