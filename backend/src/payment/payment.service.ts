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
const INTENT_PAYMENT_STATUSES = ['CREATED', 'PENDING'];
const CREATING_PAYMENT_STALE_AFTER_MS = 10 * 60 * 1000;

type FinalizationOrder = Prisma.OrderGetPayload<{
  include: { orderItem: true };
}>;

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
  order: FinalizationOrder;
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

  private async finalizeIntentPayment(
    transaction: Prisma.TransactionClient,
    payment: {
      id: number;
      checkoutIntentId: number | null;
      orderId: number | null;
      status: string;
      razorpayPaymentId: string | null;
    },
    intentId: number,
    razorpayPaymentId: string,
    razorpaySignature?: string,
    method?: string,
    allowFailedAttempt = false,
  ): Promise<{ order: FinalizationOrder; created: boolean }> {
    const [lockedIntent] = await transaction.$queryRaw<{ id: number }[]>(
      Prisma.sql`SELECT "id" FROM "CheckoutIntent" WHERE "id" = ${intentId} FOR UPDATE`,
    );
    if (!lockedIntent) {
      throw new NotFoundException('Checkout intent not found');
    }

    const intent = await transaction.checkoutIntent.findUnique({
      where: { id: intentId },
      include: {
        items: true,
        finalOrder: { include: { orderItem: true } },
      },
    });
    if (!intent) {
      throw new NotFoundException('Checkout intent not found');
    }

    if (intent.status === 'COMPLETED' && intent.finalOrder) {
      if (
        payment.status === 'SUCCESS' &&
        payment.razorpayPaymentId === razorpayPaymentId &&
        payment.orderId === intent.finalOrder.id
      ) {
        return { order: intent.finalOrder, created: false };
      }
      throw new ConflictException('Checkout intent has already been finalized');
    }
    if (intent.status !== 'PENDING' || intent.finalOrderId !== null) {
      throw new ConflictException('Checkout intent is not pending');
    }
    if (
      payment.checkoutIntentId !== intent.id ||
      payment.orderId !== null ||
      ![
        ...INTENT_PAYMENT_STATUSES,
        ...(allowFailedAttempt ? ['FAILED'] : []),
      ].includes(payment.status)
    ) {
      throw new ConflictException('Payment is not eligible for finalization');
    }

    this.validateIntentSnapshot(intent.totalAmount, intent.items);

    const now = new Date();
    const order = await transaction.order.create({
      data: {
        userId: intent.userId,
        fullName: intent.fullName,
        email: intent.email,
        phone: intent.phone,
        address: intent.address,
        place: intent.place,
        state: intent.state,
        pincode: intent.pincode,
        paymentMethod: 'online',
        paymentStatus: 'PAID',
        paidAt: now,
        status: 'PLACED',
        totalAmount: intent.totalAmount,
        orderItem: {
          create: intent.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          })),
        },
      },
      include: { orderItem: true },
    });

    const eligibleStatuses = [
      ...INTENT_PAYMENT_STATUSES,
      ...(allowFailedAttempt ? ['FAILED'] : []),
    ];
    const linkedPayment = await transaction.payment.updateMany({
      where: {
        id: payment.id,
        checkoutIntentId: intent.id,
        orderId: null,
        status: { in: eligibleStatuses },
      },
      data: {
        orderId: order.id,
        status: 'SUCCESS',
        razorpayPaymentId,
        razorpaySignature,
        method,
        paidAt: now,
      },
    });
    if (linkedPayment.count !== 1) {
      throw new ConflictException('Payment has already been finalized');
    }

    const completedIntent = await transaction.checkoutIntent.updateMany({
      where: {
        id: intent.id,
        status: 'PENDING',
        finalOrderId: null,
      },
      data: {
        status: 'COMPLETED',
        finalOrderId: order.id,
        checkoutFingerprint: null,
      },
    });
    if (completedIntent.count !== 1) {
      throw new ConflictException('Checkout intent has already been finalized');
    }

    await transaction.orderConfirmationOutbox.createMany({
      data: { orderId: order.id },
      skipDuplicates: true,
    });
    return { order, created: true };
  }

  async createOrder(
    dto: CreatePaymentOrderDto,
    requester: AuthUser,
  ): Promise<CreatePaymentOrderResponse> {
    if (requester.type !== 'USER') {
      throw new ForbiddenException('User access required');
    }

    try {
      const reservation = await this.prisma.$transaction(
        async (transaction) => {
          const [lockedIntent] = await transaction.$queryRaw<{ id: number }[]>(
            Prisma.sql`SELECT "id" FROM "CheckoutIntent" WHERE "id" = ${dto.checkoutIntentId} AND "userId" = ${requester.userId} FOR UPDATE`,
          );
          if (!lockedIntent) {
            throw new NotFoundException('Checkout intent not found');
          }

          const intent = await transaction.checkoutIntent.findUnique({
            where: { id: dto.checkoutIntentId },
            include: {
              items: true,
              payments: {
                where: {
                  status: { in: [...ACTIVE_PAYMENT_STATUSES, 'CREATING'] },
                },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          });
          if (!intent || intent.userId !== requester.userId) {
            throw new NotFoundException('Checkout intent not found');
          }
          if (intent.status !== 'PENDING') {
            throw new ConflictException('Checkout intent is not pending');
          }

          const amount = this.validateIntentSnapshot(
            intent.totalAmount,
            intent.items,
          );
          const activePayment = intent.payments[0];
          if (activePayment) {
            if (activePayment.status === 'CREATING') {
              const staleBefore = Date.now() - CREATING_PAYMENT_STALE_AFTER_MS;
              const isStale = activePayment.updatedAt.getTime() <= staleBefore;
              if (!isStale) {
                throw new ConflictException(
                  'Payment order creation is already in progress',
                );
              }

              const receipt = this.receiptFromPaymentNotes(activePayment.notes);
              if (!receipt) {
                throw new ConflictException(
                  'Stale payment attempt has no provider receipt; manual reconciliation is required',
                );
              }

              const recoveryClaimedAt = new Date();
              const claim = await transaction.payment.updateMany({
                where: {
                  id: activePayment.id,
                  status: 'CREATING',
                  updatedAt: activePayment.updatedAt,
                },
                data: { updatedAt: recoveryClaimedAt },
              });
              if (claim.count !== 1) {
                throw new ConflictException(
                  'Payment order creation is already being recovered',
                );
              }

              return {
                payment: activePayment,
                amount,
                receipt,
                createProviderOrder: true,
                recoverProviderOrder: true,
                claimUpdatedAt: recoveryClaimedAt,
              };
            }
            if (!activePayment.razorpayOrderId) {
              throw new ConflictException('Payment attempt is incomplete');
            }
            return {
              payment: activePayment,
              amount,
              receipt: null,
              createProviderOrder: false,
              recoverProviderOrder: false,
              claimUpdatedAt: null,
            };
          }

          const receipt = this.newRazorpayReceipt(intent.id);
          const payment = await transaction.payment.create({
            data: {
              checkoutIntentId: intent.id,
              orderId: null,
              provider: PAYMENT_PROVIDER,
              razorpayOrderId: null,
              amount,
              currency: PAYMENT_CURRENCY,
              status: 'CREATING',
              notes: { razorpayReceipt: receipt },
            },
          });
          return {
            payment,
            amount,
            receipt,
            createProviderOrder: true,
            recoverProviderOrder: false,
            claimUpdatedAt: payment.updatedAt,
          };
        },
      );

      if (!reservation.createProviderOrder) {
        return this.responseForPayment(reservation.payment);
      }
      if (!reservation.receipt) {
        throw new ConflictException('Payment provider receipt is unavailable');
      }

      let razorpayOrder: { id: string };
      if (reservation.recoverProviderOrder) {
        const existingOrders = await this.razorpay.findOrdersByReceipt(
          reservation.receipt,
        );
        if (
          existingOrders.count !== existingOrders.items.length ||
          existingOrders.items.length > 1
        ) {
          throw new ServiceUnavailableException(
            'Multiple provider orders match this payment attempt; manual reconciliation is required',
          );
        }
        const existingOrder = existingOrders.items[0];
        if (
          existingOrder &&
          (existingOrder.receipt !== reservation.receipt ||
            Number(existingOrder.amount) !== reservation.amount ||
            existingOrder.currency !== PAYMENT_CURRENCY)
        ) {
          throw new ServiceUnavailableException(
            'Provider order does not match this payment attempt; manual reconciliation is required',
          );
        }
        razorpayOrder =
          existingOrder ??
          (await this.createRazorpayOrder(
            dto.checkoutIntentId,
            reservation.amount,
            reservation.receipt,
          ));
      } else {
        razorpayOrder = await this.createRazorpayOrder(
          dto.checkoutIntentId,
          reservation.amount,
          reservation.receipt,
        );
      }

      const persistedPayment = await this.prisma.payment.updateMany({
        where: {
          id: reservation.payment.id,
          status: 'CREATING',
          ...(reservation.claimUpdatedAt
            ? { updatedAt: reservation.claimUpdatedAt }
            : {}),
        },
        data: {
          razorpayOrderId: razorpayOrder.id,
          status: 'CREATED',
        },
      });
      if (persistedPayment.count !== 1) {
        throw new ServiceUnavailableException(
          'Provider order exists but its payment attempt could not be reconciled',
        );
      }

      return this.responseForPayment({
        ...reservation.payment,
        razorpayOrderId: razorpayOrder.id,
        amount: reservation.amount,
        currency: PAYMENT_CURRENCY,
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }
      this.logger.error(
        `Payment order creation failed for checkout intent ${dto.checkoutIntentId}`,
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

    let newlyPaidOrderId: number | null = null;
    try {
      const result = await this.prisma.$transaction(async (transaction) => {
        newlyPaidOrderId = null;
        const [lockedPayment] = await transaction.$queryRaw<{ id: number }[]>(
          Prisma.sql`SELECT "id" FROM "Payment" WHERE "razorpayOrderId" = ${dto.razorpayOrderId} FOR UPDATE`,
        );
        if (!lockedPayment) {
          throw new NotFoundException('Payment not found');
        }

        const payment = await transaction.payment.findUnique({
          where: { razorpayOrderId: dto.razorpayOrderId },
          include: {
            order: { include: { orderItem: true } },
            checkoutIntent: {
              include: {
                items: true,
                finalOrder: { include: { orderItem: true } },
              },
            },
          },
        });

        if (!payment) {
          throw new NotFoundException('Payment not found');
        }
        if (payment.provider !== PAYMENT_PROVIDER) {
          throw new BadRequestException('Payment provider is invalid');
        }

        if (payment.checkoutIntentId === null && payment.orderId === null) {
          throw new BadRequestException('Payment association is invalid');
        }

        let intent = payment.checkoutIntent;
        const order = payment.order;
        if (intent) {
          const [lockedIntent] = await transaction.$queryRaw<{ id: number }[]>(
            Prisma.sql`SELECT "id" FROM "CheckoutIntent" WHERE "id" = ${intent.id} FOR UPDATE`,
          );
          if (!lockedIntent) {
            throw new NotFoundException('Checkout intent not found');
          }
          if (intent.userId !== requester.userId) {
            throw new NotFoundException('Payment not found');
          }
          const freshIntent = await transaction.checkoutIntent.findUnique({
            where: { id: intent.id },
            include: {
              items: true,
              finalOrder: { include: { orderItem: true } },
            },
          });
          if (!freshIntent) {
            throw new NotFoundException('Checkout intent not found');
          }
          intent = freshIntent;
        } else if (!order || order.userId !== requester.userId) {
          throw new NotFoundException('Payment not found');
        }

        const expectedTotal = intent?.totalAmount ?? order?.totalAmount;
        if (
          expectedTotal === undefined ||
          payment.amount !== this.validateAmount(expectedTotal)
        ) {
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
          if (intent) {
            const finalOrder = intent.finalOrder;
            if (
              intent.status !== 'COMPLETED' ||
              !finalOrder ||
              intent.finalOrderId !== finalOrder.id ||
              payment.orderId !== finalOrder.id
            ) {
              throw new ConflictException(
                'Successful payment has not been finalized',
              );
            }
            return this.verificationResponse(
              finalOrder.id,
              dto.razorpayPaymentId,
              finalOrder,
            );
          }
          if (!order || payment.orderId === null) {
            throw new ConflictException('Payment order is unavailable');
          }
          return this.verificationResponse(
            payment.orderId,
            dto.razorpayPaymentId,
            order,
          );
        }

        if (!['CREATED', 'PENDING'].includes(payment.status)) {
          throw new ConflictException(
            'Payment is not eligible for verification',
          );
        }

        if (intent) {
          const finalized = await this.finalizeIntentPayment(
            transaction,
            payment,
            intent.id,
            dto.razorpayPaymentId,
            dto.razorpaySignature,
          );
          newlyPaidOrderId = finalized.created ? finalized.order.id : null;
          return this.verificationResponse(
            finalized.order.id,
            dto.razorpayPaymentId,
            finalized.order,
          );
        }

        if (!order || payment.orderId === null) {
          throw new ConflictException('Payment order is unavailable');
        }
        if (!order.isActive) {
          throw new BadRequestException('Order is not eligible for payment');
        }
        const now = new Date();
        if (order.status === 'CANCELLED') {
          throw new BadRequestException('Order is not eligible for payment');
        }
        if (order.paymentStatus === 'PAID') {
          throw new ConflictException('Order has already been paid');
        }

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

        const updatedOrder = await transaction.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'PAID',
            paidAt: now,
            checkoutFingerprint: null,
          },
          include: { orderItem: true },
        });
        await transaction.orderConfirmationOutbox.createMany({
          data: { orderId: payment.orderId },
          skipDuplicates: true,
        });

        newlyPaidOrderId = payment.orderId;
        return this.verificationResponse(
          payment.orderId,
          dto.razorpayPaymentId,
          updatedOrder,
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

        const [lockedPayment] = await transaction.$queryRaw<{ id: number }[]>(
          Prisma.sql`SELECT "id" FROM "Payment" WHERE "razorpayOrderId" = ${paymentEntity.order_id as string} FOR UPDATE`,
        );
        const payment = lockedPayment
          ? await transaction.payment.findUnique({
              where: { razorpayOrderId: paymentEntity.order_id as string },
              include: {
                order: true,
                checkoutIntent: {
                  include: {
                    items: true,
                    finalOrder: { include: { orderItem: true } },
                  },
                },
              },
            })
          : null;

        if (!payment || payment.provider !== PAYMENT_PROVIDER) {
          warning = `Ignored ${eventType} for an unknown Razorpay order`;
          retryEvent = true;
          return { duplicate: false, processed: false };
        }

        const amount = paymentEntity.amount as number;
        const intent = payment.checkoutIntent;
        const order = payment.order;
        const expectedTotal = intent?.totalAmount ?? order?.totalAmount;
        if (
          payment.amount !== amount ||
          payment.currency !== paymentEntity.currency ||
          expectedTotal === undefined ||
          payment.amount !== this.validateAmount(expectedTotal) ||
          (!intent && !order) ||
          (intent !== null &&
            order !== null &&
            (intent.status !== 'COMPLETED' ||
              intent.finalOrderId !== order.id ||
              payment.orderId !== order.id))
        ) {
          warning = `Ignored ${eventType} with an amount, currency, or association mismatch for payment ${payment.id}`;
          retryEvent = true;
          return { duplicate: false, processed: false };
        }

        if (order && (order.paymentMethod ?? '').toLowerCase() !== 'online') {
          warning = `Ignored ${eventType} for a non-online order ${order.id}`;
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
          warning = `Ignored a conflicting captured payment for payment ${payment.id}`;
          retryEvent = true;
          return { duplicate: false, processed: false };
        }

        if (intent) {
          const finalized = await this.finalizeIntentPayment(
            transaction,
            payment,
            intent.id,
            paymentEntity.id as string,
            undefined,
            typeof paymentEntity.method === 'string'
              ? paymentEntity.method
              : undefined,
            true,
          );
          if (finalized.created) {
            confirmationOrderId = finalized.order.id;
          }
          await markProcessed();
          return { duplicate: false, processed: true };
        }

        if (!order || payment.orderId === null) {
          warning = `Ignored ${eventType} for a payment without a valid order`;
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
          if (order.status === 'CANCELLED') {
            warning = `Payment captured for cancelled order ${payment.orderId}; review for refund`;
          } else {
            confirmationOrderId = payment.orderId;
            await transaction.orderConfirmationOutbox.createMany({
              data: { orderId: payment.orderId },
              skipDuplicates: true,
            });
          }
        } else if (order.paymentStatus === 'PAID' && !wasAlreadySuccessful) {
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
    order: FinalizationOrder,
  ): VerifyPaymentResponse {
    return {
      success: true,
      paymentId,
      orderId,
      paymentStatus: 'PAID',
      order,
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

  private validateIntentSnapshot(
    totalAmount: number,
    items: Array<{ quantity: number; unitPrice: number }>,
  ): number {
    const amount = this.validateAmount(totalAmount);
    this.validateOrderItems(items);
    const snapshotTotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    if (!Number.isSafeInteger(snapshotTotal) || snapshotTotal !== totalAmount) {
      throw new BadRequestException('Checkout intent total is invalid');
    }
    return amount;
  }

  private receiptFromPaymentNotes(notes: Payment['notes']): string | null {
    if (
      typeof notes !== 'object' ||
      notes === null ||
      Array.isArray(notes) ||
      !('razorpayReceipt' in notes)
    ) {
      return null;
    }
    const receipt = notes.razorpayReceipt;
    return typeof receipt === 'string' && receipt.length > 0 ? receipt : null;
  }

  private newRazorpayReceipt(intentId: number): string {
    return `checkout_${intentId}_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
  }

  private async createRazorpayOrder(
    intentId: number,
    amount: number,
    receipt: string,
  ) {
    try {
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
        `Razorpay order creation failed for checkout intent ${intentId}`,
        error instanceof Error ? error.message : undefined,
      );
      throw new InternalServerErrorException('Unable to create payment order');
    }
  }

  private responseForPayment(
    payment: Pick<Payment, 'razorpayOrderId' | 'amount' | 'currency'>,
  ): CreatePaymentOrderResponse {
    if (!payment.razorpayOrderId) {
      throw new ConflictException('Payment attempt is incomplete');
    }
    return {
      razorpayOrderId: payment.razorpayOrderId,
      amount: payment.amount,
      currency: payment.currency,
      keyId: this.razorpay.getKeyId(),
    };
  }
}
