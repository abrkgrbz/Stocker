/**
 * Landing Page - Server Component
 * Fetches all landing page data from CMS and passes to client components
 */

import { Metadata } from 'next';
import {
  getActiveFeatures,
  getFeaturedTestimonials,
  getActivePricingPlans,
  getActiveFaqItems,
  getActiveFaqCategories,
  getActiveStats,
  getActivePartners,
} from '@/lib/api/services/cms-server';
import LandingPageClient from './LandingPageClient';

export const metadata: Metadata = {
  title: 'Stoocker - Modern Envanter ve Is Yonetimi',
  description: 'Turkiye\'nin en kapsamli envanter yonetim sistemi. Stok takibi, e-fatura, CRM ve daha fazlasi tek platformda.',
  keywords: 'envanter yonetimi, stok takibi, e-fatura, crm, erp, is yonetimi, stocker',
  openGraph: {
    title: 'Stoocker - Modern Envanter ve Is Yonetimi',
    description: 'Turkiye\'nin en kapsamli envanter yonetim sistemi.',
    type: 'website',
    url: 'https://stoocker.app',
    images: [{ url: 'https://stoocker.app/images/og-landing.png' }],
  },
};

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function LandingPage() {
  // Fetch all landing page data in parallel
  const [
    features,
    testimonials,
    pricingPlans,
    faqItems,
    faqCategories,
    stats,
    partners,
  ] = await Promise.all([
    getActiveFeatures(),
    getFeaturedTestimonials(),
    getActivePricingPlans(),
    getActiveFaqItems(),
    getActiveFaqCategories(),
    getActiveStats(),
    getActivePartners(),
  ]);

  return (
    <LandingPageClient
      features={features}
      testimonials={testimonials}
      pricingPlans={pricingPlans}
      faqItems={faqItems}
      faqCategories={faqCategories}
      stats={stats}
      partners={partners}
    />
  );
}
