import { NextResponse } from 'next/server';

/**
 * Sentry Status Diagnostic Endpoint
 * GET /api/monitoring/status
 *
 * Returns detailed information about Sentry configuration
 * Use this to troubleshoot why Sentry isn't receiving events
 */
export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,

    // Check if DSN is configured
    sentry: {
      publicDsnConfigured: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
      serverDsnConfigured: !!process.env.SENTRY_DSN,
      publicDsnValue: process.env.NEXT_PUBLIC_SENTRY_DSN
        ? `${process.env.NEXT_PUBLIC_SENTRY_DSN.substring(0, 30)}...`
        : 'NOT SET',
      orgConfigured: !!process.env.SENTRY_ORG,
      projectConfigured: !!process.env.SENTRY_PROJECT,
      authTokenConfigured: !!process.env.SENTRY_AUTH_TOKEN,
    },

    // Check tunnel configuration
    tunnel: {
      route: '/monitoring',
      status: 'This endpoint serves as status check',
      tunnelEndpoint: '/api/monitoring (POST)',
    },

    // Runtime info
    runtime: {
      nodeEnv: process.env.NODE_ENV,
      isProduction: process.env.NODE_ENV === 'production',
      nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
    },

    // Status summary
    ready: !!(
      process.env.NEXT_PUBLIC_SENTRY_DSN &&
      process.env.SENTRY_ORG &&
      process.env.SENTRY_PROJECT
    ),

    // Troubleshooting tips
    troubleshooting: !process.env.NEXT_PUBLIC_SENTRY_DSN ? [
      '❌ NEXT_PUBLIC_SENTRY_DSN is not set',
      '💡 Add to your environment variables (Coolify/Vercel/etc)',
      '💡 Format: NEXT_PUBLIC_SENTRY_DSN=https://key@o123.ingest.sentry.io/456',
      '🔗 Get DSN from: https://sentry.io/settings/stocker-0p/projects/stocker-nextjs/keys/',
    ] : [
      '✅ Sentry DSN is configured',
      '💡 Check browser console for Sentry debug logs',
      '💡 Verify tunnel is receiving POST requests at /api/monitoring',
      '💡 Test with: GET /api/test-sentry-error',
    ],
  };

  return NextResponse.json(status, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
