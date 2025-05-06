import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Get the full path from the URL parameters
    const path = params.path.join('/');
    
    // Construct the backend URL
    let backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    // Remove trailing /api if present
    if (backendUrl.endsWith('/api')) {
      backendUrl = backendUrl.slice(0, -4);
    }
    const imageUrl = `${backendUrl}/uploads/${path}`;
    
    console.log('Proxying image request to:', imageUrl);
    
    // Fetch the image from the backend
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.error(`Failed to fetch image: ${imageUrl} - Status: ${response.status}`);
      return new NextResponse(null, { status: response.status });
    }
    
    // Get the image data as an array buffer
    const imageBuffer = await response.arrayBuffer();
    
    // Get the content type from the response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Return the image with the correct content type
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return new NextResponse(null, { status: 500 });
  }
}