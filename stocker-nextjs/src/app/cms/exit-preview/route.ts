import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Exit preview/draft mode
 * Usage: /cms/exit-preview or /cms/exit-preview?redirect=/some-page
 *
 * Note: This route is outside /api/ to avoid being proxied to backend
 * by next.config.mjs rewrites
 */
export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();

  // Check for redirect parameter
  const redirectUrl = request.nextUrl.searchParams.get('redirect');

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  return NextResponse.json({
    success: true,
    message: 'Draft mode disabled'
  });
}
