import { NextRequest, NextResponse } from 'next/server';

/**
 * Sentry Tunnel Endpoint
 * This endpoint proxies Sentry requests to bypass ad blockers and browser extensions
 * The tunnel route is configured in next.config.mjs
 */

const SENTRY_HOST = 'o4510349217431552.ingest.de.sentry.io';
const SENTRY_PROJECT_ID = '4510349218807888';

export async function POST(request: NextRequest) {
  try {
    const envelope = await request.text();
    const piece = envelope.split('\n')[0];
    const header = JSON.parse(piece);
    const dsn = new URL(header.dsn);

    // Verify this is for our Sentry project
    if (dsn.hostname !== SENTRY_HOST) {
      return NextResponse.json(
        { error: 'Invalid DSN hostname' },
        { status: 400 }
      );
    }

    const projectId = dsn.pathname?.replace('/', '');
    if (projectId !== SENTRY_PROJECT_ID) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Forward to Sentry
    const upstream_sentry_url = `https://${SENTRY_HOST}/api/${SENTRY_PROJECT_ID}/envelope/`;

    const response = await fetch(upstream_sentry_url, {
      method: 'POST',
      body: envelope,
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
    });

    // Return Sentry's response
    return NextResponse.json(
      { success: true },
      { status: response.status }
    );
  } catch (error) {
    console.error('Sentry tunnel error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to Sentry' },
      { status: 500 }
    );
  }
}

// Also handle GET requests for testing
export async function GET() {
  return NextResponse.json({
    status: 'Sentry tunnel endpoint is working',
    host: SENTRY_HOST,
    projectId: SENTRY_PROJECT_ID,
    info: 'This endpoint proxies Sentry events to bypass ad blockers',
  });
}