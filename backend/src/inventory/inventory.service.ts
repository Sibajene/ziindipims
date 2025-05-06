import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Batch, Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAllBatches(params: {
    skip?: number;
    take?: number;
    where?: Prisma.BatchWhereInput;
    orderBy?: Prisma.BatchOrderByWithRelationInput;
  }): Promise<Batch[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.batch.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        product: true,
        branch: true,
      },
    });
  }

  async adjustStock(adjustmentData: { batchId: string; quantity: number; reason?: string; adjustedBy?: string }): Promise<Batch> {
    const { batchId, quantity, reason, adjustedBy } = adjustmentData;

    // Find the batch to adjust
    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batchId} not found`);
    }

    // Calculate new quantity
    const newQuantity = batch.quantity + quantity;

    if (newQuantity < 0) {
      throw new BadRequestException('Adjusted quantity cannot be negative');
    }

    // Update the batch quantity
    const updatedBatch = await this.prisma.batch.update({
      where: { id: batchId },
      data: {
        quantity: newQuantity,
      },
      include: {
        product: true,
        branch: true,
      },
    });

    // Optionally, log the adjustment reason and user (this can be extended to a separate audit table)
    // For now, just console log
    console.log(`Stock adjusted for batch ${batchId} by ${adjustedBy || 'unknown'}: ${quantity} units. Reason: ${reason || 'No reason provided'}`);

    return updatedBatch;
  }

  async findBatchById(id: string): Promise<Batch | null> {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: {
        product: true,
        branch: true,
      },
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    return batch;
  }

  async createBatch(data: Prisma.BatchCreateInput): Promise<Batch> {
    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: data.product.connect.id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${data.product.connect.id} not found`);
    }

    // Validate branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: data.branch.connect.id },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${data.branch.connect.id} not found`);
    }

    // Validate quantity is positive
    if (data.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    return this.prisma.batch.create({
      data,
      include: {
        product: true,
        branch: true,
      },
    });
  }

  async updateBatch(id: string, data: Prisma.BatchUpdateInput): Promise<Batch> {
    // Check if batch exists
    const batch = await this.prisma.batch.findUnique({
      where: { id },
    });

    if (!batch) {
        throw new NotFoundException(`Batch with ID ${id} not found`);
      }
  
      // Validate quantity is positive if updating
      if (typeof data.quantity === 'number' && data.quantity < 0) {
        throw new BadRequestException('Quantity cannot be negative');
      }
  
      return this.prisma.batch.update({
        where: { id },
        data,
        include: {
          product: true,
          branch: true,
        },
      });
    }
  
    async deleteBatch(id: string): Promise<Batch> {
      // Check if batch exists
      const batch = await this.prisma.batch.findUnique({
        where: { id },
      });
  
      if (!batch) {
        throw new NotFoundException(`Batch with ID ${id} not found`);
      }
  
      // Check if batch is used in any sales
      const saleItems = await this.prisma.saleItem.findMany({
        where: { batchId: id },
      });
  
      if (saleItems.length > 0) {
        throw new ConflictException(`Cannot delete batch that is used in sales`);
      }
  
      return this.prisma.batch.delete({
        where: { id },
        include: {
          product: true,
          branch: true,
        },
      });
    }
  
    async getExpiringBatches(daysThreshold: number = 90): Promise<Batch[]> {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
  
      return this.prisma.batch.findMany({
        where: {
          expiryDate: {
            lte: thresholdDate,
          },
          quantity: {
            gt: 0,
          },
        },
        include: {
          product: true,
          branch: true,
        },
        orderBy: {
          expiryDate: 'asc',
        },
      });
    }
  
    async getLowStockProducts(branchId?: string): Promise<any[]> {
      // Get all products with their batches
      const products = await this.prisma.product.findMany({
        include: {
          batches: {
            where: branchId ? { branchId } : {},
          },
        },
      });
  
      // Filter products that are below reorder level
      const lowStockProducts = products.filter(product => {
        const totalQuantity = product.batches.reduce((sum, batch) => sum + batch.quantity, 0);
        return totalQuantity < product.reorderLevel;
      });
  
      // Format the response
      return lowStockProducts.map(product => {
        const totalQuantity = product.batches.reduce((sum, batch) => sum + batch.quantity, 0);
        return {
          id: product.id,
          name: product.name,
          genericName: product.genericName,
          reorderLevel: product.reorderLevel,
          currentStock: totalQuantity,
          deficit: product.reorderLevel - totalQuantity,
          batches: product.batches,
        };
      });
    }
  
    async transferStock(data: {
      fromBranchId: string;
      toBranchId: string;
      items: Array<{
        productId: string;
        quantity: number;
        batchId?: string;
      }>;
      notes?: string;
      requestedBy: string;
    }): Promise<any> {
      const { fromBranchId, toBranchId, items, notes, requestedBy } = data;
  
      // Validate branches
      const fromBranch = await this.prisma.branch.findUnique({
        where: { id: fromBranchId },
      });
  
      if (!fromBranch) {
        throw new NotFoundException(`Source branch with ID ${fromBranchId} not found`);
      }
  
      const toBranch = await this.prisma.branch.findUnique({
        where: { id: toBranchId },
      });
  
      if (!toBranch) {
        throw new NotFoundException(`Destination branch with ID ${toBranchId} not found`);
      }
  
      if (fromBranchId === toBranchId) {
        throw new BadRequestException('Cannot transfer to the same branch');
      }
  
      // Create the transfer
      return this.prisma.$transaction(async (prisma) => {
        // Create the transfer record
        const transfer = await prisma.stockTransfer.create({
          data: {
            fromBranch: { connect: { id: fromBranchId } },
            toBranch: { connect: { id: toBranchId } },
            status: 'PENDING',
            requestedBy,
            notes,
            items: {
              create: await Promise.all(items.map(async (item) => {
                // Validate product
                const product = await prisma.product.findUnique({
                  where: { id: item.productId },
                });
  
                if (!product) {
                  throw new NotFoundException(`Product with ID ${item.productId} not found`);
                }
  
                // If batchId is provided, validate it
                if (item.batchId) {
                  const batch = await prisma.batch.findUnique({
                    where: { id: item.batchId },
                  });
  
                  if (!batch) {
                    throw new NotFoundException(`Batch with ID ${item.batchId} not found`);
                  }
  
                  if (batch.branchId !== fromBranchId) {
                    throw new BadRequestException(`Batch does not belong to the source branch`);
                  }
  
                  if (batch.quantity < item.quantity) {
                    throw new BadRequestException(`Insufficient quantity in batch ${batch.batchNumber}`);
                  }
                } else {
                  // Check if there's enough stock in the branch
                  const batches = await prisma.batch.findMany({
                    where: {
                      productId: item.productId,
                      branchId: fromBranchId,
                      quantity: { gt: 0 },
                    },
                    orderBy: { expiryDate: 'asc' },
                  });
  
                  const totalQuantity = batches.reduce((sum, batch) => sum + batch.quantity, 0);
  
                  if (totalQuantity < item.quantity) {
                    throw new BadRequestException(`Insufficient quantity of product ${product.name} in source branch`);
                  }
                }
  
                return {
                  product: { connect: { id: item.productId } },
                  quantity: item.quantity,
                  batchNumber: item.batchId ? (await prisma.batch.findUnique({ where: { id: item.batchId } })).batchNumber : undefined,
                };
              })),
            },
          },
          include: {
            fromBranch: true,
            toBranch: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        });
  
        return transfer;
      });
    }
  
    async approveTransfer(id: string, approvedBy: string): Promise<any> {
      // Check if transfer exists
      const transfer = await this.prisma.stockTransfer.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
  
      if (!transfer) {
        throw new NotFoundException(`Transfer with ID ${id} not found`);
      }
  
      if (transfer.status !== 'PENDING') {
        throw new BadRequestException(`Transfer is not in PENDING status`);
      }
  
      // Update the transfer status
      return this.prisma.$transaction(async (prisma) => {
        // Update transfer status
        const updatedTransfer = await prisma.stockTransfer.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approvedBy,
          },
          include: {
            fromBranch: true,
            toBranch: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        });
  
        return updatedTransfer;
      });
    }
  
    async completeTransfer(id: string): Promise<any> {
      // Check if transfer exists
      const transfer = await this.prisma.stockTransfer.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          fromBranch: true,
          toBranch: true,
        },
      });
  
      if (!transfer) {
        throw new NotFoundException(`Transfer with ID ${id} not found`);
      }
  
      if (transfer.status !== 'APPROVED') {
        throw new BadRequestException(`Transfer must be in APPROVED status to complete`);
      }
  
      // Process the transfer
      return this.prisma.$transaction(async (prisma) => {
        // For each item in the transfer
        for (const item of transfer.items) {
          // If a specific batch was specified
          if (item.batchNumber) {
            // Find the batch
            const sourceBatch = await prisma.batch.findFirst({
              where: {
                productId: item.productId,
                branchId: transfer.fromBranchId,
                batchNumber: item.batchNumber,
              },
            });
  
            if (!sourceBatch || sourceBatch.quantity < item.quantity) {
              throw new BadRequestException(`Insufficient quantity in batch ${item.batchNumber}`);
            }
  
            // Reduce quantity in source batch
            await prisma.batch.update({
              where: { id: sourceBatch.id },
              data: { quantity: sourceBatch.quantity - item.quantity },
            });
  
            // Check if batch already exists in destination branch
            const existingBatch = await prisma.batch.findFirst({
              where: {
                productId: item.productId,
                branchId: transfer.toBranchId,
                batchNumber: sourceBatch.batchNumber,
                expiryDate: sourceBatch.expiryDate,
              },
            });
  
            if (existingBatch) {
              // Update existing batch
              await prisma.batch.update({
                where: { id: existingBatch.id },
                data: { quantity: existingBatch.quantity + item.quantity },
              });
            } else {
              // Create new batch in destination
              await prisma.batch.create({
                data: {
                  product: { connect: { id: item.productId } },
                  branch: { connect: { id: transfer.toBranchId } },
                  batchNumber: sourceBatch.batchNumber,
                  expiryDate: sourceBatch.expiryDate,
                  quantity: item.quantity,
                  costPrice: sourceBatch.costPrice,
                  sellingPrice: sourceBatch.sellingPrice,
                },
              });
            }
          } else {
            // No specific batch, use FIFO
            let remainingQuantity = item.quantity;
            
            // Get batches ordered by expiry date (FIFO)
            const batches = await prisma.batch.findMany({
              where: {
                productId: item.productId,
                branchId: transfer.fromBranchId,
                quantity: { gt: 0 },
              },
              orderBy: { expiryDate: 'asc' },
            });
  
            for (const sourceBatch of batches) {
              if (remainingQuantity <= 0) break;
  
              const quantityToTransfer = Math.min(remainingQuantity, sourceBatch.quantity);
              
              // Reduce quantity in source batch
              await prisma.batch.update({
                where: { id: sourceBatch.id },
                data: { quantity: sourceBatch.quantity - quantityToTransfer },
              });
  
              // Check if batch already exists in destination branch
              const existingBatch = await prisma.batch.findFirst({
                where: {
                  productId: item.productId,
                  branchId: transfer.toBranchId,
                  batchNumber: sourceBatch.batchNumber,
                  expiryDate: sourceBatch.expiryDate,
                },
              });
  
              if (existingBatch) {
                // Update existing batch
                await prisma.batch.update({
                  where: { id: existingBatch.id },
                  data: { quantity: existingBatch.quantity + quantityToTransfer },
                });
              } else {
                // Create new batch in destination
                await prisma.batch.create({
                  data: {
                    product: { connect: { id: item.productId } },
                    branch: { connect: { id: transfer.toBranchId } },
                    batchNumber: sourceBatch.batchNumber,
                    expiryDate: sourceBatch.expiryDate,
                    quantity: quantityToTransfer,
                    costPrice: sourceBatch.costPrice,
                    sellingPrice: sourceBatch.sellingPrice,
                  },
                });
              }
  
              remainingQuantity -= quantityToTransfer;
            }
  
            if (remainingQuantity > 0) {
              throw new BadRequestException(`Insufficient quantity of product ${item.product.name} in source branch`);
            }
          }
        }
  
        // Update transfer status
        const completedTransfer = await prisma.stockTransfer.update({
          where: { id },
          data: {
            status: 'COMPLETED',
          },
          include: {
            fromBranch: true,
            toBranch: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        });
  
        return completedTransfer;
      });
    }
  }
  
