// This file configures the initialization of Sentry on the server side
import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";

// Extract subdomain from host header
const getSubdomainFromHost = (host: string) => {
  // Handle localhost
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'localhost';
  }

  // Remove port if exists
  const hostname = host.split(':')[0];

  // Extract subdomain
  const parts = hostname.split('.');

  // If it's just "stoocker.app" or "www.stoocker.app"
  if (parts.length === 2 || (parts.length === 3 && parts[0] === 'www')) {
    return 'main';
  }

  // Return the first part as subdomain
  return parts[0];
};

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set environment
  environment: process.env.NODE_ENV === 'production' ? 'production-server' : 'development-server',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry
  debug: true,

  // Before sending event, add subdomain context from request headers
  beforeSend(event, hint) {
    // Try to get host from hint's request
    let subdomain = 'unknown';

    if (hint?.originalException && typeof hint.originalException === 'object' && 'request' in hint.originalException) {
      const request = (hint.originalException as any).request;
      if (request?.headers?.host) {
        subdomain = getSubdomainFromHost(request.headers.host);
      }
    }

    // Add subdomain to tags
    if (!event.tags) event.tags = {};
    event.tags.subdomain = subdomain;
    event.tags.runtime = 'server';

    // Add subdomain to fingerprint
    if (!event.fingerprint) event.fingerprint = [];
    event.fingerprint.push(subdomain);

    // Add subdomain to context
    if (!event.contexts) event.contexts = {};
    event.contexts.subdomain = {
      name: subdomain,
      runtime: 'server',
    };

    return event;
  },
});