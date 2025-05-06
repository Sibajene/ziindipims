import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Patient, PatientInsurance, Prisma } from '@prisma/client';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PatientWhereInput;
    orderBy?: Prisma.PatientOrderByWithRelationInput;
  }): Promise<Patient[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.patient.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async findOne(id: string): Promise<Patient | null> {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        insurancePlans: {
          include: {
            plan: {
              include: {
                provider: true,
              },
            },
          },
        },
        prescriptions: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        sales: {
          include: {
            saleItems: {
              include: {
                batch: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async getInsurancePlansByPatientId(patientId: string): Promise<PatientInsurance[]> {
    const insurancePlans = await this.prisma.patientInsurance.findMany({
      where: { patientId },
      include: {
        plan: {
          include: {
            provider: true,
          },
        },
      },
    });

    if (!insurancePlans || insurancePlans.length === 0) {
      throw new NotFoundException(`No insurance plans found for patient with ID ${patientId}`);
    }

    return insurancePlans;
  }

  async create(data: Prisma.PatientCreateInput): Promise<Patient> {
    try {
      return await this.prisma.patient.create({
        data,
      });
    } catch (error) {
      console.error('Error creating patient in service:', error);
      throw error;
    }
  }

  async update(id: string, data: Prisma.PatientUpdateInput): Promise<Patient> {
    // Check if patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return this.prisma.patient.update({
      where: { id },
      data,
    });
  }

  async addInsurancePlan(data: {
    patientId: string;
    planId: string;
    membershipNumber: string;
    primaryHolder: boolean;
    relationshipToHolder?: string;
    startDate: Date;
    endDate?: Date;
  }): Promise<PatientInsurance> {
    const { patientId, planId, membershipNumber, primaryHolder, relationshipToHolder, startDate, endDate } = data;

    // Check if patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    // Check if insurance plan exists
    const plan = await this.prisma.insurancePlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException(`Insurance plan with ID ${planId} not found`);
    }

    // Check if patient already has this insurance plan
    const existingPlan = await this.prisma.patientInsurance.findFirst({
      where: {
        patientId,
        planId,
      },
    });

    if (existingPlan) {
      throw new ConflictException(`Patient already has this insurance plan`);
    }

    return this.prisma.patientInsurance.create({
      data: {
        patient: { connect: { id: patientId } },
        plan: { connect: { id: planId } },
        membershipNumber,
        primaryHolder,
        relationshipToHolder,
        startDate,
        endDate,
        status: 'ACTIVE',
      },
      include: {
        plan: {
          include: {
            provider: true,
          },
        },
      },
    });
  }

  async updateInsurancePlan(id: string, data: {
    membershipNumber?: string;
    primaryHolder?: boolean;
    relationshipToHolder?: string;
    startDate?: Date;
    endDate?: Date;
    status?: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  }): Promise<PatientInsurance> {
    // Check if insurance plan exists
    const insurancePlan = await this.prisma.patientInsurance.findUnique({
      where: { id },
    });

    if (!insurancePlan) {
      throw new NotFoundException(`Patient insurance with ID ${id} not found`);
    }

    return this.prisma.patientInsurance.update({
      where: { id },
      data,
      include: {
        plan: {
          include: {
            provider: true,
          },
        },
      },
    });
  }

  async removeInsurancePlan(id: string): Promise<PatientInsurance> {
    // Check if insurance plan exists
    const insurancePlan = await this.prisma.patientInsurance.findUnique({
      where: { id },
    });

    if (!insurancePlan) {
      throw new NotFoundException(`Patient insurance with ID ${id} not found`);
    }

    // Check if there are any claims for this insurance
    const claims = await this.prisma.insuranceClaim.findMany({
      where: { patientInsuranceId: id },
    });

    if (claims.length > 0) {
      throw new ConflictException(`Cannot remove insurance plan with existing claims`);
    }

    return this.prisma.patientInsurance.delete({
      where: { id },
      include: {
        plan: {
          include: {
            provider: true,
          },
        },
      },
    });
  }

  async getPatientMedicationHistory(id: string): Promise<any> {
    // Check if patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    // Get all sales for the patient
    const sales = await this.prisma.sale.findMany({
      where: { patientId: id },
      include: {
        saleItems: {
          include: {
            batch: {
              include: {
                product: true,
              },
            },
          },
        },
        prescription: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Extract medication history
    const medicationHistory = [];
    const productMap = new Map();

    sales.forEach(sale => {
      if (sale.paymentStatus !== 'CANCELLED') {
        sale.saleItems.forEach(item => {
          const product = item.batch.product;
          const date = sale.createdAt;
          
          // Group by product
          if (!productMap.has(product.id)) {
            productMap.set(product.id, {
              productId: product.id,
              productName: product.name,
              genericName: product.genericName,
              dosageForm: product.dosageForm,
              strength: product.strength,
              instances: [],
            });
          }
          
          productMap.get(product.id).instances.push({
            date,
            quantity: item.quantity,
            prescriptionId: sale.prescriptionId,
            saleId: sale.id,
          });
        });
      }
    });

    // Convert map to array and sort instances by date
    productMap.forEach(product => {
      product.instances.sort((a, b) => b.date.getTime() - a.date.getTime());
      medicationHistory.push(product);
    });

    return {
      patientId: id,
      patientName: patient.name,
      medicationHistory,
    };
  }
}
