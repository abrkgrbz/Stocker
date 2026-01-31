import { Suspense } from 'react';
import { Metadata } from 'next';
import { getPublishedPosts, getBlogCategories } from '@/lib/api/services/cms-server';
import BlogPageClient from './BlogPageClient';
import BlogSkeleton from './BlogSkeleton';

export const metadata: Metadata = {
  title: 'Blog | Stoocker',
  description: 'Stok yönetimi, e-ticaret ve işletme verimliliği hakkında en güncel içerikler.',
  openGraph: {
    title: 'Blog | Stoocker',
    description: 'Stok yönetimi, e-ticaret ve işletme verimliliği hakkında en güncel içerikler.',
    type: 'website',
  },
};

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getPublishedPosts(),
    getBlogCategories(),
  ]);

  return (
    <Suspense fallback={<BlogSkeleton />}>
      <BlogPageClient posts={posts} categories={categories} />
    </Suspense>
  );
}
