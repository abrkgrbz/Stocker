import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/pricing', '/about', '/invalid-tenant'];

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/modules', '/settings'];

// Master admin routes
const masterRoutes = ['/master'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isMasterRoute = masterRoutes.some(route => pathname.startsWith(route));

  // Get authentication token from cookies
  const token = request.cookies.get('accessToken')?.value;

  // Multi-tenant handling
  const tenantMode = process.env.NEXT_PUBLIC_TENANT_MODE || 'subdomain';
  let tenantIdentifier: string | null = null;

  if (tenantMode === 'subdomain') {
    const hostname = request.headers.get('host') || '';
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      tenantIdentifier = parts[0];
    }
  } else if (tenantMode === 'path') {
    const match = pathname.match(/^\/t\/([^/]+)/);
    tenantIdentifier = match ? match[1] : null;
  }

  // Clone the request headers and add tenant identifier
  const requestHeaders = new Headers(request.headers);
  if (tenantIdentifier) {
    requestHeaders.set('X-Tenant-Id', tenantIdentifier);
  }

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth routes with valid token
  if (isPublicRoute && token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Master route protection (additional role check would be needed)
  if (isMasterRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Continue with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
