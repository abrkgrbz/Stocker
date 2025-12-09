'use client';

import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import IndustriesSection from '@/components/landing/IndustriesSection';
import IntegrationsSection from '@/components/landing/IntegrationsSection';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <IndustriesSection />
      <IntegrationsSection />
      <PricingSection />
      <FAQSection />
      <TestimonialsSection />
      <Footer />
    </main>
  );
}
