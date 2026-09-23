import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Payment } from '@prisma/client';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { AuthUser } from '../auth/jwt.strategy';
import { requireEnv } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { RazorpayClient } from './razorpay.client';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

const PAYMENT_PROVIDER = 'RAZORPAY';
const PAYMENT_CURRENCY = 'INR';
const ACTIVE_PAYMENT_STATUSES = ['CREATED', 'PENDING'];
const SUCCESSFUL_PAYMENT_STATUSES = ['SUCCESS', 'CAPTURED', 'PAID'];
const MAX_ORDER_AMOUNT_RUPEES = 10_000_000;

export interface CreatePaymentOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentResponse {
  success: true;
  paymentId: string;
  orderId: number;
  paymentStatus: 'PAID';
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpay: RazorpayClient,
  ) {}

  async createOrder(
    dto: CreatePaymentOrderDto,
    requester: AuthUser,
  ): Promise<CreatePaymentOrderResponse> {
    if (requester.type !== 'USER') {
      throw new ForbiddenException('User access required');
    }

    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          // Lock the order row so concurrent requests cannot both create a new
          // active attempt after observing the same pre-existing state.
          const lockedOrder = await transaction.$queryRaw<{ id: number }[]>(
            Prisma.sql`SELECT "id" FROM "Order" WHERE "id" = ${dto.orderId} AND "userId" = ${requester.userId} FOR UPDATE`,
          );

          if (lockedOrder.length === 0) {
            // Deliberately use the same response for a missing or foreign order.
            throw new NotFoundException('Order not found');
          }

          const order = await transaction.order.findUnique({
            where: { id: dto.orderId },
            include: {
              orderItem: true,
              payments: {
                where: { status: { in: ACTIVE_PAYMENT_STATUSES } },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          });

          if (!order) {
            throw new NotFoundException('Order not found');
          }

          if (order.status === 'CANCELLED') {
            throw new BadRequestException('Order is not eligible for payment');
          }

          if (SUCCESSFUL_PAYMENT_STATUSES.includes(order.paymentStatus)) {
            throw new ConflictException('Order has already been paid');
          }

          if (order.paymentMethod?.toLowerCase() !== 'online') {
            throw new BadRequestException('Order is not eligible for online payment');
          }

          const amount = this.validateAmount(order.totalAmount);
          this.validateOrderItems(order.orderItem);

          const activePayment = order.payments[0];
          if (activePayment) {
            return this.responseForPayment(activePayment);
          }

          const razorpayOrder = await this.createRazorpayOrder(
            dto.orderId,
            amount,
          );

          const payment = await transaction.payment.create({
            data: {
              orderId: dto.orderId,
              provider: PAYMENT_PROVIDER,
              razorpayOrderId: razorpayOrder.id,
              amount,
              currency: PAYMENT_CURRENCY,
              status: 'CREATED',
            },
          });

          return this.responseForPayment(payment);
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `Payment order creation failed for order ${dto.orderId}`,
        error instanceof Error ? error.message : undefined,
      );
      throw new InternalServerErrorException(
        'Unable to create payment order',
      );
    }
  }

  async verifyPayment(
    dto: VerifyPaymentDto,
    requester: AuthUser,
  ): Promise<VerifyPaymentResponse> {
    if (requester.type !== 'USER') {
      throw new ForbiddenException('User access required');
    }

    this.verifySignature(dto);

    try {
      return await this.prisma.$transaction(async (transaction) => {
        const payment = await transaction.payment.findUnique({
          where: { razorpayOrderId: dto.razorpayOrderId },
          include: { order: true },
        });

        if (!payment || payment.order.userId !== requester.userId) {
          throw new NotFoundException('Payment not found');
        }

        if (payment.provider !== PAYMENT_PROVIDER) {
          throw new BadRequestException('Payment provider is invalid');
        }

        if (payment.order.status === 'CANCELLED') {
          throw new BadRequestException('Order is not eligible for payment');
        }

        if (
          payment.order.paymentStatus === 'PAID' &&
          payment.status !== 'SUCCESS'
        ) {
          throw new ConflictException('Order has already been paid');
        }

        if (payment.amount !== this.validateAmount(payment.order.totalAmount)) {
          throw new BadRequestException('Payment amount is invalid');
        }

        if (payment.status === 'SUCCESS') {
          if (payment.razorpayPaymentId !== dto.razorpayPaymentId) {
            throw new ConflictException('Payment has already been verified');
          }

          return this.verificationResponse(payment.orderId, dto.razorpayPaymentId);
        }

        if (!['CREATED', 'PENDING'].includes(payment.status)) {
          throw new ConflictException('Payment is not eligible for verification');
        }

        const now = new Date();
        const updatedPayment = await transaction.payment.updateMany({
          where: {
            id: payment.id,
            status: { in: ['CREATED', 'PENDING'] },
          },
          data: {
            razorpayPaymentId: dto.razorpayPaymentId,
            razorpaySignature: dto.razorpaySignature,
            status: 'SUCCESS',
            paidAt: now,
          },
        });

        if (updatedPayment.count !== 1) {
          throw new ConflictException('Payment has already been verified');
        }

        await transaction.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'PAID',
            paidAt: now,
          },
        });

        return this.verificationResponse(payment.orderId, dto.razorpayPaymentId);
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `Payment verification failed for Razorpay order ${dto.razorpayOrderId}`,
        error instanceof Error ? error.message : undefined,
      );
      throw new InternalServerErrorException('Unable to verify payment');
    }
  }

  private verifySignature(dto: VerifyPaymentDto): void {
    const expectedSignature = createHmac(
      'sha256',
      requireEnv('RAZORPAY_KEY_SECRET'),
    )
      .update(`${dto.razorpayOrderId}|${dto.razorpayPaymentId}`)
      .digest('hex');

    const supplied = Buffer.from(dto.razorpaySignature, 'utf8');
    const expected = Buffer.from(expectedSignature, 'utf8');

    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    ) {
      throw new BadRequestException('Invalid payment signature');
    }
  }

  private verificationResponse(
    orderId: number,
    paymentId: string,
  ): VerifyPaymentResponse {
    return {
      success: true,
      paymentId,
      orderId,
      paymentStatus: 'PAID',
    };
  }

  private validateAmount(totalAmount: number): number {
    if (
      !Number.isSafeInteger(totalAmount) ||
      totalAmount <= 0 ||
      totalAmount > MAX_ORDER_AMOUNT_RUPEES
    ) {
      throw new BadRequestException('Order amount is invalid');
    }

    const amount = totalAmount * 100;
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw new BadRequestException('Order amount is invalid');
    }

    return amount;
  }

  private validateOrderItems(
    items: Array<{ quantity: number; unitPrice: number }>,
  ): void {
    if (
      items.length === 0 ||
      items.some(
        (item) =>
          !Number.isSafeInteger(item.quantity) ||
          item.quantity <= 0 ||
          !Number.isSafeInteger(item.unitPrice) ||
          item.unitPrice < 0,
      )
    ) {
      throw new BadRequestException('Order items are invalid');
    }
  }

  private async createRazorpayOrder(orderId: number, amount: number) {
    try {
      const receipt = `order_${orderId}_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
      const razorpayOrder = await this.razorpay.createOrder({
        amount,
        currency: PAYMENT_CURRENCY,
        receipt,
      });

      if (!razorpayOrder?.id) {
        throw new Error('Razorpay returned no order id');
      }

      return razorpayOrder;
    } catch (error) {
      this.logger.error(
        `Razorpay order creation failed for order ${orderId}`,
        error instanceof Error ? error.message : undefined,
      );
      throw new InternalServerErrorException(
        'Unable to create payment order',
      );
    }
  }

  private responseForPayment(payment: Pick<Payment, 'razorpayOrderId' | 'amount' | 'currency'>) {
    return {
      razorpayOrderId: payment.razorpayOrderId,
      amount: payment.amount,
      currency: payment.currency,
      keyId: this.razorpay.getKeyId(),
    };
  }
}