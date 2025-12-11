'use client';

import React from 'react';
import Navbar from '@/components/landing/Navbar';
import AnimatedHero from '@/components/landing/AnimatedHero';
import SocialProof from '@/components/landing/SocialProof';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ProductDemo from '@/components/landing/ProductDemo';
import PricingSection from '@/components/landing/PricingSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FAQSection from '@/components/landing/FAQSection';
import Footer from '@/components/landing/Footer';
import AnimatedBackground from '@/components/landing/AnimatedBackground';
import StructuredData from '@/components/landing/StructuredData';

export default function Home() {
  // Landing page is public - no auth check needed
  // This prevents the screen flicker caused by isLoading → null → content

  // Optimized landing page flow:
  // 1. Hero - Main value proposition + CTA
  // 2. Social Proof - Trust signals (logos/stats)
  // 3. Features - Key benefits (simplified)
  // 4. Product Demo - Visual showcase
  // 5. Testimonials - Customer validation
  // 6. Pricing - Clear pricing options
  // 7. FAQ - Address objections
  // 8. Footer - Final CTA

  return (
    <>
      <StructuredData />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <AnimatedBackground />
        <Navbar />
        <AnimatedHero />
        <SocialProof />
        <FeaturesSection />
        <ProductDemo />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <Footer />
      </main>
    </>
  );
}
