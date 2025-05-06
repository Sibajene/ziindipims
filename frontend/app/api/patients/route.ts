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

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Get auth headers
    const headers = forwardAuth(request);
    
    console.log(`Proxying GET request to ${API_URL}/patients with params:`, params);
    
    // Forward the request to the backend with auth headers
    const response = await axios.get(`${API_URL}/patients`, { 
      params,
      headers
    });
    
    // Return the response from the backend
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching patients:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch patients', details: error.message },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();

    // Convert dob string to Date object if present
    if (body.dob && typeof body.dob === 'string') {
      body.dob = new Date(body.dob);
    }
    
    // Log the request for debugging
    console.log('Creating patient with data:', JSON.stringify(body, null, 2));
    
    // Get auth token from cookies or headers
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Make sure gender is not undefined (it's required by the backend)
    if (!body.gender) {
      return NextResponse.json(
        { error: 'Gender is required' },
        { status: 400 }
      );
    }
    
    // Forward the request to the backend
    const response = await axios.post(`${API_URL}/patients`, body, { headers });
    
    console.log('Backend response:', response.data);
    
    // Return the response from the backend
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating patient:', error.message);
    console.error('Error details:', error.response?.data);
    
    return NextResponse.json(
      { 
        error: 'Failed to create patient', 
        details: error.message,
        serverError: error.response?.data 
      },
      { status: error.response?.status || 500 }
    );
  }
}