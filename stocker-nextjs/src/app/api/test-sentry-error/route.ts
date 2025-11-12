import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import logger from '@/lib/utils/logger';

/**
 * Test endpoint to send a test error to Sentry
 * GET /api/test-sentry-error
 */
export async function GET(request: NextRequest) {
  const testError = new Error('Test error from Stocker application - Sentry integration working!');

  // Log through our logger (will also send to Sentry)
  logger.error('Test error triggered via API', testError, {
    userId: 'test-user-api',
    component: 'test-sentry-api',
    action: 'manual-test',
    metadata: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ? 'configured' : 'not-configured'
    }
  });

  // Also capture directly with Sentry to ensure it's working
  Sentry.captureException(testError, {
    tags: {
      component: 'test-api',
      test: true
    },
    extra: {
      message: 'This is a test error to verify Sentry integration',
      timestamp: new Date().toISOString()
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Test error sent to Sentry',
    sentryEnabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    errorMessage: testError.message,
    timestamp: new Date().toISOString(),
    sentryDashboard: 'https://stocker-0p.sentry.io/issues/',
    note: 'Check your Sentry dashboard for the error'
  });
}