import { PrismaClient, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function addFreeTrialSubscription(pharmacyId: string) {
  try {
    // Find free trial plan (price 0)
    const freeTrialPlan = await prisma.subscriptionPlan.findFirst({
      where: { price: 0, isActive: true },
    });

    if (!freeTrialPlan) {
      console.error('No active free trial plan found.');
      process.exit(1);
    }

    // Check if free trial already exists for pharmacy
    const existingTrial = await prisma.subscription.findFirst({
      where: {
        pharmacyId,
        planId: freeTrialPlan.id,
        status: SubscriptionStatus.TRIALING,
      },
    });

    if (existingTrial) {
      console.error('Free trial already used for this pharmacy.');
      process.exit(1);
    }

    // Create free trial subscription for 14 days
    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const subscription = await prisma.subscription.create({
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

    console.log('Free trial subscription created:', subscription);
  } catch (error) {
    console.error('Error creating free trial subscription:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Replace with the pharmacyId you want to add a free trial for
const pharmacyId = process.argv[2];
if (!pharmacyId) {
  console.error('Please provide a pharmacyId as the first argument.');
  process.exit(1);
}

addFreeTrialSubscription(pharmacyId);
