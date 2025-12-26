'use client';

/**
 * TargetCard Component
 * Displays a single sales target with progress visualization
 * Feature-Based Architecture - Presentational Component
 */

import React from 'react';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Award,
  Star,
  Flame,
} from 'lucide-react';
import { Badge } from '@/components/ui/enterprise-page';
import type { SalesTargetListDto } from '../../types';

interface TargetCardProps {
  target: SalesTargetListDto;
  onViewDetails?: (id: string) => void;
}

export function TargetCard({ target, onViewDetails }: TargetCardProps) {
  const progress = target.progressPercentage;
  const isBonus = progress >= target.bonusThreshold;
  const bonusAmount = isBonus
    ? target.achievedAmount * 0.05 // Default 5% bonus rate
    : 0;

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-emerald-500';
    if (progress >= 80) return 'bg-emerald-400';
    if (progress >= 50) return 'bg-amber-400';
    return 'bg-red-400';
  };

  const getProgressBgColor = (progress: number) => {
    if (progress >= 100) return 'bg-emerald-100';
    if (progress >= 80) return 'bg-emerald-50';
    if (progress >= 50) return 'bg-amber-50';
    return 'bg-red-50';
  };

  const getProgressTextColor = (progress: number) => {
    if (progress >= 100) return 'text-emerald-700';
    if (progress >= 80) return 'text-emerald-600';
    if (progress >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getRankBadge = (rank?: number) => {
    if (!rank) return null;
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Award className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return null;
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

  const getTargetTypeLabel = (type: string) => {
    switch (type) {
      case 'Monthly':
        return 'Aylık';
      case 'Quarterly':
        return 'Çeyreklik';
      case 'Yearly':
        return 'Yıllık';
      default:
        return type;
    }
  };

  return (
    <div
      className={`
        bg-white border rounded-lg shadow-sm transition-all duration-200
        hover:shadow-md hover:border-slate-300
        ${isBonus ? 'ring-2 ring-emerald-200' : 'border-slate-200'}
      `}
    >
      <div className="p-5">
        {/* Header with Avatar and Name */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold
                ${
                  progress >= 100
                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
                    : progress >= 80
                    ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white'
                    : 'bg-slate-200 text-slate-600'
                }
              `}
            >
              {target.salesRepAvatar || getAvatarInitials(target.salesRepName)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">
                  {target.salesRepName}
                </h3>
                {getRankBadge(target.rank)}
              </div>
              <span className="text-xs text-slate-500">
                {target.department}
              </span>
            </div>
          </div>

          {/* Bonus Badge */}
          {isBonus && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-sm">
              <Trophy className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-bold text-white">
                Bonus!
              </span>
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="mb-4">
          <div className="flex items-end justify-between mb-2">
            <div>
              <span className="text-2xl font-bold text-slate-900">
                {formatCurrency(target.achievedAmount)}
              </span>
              <span className="text-sm text-slate-400 ml-2">
                / {formatCurrency(target.targetAmount)}
              </span>
            </div>
            <div
              className={`flex items-center gap-1 ${getProgressTextColor(
                progress
              )}`}
            >
              {progress >= 100 ? (
                <TrendingUp className="w-4 h-4" />
              ) : progress < 50 ? (
                <TrendingDown className="w-4 h-4" />
              ) : null}
              <span className="text-lg font-bold">%{Math.round(progress)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            className={`h-3 rounded-full overflow-hidden ${getProgressBgColor(
              progress
            )}`}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                progress
              )}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-4">
            {/* Streak */}
            {target.streak > 0 && (
              <div className="flex items-center gap-1 text-orange-500">
                <Flame className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {target.streak} ay seri
                </span>
              </div>
            )}
            {/* Stars for high performers */}
            {progress >= 120 && (
              <div className="flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              </div>
            )}
          </div>

          {/* Bonus Amount */}
          {isBonus && (
            <div className="text-right">
              <span className="text-xs text-slate-500">Bonus:</span>
              <span className="ml-1 text-sm font-semibold text-emerald-600">
                {formatCurrency(bonusAmount)}
              </span>
            </div>
          )}
        </div>

        {/* Period Badge and Details Link */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="default">{target.period}</Badge>
            <Badge variant="info">{getTargetTypeLabel(target.targetType)}</Badge>
          </div>
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(target.id)}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Detaylar
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
