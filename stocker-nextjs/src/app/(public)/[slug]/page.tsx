import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import { getPageBySlug, getPagePreview, getPublishedPages } from '@/lib/api/services/cms-server';
import LegalPageClient from '@/components/legal/LegalPageClient';
import { Suspense } from 'react';
import LegalPageSkeleton from '@/components/legal/LegalPageSkeleton';

// Reserved slugs that have their own routes
const RESERVED_SLUGS = [
  'about',
  'api-docs',
  'blog',
  'careers',
  'changelog',
  'contact',
  'cookies',
  'demo',
  'docs',
  'faq',
  'features',
  'help',
  'industries',
  'integrations',
  'kvkk',
  'landing',
  'pricing',
  'privacy',
  'security',
  'status',
  'support',
  'terms',
  'tutorials',
  'updates',
];

export const revalidate = 3600; // 1 hour

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const pages = await getPublishedPages();

  return pages
    .filter((page) => !RESERVED_SLUGS.includes(page.slug))
    .map((page) => ({
      slug: page.slug,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Skip reserved slugs
  if (RESERVED_SLUGS.includes(slug)) {
    return {};
  }

  const page = await getPageBySlug(slug);

  if (!page) {
    return {
      title: 'Sayfa Bulunamadı | Stoocker',
    };
  }

  return {
    title: page.metaTitle || `${page.title} | Stoocker`,
    description: page.metaDescription || page.content?.substring(0, 160),
    openGraph: {
      title: page.metaTitle || page.title,
      description: page.metaDescription || page.content?.substring(0, 160),
      type: 'website',
      images: page.featuredImage ? [page.featuredImage] : undefined,
    },
  };
}

export default async function DynamicCMSPage({ params }: PageProps) {
  const { slug } = await params;

  // Skip reserved slugs - they have their own routes
  if (RESERVED_SLUGS.includes(slug)) {
    notFound();
  }

  // Check if we're in draft mode
  const draft = await draftMode();
  const isPreview = draft.isEnabled;

  let page;

  if (isPreview) {
    // In preview mode, use shared secret to fetch any status page
    page = await getPagePreview(slug);

    // If preview fails, fall back to published version
    if (!page) {
      page = await getPageBySlug(slug);
    }
  } else {
    // Normal mode - only published pages
    page = await getPageBySlug(slug);
  }

  if (!page) {
    notFound();
  }

  return (
    <>
      {/* Preview Mode Banner */}
      {isPreview && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium">
          <span>Önizleme Modu</span>
          <span className="mx-2">•</span>
          <span>Status: {page.status}</span>
          <span className="mx-2">•</span>
          <a
            href="/_cms/exit-preview"
            className="underline hover:no-underline"
          >
            Önizlemeden Çık
          </a>
        </div>
      )}

      <Suspense fallback={<LegalPageSkeleton />}>
        <LegalPageClient
          page={page}
          fallbackTitle={page.title}
          fallbackSlug={slug}
          fallbackContent={page.content}
        />
      </Suspense>
    </>
  );
}
