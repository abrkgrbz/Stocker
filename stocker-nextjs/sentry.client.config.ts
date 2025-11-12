// This file configures the initialization of Sentry on the client side
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Use tunnel to bypass ad blockers
  tunnel: "/monitoring",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry
  debug: true,

  // Session Replay
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Additional options to help with debugging
  beforeSend(event, hint) {
    // Log events to console in debug mode
    console.log('Sentry Event being sent:', event);
    console.log('Sentry Hint:', hint);
    return event;
  },
});