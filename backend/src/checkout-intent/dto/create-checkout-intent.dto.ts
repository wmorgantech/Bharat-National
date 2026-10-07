import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CheckoutIntentItemDto } from './checkout-intent-item.dto';

export class CreateCheckoutIntentDto {
  @ApiProperty({
    description: 'Client-generated idempotency key for this checkout',
    format: 'uuid',
  })
  @IsUUID()
  checkoutKey: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ example: 'johndoe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @MinLength(10)
  phone: string;

  @ApiPropertyOptional({ example: 'No.12, Anna Nagar, 3rd Street' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Coimbatore' })
  @IsString()
  @MinLength(2)
  place: string;

  @ApiPropertyOptional({ example: 'Tamil Nadu' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '641001' })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiProperty({ type: [CheckoutIntentItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique((item: CheckoutIntentItemDto) => item.productId, {
    message: 'Each product may only appear once in the checkout',
  })
  @ValidateNested({ each: true })
  @Type(() => CheckoutIntentItemDto)
  items: CheckoutIntentItemDto[];
}
