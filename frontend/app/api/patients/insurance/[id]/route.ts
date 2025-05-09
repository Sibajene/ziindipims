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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()
    const headers = forwardAuth(request)
    const response = await fetch(`${API_URL}/patients/insurance/${id}`, {
      method: 'PUT',
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
      { error: 'Failed to update insurance plan', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const headers = forwardAuth(request)
    const response = await fetch(`${API_URL}/patients/insurance/${id}`, {
      method: 'DELETE',
      headers
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Backend error: ${response.status} ${errorText}`)
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete insurance plan', details: error.message },
      { status: 500 }
    )
  }
}
