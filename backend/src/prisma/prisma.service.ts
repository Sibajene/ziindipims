import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { INestApplication } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    // Instead of using $on('beforeExit'), use the process events directly
    process.on('beforeExit', async () => {
      await app.close();
    });
  }

  async cleanDb() {
    if (process.env.NODE_ENV === 'production') return;
    
    // Use transaction to ensure all deletes succeed or fail together
    return this.$transaction([
      this.saleItem.deleteMany(),
      this.sale.deleteMany(),
      this.batch.deleteMany(),
      this.product.deleteMany(),
      this.supplier.deleteMany(),
      this.patient.deleteMany(),
      this.user.deleteMany(),
      this.branch.deleteMany(),
      this.pharmacy.deleteMany(),
    ]);
  }
}