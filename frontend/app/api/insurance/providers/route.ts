import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const providers = await prisma.insuranceProvider.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        active: true,
      },
      where: {
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error fetching insurance providers:', error);
    return NextResponse.json(
      { message: 'Failed to fetch insurance providers' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}