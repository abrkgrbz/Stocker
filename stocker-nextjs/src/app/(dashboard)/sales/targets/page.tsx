'use client';

/**
 * Sales Targets Page
 * Gamified dashboard for Sales Representatives
 * Monochrome design system
 */

import React, { useState } from 'react';
import { CrosshairIcon } from 'lucide-react';
import {
  TargetGrid,
  TargetStatistics,
  useSalesTargets,
} from '@/features/sales';
import type { SalesTargetQueryParams } from '@/features/sales';

export default function SalesTargetsPage() {
  const [params, setParams] = useState<SalesTargetQueryParams>({});

  // Get target count for header
  const { data } = useSalesTargets(params);
  const targetCount = data?.totalCount ?? 0;

  const handleParamsChange = (newParams: SalesTargetQueryParams) => {
    setParams(newParams);
  };

  const handleViewDetails = (id: string) => {
    // Navigate to target details page or open modal
    console.log('View target details:', id);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <CrosshairIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Satis Hedefleri</h1>
              <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                {targetCount} hedef
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Satis temsilcilerinin performansini takip edin
            </p>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <TargetStatistics className="mb-8" />

      {/* Targets Grid with Filters and Leaderboard */}
      <TargetGrid
        params={params}
        onParamsChange={handleParamsChange}
        onViewDetails={handleViewDetails}
        showFilters
        showLeaderboard
      />
    </div>
  );
}
