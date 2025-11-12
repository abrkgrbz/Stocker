import { withSentryConfig } from '@sentry/nextjs';

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
    ],
  },

  // Environment variables
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
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

// Wrap with Sentry configuration
export default withSentryConfig(
  nextConfig,
  {
    // Sentry Webpack Plugin options
    silent: true, // Suppresses source map uploading logs during build
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    // Sentry SDK options
    widenClientFileUpload: true, // Upload a larger set of source maps
    transpileClientSDK: true, // Transpile SDK to be IE11 compatible
    tunnelRoute: "/monitoring", // Route to tunnel Sentry requests through your server
    hideSourceMaps: true, // Hides source maps from generated client bundles
    disableLogger: true, // Automatically tree-shake Sentry logger statements to reduce bundle size
  }
);