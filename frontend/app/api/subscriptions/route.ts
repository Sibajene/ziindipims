import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would fetch data from your database
    // This is mock data for testing
    const subscriptions = [
      {
        id: "sub_1",
        pharmacyId: "pharm_1",
        planId: "Basic Plan",
        status: "ACTIVE",
        startDate: "2023-01-01T00:00:00Z",
        endDate: "2023-12-31T23:59:59Z",
        autoRenew: true
      }
    ];
    
    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Error in subscriptions API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}