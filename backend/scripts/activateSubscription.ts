import { PrismaClient, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function activateSubscription(pharmacyId: string) {
  try {
    // Find current subscription for the pharmacy
    const subscription = await prisma.subscription.findFirst({
      where: { pharmacyId },
      orderBy: { startDate: 'desc' },
    });

    if (!subscription) {
      console.error('No subscription found for this pharmacy.');
      process.exit(1);
    }

    // Update subscription status to ACTIVE
    const now = new Date();
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        startDate: subscription.startDate || now,
        currentPeriodStart: now,
        currentPeriodEnd: subscription.currentPeriodEnd || new Date(now.setMonth(now.getMonth() + 1)),
        canceledAt: null,
      },
    });

    console.log('Subscription activated:', updatedSubscription);
  } catch (error) {
    console.error('Error activating subscription:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run script with pharmacyId argument
const pharmacyId = process.argv[2];
if (!pharmacyId) {
  console.error('Please provide a pharmacyId as the first argument.');
  process.exit(1);
}

activateSubscription(pharmacyId);
