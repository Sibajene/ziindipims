import { Controller, Get, Post, Body, Param, Put, Query, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { Sale, Role, PaymentStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateSaleDto, UpdatePaymentStatusDto } from './dto/sales.dto';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
  ): Promise<Sale[]> {
    const where: any = {};
    
    if (branchId) {
      where.branchId = branchId;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }
    
    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }
    
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    
    return this.salesService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Sale> {
    return this.salesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST, Role.ASSISTANT)
  async create(@Body() createSaleDto: CreateSaleDto): Promise<Sale> {
    return this.salesService.create(createSaleDto);
  }

  @Put(':id/payment-status')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST)
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
  ): Promise<Sale> {
    return this.salesService.updatePaymentStatus(id, updatePaymentStatusDto.paymentStatus);
  }

  @Get('reports/date-range')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async getSalesByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('branchId') branchId?: string,
  ): Promise<any> {
    return this.salesService.getSalesByDateRange(
      new Date(startDate),
      new Date(endDate),
      branchId,
    );
  }

  @Put(':id/cancel')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async cancelSale(@Param('id') id: string): Promise<Sale> {
    return this.salesService.cancelSale(id);
  }
}

