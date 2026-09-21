// src/overview/overview.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Export interfaces so they can be used in controller
export interface Activity {
  id: string;
  type: string;
  message: string;
  time: string;
  timestamp: Date;
}

export interface TopProduct {
  id: number;
  name: string;
  sales: number;
  revenue: number;
  imageUrl: string | null;
}

export interface OverviewStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  avgOrderValue: number;
  chartData: Array<{ month: string; revenue: number }>;
}

export interface OverviewData {
  stats: OverviewStats;
  recentActivity: Activity[];
  topPerformers: TopProduct[];
}

@Injectable()
export class OverviewService {
  private prisma = new PrismaClient();

  // Get all overview data (ALL TIME)
  async getOverviewData(): Promise<OverviewData> {
    const [stats, recentActivity, topPerformers] = await Promise.all([
      this.getOverviewStats(),
      this.getRecentActivity(10),
      this.getTopPerformers(5)
    ]);

    return {
      stats,
      recentActivity,
      topPerformers
    };
  }

  // Get overview statistics (ALL TIME)
  async getOverviewStats(): Promise<OverviewStats> {
    // Get ALL successful orders
    const successfulOrders = await this.prisma.order.findMany({
      where: {
        status: {
          in: ['ACCEPTED', 'SHIPPED', 'DELIVERED'] as any
        }
      } as any,
      select: {
        totalAmount: true,
        userId: true,
        createdAt: true,
      }
    });

    // Total Revenue (ALL TIME)
    const totalRevenue = successfulOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Total Orders (ALL TIME)
    const totalOrders = successfulOrders.length;

    // Total Users (ALL TIME)
    const totalUsers = await this.prisma.user.count();

    // Average Order Value
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Get monthly revenue for chart (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyOrders = await this.prisma.order.findMany({
      where: {
        status: {
          in: ['ACCEPTED', 'SHIPPED', 'DELIVERED'] as any
        },
        createdAt: {
          gte: twelveMonthsAgo
        }
      } as any,
      select: {
        totalAmount: true,
        createdAt: true,
      }
    });

    const monthlyRevenue: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyRevenue[monthKey] = 0;
    }

    monthlyOrders.forEach(order => {
      const monthKey = order.createdAt.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (monthlyRevenue[monthKey] !== undefined) {
        monthlyRevenue[monthKey] += order.totalAmount;
      }
    });

    const chartData = Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue }))
      .reverse();

    return {
      totalRevenue,
      totalOrders,
      totalUsers,
      avgOrderValue,
      chartData
    };
  }

  // Get recent activity
  async getRecentActivity(limit: number = 10): Promise<Activity[]> {
    const activities: Activity[] = [];

    // Get recent orders
    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        createdAt: true,
        fullName: true,
        totalAmount: true,
        status: true,
      }
    });

    recentOrders.forEach(order => {
      activities.push({
        id: `order-${order.id}`,
        type: 'NEW_ORDER',
        message: `New order #${order.id} received from ${order.fullName}`,
        time: this.getTimeAgo(order.createdAt),
        timestamp: order.createdAt
      });
    });

    // Get recent users
    const recentUsers = await this.prisma.user.findMany({
      take: 3,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    });

    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'NEW_CUSTOMER',
        message: `New customer registration: ${user.name}`,
        time: this.getTimeAgo(user.createdAt),
        timestamp: user.createdAt
      });
    });

    // Get recent product updates
    const recentProducts = await this.prisma.product.findMany({
      take: 2,
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        updatedAt: true,
      }
    });

    recentProducts.forEach(product => {
      activities.push({
        id: `product-${product.id}`,
        type: 'PRODUCT_UPDATE',
        message: `Product updated: "${product.name}"`,
        time: this.getTimeAgo(product.updatedAt),
        timestamp: product.updatedAt
      });
    });

    // Sort by timestamp and get latest
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return activities.slice(0, limit);
  }

  // Get top performing products (ALL TIME)
  async getTopPerformers(limit: number = 5): Promise<TopProduct[]> {
    // Get ALL order items from successful orders
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          status: {
            in: ['ACCEPTED', 'SHIPPED', 'DELIVERED'] as any
          }
        }
      } as any,
      select: {
        productId: true,
        productName: true,
        quantity: true,
        unitPrice: true,
      }
    });

    // Aggregate product sales
    const productMap = new Map<number, { id: number; name: string; sales: number; revenue: number }>();
    
    orderItems.forEach(item => {
      const key = item.productId;
      if (!productMap.has(key)) {
        productMap.set(key, {
          id: item.productId,
          name: item.productName,
          sales: 0,
          revenue: 0
        });
      }
      const product = productMap.get(key)!;
      product.sales += item.quantity;
      product.revenue += item.quantity * item.unitPrice;
    });

    // Convert to array and sort by sales
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);

    // Get product images
    const productIds = topProducts.map(p => p.id);
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
      const productData = products.find(p => p.id === product.id);
      const imageUrl = productData?.imageUrl 
        ? (Array.isArray(productData.imageUrl) ? productData.imageUrl[0] : productData.imageUrl)
        : null;
      
      return {
        id: product.id,
        name: product.name,
        sales: product.sales,
        revenue: product.revenue,
        imageUrl
      };
    });
  }

  // Helper method to get time ago string
  private getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    
    return 'Just now';
  }
}