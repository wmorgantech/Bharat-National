// src/order/dto/update-order.dto.ts
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderDto extends PartialType(
  OmitType(CreateOrderDto, ['items', 'userId'] as const),
) {
  @ApiPropertyOptional({
    example: 'SHIPPED',
    description: 'Order status',
    enum: ['PLACED', 'ACCEPTED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
  })
  @IsOptional()
  @IsString()
  @IsIn(['PLACED', 'ACCEPTED', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({
    example: 'Order has been shipped via BlueDart',
    description: 'Remarks about the status update',
  })
  @IsOptional()
  @IsString()
  cancelRemarks?: string;  // ✅ Added status remarks for update

  @ApiPropertyOptional({
    example: 'Tamil Nadu',
    description: 'State for delivery',
  })
  @IsOptional()
  @IsString()
  state?: string;  // ✅ Added state field for update
}