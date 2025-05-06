import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Helper function to forward authentication headers
const forwardAuth = (request: NextRequest) => {
  const headers: Record<string, string> = {}
  
  // Get the authorization header from the request
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    headers['Authorization'] = authHeader
  } else {
    // If no auth header in request, try to get from cookies or localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  
  return headers
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const headers = forwardAuth(request)
    
    console.log(`Proxying GET request to ${API_URL}/patients/${id}/medication-history`)
    console.log('Headers:', headers)
    
    const response = await axios.get(`${API_URL}/patients/${id}/medication-history`, { headers })
    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error(`Error fetching medication history for patient ${params.id}:`, error.message)
    return NextResponse.json(
      { error: 'Failed to fetch medication history', details: error.message },
      { status: error.response?.status || 500 }
    )
  }
}