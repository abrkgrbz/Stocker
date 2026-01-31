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
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostContent post={post} />;
}
