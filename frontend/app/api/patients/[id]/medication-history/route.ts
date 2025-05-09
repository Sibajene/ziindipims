import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const forwardAuth = (request: NextRequest) => {
  const headers: Record<string, string> = {}
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    headers['Authorization'] = authHeader
  } else {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  return headers
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const headers = forwardAuth(request)
    const response = await fetch(`${API_URL}/patients/${id}/medication-history`, { method: 'GET', headers })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Backend error: ${response.status} ${errorText}`)
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch medication history', details: error.message }, { status: 500 })
  }
}
