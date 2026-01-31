import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

/**
 * CMS Exit Preview API Route
 * Disables draft mode and returns to normal view
 *
 * Usage: /api/cms/exit-preview?redirect=/path
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectUrl = searchParams.get('redirect') || '/';

  // Disable Draft Mode
  const draft = await draftMode();
  draft.disable();

  // Redirect to the specified URL or home
  redirect(redirectUrl);
}
