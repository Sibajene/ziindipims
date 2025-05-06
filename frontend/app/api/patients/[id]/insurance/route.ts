import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get auth token from cookies or headers
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    } else {
      // Try to get token from cookies
      const cookies = request.cookies;
      const token = cookies.get('token')?.value;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // Forward the request to the backend
    const response = await axios.get(`${API_URL}/patients/${id}/insurance`, { headers });
    
    // Return the response from the backend
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error fetching insurance for patient ${params.id}:`, error.message);
    
    // If the backend returns a 404, return an empty array instead of an error
    if (error.response?.status === 404) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch patient insurance', 
        details: error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Get auth token from cookies or headers
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    } else {
      // Try to get token from cookies
      const cookies = request.cookies;
      const token = cookies.get('token')?.value;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // Forward the request to the backend
    const response = await axios.post(`${API_URL}/patients/${id}/insurance`, body, { headers });
    
    // Return the response from the backend
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error adding insurance for patient ${params.id}:`, error.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to add patient insurance', 
        details: error.message,
        serverError: error.response?.data 
      },
      { status: error.response?.status || 500 }
    );
  }
}
