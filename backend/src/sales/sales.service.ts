import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Sale, SaleItem, Prisma, PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.SaleWhereInput;
    orderBy?: Prisma.SaleOrderByWithRelationInput;
  }): Promise<Sale[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.sale.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        branch: true,
        soldBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        patient: true,
        prescription: true,
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
    });
  }

  async findOne(id: string): Promise<Sale | null> {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        branch: true,
        soldBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        patient: true,
        prescription: true,
        saleItems: {
          include: {
            batch: {
              include: {
                product: true,
              },
            },
          },
        },
        insuranceClaim: true,
      },
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  async create(data: {
    branchId: string;
    soldById: string;
    customer?: string;
    patientId?: string;
    paymentMethod: PaymentMethod;
    paymentStatus?: PaymentStatus;
    prescriptionId?: string;
    items: Array<{
      batchId: string;
      quantity: number;
      unitPrice: number;
      discount?: number;
    }>;
    patientInsuranceId?: string;
  }): Promise<Sale> {
    const { branchId, soldById, customer, patientId, paymentMethod, paymentStatus, prescriptionId, items, patientInsuranceId } = data;

    // Validate branch
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    // Validate user
    const user = await this.prisma.user.findUnique({
      where: { id: soldById },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${soldById} not found`);
    }

    // Validate patient if provided
    if (patientId) {
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (!patient) {
        throw new NotFoundException(`Patient with ID ${patientId} not found`);
      }
    }

    // Validate prescription if provided
    if (prescriptionId) {
      const prescription = await this.prisma.prescription.findUnique({
        where: { id: prescriptionId },
      });

      if (!prescription) {
        throw new NotFoundException(`Prescription with ID ${prescriptionId} not found`);
      }

      if (prescription.status === 'FULFILLED') {
        throw new BadRequestException('Prescription has already been fulfilled');
      }

      if (prescription.status === 'CANCELED') {
        throw new BadRequestException('Prescription has been canceled');
      }
    }

    // Validate patient insurance if provided
    let patientInsurance = null;
    if (patientInsuranceId) {
      patientInsurance = await this.prisma.patientInsurance.findUnique({
        where: { id: patientInsuranceId },
        include: {
          plan: {
            include: {
              provider: true,
              coverageItems: true,
            },
          },
        },
      });

      if (!patientInsurance) {
        throw new NotFoundException(`Patient insurance with ID ${patientInsuranceId} not found`);
      }

      if (patientInsurance.status !== 'ACTIVE') {
        throw new BadRequestException('Patient insurance is not active');
      }

      if (patientInsurance.endDate && new Date(patientInsurance.endDate) < new Date()) {
        throw new BadRequestException('Patient insurance has expired');
      }

      if (!patientId || patientInsurance.patientId !== patientId) {
        throw new BadRequestException('Patient insurance does not belong to the specified patient');
      }
    }

    // Process the sale
    return this.prisma.$transaction(async (prisma) => {
      // Calculate total
      let total = 0;
      let patientPaid = 0;
      let insurancePaid = 0;

      // Validate items and calculate totals
      for (const item of items) {
        // Validate batch
        const batch = await prisma.batch.findUnique({
          where: { id: item.batchId },
          include: {
            product: true,
          },
        });

        if (!batch) {
          throw new NotFoundException(`Batch with ID ${item.batchId} not found`);
        }

        if (batch.branchId !== branchId) {
          throw new BadRequestException(`Batch does not belong to the specified branch`);
        }

        if (batch.quantity < item.quantity) {
          throw new BadRequestException(`Insufficient quantity in batch ${batch.batchNumber}`);
        }

        // Check if product requires prescription
        if (batch.product.requiresPrescription && !prescriptionId) {
          throw new BadRequestException(`Product ${batch.product.name} requires a prescription`);
        }

        // Calculate item total
        const itemDiscount = item.discount || 0;
        const itemTotal = (item.unitPrice * item.quantity) - itemDiscount;
        total += itemTotal;

        // Calculate insurance coverage if applicable
        if (patientInsurance) {
          // Find coverage for this product
          const productCoverage = patientInsurance.plan.coverageItems.find(
            coverage => coverage.productId === batch.product.id
          );

          // Find coverage for this product category
          const categoryCoverage = patientInsurance.plan.coverageItems.find(
            coverage => coverage.category === batch.product.category
          );

          // Determine coverage percentage
          let coveragePercentage = patientInsurance.plan.coveragePercentage;
          
          if (productCoverage && productCoverage.coveragePercentage !== null) {
            coveragePercentage = productCoverage.coveragePercentage;
          } else if (categoryCoverage && categoryCoverage.coveragePercentage !== null) {
            coveragePercentage = categoryCoverage.coveragePercentage;
          }

          // Calculate insurance coverage
          const insuranceCoverage = (itemTotal * coveragePercentage) / 100;
          insurancePaid += insuranceCoverage;
        }
      }

      // If using insurance, calculate patient's portion
      if (patientInsurance) {
        patientPaid = total - insurancePaid;
      } else {
        patientPaid = total;
      }

      // Generate invoice number
      const invoiceNumber = `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      // Create the sale
      const sale = await prisma.sale.create({
        data: {
          invoiceNumber,
          branch: { connect: { id: branchId } },
          soldBy: { connect: { id: soldById } },
          customer,
          patient: patientId ? { connect: { id: patientId } } : undefined,
          total,
          paymentMethod,
          paymentStatus: paymentStatus || 'PAID',
          prescription: prescriptionId ? { connect: { id: prescriptionId } } : undefined,
          patientInsuranceId,
          patientPaid,
          insurancePaid: patientInsurance ? insurancePaid : null,
          saleItems: {
            create: await Promise.all(items.map(async (item) => {
              const batch = await prisma.batch.findUnique({
                where: { id: item.batchId },
                include: { product: true },
              });

              // Calculate item total
              const itemDiscount = item.discount || 0;
              const itemTotal = (item.unitPrice * item.quantity) - itemDiscount;

              // Calculate insurance coverage if applicable
              let insuranceCoverage = null;
              if (patientInsurance) {
                // Find coverage for this product
                const productCoverage = patientInsurance.plan.coverageItems.find(
                  coverage => coverage.productId === batch.product.id
                );

                // Find coverage for this product category
                const categoryCoverage = patientInsurance.plan.coverageItems.find(
                  coverage => coverage.category === batch.product.category
                );

                // Determine coverage percentage
                let coveragePercentage = patientInsurance.plan.coveragePercentage;
                if (productCoverage && productCoverage.coveragePercentage !== null) {
                    coveragePercentage = productCoverage.coveragePercentage;
                  } else if (categoryCoverage && categoryCoverage.coveragePercentage !== null) {
                    coveragePercentage = categoryCoverage.coveragePercentage;
                  }
  
                  // Calculate insurance coverage
                  insuranceCoverage = (itemTotal * coveragePercentage) / 100;
                }
  
                return {
                  batch: { connect: { id: item.batchId } },
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  discount: item.discount || 0,
                  total: itemTotal,
                  insuranceCoverage,
                };
              })),
            },
          },
          include: {
            branch: true,
            soldBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            patient: true,
            prescription: true,
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
        });
  
        // Update batch quantities
        for (const item of items) {
          const batch = await prisma.batch.findUnique({
            where: { id: item.batchId },
          });
  
          await prisma.batch.update({
            where: { id: item.batchId },
            data: { quantity: batch.quantity - item.quantity },
          });
        }
  
        // Update prescription status if provided
        if (prescriptionId) {
          const prescription = await prisma.prescription.findUnique({
            where: { id: prescriptionId },
            include: {
              items: true,
            },
          });
  
          // Update dispensed quantities for prescription items
          for (const saleItem of sale.saleItems) {
            const prescriptionItem = prescription.items.find(
              item => item.productId === saleItem.batch.product.id
            );
  
            if (prescriptionItem) {
              await prisma.prescriptionItem.update({
                where: { id: prescriptionItem.id },
                data: { dispensed: prescriptionItem.dispensed + saleItem.quantity },
              });
            }
          }
  
          // Check if all prescription items are fully dispensed
          const updatedPrescription = await prisma.prescription.findUnique({
            where: { id: prescriptionId },
            include: {
              items: true,
            },
          });
  
          const allItemsFulfilled = updatedPrescription.items.every(
            item => item.dispensed >= item.quantity
          );
  
          const anyItemFulfilled = updatedPrescription.items.some(
            item => item.dispensed > 0
          );
  
          // Update prescription status
          if (allItemsFulfilled) {
            await prisma.prescription.update({
              where: { id: prescriptionId },
              data: { status: 'FULFILLED' },
            });
          } else if (anyItemFulfilled) {
            await prisma.prescription.update({
              where: { id: prescriptionId },
              data: { status: 'PARTIALLY_FULFILLED' },
            });
          }
        }
  
        // Create insurance claim if using insurance
        if (patientInsurance && insurancePaid > 0) {
          // Generate claim number
          const claimNumber = `CLM-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  
          const claim = await prisma.insuranceClaim.create({
            data: {
              claimNumber,
              sale: { connect: { id: sale.id } },
              provider: { connect: { id: patientInsurance.plan.providerId } },
              patientInsurance: { connect: { id: patientInsuranceId } },
              totalAmount: total,
              coveredAmount: insurancePaid,
              patientResponsibility: patientPaid,
              status: 'SUBMITTED',
              claimItems: {
                create: sale.saleItems.map(saleItem => {
                  // Calculate coverage for this item
                  let coveredAmount = 0;
                  if (saleItem.insuranceCoverage) {
                    coveredAmount = saleItem.insuranceCoverage;
                  }
  
                  return {
                    saleItem: { connect: { id: saleItem.id } },
                    approvedQuantity: saleItem.quantity,
                    claimedAmount: coveredAmount,
                  };
                }),
              },
            },
          });
        }
  
        return sale;
      });
    }
  
    async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Sale> {
      // Check if sale exists
      const sale = await this.prisma.sale.findUnique({
        where: { id },
      });
  
      if (!sale) {
        throw new NotFoundException(`Sale with ID ${id} not found`);
      }
  
      return this.prisma.sale.update({
        where: { id },
        data: { paymentStatus },
        include: {
          branch: true,
          soldBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          patient: true,
          prescription: true,
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
      });
    }
  
    async getSalesByDateRange(startDate: Date, endDate: Date, branchId?: string): Promise<any> {
      const where: any = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };
  
      if (branchId) {
        where.branchId = branchId;
      }
  
      const sales = await this.prisma.sale.findMany({
        where,
        include: {
          branch: true,
          soldBy: {
            select: {
              id: true,
              name: true,
            },
          },
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
          createdAt: 'asc',
        },
      });
  
      // Calculate summary statistics
      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
      const totalItems = sales.reduce((sum, sale) => sum + sale.saleItems.length, 0);
      const totalQuantity = sales.reduce(
        (sum, sale) => sum + sale.saleItems.reduce((itemSum, item) => itemSum + item.quantity, 0),
        0
      );
  
      // Group sales by payment method
      const salesByPaymentMethod = sales.reduce((acc, sale) => {
        const method = sale.paymentMethod;
        if (!acc[method]) {
          acc[method] = {
            count: 0,
            total: 0,
          };
        }
        acc[method].count += 1;
        acc[method].total += sale.total;
        return acc;
      }, {});
  
      // Group sales by day
      const salesByDay = sales.reduce((acc, sale) => {
        const day = sale.createdAt.toISOString().split('T')[0];
        if (!acc[day]) {
          acc[day] = {
            count: 0,
            total: 0,
          };
        }
        acc[day].count += 1;
        acc[day].total += sale.total;
        return acc;
      }, {});
  
      // Get top selling products
      const productSales = {};
      sales.forEach(sale => {
        sale.saleItems.forEach(item => {
          const productId = item.batch.product.id;
          const productName = item.batch.product.name;
          
          if (!productSales[productId]) {
            productSales[productId] = {
              id: productId,
              name: productName,
              quantity: 0,
              revenue: 0,
            };
          }
          
          productSales[productId].quantity += item.quantity;
          productSales[productId].revenue += item.total;
        });
      });
  
      const topProducts = Object.values(productSales)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 10);
  
      return {
        summary: {
          totalSales,
          totalRevenue,
          totalItems,
          totalQuantity,
          startDate,
          endDate,
        },
        salesByPaymentMethod,
        salesByDay,
        topProducts,
        sales,
      };
    }
  
    async cancelSale(id: string): Promise<Sale> {
      // Check if sale exists
      const sale = await this.prisma.sale.findUnique({
        where: { id },
        include: {
          saleItems: {
            include: {
              batch: true,
            },
          },
          prescription: true,
          insuranceClaim: true,
        },
      });
  
      if (!sale) {
        throw new NotFoundException(`Sale with ID ${id} not found`);
      }
  
      if (sale.paymentStatus === 'CANCELLED') {
        throw new BadRequestException('Sale is already cancelled');
      }
  
      // Process the cancellation
      return this.prisma.$transaction(async (prisma) => {
        // Restore batch quantities
        for (const item of sale.saleItems) {
          await prisma.batch.update({
            where: { id: item.batchId },
            data: { quantity: item.batch.quantity + item.quantity },
          });
        }
  
        // Update prescription status if applicable
        if (sale.prescription) {
          // Get all prescription items
          const prescriptionItems = await prisma.prescriptionItem.findMany({
            where: { prescriptionId: sale.prescription.id },
          });
  
          // Update dispensed quantities
          for (const saleItem of sale.saleItems) {
            const prescriptionItem = prescriptionItems.find(
              item => item.productId === saleItem.batch.productId
            );
  
            if (prescriptionItem) {
              await prisma.prescriptionItem.update({
                where: { id: prescriptionItem.id },
                data: { dispensed: Math.max(0, prescriptionItem.dispensed - saleItem.quantity) },
              });
            }
          }
  
          // Update prescription status
          const updatedItems = await prisma.prescriptionItem.findMany({
            where: { prescriptionId: sale.prescription.id },
          });
  
          const allItemsZero = updatedItems.every(item => item.dispensed === 0);
          const anyItemPartial = updatedItems.some(item => item.dispensed > 0 && item.dispensed < item.quantity);
  
          if (allItemsZero) {
            await prisma.prescription.update({
              where: { id: sale.prescription.id },
              data: { status: 'PENDING' },
            });
          } else if (anyItemPartial) {
            await prisma.prescription.update({
              where: { id: sale.prescription.id },
              data: { status: 'PARTIALLY_FULFILLED' },
            });
          }
        }
  
        // Cancel insurance claim if applicable
        if (sale.insuranceClaim) {
          await prisma.insuranceClaim.update({
            where: { id: sale.insuranceClaim.id },
            data: { status: 'CANCELLED' },
          });
        }
  
        // Update sale status
        return prisma.sale.update({
          where: { id },
          data: { paymentStatus: 'CANCELLED' },
          include: {
            branch: true,
            soldBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            patient: true,
            prescription: true,
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
        });
      });
    }
  }
  
