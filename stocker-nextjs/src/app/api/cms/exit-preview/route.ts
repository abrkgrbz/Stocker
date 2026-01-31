import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Exit preview/draft mode
 * Usage: /api/cms/exit-preview or /api/cms/exit-preview?redirect=/some-page
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
