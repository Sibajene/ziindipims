import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { Prescription, PrescriptionItem, Role, PrescriptionStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { 
  CreatePrescriptionDto, 
  UpdatePrescriptionDto, 
  AddPrescriptionItemDto, 
  UpdatePrescriptionItemDto,
  DispensePrescriptionItemsDto
} from './dto/prescriptions.dto';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Get()
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('branchId') branchId?: string,
    @Query('patientId') patientId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<Prescription[]> {
    const where: any = {};
    
    if (branchId) {
      where.branchId = branchId;
    }
    
    if (patientId) {
      where.patientId = patientId;
    }
    
    if (status) {
      // Handle multiple statuses separated by comma
      const statuses = status.split(',').map(s => s.trim());
      if (statuses.length > 1) {
        where.status = { in: statuses };
      } else {
        where.status = statuses[0];
      }
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
    
    return this.prescriptionsService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Prescription> {
    return this.prescriptionsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST)
  async create(@Body() createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
    return this.prescriptionsService.create(createPrescriptionDto);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST)
  async update(@Param('id') id: string, @Body() updatePrescriptionDto: UpdatePrescriptionDto): Promise<Prescription> {
    return this.prescriptionsService.update(id, updatePrescriptionDto);
  }

  @Post(':id/items')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST)
  async addItem(
    @Param('id') id: string,
    @Body() addPrescriptionItemDto: AddPrescriptionItemDto,
  ): Promise<PrescriptionItem> {
    return this.prescriptionsService.addItem(id, addPrescriptionItemDto);
  }

  @Put('items/:id')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST)
  async updateItem(
    @Param('id') id: string,
    @Body() updatePrescriptionItemDto: UpdatePrescriptionItemDto,
  ): Promise<PrescriptionItem> {
    return this.prescriptionsService.updateItem(id, updatePrescriptionItemDto);
  }

  @Delete('items/:id')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST)
  async removeItem(@Param('id') id: string): Promise<PrescriptionItem> {
    return this.prescriptionsService.removeItem(id);
  }

  @Put(':id/cancel')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST)
  async cancelPrescription(@Param('id') id: string): Promise<Prescription> {
    return this.prescriptionsService.cancelPrescription(id);
  }

  @Post(':id/dispense')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST)
  async dispensePrescriptionItems(
    @Param('id') id: string,
    @Body() dispensePrescriptionItemsDto: DispensePrescriptionItemsDto,
  ): Promise<Prescription> {
    return this.prescriptionsService.dispensePrescriptionItems(id, dispensePrescriptionItemsDto.items);
  }
}

