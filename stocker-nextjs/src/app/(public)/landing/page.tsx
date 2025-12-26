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

export default function LandingPage() {
  return (
    <LandingThemeProvider>
      <main className="min-h-screen bg-white transition-colors duration-300">
        <HeroSection />
        <SocialProof />
        <FeaturesSection />
        <PricingSection />
        <FAQSection />
        <Footer />
        <FloatingActions />
      </main>
    </LandingThemeProvider>
  );
}
