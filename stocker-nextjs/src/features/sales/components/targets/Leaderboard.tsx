'use client';

/**
 * Leaderboard Component
 * Displays top performers in a ranked list
 * Feature-Based Architecture - Presentational Component
 */

import React from 'react';
import { Trophy } from 'lucide-react';
import { Card } from '@/components/ui/enterprise-page';
import type { LeaderboardEntryDto } from '../../types';

interface LeaderboardProps {
  entries: LeaderboardEntryDto[];
  isLoading?: boolean;
  limit?: number;
}

export function Leaderboard({ entries, isLoading, limit = 5 }: LeaderboardProps) {
  const getProgressTextColor = (progress: number) => {
    if (progress >= 100) return 'text-emerald-700';
    if (progress >= 80) return 'text-emerald-600';
    if (progress >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-slate-900">
            Liderlik Tablosu
          </h2>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse w-1/3" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-1/4" />
              </div>
              <div className="h-4 bg-slate-200 rounded animate-pulse w-16" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const displayedEntries = entries.slice(0, limit);

  return (
    <Card className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg font-semibold text-slate-900">
          Liderlik Tablosu
        </h2>
      </div>
      <div className="space-y-2">
        {displayedEntries.map((entry, index) => (
          <div
            key={entry.salesRepId}
            className={`
              flex items-center gap-4 p-3 rounded-lg transition-colors
              ${index === 0 ? 'bg-yellow-50' : 'hover:bg-slate-50'}
            `}
          >
            {/* Rank Badge */}
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${
                  index === 0
                    ? 'bg-yellow-400 text-white'
                    : index === 1
                    ? 'bg-slate-300 text-white'
                    : index === 2
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }
              `}
            >
              {entry.rank}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900 truncate">
                  {entry.salesRepName}
                </span>
                {entry.progressPercentage >= 100 && (
                  <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                )}
              </div>
              <span className="text-xs text-slate-500">
                {entry.department}
              </span>
            </div>

            {/* Progress & Amount */}
            <div className="text-right">
              <div className={`font-bold ${getProgressTextColor(entry.progressPercentage)}`}>
                %{Math.round(entry.progressPercentage)}
              </div>
              <div className="text-xs text-slate-500">
                {formatCurrency(entry.achievedAmount)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
