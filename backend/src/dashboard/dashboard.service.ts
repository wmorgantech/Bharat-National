// src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  isPaidFinancialOrder,
  PAID_ORDER_WHERE,
} from '../common/paid-order-metrics';

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // Get last 3 days revenue
  async getLast3DaysRevenue() {
    const today = startOfUtcDay(new Date());
    const startDate = new Date(today);
    startDate.setUTCDate(startDate.getUTCDate() - 2);
    const endDate = new Date(today);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    const orders = await this.prisma.order.findMany({
      where: {
        ...PAID_ORDER_WHERE,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    });

    // Group by date
    const dailyRevenue: Record<string, number> = {};
    for (let i = 0; i < 3; i++) {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + i);
      dailyRevenue[dateKey(date)] = 0;
    }

    orders.forEach((order) => {
      const orderDateKey = dateKey(order.createdAt);
      if (dailyRevenue[orderDateKey] !== undefined) {
        dailyRevenue[orderDateKey] += order.totalAmount;
      }
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    return {
      totalRevenue,
      dailyRevenue,
      orderCount: orders.length,
    };
  }

  // Get last 30 days stats
  async getLast30DaysStats() {
    const today = startOfUtcDay(new Date());
    const startDate = new Date(today);
    startDate.setUTCDate(startDate.getUTCDate() - 29);
    const endDate = new Date(today);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        userId: true,
        totalAmount: true,
        paymentStatus: true,
        status: true,
        isActive: true,
        createdAt: true,
        orderItem: {
          select: {
            quantity: true,
          },
        },
      },
    });

    // Order count includes every order; financial/customer/item metrics only
    // include orders whose payment has been confirmed.
    const paidOrders = orders.filter(isPaidFinancialOrder);
    const totalOrders = orders.length;
    const totalQuantity = paidOrders.reduce((sum, order) => {
      const qty = order.orderItem.reduce(
        (itemSum, item) => itemSum + item.quantity,
        0,
      );
      return sum + qty;
    }, 0);
    const uniqueCustomers = new Set(paidOrders.map((order) => order.userId))
      .size;
    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    // Prepare daily stats for chart (last 30 days)
    const dailyStats: Record<
      string,
      { orders: number; revenue: number; quantity: number }
    > = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() - i);
      dailyStats[dateKey(date)] = {
        orders: 0,
        revenue: 0,
        quantity: 0,
      };
    }

    orders.forEach((order) => {
      const orderDateKey = dateKey(order.createdAt);
      if (dailyStats[orderDateKey]) {
        dailyStats[orderDateKey].orders++;
        if (isPaidFinancialOrder(order)) {
          dailyStats[orderDateKey].revenue += order.totalAmount;
          const qty = order.orderItem.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );
          dailyStats[orderDateKey].quantity += qty;
        }
      }
    });

    // Convert to array for frontend
    const chartData = Object.entries(dailyStats).map(([date, stats]) => ({
      date: new Date(`${date}T00:00:00.000Z`).toLocaleDateString('en-IN', {
        timeZone: 'UTC',
        day: '2-digit',
        month: 'short',
      }),
      fullDate: date,
      orders: stats.orders,
      revenue: stats.revenue,
      quantity: stats.quantity,
    }));

    return {
      totalOrders,
      totalQuantity,
      uniqueCustomers,
      totalRevenue,
      chartData,
    };
  }

  // Get latest 10 orders
  async getLatestOrders() {
    const orders = await this.prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        orderItem: {
          take: 1,
          select: {
            productName: true,
            quantity: true,
          },
        },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      customerName: order.user?.name || order.fullName || 'Guest',
      email: order.user?.email || order.email || 'N/A',
      amount: order.totalAmount,
      status: order.status,
      date: order.createdAt,
      items: order.orderItem.length,
      quantity: order.orderItem.reduce((sum, item) => sum + item.quantity, 0),
      productName: order.orderItem[0]?.productName || 'Multiple Items',
    }));
  }

  // Get top selling products (last 30 days)
  async getTopSellingProducts(limit: number = 5) {
    const today = startOfUtcDay(new Date());
    const startDate = new Date(today);
    startDate.setUTCDate(startDate.getUTCDate() - 29);
    const endDate = new Date(today);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    // Only confirmed, active, non-cancelled orders contribute to sales.
    const orders = await this.prisma.order.findMany({
      where: {
        ...PAID_ORDER_WHERE,
        createdAt: {
          gte: startDate,
          lt: endDate,
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

    // Aggregate product sales
    const productSales: Record<
      string,
      {
        productId: number;
        productName: string;
        totalQuantity: number;
        revenue: number;
      }
    > = {};

    orders.forEach((order) => {
      order.orderItem.forEach((item) => {
        const key = item.productId.toString();
        if (!productSales[key]) {
          productSales[key] = {
            productId: item.productId,
            productName: item.productName,
            totalQuantity: 0,
            revenue: 0,
          };
        }
        productSales[key].totalQuantity += item.quantity;
        productSales[key].revenue += item.quantity * item.unitPrice;
      });
    });

    // Sort by quantity and get top products
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);

    // Get product images
    const productIds = topProducts.map((p) => p.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        imageUrl: true,
      },
    });

    return topProducts.map((product) => {
      const productData = products.find((p) => p.id === product.productId);
      const imageUrl = productData?.imageUrl
        ? Array.isArray(productData.imageUrl)
          ? productData.imageUrl[0]
          : productData.imageUrl
        : null;

      return {
        productId: product.productId,
        productName: product.productName,
        totalQuantity: product.totalQuantity,
        revenue: product.revenue,
        imageUrl,
      };
    });
  }

  // Get all dashboard data
  async getDashboardData() {
    const [revenue3Days, stats30Days, latestOrders, topProducts] =
      await Promise.all([
        this.getLast3DaysRevenue(),
        this.getLast30DaysStats(),
        this.getLatestOrders(),
        this.getTopSellingProducts(5),
      ]);

    return {
      revenue3Days,
      stats30Days,
      latestOrders,
      topProducts,
    };
  }
}
