import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { CheckoutIntentService } from './checkout-intent.service';
import { CreateCheckoutIntentDto } from './dto/create-checkout-intent.dto';

const requester = { userId: 25, role: 'USER', type: 'USER' as const };

function dto(overrides: Partial<CreateCheckoutIntentDto> = {}) {
  return {
    checkoutKey: 'e0b0b16f-48f6-43db-a7e3-4a4f590b30ef',
    fullName: 'Customer',
    email: 'customer@example.test',
    phone: '9876543210',
    address: '1 Main Street',
    place: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641001',
    items: [
      { productId: 3, quantity: 2, unitPrice: 1, price: 1 },
      { productId: 8, quantity: 1, unitPrice: 1, price: 1 },
    ],
    ...overrides,
  } as CreateCheckoutIntentDto;
}

function fingerprint(items = dto().items) {
  return createHash('sha256')
    .update(
      items
        .map(({ productId, quantity }) => `${productId}:${quantity}`)
        .sort()
        .join('|'),
    )
    .digest('hex');
}

function setup(
  options: {
    products?: Array<{
      id: number;
      name: string;
      price: number;
      isActive?: boolean;
    }>;
    existingByKey?: Record<string, unknown> | null;
    existingByFingerprint?: Record<string, unknown> | null;
    userExists?: boolean;
  } = {},
) {
  const products = options.products ?? [
    { id: 3, name: 'Laptop', price: 50_000 },
    { id: 8, name: 'Mouse', price: 1_000 },
  ];
  const createdIntents: Record<string, unknown>[] = [];
  const transaction = {
    $queryRaw: jest
      .fn()
      .mockResolvedValue(
        options.userExists === false ? [] : [{ id: requester.userId }],
      ),
    product: {
      findMany: jest.fn(({ where }: { where: { id: { in: number[] } } }) =>
        products.filter(
          (product) =>
            where.id.in.includes(product.id) && product.isActive !== false,
        ),
      ),
    },
    checkoutIntent: {
      findUnique: jest
        .fn()
        .mockResolvedValueOnce(options.existingByKey ?? null)
        .mockResolvedValueOnce(options.existingByFingerprint ?? null),
      create: jest.fn(({ data }: { data: Record<string, unknown> }) => {
        const created = { id: 99, ...data, items: data.items };
        createdIntents.push(created);
        return created;
      }),
    },
  };
  const prisma = {
    $transaction: jest.fn((callback: (tx: typeof transaction) => unknown) =>
      callback(transaction),
    ),
  };

  return {
    service: new CheckoutIntentService(prisma as never),
    prisma,
    transaction,
    createdIntents,
  };
}

describe('CheckoutIntentService.create', () => {
  it('creates a pending intent and trusted item snapshots atomically', async () => {
    const { service, prisma, transaction, createdIntents } = setup();

    const result = await service.create(dto(), requester);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(transaction.checkoutIntent.create).toHaveBeenCalledTimes(1);
    expect(transaction.checkoutIntent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: requester.userId,
        checkoutKey: dto().checkoutKey,
        checkoutFingerprint: expect.any(String),
        totalAmount: 101_000,
        status: 'PENDING',
        items: {
          create: [
            {
              productId: 3,
              productName: 'Laptop',
              unitPrice: 50_000,
              quantity: 2,
            },
            {
              productId: 8,
              productName: 'Mouse',
              unitPrice: 1_000,
              quantity: 1,
            },
          ],
        },
      }),
      include: { items: true },
    });
    expect(result.intent).toEqual(createdIntents[0]);
  });

  it('rejects a missing product', async () => {
    const { service } = setup({
      products: [{ id: 3, name: 'Laptop', price: 50_000 }],
    });

    await expect(service.create(dto(), requester)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects an inactive product', async () => {
    const { service } = setup({
      products: [
        { id: 3, name: 'Laptop', price: 50_000 },
        { id: 8, name: 'Mouse', price: 1_000, isActive: false },
      ],
    });

    await expect(service.create(dto(), requester)).rejects.toThrow(
      'One or more products are unavailable for checkout',
    );
  });

  it('rejects invalid quantities before writing', async () => {
    const { service, transaction } = setup();

    await expect(
      service.create(
        dto({
          items: [{ productId: 3, quantity: 0 }],
        } as Partial<CreateCheckoutIntentDto>),
        requester,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(transaction.checkoutIntent.create).not.toHaveBeenCalled();
  });

  it('ignores frontend price and total fields', async () => {
    const { service, transaction } = setup();
    const request = dto() as CreateCheckoutIntentDto & {
      totalAmount: number;
    };
    request.totalAmount = 1;

    await service.create(request, requester);

    const createArgs = transaction.checkoutIntent.create.mock.calls[0][0];
    expect(createArgs.data.totalAmount).toBe(101_000);
    expect(createArgs.data.items.create[0].unitPrice).toBe(50_000);
  });

  it('reuses the same intent for a repeated checkout key and cart', async () => {
    const existingIntent = {
      id: 12,
      userId: requester.userId,
      checkoutFingerprint: fingerprint(),
    };
    const { service, transaction } = setup({
      existingByKey: existingIntent,
    });

    const result = await service.create(dto(), requester);

    expect(result.intent).toBe(existingIntent);
    expect(transaction.checkoutIntent.create).not.toHaveBeenCalled();
  });

  it('rejects reuse of a checkout key for a different cart', async () => {
    const { service, transaction } = setup({
      existingByKey: { id: 12, checkoutFingerprint: 'different-cart' },
    });

    await expect(service.create(dto(), requester)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(transaction.checkoutIntent.create).not.toHaveBeenCalled();
  });

  it('scopes identical checkout keys to the authenticated user', async () => {
    const { service, transaction } = setup();

    await service.create(dto(), requester);

    expect(transaction.checkoutIntent.findUnique).toHaveBeenNthCalledWith(1, {
      where: {
        userId_checkoutKey: {
          userId: requester.userId,
          checkoutKey: dto().checkoutKey,
        },
      },
      include: { items: true },
    });
    expect(transaction.checkoutIntent.create.mock.calls[0][0].data.userId).toBe(
      requester.userId,
    );
  });

  it('allows a different authenticated user to use the same checkout key', async () => {
    const first = setup();
    const second = setup();
    const otherUser = { ...requester, userId: 26 };

    await first.service.create(dto(), requester);
    await second.service.create(dto(), otherUser);

    expect(
      first.transaction.checkoutIntent.create.mock.calls[0][0].data.userId,
    ).toBe(25);
    expect(
      second.transaction.checkoutIntent.create.mock.calls[0][0].data.userId,
    ).toBe(26);
  });

  it('rejects a nonexistent authenticated user and never trusts a DTO userId', async () => {
    const { service, transaction } = setup({ userExists: false });
    const request = dto() as CreateCheckoutIntentDto & { userId: number };
    request.userId = 999;

    await expect(service.create(request, requester)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(transaction.checkoutIntent.create).not.toHaveBeenCalled();
  });

  it('rejects an admin principal', async () => {
    const { service, prisma } = setup();

    await expect(
      service.create(dto(), { ...requester, type: 'ADMIN' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
