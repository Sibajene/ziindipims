import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Product } from '.prisma/client';
import { join } from 'path';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProductWhereUniqueInput;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }): Promise<Product[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.product.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        supplier: true,
      },
    });
  }

  async findOne(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        supplier: true,
        batches: {
          include: {
            branch: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    // Check if product with barcode already exists if barcode is provided
    if (data.barcode) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { barcode: data.barcode },
      });

      if (existingProduct) {
        throw new ConflictException(`Product with barcode ${data.barcode} already exists`);
      }
    }

    const { pharmacy, supplier, supplierId, pharmacyId, ...rest } = data as any;

    const pharmacyIdToUse = pharmacy?.connect?.id || pharmacyId;
    const supplierIdToUse = supplier?.connect?.id || supplierId;

    if (!pharmacyIdToUse) {
      throw new Error('pharmacyId is required to create a product');
    }

    try {
      return await this.prisma.product.create({
        data: {
          ...rest,
          pharmacy: { connect: { id: pharmacyIdToUse } },
          supplier: supplierIdToUse ? { connect: { id: supplierIdToUse } } : undefined,
        },
        include: {
          supplier: true,
        },
      });
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // If updating barcode, check if it's already in use
    if (data.barcode && data.barcode !== product.barcode) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { barcode: data.barcode as string },
      });

      if (existingProduct) {
        throw new ConflictException(`Product with barcode ${data.barcode} already exists`);
      }
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        supplier: true,
      },
    });
  }

  async remove(id: string): Promise<Product> {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check if product has batches
    const batches = await this.prisma.batch.findMany({
      where: { productId: id },
    });

    if (batches.length > 0) {
      throw new ConflictException(`Cannot delete product with existing batches`);
    }

    return this.prisma.product.delete({
      where: { id },
      include: {
        supplier: true,
      },
    });
  }

  async getProductStock(id: string): Promise<any> {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Get all batches for the product
    const batches = await this.prisma.batch.findMany({
      where: { productId: id },
      include: {
        branch: true,
      },
    });

    // Calculate total stock
    const totalStock = batches.reduce((sum, batch) => sum + batch.quantity, 0);

    // Group by branch
    const stockByBranch = batches.reduce((acc, batch) => {
      const branchId = batch.branchId;
      if (!acc[branchId]) {
        acc[branchId] = {
          branchId,
          branchName: batch.branch.name,
          quantity: 0,
          batches: [],
        };
      }
      acc[branchId].quantity += batch.quantity;
      acc[branchId].batches.push({
        id: batch.id,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        quantity: batch.quantity,
        costPrice: batch.costPrice,
        sellingPrice: batch.sellingPrice,
      });
      return acc;
    }, {});

    return {
      productId: id,
      productName: product.name,
      totalStock,
      stockByBranch: Object.values(stockByBranch),
    };
  }

  async uploadProductImage(id: string, filename: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const imagePath = `/uploads/products/${filename}`;

    return this.prisma.product.update({
      where: { id },
      data: { imageUrl: imagePath },
      include: {
        supplier: true,
      },
    });
  }
}
