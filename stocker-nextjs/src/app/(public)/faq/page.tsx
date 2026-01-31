/**
 * FAQ Page - Server Component
 * Fetches FAQ items and categories from CMS
 */

import { Metadata } from 'next';
import { getActiveFaqItems, getActiveFaqCategories } from '@/lib/api/services/cms-server';
import FAQPageClient from './FAQPageClient';

export const metadata: Metadata = {
  title: 'Sikca Sorulan Sorular | Stoocker',
  description: 'Stoocker hakkinda merak ettiginiz tum sorularin cevaplari. Fiyatlandirma, ozellikler, guvenlik ve destek hakkinda bilgi alin.',
  keywords: 'stoocker sss, sikca sorulan sorular, yardim, destek, fiyatlandirma',
  openGraph: {
    title: 'Sikca Sorulan Sorular | Stoocker',
    description: 'Stoocker hakkinda merak ettiginiz tum sorularin cevaplari.',
    type: 'website',
    url: 'https://stoocker.app/faq',
  },
};

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function FAQPage() {
  const [faqItems, faqCategories] = await Promise.all([
    getActiveFaqItems(),
    getActiveFaqCategories(),
  ]);

  return <FAQPageClient items={faqItems} categories={faqCategories} />;
}
