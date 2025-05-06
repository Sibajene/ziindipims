import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Query('pharmacyId') pharmacyId: string) {
    if (!pharmacyId) {
      throw new BadRequestException('pharmacyId query parameter is required');
    }
    return this.dashboardService.getDashboardStats(pharmacyId);
  }

  @Get('recent-sales')
  async getRecentSales(@Query('pharmacyId') pharmacyId: string) {
    if (!pharmacyId) {
      throw new BadRequestException('pharmacyId query parameter is required');
    }
    return this.dashboardService.getRecentSales(pharmacyId);
  }

  @Get('recent-prescriptions')
  async getRecentPrescriptions(@Query('pharmacyId') pharmacyId: string) {
    if (!pharmacyId) {
      throw new BadRequestException('pharmacyId query parameter is required');
    }
    return this.dashboardService.getRecentPrescriptions(pharmacyId);
  }

  @Get('recent-insurance-claims')
  async getRecentInsuranceClaims(@Query('pharmacyId') pharmacyId: string) {
    if (!pharmacyId) {
      throw new BadRequestException('pharmacyId query parameter is required');
    }
    return this.dashboardService.getRecentInsuranceClaims(pharmacyId);
  }

  @Get('inventory-alerts')
  async getInventoryAlerts(@Query('pharmacyId') pharmacyId: string) {
    if (!pharmacyId) {
      throw new BadRequestException('pharmacyId query parameter is required');
    }
    return this.dashboardService.getInventoryAlerts(pharmacyId);
  }
}
