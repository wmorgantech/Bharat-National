import { PAID_ORDER_WHERE } from '../common/paid-order-metrics';
import { OverviewService } from './overview.service';

describe('OverviewService financial aggregation', () => {
  it('uses the shared paid-order rule for totals and monthly revenue', async () => {
    const currentMonth = new Date('2026-10-07T12:00:00.000Z');
    jest.useFakeTimers().setSystemTime(currentMonth);
    const createdAt = currentMonth;
    const prisma = {
      order: {
        findMany: jest
          .fn()
          .mockResolvedValueOnce([
            { totalAmount: 100 },
            { totalAmount: 300 },
            { totalAmount: 500 },
          ])
          .mockResolvedValueOnce([{ totalAmount: 100, createdAt }]),
        count: jest.fn().mockResolvedValue(2),
      },
      user: { count: jest.fn().mockResolvedValue(4) },
    };
    const service = new OverviewService(prisma as never);

    const stats = await service.getOverviewStats();

    expect(prisma.order.findMany).toHaveBeenNthCalledWith(1, {
      where: PAID_ORDER_WHERE,
      select: { totalAmount: true },
    });
    expect(prisma.order.count).toHaveBeenCalledWith({
      where: { status: { in: ['ACCEPTED', 'SHIPPED', 'DELIVERED'] } },
    });
    expect(prisma.order.findMany).toHaveBeenNthCalledWith(2, {
      where: {
        ...PAID_ORDER_WHERE,
        createdAt: {
          gte: new Date('2025-11-01T00:00:00.000Z'),
          lt: new Date('2026-11-01T00:00:00.000Z'),
        },
      },
      select: { totalAmount: true, createdAt: true },
    });
    expect(stats).toMatchObject({
      totalRevenue: 900,
      totalOrders: 2,
      totalUsers: 4,
      avgOrderValue: 300,
    });
    expect(stats.chartData).toHaveLength(12);
    expect(stats.chartData.reduce((sum, month) => sum + month.revenue, 0)).toBe(
      100,
    );
    jest.useRealTimers();
  });

  it('uses the same paid-order rule for top products and counts each item once', async () => {
    const prisma = {
      orderItem: {
        findMany: jest.fn().mockResolvedValue([
          {
            productId: 8,
            productName: 'Widget',
            quantity: 2,
            unitPrice: 50,
          },
          {
            productId: 8,
            productName: 'Widget',
            quantity: 1,
            unitPrice: 50,
          },
        ]),
      },
      product: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 8, imageUrl: ['widget.jpg'] }]),
      },
    };
    const service = new OverviewService(prisma as never);

    const products = await service.getTopPerformers(5);

    expect(prisma.orderItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { order: { is: PAID_ORDER_WHERE } },
      }),
    );
    expect(products).toEqual([
      {
        id: 8,
        name: 'Widget',
        sales: 3,
        revenue: 150,
        imageUrl: 'widget.jpg',
      },
    ]);
  });
});
