import { Suspense } from 'react';
import { Metadata } from 'next';
import {
  getActiveTeamMembers,
  getActiveCompanyValues,
  getActiveStats,
} from '@/lib/api/services/cms-server';
import AboutPageClient from './AboutPageClient';
import AboutSkeleton from './AboutSkeleton';

export const revalidate = 3600; // 1 hour

export const metadata: Metadata = {
  title: 'Hakkimizda | Stoocker',
  description:
    'Stoocker hakkinda bilgi edinin. Vizyonumuz, misyonumuz, degerlerimiz ve yonetim kadromuz.',
  openGraph: {
    title: 'Hakkimizda | Stoocker',
    description:
      'Stoocker hakkinda bilgi edinin. Vizyonumuz, misyonumuz, degerlerimiz ve yonetim kadromuz.',
    type: 'website',
  },
};

export default async function AboutPage() {
  const [teamMembers, companyValues, stats] = await Promise.all([
    getActiveTeamMembers(),
    getActiveCompanyValues(),
    getActiveStats(),
  ]);

  return (
    <Suspense fallback={<AboutSkeleton />}>
      <AboutPageClient
        teamMembers={teamMembers}
        companyValues={companyValues}
        stats={stats}
      />
    </Suspense>
  );
}
