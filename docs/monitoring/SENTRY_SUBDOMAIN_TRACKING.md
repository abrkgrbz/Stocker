# Sentry Subdomain Tracking Guide

## Overview
Stocker uses subdomain-based multi-tenancy where each customer gets their own subdomain (e.g., `company1.stoocker.app`). This document explains how Sentry tracks errors across different subdomains.

## How It Works

### 1. Automatic Subdomain Detection
Sentry automatically detects which subdomain an error comes from and tags it accordingly:

- **Main Site**: `stoocker.app` or `www.stoocker.app` → tagged as `main`
- **Customer Subdomains**: `company1.stoocker.app` → tagged as `company1`
- **Localhost**: Development environment → tagged as `localhost`

### 2. Error Tagging
Every error sent to Sentry includes:

```javascript
{
  tags: {
    subdomain: "company1",        // Which subdomain
    hostname: "company1.stoocker.app", // Full hostname
    runtime: "client/server/edge"  // Where error occurred
  },
  environment: "production-company1", // Environment includes subdomain
  contexts: {
    subdomain: {
      name: "company1",
      hostname: "company1.stoocker.app",
      pathname: "/dashboard"
    }
  }
}
```

### 3. Error Fingerprinting
Errors are automatically grouped by subdomain. The same error on different subdomains will create separate issues in Sentry.

## Using Sentry Dashboard

### Filter by Subdomain
In Sentry dashboard, you can filter errors by subdomain:

1. Go to **Issues** page
2. Click **Search** or use the search bar
3. Use these filters:
   - `tags.subdomain:company1` - Show only company1's errors
   - `tags.subdomain:main` - Show only main site errors
   - `environment:production-company1` - Show production errors from company1

### Create Saved Searches
Save frequently used filters:

1. Apply your filters (e.g., `tags.subdomain:company1`)
2. Click **Save Search**
3. Name it (e.g., "Company1 Errors")
4. Access it from **Saved Searches** dropdown

### Set Up Alerts
Create subdomain-specific alerts:

1. Go to **Alerts** → **Create Alert**
2. Choose **Issue Alert**
3. Add condition: `The event's tags match subdomain equals company1`
4. Set action (email, Slack, etc.)

## Environments

Sentry tracks different environments:

- **Client-Side**: `production-[subdomain]` or `development`
- **Server-Side**: `production-server` or `development-server`
- **Edge Runtime**: `production-edge` or `development-edge`

Filter by environment:
- `environment:production-*` - All production errors
- `environment:*-company1` - All errors from company1

## Dashboard Views

### 1. Overview Dashboard
See all subdomains at once:
- Group by `tags.subdomain`
- See which subdomain has most errors
- Track error trends per subdomain

### 2. Customer-Specific View
Focus on single customer:
- Filter: `tags.subdomain:company1`
- See only their errors
- Track their specific issues

### 3. Runtime Analysis
Compare client vs server errors:
- Filter by `tags.runtime`
- See if errors are client-side or server-side
- Identify patterns

## Best Practices

### 1. Regular Monitoring
- Check each subdomain weekly
- Look for subdomain-specific patterns
- Monitor new subdomain deployments

### 2. Alert Configuration
- Set up alerts for critical subdomains
- Different thresholds for different customers
- VIP customer alerts with higher priority

### 3. Performance Monitoring
- Track performance per subdomain
- Identify slow subdomains
- Compare subdomain performance

## Querying Examples

### Find All Errors from a Specific Subdomain
```
tags.subdomain:company1
```

### Find Server Errors from a Subdomain
```
tags.subdomain:company1 AND tags.runtime:server
```

### Find Recent Errors (Last 24h) from Production
```
environment:production-* timestamp:-24h
```

### Find Errors from Multiple Subdomains
```
tags.subdomain:[company1, company2, company3]
```

### Find Critical Errors from VIP Customers
```
level:error tags.subdomain:[vip1, vip2]
```

## Troubleshooting

### Issue: Subdomain Shows as "unknown"
- **Cause**: Server couldn't detect subdomain from request
- **Solution**: Check request headers include proper Host header

### Issue: All Errors Grouped Together
- **Cause**: Fingerprinting not working
- **Solution**: Check `beforeSend` hook is adding subdomain to fingerprint

### Issue: Can't See Subdomain in Dashboard
- **Cause**: Tags not being sent
- **Solution**: Check Sentry configs include `beforeSend` hook

## Integration with Monitoring

The `/monitoring` endpoint (tunnel) preserves subdomain information while bypassing ad blockers.

All errors flow through:
```
Customer Browser → /monitoring (on their subdomain) → Sentry
```

This ensures subdomain context is preserved even when using the tunnel.

## Reporting

### Weekly Subdomain Report
1. Go to **Discover** in Sentry
2. Query: `SELECT subdomain, count() GROUP BY tags.subdomain`
3. Time range: Last 7 days
4. Export as CSV

### Customer Health Score
Track per subdomain:
- Error rate (errors/hour)
- Error types (client vs server)
- User impact (unique users affected)
- Performance metrics

## Support

When customer reports an issue:
1. Ask for their subdomain
2. Filter Sentry by `tags.subdomain:[their-subdomain]`
3. Look for recent errors
4. Check error details and stack traces
5. Use Session Replay if available

## Security Notes

- Each subdomain's errors are tagged but stored in same Sentry project
- Sensitive data is masked in Session Replay
- User IDs are prefixed with subdomain for privacy
- No cross-subdomain data leakage in error reports