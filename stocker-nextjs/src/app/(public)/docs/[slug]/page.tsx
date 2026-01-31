/**
 * Documentation Article Detail Page - Server Component
 * Dynamic route for individual doc articles with SEO and ISR
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDocArticleBySlug, getActiveDocArticles } from '@/lib/api/services/cms-server';
import { generateDocArticleMetadata } from '@/lib/utils/cms-metadata';
import DocArticleContent from './DocArticleContent';

interface DocArticlePageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate static params for popular articles at build time
 */
export async function generateStaticParams() {
  const articles = await getActiveDocArticles();

  // Pre-render the top 30 most viewed articles
  return articles
    .slice(0, 30)
    .map((article) => ({
      slug: article.slug,
    }));
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: DocArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getDocArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Makale Bulunamadi | Stoocker Dokumantasyon',
      description: 'Aradiginiz dokumantasyon makalesi bulunamadi.',
    };
  }

  return generateDocArticleMetadata(article);
}

// Revalidate every 10 minutes
export const revalidate = 600;

export default async function DocArticlePage({ params }: DocArticlePageProps) {
  const { slug } = await params;

  // Draft Mode Check
  const { isEnabled } = await import('next/headers').then(m => m.draftMode());
  let article;

  if (isEnabled) {
    article = await import('@/lib/api/services/cms-server').then(m => m.getDocArticlePreview(slug));
  }

  if (!article) {
    article = await getDocArticleBySlug(slug);
  }

  if (!article) {
    notFound();
  }

  // Fetch related articles from the same category
  const allArticles = await getActiveDocArticles();
  const relatedArticles = allArticles
    .filter(a => a.categoryId === article.categoryId && a.id !== article.id)
    .slice(0, 3);

  return <DocArticleContent article={article} relatedArticles={relatedArticles} />;
}
