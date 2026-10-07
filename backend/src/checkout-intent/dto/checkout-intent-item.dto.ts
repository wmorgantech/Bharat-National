import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CheckoutIntentItemDto {
  @ApiProperty({ example: 1, description: 'Product ID from the Product table' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({ example: 2, description: 'Requested quantity' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}
