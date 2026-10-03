import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma, Payment } from '@prisma/client';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { AuthUser } from '../auth/jwt.strategy';
import { requireEnv } from '../config/env';
import { OrderConfirmationOutboxService } from '../mail/order-confirmation-outbox.service';
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

interface RazorpayWebhookPayment {
  id?: unknown;
  order_id?: unknown;
  amount?: unknown;
  currency?: unknown;
  status?: unknown;
  method?: unknown;
  error_code?: unknown;
  error_description?: unknown;
  error_reason?: unknown;
}

interface RazorpayWebhookPayload {
  event?: unknown;
  payload?: {
    payment?: { entity?: RazorpayWebhookPayment };
  };
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpay: RazorpayClient,
    private readonly confirmationOutbox: OrderConfirmationOutboxService,
  ) {}

  private async dispatchOrderConfirmation(orderId: number): Promise<void> {
    try {
      await this.confirmationOutbox.processOrder(orderId);
    } catch (error) {
      this.logger.warn(
        `Confirmation outbox dispatch deferred for order ${orderId} (${error instanceof Error ? error.name : 'unknown error'}).`,
      );
    }
  }

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
            throw new BadRequestException(
              'Order is not eligible for online payment',
            );
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
      throw new InternalServerErrorException('Unable to create payment order');
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
    const providerPayment = await this.razorpay.fetchPayment(
      dto.razorpayPaymentId,
    );

    if (
      !providerPayment ||
      typeof providerPayment !== 'object' ||
      providerPayment.id !== dto.razorpayPaymentId ||
      providerPayment.order_id !== dto.razorpayOrderId
    ) {
      throw new BadRequestException(
        'Payment does not match the Razorpay order',
      );
    }

    if (providerPayment.status !== 'captured') {
      throw new ConflictException('Payment has not been captured');
    }

    // Set inside the transaction only on the path that actually flips the
    // payment to SUCCESS, so re-verifying an already-verified payment (the
    // idempotent replay below) does not send a second confirmation.
    let newlyPaidOrderId: number | null = null;

    try {
      const result = await this.prisma.$transaction(async (transaction) => {
        newlyPaidOrderId = null;
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

        if (
          providerPayment.amount !== payment.amount ||
          providerPayment.currency !== payment.currency ||
          payment.currency !== PAYMENT_CURRENCY
        ) {
          throw new BadRequestException(
            'Payment amount or currency is invalid',
          );
        }

        if (payment.status === 'SUCCESS') {
          if (payment.razorpayPaymentId !== dto.razorpayPaymentId) {
            throw new ConflictException('Payment has already been verified');
          }

          return this.verificationResponse(
            payment.orderId,
            dto.razorpayPaymentId,
          );
        }

        if (!['CREATED', 'PENDING'].includes(payment.status)) {
          throw new ConflictException(
            'Payment is not eligible for verification',
          );
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
            checkoutFingerprint: null,
          },
        });
        await transaction.orderConfirmationOutbox.createMany({
          data: { orderId: payment.orderId },
          skipDuplicates: true,
        });

        newlyPaidOrderId = payment.orderId;

        return this.verificationResponse(
          payment.orderId,
          dto.razorpayPaymentId,
        );
      });

      // Deliberately outside the transaction: SMTP is slow and must not be
      // held inside a Serializable transaction, and the mail must only go out
      // once the payment is actually committed - never on a rolled-back one.
      if (newlyPaidOrderId !== null) {
        await this.dispatchOrderConfirmation(newlyPaidOrderId);
      }

      return result;
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

  async handleWebhook(
    rawBody: Buffer | undefined,
    signature: string | undefined,
    eventId: string | undefined,
  ): Promise<{ received: true; duplicate: boolean; processed: boolean }> {
    if (!rawBody?.length) {
      throw new BadRequestException('Webhook request body is missing');
    }
    if (!eventId?.trim() || eventId.length > 255) {
      throw new BadRequestException('Webhook event ID is invalid');
    }

    this.verifyWebhookSignature(rawBody, signature);

    let webhook: RazorpayWebhookPayload;
    try {
      webhook = JSON.parse(rawBody.toString('utf8')) as RazorpayWebhookPayload;
    } catch {
      throw new BadRequestException('Webhook request body is invalid');
    }

    if (typeof webhook.event !== 'string') {
      throw new BadRequestException('Webhook event type is missing');
    }

    const eventType = webhook.event;
    let action: 'authorized' | 'captured' | 'failed' | null = null;
    if (eventType === 'payment.authorized') action = 'authorized';
    if (eventType === 'payment.captured') action = 'captured';
    if (eventType === 'payment.failed') action = 'failed';

    const paymentEntity = webhook.payload?.payment?.entity;
    if (
      action &&
      (!paymentEntity ||
        typeof paymentEntity.id !== 'string' ||
        typeof paymentEntity.order_id !== 'string' ||
        !Number.isSafeInteger(paymentEntity.amount) ||
        typeof paymentEntity.currency !== 'string')
    ) {
      throw new BadRequestException('Webhook payment details are invalid');
    }

    if (action === 'captured' && paymentEntity?.status !== 'captured') {
      throw new BadRequestException('Captured payment event is not captured');
    }
    if (action === 'authorized' && paymentEntity?.status !== 'authorized') {
      throw new BadRequestException('Authorized payment event is invalid');
    }
    if (action === 'failed' && paymentEntity?.status !== 'failed') {
      throw new BadRequestException('Failed payment event is invalid');
    }

    let confirmationOrderId: number | null = null;
    let warning: string | null = null;
    let retryEvent = false;

    try {
      const result = await this.prisma.$transaction(async (transaction) => {
        const inserted = await transaction.webhookEvent.createMany({
          data: {
            provider: PAYMENT_PROVIDER,
            eventId: eventId.trim(),
            eventType,
            processedAt: null,
          },
          skipDuplicates: true,
        });

        if (inserted.count === 0) {
          const existingEvent = await transaction.webhookEvent.findUnique({
            where: {
              provider_eventId: {
                provider: PAYMENT_PROVIDER,
                eventId: eventId.trim(),
              },
            },
          });
          if (existingEvent?.processedAt) {
            return { duplicate: true, processed: true };
          }
        }

        const markProcessed = () =>
          transaction.webhookEvent.update({
            where: {
              provider_eventId: {
                provider: PAYMENT_PROVIDER,
                eventId: eventId.trim(),
              },
            },
            data: { processedAt: new Date() },
          });

        if (!action || !paymentEntity) {
          await markProcessed();
          return { duplicate: false, processed: false };
        }

        const payment = await transaction.payment.findUnique({
          where: { razorpayOrderId: paymentEntity.order_id as string },
          include: { order: true },
        });

        if (!payment || payment.provider !== PAYMENT_PROVIDER) {
          warning = `Ignored ${eventType} for an unknown Razorpay order`;
          retryEvent = true;
          return { duplicate: false, processed: false };
        }

        const amount = paymentEntity.amount as number;
        if (
          payment.amount !== amount ||
          payment.currency !== paymentEntity.currency ||
          payment.amount !== this.validateAmount(payment.order.totalAmount)
        ) {
          warning = `Ignored ${eventType} with an amount or currency mismatch for order ${payment.orderId}`;
          retryEvent = true;
          return { duplicate: false, processed: false };
        }

        if ((payment.order.paymentMethod ?? '').toLowerCase() !== 'online') {
          warning = `Ignored ${eventType} for a non-online order ${payment.orderId}`;
          retryEvent = true;
          return { duplicate: false, processed: false };
        }

        if (action === 'authorized') {
          await transaction.payment.updateMany({
            where: { id: payment.id, status: 'CREATED' },
            data: {
              status: 'PENDING',
              method:
                typeof paymentEntity.method === 'string'
                  ? paymentEntity.method
                  : undefined,
            },
          });
          await markProcessed();
          return { duplicate: false, processed: true };
        }

        if (action === 'failed') {
          const failureReason = [
            paymentEntity.error_description,
            paymentEntity.error_reason,
            paymentEntity.error_code,
          ]
            .filter(
              (value): value is string =>
                typeof value === 'string' && value.length > 0,
            )
            .join(': ')
            .slice(0, 500);

          await transaction.payment.updateMany({
            where: { id: payment.id, status: { in: ['CREATED', 'PENDING'] } },
            data: {
              status: 'FAILED',
              failureReason: failureReason || null,
              razorpayPaymentId: paymentEntity.id as string,
              method:
                typeof paymentEntity.method === 'string'
                  ? paymentEntity.method
                  : undefined,
            },
          });
          await markProcessed();
          return { duplicate: false, processed: true };
        }

        if (
          SUCCESSFUL_PAYMENT_STATUSES.includes(payment.status) &&
          payment.razorpayPaymentId !== paymentEntity.id
        ) {
          warning = `Ignored a conflicting captured payment for order ${payment.orderId}`;
          retryEvent = true;
          return { duplicate: false, processed: false };
        }

        const wasAlreadySuccessful = SUCCESSFUL_PAYMENT_STATUSES.includes(
          payment.status,
        );
        let paymentConfirmed = wasAlreadySuccessful;
        if (!paymentConfirmed) {
          const updatedPayment = await transaction.payment.updateMany({
            where: {
              id: payment.id,
              status: { in: ['CREATED', 'PENDING', 'FAILED'] },
            },
            data: {
              razorpayPaymentId: paymentEntity.id as string,
              status: 'SUCCESS',
              paidAt: new Date(),
              method:
                typeof paymentEntity.method === 'string'
                  ? paymentEntity.method
                  : undefined,
            },
          });
          paymentConfirmed = updatedPayment.count === 1;
        }

        if (!paymentConfirmed) {
          retryEvent = true;
          return { duplicate: false, processed: false };
        }

        const updatedOrder = await transaction.order.updateMany({
          where: { id: payment.orderId, paymentStatus: { not: 'PAID' } },
          data: {
            paymentStatus: 'PAID',
            paidAt: payment.paidAt ?? new Date(),
            checkoutFingerprint: null,
          },
        });

        if (updatedOrder.count === 1) {
          if (payment.order.status === 'CANCELLED') {
            warning = `Payment captured for cancelled order ${payment.orderId}; review for refund`;
          } else {
            confirmationOrderId = payment.orderId;
            await transaction.orderConfirmationOutbox.createMany({
              data: { orderId: payment.orderId },
              skipDuplicates: true,
            });
          }
        } else if (
          payment.order.paymentStatus === 'PAID' &&
          !wasAlreadySuccessful
        ) {
          warning = `Additional payment captured for already-paid order ${payment.orderId}; review for refund`;
        }

        await markProcessed();

        return { duplicate: false, processed: true };
      });

      if (warning) this.logger.warn(warning);
      if (retryEvent) {
        throw new ServiceUnavailableException(
          'Payment webhook is awaiting reconciliation; retry delivery',
        );
      }
      if (confirmationOrderId !== null) {
        await this.dispatchOrderConfirmation(confirmationOrderId);
      }

      return {
        received: true,
        duplicate: result.duplicate,
        processed: result.processed,
      };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      this.logger.error(
        `Razorpay webhook processing failed for event ${eventType}`,
        error instanceof Error ? error.name : undefined,
      );
      throw new InternalServerErrorException(
        'Unable to process payment webhook',
      );
    }
  }

  private verifyWebhookSignature(
    rawBody: Buffer,
    signature: string | undefined,
  ): void {
    if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const expectedSignature = createHmac(
      'sha256',
      requireEnv('RAZORPAY_WEBHOOK_SECRET'),
    )
      .update(rawBody)
      .digest('hex');
    const supplied = Buffer.from(signature, 'hex');
    const expected = Buffer.from(expectedSignature, 'hex');

    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    ) {
      throw new BadRequestException('Invalid webhook signature');
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
      throw new InternalServerErrorException('Unable to create payment order');
    }
  }

  private responseForPayment(
    payment: Pick<Payment, 'razorpayOrderId' | 'amount' | 'currency'>,
  ) {
    return {
      razorpayOrderId: payment.razorpayOrderId,
      amount: payment.amount,
      currency: payment.currency,
      keyId: this.razorpay.getKeyId(),
    };
  }
}
