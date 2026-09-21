import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ example: 1, description: 'Parent Order ID' })
  @IsInt()
  @Min(1)
  orderId: number;

  @ApiProperty({ example: 12, description: 'Product ID from Product table' })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({ example: 'Dell Laptop', description: 'Product name snapshot' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ example: 45000, description: 'Unit price snapshot' })
  @IsInt()
  @Min(1)
  unitPrice: number;

  @ApiProperty({ example: 2, description: 'Quantity' })
  @IsInt()
  @Min(1)
  quantity: number;
}
