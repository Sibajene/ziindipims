import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { PatientsModule } from './patients/patients.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { InsuranceModule } from './insurance/insurance.module';
import { InventoryModule } from './inventory/inventory.module';
import { ReportsModule } from './reports/reports.module';
import { BranchesModule } from './branches/branches.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PharmaciesModule } from './pharmacies/pharmacies.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    SalesModule,
    PatientsModule,
    PrescriptionsModule,
    InsuranceModule,
    InventoryModule,
    ReportsModule,
    BranchesModule,
    SuppliersModule,
    PharmaciesModule,
    SubscriptionModule,
    NotificationsModule,
    DashboardModule,
    SettingsModule,
  ],
})
export class AppModule {}
