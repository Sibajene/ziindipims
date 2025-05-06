import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Batch, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateBatchDto, UpdateBatchDto, TransferStockDto } from './dto/inventory.dto';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('batches')
  async findAllBatches(
    @Request() req,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('productId') productId?: string,
    @Query('branchId') branchId?: string,
    @Query('expiryBefore') expiryBefore?: string,
    @Query('expiryAfter') expiryAfter?: string,
    @Query('pharmacyId') pharmacyId?: string,
  ): Promise<Batch[]> {
    // Ensure user can only access their pharmacy's data
    if (pharmacyId && req.user.pharmacyId !== pharmacyId && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only access inventory for your own pharmacy');
    }

    // If no pharmacyId is provided, use the user's pharmacyId
    const effectivePharmacyId = pharmacyId || req.user.pharmacyId;
    
    // Only proceed if we have a pharmacyId
    if (!effectivePharmacyId) {
      throw new ForbiddenException('Pharmacy ID is required');
    }

    // Build the where clause for Prisma
    const where: any = {
      product: {
        pharmacyId: effectivePharmacyId
      }
    };

    if (productId) {
      where.productId = productId;
    }

    if (branchId) {
      where.branchId = branchId;
    }

    if (expiryBefore) {
      where.expiryDate = {
        ...(where.expiryDate || {}),
        lte: new Date(expiryBefore)
      };
    }

    if (expiryAfter) {
      where.expiryDate = {
        ...(where.expiryDate || {}),
        gte: new Date(expiryAfter)
      };
    }

    return this.inventoryService.findAllBatches({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      where,
      orderBy: {
        expiryDate: 'asc'
      }
    });
  }
  
  @Get('batches/:id')
  async findBatchById(@Param('id') id: string): Promise<Batch> {
    return this.inventoryService.findBatchById(id);
  }
  
  @Post('batches')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST)
  async createBatch(@Body() createBatchDto: CreateBatchDto): Promise<Batch> {
    return this.inventoryService.createBatch({
      product: {
        connect: { id: createBatchDto.productId }
      },
      branch: {
        connect: { id: createBatchDto.branchId }
      },
      quantity: createBatchDto.quantity,
      batchNumber: createBatchDto.batchNumber,
      expiryDate: createBatchDto.expiryDate,
      costPrice: createBatchDto.costPrice,
      sellingPrice: createBatchDto.sellingPrice,
      createdBy: createBatchDto.createdBy,
    });
  }
  
  @Put('batches/:id')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST)
  async updateBatch(@Param('id') id: string, @Body() updateBatchDto: UpdateBatchDto): Promise<Batch> {
    return this.inventoryService.updateBatch(id, updateBatchDto);
  }
  
  @Delete('batches/:id')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async deleteBatch(@Param('id') id: string): Promise<Batch> {
    return this.inventoryService.deleteBatch(id);
  }
  
  @Get('expiring')
  async getExpiringBatches(@Query('days') days?: string): Promise<Batch[]> {
    const daysThreshold = days ? parseInt(days) : 90;
    return this.inventoryService.getExpiringBatches(daysThreshold);
  }
  
  @Get('low-stock')
  async getLowStockProducts(@Query('branchId') branchId?: string): Promise<any[]> {
    return this.inventoryService.getLowStockProducts(branchId);
  }
  
  @Post('transfer')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST)
  async transferStock(@Body() transferStockDto: TransferStockDto): Promise<any> {
    return this.inventoryService.transferStock(transferStockDto);
  }
  
  @Put('transfer/:id/approve')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async approveTransfer(@Param('id') id: string, @Body('approvedBy') approvedBy: string): Promise<any> {
    return this.inventoryService.approveTransfer(id, approvedBy);
  }

  @Put('transfer/:id/complete')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST)
  async completeTransfer(@Param('id') id: string): Promise<any> {
    return this.inventoryService.completeTransfer(id);
  }

  @Post('adjust-stock')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST)
  async adjustStock(@Body() adjustmentData: any): Promise<any> {
    return this.inventoryService.adjustStock(adjustmentData);
  }
}
