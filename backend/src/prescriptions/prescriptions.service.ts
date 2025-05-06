import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  Prescription, 
  PrescriptionItem, 
  PrescriptionStatus, 
  Prisma 
} from '@prisma/client';
import { 
  CreatePrescriptionDto, 
  UpdatePrescriptionDto, 
  AddPrescriptionItemDto, 
  UpdatePrescriptionItemDto,
  DispenseItemDto
} from './dto/prescriptions.dto';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PrescriptionWhereInput;
    orderBy?: Prisma.PrescriptionOrderByWithRelationInput;
  }): Promise<Prescription[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.prescription.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        branch: true,
        patient: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<Prescription | null> {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        branch: true,
        patient: true,
        items: {
          include: {
            product: true,
          },
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
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    return prescription;
  }

  async create(data: {
    branchId: string;
    patientId: string;
    issuedBy: string;
    doctorName?: string;
    hospitalName?: string;
    diagnosis?: string;
    externalId?: string;
    validUntil?: Date;
    items: Array<{
      productId: string;
      dosage: string;
      frequency?: string;
      duration?: string;
      quantity: number;
      instructions?: string;
    }>;
    createdBy?: string;
  }): Promise<Prescription> {
    const { branchId, patientId, issuedBy, doctorName, hospitalName, diagnosis, externalId, validUntil, items, createdBy } = data;

    // Validate branch
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    // Validate patient
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    // Validate products
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }
    }

    // Generate prescription number
    const prescriptionNumber = `RX-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    return this.prisma.prescription.create({
      data: {
        prescriptionNumber,
        branch: { connect: { id: branchId } },
        patient: { connect: { id: patientId } },
        issuedBy,
        doctorName,
        hospitalName,
        diagnosis,
        externalId,
        status: 'PENDING',
        validUntil,
        createdBy,
        items: {
          create: items.map(item => ({
            product: { connect: { id: item.productId } },
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantity: item.quantity,
            instructions: item.instructions,
            dispensed: 0,
          })),
        },
      },
      include: {
        branch: true,
        patient: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async update(id: string, data: {
    doctorName?: string;
    hospitalName?: string;
    diagnosis?: string;
    validUntil?: Date;
    status?: PrescriptionStatus;
    updatedBy?: string;
  }): Promise<Prescription> {
    // Check if prescription exists
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        sales: true,
      },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    // If prescription has sales and trying to change status to CANCELED
    if (prescription.sales.length > 0 && data.status === 'CANCELED') {
      throw new BadRequestException('Cannot cancel a prescription that has been used in sales');
    }

    return this.prisma.prescription.update({
      where: { id },
      data,
      include: {
        branch: true,
        patient: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async addItem(prescriptionId: string, data: {
    productId: string;
    dosage: string;
    frequency?: string;
    duration?: string;
    quantity: number;
    instructions?: string;
  }): Promise<PrescriptionItem> {
    const { productId, dosage, frequency, duration, quantity, instructions } = data;

    // Check if prescription exists
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        sales: true,
      },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${prescriptionId} not found`);
    }

    // Cannot modify if prescription is fulfilled or canceled
    if (prescription.status === 'FULFILLED' || prescription.status === 'CANCELED') {
      throw new BadRequestException(`Cannot modify a ${prescription.status.toLowerCase()} prescription`);
    }

    // Validate product
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check if product already exists in prescription
    const existingItem = await this.prisma.prescriptionItem.findFirst({
      where: {
        prescriptionId,
        productId,
      },
    });

    if (existingItem) {
      throw new BadRequestException(`Product already exists in this prescription`);
    }

    return this.prisma.prescriptionItem.create({
      data: {
        prescription: { connect: { id: prescriptionId } },
        product: { connect: { id: productId } },
        dosage,
        frequency,
        duration,
        quantity,
        instructions,
        dispensed: 0,
      },
      include: {
        product: true,
      },
    });
  }

  async updateItem(id: string, data: {
    dosage?: string;
    frequency?: string;
    duration?: string;
    quantity?: number;
    instructions?: string;
  }): Promise<PrescriptionItem> {
    // Check if item exists
    const item = await this.prisma.prescriptionItem.findUnique({
      where: { id },
      include: {
        prescription: {
          include: {
            sales: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Prescription item with ID ${id} not found`);
    }

    // Cannot modify if prescription is fulfilled or canceled
    if (item.prescription.status === 'FULFILLED' || item.prescription.status === 'CANCELED') {
      throw new BadRequestException(`Cannot modify an item in a ${item.prescription.status.toLowerCase()} prescription`);
    }

    // Cannot reduce quantity below what has been dispensed
    if (data.quantity !== undefined && data.quantity < item.dispensed) {
      throw new BadRequestException(`Cannot reduce quantity below what has been dispensed (${item.dispensed})`);
    }

    return this.prisma.prescriptionItem.update({
      where: { id },
      data,
      include: {
        product: true,
      },
    });
  }

  async removeItem(id: string): Promise<PrescriptionItem> {
    // Check if item exists
    const item = await this.prisma.prescriptionItem.findUnique({
      where: { id },
      include: {
        prescription: {
          include: {
            sales: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Prescription item with ID ${id} not found`);
    }

    // Cannot remove if prescription is fulfilled or canceled
    if (item.prescription.status === 'FULFILLED' || item.prescription.status === 'CANCELED') {
      throw new BadRequestException(`Cannot remove an item from a ${item.prescription.status.toLowerCase()} prescription`);
    }

    // Cannot remove if item has been dispensed
    if (item.dispensed > 0) {
      throw new BadRequestException(`Cannot remove an item that has been dispensed`);
    }

    return this.prisma.prescriptionItem.delete({
      where: { id },
      include: {
        product: true,
      },
    });
  }

  async cancelPrescription(id: string): Promise<Prescription> {
    // Check if prescription exists
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        sales: true,
      },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    // Cannot cancel if prescription has sales
    if (prescription.sales.length > 0) {
      throw new BadRequestException('Cannot cancel a prescription that has been used in sales');
    }

    return this.prisma.prescription.update({
      where: { id },
      data: { status: 'CANCELED' },
      include: {
        branch: true,
        patient: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async dispensePrescriptionItems(prescriptionId: string, items: DispenseItemDto[]): Promise<Prescription> {
    // First, check if the prescription exists and is not canceled
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        items: true,
      },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${prescriptionId} not found`);
    }

    if (prescription.status === PrescriptionStatus.CANCELED) {
      throw new BadRequestException('Cannot dispense items from a canceled prescription');
    }

    // Process each item to be dispensed
    const updatePromises = items.map(async (dispenseItem) => {
      // Find the prescription item
      const prescriptionItem = prescription.items.find(item => item.id === dispenseItem.itemId);
      
      if (!prescriptionItem) {
        throw new NotFoundException(`Prescription item with ID ${dispenseItem.itemId} not found`);
      }

      // Calculate the new dispensed quantity
      const currentDispensed = prescriptionItem.dispensed || 0;
      const newDispensed = currentDispensed + dispenseItem.quantityToDispense;
      
      // Ensure we're not dispensing more than prescribed
      if (newDispensed > prescriptionItem.quantity) {
        throw new BadRequestException(
          `Cannot dispense more than prescribed quantity for item ${dispenseItem.itemId}`
        );
      }

      // Update the prescription item
      return this.prisma.prescriptionItem.update({
        where: { id: dispenseItem.itemId },
        data: {
          dispensed: newDispensed,
          // If batch ID is provided, record it
          ...(dispenseItem.batchId && { batchId: dispenseItem.batchId }),
          // If notes are provided, update them
          ...(dispenseItem.notes && { notes: dispenseItem.notes }),
        },
      });
    });

    // Execute all updates
    await Promise.all(updatePromises);

    // Determine the new prescription status
    let newStatus: PrescriptionStatus = PrescriptionStatus.PENDING;
  
    // Fetch the updated prescription items to check status
    const updatedPrescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        items: true,
      },
    });

    // Check if all items are fully dispensed
    const allItemsDispensed = updatedPrescription.items.every(
      item => (item.dispensed || 0) >= item.quantity
    );

    // Check if some items are partially dispensed
    const someItemsDispensed = updatedPrescription.items.some(
      item => (item.dispensed || 0) > 0
    );

    if (allItemsDispensed) {
      newStatus = PrescriptionStatus.FULFILLED;
    } else if (someItemsDispensed) {
      newStatus = PrescriptionStatus.PARTIALLY_FULFILLED;
    }

    // Update the prescription status
    return this.prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }}
