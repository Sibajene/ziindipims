import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { 
  InsuranceProvider, 
  InsurancePlan, 
  PlanCoverageItem, 
  InsuranceClaim, 
  Role, 
  ClaimStatus 
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateProviderDto,
  UpdateProviderDto,
  CreatePlanDto,
  UpdatePlanDto,
  AddCoverageItemDto,
  UpdateCoverageItemDto,
  UpdateClaimStatusDto,
  UpdateClaimItemsDto,
} from './dto/insurance.dto';

@Controller('insurance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  // Provider endpoints
  @Get('providers')
  async findAllProviders(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('name') name?: string,
    @Query('active') active?: string,
  ): Promise<InsuranceProvider[]> {
    const where: any = {};
    
    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    
    if (active !== undefined) {
      where.active = active === 'true';
    }
    
    return this.insuranceService.findAllProviders({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      where,
      orderBy: { name: 'asc' },
    });
  }

  @Get('providers/:id')
  async findProviderById(@Param('id') id: string): Promise<InsuranceProvider> {
    return this.insuranceService.findProviderById(id);
  }

  @Post('providers')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async createProvider(@Body() createProviderDto: CreateProviderDto): Promise<InsuranceProvider> {
    return this.insuranceService.createProvider(createProviderDto);
  }

  @Put('providers/:id')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async updateProvider(
    @Param('id') id: string,
    @Body() updateProviderDto: UpdateProviderDto,
  ): Promise<InsuranceProvider> {
    return this.insuranceService.updateProvider(id, updateProviderDto);
  }

  // Plan endpoints
  @Get('plans')
  async findAllPlans(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('providerId') providerId?: string,
    @Query('active') active?: string,
  ): Promise<InsurancePlan[]> {
    const where: any = {};
    
    if (providerId) {
      where.providerId = providerId;
    }
    
    if (active !== undefined) {
      where.active = active === 'true';
    }
    
    return this.insuranceService.findAllPlans({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      where,
      orderBy: { name: 'asc' },
    });
  }

  @Get('plans/:id')
  async findPlanById(@Param('id') id: string): Promise<InsurancePlan> {
    return this.insuranceService.findPlanById(id);
  }

  @Post('plans')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async createPlan(@Body() createPlanDto: CreatePlanDto): Promise<InsurancePlan> {
    return this.insuranceService.createPlan(createPlanDto);
  }

  @Put('plans/:id')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async updatePlan(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ): Promise<InsurancePlan> {
    return this.insuranceService.updatePlan(id, updatePlanDto);
  }

  // Coverage Item endpoints
  @Post('plans/:id/coverage')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async addCoverageItem(
    @Param('id') id: string,
    @Body() addCoverageItemDto: AddCoverageItemDto,
  ): Promise<PlanCoverageItem> {
    return this.insuranceService.addCoverageItem(id, addCoverageItemDto);
  }

  @Put('coverage/:id')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async updateCoverageItem(
    @Param('id') id: string,
    @Body() updateCoverageItemDto: UpdateCoverageItemDto,
  ): Promise<PlanCoverageItem> {
    return this.insuranceService.updateCoverageItem(id, updateCoverageItemDto);
  }

  @Delete('coverage/:id')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async removeCoverageItem(@Param('id') id: string): Promise<PlanCoverageItem> {
    return this.insuranceService.removeCoverageItem(id);
  }

  // Claim endpoints
  @Get('claims')
  async findAllClaims(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('providerId') providerId?: string,
    @Query('status') status?: ClaimStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<InsuranceClaim[]> {
    const where: any = {};
    
    if (providerId) {
      where.providerId = providerId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.submissionDate = {};
      
      if (startDate) {
        where.submissionDate.gte = new Date(startDate);
      }
      
      if (endDate) {
        where.submissionDate.lte = new Date(endDate);
      }
    }
    
    return this.insuranceService.findAllClaims({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      where,
      orderBy: { submissionDate: 'desc' },
    });
  }

  @Get('claims/:id')
  async findClaimById(@Param('id') id: string): Promise<InsuranceClaim> {
    return this.insuranceService.findClaimById(id);
  }

  @Put('claims/:id/status')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST)
  async updateClaimStatus(
    @Param('id') id: string,
    @Body() updateClaimStatusDto: UpdateClaimStatusDto,
  ): Promise<InsuranceClaim> {
    return this.insuranceService.updateClaimStatus(id, updateClaimStatusDto);
  }

  @Put('claims/:id/items')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST)
  async updateClaimItems(
    @Param('id') id: string,
    @Body() updateClaimItemsDto: UpdateClaimItemsDto,
  ): Promise<InsuranceClaim> {
    return this.insuranceService.updateClaimItems(id, updateClaimItemsDto.items);
  }

  @Get('statistics')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async getClaimStatistics(
    @Query('providerId') providerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    return this.insuranceService.getClaimStatistics(
      providerId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
