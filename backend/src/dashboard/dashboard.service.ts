import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(pharmacyId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalSalesResult = await this.prisma.sale.aggregate({
      where: {
        branch: {
          pharmacyId,
        },
      },
      _sum: {
        total: true,
      },
    });
    const totalSales = totalSalesResult._sum.total || 0;

    const todaySalesResult = await this.prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: today,
        },
        branch: {
          pharmacyId,
        },
      },
      _sum: {
        total: true,
      },
    });
    const todaySales = todaySalesResult._sum.total || 0;

    const totalProducts = await this.prisma.product.count({
      where: {
        pharmacyId,
      },
    });

    const lowStockProducts = await this.prisma.batch.count({
      where: {
        quantity: {
          lte: 10,
        },
        branch: {
          pharmacyId,
        },
      },
    });

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringProducts = await this.prisma.batch.count({
      where: {
        expiryDate: {
          gte: today,
          lte: thirtyDaysFromNow,
        },
        branch: {
          pharmacyId,
        },
      },
    });

    const pendingPrescriptions = await this.prisma.prescription.count({
      where: {
        status: 'PENDING',
        branch: {
          pharmacyId,
        },
      },
    });

    const pendingInsuranceClaims = await this.prisma.insuranceClaim.count({
      where: {
        status: 'SUBMITTED',
        sale: {
          branch: {
            pharmacyId,
          },
        },
      },
    });

    const pendingTransfers = await this.prisma.stockTransfer.count({
      where: {
        status: 'PENDING',
        fromBranch: {
          pharmacyId,
        },
      },
    });

    const activePatients = await this.prisma.patient.count({
      where:{
        deletedAt: null,
        sales: {
          some: {
            branch: {
              pharmacyId,
            },
          },
        },
      },
    });

    // Calculate salesTrend for last 7 days
    const salesTrendRaw = await this.prisma.sale.groupBy({
      by: ['createdAt'],
      _sum: {
        total: true,
      },
      where: {
        createdAt: {
          gte: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000), // 7 days ago
        },
        branch: {
          pharmacyId,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Format salesTrend data to day names and amounts
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayName = dayNames[date.getDay()];
      const saleForDay = salesTrendRaw.find(s => s.createdAt.toDateString() === date.toDateString());
      salesTrend.push({
        day: dayName,
        amount: saleForDay?._sum?.total || 0,
      });
    }

    // Calculate branchPerformance
    // Assuming branches and sales have relations, aggregate sales by branch
    const branches = await this.prisma.branch.findMany({
      where: {
        pharmacyId,
      },
      include: {
        users: true,
      },
    });

    const branchPerformance = [];
    for (const branch of branches) {
      const branchSalesResult = await this.prisma.sale.aggregate({
        where: {
          branchId: branch.id,
        },
        _sum: {
          total: true,
        },
      });
      const branchSales = branchSalesResult._sum.total || 0;

      // Calculate trend as percentage change compared to previous period (mocked as 0 for now)
      const trend = 0; // Placeholder, can be improved with real trend calculation

      branchPerformance.push({
        name: branch.name,
        location: `${branch.users.length} staff`,
        sales: branchSales,
        trend,
      });
    }

    // New method to get inventory alerts
    const lowStockProductsData = await this.prisma.product.findMany({
      where: {
        pharmacyId,
      },
      include: {
        batches: {
          where: {
            quantity: {
              gt: 0,
            },
          },
        },
      },
    });

    const lowStockAlerts = lowStockProductsData
      .map(product => {
        const totalQuantity = product.batches.reduce((sum, batch) => sum + batch.quantity, 0);
        if (totalQuantity < product.reorderLevel) {
          return {
            id: product.id,
            name: product.name,
            type: 'Low Stock',
            count: product.reorderLevel - totalQuantity,
            status: 'critical',
          };
        }
        return null;
      })
      .filter(alert => alert !== null);

    const thirtyDaysFromNowForBatches = new Date();
    thirtyDaysFromNowForBatches.setDate(thirtyDaysFromNowForBatches.getDate() + 30);

    const expiringBatches = await this.prisma.batch.findMany({
      where: {
        expiryDate: {
          gte: new Date(),
          lte: thirtyDaysFromNowForBatches,
        },
        quantity: {
          gt: 0,
        },
        branch: {
          pharmacyId,
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });

    const expiringAlerts = expiringBatches.map(batch => ({
      id: batch.id,
      name: batch.product.name,
      type: 'Expiring',
      count: Math.ceil((batch.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      status: 'warning',
    }));

    const inventoryAlerts = [...lowStockAlerts, ...expiringAlerts];

    return {
      totalSales,
      todaySales,
      totalProducts,
      lowStockProducts,
      expiringProducts,
      pendingPrescriptions,
      pendingInsuranceClaims,
      pendingTransfers,
      activePatients,
      salesTrend,
      branchPerformance,
      inventoryAlerts,
    };
  }

  async getInventoryAlerts(pharmacyId: string) {
    const lowStockProductsData = await this.prisma.product.findMany({
      where: {
        pharmacyId,
      },
      include: {
        batches: {
          where: {
            quantity: {
              gt: 0,
            },
          },
        },
      },
    });

    const lowStockAlerts = lowStockProductsData
      .map(product => {
        const totalQuantity = product.batches.reduce((sum, batch) => sum + batch.quantity, 0);
        if (totalQuantity < product.reorderLevel) {
          return {
            id: product.id,
            name: product.name,
            type: 'Low Stock',
            count: product.reorderLevel - totalQuantity,
            status: 'critical',
          };
        }
        return null;
      })
      .filter(alert => alert !== null);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringBatches = await this.prisma.batch.findMany({
      where: {
        expiryDate: {
          gte: new Date(),
          lte: thirtyDaysFromNow,
        },
        quantity: {
          gt: 0,
        },
        branch: {
          pharmacyId,
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });

    const expiringAlerts = expiringBatches.map(batch => ({
      id: batch.id,
      name: batch.product.name,
      type: 'Expiring',
      count: Math.ceil((batch.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      status: 'warning',
    }));

    return [...lowStockAlerts, ...expiringAlerts];
  }

  async getRecentSales(pharmacyId: string) {
    return this.prisma.sale.findMany({
      where: {
        branch: {
          pharmacyId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      include: {
        saleItems: true,
      },
    });
  }

  async getRecentPrescriptions(pharmacyId: string) {
    return this.prisma.prescription.findMany({
      where: {
        branch: {
          pharmacyId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      include: {
        patient: true,
      },
    });
  }

  async getRecentInsuranceClaims(pharmacyId: string) {
    return this.prisma.insuranceClaim.findMany({
      where: {
        sale: {
          branch: {
            pharmacyId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      include: {
        provider: true,
      },
    });
  }
}
