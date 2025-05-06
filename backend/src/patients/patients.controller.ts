import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { Patient, PatientInsurance, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePatientDto, UpdatePatientDto, AddInsurancePlanDto, UpdateInsurancePlanDto } from './dto/patients.dto';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('name') name?: string,
    @Query('phone') phone?: string,
  ): Promise<Patient[]> {
    const where: any = {};
    
    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    
    if (phone) {
      where.phone = { contains: phone };
    }
    
    return this.patientsService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      where,
      orderBy: { name: 'asc' },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Patient> {
    return this.patientsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST, Role.ASSISTANT)
  async create(@Body() createPatientDto: CreatePatientDto): Promise<Patient> {
    return this.patientsService.create(createPatientDto);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST, Role.ASSISTANT)
  async update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto): Promise<Patient> {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Post(':id/insurance')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST)
  async addInsurancePlan(
    @Param('id') id: string,
    @Body() addInsurancePlanDto: AddInsurancePlanDto,
  ): Promise<PatientInsurance> {
    return this.patientsService.addInsurancePlan({
      patientId: id,
      ...addInsurancePlanDto,
    });
  }

  @Put('insurance/:id')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER, Role.PHARMACIST)
  async updateInsurancePlan(
    @Param('id') id: string,
    @Body() updateInsurancePlanDto: UpdateInsurancePlanDto,
  ): Promise<PatientInsurance> {
    return this.patientsService.updateInsurancePlan(id, updateInsurancePlanDto);
  }

  @Delete('insurance/:id')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async removeInsurancePlan(@Param('id') id: string): Promise<PatientInsurance> {
    return this.patientsService.removeInsurancePlan(id);
  }

  @Get(':id/medication-history')
  async getPatientMedicationHistory(@Param('id') id: string): Promise<any> {
    return this.patientsService.getPatientMedicationHistory(id);
  }

  @Get(':id/insurance')
  async getPatientInsurance(@Param('id') id: string) {
    return this.patientsService.getInsurancePlansByPatientId(id);
  }
}
