import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemInputDto {
  @ApiProperty({
    example: 1,
    description: 'Product ID from Product table',
  })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the product',
  })
  @IsInt()
  @Min(1)
  quantity: number;
}