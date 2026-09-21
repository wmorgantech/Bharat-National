import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthUser } from '../auth/jwt.strategy';

/**
 * Customer fields safe to embed in an order response. Deliberately excludes
 * `password`, `otp` and `otpExpiredAt`.
 */
const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  mobilenumber: true,
  address: true,
  city: true,
  state: true,
  pincode: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class OrderService {
  private prisma = new PrismaClient();

  private isAdmin(requester: AuthUser): boolean {
    return requester.type === 'ADMIN';
  }

  async create(createOrderDto: CreateOrderDto, requester: AuthUser) {
      const { items, state,  cancelRemarks } = createOrderDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('Items are required');
    }

    // Ownership comes from the authenticated token. An admin may place an order
    // on behalf of a customer; a customer can only order for themselves.
    const userId = this.isAdmin(requester)
      ? createOrderDto.userId
      : requester.userId;

    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    // ✅ Validate user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // ✅ Fetch products
    const productIds = items.map((i) => i.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    // ✅ Calculate total
    let totalAmount = 0;

    const orderItemData = items.map((i) => {
      const p = products.find((x) => x.id === i.productId)!;

      const unitPrice = p.price;
      totalAmount += unitPrice * i.quantity;

      return {
        productId: p.id,
        productName: p.name,
        unitPrice,
        quantity: i.quantity,
      };
    });

    // ✅ Create order
    const order = await this.prisma.order.create({
      data: {
        userId,
        fullName: createOrderDto.fullName,
        email: createOrderDto.email ?? "",
        phone: createOrderDto.phone,
        address: createOrderDto.address,
        place: createOrderDto.place,
        pincode: createOrderDto.pincode,
         state: state || createOrderDto.state,
        paymentMethod: createOrderDto.paymentMethod,
   status: 'PLACED',
      cancelRemarks:  cancelRemarks || 'Order placed successfully', 
        totalAmount,
        orderItem: {
          create: orderItemData,
        },
      },
      include: {
        orderItem: true,
      },
    });

    return {
      message: 'Order created successfully',
      order,
    };
  }

 findAll(requester: AuthUser, userId?: number) {
  // Non-admins are always scoped to their own orders; any userId supplied by
  // the client is ignored rather than trusted.
  const scopedUserId = this.isAdmin(requester) ? userId : requester.userId;

  return this.prisma.order.findMany({
    where: scopedUserId ? { userId: scopedUserId } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      orderItem: { include: { product: true } },
    },
  });
}

  findActive() {
    return this.prisma.order.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        orderItem: { include: { product: true } },
        user: { select: SAFE_USER_SELECT },
      },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItem: { include: { product: true } },
        user: { select: SAFE_USER_SELECT },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  /** Same as findOne, but enforces that the caller owns the order. */
  async findOneForRequester(id: number, requester: AuthUser) {
    const order = await this.findOne(id);

    if (!this.isAdmin(requester) && order.userId !== requester.userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

// src/order/order.service.ts

async update(id: number, updateOrderDto: UpdateOrderDto) {
  await this.findOne(id);

  const data: any = { ...updateOrderDto };
  delete data.items;
  delete data.totalAmount;

  // If status is being changed to CANCELLED, require cancelRemarks
  if (updateOrderDto.status === 'CANCELLED') {
    if (!updateOrderDto.cancelRemarks) {
      throw new BadRequestException('Cancellation remarks are required when cancelling an order');
    }
    data.cancelRemarks = updateOrderDto.cancelRemarks;
  } else if (updateOrderDto.status && updateOrderDto.status !== 'CANCELLED') {
    // For non-cancellation status updates, you might want to add status remarks
    // But don't use cancelRemarks for these
    if (updateOrderDto.cancelRemarks) {
      // Optional: You could store this in a different field like 'statusRemarks'
      // For now, we'll ignore it for non-cancellation statuses
    }
  }

  // Remove cancelRemarks from data if it's not a cancellation
  if (updateOrderDto.status !== 'CANCELLED') {
    delete data.cancelRemarks;
  }

  const order = await this.prisma.order.update({
    where: { id },
    data,
    include: {
      orderItem: { include: { product: true } },
    },
  });

  return {
    message: 'Order updated successfully',
    order,
  };
}

  async remove(id: number) {
    const existing = await this.findOne(id);

    if (!existing.isActive) {
      return {
        message: 'Order already inactive',
        order: existing,
      };
    }

    const order = await this.prisma.order.update({
      where: { id },
      data: { isActive: false },
      include: {
        orderItem: { include: { product: true } },
      },
    });

    return {
      message: 'Order marked as inactive',
      order,
    };
  }

  async findLastByUser(requester: AuthUser, userId?: number) {
  const scopedUserId = this.isAdmin(requester) ? userId : requester.userId;

  if (!scopedUserId) {
    throw new BadRequestException('userId is required');
  }

  const order = await this.prisma.order.findFirst({
    where: { userId: scopedUserId },
    orderBy: { createdAt: 'desc' },
    include: {
      orderItem: true,
    },
  });

  if (!order) {
    throw new NotFoundException('No orders found for this user');
  }

  return order;
}

async getOrderStatusStats() {
  const statuses = ['PLACED', 'ACCEPTED', 'SHIPPED', 'DELIVERED','CANCELLED',];

  const results = await Promise.all(
    statuses.map(async (status) => {
      const count = await this.prisma.order.count({
        where: { status },
      });

      return { status, count };
    }),
  );

  return {
    total: results.reduce((sum, r) => sum + r.count, 0),
    data: results,
  };
}

async getFilteredStats() {
  const validStatuses = ['ACCEPTED', 'SHIPPED', 'DELIVERED'];

  const totalSales = await this.prisma.order.count({
    where: {
      status: { in: validStatuses },
    },
  });

  const uniqueCustomersData = await this.prisma.order.groupBy({
    by: ['userId'],
    where: {
      status: { in: validStatuses },
    },
  });

  const totalQuantityData = await this.prisma.orderItem.aggregate({
    _sum: { quantity: true },
    where: {
      order: {
        status: { in: validStatuses },
      },
    },
  });

  const totalValueData = await this.prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      status: { in: validStatuses },
    },
  });

  return {
    totalSales,
    uniqueCustomers: uniqueCustomersData.length,
    totalQuantity: totalQuantityData._sum.quantity || 0,
    totalValue: totalValueData._sum.totalAmount || 0,
  };
}

async findValidOrders() {
  const validStatuses = ['ACCEPTED', 'SHIPPED', 'DELIVERED'];

  const orders = await this.prisma.order.findMany({
    where: {
      status: {
        in: validStatuses,
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      orderItem: true,
    },
  });

  return orders;
}

// Add this method to your OrderService
async findAllWithUsers(userId?: number) {
  const orders = await this.prisma.order.findMany({
    where: userId ? { userId } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      orderItem: {
        include: { product: true }
      },
      user: { select: SAFE_USER_SELECT },
    },
  });
  return orders;
}

async getAllUsersWithOrderStats() {
  const users = await this.prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      mobilenumber: true,
      city: true,
      createdAt: true,
      orders: {
        select: {
          status: true,
          totalAmount: true,
          createdAt: true,
          orderItem: {
            select: {
              quantity: true,
            },
          },
        },
      },
    },
  });

  const result = users.map(user => {
    const orders = user.orders || [];
    
    // Get successful orders (ACCEPTED, SHIPPED, DELIVERED)
    const successfulOrders = orders.filter(o => 
      ['ACCEPTED', 'SHIPPED', 'DELIVERED'].includes(o.status)
    );
    
    const hasOrdered = successfulOrders.length > 0;
    const hasCancelled = orders.some(o => o.status === 'CANCELLED');
    const hasAbandoned = orders.some(o => o.status === 'ABANDONED');
    
    const totalSpent = successfulOrders
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    const totalQuantity = successfulOrders
      .flatMap(o => o.orderItem || [])
      .reduce((sum, item) => sum + (item.quantity || 0), 0);

    const lastOrderAt = successfulOrders.length > 0 
      ? successfulOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
      : null;

    return {
      id: user.id,
      fullName: user.name,
      email: user.email || "",
      phone: user.mobilenumber || "",
      city: user.city || "",
      joinDate: user.createdAt,
      lastOrderAt,
      ordersCount: successfulOrders.length,  // ← Only ACCEPTED/SHIPPED/DELIVERED orders
      totalSpent,
      totalQuantity,
      hasOrdered,
      hasCancelled,
      hasAbandoned,
    };
  });

  // Sort by last order date
  result.sort((a, b) => {
    const aTime = a.lastOrderAt ? new Date(a.lastOrderAt).getTime() : 0;
    const bTime = b.lastOrderAt ? new Date(b.lastOrderAt).getTime() : 0;
    return bTime - aTime;
  });

  return result;
}

}