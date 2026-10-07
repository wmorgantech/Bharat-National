import 'reflect-metadata';
import { createHmac } from 'crypto';
import { IS_PUBLIC_KEY } from '../auth/public.decorator';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

const user = { userId: 7, role: 'USER', type: 'USER' as const };
const verificationSecret = 'test_secret';
const intentItems = [
  {
    id: 31,
    intentId: 55,
    productId: 3,
    productName: 'Snapshot product',
    unitPrice: 999,
    quantity: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

type PaymentAttemptRecord = {
  id: number;
  status: string;
  updatedAt: Date;
  notes?: unknown;
  [key: string]: unknown;
};

function intent(overrides: Record<string, unknown> = {}) {
  return {
    id: 55,
    userId: 7,
    fullName: 'Customer',
    email: 'customer@example.test',
    phone: '9876543210',
    address: '1 Main Street',
    place: 'Springfield',
    state: 'CA',
    pincode: '12345',
    checkoutKey: 'checkout-key',
    checkoutFingerprint: 'fingerprint',
    totalAmount: 999,
    status: 'PENDING',
    finalOrderId: null,
    items: intentItems,
    payments: [] as PaymentAttemptRecord[],
    finalOrder: null,
    ...overrides,
  };
}

function order(overrides: Record<string, unknown> = {}) {
  return {
    id: 123,
    userId: 7,
    fullName: 'Customer',
    email: 'customer@example.test',
    phone: '9876543210',
    address: '1 Main Street',
    place: 'Springfield',
    state: 'CA',
    pincode: '12345',
    status: 'PLACED',
    isActive: true,
    paymentMethod: 'online',
    paymentStatus: 'UNPAID',
    totalAmount: 999,
    orderItem: intentItems.map(
      ({ productId, productName, unitPrice, quantity }) => ({
        productId,
        productName,
        unitPrice,
        quantity,
      }),
    ),
    ...overrides,
  };
}

function payment(overrides: Record<string, unknown> = {}) {
  const now = new Date();
  return {
    id: 88,
    orderId: null,
    checkoutIntentId: 55,
    provider: 'RAZORPAY',
    razorpayOrderId: 'rz_order_55',
    razorpayPaymentId: null,
    razorpaySignature: null,
    amount: 99900,
    currency: 'INR',
    status: 'CREATED',
    method: null,
    failureReason: null,
    paidAt: null,
    createdAt: now,
    updatedAt: now,
    order: null,
    checkoutIntent: intent(),
    ...overrides,
  };
}

function receiptFromNotes(notes: unknown): string | null {
  if (
    typeof notes !== 'object' ||
    notes === null ||
    Array.isArray(notes) ||
    !('razorpayReceipt' in notes)
  ) {
    return null;
  }
  return typeof notes.razorpayReceipt === 'string'
    ? notes.razorpayReceipt
    : null;
}

type IntentRecord = ReturnType<typeof intent>;
type PaymentRecord = ReturnType<typeof payment>;
type OrderRecord = ReturnType<typeof order>;
type OrderItemSnapshot = (typeof intentItems)[number];
type OrderCreateData = Omit<OrderRecord, 'orderItem'> & {
  orderItem: { create: OrderItemSnapshot[] };
};

function sign(orderId: string, paymentId: string): string {
  return createHmac('sha256', verificationSecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

function verifyRequest(overrides: Record<string, string> = {}) {
  const razorpayOrderId = overrides.razorpayOrderId ?? 'rz_order_55';
  const razorpayPaymentId = overrides.razorpayPaymentId ?? 'rz_payment_55';
  return {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature:
      overrides.razorpaySignature ?? sign(razorpayOrderId, razorpayPaymentId),
  };
}

function setup(
  options: {
    intent?: ReturnType<typeof intent> | null;
    payment?: ReturnType<typeof payment> | null;
    order?: ReturnType<typeof order> | null;
    providerPayment?: Record<string, unknown>;
  } = {},
) {
  let currentIntent: IntentRecord | null =
    options.intent === undefined ? intent() : options.intent;
  let currentOrder: OrderRecord | null = options.order ?? null;
  let currentPayment: PaymentRecord | null = options.payment ?? payment();
  const savedOrder: OrderRecord = currentOrder ?? order({ id: 900 });
  let transactionTail = Promise.resolve();
  const webhookEvents = new Map<
    string,
    { processedAt: Date | null; eventType: string }
  >();

  const applyPaymentUpdate = (data: Partial<PaymentRecord>) => {
    if (currentPayment) {
      currentPayment = {
        ...currentPayment,
        ...data,
        updatedAt: data.updatedAt ?? new Date(),
      };
      if (currentIntent?.payments) {
        currentIntent = {
          ...currentIntent,
          payments: currentIntent.payments.map((current) =>
            current.id === currentPayment?.id
              ? { ...current, ...data, updatedAt: currentPayment.updatedAt }
              : current,
          ),
        };
      }
    }
  };

  const transaction = {
    $queryRaw: jest
      .fn()
      .mockImplementation((): Array<{ id: number }> => [{ id: 55 }]),
    checkoutIntent: {
      findUnique: jest.fn().mockImplementation(() => ({
        ...currentIntent,
        items: currentIntent?.items ?? [],
        payments: currentIntent?.payments ?? [],
        finalOrder: currentIntent?.finalOrder ?? currentOrder,
      })),
      updateMany: jest.fn().mockImplementation(
        ({
          data,
        }: {
          data: {
            status?: string;
            finalOrderId?: number | null;
            checkoutFingerprint?: string | null;
          };
        }) => {
          if (currentIntent) {
            currentIntent = {
              ...currentIntent,
              ...data,
              finalOrder: currentOrder,
            };
          }
          return { count: 1 };
        },
      ),
    },
    payment: {
      findUnique: jest.fn().mockImplementation(() =>
        currentPayment
          ? {
              ...currentPayment,
              order: currentOrder,
              checkoutIntent: currentIntent
                ? {
                    ...currentIntent,
                    items: currentIntent.items,
                    finalOrder: currentIntent.finalOrder ?? currentOrder,
                  }
                : null,
            }
          : null,
      ),
      create: jest
        .fn()
        .mockImplementation(({ data }: { data: Partial<PaymentRecord> }) => {
          currentPayment = payment({ id: 88, ...data });
          return currentPayment;
        }),
      updateMany: jest
        .fn()
        .mockImplementation(({ data }: { data: Partial<PaymentRecord> }) => {
          applyPaymentUpdate(data);
          return { count: 1 };
        }),
    },
    order: {
      create: jest
        .fn()
        .mockImplementation(({ data }: { data: OrderCreateData }) => {
          currentOrder = {
            ...savedOrder,
            ...data,
            id: 900,
            orderItem: data.orderItem.create,
          };
          return currentOrder;
        }),
      update: jest
        .fn()
        .mockImplementation(({ data }: { data: Partial<OrderRecord> }) => {
          currentOrder = { ...currentOrder, ...data };
          return currentOrder;
        }),
      updateMany: jest
        .fn()
        .mockImplementation(({ data }: { data: Partial<OrderRecord> }) => {
          if (currentOrder) currentOrder = { ...currentOrder, ...data };
          return { count: 1 };
        }),
    },
    orderConfirmationOutbox: {
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    webhookEvent: {
      createMany: jest
        .fn()
        .mockImplementation(
          ({ data }: { data: { eventId: string; eventType: string } }) => {
            if (webhookEvents.has(data.eventId)) return { count: 0 };
            webhookEvents.set(data.eventId, {
              processedAt: null,
              eventType: data.eventType,
            });
            return { count: 1 };
          },
        ),
      findUnique: jest
        .fn()
        .mockImplementation(
          ({ where }: { where: { provider_eventId: { eventId: string } } }) =>
            webhookEvents.get(where.provider_eventId.eventId) ?? null,
        ),
      update: jest
        .fn()
        .mockImplementation(
          ({
            where,
            data,
          }: {
            where: { provider_eventId: { eventId: string } };
            data: { processedAt: Date };
          }) => {
            const event = webhookEvents.get(where.provider_eventId.eventId);
            if (event) {
              webhookEvents.set(where.provider_eventId.eventId, {
                ...event,
                processedAt: data.processedAt,
              });
            }
            return event;
          },
        ),
    },
  };
  const prisma = {
    $transaction: jest.fn((callback: (tx: typeof transaction) => unknown) => {
      const pending = transactionTail.then(() => callback(transaction));
      transactionTail = pending.then(
        () => undefined,
        () => undefined,
      );
      return pending;
    }),
    payment: {
      updateMany: jest
        .fn()
        .mockImplementation(({ data }: { data: Partial<PaymentRecord> }) => {
          applyPaymentUpdate(data);
          return { count: 1 };
        }),
    },
  };
  const razorpay = {
    createOrder: jest
      .fn<
        Promise<{ id: string }>,
        [{ amount: number; currency: string; receipt: string }]
      >()
      .mockResolvedValue({ id: 'rz_order_55' }),
    findOrdersByReceipt: jest
      .fn<
        Promise<{
          count: number;
          items: Array<{
            id: string;
            receipt?: string;
            amount: number;
            currency: string;
          }>;
        }>,
        [string]
      >()
      .mockResolvedValue({ count: 0, items: [] }),
    fetchPayment: jest
      .fn<Promise<Record<string, unknown>>, [string]>()
      .mockResolvedValue({
        id: 'rz_payment_55',
        order_id: 'rz_order_55',
        status: 'captured',
        amount: 99900,
        currency: 'INR',
      }),
    getKeyId: jest.fn<string, []>().mockReturnValue('rzp_test_public'),
  };
  if (options.providerPayment) {
    razorpay.fetchPayment.mockResolvedValue(options.providerPayment);
  }
  const outbox = { processOrder: jest.fn().mockResolvedValue(undefined) };

  return {
    service: new PaymentService(
      prisma as never,
      razorpay as never,
      outbox as never,
    ),
    transaction,
    prisma,
    razorpay,
    outbox,
    getIntent: () => currentIntent,
    getPayment: () => currentPayment,
    getOrder: () => currentOrder,
  };
}

beforeEach(() => {
  process.env.RAZORPAY_KEY_SECRET = verificationSecret;
  process.env.RAZORPAY_WEBHOOK_SECRET = verificationSecret;
});

afterEach(() => {
  delete process.env.RAZORPAY_KEY_SECRET;
  delete process.env.RAZORPAY_WEBHOOK_SECRET;
});

describe('PaymentService intent-backed checkout', () => {
  it('creates a Razorpay order and reserves a Payment without creating an Order', async () => {
    const context = setup();
    await expect(
      context.service.createOrder({ checkoutIntentId: 55 }, user),
    ).resolves.toEqual({
      razorpayOrderId: 'rz_order_55',
      amount: 99900,
      currency: 'INR',
      keyId: 'rzp_test_public',
    });

    expect(context.transaction.payment.create).toHaveBeenCalledTimes(1);
    const receipt = receiptFromNotes(context.getPayment()?.notes);
    if (!receipt) throw new Error('Expected a persisted provider receipt');
    expect(receipt).toMatch(/^checkout_55_/);
    expect(context.razorpay.createOrder).toHaveBeenCalledWith({
      amount: 99900,
      currency: 'INR',
      receipt,
    });
    expect(context.prisma.payment.updateMany).toHaveBeenCalledTimes(1);
    expect(context.getPayment()).toMatchObject({
      status: 'CREATED',
      razorpayOrderId: 'rz_order_55',
    });
    expect(context.transaction.order.create).not.toHaveBeenCalled();
  });

  it('uses the persisted intent amount and ignores any frontend amount', async () => {
    const context = setup();
    await context.service.createOrder(
      { checkoutIntentId: 55, amount: 1 } as never,
      user,
    );
    expect(context.razorpay.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 99900 }),
    );
  });

  it('rejects another user and non-pending intents', async () => {
    const wrongOwner = setup({ intent: intent({ userId: 99 }) });
    wrongOwner.transaction.$queryRaw.mockResolvedValue([]);
    await expect(
      wrongOwner.service.createOrder({ checkoutIntentId: 55 }, user),
    ).rejects.toBeInstanceOf(NotFoundException);

    await expect(
      setup({ intent: intent({ status: 'COMPLETED' }) }).service.createOrder(
        { checkoutIntentId: 55 },
        user,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects malformed item snapshots and invalid totals', async () => {
    await expect(
      setup({ intent: intent({ items: [] }) }).service.createOrder(
        { checkoutIntentId: 55 },
        user,
      ),
    ).rejects.toThrow('Order items are invalid');
    await expect(
      setup({ intent: intent({ totalAmount: 0 }) }).service.createOrder(
        { checkoutIntentId: 55 },
        user,
      ),
    ).rejects.toThrow('Order amount is invalid');
    const mismatch = setup({
      intent: intent({
        totalAmount: 1000,
        items: [{ ...intentItems[0], unitPrice: 999 }],
      }),
    });
    await expect(
      mismatch.service.createOrder({ checkoutIntentId: 55 }, user),
    ).rejects.toThrow('Checkout intent total is invalid');
    expect(mismatch.razorpay.createOrder).not.toHaveBeenCalled();
  });

  it('reuses an existing active attempt instead of creating another provider order', async () => {
    const context = setup({
      intent: intent({ payments: [payment({ id: 89 })] }),
    });
    await expect(
      context.service.createOrder({ checkoutIntentId: 55 }, user),
    ).resolves.toMatchObject({ razorpayOrderId: 'rz_order_55' });
    expect(context.transaction.payment.create).not.toHaveBeenCalled();
    expect(context.razorpay.createOrder).not.toHaveBeenCalled();
  });

  it('does not recover a fresh CREATING attempt', async () => {
    const creatingAttempt = payment({
      status: 'CREATING',
      razorpayOrderId: null,
      notes: { razorpayReceipt: 'checkout_55_receipt' },
    });
    const context = setup({
      intent: intent({ payments: [creatingAttempt] }),
      payment: creatingAttempt,
    });

    await expect(
      context.service.createOrder({ checkoutIntentId: 55 }, user),
    ).rejects.toThrow('Payment order creation is already in progress');
    expect(context.razorpay.findOrdersByReceipt).not.toHaveBeenCalled();
    expect(context.razorpay.createOrder).not.toHaveBeenCalled();
  });

  it('recovers a stale CREATING attempt by finding the existing provider order', async () => {
    const receipt = 'checkout_55_recovery';
    const staleAttempt = payment({
      status: 'CREATING',
      razorpayOrderId: null,
      updatedAt: new Date(Date.now() - 11 * 60 * 1000),
      notes: { razorpayReceipt: receipt },
    });
    const context = setup({
      intent: intent({ payments: [staleAttempt] }),
      payment: staleAttempt,
    });
    context.razorpay.findOrdersByReceipt.mockResolvedValue({
      count: 1,
      items: [
        {
          id: 'rz_existing_55',
          receipt,
          amount: 99900,
          currency: 'INR',
        },
      ],
    });

    await expect(
      context.service.createOrder({ checkoutIntentId: 55 }, user),
    ).resolves.toMatchObject({ razorpayOrderId: 'rz_existing_55' });
    expect(context.razorpay.findOrdersByReceipt).toHaveBeenCalledWith(receipt);
    expect(context.razorpay.createOrder).not.toHaveBeenCalled();
    expect(context.prisma.payment.updateMany).toHaveBeenCalledTimes(1);
    expect(context.getPayment()).toMatchObject({
      id: staleAttempt.id,
      status: 'CREATED',
      razorpayOrderId: 'rz_existing_55',
    });
  });

  it('serializes concurrent stale recovery and reuses the recovered payment attempt', async () => {
    const staleAttempt = payment({
      status: 'CREATING',
      razorpayOrderId: null,
      updatedAt: new Date(Date.now() - 11 * 60 * 1000),
      notes: { razorpayReceipt: 'checkout_55_race' },
    });
    const context = setup({
      intent: intent({ payments: [staleAttempt] }),
      payment: staleAttempt,
    });
    context.razorpay.findOrdersByReceipt.mockResolvedValue({
      count: 1,
      items: [
        {
          id: 'rz_existing_55',
          receipt: 'checkout_55_race',
          amount: 99900,
          currency: 'INR',
        },
      ],
    });

    const results = await Promise.allSettled([
      context.service.createOrder({ checkoutIntentId: 55 }, user),
      context.service.createOrder({ checkoutIntentId: 55 }, user),
    ]);

    expect(results.filter(({ status }) => status === 'fulfilled')).toHaveLength(
      2,
    );
    expect(
      results.map((result) =>
        result.status === 'fulfilled' ? result.value.razorpayOrderId : null,
      ),
    ).toEqual(['rz_existing_55', 'rz_existing_55']);
    expect(context.razorpay.findOrdersByReceipt).toHaveBeenCalledTimes(1);
    expect(context.razorpay.createOrder).not.toHaveBeenCalled();
    expect(context.transaction.payment.create).not.toHaveBeenCalled();
    expect(context.transaction.order.create).not.toHaveBeenCalled();
  });

  it('keeps CREATING recoverable after provider failure instead of losing its receipt', async () => {
    const context = setup();
    context.razorpay.createOrder.mockRejectedValue(new Error('provider down'));
    await expect(
      context.service.createOrder({ checkoutIntentId: 55 }, user),
    ).rejects.toThrow('Unable to create payment order');
    expect(context.transaction.order.create).not.toHaveBeenCalled();
    const receipt = receiptFromNotes(context.getPayment()?.notes);
    if (!receipt) throw new Error('Expected a persisted provider receipt');
    expect(receipt).toMatch(/^checkout_55_/);
    expect(context.razorpay.createOrder).toHaveBeenCalledWith({
      amount: 99900,
      currency: 'INR',
      receipt,
    });
    expect(context.getPayment()).toMatchObject({ status: 'CREATING' });
    expect(context.prisma.payment.updateMany).not.toHaveBeenCalled();
  });
});

describe('PaymentService payment verification', () => {
  it('creates one paid final Order with the trusted item snapshots and one outbox entry', async () => {
    const context = setup();
    const response = await context.service.verifyPayment(verifyRequest(), user);

    expect(context.transaction.order.create).toHaveBeenCalledTimes(1);
    expect(context.getOrder()).toMatchObject({
      userId: 7,
      paymentMethod: 'online',
      paymentStatus: 'PAID',
      status: 'PLACED',
      totalAmount: 999,
      orderItem: [
        {
          productId: 3,
          productName: 'Snapshot product',
          unitPrice: 999,
          quantity: 1,
        },
      ],
    });
    expect(context.getPayment()).toMatchObject({
      orderId: 900,
      status: 'SUCCESS',
      razorpayPaymentId: 'rz_payment_55',
    });
    expect(context.getIntent()).toMatchObject({
      status: 'COMPLETED',
      finalOrderId: 900,
      checkoutFingerprint: null,
    });
    expect(
      context.transaction.orderConfirmationOutbox.createMany,
    ).toHaveBeenCalledWith({
      data: { orderId: 900 },
      skipDuplicates: true,
    });
    expect(response).toMatchObject({
      success: true,
      orderId: 900,
      paymentStatus: 'PAID',
    });
  });

  it('rejects invalid signatures before making a database query', async () => {
    const context = setup();
    await expect(
      context.service.verifyPayment(
        verifyRequest({ razorpaySignature: 'invalid' }),
        user,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(context.prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a payment ID or Razorpay order ID that differs from provider evidence', async () => {
    const wrongPaymentId = setup({
      providerPayment: {
        id: 'another-payment',
        order_id: 'rz_order_55',
        status: 'captured',
        amount: 99900,
        currency: 'INR',
      },
    });
    await expect(
      wrongPaymentId.service.verifyPayment(verifyRequest(), user),
    ).rejects.toThrow('Payment does not match the Razorpay order');

    const wrongOrderId = setup({
      providerPayment: {
        id: 'rz_payment_55',
        order_id: 'another-order',
        status: 'captured',
        amount: 99900,
        currency: 'INR',
      },
    });
    await expect(
      wrongOrderId.service.verifyPayment(verifyRequest(), user),
    ).rejects.toThrow('Payment does not match the Razorpay order');
  });

  it('rejects a payment that is not captured', async () => {
    const context = setup({
      providerPayment: {
        id: 'rz_payment_55',
        order_id: 'rz_order_55',
        status: 'authorized',
        amount: 99900,
        currency: 'INR',
      },
    });
    await expect(
      context.service.verifyPayment(verifyRequest(), user),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(context.transaction.order.create).not.toHaveBeenCalled();
  });

  it('rejects amount and currency mismatches', async () => {
    const wrongAmount = setup({
      providerPayment: {
        id: 'rz_payment_55',
        order_id: 'rz_order_55',
        status: 'captured',
        amount: 100,
        currency: 'INR',
      },
    });
    await expect(
      wrongAmount.service.verifyPayment(verifyRequest(), user),
    ).rejects.toThrow('Payment amount or currency is invalid');

    const wrongCurrency = setup({
      providerPayment: {
        id: 'rz_payment_55',
        order_id: 'rz_order_55',
        status: 'captured',
        amount: 99900,
        currency: 'USD',
      },
    });
    await expect(
      wrongCurrency.service.verifyPayment(verifyRequest(), user),
    ).rejects.toThrow('Payment amount or currency is invalid');
  });

  it('does not reveal another user’s intent', async () => {
    const context = setup({ intent: intent({ userId: 500 }) });
    await expect(
      context.service.verifyPayment(verifyRequest(), user),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(context.transaction.order.create).not.toHaveBeenCalled();
  });

  it('returns the existing final Order on duplicate successful verification', async () => {
    const finalOrder = order({ id: 900, paymentStatus: 'PAID' });
    const context = setup({
      intent: intent({
        status: 'COMPLETED',
        finalOrderId: 900,
        finalOrder,
      }),
      payment: payment({
        status: 'SUCCESS',
        orderId: 900,
        razorpayPaymentId: 'rz_payment_55',
      }),
      order: finalOrder,
    });
    const response = await context.service.verifyPayment(verifyRequest(), user);
    expect(response.orderId).toBe(900);
    expect(context.transaction.order.create).not.toHaveBeenCalled();
  });

  it('returns the existing Order after a successful verification response is lost', async () => {
    const context = setup();
    const request = verifyRequest();
    const first = await context.service.verifyPayment(request, user);
    const retry = await context.service.verifyPayment(request, user);

    expect(first.orderId).toBe(900);
    expect(retry.orderId).toBe(900);
    expect(context.transaction.order.create).toHaveBeenCalledTimes(1);
    expect(
      context.transaction.orderConfirmationOutbox.createMany,
    ).toHaveBeenCalledTimes(1);
  });

  it('rejects a different Razorpay payment ID for an already-successful attempt', async () => {
    const finalOrder = order({ id: 900, paymentStatus: 'PAID' });
    const context = setup({
      intent: intent({
        status: 'COMPLETED',
        finalOrderId: 900,
        finalOrder,
      }),
      payment: payment({
        status: 'SUCCESS',
        orderId: 900,
        razorpayPaymentId: 'different-payment',
      }),
      order: finalOrder,
    });
    await expect(
      context.service.verifyPayment(verifyRequest(), user),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(context.transaction.order.create).not.toHaveBeenCalled();
  });

  it('serializes concurrent verification so only one final Order is created', async () => {
    const context = setup();
    const [first, second] = await Promise.all([
      context.service.verifyPayment(verifyRequest(), user),
      context.service.verifyPayment(verifyRequest(), user),
    ]);
    expect(first.orderId).toBe(900);
    expect(second.orderId).toBe(900);
    expect(context.transaction.order.create).toHaveBeenCalledTimes(1);
    expect(
      context.transaction.orderConfirmationOutbox.createMany,
    ).toHaveBeenCalledTimes(1);
  });

  it('preserves verification for historical Order-linked payments', async () => {
    const historicOrder = order({ id: 123 });
    const historicPayment = payment({
      orderId: 123,
      checkoutIntentId: null,
      order: historicOrder,
      checkoutIntent: null,
    });
    const context = setup({
      intent: null,
      order: historicOrder,
      payment: historicPayment,
    });
    const response = await context.service.verifyPayment(verifyRequest(), user);
    const retry = await context.service.verifyPayment(verifyRequest(), user);
    expect(response.orderId).toBe(123);
    expect(retry.orderId).toBe(123);
    expect(context.transaction.order.create).not.toHaveBeenCalled();
    expect(context.transaction.order.update).toHaveBeenCalledTimes(1);
    expect(context.getOrder()).toMatchObject({
      id: 123,
      paymentStatus: 'PAID',
    });
  });

  it('rejects verification for an inactive Order-linked online order without updating payment or order', async () => {
    const inactiveOrder = order({ id: 123, isActive: false });
    const inactivePayment = payment({
      orderId: 123,
      checkoutIntentId: null,
      order: inactiveOrder,
      checkoutIntent: null,
    });
    const context = setup({
      intent: null,
      order: inactiveOrder,
      payment: inactivePayment,
    });

    await expect(
      context.service.verifyPayment(verifyRequest(), user),
    ).rejects.toThrow('Order is not eligible for payment');
    expect(context.transaction.payment.updateMany).not.toHaveBeenCalled();
    expect(context.transaction.order.update).not.toHaveBeenCalled();
    expect(context.getOrder()).toMatchObject({
      id: 123,
      isActive: false,
      paymentStatus: 'UNPAID',
    });
  });

  it('continues rejecting verification for a cancelled Order-linked online order', async () => {
    const cancelledOrder = order({ id: 123, status: 'CANCELLED' });
    const cancelledPayment = payment({
      orderId: 123,
      checkoutIntentId: null,
      order: cancelledOrder,
      checkoutIntent: null,
    });
    const context = setup({
      intent: null,
      order: cancelledOrder,
      payment: cancelledPayment,
    });

    await expect(
      context.service.verifyPayment(verifyRequest(), user),
    ).rejects.toThrow('Order is not eligible for payment');
    expect(context.transaction.payment.updateMany).not.toHaveBeenCalled();
    expect(context.transaction.order.update).not.toHaveBeenCalled();
  });

  it('rejects payment creation for admin principals', async () => {
    await expect(
      setup().service.createOrder({ checkoutIntentId: 55 }, {
        ...user,
        type: 'ADMIN',
      } as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe('PaymentService webhook reconciliation', () => {
  it('uses the shared finalizer for a captured intent payment', async () => {
    const context = setup();
    const rawBody = Buffer.from(
      JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'rz_payment_55',
              order_id: 'rz_order_55',
              amount: 99900,
              currency: 'INR',
              status: 'captured',
            },
          },
        },
      }),
    );
    const webhookSignature = createHmac('sha256', verificationSecret)
      .update(rawBody)
      .digest('hex');

    await expect(
      context.service.handleWebhook(rawBody, webhookSignature, 'event-55'),
    ).resolves.toEqual({
      received: true,
      duplicate: false,
      processed: true,
    });
    expect(context.transaction.order.create).toHaveBeenCalledTimes(1);
    expect(context.getPayment()).toMatchObject({
      status: 'SUCCESS',
      orderId: 900,
      razorpayPaymentId: 'rz_payment_55',
    });
    expect(context.getIntent()).toMatchObject({
      status: 'COMPLETED',
      finalOrderId: 900,
    });

    await expect(
      context.service.handleWebhook(rawBody, webhookSignature, 'event-55'),
    ).resolves.toEqual({
      received: true,
      duplicate: true,
      processed: true,
    });
    expect(context.transaction.order.create).toHaveBeenCalledTimes(1);
    expect(
      context.transaction.orderConfirmationOutbox.createMany,
    ).toHaveBeenCalledTimes(1);
  });

  it('rejects a captured webhook without a local payment-order association', async () => {
    const context = setup();
    context.transaction.$queryRaw.mockResolvedValueOnce([]);
    const rawBody = Buffer.from(
      JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'rz_payment_55',
              order_id: 'unknown_order',
              amount: 99900,
              currency: 'INR',
              status: 'captured',
            },
          },
        },
      }),
    );
    const webhookSignature = createHmac('sha256', verificationSecret)
      .update(rawBody)
      .digest('hex');

    await expect(
      context.service.handleWebhook(rawBody, webhookSignature, 'event-57'),
    ).rejects.toThrow(
      'Payment webhook is awaiting reconciliation; retry delivery',
    );
    expect(context.transaction.order.create).not.toHaveBeenCalled();
  });

  it('rejects invalid webhook signatures before database access', async () => {
    const context = setup();
    const rawBody = Buffer.from('{"event":"payment.captured"}');
    await expect(
      context.service.handleWebhook(rawBody, 'invalid', 'event-56'),
    ).rejects.toThrow('Invalid webhook signature');
    expect(context.prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe('PaymentController authentication', () => {
  it('rejects unauthenticated and non-user payment creation before service calls', () => {
    const paymentService = { createOrder: jest.fn() };
    const controller = new PaymentController(paymentService as never);
    expect(() =>
      controller.createOrder({ checkoutIntentId: 55 }, {}),
    ).toThrow();
    expect(() =>
      controller.createOrder(
        { checkoutIntentId: 55 },
        { user: { type: 'ADMIN' } },
      ),
    ).toThrow(ForbiddenException);
    expect(paymentService.createOrder).not.toHaveBeenCalled();
  });

  it('exposes the signed Razorpay webhook without JWT authentication', async () => {
    const paymentService = {
      createOrder: jest.fn(),
      handleWebhook: jest.fn().mockResolvedValue({ received: true }),
    };
    const controller = new PaymentController(paymentService as never);
    const rawBody = Buffer.from('{"event":"payment.captured"}');

    await expect(
      controller.webhook({ rawBody } as never, 'signature', 'event-id'),
    ).resolves.toEqual({ received: true });
    expect(paymentService.handleWebhook).toHaveBeenCalledWith(
      rawBody,
      'signature',
      'event-id',
    );
    const webhookHandler: unknown = Object.getOwnPropertyDescriptor(
      PaymentController.prototype,
      'webhook',
    )?.value;
    if (typeof webhookHandler !== 'function') {
      throw new Error('Expected a webhook controller handler');
    }
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, webhookHandler)).toBe(true);
  });
});
