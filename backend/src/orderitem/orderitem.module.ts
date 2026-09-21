import { Module } from '@nestjs/common';
import { OrderItemController } from './orderitem.controller';
import { OrderItemService } from './orderitem.service';


@Module({
  controllers: [OrderItemController],
  providers: [OrderItemService],
})
export class OrderitemModule {}
