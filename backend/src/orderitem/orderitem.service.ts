import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateOrderItemDto } from './dto/create-orderitem.dto';
import { UpdateOrderitemDto } from './dto/update-orderitem.dto';



@Injectable()
export class OrderItemService {
  private prisma = new PrismaClient();

  async create(createOrderItemDto: CreateOrderItemDto) {
    
    const order = await this.prisma.order.findUnique({
      where: { id: createOrderItemDto.orderId },
      select: { id: true, isActive: true },
    });
    if (!order || !order.isActive) {
      throw new BadRequestException(
        `Order #${createOrderItemDto.orderId} not found`,
      );
    }

    
    const product = await this.prisma.product.findUnique({
      where: { id: createOrderItemDto.productId },
      select: { id: true },
    });
    if (!product) {
      throw new BadRequestException(
        `Product #${createOrderItemDto.productId} not found`,
      );
    }

    return this.prisma.orderItem.create({
      data: { ...createOrderItemDto }, 
      include: { product: true, order: true },
    });
  }

  async findAll(orderId?: number) {
    return this.prisma.orderItem.findMany({
      where: orderId ? { orderId } : undefined,
      orderBy: { id: 'desc' },
      include: { product: true, order: true },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id },
      include: { product: true, order: true },
    });

    if (!item) throw new NotFoundException(`OrderItem #${id} not found`);
    return item;
  }

  async update(id: number, updateOrderItemDto: UpdateOrderitemDto) {
    const existing = await this.prisma.orderItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`OrderItem #${id} not found`);

    
    if (updateOrderItemDto.orderId) {
      const order = await this.prisma.order.findUnique({
        where: { id: updateOrderItemDto.orderId },
        select: { id: true, isActive: true },
      });
      if (!order || !order.isActive) {
        throw new BadRequestException(
          `Order #${updateOrderItemDto.orderId} not found`,
        );
      }
    }

    if (updateOrderItemDto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: updateOrderItemDto.productId },
        select: { id: true },
      });
      if (!product) {
        throw new BadRequestException(
          `Product #${updateOrderItemDto.productId} not found`,
        );
      }
    }

    return this.prisma.orderItem.update({
      where: { id },
      data: { ...updateOrderItemDto }, // ✅ spread style
      include: { product: true, order: true },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.orderItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`OrderItem #${id} not found`);

    await this.prisma.orderItem.delete({ where: { id } });
    return { success: true };
  }
}
