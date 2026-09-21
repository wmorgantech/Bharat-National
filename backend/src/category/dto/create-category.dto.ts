// src/category/dto/create-category.dto.ts
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: "SmartPhone" })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Latest Android Smartphone',
  })

  @IsString()
  description: string;

  @ApiProperty({
    example: 'https://your-domain.com/uploads/smartphonr.png',
  })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
