// Sentry import removed - using manual initialization in sentry.*.config.ts files
// import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Standalone output for Docker
  output: 'standalone',

  // Disable ESLint and TypeScript checks during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5104',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.stoocker.app',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 's3.stoocker.app',
        pathname: '/**',
      },
    ],
  },

  // Environment variables
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    // Sentry DSN (public key, safe to hardcode)
    // Falls back to environment variable if not set
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://a70b942af7e82a02c637a852f0782226@o4510349217431552.ingest.de.sentry.io/4510349218807888',
  },

  // Redirects and rewrites
  async rewrites() {
    // Remove trailing /api from URL since we add it in the source pattern
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.stoocker.app';
    const cleanApiUrl = apiBaseUrl.replace(/\/api$/, '');

    return [
      {
        source: '/api/:path*',
        destination: `${cleanApiUrl}/api/:path*`,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

// Export without Sentry wrapper - using manual initialization in sentry.*.config.ts files
// This prevents duplicate Sentry.init() calls and ensures tunnel configuration works correctly
export default nextConfig;

// NOTE: Source maps will NOT be automatically uploaded to Sentry
// To upload source maps manually, use: npx @sentry/wizard@latest
// Or configure Sentry CLI in CI/CD pipeline