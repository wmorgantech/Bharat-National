import { DashboardService } from './dashboard.service';
import { PAID_ORDER_WHERE } from '../common/paid-order-metrics';

describe('DashboardService', () => {
  it('keeps the dashboard stats response properties unchanged', async () => {
    const prisma = { order: { findMany: jest.fn() } };
    const service = new DashboardService(prisma as never);
    jest.spyOn(service, 'getLast3DaysRevenue').mockResolvedValue({
      totalRevenue: 0,
      dailyRevenue: {},
      orderCount: 0,
    });
    jest.spyOn(service, 'getLast30DaysStats').mockResolvedValue({
      totalOrders: 0,
      totalQuantity: 0,
      uniqueCustomers: 0,
      totalRevenue: 0,
      chartData: [],
    });
    jest.spyOn(service, 'getLatestOrders').mockResolvedValue([]);
    jest.spyOn(service, 'getTopSellingProducts').mockResolvedValue([]);

    const result = await service.getDashboardData();

    expect(Object.keys(result)).toEqual([
      'revenue3Days',
      'stats30Days',
      'latestOrders',
      'topProducts',
    ]);
    expect(Object.keys(result.stats30Days)).toEqual([
      'totalOrders',
      'totalQuantity',
      'uniqueCustomers',
      'totalRevenue',
      'chartData',
    ]);
  });

  it('counts created orders separately while applying the paid financial rule once', async () => {
    const today = new Date('2026-10-07T12:00:00.000Z');
    jest.useFakeTimers().setSystemTime(today);
    const orders = [
      {
        userId: 1,
        status: 'PLACED',
        paymentStatus: 'PAID',
        isActive: true,
        totalAmount: 1200,
        createdAt: today,
        orderItem: [{ quantity: 2 }],
      },
      {
        userId: 2,
        status: 'ACCEPTED',
        paymentStatus: 'UNPAID',
        isActive: true,
        totalAmount: 200,
        createdAt: today,
        orderItem: [{ quantity: 4 }],
      },
      {
        userId: 3,
        status: 'CANCELLED',
        paymentStatus: 'PAID',
        isActive: true,
        totalAmount: 300,
        createdAt: today,
        orderItem: [{ quantity: 8 }],
      },
      {
        userId: 4,
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        isActive: false,
        totalAmount: 400,
        createdAt: today,
        orderItem: [{ quantity: 16 }],
      },
      {
        userId: 5,
        status: 'PLACED',
        paymentStatus: 'FAILED',
        isActive: true,
        totalAmount: 500,
        createdAt: today,
        orderItem: [{ quantity: 32 }],
      },
      {
        userId: 6,
        status: 'PLACED',
        paymentStatus: 'UNPAID',
        isActive: true,
        paymentMethod: 'cod',
        totalAmount: 600,
        createdAt: today,
        orderItem: [{ quantity: 64 }],
      },
      {
        userId: 2,
        status: 'PLACED',
        paymentStatus: 'PAID',
        isActive: true,
        paymentMethod: 'cod',
        totalAmount: 700,
        createdAt: today,
        orderItem: [{ quantity: 3 }],
      },
    ];
    const prisma = {
      order: {
        findMany: jest.fn().mockResolvedValue(orders),
      },
    };
    const service = new DashboardService(prisma as never);

    const result = await service.getLast30DaysStats();

    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: {
        createdAt: {
          gte: new Date('2026-09-08T00:00:00.000Z'),
          lt: new Date('2026-10-08T00:00:00.000Z'),
        },
      },
      select: {
        userId: true,
        totalAmount: true,
        paymentStatus: true,
        status: true,
        isActive: true,
        createdAt: true,
        orderItem: { select: { quantity: true } },
      },
    });
    expect(result).toMatchObject({
      totalOrders: 7,
      totalQuantity: 5,
      uniqueCustomers: 2,
      totalRevenue: 1900,
    });
    expect(Array.isArray(result.chartData)).toBe(true);
    expect(result.chartData).toHaveLength(30);
    expect(result.chartData[29]).toMatchObject({
      orders: 7,
      revenue: 1900,
      quantity: 5,
    });
    expect(result.chartData[0].fullDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(
      new Date(`${result.chartData[29].fullDate}T00:00:00.000Z`).getTime() -
        new Date(`${result.chartData[0].fullDate}T00:00:00.000Z`).getTime(),
    ).toBe(29 * 24 * 60 * 60 * 1000);
    jest.useRealTimers();
  });

  it('uses the same paid-order predicate and UTC day boundaries for 3-day revenue and top products', async () => {
    const today = new Date('2026-10-07T12:00:00.000Z');
    jest.useFakeTimers().setSystemTime(today);
    const prisma = {
      order: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      product: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const service = new DashboardService(prisma as never);

    await service.getLast3DaysRevenue();
    expect(prisma.order.findMany).toHaveBeenNthCalledWith(1, {
      where: {
        ...PAID_ORDER_WHERE,
        createdAt: {
          gte: new Date('2026-10-05T00:00:00.000Z'),
          lt: new Date('2026-10-08T00:00:00.000Z'),
        },
      },
      select: { createdAt: true, totalAmount: true },
    });

    await service.getTopSellingProducts();
    expect(prisma.order.findMany).toHaveBeenNthCalledWith(2, {
      where: {
        ...PAID_ORDER_WHERE,
        createdAt: {
          gte: new Date('2026-09-08T00:00:00.000Z'),
          lt: new Date('2026-10-08T00:00:00.000Z'),
        },
      },
      select: {
        id: true,
        orderItem: {
          select: {
            productId: true,
            productName: true,
            quantity: true,
            unitPrice: true,
          },
        },
      },
    });
    jest.useRealTimers();
  });
});
