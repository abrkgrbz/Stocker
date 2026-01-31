'use client';

import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import SocialProof from '@/components/landing/SocialProof';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';
import Footer from '@/components/landing/Footer';
import { LandingThemeProvider } from '@/components/landing/ThemeProvider';
import FloatingActions from '@/components/landing/FloatingActions';
import type {
  Feature,
  Testimonial,
  PricingPlan,
  FaqItem,
  FaqCategory,
  Stat,
  Partner,
} from '@/lib/api/services/cms.types';

interface LandingPageClientProps {
  features: Feature[];
  testimonials: Testimonial[];
  pricingPlans: PricingPlan[];
  faqItems: FaqItem[];
  faqCategories: FaqCategory[];
  stats: Stat[];
  partners: Partner[];
}

export default function LandingPageClient({
  features,
  testimonials,
  pricingPlans,
  faqItems,
  faqCategories,
  stats,
  partners,
}: LandingPageClientProps) {
  return (
    <LandingThemeProvider>
      <main className="min-h-screen bg-white transition-colors duration-300">
        <HeroSection />
        <SocialProof stats={stats} partners={partners} />
        <FeaturesSection features={features} />
        <PricingSection plans={pricingPlans} />
        <FAQSection items={faqItems} categories={faqCategories} />
        <Footer />
        <FloatingActions />
      </main>
    </LandingThemeProvider>
  );
}
