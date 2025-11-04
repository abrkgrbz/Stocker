'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Navbar from '@/components/landing/Navbar';
import AnimatedHero from '@/components/landing/AnimatedHero';
import SocialProof from '@/components/landing/SocialProof';
import FeaturesSection from '@/components/landing/FeaturesSection';
import IndustriesSection from '@/components/landing/IndustriesSection';
import IntegrationsSection from '@/components/landing/IntegrationsSection';
import ProductDemo from '@/components/landing/ProductDemo';
import AnimatedStats from '@/components/landing/AnimatedStats';
import ParallaxSection from '@/components/landing/ParallaxSection';
import PricingSection from '@/components/landing/PricingSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FAQSection from '@/components/landing/FAQSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import AnimatedBackground from '@/components/landing/AnimatedBackground';
import StructuredData from '@/components/landing/StructuredData';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Don't redirect authenticated users - let them see the landing page
  // They can navigate to /app via the navbar button

  // Show loading state
  if (isLoading) {
    return null;
  }

  return (
    <>
      <StructuredData />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <AnimatedBackground />
        <Navbar />
        <AnimatedHero />
        <SocialProof />
        <FeaturesSection />
        <IndustriesSection />
        <IntegrationsSection />
        <ProductDemo />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedStats />
        </div>
        <ParallaxSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
        <Footer />
      </main>
    </>
  );
}
