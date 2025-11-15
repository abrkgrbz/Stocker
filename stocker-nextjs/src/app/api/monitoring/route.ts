/**
 * Sentry Tunnel Route
 * Bypasses ad blockers by proxying Sentry requests through our server
 * This prevents browser extensions from blocking error reporting
 */

import { NextRequest, NextResponse } from 'next/server';

const SENTRY_HOST = 'sentry.io';
const SENTRY_PROJECT_IDS = ['4510349218807888']; // Add your project IDs here

export async function POST(request: NextRequest) {
  try {
    const envelope = await request.text();
    const pieces = envelope.split('\n');
    const header = JSON.parse(pieces[0]);

    // Extract DSN from header or use default
    let dsn = header.dsn;

    // If no DSN in envelope, use our hardcoded DSN (fallback for client config issues)
    if (!dsn) {
      console.warn('No DSN in envelope, using default DSN');
      dsn = 'https://a70b942af7e82a02c637a852f0782226@o4510349217431552.ingest.de.sentry.io/4510349218807888';
    }

    // Parse DSN
    const dsnUrl = new URL(dsn);
    const projectId = dsnUrl.pathname.replace('/', '');

    // Validate project ID
    if (!SENTRY_PROJECT_IDS.includes(projectId)) {
      console.error(`Invalid project ID: ${projectId}`);
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    // Construct Sentry ingestion URL
    const sentryIngestUrl = `https://${dsnUrl.hostname}/api/${projectId}/envelope/`;

    // Forward to Sentry
    const sentryResponse = await fetch(sentryIngestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
      body: envelope,
    });

    // Log success/failure
    if (sentryResponse.ok) {
      console.log(`✅ Sentry event forwarded successfully for project ${projectId}`);
    } else {
      console.error(`❌ Sentry forwarding failed: ${sentryResponse.status} ${sentryResponse.statusText}`);
    }

    return new NextResponse(null, {
      status: sentryResponse.status,
      statusText: sentryResponse.statusText,
    });
  } catch (error) {
    console.error('Sentry tunnel error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
