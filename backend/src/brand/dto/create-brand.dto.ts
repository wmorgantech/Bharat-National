
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({ example: 'Samsung' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Leading global electronics brand',
  })
  @IsString()
  
  description: string;

  @ApiProperty({
    example: 'https://your-domain.com/uploads/samsung.png',
  })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
