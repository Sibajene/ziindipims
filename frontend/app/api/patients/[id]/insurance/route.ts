import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const forwardAuth = (request: NextRequest) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    headers['Authorization'] = authHeader
  } else {
    const cookies = request.cookies
    const token = cookies.get('token')?.value
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
    const response = await fetch(`${API_URL}/patients/${id}/insurance`, {
      method: 'GET',
      headers
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Backend error: ${response.status} ${errorText}`)
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    if (error.message.includes('404')) {
      return NextResponse.json([])
    }
    return NextResponse.json(
      { error: 'Failed to fetch patient insurance', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()
    const headers = forwardAuth(request)
    const response = await fetch(`${API_URL}/patients/${id}/insurance`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Backend error: ${response.status} ${errorText}`)
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to add patient insurance', details: error.message },
      { status: 500 }
    )
  }
}
