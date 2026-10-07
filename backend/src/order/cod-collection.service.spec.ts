import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

jest.mock(
  'src/auth/roles.decorator',
  () => ({
    Roles:
      (...roles: string[]) =>
      (target: object, key: string | symbol) => {
        Reflect.defineMetadata('roles', roles, target, key);
      },
  }),
  { virtual: true },
);

import { isPaidFinancialOrder } from '../common/paid-order-metrics';
import { RolesGuard } from '../auth/roles.guard';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

type TestOrder = {
  id: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  isActive: boolean;
  totalAmount: number;
  paidAt: Date | null;
  [key: string]: unknown;
};

type TestPayment = {
  id: number;
  orderId: number;
  checkoutIntentId: number | null;
  provider: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  amount: number;
  currency: string;
  status: string;
  method: string;
  paidAt: Date | null;
  failureReason: string | null;
  notes: unknown;
};

type TestCollection = {
  id: number;
  orderId: number;
  paymentId: number;
  adminId: number;
  action: string;
  collectedAt: Date;
};

type TestState = {
  order: TestOrder | null;
  payment: TestPayment | null;
  collection: TestCollection | null;
  paymentCreates: number;
  collectionCreates: number;
  failCollectionCreate: boolean;
};

type PaymentCreateData = Omit<TestPayment, 'id'>;

function clone<T>(value: T): T {
  return structuredClone(value);
}

function setup(initialOrder: TestOrder | null) {
  const state: TestState = {
    order: initialOrder ? clone(initialOrder) : null,
    payment: null,
    collection: null,
    paymentCreates: 0,
    collectionCreates: 0,
    failCollectionCreate: false,
  };
  let transactionQueue = Promise.resolve();

  const transaction = {
    $queryRaw: jest.fn(() =>
      Promise.resolve(state.order ? [{ id: state.order.id }] : []),
    ),
    order: {
      findUnique: jest.fn(() =>
        Promise.resolve(
          state.order
            ? {
                ...clone(state.order),
                codCollection: state.collection
                  ? {
                      ...clone(state.collection),
                      payment: clone(state.payment),
                    }
                  : null,
              }
            : null,
        ),
      ),
      updateMany: jest.fn(
        ({
          where,
          data,
        }: {
          where: {
            id: number;
            paymentMethod: string;
            paymentStatus: string;
            isActive: boolean;
            status: { not: string };
          };
          data: Partial<TestOrder>;
        }) => {
          if (
            !state.order ||
            state.order.id !== where.id ||
            state.order.paymentMethod !== where.paymentMethod ||
            state.order.paymentStatus !== where.paymentStatus ||
            state.order.isActive !== where.isActive ||
            state.order.status === where.status.not
          ) {
            return Promise.resolve({ count: 0 });
          }

          Object.assign(state.order, data);
          return Promise.resolve({ count: 1 });
        },
      ),
    },
    payment: {
      create: jest.fn(({ data }: { data: PaymentCreateData }) => {
        state.paymentCreates += 1;
        state.payment = {
          id: 501,
          ...data,
          razorpayOrderId: null,
          razorpayPaymentId: null,
          razorpaySignature: null,
          failureReason: null,
          notes: null,
        };
        return Promise.resolve(clone(state.payment));
      }),
    },
    codCollectionEvent: {
      create: jest.fn(({ data }: { data: Omit<TestCollection, 'id'> }) => {
        if (state.failCollectionCreate) {
          return Promise.reject(new Error('audit write failed'));
        }
        state.collectionCreates += 1;
        state.collection = {
          id: 601,
          ...data,
        };
        return Promise.resolve({
          ...clone(state.collection),
          payment: {
            id: state.payment!.id,
            provider: state.payment!.provider,
            amount: state.payment!.amount,
            currency: state.payment!.currency,
            status: state.payment!.status,
            method: state.payment!.method,
            paidAt: state.payment!.paidAt,
          },
        });
      }),
    },
  };

  const prisma = {
    $transaction: jest.fn(
      async (callback: (tx: typeof transaction) => unknown) => {
        let release = () => {};
        const previous = transactionQueue;
        transactionQueue = new Promise<void>((resolve) => {
          release = resolve;
        });
        await previous;

        const before = clone(state);
        try {
          return await callback(transaction);
        } catch (error) {
          Object.assign(state, before);
          throw error;
        } finally {
          release();
        }
      },
    ),
  };
  const service = new OrderService(
    prisma as never,
    { sendOrderPlacedToUser: jest.fn() } as never,
  );

  return { service, prisma, state, transaction };
}

const admin = { userId: 17, role: 'ADMIN', type: 'ADMIN' as const };

function codOrder(overrides: Partial<TestOrder> = {}): TestOrder {
  return {
    id: 42,
    paymentMethod: 'cod',
    paymentStatus: 'UNPAID',
    status: 'PLACED',
    isActive: true,
    totalAmount: 1299,
    paidAt: null,
    ...overrides,
  };
}

describe('Admin COD collection', () => {
  it('creates a COD Payment and audit event atomically with Admin attribution', async () => {
    const { service, state } = setup(codOrder());

    const result = await service.collectCodPayment(42, admin);

    expect(state.order).toMatchObject({
      paymentMethod: 'cod',
      paymentStatus: 'PAID',
      paidAt: result.collectedAt,
    });
    expect(state.payment).toMatchObject({
      id: result.paymentId,
      orderId: 42,
      checkoutIntentId: null,
      provider: 'COD',
      amount: 129900,
      currency: 'INR',
      status: 'SUCCESS',
      method: 'cod',
      paidAt: result.collectedAt,
      razorpayOrderId: null,
      razorpayPaymentId: null,
      razorpaySignature: null,
    });
    expect(state.collection).toMatchObject({
      orderId: 42,
      paymentId: result.paymentId,
      adminId: 17,
      action: 'COD_COLLECTED',
      collectedAt: result.collectedAt,
    });
    expect(state.paymentCreates).toBe(1);
    expect(state.collectionCreates).toBe(1);
    expect(result).toMatchObject({
      orderId: 42,
      paymentStatus: 'PAID',
      paymentMethod: 'cod',
      collectedByAdminId: 17,
      payment: { id: result.paymentId, provider: 'COD', method: 'cod' },
    });
    expect(result).not.toHaveProperty('payment.razorpaySignature');
    expect(result).not.toHaveProperty('payment.notes');
    expect(result).not.toHaveProperty('payment.failureReason');
  });

  it.each([
    ['online', codOrder({ paymentMethod: 'online' }), BadRequestException],
    ['cancelled', codOrder({ status: 'CANCELLED' }), ConflictException],
    ['inactive', codOrder({ isActive: false }), ConflictException],
    [
      'already paid without a collection event',
      codOrder({ paymentStatus: 'PAID', paidAt: new Date() }),
      ConflictException,
    ],
    [
      'already-paid online',
      codOrder({
        paymentMethod: 'online',
        paymentStatus: 'PAID',
        paidAt: new Date(),
      }),
      ConflictException,
    ],
    [
      'invalid payment status',
      codOrder({ paymentStatus: 'FAILED' }),
      ConflictException,
    ],
  ])('rejects %s orders without writes', async (_name, order, exception) => {
    const { service, state } = setup(order);

    await expect(service.collectCodPayment(42, admin)).rejects.toBeInstanceOf(
      exception,
    );

    expect(state.paymentCreates).toBe(0);
    expect(state.collectionCreates).toBe(0);
    expect(state.order?.paymentStatus).toBe(order.paymentStatus);
  });

  it('rejects a missing order', async () => {
    const { service } = setup(null);

    await expect(service.collectCodPayment(404, admin)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects non-Admin principals before opening a transaction', async () => {
    const { service, prisma } = setup(codOrder());

    await expect(
      service.collectCodPayment(42, {
        userId: 17,
        role: 'USER',
        type: 'USER',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('requires Admin role metadata on the endpoint', () => {
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockReturnValue(
          Reflect.getMetadata(
            'roles',
            OrderController.prototype,
            'collectCodPayment',
          ),
        ),
    };
    const guard = new RolesGuard(reflector as never);
    const context = {
      getHandler: () => () => undefined,
      getClass: () => OrderController,
      switchToHttp: () => ({
        getRequest: () => ({ user: { userId: 3, role: 'USER', type: 'USER' } }),
      }),
    };

    expect(() => guard.canActivate(context as never)).toThrow(
      ForbiddenException,
    );
  });

  it('returns the existing collection for an idempotent retry without exposing payment secrets', async () => {
    const collectedAt = new Date('2026-10-07T12:00:00.000Z');
    const order = codOrder({ paymentStatus: 'PAID', paidAt: collectedAt });
    const { service, state } = setup(order);
    state.payment = {
      id: 501,
      orderId: 42,
      checkoutIntentId: null,
      provider: 'COD',
      razorpayOrderId: null,
      razorpayPaymentId: null,
      razorpaySignature: null,
      amount: 129900,
      currency: 'INR',
      status: 'SUCCESS',
      method: 'cod',
      paidAt: collectedAt,
      notes: { secret: true },
      failureReason: 'sensitive',
    };
    state.collection = {
      id: 601,
      orderId: 42,
      paymentId: 501,
      adminId: 17,
      action: 'COD_COLLECTED',
      collectedAt,
    };

    const result = await service.collectCodPayment(42, admin);

    expect(state.paymentCreates).toBe(0);
    expect(state.collectionCreates).toBe(0);
    expect(result.paymentId).toBe(501);
    expect(result.payment).toEqual({
      id: 501,
      provider: 'COD',
      amount: 129900,
      currency: 'INR',
      status: 'SUCCESS',
      method: 'cod',
      paidAt: collectedAt,
    });
  });

  it('serializes repeated concurrent requests to one Payment and collection event', async () => {
    const { service, state } = setup(codOrder());

    const results = await Promise.all([
      service.collectCodPayment(42, admin),
      service.collectCodPayment(42, admin),
    ]);

    expect(results[0].paymentId).toBe(results[1].paymentId);
    expect(state.paymentCreates).toBe(1);
    expect(state.collectionCreates).toBe(1);
  });

  it('rolls back Payment and Order changes if audit creation fails', async () => {
    const { service, state } = setup(codOrder());
    state.failCollectionCreate = true;

    await expect(service.collectCodPayment(42, admin)).rejects.toThrow(
      'audit write failed',
    );

    expect(state.order?.paymentStatus).toBe('UNPAID');
    expect(state.order?.paidAt).toBeNull();
    expect(state.payment).toBeNull();
    expect(state.collection).toBeNull();
    expect(state.paymentCreates).toBe(0);
    expect(state.collectionCreates).toBe(0);
  });

  it('includes a collected COD order in the shared paid-order predicate', () => {
    expect(
      isPaidFinancialOrder({
        paymentStatus: 'PAID',
        status: 'PLACED',
        isActive: true,
      }),
    ).toBe(true);
  });
});
