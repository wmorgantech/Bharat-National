import 'reflect-metadata';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  THROTTLER_LIMIT,
  THROTTLER_TTL,
} from '@nestjs/throttler/dist/throttler.constants';
import { PaymentController } from './payment.controller';
import {
  THROTTLE_LONG,
  THROTTLE_SHORT,
} from '../common/throttle.config';
import { PaymentService } from './payment.service';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';

const user = { userId: 7, role: 'USER', type: 'USER' as const };
const verificationSecret = 'test_secret';

function signature(orderId: string, paymentId: string): string {
  return require('crypto')
    .createHmac('sha256', verificationSecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

function order(overrides: Record<string, unknown> = {}) {
  return {
    id: 123,
    userId: 7,
    status: 'PLACED',
    paymentMethod: 'online',
    paymentStatus: 'UNPAID',
    totalAmount: 999,
    orderItem: [{ quantity: 1, unitPrice: 999 }],
    payments: [],
    ...overrides,
  };
}

function setup(currentOrder = order()) {
  const transaction = {
    $queryRaw: jest.fn().mockResolvedValue(
      currentOrder ? [{ id: currentOrder.id }] : [],
    ),
    order: {
      findUnique: jest.fn().mockResolvedValue(
        currentOrder
          ? {
              ...currentOrder,
              payments: currentOrder.payments.filter((payment) =>
                ['CREATED', 'PENDING'].includes(payment.status),
              ),
            }
          : null,
      ),
    },
    payment: { create: jest.fn().mockResolvedValue({
      razorpayOrderId: 'order_razorpay_123',
      amount: 99900,
      currency: 'INR',
      status: 'CREATED',
    }) },
  };
  const prisma = {
    $transaction: jest.fn((callback: (tx: typeof transaction) => unknown) =>
      callback(transaction),
    ),
  };
  const razorpay = {
    createOrder: jest.fn().mockResolvedValue({ id: 'order_razorpay_123' }),
    getKeyId: jest.fn().mockReturnValue('rzp_test_public'),
  };

  return {
    service: new PaymentService(prisma as never, razorpay as never),
    controller: new PaymentController({
      createOrder: jest.fn(),
    } as never),
    transaction,
    prisma,
    razorpay,
  };
}

describe('PaymentService', () => {
  it('creates a Razorpay order and CREATED payment using rupees converted to paise', async () => {
    const { service, transaction, razorpay } = setup();

    await expect(service.createOrder({ orderId: 123 }, user)).resolves.toEqual({
      razorpayOrderId: 'order_razorpay_123',
      amount: 99900,
      currency: 'INR',
      keyId: 'rzp_test_public',
    });

    expect(razorpay.createOrder).toHaveBeenCalledWith({
      amount: 99900,
      currency: 'INR',
      receipt: expect.stringMatching(/^order_123_[a-f0-9]{16}$/),
    });
    expect(transaction.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: 123,
        provider: 'RAZORPAY',
        razorpayOrderId: 'order_razorpay_123',
        amount: 99900,
        currency: 'INR',
        status: 'CREATED',
      }),
    });
  });

  it('ignores a client-provided amount', async () => {
    const { service, razorpay } = setup(order({ totalAmount: 500 }));

    await service.createOrder(
      { orderId: 123, amount: 1 } as CreatePaymentOrderDto & { amount: number },
      user,
    );

    expect(razorpay.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 50000 }),
    );
  });

  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER])(
    'rejects invalid total amount %s',
    async (totalAmount) => {
      const { service } = setup(order({ totalAmount }));
      await expect(service.createOrder({ orderId: 123 }, user)).rejects.toThrow(
        'Order amount is invalid',
      );
    },
  );

  it('does not reveal another user order', async () => {
    const { service, transaction } = setup();
    transaction.$queryRaw.mockResolvedValue([]);

    await expect(service.createOrder({ orderId: 123 }, user)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects cancelled and already-paid orders', async () => {
    await expect(
      setup(order({ status: 'CANCELLED' })).service.createOrder({ orderId: 123 }, user),
    ).rejects.toThrow('Order is not eligible for payment');
    await expect(
      setup(order({ paymentStatus: 'PAID' })).service.createOrder({ orderId: 123 }, user),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects invalid or missing orders and non-online payment methods', async () => {
    const missing = setup(null as never);
    missing.transaction.$queryRaw.mockResolvedValue([]);
    await expect(missing.service.createOrder({ orderId: 123 }, user)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(
      setup(order({ paymentMethod: 'cod' })).service.createOrder({ orderId: 123 }, user),
    ).rejects.toThrow('Order is not eligible for online payment');
  });

  it('reuses an active attempt without creating another Razorpay order', async () => {
    const active = {
      razorpayOrderId: 'order_existing',
      amount: 99900,
      currency: 'INR',
      status: 'CREATED',
    };
    const { service, razorpay, transaction } = setup(order({ payments: [active] }));
    transaction.payment.create.mockClear();

    await expect(service.createOrder({ orderId: 123 }, user)).resolves.toMatchObject({
      razorpayOrderId: 'order_existing',
      amount: 99900,
    });
    expect(razorpay.createOrder).not.toHaveBeenCalled();
    expect(transaction.payment.create).not.toHaveBeenCalled();
  });

  it('creates a new attempt after a failed previous payment', async () => {
    const { service, transaction, razorpay } = setup(order({
      payments: [{ razorpayOrderId: 'order_failed', status: 'FAILED' }],
    }));

    await service.createOrder({ orderId: 123 }, user);

    expect(razorpay.createOrder).toHaveBeenCalled();
    expect(transaction.payment.create).toHaveBeenCalled();
  });

  it('does not create a payment record when Razorpay fails', async () => {
    const { service, transaction, razorpay } = setup();
    razorpay.createOrder.mockRejectedValue(new Error('provider unavailable'));

    await expect(service.createOrder({ orderId: 123 }, user)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
    expect(transaction.payment.create).not.toHaveBeenCalled();
  });

  it('rejects admin identities at the service boundary', async () => {
    const { service } = setup();
    await expect(
      service.createOrder({ orderId: 123 }, { ...user, type: 'ADMIN' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe('PaymentController', () => {
  it('applies the payment create-order throttle', () => {
    const handler = PaymentController.prototype.createOrder;

    expect(Reflect.getMetadata(`${THROTTLER_LIMIT}${THROTTLE_SHORT}`, handler)).toBe(10);
    expect(Reflect.getMetadata(`${THROTTLER_TTL}${THROTTLE_SHORT}`, handler)).toBe(60_000);
    expect(Reflect.getMetadata(`${THROTTLER_LIMIT}${THROTTLE_LONG}`, handler)).toBe(30);
  });

  it('applies the payment verification throttle', () => {
    const handler = PaymentController.prototype.verify;

    expect(Reflect.getMetadata(`${THROTTLER_LIMIT}${THROTTLE_SHORT}`, handler)).toBe(20);
    expect(Reflect.getMetadata(`${THROTTLER_LIMIT}${THROTTLE_LONG}`, handler)).toBe(60);
  });

  it('rejects missing authentication before calling the service', async () => {
    const paymentService = { createOrder: jest.fn() };
    const controller = new PaymentController(paymentService as never);

    expect(() => controller.createOrder({ orderId: 123 }, {})).toThrow(
      'Authentication required',
    );
    expect(paymentService.createOrder).not.toHaveBeenCalled();
  });

  it('allows only USER identities', () => {
    const paymentService = { createOrder: jest.fn() };
    const controller = new PaymentController(paymentService as never);

    expect(() =>
      controller.createOrder({ orderId: 123 }, { user: { type: 'ADMIN' } }),
    ).toThrow('User access required');
  });
});

describe('PaymentService.verifyPayment', () => {
  const dto = {
    razorpayOrderId: 'order_123',
    razorpayPaymentId: 'pay_123',
    razorpaySignature: signature('order_123', 'pay_123'),
  };

  function verificationSetup(paymentOverrides: Record<string, unknown> = {}) {
    const payment = {
      id: 1,
      orderId: 123,
      provider: 'RAZORPAY',
      razorpayOrderId: 'order_123',
      razorpayPaymentId: null,
      amount: 99900,
      currency: 'INR',
      status: 'CREATED',
      order: {
        id: 123,
        userId: 7,
        totalAmount: 999,
        status: 'PLACED',
        paymentStatus: 'UNPAID',
      },
      ...paymentOverrides,
    };
    const transaction = {
      payment: {
        findUnique: jest.fn().mockResolvedValue(payment),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      order: { update: jest.fn().mockResolvedValue({}) },
    };
    const prisma = {
      $transaction: jest.fn((callback: (tx: typeof transaction) => unknown) =>
        callback(transaction),
      ),
    };
    const razorpay = {
      createOrder: jest.fn(),
      getKeyId: jest.fn(),
    };

    process.env.RAZORPAY_KEY_SECRET = verificationSecret;
    return {
      service: new PaymentService(prisma as never, razorpay as never),
      transaction,
      prisma,
    };
  }

  afterAll(() => {
    delete process.env.RAZORPAY_KEY_SECRET;
  });

  it('verifies HMAC and marks payment and order paid atomically', async () => {
    const { service, transaction } = verificationSetup();

    await expect(service.verifyPayment(dto, user)).resolves.toEqual({
      success: true,
      paymentId: 'pay_123',
      orderId: 123,
      paymentStatus: 'PAID',
    });
    expect(transaction.payment.updateMany).toHaveBeenCalledWith({
      where: { id: 1, status: { in: ['CREATED', 'PENDING'] } },
      data: expect.objectContaining({
        razorpayPaymentId: 'pay_123',
        razorpaySignature: dto.razorpaySignature,
        status: 'SUCCESS',
        paidAt: expect.any(Date),
      }),
    });
    expect(transaction.order.update).toHaveBeenCalledWith({
      where: { id: 123 },
      data: { paymentStatus: 'PAID', paidAt: expect.any(Date) },
    });
  });

  it('rejects an invalid HMAC before querying the database', async () => {
    const { service, prisma } = verificationSetup();

    await expect(
      service.verifyPayment({ ...dto, razorpaySignature: 'invalid' }, user),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('does not reveal a payment belonging to another user', async () => {
    const { service, transaction } = verificationSetup({
      order: { id: 123, userId: 99, totalAmount: 999 },
    });

    await expect(service.verifyPayment(dto, user)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(transaction.payment.updateMany).not.toHaveBeenCalled();
  });

  it('rejects a payment whose amount differs from the order amount', async () => {
    const { service } = verificationSetup({ amount: 100 });

    await expect(service.verifyPayment(dto, user)).rejects.toThrow(
      'Payment amount is invalid',
    );
  });

  it('is idempotent for the same already-successful payment', async () => {
    const { service, transaction } = verificationSetup({
      status: 'SUCCESS',
      razorpayPaymentId: 'pay_123',
    });

    await expect(service.verifyPayment(dto, user)).resolves.toMatchObject({
      success: true,
      paymentStatus: 'PAID',
    });
    expect(transaction.payment.updateMany).not.toHaveBeenCalled();
    expect(transaction.order.update).not.toHaveBeenCalled();
  });

  it('rejects a different payment id for an already-successful attempt', async () => {
    const { service } = verificationSetup({
      status: 'SUCCESS',
      razorpayPaymentId: 'pay_other',
    });
    const differentPayment = {
      ...dto,
      razorpayPaymentId: 'pay_123',
      razorpaySignature: signature('order_123', 'pay_123'),
    };

    await expect(service.verifyPayment(differentPayment, user)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('rejects failed or abandoned attempts for verification', async () => {
    const { service } = verificationSetup({ status: 'FAILED' });

    await expect(service.verifyPayment(dto, user)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});