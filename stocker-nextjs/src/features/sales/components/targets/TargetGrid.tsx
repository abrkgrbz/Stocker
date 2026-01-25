'use client';

/**
 * TargetGrid Component
 * Displays sales targets in a grid with filtering and statistics
 * Feature-Based Architecture - Smart Component
 */

import React from 'react';
import { Select, Skeleton } from 'antd';
import { Calendar, Trophy } from 'lucide-react';
import { Card, EmptyState } from '@/components/ui/enterprise-page';
import { TargetCard } from './TargetCard';
import { Leaderboard } from './Leaderboard';
import {
  useSalesTargets,
  useSalesTargetStatistics,
  useLeaderboard,
} from '../../hooks';
import type { SalesTargetQueryParams, TargetPeriodType } from '../../types';

interface TargetGridProps {
  params?: SalesTargetQueryParams;
  onParamsChange?: (params: SalesTargetQueryParams) => void;
  onViewDetails?: (id: string) => void;
  showFilters?: boolean;
  showLeaderboard?: boolean;
  showStatistics?: boolean;
}

export function TargetGrid({
  params = {},
  onParamsChange,
  onViewDetails,
  showFilters = true,
  showLeaderboard = true,
}: TargetGridProps) {
  // Queries
  const { data, isLoading, isError, error } = useSalesTargets(params);
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard(
    params.period,
    5
  );

  const targets = data?.items ?? [];

  // Get unique departments for filter
  const departments = [...new Set(targets.map((t) => t.department).filter(Boolean))];

  const handlePeriodTypeChange = (value: TargetPeriodType | undefined) => {
    onParamsChange?.({ ...params, periodType: value });
  };

  const handleDepartmentChange = (value: string | undefined) => {
    // Since department is not in SalesTargetQueryParams, we handle it differently
    // This is a UI-only filter for now
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {showFilters && (
          <Card>
            <div className="flex items-center gap-4">
              <Skeleton.Input active style={{ width: 150 }} />
              <Skeleton.Input active style={{ width: 180 }} />
            </div>
          </Card>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton.Avatar active size="large" />
                  <div className="flex-1 space-y-2">
                    <Skeleton.Input active size="small" block />
                    <Skeleton.Input active size="small" style={{ width: '50%' }} />
                  </div>
                </div>
                <Skeleton.Input active size="large" block />
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <Skeleton.Button active size="small" block />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <EmptyState
          icon={<Trophy className="w-6 h-6" />}
          title="Veriler yüklenemedi"
          description={error?.message || 'Hedefler yüklenirken bir hata oluştu'}
          action={{
            label: 'Tekrar Dene',
            onClick: () => window.location.reload(),
          }}
        />
      </Card>
    );
  }

  // Empty state
  if (targets.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Trophy className="w-6 h-6" />}
          title="Henüz hedef yok"
          description="Satış temsilcilerine hedef atamak için yönetici ile iletişime geçin"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <Select<TargetPeriodType>
                value={params.periodType}
                onChange={handlePeriodTypeChange}
                style={{ width: 150 }}
                placeholder="Dönem"
                allowClear
                options={[
                  { value: 'Monthly' as const, label: 'Aylık' },
                  { value: 'Quarterly' as const, label: 'Çeyreklik' },
                  { value: 'SemiAnnual' as const, label: '6 Aylık' },
                  { value: 'Annual' as const, label: 'Yıllık' },
                ]}
              />
            </div>
            {departments.length > 0 && (
              <Select
                placeholder="Departman"
                allowClear
                onChange={handleDepartmentChange}
                style={{ width: 180 }}
                options={departments.map((d) => ({ value: d, label: d }))}
              />
            )}
          </div>
        </Card>
      )}

      {/* Targets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {targets.map((target) => (
          <TargetCard
            key={target.id}
            target={target}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {/* Leaderboard */}
      {showLeaderboard && leaderboard && leaderboard.length > 0 && (
        <Leaderboard entries={leaderboard} isLoading={leaderboardLoading} />
      )}
    </div>
  );
}
