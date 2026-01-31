import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostBySlug, getPublishedPosts } from '@/lib/api/services/cms-server';
import { generateBlogPostMetadata } from '@/lib/utils/cms-metadata';
import BlogPostContent from './BlogPostContent';

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate static params for popular posts
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.slice(0, 20).map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata from CMS
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: 'Yazı Bulunamadı | Stoocker' };
  }
  return generateBlogPostMetadata(post);
}

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  // Access cookies to force dynamic rendering when preview cookies exist
  const { cookies, draftMode } = await import('next/headers');
  const cookieStore = await cookies();
  const hasPreviewCookies = cookieStore.has('__prerender_bypass');

  // Draft Mode Check
  const draft = await draftMode();
  const isEnabled = draft.isEnabled;

  console.log(`[Blog Post] Processing slug: ${slug}, isEnabled: ${isEnabled}, hasPreviewCookies: ${hasPreviewCookies}`);

  let post;

  if (isEnabled) {
    post = await import('@/lib/api/services/cms-server').then(m => m.getPostPreview(slug));
  }

  if (!post) {
    post = await getPostBySlug(slug);
  }

  if (!post) {
    notFound();
  }

  return (
    <>
      {isEnabled && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium sticky top-0 z-50">
          <span>Önizleme Modu - Blog</span>
          <a href="/exit-preview" className="ml-4 underline hover:no-underline font-bold">Çıkış</a>
        </div>
      )}
      <BlogPostContent post={post} />
    </>
  );
}
