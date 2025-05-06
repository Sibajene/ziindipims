import { PrismaClient, BillingCycle } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSubscriptionPlans() {
  const plans = [
    {
      name: 'Basic Plan',
      description: 'Basic features for small pharmacies',
      price: 29.99,
      billingCycle: BillingCycle.MONTHLY,
      features: {
        users: 5,
        products: 100,
        branches: 1,
      },
      isActive: true,
      trialDays: 14,
    },
    {
      name: 'Standard Plan',
      description: 'Standard features for growing pharmacies',
      price: 59.99,
      billingCycle: BillingCycle.MONTHLY,
      features: {
        users: 15,
        products: 500,
        branches: 3,
      },
      isActive: true,
      trialDays: 14,
    },
    {
      name: 'Premium Plan',
      description: 'All features for large pharmacies',
      price: 99.99,
      billingCycle: BillingCycle.MONTHLY,
      features: {
        users: 50,
        products: 2000,
        branches: 10,
      },
      isActive: true,
      trialDays: 14,
    },
  ];

  for (const plan of plans) {
    const existing = await prisma.subscriptionPlan.findFirst({ where: { name: plan.name } });
    if (!existing) {
      await prisma.subscriptionPlan.create({ data: plan });
      console.log(`Created subscription plan: ${plan.name}`);
    } else {
      console.log(`Subscription plan already exists: ${plan.name}`);
    }
  }
}

seedSubscriptionPlans()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
