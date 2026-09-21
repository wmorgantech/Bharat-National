import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsInt,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 16 Pro' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Latest Apple smartphone with A18 chip',
  })
  @IsString()
  
  description: string;

  @ApiProperty({
    example: 79999.0,
    description: 'Price in INR',
  })
  @IsNumber()
  price: number;

 

  @ApiProperty({
    example: [
      'https://your-domain.com/uploads/products/iphone16-front.png',
      'https://your-domain.com/uploads/products/iphone16-back.png',
    ],
    type: [String],
    description: 'Array of product image URLs',
  })
  @IsArray()
  @IsString({ each: true })
  imageUrl: string[];

  @ApiProperty({
    example: 1,
    description: 'Category ID (FK)',
  })
  @IsInt()
  categoryId: number;

  @ApiProperty({
    example: 1,
    description: 'Brand ID (FK)',
  })
  @IsInt()
  brandId: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
