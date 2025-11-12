# Sentry Error Tracking Setup

## Configuration Complete ✅

Sentry has been successfully integrated into the Stocker application with the following configuration:

### Environment Variables Set

```env
# Development (.env.local)
NEXT_PUBLIC_LOG_LEVEL=DEBUG
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_DSN=https://a70b942af7e82a02c637a852f0782226@o4510349217431552.ingest.de.sentry.io/4510349218807888
SENTRY_DSN=https://a70b942af7e82a02c637a852f0782226@o4510349217431552.ingest.de.sentry.io/4510349218807888
SENTRY_ORG=stocker-0p
SENTRY_PROJECT=stocker-nextjs
```

### Sentry Dashboard

Access your Sentry dashboard at: https://stocker-0p.sentry.io

### Features Configured

1. **Error Tracking**: All errors are automatically sent to Sentry
2. **Performance Monitoring**: Transaction tracking enabled
3. **Session Replay**: Records user sessions when errors occur (10% sample rate)
4. **Breadcrumbs**: Automatic trail of user actions before errors
5. **Source Maps**: Will be uploaded during production builds
6. **User Context**: Tracks user IDs and session information

### Test Pages Available

1. **Test Sentry Page**: http://localhost:3000/test-sentry
   - Interactive UI to test different error scenarios
   - Test uncaught errors, async errors, warnings
   - Performance monitoring tests

2. **Logger Test API**: http://localhost:3000/api/test-logger
   - Tests logger functionality
   - Verifies Sentry is enabled

3. **Error Test API**: http://localhost:3000/api/test-sentry-error
   - Sends a test error directly to Sentry
   - Returns confirmation with dashboard link

### Production Deployment Checklist

Before deploying to production:

1. **Set Environment Variables**:
   ```env
   NEXT_PUBLIC_LOG_LEVEL=INFO  # or WARN for production
   NEXT_PUBLIC_ENVIRONMENT=production
   NEXT_PUBLIC_SENTRY_DSN=<your-dsn>
   SENTRY_AUTH_TOKEN=<your-auth-token>  # For source map uploads
   ```

2. **Configure Alerts**:
   - Go to Sentry → Alerts → Create Alert Rule
   - Set up email/Slack notifications for errors
   - Configure thresholds (e.g., error rate > 1%)

3. **Set Up Releases**:
   - Tag your releases with version numbers
   - Upload source maps for better stack traces
   - Track deployment health

4. **Monitor Performance**:
   - Enable performance monitoring
   - Set up performance alerts
   - Track key transactions

### Verification Steps

1. **Check Sentry Dashboard**:
   - Visit https://stocker-0p.sentry.io/issues/
   - You should see test errors from the API calls

2. **Test Error Capture**:
   ```bash
   curl http://localhost:3000/api/test-sentry-error
   ```

3. **View in Sentry**:
   - Errors appear in real-time
   - Stack traces are properly formatted
   - User context is attached

### Logger Usage in Code

```typescript
import logger from '@/lib/utils/logger';

// Simple logging
logger.info('User action', { userId, action });
logger.error('Operation failed', error, { context });

// Performance monitoring
await logger.measurePerformance('operation', async () => {
  // ... your code
});
```

### Migration Complete

- ✅ 84 console.* statements replaced with logger
- ✅ 15 files migrated to use structured logging
- ✅ Sentry integration active
- ✅ Error tracking operational
- ✅ Development and production configurations ready

### Support

For issues or questions:
- Sentry Documentation: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Logger Documentation: /docs/LOGGING_SYSTEM.md
- Test Pages: /test-sentry and /api/test-logger