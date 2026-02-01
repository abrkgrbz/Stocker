import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Exit preview/draft mode
 * Usage: /exit-preview or /exit-preview?redirect=/some-page
 */
export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();

  console.log('[CMS Preview] Draft mode disabled');

  // Redirect to homepage by default if no redirect param provided
  redirect(redirectUrl || '/');
}
