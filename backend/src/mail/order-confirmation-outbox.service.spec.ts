import { OrderConfirmationOutboxService } from './order-confirmation-outbox.service';

function setup(
  sendMail = jest.fn().mockResolvedValue({ messageId: 'mail-1' }),
) {
  const entry = {
    id: 1,
    orderId: 45,
    attempts: 1,
    order: {
      id: 45,
      fullName: 'Customer',
      email: 'customer@example.test',
      phone: '9876543210',
      place: 'Coimbatore',
      totalAmount: 1200,
      createdAt: new Date(),
      status: 'PLACED',
      paymentStatus: 'PAID',
      paymentMethod: 'online',
      orderItem: [],
    },
  };
  const prisma = {
    orderConfirmationOutbox: {
      findUnique: jest
        .fn()
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce(entry),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      update: jest.fn().mockResolvedValue({}),
    },
  };
  const mail = { sendOrderPlacedToUser: sendMail };
  return {
    service: new OrderConfirmationOutboxService(prisma as never, mail as never),
    prisma,
    mail,
  };
}

describe('OrderConfirmationOutboxService', () => {
  it('claims and marks a delivered confirmation as sent', async () => {
    const { service, prisma, mail } = setup();

    await service.processOrder(45);

    expect(prisma.orderConfirmationOutbox.updateMany).toHaveBeenCalledWith({
      where: {
        id: 1,
        status: 'PENDING',
        nextAttemptAt: { lte: expect.any(Date) as Date },
      },
      data: {
        status: 'SENDING',
        lockedAt: expect.any(Date) as Date,
        attempts: { increment: 1 },
      },
    });
    expect(mail.sendOrderPlacedToUser).toHaveBeenCalledTimes(1);
    expect(prisma.orderConfirmationOutbox.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: 'SENT',
        sentAt: expect.any(Date) as Date,
        lockedAt: null,
        lastError: null,
      },
    });
  });

  it('reschedules temporary mail failures without failing payment processing', async () => {
    const { service, prisma } = setup(
      jest.fn().mockRejectedValue(new Error('temporary SMTP outage')),
    );

    await expect(service.processOrder(45)).resolves.toBeUndefined();
    expect(prisma.orderConfirmationOutbox.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        status: 'PENDING',
        lockedAt: null,
        nextAttemptAt: expect.any(Date) as Date,
        lastError: 'Error',
      }) as Record<string, unknown>,
    });
  });

  it('does not send when another worker already claimed the row', async () => {
    const { service, prisma, mail } = setup();
    prisma.orderConfirmationOutbox.updateMany.mockResolvedValue({ count: 0 });

    await service.processOrder(45);

    expect(mail.sendOrderPlacedToUser).not.toHaveBeenCalled();
    expect(prisma.orderConfirmationOutbox.findUnique).toHaveBeenCalledTimes(1);
  });
});
