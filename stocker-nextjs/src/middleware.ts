import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    
    // Get base domain from environment
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3001'
    const isDev = process.env.NODE_ENV === 'development'
    
    // Allow requests from any subdomain of base domain
    const origin = request.headers.get('origin')
    
    if (origin) {
      // In development, allow localhost
      if (isDev && origin.includes('localhost')) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Credentials', 'true')
      }
      // In production, allow subdomains of base domain
      else if (origin.endsWith(`.${baseDomain}`) || origin.endsWith(baseDomain)) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Credentials', 'true')
      }
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
