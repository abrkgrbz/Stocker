/**
 * Documentation Page - Server Component
 * Fetches documentation categories and popular articles from CMS
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { getActiveDocCategories, getPopularDocArticles, getActiveDocArticles } from '@/lib/api/services/cms-server';
import DocsPageClient from './DocsPageClient';
import DocsSkeleton from './DocsSkeleton';

export const metadata: Metadata = {
  title: 'Dokumantasyon | Stoocker',
  description: 'Stoocker envanter yonetim sistemini en verimli sekilde kullanmak icin ihtiyaciniz olan tum bilgiler ve rehberler.',
  keywords: 'stoocker dokumantasyon, envanter yonetimi rehberi, stok takibi kilavuzu, kullanim kilavuzu',
  openGraph: {
    title: 'Dokumantasyon | Stoocker',
    description: 'Stoocker envanter yonetim sistemini en verimli sekilde kullanmak icin ihtiyaciniz olan tum bilgiler.',
    type: 'website',
    url: 'https://stoocker.app/docs',
  },
};

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function DocsPage() {
  // Fetch categories and popular articles in parallel
  const [categories, popularArticles, allArticles] = await Promise.all([
    getActiveDocCategories(),
    getPopularDocArticles(),
    getActiveDocArticles(),
  ]);

  // If no popular articles from API, use the most recent articles
  const displayedPopularArticles = popularArticles.length > 0
    ? popularArticles.slice(0, 5)
    : allArticles.slice(0, 5);

  return (
    <Suspense fallback={<DocsSkeleton />}>
      <DocsPageClient
        categories={categories}
        popularArticles={displayedPopularArticles}
      />
    </Suspense>
  );
}
