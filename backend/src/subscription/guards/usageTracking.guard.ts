import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { SubscriptionService } from '../subscription.service';

@Injectable()
export class UsageTrackingGuard implements CanActivate {
  private readonly logger = new Logger(UsageTrackingGuard.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Bypass guard for /subscriptions/plans route
    if (request.path === '/subscriptions/plans') {
      this.logger.log('UsageTrackingGuard: Bypassing guard for /subscriptions/plans route');
      return true;
    }

    const pharmacyId = request.headers['x-pharmacy-id'] as string;

    this.logger.log(`UsageTrackingGuard: pharmacyId header: ${pharmacyId}`);

    if (!pharmacyId) {
      this.logger.warn('UsageTrackingGuard: Pharmacy ID header missing');
      throw new ForbiddenException('Pharmacy ID header missing');
    }

    const user = request.user;
    this.logger.log(`UsageTrackingGuard: user from token: ${user ? user.id : 'undefined'}`);

    if (!user) {
      this.logger.warn('UsageTrackingGuard: User not authenticated');
      throw new ForbiddenException('User not authenticated');
    }

    if (user.pharmacyId !== pharmacyId) {
      this.logger.warn(`UsageTrackingGuard: User pharmacyId ${user.pharmacyId} does not match header pharmacyId ${pharmacyId}`);
      throw new ForbiddenException('User does not have access to this pharmacy');
    }

    const subscription = await this.subscriptionService.getCurrentSubscription(pharmacyId);
    this.logger.log(`UsageTrackingGuard: subscription found: ${subscription ? subscription.id : 'none'}`);

    if (!subscription || (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING')) {
      this.logger.warn(`UsageTrackingGuard: Subscription status invalid or no subscription. Status: ${subscription ? subscription.status : 'none'}`);
      throw new ForbiddenException('Active subscription required to access this resource');
    }

    const fullSubscription = await this.subscriptionService.getSubscriptionWithPlan(subscription.id);
    this.logger.log(`UsageTrackingGuard: full subscription with plan: ${fullSubscription ? fullSubscription.id : 'none'}`);

    if (!fullSubscription || !fullSubscription.plan) {
      this.logger.warn('UsageTrackingGuard: Subscription plan details not found');
      throw new ForbiddenException('Subscription plan details not found');
    }

    // Add logic to enforce feature usage limits here if needed

    return true;
  }
}
