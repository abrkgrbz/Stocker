import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Exit preview/draft mode
 * Usage: /api/cms/exit-preview
 */
export async function GET() {
  const draft = await draftMode();
  draft.disable();

  return NextResponse.json({
    success: true,
    message: 'Draft mode disabled'
  });
}
