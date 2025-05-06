import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Subscription as SubscriptionModel } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsageTrackingGuard } from './guards/usageTracking.guard';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { ChangePlanDto } from './dto/change-plan.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { RenewSubscriptionDto } from './dto/renew-subscription.dto';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, UsageTrackingGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // Special endpoints first (to avoid route conflicts)
  @Get('current')
  async getCurrentSubscription(@Query('pharmacyId') pharmacyId: string): Promise<SubscriptionModel | null> {
    return this.subscriptionService.getCurrentSubscription(pharmacyId);
  }

  @Get('history')
  async getSubscriptionHistory(@Query('pharmacyId') pharmacyId: string): Promise<SubscriptionModel[]> {
    return this.subscriptionService.getSubscriptionHistory(pharmacyId);
  }

  @Get('plans')
  async getAvailablePlans(): Promise<any[]> {
    return this.subscriptionService.getAvailablePlans();
  }

  @Post('start-trial')
  async startTrial(@Body('pharmacyId') pharmacyId: string): Promise<SubscriptionModel | null> {
    return this.subscriptionService.createFreeTrialSubscription(pharmacyId);
  }

  // Standard CRUD operations
  @Post()
  async createSubscription(@Body() data: CreateSubscriptionDto): Promise<SubscriptionModel> {
    return this.subscriptionService.createSubscription(data);
  }

  @Get()
  async getAllSubscriptions(): Promise<SubscriptionModel[]> {
    return this.subscriptionService.getAllSubscriptions();
  }

  @Get(':id')
  async getSubscriptionById(@Param('id') id: string): Promise<SubscriptionModel | null> {
    return this.subscriptionService.getSubscriptionById(id);
  }

  @Put(':id')
  async updateSubscription(
    @Param('id') id: string,
    @Body() data: UpdateSubscriptionDto,
  ): Promise<SubscriptionModel> {
    return this.subscriptionService.updateSubscription(id, data);
  }

  @Delete(':id')
  async deleteSubscription(@Param('id') id: string): Promise<SubscriptionModel> {
    return this.subscriptionService.deleteSubscription(id);
  }

  // Additional operations
  @Post('change-plan')
  async changePlan(@Body() data: ChangePlanDto): Promise<SubscriptionModel | null> {
    return this.subscriptionService.changePlan(data.pharmacyId, data.planId);
  }

  @Post('cancel')
  async cancelSubscription(@Body() data: CancelSubscriptionDto): Promise<SubscriptionModel | null> {
    return this.subscriptionService.cancelSubscription(data.pharmacyId, data.subscriptionId);
  }

  @Post('renew')
  async renewSubscription(@Body() data: RenewSubscriptionDto): Promise<SubscriptionModel | null> {
    return this.subscriptionService.renewSubscription(data.pharmacyId, data.subscriptionId);
  }
}
