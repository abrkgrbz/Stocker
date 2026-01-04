'use client';

import React, { useMemo } from 'react';
import { Spin } from 'antd';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface Deal {
  id: string;
  status: 'Open' | 'Won' | 'Lost';
  amount: number;
  actualCloseDate?: string | null;
  createdAt: string;
}

interface MonthlyTrendProps {
  deals: Deal[];
  loading?: boolean;
}

export function MonthlyTrend({ deals, loading }: MonthlyTrendProps) {
  const trendData = useMemo(() => {
    const now = new Date();
    const months: { month: string; shortMonth: string; won: number; lost: number; wonAmount: number }[] = [];

    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthDeals = deals.filter((d) => {
        const dealDate = new Date(d.actualCloseDate || d.createdAt);
        return dealDate >= date && dealDate <= monthEnd && (d.status === 'Won' || d.status === 'Lost');
      });

      const wonDeals = monthDeals.filter((d) => d.status === 'Won');
      const lostDeals = monthDeals.filter((d) => d.status === 'Lost');

      months.push({
        month: date.toLocaleString('tr-TR', { month: 'long' }),
        shortMonth: date.toLocaleString('tr-TR', { month: 'short' }),
        won: wonDeals.length,
        lost: lostDeals.length,
        wonAmount: wonDeals.reduce((sum, d) => sum + d.amount, 0),
      });
    }

    // Calculate trend
    const lastThreeMonths = months.slice(-3);
    const firstThreeMonths = months.slice(0, 3);

    const recentAvg = lastThreeMonths.reduce((sum, m) => sum + m.wonAmount, 0) / 3;
    const previousAvg = firstThreeMonths.reduce((sum, m) => sum + m.wonAmount, 0) / 3;

    const trend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

    // Find max for chart scaling
    const maxValue = Math.max(...months.map((m) => m.won + m.lost), 1);

    return {
      months,
      trend,
      maxValue,
      totalWon: months.reduce((sum, m) => sum + m.won, 0),
      totalLost: months.reduce((sum, m) => sum + m.lost, 0),
      totalAmount: months.reduce((sum, m) => sum + m.wonAmount, 0),
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
          <h3 className="text-sm font-medium text-slate-900">Aylık Trend</h3>
          <p className="text-xs text-slate-500 mt-0.5">Son 6 ay performansı</p>
        </div>
        {trendData.trend !== 0 && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trendData.trend > 0
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {trendData.trend > 0 ? (
              <ArrowTrendingUpIcon className="w-3 h-3" />
            ) : (
              <ArrowTrendingDownIcon className="w-3 h-3" />
            )}
            {Math.abs(trendData.trend).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-40 flex items-end justify-between gap-2 mb-4">
        {trendData.months.map((month, index) => {
          const wonHeight = (month.won / trendData.maxValue) * 100;
          const lostHeight = (month.lost / trendData.maxValue) * 100;
          const totalHeight = wonHeight + lostHeight;

          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              {/* Bar */}
              <div className="w-full flex flex-col justify-end h-32">
                <div
                  className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                  style={{ height: `${totalHeight}%`, minHeight: totalHeight > 0 ? '4px' : '0' }}
                >
                  {/* Won portion */}
                  <div
                    className="w-full bg-emerald-500 rounded-t"
                    style={{
                      height: `${(wonHeight / (totalHeight || 1)) * 100}%`,
                      minHeight: month.won > 0 ? '4px' : '0',
                    }}
                  />
                  {/* Lost portion */}
                  <div
                    className="w-full bg-red-400"
                    style={{
                      height: `${(lostHeight / (totalHeight || 1)) * 100}%`,
                      minHeight: month.lost > 0 ? '4px' : '0',
                    }}
                  />
                </div>
              </div>
              {/* Label */}
              <div className="mt-2 text-xs text-slate-500 truncate w-full text-center">
                {month.shortMonth}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-xs text-slate-600">Kazanılan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-400" />
          <span className="text-xs text-slate-600">Kaybedilen</span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
        <div className="text-center">
          <div className="text-lg font-bold text-slate-900">{trendData.totalWon}</div>
          <div className="text-xs text-slate-500">Kazanılan</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-slate-900">{trendData.totalLost}</div>
          <div className="text-xs text-slate-500">Kaybedilen</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-slate-900">
            ₺{(trendData.totalAmount / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-slate-500">Toplam</div>
        </div>
      </div>
    </div>
  );
}
