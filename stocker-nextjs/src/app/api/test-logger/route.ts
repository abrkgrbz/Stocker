import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/utils/logger';

/**
 * Test endpoint for verifying logger functionality
 * GET /api/test-logger
 */
export async function GET(request: NextRequest) {
  const testUserId = 'test-user-123';
  const testSessionId = 'session-456';

  // Test different log levels
  logger.debug('Debug message - should appear only in development', {
    userId: testUserId,
    sessionId: testSessionId,
    component: 'test-logger-api',
    metadata: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }
  });

  logger.info('Info message - standard information log', {
    userId: testUserId,
    action: 'test-logger-accessed',
    component: 'test-logger-api'
  });

  logger.warn('Warning message - something to pay attention to', {
    userId: testUserId,
    component: 'test-logger-api',
    metadata: {
      warning: 'This is a test warning',
      severity: 'low'
    }
  });

  // Test error logging with Error object
  const testError = new Error('This is a test error');
  logger.error('Error message - something went wrong', testError, {
    userId: testUserId,
    component: 'test-logger-api',
    metadata: {
      errorType: 'test-error',
      handled: true
    }
  });

  // Test performance measurement
  await logger.measurePerformance('test-operation', async () => {
    // Simulate some async work
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  // Test time measurement
  logger.time('test-timer');
  await new Promise(resolve => setTimeout(resolve, 50));
  logger.timeEnd('test-timer');

  // Test table output (development only)
  logger.table([
    { level: 'DEBUG', enabled: process.env.NODE_ENV === 'development' },
    { level: 'INFO', enabled: true },
    { level: 'WARN', enabled: true },
    { level: 'ERROR', enabled: true }
  ]);

  // Test grouping (development only)
  logger.group('Test Group');
  logger.info('Message inside group');
  logger.debug('Debug inside group');
  logger.groupEnd();

  return NextResponse.json({
    success: true,
    message: 'Logger test completed',
    environment: process.env.NODE_ENV,
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'INFO',
    sentryEnabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    timestamp: new Date().toISOString()
  });
}