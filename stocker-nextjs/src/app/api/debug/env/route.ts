import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check environment variables
 * ONLY for troubleshooting - DISABLE in production after debugging
 * GET /api/debug/env
 */
export async function GET() {
  // Only allow in development or with specific debug flag
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const allowDebug = process.env.ALLOW_ENV_DEBUG === 'true';

  if (!isDevelopment && !allowDebug) {
    return NextResponse.json(
      { error: 'Debug endpoint disabled in production' },
      { status: 403 }
    );
  }

  const envCheck = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,

    // Sentry variables (masked for security)
    sentry: {
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN
        ? `${process.env.NEXT_PUBLIC_SENTRY_DSN.substring(0, 30)}...`
        : 'NOT SET',
      SENTRY_DSN: process.env.SENTRY_DSN
        ? `${process.env.SENTRY_DSN.substring(0, 30)}...`
        : 'NOT SET',
      SENTRY_ORG: process.env.SENTRY_ORG || 'NOT SET',
      SENTRY_PROJECT: process.env.SENTRY_PROJECT || 'NOT SET',
      SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT || 'NOT SET',
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN ? 'SET (masked)' : 'NOT SET',
    },

    // Check if variables are configured
    configured: {
      publicDsn: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
      serverDsn: !!process.env.SENTRY_DSN,
      org: !!process.env.SENTRY_ORG,
      project: !!process.env.SENTRY_PROJECT,
    },

    // Other important env vars (masked)
    api: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
      API_INTERNAL_URL: process.env.API_INTERNAL_URL || 'NOT SET',
    },

    // Overall status
    sentryReady: !!(
      process.env.NEXT_PUBLIC_SENTRY_DSN &&
      process.env.SENTRY_ORG &&
      process.env.SENTRY_PROJECT
    ),

    note: isDevelopment
      ? 'Running in development mode'
      : 'Debug mode enabled with ALLOW_ENV_DEBUG=true',

    warning: '⚠️ DISABLE THIS ENDPOINT AFTER DEBUGGING (remove ALLOW_ENV_DEBUG)',
  };

  return NextResponse.json(envCheck, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
