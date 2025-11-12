import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    // Test error for Sentry
    throw new Error('Test error for Sentry dashboard verification');
  } catch (error) {
    // Capture the error to Sentry
    Sentry.captureException(error);

    // Also log it
    console.error('Sentry test error:', error);

    return NextResponse.json({
      message: 'Test error sent to Sentry',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  // Send a custom message to Sentry
  Sentry.captureMessage('Test message from Stocker API', 'info');

  // Send an event with context
  Sentry.captureEvent({
    message: 'Custom test event',
    level: 'warning',
    extra: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
    },
    tags: {
      test: 'true',
      component: 'api',
    }
  });

  return NextResponse.json({
    message: 'Test events sent to Sentry successfully',
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ? 'Configured' : 'Not configured'
  });
}