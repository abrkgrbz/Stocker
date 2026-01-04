'use client';

import React, { useMemo } from 'react';
import { Spin } from 'antd';
import {
  TrophyIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

interface Deal {
  id: string;
  status: 'Open' | 'Won' | 'Lost';
  amount: number;
  actualCloseDate?: string;
  createdAt: string;
}

interface WinLossChartProps {
  deals: Deal[];
  loading?: boolean;
}

export function WinLossChart({ deals, loading }: WinLossChartProps) {
  const stats = useMemo(() => {
    const closedDeals = deals.filter((d) => d.status === 'Won' || d.status === 'Lost');
    const wonDeals = deals.filter((d) => d.status === 'Won');
    const lostDeals = deals.filter((d) => d.status === 'Lost');

    const totalClosed = closedDeals.length;
    const winRate = totalClosed > 0 ? (wonDeals.length / totalClosed) * 100 : 0;
    const lossRate = totalClosed > 0 ? (lostDeals.length / totalClosed) * 100 : 0;

    const wonAmount = wonDeals.reduce((sum, d) => sum + d.amount, 0);
    const lostAmount = lostDeals.reduce((sum, d) => sum + d.amount, 0);

    // Calculate monthly trend (last 3 months)
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    const recentDeals = closedDeals.filter((d) => {
      const closeDate = new Date(d.actualCloseDate || d.createdAt);
      return closeDate >= threeMonthsAgo;
    });

    const recentWon = recentDeals.filter((d) => d.status === 'Won').length;
    const recentTotal = recentDeals.length;
    const recentWinRate = recentTotal > 0 ? (recentWon / recentTotal) * 100 : 0;

    const trend = recentWinRate - winRate;

    return {
      wonCount: wonDeals.length,
      lostCount: lostDeals.length,
      totalClosed,
      winRate,
      lossRate,
      wonAmount,
      lostAmount,
      trend,
      recentWinRate,
    };
  }, [deals]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <Spin />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-slate-900">Kazanma / Kaybetme Oranı</h3>
          <p className="text-xs text-slate-500 mt-0.5">Kapatılan fırsatların performansı</p>
        </div>
        {stats.trend !== 0 && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              stats.trend > 0
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {stats.trend > 0 ? (
              <ArrowTrendingUpIcon className="w-3 h-3" />
            ) : (
              <ArrowTrendingDownIcon className="w-3 h-3" />
            )}
            {Math.abs(stats.trend).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Win Rate Visual */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl font-bold text-slate-900">
            {stats.winRate.toFixed(1)}%
          </span>
          <span className="text-sm text-slate-500">
            {stats.totalClosed} kapatılan
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${stats.winRate}%` }}
          />
          <div
            className="bg-red-400 transition-all duration-500"
            style={{ width: `${stats.lossRate}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
          <span>Kazanılan</span>
          <span>Kaybedilen</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Won */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrophyIcon className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Kazanılan</span>
          </div>
          <div className="text-xl font-bold text-emerald-900">{stats.wonCount}</div>
          <div className="text-xs text-emerald-600 mt-1">
            ₺{stats.wonAmount.toLocaleString('tr-TR')}
          </div>
        </div>

        {/* Lost */}
        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircleIcon className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-red-700">Kaybedilen</span>
          </div>
          <div className="text-xl font-bold text-red-900">{stats.lostCount}</div>
          <div className="text-xs text-red-600 mt-1">
            ₺{stats.lostAmount.toLocaleString('tr-TR')}
          </div>
        </div>
      </div>

      {/* Recent Trend */}
      {stats.totalClosed > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Son 3 ay kazanma oranı</span>
            <span className="font-medium text-slate-900">{stats.recentWinRate.toFixed(1)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
