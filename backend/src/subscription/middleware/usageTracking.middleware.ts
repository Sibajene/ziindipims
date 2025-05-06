import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../subscription.service';

@Injectable()
export class UsageTrackingMiddleware implements NestMiddleware {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const pharmacyId = req.headers['x-pharmacy-id'] as string;
    console.log('UsageTrackingMiddleware: pharmacyId header:', pharmacyId);
    if (!pharmacyId) {
      console.log('UsageTrackingMiddleware: Pharmacy ID header missing');
      throw new ForbiddenException('Pharmacy ID header missing');
    }

    const user = (req as any).user;
    console.log('UsageTrackingMiddleware: user from token:', user);
    if (!user) {
      console.log('UsageTrackingMiddleware: User not authenticated');
      throw new ForbiddenException('User not authenticated');
    }

    if (user.pharmacyId !== pharmacyId) {
      console.log(`UsageTrackingMiddleware: User pharmacyId ${user.pharmacyId} does not match header pharmacyId ${pharmacyId}`);
      throw new ForbiddenException('User does not have access to this pharmacy');
    }

    const subscription = await this.subscriptionService.getCurrentSubscription(pharmacyId);
    console.log('UsageTrackingMiddleware: subscription found:', subscription);
    if (!subscription || (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING')) {
      console.log(`UsageTrackingMiddleware: Subscription status invalid or no subscription. Status: ${subscription ? subscription.status : 'none'}`);
      throw new ForbiddenException('Active subscription required to access this resource');
    }

    const fullSubscription = await this.subscriptionService.getSubscriptionWithPlan(subscription.id);
    console.log('UsageTrackingMiddleware: full subscription with plan:', fullSubscription);

    if (!fullSubscription || !fullSubscription.plan) {
      console.log('UsageTrackingMiddleware: Subscription plan details not found');
      throw new ForbiddenException('Subscription plan details not found');
    }

    // Add logic to enforce feature usage limits here

    next();
  }
}
