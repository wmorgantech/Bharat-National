// src/order/dto/create-order.dto.ts
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { 
  ArrayMinSize, 
  IsEmail, 
  IsInt, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  Min, 
  MinLength, 
  ValidateNested 
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderItemInputDto } from './order-item-input.dto';

export class CreateOrderDto {
  @ApiPropertyOptional({
    example: 'cart_abc123',
    description: 'Optional cart identifier (used if tracking cart session)',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === null || value === undefined ? undefined : String(value),
  )
  cartId?: string;

  @ApiProperty({
    example: 1,
    description: 'Logged-in user ID (from User table)',
  })
  @IsInt()
  @Min(1)
  userId: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the customer placing the order',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ example: 'johndoe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '9876543210',
    description: 'Customer mobile number (10-digit Indian number)',
  })
  @IsString()
  @MinLength(10)
  phone: string;

  @ApiPropertyOptional({
    example: 'No.12, Anna Nagar, 3rd Street',
    description: 'Full delivery address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 'Chennai',
    description: 'City / Place for delivery',
  })
  @IsString()
  @MinLength(2)
  place: string;

  @ApiPropertyOptional({
    example: 'Tamil Nadu',
    description: 'State for delivery',
  })
  @IsOptional()
  @IsString()
  state?: string;  // ✅ Added state field

  @ApiPropertyOptional({
    example: '600001',
    description: '6-digit postal code',
  })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiPropertyOptional({
    example: 'online',
    description: 'Payment method (online or cod)',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({
    type: [OrderItemInputDto],
    description: 'List of items included in the order',
  })
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  @ArrayMinSize(1)
  items: OrderItemInputDto[];

  @ApiPropertyOptional({
    example: 'PLACED',
    description: 'Order status',
    enum: ['PLACED', 'ACCEPTED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
  })
  @IsOptional()
  @IsString()
  status?: string;  // Made optional, defaults to 'PLACED' in service

  @ApiPropertyOptional({
    example: 'Order placed successfully',
    description: 'Remarks about the order status',
  })
  @IsOptional()
  @IsString()
   cancelRemarks?: string;  // ✅ Added status remarks field
}