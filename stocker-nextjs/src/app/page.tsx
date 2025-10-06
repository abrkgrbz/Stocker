'use client';

import React from 'react';
import Navbar from '@/components/landing/Navbar';
import AnimatedHero from '@/components/landing/AnimatedHero';
import SocialProof from '@/components/landing/SocialProof';
import FeaturesSection from '@/components/landing/FeaturesSection';
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
