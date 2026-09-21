import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ✅ Create Order
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

@Get()
findAll(@Query('userId') userId?: string) {
  return this.orderService.findAll(userId ? Number(userId) : undefined);
}


  // ✅ Get Active Orders
  @Get('active')
  findActive() {
    return this.orderService.findActive();
  }

   @Get('last')
  findLast(@Query('userId') userId: string) {
    return this.orderService.findLastByUser(Number(userId));
  }


  @Get('stats')
  async getSalesStats() {
    return this.orderService.getFilteredStats();
  }

  @Get('valid')
findValidOrders() {
  return this.orderService.findValidOrders();
}

 @Get('status-stats')
getStatusStats() {
  return this.orderService.getOrderStatusStats();
}



// Add these endpoints to your OrderController

@Get('users/all')
async getAllUsersWithOrderStats() {
  return this.orderService.getAllUsersWithOrderStats();
}

@Get('all/with-users')
async findAllWithUsers(@Query('userId') userId?: string) {
  return this.orderService.findAllWithUsers(userId ? Number(userId) : undefined);
}

@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.orderService.findOne(id);
}


  // ✅ Update Order
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.update(id, updateOrderDto);
  }

  // ✅ Soft Delete Order
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.remove(id);
  }
}