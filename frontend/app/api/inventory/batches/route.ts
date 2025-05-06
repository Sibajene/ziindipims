import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001/api';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pharmacyId = url.searchParams.get('pharmacyId');

  if (!pharmacyId) {
    return NextResponse.json({ error: 'pharmacyId query parameter is required' }, { status: 400 });
  }

  try {
    const authHeader = request.headers.get('authorization') || '';

    const backendResponse = await fetch(`${BACKEND_URL}/inventory/batches?pharmacyId=${pharmacyId}`, {
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(errorData, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch from backend' }, { status: 500 });
  }
}
