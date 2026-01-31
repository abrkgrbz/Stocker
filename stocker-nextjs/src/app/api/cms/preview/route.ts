import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

/**
 * CMS Preview API Route
 * Enables draft mode for previewing unpublished content
 *
 * Usage: /api/cms/preview?secret=xxx&slug=xxx&type=page|post|doc
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const type = searchParams.get('type') || 'page';

  // Validate the secret
  const previewSecret = process.env.CMS_PREVIEW_SECRET;

  if (!previewSecret) {
    return Response.json(
      { error: 'Preview secret not configured', hint: 'Set CMS_PREVIEW_SECRET environment variable' },
      { status: 500 }
    );
  }

  if (secret !== previewSecret) {
    return Response.json(
      { error: 'Invalid preview secret' },
      { status: 401 }
    );
  }

  if (!slug) {
    return Response.json(
      { error: 'Missing slug parameter' },
      { status: 400 }
    );
  }

  // Enable Draft Mode
  const draft = await draftMode();
  draft.enable();

  // Redirect to the appropriate preview page based on type
  let redirectUrl: string;

  switch (type) {
    case 'post':
      redirectUrl = `/blog/${slug}`;
      break;
    case 'doc':
      redirectUrl = `/docs/${slug}`;
      break;
    case 'page':
    default:
      redirectUrl = `/${slug}`;
      break;
  }

  // Redirect to the page with draft mode enabled
  redirect(redirectUrl);
}
