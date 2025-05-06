import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export async function PUT(
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
    const response = await axios.put(`${API_URL}/patients/insurance/${id}`, body, { headers });
    
    // Return the response from the backend
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error updating insurance plan ${params.id}:`, error.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to update insurance plan', 
        details: error.message,
        serverError: error.response?.data 
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(
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
    const response = await axios.delete(`${API_URL}/patients/insurance/${id}`, { headers });
    
    // Return the response from the backend
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error deleting insurance plan ${params.id}:`, error.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete insurance plan', 
        details: error.message,
        serverError: error.response?.data 
      },
      { status: error.response?.status || 500 }
    );
  }
}