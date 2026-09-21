// src/overview/overview.controller.ts (Simpler version)
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OverviewService } from './overview.service';
import { Roles } from 'src/auth/roles.decorator';

@ApiTags('Overview')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('overview')
export class OverviewController {
  constructor(private readonly overviewService: OverviewService) {}

  @Get('all')
  async getAllOverviewData() {
    return this.overviewService.getOverviewData();
  }

  @Get('stats')
  async getOverviewStats() {
    return this.overviewService.getOverviewStats();
  }

  @Get('activity')
  async getRecentActivity() {
    return this.overviewService.getRecentActivity(10);
  }

  @Get('top-performers')
  async getTopPerformers() {
    return this.overviewService.getTopPerformers(5);
  }

  @Get('revenue')
  async getTotalRevenue() {
    const stats = await this.overviewService.getOverviewStats();
    return {
      totalRevenue: stats.totalRevenue,
      totalOrders: stats.totalOrders,
      avgOrderValue: stats.avgOrderValue
    };
  }

  @Get('chart')
  async getChartData() {
    const stats = await this.overviewService.getOverviewStats();
    return stats.chartData || [];
  }
}
