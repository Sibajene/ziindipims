import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Subscription, Prisma, SubscriptionStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async createSubscription(data: any): Promise<Subscription> {
    const prismaData: Prisma.SubscriptionCreateInput = {
      pharmacy: { connect: { id: data.pharmacyId } },
      plan: { connect: { id: data.planId } },
      status: data.status || SubscriptionStatus.ACTIVE,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : undefined,
      canceledAt: data.canceledAt ? new Date(data.canceledAt) : undefined,
      currentPeriodStart: data.currentPeriodStart ? new Date(data.currentPeriodStart) : new Date(),
      currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : undefined,
      paymentMethod: data.paymentMethod as any,
      autoRenew: data.autoRenew !== undefined ? data.autoRenew : true,
      paymentProvider: data.paymentProvider,
      paymentProviderId: data.paymentProviderId,
    };

    if (prismaData.plan && prismaData.plan.connect && prismaData.plan.connect.id) {
      const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: prismaData.plan.connect.id } });
      if (plan && plan.price === 0) {
        const existingTrial = await this.prisma.subscription.findFirst({
          where: {
            pharmacyId: prismaData.pharmacy.connect.id,
            planId: prismaData.plan.connect.id,
            status: SubscriptionStatus.TRIALING,
          },
        });
        if (existingTrial) {
          throw new ForbiddenException('Free trial already used for this pharmacy.');
        }
      }
    }
    return this.prisma.subscription.create({
      data: prismaData,
    });
  }

  async createFreeTrialSubscription(pharmacyId: string): Promise<Subscription> {
    const freeTrialPlan = await this.prisma.subscriptionPlan.findFirst({
      where: { price: 0, isActive: true },
    });

    if (!freeTrialPlan) {
      throw new ForbiddenException('No active free trial plan found.');
    }

    const existingTrial = await this.prisma.subscription.findFirst({
      where: {
        pharmacyId,
        planId: freeTrialPlan.id,
        status: SubscriptionStatus.TRIALING,
      },
    });

    if (existingTrial) {
      throw new ForbiddenException('Free trial already used for this pharmacy.');
    }

    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    return this.prisma.subscription.create({
      data: {
        pharmacy: { connect: { id: pharmacyId } },
        plan: { connect: { id: freeTrialPlan.id } },
        status: SubscriptionStatus.TRIALING,
        startDate: now,
        trialEndsAt,
        currentPeriodStart: now,
        currentPeriodEnd: trialEndsAt,
        autoRenew: false,
      },
    });
  }

  async getSubscriptionWithPlan(id: string) {
    return this.prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });
  }

  async getSubscriptionById(id: string): Promise<Subscription | null> {
    return this.prisma.subscription.findUnique({
      where: { id },
    });
  }

  async updateSubscription(id: string, data: any): Promise<Subscription> {
    const prismaData: Prisma.SubscriptionUpdateInput = {};

    if (data.planId) {
      prismaData.plan = { connect: { id: data.planId } };
    }
    if (data.status) {
      prismaData.status = data.status;
    }
    if (data.startDate) {
      prismaData.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      prismaData.endDate = new Date(data.endDate);
    }
    if (data.trialEndsAt) {
      prismaData.trialEndsAt = new Date(data.trialEndsAt);
    }
    if (data.canceledAt) {
      prismaData.canceledAt = new Date(data.canceledAt);
    }
    if (data.currentPeriodStart) {
      prismaData.currentPeriodStart = new Date(data.currentPeriodStart);
    }
    if (data.currentPeriodEnd) {
      prismaData.currentPeriodEnd = new Date(data.currentPeriodEnd);
    }
    if (data.paymentMethod) {
      prismaData.paymentMethod = data.paymentMethod;
    }
    if (data.autoRenew !== undefined) {
      prismaData.autoRenew = data.autoRenew;
    }
    if (data.paymentProvider) {
      prismaData.paymentProvider = data.paymentProvider;
    }
    if (data.paymentProviderId) {
      prismaData.paymentProviderId = data.paymentProviderId;
    }

    return this.prisma.subscription.update({
      where: { id },
      data: prismaData,
    });
  }

  async deleteSubscription(id: string): Promise<Subscription> {
    return this.prisma.subscription.delete({
      where: { id },
    });
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return this.prisma.subscription.findMany();
  }

  async getCurrentSubscription(pharmacyId: string): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({
      where: {
        pharmacyId,
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async getSubscriptionHistory(pharmacyId: string): Promise<Subscription[]> {
    return this.prisma.subscription.findMany({
      where: {
        pharmacyId,
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async getAvailablePlans(): Promise<any[]> {
    console.log('Fetching available subscription plans...');
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        price: 'asc',
      },
    });
    console.log(`Found ${plans.length} active plans.`);
    return plans;
  }

  async changePlan(pharmacyId: string, planId: string): Promise<Subscription | null> {
    const currentSubscription = await this.getCurrentSubscription(pharmacyId);
    if (!currentSubscription) {
      return null;
    }
    return this.prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: { planId },
    });
  }

  async cancelSubscription(pharmacyId: string, subscriptionId: string): Promise<Subscription | null> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!subscription || subscription.pharmacyId !== pharmacyId) {
      return null;
    }
    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: SubscriptionStatus.CANCELED, canceledAt: new Date() },
    });
  }

  async renewSubscription(pharmacyId: string, subscriptionId: string): Promise<Subscription | null> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!subscription || subscription.pharmacyId !== pharmacyId) {
      return null;
    }
    const newEndDate = subscription.endDate ? new Date(subscription.endDate) : new Date();
    newEndDate.setMonth(newEndDate.getMonth() + 1);
    const updatedSubscription = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        endDate: newEndDate,
        canceledAt: null,
      },
    });
    await this.sendSubscriptionNotification(pharmacyId, `Your subscription ${subscriptionId} has been renewed.`);
    return updatedSubscription;
  }

  private async sendSubscriptionNotification(pharmacyId: string, message: string) {
    const users = await this.prisma.user.findMany({
      where: { pharmacyId },
    });
    for (const user of users) {
      await this.prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Subscription Update',
          message,
          type: 'SYSTEM',
          read: false,
          createdAt: new Date(),
        },
      });
    }
  }
}
