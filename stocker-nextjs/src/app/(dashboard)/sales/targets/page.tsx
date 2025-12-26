'use client';

/**
 * Sales Targets Page
 * Gamified dashboard for Sales Representatives
 * Refactored to Feature-Based Architecture
 */

import React, { useState } from 'react';
import { PageContainer, ListPageHeader } from '@/components/ui/enterprise-page';
import { AimOutlined } from '@ant-design/icons';
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
    <PageContainer maxWidth="6xl">
      <ListPageHeader
        icon={<AimOutlined />}
        iconColor="#f59e0b"
        title="Satış Hedefleri"
        description="Satış temsilcilerinin performansını takip edin"
        itemCount={targetCount}
      />

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
    </PageContainer>
  );
}
