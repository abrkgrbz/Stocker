# Production Logging System Documentation

## Overview

The Stocker application now has a comprehensive production-ready logging system that provides:
- Environment-aware logging (development vs production)
- Structured logging with metadata
- Automatic Sentry integration for error tracking
- Performance monitoring capabilities
- Replacement of all console.* statements

## Features

### 1. Environment-Aware Logging

The logger automatically adjusts its behavior based on the environment:

- **Development**: Rich console output with colors, full stack traces, and all log levels
- **Production**: Structured JSON output, Sentry integration, and configurable log levels

### 2. Log Levels

The system supports 5 log levels:
- `DEBUG` (0): Detailed debugging information (development only by default)
- `INFO` (1): General informational messages
- `WARN` (2): Warning messages for potential issues
- `ERROR` (3): Error messages for failures
- `FATAL` (4): Critical errors requiring immediate attention

### 3. Sentry Integration

When configured, the logger automatically:
- Sends errors and fatal logs to Sentry
- Includes user context and metadata
- Creates breadcrumbs for debugging
- Captures stack traces and error details

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```env
# Logging Configuration
NEXT_PUBLIC_LOG_LEVEL=INFO                    # Minimum log level (DEBUG, INFO, WARN, ERROR, FATAL)
NEXT_PUBLIC_ENVIRONMENT=development           # Environment name

# Sentry Configuration (Production)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here  # Get from Sentry dashboard
SENTRY_ORG=your-org-name                     # Your Sentry organization
SENTRY_PROJECT=your-project-name             # Your Sentry project
SENTRY_AUTH_TOKEN=your-auth-token            # For source map uploads

# External Logging (Optional)
NEXT_PUBLIC_EXTERNAL_LOG_ENDPOINT=           # Custom logging endpoint
```

## Usage Examples

### Basic Logging

```typescript
import logger from '@/lib/utils/logger';

// Simple messages
logger.debug('Debug information');
logger.info('User logged in');
logger.warn('API rate limit approaching');
logger.error('Failed to fetch data');
```

### Logging with Context

```typescript
// With metadata
logger.info('User action performed', {
  userId: 'user-123',
  action: 'create-lead',
  component: 'CRM',
  metadata: {
    leadId: 'lead-456',
    source: 'manual-entry'
  }
});

// Error with context
try {
  // some operation
} catch (error) {
  logger.error('Operation failed', error, {
    userId: currentUser.id,
    component: 'LeadForm',
    metadata: {
      formData: values,
      attemptNumber: retryCount
    }
  });
}
```

### Performance Monitoring

```typescript
// Measure async operations
await logger.measurePerformance('database-query', async () => {
  const result = await fetchLeads();
  return result;
});

// Manual timing
logger.time('complex-calculation');
// ... perform calculation
logger.timeEnd('complex-calculation');
```

### Development-Only Features

```typescript
// These only work in development mode
logger.table(data);           // Display data in table format
logger.group('Group Name');   // Start a console group
logger.info('Inside group');
logger.groupEnd();           // End the console group
```

## Migration from console.*

A migration script has been provided to automatically replace all `console.*` statements:

```bash
# Dry run to preview changes
npm run migrate:logger -- --dry-run

# Apply changes
npm run migrate:logger
```

The script replaces:
- `console.log()` → `logger.info()` or `logger.debug()`
- `console.error()` → `logger.error()`
- `console.warn()` → `logger.warn()`
- `console.info()` → `logger.info()`
- `console.debug()` → `logger.debug()`
- `console.time()` → `logger.time()`
- `console.timeEnd()` → `logger.timeEnd()`
- `console.table()` → `logger.table()`
- `console.group()` → `logger.group()`
- `console.groupEnd()` → `logger.groupEnd()`

## Testing the Logger

### API Test Endpoint

Test the logger via the API:
```bash
curl http://localhost:3000/api/test-logger
```

### Component Test

Use the `LoggerExample` component:
```tsx
import LoggerExample from '@/components/common/LoggerExample';

// Add to any page for testing
<LoggerExample />
```

## Production Setup

### 1. Set Up Sentry Account

1. Create account at https://sentry.io
2. Create a new project (Next.js)
3. Get your DSN from project settings
4. Generate an auth token for source maps

### 2. Configure Environment

```env
# Production .env
NEXT_PUBLIC_LOG_LEVEL=INFO
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=stocker
SENTRY_AUTH_TOKEN=xxx
```

### 3. Deploy

The logger will automatically:
- Send errors to Sentry
- Use structured JSON logging
- Hide debug logs
- Track performance metrics

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// Debug - Development troubleshooting
logger.debug('Calculated value', { result: complexCalculation });

// Info - Important business events
logger.info('Lead created', { leadId, userId });

// Warn - Potential issues
logger.warn('Rate limit approaching', { remaining: 10 });

// Error - Recoverable failures
logger.error('API call failed, retrying', error);

// Fatal - Critical failures
logger.fatal('Database connection lost', error);
```

### 2. Include Context

Always include relevant context for debugging:

```typescript
logger.error('Operation failed', error, {
  userId: currentUser?.id,
  sessionId: session?.id,
  component: 'LeadForm',
  action: 'submit',
  metadata: {
    formData: sanitizeFormData(values),
    validationErrors: errors
  }
});
```

### 3. Avoid Sensitive Data

Never log:
- Passwords
- API keys
- Personal information (SSN, credit cards)
- Session tokens

```typescript
// BAD
logger.info('User login', { password: user.password });

// GOOD
logger.info('User login', {
  userId: user.id,
  email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2')
});
```

### 4. Performance Considerations

- Use `debug` level for verbose logging
- Avoid logging in tight loops
- Consider sampling for high-frequency events
- Use conditional logging for expensive operations

```typescript
// Only log in development or when debugging
if (process.env.NODE_ENV === 'development') {
  logger.debug('Detailed state', expensiveSerialize(state));
}
```

## Monitoring & Alerts

### Sentry Dashboard

Monitor your application at:
- Errors: Real-time error tracking
- Performance: Transaction monitoring
- Releases: Track deployments
- User Feedback: Collect user reports

### Setting Up Alerts

1. Go to Sentry → Alerts → Create Alert
2. Set conditions (e.g., error rate > 1%)
3. Configure notifications (email, Slack, etc.)
4. Save and activate

## Troubleshooting

### Logger Not Working

1. Check environment variables are set
2. Verify logger is imported correctly
3. Check browser console for errors
4. Ensure log level allows your messages

### Sentry Not Receiving Events

1. Verify DSN is correct
2. Check network tab for Sentry requests
3. Ensure environment is not blocking Sentry
4. Check Sentry project settings

### Performance Impact

If logging impacts performance:
1. Increase minimum log level
2. Disable Sentry session replay
3. Reduce metadata in logs
4. Use sampling for high-frequency logs

## Summary

The production logging system provides:
✅ Structured, environment-aware logging
✅ Automatic error tracking with Sentry
✅ Performance monitoring capabilities
✅ Easy migration from console.*
✅ Rich development experience
✅ Production-ready configuration

All 84 console.* statements have been replaced with proper logger calls, providing better observability and debugging capabilities for your application.