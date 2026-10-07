import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { Prisma } from '@prisma/client';
import { AuthUser } from '../auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckoutIntentDto } from './dto/create-checkout-intent.dto';

const MAX_CHECKOUT_AMOUNT_RUPEES = 10_000_000;

type CheckoutIntentWithItems = Prisma.CheckoutIntentGetPayload<{
  include: { items: true };
}>;

@Injectable()
export class CheckoutIntentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateCheckoutIntentDto,
    requester: AuthUser,
  ): Promise<{ message: string; intent: CheckoutIntentWithItems }> {
    if (requester.type !== 'USER') {
      throw new ForbiddenException('User access required');
    }

    if (
      !dto.items.length ||
      dto.items.some(
        ({ productId, quantity }) =>
          !Number.isSafeInteger(productId) ||
          productId <= 0 ||
          !Number.isSafeInteger(quantity) ||
          quantity <= 0,
      )
    ) {
      throw new BadRequestException('Checkout items are invalid');
    }
    if (
      new Set(dto.items.map(({ productId }) => productId)).size !==
      dto.items.length
    ) {
      throw new BadRequestException(
        'Each product may only appear once in the checkout',
      );
    }

    const intent = await this.prisma.$transaction(async (transaction) => {
      const [lockedUser] = await transaction.$queryRaw<{ id: number }[]>(
        Prisma.sql`SELECT "id" FROM "User" WHERE "id" = ${requester.userId} FOR UPDATE`,
      );
      if (!lockedUser) throw new NotFoundException('User not found');

      const productIds = dto.items.map(({ productId }) => productId);
      const products = await transaction.product.findMany({
        where: { id: { in: productIds }, isActive: true },
        select: { id: true, name: true, price: true },
      });
      if (products.length !== productIds.length) {
        throw new BadRequestException(
          'One or more products are unavailable for checkout',
        );
      }

      const itemSnapshots = dto.items.map(({ productId, quantity }) => {
        const product = products.find(
          (candidate) => candidate.id === productId,
        );
        if (!product) {
          throw new BadRequestException(
            'One or more products are unavailable for checkout',
          );
        }
        if (!Number.isSafeInteger(product.price) || product.price < 0) {
          throw new BadRequestException('Product price is invalid');
        }

        return {
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity,
        };
      });

      const checkoutFingerprint = createHash('sha256')
        .update(
          itemSnapshots
            .map(({ productId, quantity }) => `${productId}:${quantity}`)
            .sort()
            .join('|'),
        )
        .digest('hex');
      const totalAmount = itemSnapshots.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      );

      if (
        !Number.isSafeInteger(totalAmount) ||
        totalAmount <= 0 ||
        totalAmount > MAX_CHECKOUT_AMOUNT_RUPEES
      ) {
        throw new BadRequestException('Checkout amount is invalid');
      }

      const existingIntent =
        (await transaction.checkoutIntent.findUnique({
          where: {
            userId_checkoutKey: {
              userId: requester.userId,
              checkoutKey: dto.checkoutKey,
            },
          },
          include: { items: true },
        })) ??
        (await transaction.checkoutIntent.findUnique({
          where: {
            userId_checkoutFingerprint: {
              userId: requester.userId,
              checkoutFingerprint,
            },
          },
          include: { items: true },
        }));

      if (existingIntent) {
        if (existingIntent.checkoutFingerprint !== checkoutFingerprint) {
          throw new ConflictException(
            'Checkout idempotency key was already used for a different cart',
          );
        }
        return existingIntent;
      }

      return transaction.checkoutIntent.create({
        data: {
          userId: requester.userId,
          fullName: dto.fullName,
          email: dto.email ?? null,
          phone: dto.phone,
          address: dto.address ?? null,
          place: dto.place,
          state: dto.state ?? null,
          pincode: dto.pincode ?? null,
          checkoutKey: dto.checkoutKey,
          checkoutFingerprint,
          totalAmount,
          status: 'PENDING',
          items: { create: itemSnapshots },
        },
        include: { items: true },
      });
    });

    return { message: 'Checkout intent ready for payment', intent };
  }
}
