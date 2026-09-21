// user.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UserService {
  private prisma = new PrismaClient();

  async getUserStats() {
    // Get all users (total registered users)
    const totalUsers = await this.prisma.user.count();
    
    // Get all users who have placed orders (logged customers who ordered)
    const usersWithOrders = await this.prisma.user.findMany({
      where: {
        orders: {
          some: {}
        }
      },
      select: {
        id: true,
        orders: {
          select: {
            status: true
          }
        }
      }
    });

    const totalLoggedCustomers = usersWithOrders.length;
    
    // Calculate ordered, cancelled, abandoned customers
    let orderedCustomers = 0;
    let cancelledCustomers = 0;
    let abandonedCustomers = 0;

    for (const user of usersWithOrders) {
      const hasSuccessfulOrder = user.orders.some(o => 
        ['ACCEPTED', 'SHIPPED', 'DELIVERED'].includes(o.status)
      );
      const hasCancelled = user.orders.some(o => o.status === 'CANCELLED');
      const hasAbandoned = user.orders.some(o => o.status === 'ABANDONED');

      if (hasSuccessfulOrder) orderedCustomers++;
      if (hasCancelled) cancelledCustomers++;
      if (hasAbandoned) abandonedCustomers++;
    }

    const nonOrderCustomers = totalUsers - totalLoggedCustomers;

    return {
      totalLoggedCustomers,  // Users who have placed at least one order
      nonOrderCustomers,      // Users who registered but never ordered
      orderedCustomers,       // Users with successful orders (ACCEPTED/SHIPPED/DELIVERED)
      cancelledCustomers,     // Users who have cancelled orders
      abandonedCustomers,     // Users who have abandoned orders
      totalUsers,             // Total registered users
    };
  }
}