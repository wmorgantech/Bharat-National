import { PartialType } from '@nestjs/swagger';
import { CreateOrderItemDto } from './create-orderitem.dto';


export class UpdateOrderitemDto extends PartialType(CreateOrderItemDto) {}
