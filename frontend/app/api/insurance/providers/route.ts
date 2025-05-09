import { NextResponse } from 'next/server';

const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_PHASE === 'phase-export';

export async function GET() {
  if (isBuild) {
    // Return mock data or empty array during build to avoid fetch errors
    const mockProviders = [];
    return NextResponse.json(mockProviders);
  }

  try {
    const response = await fetch('http://localhost:3001/insurance/providers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch insurance providers from backend');
    }

    const providers = await response.json();

    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error fetching insurance providers:', error);
    return NextResponse.json(
      { message: 'Failed to fetch insurance providers' },
      { status: 500 }
    );
  }
}
