import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// TODO: Remove this bypass after Coolify migration is complete
const TEMPORARY_BYPASS_SUBDOMAINS = ['awcs0wg4840co8wwsscwwwck']

export function middleware(request: NextRequest) {
  // Check for auth bypass in development
  // const isAuthBypassed = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true'
  const isAuthBypassed = true; // Forced for local debugging

  const hostname = request.headers.get('host') || ''
  const subdomain = hostname.split('.')[0]

  // Temporary bypass for specific subdomains (Coolify preview deployments, etc.)
  if (TEMPORARY_BYPASS_SUBDOMAINS.includes(subdomain)) {
    return NextResponse.next()
  }
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3001'
  const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'http://localhost:3000'
  const isDev = process.env.NODE_ENV === 'development'
  const pathname = request.nextUrl.pathname

  // Extract just the domain without protocol and port
  const authHostname = authDomain.replace(/^https?:\/\//, '').split(':')[0]

  // Check if this is the root domain (not a subdomain)
  const isRootDomain = hostname === baseDomain || hostname === `www.${baseDomain}`

  // Check if this is auth subdomain
  const isAuthDomain = hostname === authHostname || hostname === `auth.${baseDomain}`

  // subdomain already extracted above for bypass check
  const isTenantDomain = !isRootDomain && !isAuthDomain && subdomain !== 'www'

  // Protected routes that require authentication
  const protectedRoutes = ['/app', '/crm', '/sales', '/inventory', '/finance', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Public routes that don't require auth
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/landing', '/pricing', '/invalid-tenant']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Skip middleware for invalid-tenant page completely
  if (pathname === '/invalid-tenant') {
    return NextResponse.next()
  }

  // Check authentication (tenant-code cookie exists)
  const tenantCodeCookie = request.cookies.get('tenant-code')
  const isAuthenticated = !!tenantCodeCookie

  // Check if this is an RSC prefetch request (skip cross-origin redirects for these)
  const isRSCPrefetch = request.nextUrl.searchParams.has('_rsc') ||
    request.headers.get('RSC') === '1' ||
    request.headers.get('Next-Router-Prefetch') === '1'

  // Redirect unauthenticated users from protected routes to login
  // Skip if auth bypassed or RSC prefetch request
  if (isProtectedRoute && !isAuthenticated && !isRSCPrefetch && !isAuthBypassed) {
    const url = request.nextUrl.clone()
    if (isDev) {
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
    } else {
      // Production: redirect to auth subdomain
      url.protocol = 'https:'
      url.host = authHostname
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
    }
    return NextResponse.redirect(url, 307)
  }

  // Redirect www to non-www on root domain
  if (hostname === `www.${baseDomain}`) {
    const url = request.nextUrl.clone()
    url.host = baseDomain
    return NextResponse.redirect(url, 301)
  }

  // Tenant subdomain: set tenant header
  if (isTenantDomain && !isDev) {
    // Set tenant code header for all tenant subdomain requests
    const response = NextResponse.next()
    response.headers.set('x-tenant-code', subdomain)
    return response
  }

  // Root domain: handle auth routes
  // For RSC prefetch/fetch requests, serve locally to avoid CORS
  // For full page navigations, redirect to auth subdomain
  if (isRootDomain && !isDev) {
    const isAuthRoute = pathname === '/login' || pathname === '/register' ||
      pathname.startsWith('/login/') || pathname.startsWith('/register/') ||
      pathname === '/forgot-password' || pathname === '/reset-password' ||
      pathname.startsWith('/forgot-password/') || pathname.startsWith('/reset-password/')

    if (isAuthRoute) {
      // For RSC prefetch/fetch requests, serve the page locally (same origin)
      // This avoids CORS errors with cross-origin fetches
      if (isRSCPrefetch) {
        return NextResponse.next()
      }

      // For full page navigations (browser address bar), redirect to auth subdomain
      // Check if this is a real navigation (not fetch/XHR)
      const acceptHeader = request.headers.get('accept') || ''
      const isPageNavigation = acceptHeader.includes('text/html')

      if (isPageNavigation) {
        const url = request.nextUrl.clone()
        url.protocol = 'https:'
        url.host = authHostname
        url.port = '' // Remove port for production (default HTTPS 443)
        return NextResponse.redirect(url, 307) // Temporary redirect (preserves method)
      }

      // For other requests (API calls, etc.), serve locally
      return NextResponse.next()
    }
  }

  // Handle CORS for all routes (not just API)
  const origin = request.headers.get('origin')
  const response = NextResponse.next()

  if (origin) {
    // In development, allow localhost
    if (isDev && origin.includes('localhost')) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    // In production, allow all subdomains of base domain
    else if (origin.endsWith(`.${baseDomain}`) || origin.endsWith(baseDomain)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
  }

  // Set CORS headers for preflight requests
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url')

  // Handle OPTIONS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json, robots.txt, sitemap.xml (PWA and SEO files)
     * - public folder files (images, json, xml, txt, ico)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest\\.json|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json|xml|txt|ico)$).*)',
  ],
}
