import { ConflictException } from '@nestjs/common';
import { OrderService } from './order.service';

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

function setupOnlineCheckout() {
  type Item = {
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
  };
  type SavedOrder = {
    id: number;
    userId: number;
    checkoutKey: string;
    checkoutFingerprint: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    orderItem: Item[];
  };
  type FindOrderArgs = {
    where: {
      userId_checkoutKey?: { userId: number; checkoutKey: string };
      userId_checkoutFingerprint?: {
        userId: number;
        checkoutFingerprint: string;
      };
    };
  };
  type CreateOrderArgs = {
    data: {
      userId: number;
      checkoutKey: string;
      checkoutFingerprint: string;
      status: string;
      totalAmount: number;
      orderItem: { create: Item[] };
    } & Record<string, unknown>;
  };
  let savedOrder: SavedOrder | null = null;
  const transaction = {
    $queryRaw: jest.fn().mockResolvedValue([{ id: 7 }]),
    product: {
      findMany: jest.fn((args: { where: { id: { in: number[] } } }) =>
        args.where.id.in.map((id) => ({
          id,
          name: 'Business Laptop',
          price: 50000,
        })),
      ),
    },
    order: {
      findUnique: jest.fn((args: FindOrderArgs) => {
        const { where } = args;
        if (
          savedOrder &&
          where.userId_checkoutKey?.userId === savedOrder.userId &&
          where.userId_checkoutKey?.checkoutKey === savedOrder.checkoutKey
        ) {
          return savedOrder;
        }
        if (
          savedOrder &&
          where.userId_checkoutFingerprint?.userId === savedOrder.userId &&
          where.userId_checkoutFingerprint?.checkoutFingerprint ===
            savedOrder.checkoutFingerprint
        ) {
          return savedOrder;
        }
        return null;
      }),
      create: jest.fn((args: CreateOrderArgs) => {
        const { data } = args;
        savedOrder = {
          id: 42,
          ...data,
          orderItem: data.orderItem.create,
          paymentStatus: 'UNPAID',
        };
        return savedOrder;
      }),
      update: jest.fn((args: { data: Partial<SavedOrder> }) => {
        savedOrder = { ...savedOrder!, ...args.data };
        return savedOrder;
      }),
    },
  };
  const prisma = {
    $transaction: jest.fn((callback: (tx: typeof transaction) => unknown) =>
      callback(transaction),
    ),
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const mail = { sendOrderPlacedToUser: jest.fn() };
  return {
    service: new OrderService(prisma as never, mail as never),
    transaction,
  };
}

function onlineCheckout(checkoutKey: string, productId = 3) {
  return {
    fullName: 'Customer',
    email: 'customer@example.test',
    phone: '9876543210',
    address: '1 Main Street',
    place: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641001',
    paymentMethod: 'online',
    checkoutKey,
    items: [{ productId, quantity: 2 }],
  };
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

describe('OrderService.create online checkout idempotency', () => {
  const user = { userId: 7, role: 'USER', type: 'USER' as const };

  it('reuses the same pending order across retries and separate tab keys', async () => {
    const { service, transaction } = setupOnlineCheckout();

    const first = await service.create(onlineCheckout('checkout-key-a'), user);
    const retry = await service.create(onlineCheckout('checkout-key-b'), user);

    expect(first.order.id).toBe(42);
    expect(retry.order.id).toBe(42);
    expect(first.order.totalAmount).toBe(100000);
    expect(transaction.order.create).toHaveBeenCalledTimes(1);
    expect(transaction.order.update).toHaveBeenCalledTimes(1);
  });

  it('rejects reuse of an idempotency key for a different cart', async () => {
    const { service } = setupOnlineCheckout();

    await service.create(onlineCheckout('checkout-key-a'), user);

    await expect(
      service.create(onlineCheckout('checkout-key-a', 9), user),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
