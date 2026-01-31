import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering - ensures env vars are read at runtime
export const dynamic = 'force-dynamic';

/**
 * Enable preview/draft mode for CMS content
 * Usage: /api/cms/preview?slug=test-page&secret=YOUR_SECRET
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const type = searchParams.get('type') || 'page'; // page, blog, docs

  // Check the secret - read at runtime
  const previewSecret = process.env.CMS_PREVIEW_SECRET;

  // Debug log
  console.log('[CMS Preview] Request received, secret configured:', !!previewSecret);

  if (!previewSecret) {
    return NextResponse.json(
      {
        error: 'Preview secret not configured',
        hint: 'Set CMS_PREVIEW_SECRET environment variable'
      },
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

  // Enable Draft Mode
  const draft = await draftMode();
  draft.enable();

  // Redirect to the appropriate page based on type
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
