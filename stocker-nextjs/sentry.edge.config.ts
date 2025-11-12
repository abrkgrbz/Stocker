// This file configures the initialization of Sentry for edge features (middleware, edge routes, etc.)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set environment
  environment: process.env.NODE_ENV === 'production' ? 'production-edge' : 'development-edge',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry
  debug: false,

  // Before sending event, add edge runtime context
  beforeSend(event, hint) {
    // Add runtime tag
    if (!event.tags) event.tags = {};
    event.tags.runtime = 'edge';

    // Add edge context
    if (!event.contexts) event.contexts = {};
    event.contexts.runtime = {
      name: 'edge',
      type: 'vercel-edge',
    };

    return event;
  },
});