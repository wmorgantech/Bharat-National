import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { OrderController } from './order.controller';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItemInputDto } from './dto/order-item-input.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';
import { PAID_ORDER_WHERE } from '../common/paid-order-metrics';
import { RolesGuard } from '../auth/roles.guard';

jest.mock(
  'src/auth/roles.decorator',
  () => ({
    ADMIN_ROLE: 'ADMIN',
    ADMIN_ROLES: ['ADMIN'],
    ROLES_KEY: 'roles',
    Roles: () => () => undefined,
  }),
  { virtual: true },
);

function setup(order: Record<string, unknown>) {
  const prisma = {
    order: {
      findUnique: jest.fn().mockResolvedValue(order),
      update: jest.fn().mockResolvedValue(order),
    },
  };
  const mail = { sendOrderPlacedToUser: jest.fn() };
  return { service: new OrderService(prisma as never, mail as never), prisma };
}

describe('OrderService.update fulfillment payment guard', () => {
  it.each(['ACCEPTED', 'SHIPPED', 'DELIVERED', 'COMPLETED'])(
    'rejects %s for an unpaid online order',
    async (status) => {
      const { service, prisma } = setup({
        id: 10,
        paymentMethod: 'online',
        paymentStatus: 'UNPAID',
      });

      await expect(service.update(10, { status })).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.order.update).not.toHaveBeenCalled();
    },
  );

  it('allows fulfillment after payment is confirmed', async () => {
    const { service, prisma } = setup({
      id: 10,
      paymentMethod: 'online',
      paymentStatus: 'PAID',
    });

    await service.update(10, { status: 'SHIPPED' });

    expect(prisma.order.update).toHaveBeenCalled();
  });
});

describe('OrderService.update payment method immutability', () => {
  it.each([
    ['online', 'cod'],
    ['cod', 'online'],
  ])(
    'does not allow %s to be changed to %s',
    async (existingMethod, requestedMethod) => {
      const { service, prisma } = setup({
        id: 10,
        paymentMethod: existingMethod,
        paymentStatus: 'UNPAID',
        status: 'PLACED',
      });

      await service.update(10, {
        paymentMethod: requestedMethod,
      } as never);

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: {},
        include: { orderItem: { include: { product: true } } },
      });
    },
  );

  it('preserves valid status and cancellation remark updates', async () => {
    const { service, prisma } = setup({
      id: 10,
      paymentMethod: 'online',
      paymentStatus: 'PAID',
      status: 'PLACED',
    });

    await service.update(10, {
      status: 'CANCELLED',
      cancelRemarks: 'Customer requested cancellation',
    });

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: {
        status: 'CANCELLED',
        cancelRemarks: 'Customer requested cancellation',
        checkoutFingerprint: null,
      },
      include: { orderItem: { include: { product: true } } },
    });
  });

  it('omits paymentMethod from UpdateOrderDto while retaining allowed status fields', () => {
    const dto = plainToInstance(UpdateOrderDto, {
      paymentMethod: 'cod',
      status: 'SHIPPED',
    });

    expect(validateSync(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.status).toBe('SHIPPED');
    expect('paymentMethod' in dto).toBe(false);
  });
});

describe('Order update authorization', () => {
  it('continues blocking non-admin identities from Admin order updates', () => {
    const guard = new RolesGuard({
      getAllAndOverride: jest.fn().mockReturnValue(['ADMIN']),
    } as never);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { type: 'USER', role: 'USER' },
        }),
      }),
    };

    expect(() => guard.canActivate(context as never)).toThrow(
      ForbiddenException,
    );
  });
});

describe('OrderService admin order payment trace', () => {
  const admin = { userId: 1, role: 'ADMIN', type: 'ADMIN' as const };

  it.each([
    {
      name: 'paid online order finalized from a checkout intent',
      order: {
        id: 71,
        userId: 7,
        paymentMethod: 'online',
        paymentStatus: 'PAID',
        status: 'PLACED',
        isActive: true,
        createdAt: new Date('2026-10-07T10:00:00Z'),
        checkoutIntent: { id: 31 },
        payments: [
          {
            id: 41,
            provider: 'razorpay',
            razorpayOrderId: 'order_safe',
            razorpayPaymentId: 'pay_safe',
            status: 'SUCCESS',
            method: 'upi',
            paidAt: new Date('2026-10-07T10:01:00Z'),
            createdAt: new Date('2026-10-07T10:00:30Z'),
          },
        ],
      },
      expected: {
        paymentMethod: 'online',
        paymentStatus: 'PAID',
        status: 'PLACED',
        isActive: true,
        checkoutIntent: { id: 31 },
        payments: [{ id: 41, razorpayPaymentId: 'pay_safe' }],
      },
    },
    {
      name: 'unpaid COD order without a related payment',
      order: {
        id: 72,
        userId: 7,
        paymentMethod: 'cod',
        paymentStatus: 'UNPAID',
        status: 'PLACED',
        isActive: true,
        createdAt: new Date('2026-10-07T10:00:00Z'),
        checkoutIntent: null,
        payments: [],
      },
      expected: {
        paymentMethod: 'cod',
        paymentStatus: 'UNPAID',
        status: 'PLACED',
        isActive: true,
        checkoutIntent: null,
        payments: [],
      },
    },
    {
      name: 'paid COD order when present in the existing data model',
      order: {
        id: 73,
        userId: 7,
        paymentMethod: 'cod',
        paymentStatus: 'PAID',
        status: 'DELIVERED',
        isActive: true,
        createdAt: new Date('2026-10-07T10:00:00Z'),
        checkoutIntent: null,
        payments: [],
      },
      expected: {
        paymentMethod: 'cod',
        paymentStatus: 'PAID',
        status: 'DELIVERED',
        isActive: true,
        checkoutIntent: null,
        payments: [],
      },
    },
    {
      name: 'cancelled inactive order',
      order: {
        id: 74,
        userId: 7,
        paymentMethod: 'online',
        paymentStatus: 'PAID',
        status: 'CANCELLED',
        isActive: false,
        createdAt: new Date('2026-10-07T10:00:00Z'),
        checkoutIntent: { id: 34 },
        payments: [],
      },
      expected: {
        paymentMethod: 'online',
        paymentStatus: 'PAID',
        status: 'CANCELLED',
        isActive: false,
        checkoutIntent: { id: 34 },
        payments: [],
      },
    },
    {
      name: 'historical order with an unknown payment method',
      order: {
        id: 75,
        userId: 7,
        paymentMethod: null,
        paymentStatus: 'UNPAID',
        status: 'PLACED',
        isActive: true,
        createdAt: new Date('2026-10-07T10:00:00Z'),
        checkoutIntent: null,
        payments: [],
      },
      expected: {
        paymentMethod: null,
        paymentStatus: 'UNPAID',
        status: 'PLACED',
        isActive: true,
        checkoutIntent: null,
        payments: [],
      },
    },
  ])('returns traceable safe fields for $name', async ({ order, expected }) => {
    const { service, prisma } = setup(order);

    const result = await service.findOneForRequester(order.id, admin);

    expect(result).toMatchObject({
      ...expected,
      createdAt: order.createdAt,
    });
    expect(prisma.order.findUnique).toHaveBeenCalledWith({
      where: { id: order.id },
      select: {
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
        user: {
          select: {
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
          },
        },
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
        checkoutIntent: { select: { id: true } },
      },
    });
  });

  it('does not expose admin-only payment trace fields to an order owner', async () => {
    const { service, prisma } = setup({
      id: 76,
      userId: 7,
      paymentMethod: 'online',
      paymentStatus: 'PAID',
      status: 'PLACED',
      isActive: true,
      createdAt: new Date('2026-10-07T10:00:00Z'),
    });

    const result = await service.findOneForRequester(76, {
      userId: 7,
      role: 'USER',
      type: 'USER',
    });

    expect(result).not.toHaveProperty('payments');
    expect(result).not.toHaveProperty('checkoutIntent');
    expect(prisma.order.findUnique).toHaveBeenCalledWith({
      where: { id: 76 },
      select: {
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
        user: {
          select: {
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
          },
        },
      },
    });
  });
});

describe('OrderService.create COD compatibility', () => {
  it('continues creating and confirming COD orders immediately', async () => {
    const createdOrder = {
      id: 71,
      userId: 7,
      fullName: 'Customer',
      email: 'customer@example.test',
      phone: '9876543210',
      address: '1 Main Street',
      place: 'Coimbatore',
      pincode: '641001',
      state: 'Tamil Nadu',
      paymentMethod: 'cod',
      status: 'PLACED',
      paymentStatus: 'UNPAID',
      totalAmount: 200,
      createdAt: new Date(),
      orderItem: [
        {
          productId: 3,
          productName: 'Product',
          unitPrice: 100,
          quantity: 2,
        },
      ],
    };
    let createdInput: {
      paymentMethod: string;
      status: string;
      totalAmount: number;
    } | null = null;
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ id: 7 }) },
      product: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 3, name: 'Product', price: 100 }]),
      },
      order: {
        create: jest.fn().mockImplementation(
          ({
            data,
          }: {
            data: {
              paymentMethod: string;
              status: string;
              totalAmount: number;
            };
          }) => {
            createdInput = data;
            return Promise.resolve(createdOrder);
          },
        ),
      },
    };
    const mail = {
      sendOrderPlacedToUser: jest.fn().mockResolvedValue(undefined),
    };
    const service = new OrderService(prisma as never, mail as never);

    const response = await service.create(
      {
        fullName: 'Customer',
        email: 'customer@example.test',
        phone: '9876543210',
        address: '1 Main Street',
        place: 'Coimbatore',
        pincode: '641001',
        state: 'Tamil Nadu',
        paymentMethod: 'cod',
        items: [{ productId: 3, quantity: 2 }],
      } as never,
      { userId: 7, role: 'USER', type: 'USER' },
    );

    expect(response).toMatchObject({
      message: 'Order created successfully',
      order: { id: 71, paymentStatus: 'UNPAID', paymentMethod: 'cod' },
    });
    expect(prisma.order.create).toHaveBeenCalledTimes(1);
    expect(createdInput?.paymentMethod).toBe('cod');
    expect(createdInput?.status).toBe('PLACED');
    expect(createdInput?.totalAmount).toBe(200);
    expect(mail.sendOrderPlacedToUser).toHaveBeenCalledTimes(1);
  });
});

describe('CreateOrderDto payment method validation', () => {
  const errorsForPaymentMethod = (paymentMethod?: string) => {
    const dto = plainToInstance(CreateOrderDto, {
      paymentMethod,
    });
    return validateSync(dto).filter(
      (error) => error.property === 'paymentMethod',
    );
  };

  it.each(['cod', 'online'])('accepts the exact "%s" value', (method) => {
    expect(errorsForPaymentMethod(method)).toHaveLength(0);
  });

  it.each([undefined, 'COD', 'ONLINE', 'cash', 'online ', ''])(
    'rejects missing or noncanonical payment method %s',
    (method) => {
      expect(errorsForPaymentMethod(method)).not.toHaveLength(0);
    },
  );
});

describe('OrderService.create payment method guard', () => {
  const user = { userId: 7, role: 'USER', type: 'USER' as const };

  function serviceWithSpies() {
    const prisma = {
      user: { findUnique: jest.fn() },
      product: { findMany: jest.fn() },
      order: { create: jest.fn() },
      $transaction: jest.fn(),
    };
    const mail = { sendOrderPlacedToUser: jest.fn() };
    return {
      service: new OrderService(prisma as never, mail as never),
      prisma,
    };
  }

  it('rejects online without creating an Order, including retries with the same checkout key', async () => {
    const { service, prisma } = serviceWithSpies();
    const dto = {
      paymentMethod: 'online',
      checkoutKey: 'same-key',
      items: [{ productId: 3, quantity: 2 }],
    } as never;

    await expect(service.create(dto, user)).rejects.toThrow(
      'Online orders must be created after payment verification',
    );
    await expect(service.create(dto, user)).rejects.toThrow(
      'Online orders must be created after payment verification',
    );
    expect(prisma.order.create).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it.each([undefined, 'COD', 'ONLINE', 'cash', 'online '])(
    'rejects invalid payment method %s at the service boundary',
    async (paymentMethod) => {
      const { service, prisma } = serviceWithSpies();
      await expect(
        service.create(
          { paymentMethod, items: [{ productId: 3, quantity: 1 }] } as never,
          user,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.order.create).not.toHaveBeenCalled();
    },
  );

  it('rejects COD when a product is missing and creates no Order', async () => {
    const { service, prisma } = serviceWithSpies();
    prisma.user.findUnique.mockResolvedValue({ id: 7 });
    prisma.product.findMany.mockResolvedValue([]);

    await expect(
      service.create(
        {
          paymentMethod: 'cod',
          items: [{ productId: 3, quantity: 1 }],
        } as never,
        user,
      ),
    ).rejects.toThrow('One or more products not found');
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it.each([0, -1, 1.5])(
    'continues rejecting invalid item quantity %s through DTO validation',
    (quantity) => {
      const item = plainToInstance(OrderItemInputDto, {
        productId: 3,
        quantity,
      });
      expect(validateSync(item)).not.toHaveLength(0);
    },
  );

  it('routes POST /order through OrderService with the authenticated caller', async () => {
    const orderService = { create: jest.fn().mockResolvedValue({ id: 71 }) };
    const controller = new OrderController(orderService as never);
    const dto = {
      paymentMethod: 'cod',
      items: [{ productId: 3, quantity: 1 }],
    } as never;
    const requester = { userId: 7, role: 'USER', type: 'USER' as const };

    await expect(controller.create(dto, { user: requester })).resolves.toEqual({
      id: 71,
    });
    expect(orderService.create).toHaveBeenCalledWith(dto, requester);
  });
});

describe('OrderService paid sales summary', () => {
  it('uses the shared paid-order rule across order, customer, and item totals', async () => {
    const prisma = {
      order: {
        count: jest.fn().mockResolvedValue(2),
        groupBy: jest.fn().mockResolvedValue([{ userId: 7 }, { userId: 9 }]),
        aggregate: jest.fn().mockResolvedValue({ _sum: { totalAmount: 300 } }),
      },
      orderItem: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 5 } }),
      },
    };
    const service = new OrderService(
      prisma as never,
      { sendOrderPlacedToUser: jest.fn() } as never,
    );

    const stats = await service.getFilteredStats();

    expect(prisma.order.count).toHaveBeenCalledWith({
      where: PAID_ORDER_WHERE,
    });
    expect(prisma.order.groupBy).toHaveBeenCalledWith({
      by: ['userId'],
      where: PAID_ORDER_WHERE,
    });
    expect(prisma.orderItem.aggregate).toHaveBeenCalledWith({
      _sum: { quantity: true },
      where: { order: { is: PAID_ORDER_WHERE } },
    });
    expect(prisma.order.aggregate).toHaveBeenCalledWith({
      _sum: { totalAmount: true },
      where: PAID_ORDER_WHERE,
    });
    expect(stats).toEqual({
      totalSales: 2,
      uniqueCustomers: 2,
      totalQuantity: 5,
      totalValue: 300,
    });
  });

  it('uses only paid, active, non-cancelled orders for customer lifetime totals', async () => {
    const prisma = {
      user: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 7,
            name: 'Customer',
            email: 'customer@example.test',
            mobilenumber: '9876543210',
            city: 'Coimbatore',
            createdAt: new Date('2026-01-01T00:00:00Z'),
            orders: [
              {
                status: 'PLACED',
                paymentStatus: 'PAID',
                isActive: true,
                totalAmount: 100,
                createdAt: new Date('2026-01-02T00:00:00Z'),
                orderItem: [{ quantity: 2 }],
              },
              {
                status: 'ACCEPTED',
                paymentStatus: 'UNPAID',
                isActive: true,
                totalAmount: 200,
                createdAt: new Date('2026-01-03T00:00:00Z'),
                orderItem: [{ quantity: 4 }],
              },
              {
                status: 'CANCELLED',
                paymentStatus: 'PAID',
                isActive: true,
                totalAmount: 300,
                createdAt: new Date('2026-01-04T00:00:00Z'),
                orderItem: [{ quantity: 8 }],
              },
              {
                status: 'DELIVERED',
                paymentStatus: 'PAID',
                isActive: false,
                totalAmount: 400,
                createdAt: new Date('2026-01-05T00:00:00Z'),
                orderItem: [{ quantity: 16 }],
              },
            ],
          },
        ]),
      },
    };
    const service = new OrderService(
      prisma as never,
      { sendOrderPlacedToUser: jest.fn() } as never,
    );

    const [customer] = await service.getAllUsersWithOrderStats();

    expect(customer).toMatchObject({
      ordersCount: 2,
      totalSpent: 100,
      totalQuantity: 2,
      hasOrdered: true,
      lastOrderAt: new Date('2026-01-05T00:00:00Z'),
    });
    expect(prisma.user.findMany).toHaveBeenCalledWith({
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
            orderItem: { select: { quantity: true } },
          },
        },
      },
    });
  });
});
