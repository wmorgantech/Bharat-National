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
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Roles } from 'src/auth/roles.decorator';

@ApiTags('Order')
@ApiBearerAuth()
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ✅ Create Order (ownership taken from the authenticated token)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.orderService.create(createOrderDto, req.user);
  }

  // Customers see only their own orders; admins see all, or filter by userId.
  @Get()
  findAll(@Request() req, @Query('userId') userId?: string) {
    return this.orderService.findAll(
      req.user,
      userId ? Number(userId) : undefined,
    );
  }

  // ✅ Get Active Orders
  @Get('active')
  @Roles('ADMIN', 'SUPER_ADMIN')
  findActive() {
    return this.orderService.findActive();
  }

  @Get('last')
  findLast(@Request() req, @Query('userId') userId?: string) {
    return this.orderService.findLastByUser(
      req.user,
      userId ? Number(userId) : undefined,
    );
  }

  @Get('stats')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getSalesStats() {
    return this.orderService.getFilteredStats();
  }

  @Get('valid')
  @Roles('ADMIN', 'SUPER_ADMIN')
  findValidOrders() {
    return this.orderService.findValidOrders();
  }

  @Get('status-stats')
  @Roles('ADMIN', 'SUPER_ADMIN')
  getStatusStats() {
    return this.orderService.getOrderStatusStats();
  }

  @Get('users/all')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getAllUsersWithOrderStats() {
    return this.orderService.getAllUsersWithOrderStats();
  }

  @Get('all/with-users')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async findAllWithUsers(@Query('userId') userId?: string) {
    return this.orderService.findAllWithUsers(userId ? Number(userId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.orderService.findOneForRequester(id, req.user);
  }

  // ✅ Update Order (status workflow is back-office only)
  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.update(id, updateOrderDto);
  }

  // ✅ Soft Delete Order
  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.remove(id);
  }
}
