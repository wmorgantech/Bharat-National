// src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DashboardService {
  private prisma = new PrismaClient();

  // Get last 3 days revenue
  async getLast3DaysRevenue() {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: {
        status: {
          in: ['ACCEPTED', 'SHIPPED', 'DELIVERED']
        },
        createdAt: {
          gte: threeDaysAgo
        }
      }
    });

    // Group by date
    const dailyRevenue: Record<string, number> = {};
    const today = new Date();
    
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyRevenue[dateKey] = 0;
    }

    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (dailyRevenue[dateKey] !== undefined) {
        dailyRevenue[dateKey] += order.totalAmount;
      }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      totalRevenue,
      dailyRevenue,
      orderCount: orders.length
    };
  }

  // Get last 30 days stats
  async getLast30DaysStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: {
        status: {
          in: ['ACCEPTED', 'SHIPPED', 'DELIVERED']
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        orderItem: true,
        user: true
      }
    });

    // Calculate totals
    const totalOrders = orders.length;
    const totalQuantity = orders.reduce((sum, order) => {
      const qty = order.orderItem.reduce((itemSum, item) => itemSum + item.quantity, 0);
      return sum + qty;
    }, 0);
    const uniqueCustomers = new Set(orders.map(order => order.userId)).size;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Prepare daily stats for chart (last 30 days)
    const dailyStats: Record<string, { orders: number; revenue: number; quantity: number }> = {};
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyStats[dateKey] = {
        orders: 0,
        revenue: 0,
        quantity: 0
      };
    }

    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (dailyStats[dateKey]) {
        dailyStats[dateKey].orders++;
        dailyStats[dateKey].revenue += order.totalAmount;
        const qty = order.orderItem.reduce((sum, item) => sum + item.quantity, 0);
        dailyStats[dateKey].quantity += qty;
      }
    });

    // Convert to array for frontend
    const chartData = Object.entries(dailyStats).map(([date, stats]) => ({
      date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      fullDate: date,
      orders: stats.orders,
      revenue: stats.revenue,
      quantity: stats.quantity
    }));

    return {
      totalOrders,
      totalQuantity,
      uniqueCustomers,
      totalRevenue,
      chartData
    };
  }

  // Get latest 10 orders
  async getLatestOrders() {
    const orders = await this.prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        orderItem: {
          take: 1,
          select: {
            productName: true,
            quantity: true
          }
        }
      }
    });

    return orders.map(order => ({
      id: order.id,
      customerName: order.user?.name || order.fullName || 'Guest',
      email: order.user?.email || order.email || 'N/A',
      amount: order.totalAmount,
      status: order.status,
      date: order.createdAt,
      items: order.orderItem.length,
      quantity: order.orderItem.reduce((sum, item) => sum + item.quantity, 0),
      productName: order.orderItem[0]?.productName || 'Multiple Items'
    }));
  }

  // Get top selling products (last 30 days)
  async getTopSellingProducts(limit: number = 5) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Get orders from last 30 days with ACCEPTED/SHIPPED/DELIVERED status
    const orders = await this.prisma.order.findMany({
      where: {
        status: {
          in: ['ACCEPTED', 'SHIPPED', 'DELIVERED']
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        id: true,
        orderItem: {
          select: {
            productId: true,
            productName: true,
            quantity: true,
            unitPrice: true
          }
        }
      }
    });

    // Aggregate product sales
    const productSales: Record<string, { productId: number; productName: string; totalQuantity: number; revenue: number }> = {};
    
    orders.forEach(order => {
      order.orderItem.forEach(item => {
        const key = item.productId.toString();
        if (!productSales[key]) {
          productSales[key] = {
            productId: item.productId,
            productName: item.productName,
            totalQuantity: 0,
            revenue: 0
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
    const productIds = topProducts.map(p => p.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        imageUrl: true
      }
    });

    return topProducts.map(product => {
      const productData = products.find(p => p.id === product.productId);
      const imageUrl = productData?.imageUrl 
        ? (Array.isArray(productData.imageUrl) ? productData.imageUrl[0] : productData.imageUrl)
        : null;
      
      return {
        productId: product.productId,
        productName: product.productName,
        totalQuantity: product.totalQuantity,
        revenue: product.revenue,
        imageUrl
      };
    });
  }

  // Get all dashboard data
  async getDashboardData() {
    const [revenue3Days, stats30Days, latestOrders, topProducts] = await Promise.all([
      this.getLast3DaysRevenue(),
      this.getLast30DaysStats(),
      this.getLatestOrders(),
      this.getTopSellingProducts(5)
    ]);

    return {
      revenue3Days,
      stats30Days,
      latestOrders,
      topProducts
    };
  }
}