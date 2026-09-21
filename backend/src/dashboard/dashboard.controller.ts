// src/dashboard/dashboard.controller.ts
import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getDashboardStats() {
    return this.dashboardService.getDashboardData();
  }

  @Get('revenue/last-3-days')
  async getLast3DaysRevenue() {
    return this.dashboardService.getLast3DaysRevenue();
  }

  @Get('stats/last-30-days')
  async getLast30DaysStats() {
    return this.dashboardService.getLast30DaysStats();
  }

  @Get('orders/latest')
  async getLatestOrders() {
    return this.dashboardService.getLatestOrders();
  }

  @Get('products/top-selling')
  async getTopSellingProducts() {
    return this.dashboardService.getTopSellingProducts();
  }
}