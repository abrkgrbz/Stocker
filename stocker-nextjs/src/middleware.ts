import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3001'
  const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'http://localhost:3000'
  const isDev = process.env.NODE_ENV === 'development'

  // Extract just the domain without protocol and port
  const authHostname = authDomain.replace(/^https?:\/\//, '').split(':')[0]

  // Check if this is the root domain (not a subdomain)
  const isRootDomain = hostname === baseDomain || hostname === `www.${baseDomain}`

  // Redirect www to non-www on root domain
  if (hostname === `www.${baseDomain}`) {
    const url = request.nextUrl.clone()
    url.host = baseDomain
    return NextResponse.redirect(url, 301)
  }

  // Root domain: redirect auth routes to auth subdomain
  if (isRootDomain && !isDev) {
    const pathname = request.nextUrl.pathname

    // Redirect /login, /register to auth subdomain
    if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/login/') || pathname.startsWith('/register/')) {
      const url = request.nextUrl.clone()
      url.protocol = 'https:'
      url.host = authHostname
      return NextResponse.redirect(url, 307) // Temporary redirect (preserves method)
    }
  }

  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next()

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
  matcher: [
    '/api/:path*',
    '/login/:path*',
    '/register/:path*',
  ],
}
