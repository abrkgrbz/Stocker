'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import TenantCreationProgress from '@/components/registration/TenantCreationProgress';
import LoginShowcase from '@/components/auth/LoginShowcase';

// Dynamic import for GradientMesh to avoid SSR issues with Three.js
const GradientMesh = dynamic(() => import('@/components/landing/GradientMesh'), {
  ssr: false,
  loading: () => null,
});

function TenantCreationContent() {
  return (
    <div className="auth-page min-h-screen flex">
      {/* Left Panel - Corporate Branding with Testimonial */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0c0f1a] relative overflow-hidden">
        {/* Gradient Mesh Animation Background */}
        <div className="absolute inset-0">
          <Suspense fallback={<div className="absolute inset-0 bg-[#0c0f1a]" />}>
            <GradientMesh />
          </Suspense>
        </div>

        {/* Content with Transparent Showcase */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <LoginShowcase transparent={true} theme="light" />
        </div>
      </div>

      {/* Right Panel - Process Display */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">Ana Sayfa</span>
        </Link>

        <div className="w-full max-w-xl">
          <TenantCreationProgress />
        </div>
      </div>
    </div>
  );
}

export default function TenantCreationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="mt-4 text-slate-600">Yükleniyor...</p>
          </div>
        </div>
      }
    >
      <TenantCreationContent />
    </Suspense>
  );
}
