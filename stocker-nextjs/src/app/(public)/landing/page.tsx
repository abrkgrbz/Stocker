'use client';

import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import SocialProof from '@/components/landing/SocialProof';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <SocialProof />
      <FeaturesSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
