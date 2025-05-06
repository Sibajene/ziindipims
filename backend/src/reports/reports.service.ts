import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // Implement report methods here
  async getSalesReport(startDate: Date, endDate: Date, branchId?: string) {
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

    return sales;
  }
}
