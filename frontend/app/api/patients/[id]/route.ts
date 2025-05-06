import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Helper function to forward authentication headers
const forwardAuth = (request: NextRequest) => {
  const headers: Record<string, string> = {};
  
  // Get the authorization header from the request
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  } else {
    // If no auth header in request, try to get from cookies
    const cookies = request.cookies;
    const token = cookies.get('token')?.value;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const headers = forwardAuth(request);
    
    console.log(`Proxying GET request to ${API_URL}/patients/${id}`);
    
    const response = await axios.get(`${API_URL}/patients/${id}`, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error fetching patient ${params.id}:`, error.message);
    return NextResponse.json(
      { error: 'Failed to fetch patient', details: error.message },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const headers = forwardAuth(request);
    
    const response = await axios.put(`${API_URL}/patients/${id}`, body, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error updating patient ${params.id}:`, error.message);
    return NextResponse.json(
      { error: 'Failed to update patient', details: error.message },
      { status: error.response?.status || 500 }
    );
  }
}