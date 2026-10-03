import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { PrismaService } from '../prisma/prisma.service';

const OUTBOX_POLL_MS = 10_000;
const OUTBOX_LEASE_MS = 10 * 60_000;
const MAX_RETRY_DELAY_MS = 60 * 60_000;

@Injectable()
export class OrderConfirmationOutboxService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(OrderConfirmationOutboxService.name);
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => void this.processPending(), OUTBOX_POLL_MS);
    this.timer.unref();
    void this.processPending();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async processOrder(orderId: number): Promise<void> {
    try {
      const entry = await this.prisma.orderConfirmationOutbox.findUnique({
        where: { orderId },
        select: { id: true },
      });
      if (entry) await this.deliver(entry.id);
    } catch (error) {
      this.logRetry(orderId, error);
    }
  }

  private async processPending(): Promise<void> {
    try {
      const now = new Date();
      await this.prisma.orderConfirmationOutbox.updateMany({
        where: {
          status: 'SENDING',
          lockedAt: { lt: new Date(now.getTime() - OUTBOX_LEASE_MS) },
        },
        data: { status: 'PENDING', lockedAt: null, nextAttemptAt: now },
      });

      const pending = await this.prisma.orderConfirmationOutbox.findMany({
        where: { status: 'PENDING', nextAttemptAt: { lte: now } },
        select: { id: true },
        orderBy: { id: 'asc' },
        take: 20,
      });
      await Promise.all(pending.map(({ id }) => this.deliver(id)));
    } catch (error) {
      this.logRetry(null, error);
    }
  }

  private async deliver(id: number): Promise<void> {
    const now = new Date();
    const claimed = await this.prisma.orderConfirmationOutbox.updateMany({
      where: { id, status: 'PENDING', nextAttemptAt: { lte: now } },
      data: {
        status: 'SENDING',
        lockedAt: now,
        attempts: { increment: 1 },
      },
    });
    if (claimed.count !== 1) return;

    const entry = await this.prisma.orderConfirmationOutbox.findUnique({
      where: { id },
      include: { order: { include: { orderItem: true } } },
    });
    if (!entry) return;

    if (!entry.order.email) {
      await this.prisma.orderConfirmationOutbox.update({
        where: { id },
        data: {
          status: 'FAILED',
          lockedAt: null,
          lastError: 'Order has no destination email',
        },
      });
      this.logger.warn(
        `Confirmation email for order ${entry.orderId} cannot be sent without a destination address.`,
      );
      return;
    }

    try {
      await this.mailService.sendOrderPlacedToUser({
        id: entry.order.id,
        fullName: entry.order.fullName,
        email: entry.order.email,
        phone: entry.order.phone,
        place: entry.order.place,
        totalAmount: entry.order.totalAmount,
        createdAt: entry.order.createdAt,
        status: entry.order.status,
        paymentStatus: entry.order.paymentStatus,
        paymentMethod: entry.order.paymentMethod,
        orderItem: entry.order.orderItem,
      });
      await this.prisma.orderConfirmationOutbox.update({
        where: { id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          lockedAt: null,
          lastError: null,
        },
      });
    } catch (error) {
      const attempts = entry.attempts;
      const retryDelay = Math.min(
        MAX_RETRY_DELAY_MS,
        5_000 * 2 ** Math.min(attempts, 10),
      );
      await this.prisma.orderConfirmationOutbox.update({
        where: { id },
        data: {
          status: 'PENDING',
          lockedAt: null,
          nextAttemptAt: new Date(Date.now() + retryDelay),
          lastError:
            error instanceof Error ? String(error.name) : 'Unknown mail error',
        },
      });
      this.logRetry(entry.orderId, error);
    }
  }

  private logRetry(orderId: number | null, error: unknown): void {
    this.logger.warn(
      `Order confirmation outbox retry deferred${orderId ? ` for order ${orderId}` : ''} (${error instanceof Error ? error.name : 'unknown error'}).`,
    );
  }
}
