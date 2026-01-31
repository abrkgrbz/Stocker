import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Enable preview/draft mode for CMS content
 * Usage: /preview?slug=test-page&secret=YOUR_SECRET&type=page
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const type = searchParams.get('type') || 'page';

  const previewSecret = process.env.CMS_PREVIEW_SECRET;

  console.log('[CMS Preview] Request received:', {
    slug,
    type,
    secretConfigured: !!previewSecret,
  });

  if (!previewSecret) {
    return NextResponse.json(
      { error: 'Preview secret not configured' },
      { status: 500 }
    );
  }

  if (secret !== previewSecret) {
    return NextResponse.json(
      { error: 'Invalid preview secret' },
      { status: 401 }
    );
  }

  if (!slug) {
    return NextResponse.json(
      { error: 'Slug parameter is required' },
      { status: 400 }
    );
  }

  // Enable Draft Mode using Next.js API
  const draft = await draftMode();
  draft.enable();

  console.log('[CMS Preview] Draft mode enabled, redirecting...');

  // Determine redirect URL based on type
  let redirectUrl: string;
  switch (type) {
    case 'blog':
      redirectUrl = `/blog/${slug}`;
      break;
    case 'docs':
      redirectUrl = `/docs/${slug}`;
      break;
    case 'page':
    default:
      redirectUrl = `/${slug}`;
      break;
  }

  redirect(redirectUrl);
}
