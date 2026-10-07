import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PAID_ORDER_WHERE } from '../common/paid-order-metrics';
import { AuthUser } from '../auth/jwt.strategy';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

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

const ORDER_DETAIL_SELECT = {
  id: true,
  userId: true,
  fullName: true,
  email: true,
  phone: true,
  address: true,
  pincode: true,
  state: true,
  paymentMethod: true,
  paymentStatus: true,
  paidAt: true,
  place: true,
  totalAmount: true,
  status: true,
  cancelRemarks: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  orderItem: { include: { product: true } },
  user: { select: SAFE_USER_SELECT },
} satisfies Prisma.OrderSelect;

const ADMIN_PAYMENT_TRACE_SELECT = {
  payments: {
    select: {
      id: true,
      provider: true,
      razorpayOrderId: true,
      razorpayPaymentId: true,
      status: true,
      method: true,
      paidAt: true,
      createdAt: true,
    },
  },
  checkoutIntent: {
    select: { id: true },
  },
} satisfies Prisma.OrderSelect;

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  private isAdmin(requester: AuthUser): boolean {
    return requester.type === 'ADMIN';
  }

  async create(createOrderDto: CreateOrderDto, requester: AuthUser) {
    const { items, state, cancelRemarks } = createOrderDto;

    if (createOrderDto.paymentMethod === 'online') {
      throw new BadRequestException(
        'Online orders must be created after payment verification',
      );
    }
    if (createOrderDto.paymentMethod !== 'cod') {
      throw new BadRequestException(
        'Payment method must be exactly "cod" or "online"',
      );
    }

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
        email: createOrderDto.email ?? '',
        phone: createOrderDto.phone,
        address: createOrderDto.address,
        place: createOrderDto.place,
        pincode: createOrderDto.pincode,
        state: state || createOrderDto.state,
        paymentMethod: createOrderDto.paymentMethod,
        status: 'PLACED',
        cancelRemarks: cancelRemarks || 'Order placed successfully',
        totalAmount,
        orderItem: {
          create: orderItemData,
        },
      },
      include: {
        orderItem: true,
      },
    });

    await this.sendOrderConfirmation(order);

    return {
      message: 'Order created successfully',
      order,
    };
  }

  /**
   * Best-effort order confirmation mail.
   *
   * Never throws: the order is already committed, so a mail transport problem
   * must not surface as a failed order to a customer whose order did succeed.
   */
  private async sendOrderConfirmation(order: {
    id: number;
    fullName: string;
    // Nullable in the schema; the guard below narrows it before use.
    email: string | null;
    phone: string;
    place: string;
    totalAmount: number;
    status: string | null;
    paymentStatus: string | null;
    paymentMethod: string | null;
    createdAt: Date;
    orderItem: Array<{
      productName: string;
      unitPrice: number;
      quantity: number;
    }>;
  }): Promise<void> {
    if (!order.email) {
      this.logger.warn(
        `Order #${order.id} has no email address; confirmation mail skipped.`,
      );
      return;
    }

    try {
      await this.mailService.sendOrderPlacedToUser({
        id: order.id,
        fullName: order.fullName,
        email: order.email,
        phone: order.phone,
        place: order.place,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        orderItem: order.orderItem,
      });
    } catch (error) {
      this.logger.error(
        `Order #${order.id} was created, but the confirmation email to ${order.email} could not be sent: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
    }
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
    const isAdmin = this.isAdmin(requester);
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: {
        ...ORDER_DETAIL_SELECT,
        ...(isAdmin ? ADMIN_PAYMENT_TRACE_SELECT : {}),
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (!isAdmin && order.userId !== requester.userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  async collectCodPayment(id: number, requester: AuthUser) {
    if (requester.type !== 'ADMIN' || requester.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    const collection = await this.prisma.$transaction(async (transaction) => {
      const [lockedOrder] = await transaction.$queryRaw<{ id: number }[]>(
        Prisma.sql`SELECT "id" FROM "Order" WHERE "id" = ${id} FOR UPDATE`,
      );
      if (!lockedOrder) throw new NotFoundException('Order not found');

      const order = await transaction.order.findUnique({
        where: { id },
        include: {
          codCollection: {
            select: {
              id: true,
              orderId: true,
              paymentId: true,
              adminId: true,
              action: true,
              collectedAt: true,
              payment: {
                select: {
                  id: true,
                  orderId: true,
                  checkoutIntentId: true,
                  provider: true,
                  razorpayOrderId: true,
                  razorpayPaymentId: true,
                  razorpaySignature: true,
                  amount: true,
                  currency: true,
                  status: true,
                  method: true,
                  paidAt: true,
                },
              },
            },
          },
        },
      });
      if (!order) throw new NotFoundException('Order not found');

      if (order.paymentStatus === 'PAID') {
        const existing = order.codCollection;
        if (
          order.paymentMethod === 'cod' &&
          existing?.action === 'COD_COLLECTED' &&
          existing.adminId > 0 &&
          existing.paymentId === existing.payment.id &&
          existing.payment.orderId === order.id &&
          existing.payment.checkoutIntentId === null &&
          existing.payment.provider === 'COD' &&
          existing.payment.razorpayOrderId === null &&
          existing.payment.razorpayPaymentId === null &&
          existing.payment.razorpaySignature === null &&
          existing.payment.amount === order.totalAmount * 100 &&
          existing.payment.currency === 'INR' &&
          existing.payment.method === 'cod' &&
          existing.payment.status === 'SUCCESS' &&
          existing.payment.paidAt?.getTime() ===
            existing.collectedAt.getTime() &&
          order.paidAt?.getTime() === existing.collectedAt.getTime()
        ) {
          return existing;
        }
        throw new ConflictException(
          'Paid order has no valid COD collection record',
        );
      }

      if (order.paymentMethod !== 'cod') {
        throw new BadRequestException('Only COD orders can be collected');
      }
      if (order.status === 'CANCELLED') {
        throw new ConflictException('Cancelled orders cannot be collected');
      }
      if (!order.isActive) {
        throw new ConflictException('Inactive orders cannot be collected');
      }
      if (order.paymentStatus !== 'UNPAID') {
        throw new ConflictException('Order is not eligible for collection');
      }

      if (
        !Number.isSafeInteger(order.totalAmount) ||
        order.totalAmount <= 0 ||
        !Number.isSafeInteger(order.totalAmount * 100)
      ) {
        throw new BadRequestException('Order amount is invalid');
      }

      const collectedAt = new Date();
      const payment = await transaction.payment.create({
        data: {
          orderId: order.id,
          checkoutIntentId: null,
          provider: 'COD',
          razorpayOrderId: null,
          razorpayPaymentId: null,
          razorpaySignature: null,
          amount: order.totalAmount * 100,
          currency: 'INR',
          status: 'SUCCESS',
          method: 'cod',
          failureReason: null,
          notes: Prisma.DbNull,
          paidAt: collectedAt,
        },
        select: {
          id: true,
          orderId: true,
          provider: true,
          amount: true,
          currency: true,
          status: true,
          method: true,
          paidAt: true,
        },
      });

      const updatedOrder = await transaction.order.updateMany({
        where: {
          id: order.id,
          paymentMethod: 'cod',
          paymentStatus: 'UNPAID',
          isActive: true,
          status: { not: 'CANCELLED' },
        },
        data: {
          paymentStatus: 'PAID',
          paidAt: collectedAt,
        },
      });
      if (updatedOrder.count !== 1) {
        throw new ConflictException('Order is not eligible for collection');
      }

      return transaction.codCollectionEvent.create({
        data: {
          orderId: order.id,
          paymentId: payment.id,
          adminId: requester.userId,
          action: 'COD_COLLECTED',
          collectedAt,
        },
        select: {
          id: true,
          orderId: true,
          paymentId: true,
          adminId: true,
          action: true,
          collectedAt: true,
          payment: {
            select: {
              id: true,
              provider: true,
              amount: true,
              currency: true,
              status: true,
              method: true,
              paidAt: true,
            },
          },
        },
      });
    });

    const { payment } = collection;
    return {
      orderId: collection.orderId,
      paymentStatus: 'PAID',
      paymentMethod: 'cod',
      paymentId: collection.paymentId,
      paidAt: collection.collectedAt,
      action: collection.action,
      collectedAt: collection.collectedAt,
      collectedByAdminId: collection.adminId,
      payment: {
        id: payment.id,
        provider: payment.provider,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        paidAt: payment.paidAt,
      },
    };
  }

  // src/order/order.service.ts

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const existingOrder = await this.findOne(id);

    const fulfillmentStatuses = [
      'ACCEPTED',
      'SHIPPED',
      'DELIVERED',
      'COMPLETED',
    ];
    if (
      updateOrderDto.status &&
      fulfillmentStatuses.includes(updateOrderDto.status) &&
      (existingOrder.paymentMethod ?? '').toLowerCase() === 'online' &&
      existingOrder.paymentStatus !== 'PAID'
    ) {
      throw new ConflictException(
        'Online order must be paid before fulfillment can proceed',
      );
    }

    const data: Prisma.OrderUpdateInput = { ...updateOrderDto };
    delete data.paymentMethod;

    // If status is being changed to CANCELLED, require cancelRemarks
    if (updateOrderDto.status === 'CANCELLED') {
      if (!updateOrderDto.cancelRemarks) {
        throw new BadRequestException(
          'Cancellation remarks are required when cancelling an order',
        );
      }
      data.cancelRemarks = updateOrderDto.cancelRemarks;
      data.checkoutFingerprint = null;
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
    const statuses = [
      'PLACED',
      'ACCEPTED',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ];

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
    const totalSales = await this.prisma.order.count({
      where: PAID_ORDER_WHERE,
    });

    const uniqueCustomersData = await this.prisma.order.groupBy({
      by: ['userId'],
      where: PAID_ORDER_WHERE,
    });

    const totalQuantityData = await this.prisma.orderItem.aggregate({
      _sum: { quantity: true },
      where: {
        order: { is: PAID_ORDER_WHERE },
      },
    });

    const totalValueData = await this.prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: PAID_ORDER_WHERE,
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
          include: { product: true },
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
            paymentStatus: true,
            isActive: true,
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

    const result = users.map((user) => {
      const orders = user.orders || [];

      // Keep fulfillment counts separate from lifetime financial totals.
      const successfulOrders = orders.filter((order) =>
        ['ACCEPTED', 'SHIPPED', 'DELIVERED'].includes(order.status),
      );
      const paidOrders = orders.filter(
        (order) =>
          order.paymentStatus === 'PAID' &&
          order.status !== 'CANCELLED' &&
          order.isActive,
      );

      const hasOrdered = successfulOrders.length > 0;
      const hasCancelled = orders.some((o) => o.status === 'CANCELLED');
      const hasAbandoned = orders.some((o) => o.status === 'ABANDONED');

      const totalSpent = paidOrders.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0,
      );

      const totalQuantity = paidOrders
        .flatMap((o) => o.orderItem || [])
        .reduce((sum, item) => sum + (item.quantity || 0), 0);

      const lastOrderAt =
        successfulOrders.length > 0
          ? successfulOrders.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )[0].createdAt
          : null;

      return {
        id: user.id,
        fullName: user.name,
        email: user.email || '',
        phone: user.mobilenumber || '',
        city: user.city || '',
        joinDate: user.createdAt,
        lastOrderAt,
        ordersCount: successfulOrders.length,
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
