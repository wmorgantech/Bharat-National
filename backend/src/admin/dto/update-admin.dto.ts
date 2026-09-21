// dto/update-admin.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsEmail, 
  MinLength, 
  IsOptional, 
  IsBoolean, 
  IsString 
} from 'class-validator';

export class UpdateAdminDto {
  @ApiPropertyOptional({
    example: 'admin@example.com',
    description: 'Updated email address',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    example: 'NewStrongPass123',
    description: 'Updated password (minimum 6 characters)',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether the admin account is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}