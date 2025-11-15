// This file configures the initialization of Sentry on the client side
import * as Sentry from "@sentry/nextjs";

// Get subdomain from URL to tag errors
const getSubdomain = () => {
  if (typeof window === 'undefined') return 'unknown';

  const hostname = window.location.hostname;

  // Handle localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'localhost';
  }

  // Extract subdomain from hostname
  // e.g., "company1.stoocker.app" -> "company1"
  const parts = hostname.split('.');

  // If it's just "stoocker.app" or "www.stoocker.app"
  if (parts.length === 2 || (parts.length === 3 && parts[0] === 'www')) {
    return 'main';
  }

  // Return the first part as subdomain
  return parts[0];
};

Sentry.init({
  // Fallback to hardcoded DSN if env vars not available (Coolify build compatibility)
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://a70b942af7e82a02c637a852f0782226@o4510349217431552.ingest.de.sentry.io/4510349218807888',

  // Use tunnel to bypass ad blockers and privacy tools
  tunnel: "/monitoring",

  // Dynamically set environment based on subdomain
  environment: process.env.NODE_ENV === 'production' ? `production-${getSubdomain()}` : 'development',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry
  debug: true,

  // Session Replay - DISABLED temporarily to fix "Multiple instances" error
  // TODO: Re-enable after verifying single initialization
  // replaysOnErrorSampleRate: 1.0,
  // replaysSessionSampleRate: 0.1,

  // integrations: [
  //   Sentry.replayIntegration({
  //     maskAllText: true,
  //     blockAllMedia: true,
  //   }),
  // ],

  // Add subdomain as initial scope
  initialScope: {
    tags: {
      subdomain: getSubdomain(),
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    },
    user: {
      // This will be overridden when user logs in, but helps track anonymous users per subdomain
      segment: getSubdomain(),
    },
  },

  // Before sending event, add subdomain context
  beforeSend(event, hint) {
    // Add subdomain to tags
    if (!event.tags) event.tags = {};
    event.tags.subdomain = getSubdomain();
    event.tags.full_url = typeof window !== 'undefined' ? window.location.href : 'unknown';

    // Add subdomain to fingerprint to separate errors by subdomain
    if (!event.fingerprint) event.fingerprint = [];
    event.fingerprint.push(getSubdomain());

    // Add subdomain to context
    if (!event.contexts) event.contexts = {};
    event.contexts.subdomain = {
      name: getSubdomain(),
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    };

    return event;
  },
});