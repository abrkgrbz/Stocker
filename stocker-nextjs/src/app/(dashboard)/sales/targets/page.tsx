'use client';

/**
 * Sales Targets Page
 * Gamified dashboard for Sales Representatives
 * Modern progress-based UI with Tailwind CSS
 */

import React, { useState } from 'react';
import { Select } from 'antd';
import {
  Target,
  Trophy,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronRight,
  Award,
  Star,
  Flame,
} from 'lucide-react';
import {
  PageContainer,
  ListPageHeader,
  Card,
  StatCard,
  Badge,
} from '@/components/ui/enterprise-page';
import { AimOutlined, TeamOutlined, DollarOutlined, RiseOutlined } from '@ant-design/icons';

// Types
interface SalesTarget {
  id: string;
  salesRepId: string;
  salesRepName: string;
  salesRepAvatar: string;
  department: string;
  targetAmount: number;
  achievedAmount: number;
  targetType: 'monthly' | 'quarterly' | 'yearly';
  period: string;
  bonusThreshold: number;
  bonusRate: number;
  rank: number;
  streak: number; // consecutive months meeting target
}

// Mock data
const mockTargets: SalesTarget[] = [
  {
    id: '1',
    salesRepId: 'sr1',
    salesRepName: 'Ahmet Yılmaz',
    salesRepAvatar: 'AY',
    department: 'Kurumsal Satış',
    targetAmount: 500000,
    achievedAmount: 625000,
    targetType: 'monthly',
    period: 'Aralık 2024',
    bonusThreshold: 100,
    bonusRate: 5,
    rank: 1,
    streak: 6,
  },
  {
    id: '2',
    salesRepId: 'sr2',
    salesRepName: 'Zeynep Kaya',
    salesRepAvatar: 'ZK',
    department: 'Perakende',
    targetAmount: 350000,
    achievedAmount: 392000,
    targetType: 'monthly',
    period: 'Aralık 2024',
    bonusThreshold: 100,
    bonusRate: 4,
    rank: 2,
    streak: 4,
  },
  {
    id: '3',
    salesRepId: 'sr3',
    salesRepName: 'Mehmet Demir',
    salesRepAvatar: 'MD',
    department: 'B2B',
    targetAmount: 450000,
    achievedAmount: 405000,
    targetType: 'monthly',
    period: 'Aralık 2024',
    bonusThreshold: 100,
    bonusRate: 5,
    rank: 3,
    streak: 2,
  },
  {
    id: '4',
    salesRepId: 'sr4',
    salesRepName: 'Elif Özcan',
    salesRepAvatar: 'EÖ',
    department: 'Kurumsal Satış',
    targetAmount: 400000,
    achievedAmount: 312000,
    targetType: 'monthly',
    period: 'Aralık 2024',
    bonusThreshold: 100,
    bonusRate: 4,
    rank: 4,
    streak: 0,
  },
  {
    id: '5',
    salesRepId: 'sr5',
    salesRepName: 'Can Arslan',
    salesRepAvatar: 'CA',
    department: 'Perakende',
    targetAmount: 300000,
    achievedAmount: 189000,
    targetType: 'monthly',
    period: 'Aralık 2024',
    bonusThreshold: 100,
    bonusRate: 3,
    rank: 5,
    streak: 0,
  },
  {
    id: '6',
    salesRepId: 'sr6',
    salesRepName: 'Deniz Yıldız',
    salesRepAvatar: 'DY',
    department: 'B2B',
    targetAmount: 550000,
    achievedAmount: 412500,
    targetType: 'monthly',
    period: 'Aralık 2024',
    bonusThreshold: 100,
    bonusRate: 5,
    rank: 6,
    streak: 1,
  },
];

export default function SalesTargetsPage() {
  const [targets] = useState<SalesTarget[]>(mockTargets);
  const [periodFilter, setPeriodFilter] = useState<string>('monthly');
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);

  // Calculate summary stats
  const totalTarget = targets.reduce((sum, t) => sum + t.targetAmount, 0);
  const totalAchieved = targets.reduce((sum, t) => sum + t.achievedAmount, 0);
  const overallProgress = Math.round((totalAchieved / totalTarget) * 100);
  const achieversCount = targets.filter(
    (t) => (t.achievedAmount / t.targetAmount) * 100 >= 100
  ).length;

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

  const getRankBadge = (rank: number) => {
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

  const filteredTargets = targets.filter((t) => {
    if (departmentFilter && t.department !== departmentFilter) return false;
    return true;
  });

  const departments = [...new Set(targets.map((t) => t.department))];

  return (
    <PageContainer maxWidth="6xl">
      <ListPageHeader
        icon={<AimOutlined />}
        iconColor="#f59e0b"
        title="Satış Hedefleri"
        description="Satış temsilcilerinin performansını takip edin"
        itemCount={targets.length}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Toplam Hedef"
          value={formatCurrency(totalTarget)}
          icon={<AimOutlined />}
          iconColor="#6366f1"
        />
        <StatCard
          label="Toplam Gerçekleşen"
          value={formatCurrency(totalAchieved)}
          icon={<DollarOutlined />}
          iconColor="#10b981"
          trend={{
            value: overallProgress - 100,
            isPositive: overallProgress >= 100,
          }}
        />
        <StatCard
          label="Genel Başarı"
          value={`%${overallProgress}`}
          icon={<RiseOutlined />}
          iconColor="#f59e0b"
        />
        <StatCard
          label="Hedefi Aşanlar"
          value={`${achieversCount} / ${targets.length}`}
          icon={<TeamOutlined />}
          iconColor="#3b82f6"
        />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <Select
              value={periodFilter}
              onChange={setPeriodFilter}
              style={{ width: 150 }}
              options={[
                { value: 'monthly', label: 'Aylık' },
                { value: 'quarterly', label: 'Çeyreklik' },
                { value: 'yearly', label: 'Yıllık' },
              ]}
            />
          </div>
          <Select
            placeholder="Departman"
            allowClear
            value={departmentFilter}
            onChange={setDepartmentFilter}
            style={{ width: 180 }}
            options={departments.map((d) => ({ value: d, label: d }))}
          />
        </div>
      </Card>

      {/* Targets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTargets.map((target) => {
          const progress = Math.round(
            (target.achievedAmount / target.targetAmount) * 100
          );
          const isBonus = progress >= target.bonusThreshold;
          const bonusAmount = isBonus
            ? target.achievedAmount * (target.bonusRate / 100)
            : 0;

          return (
            <div
              key={target.id}
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
                      {target.salesRepAvatar}
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
                      <span className="text-lg font-bold">%{progress}</span>
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

                {/* Period Badge */}
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="default">{target.period}</Badge>
                  <button className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                    Detaylar
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard Section */}
      <Card className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-slate-900">
            Liderlik Tablosu
          </h2>
        </div>
        <div className="space-y-2">
          {[...filteredTargets]
            .sort((a, b) => {
              const progressA = (a.achievedAmount / a.targetAmount) * 100;
              const progressB = (b.achievedAmount / b.targetAmount) * 100;
              return progressB - progressA;
            })
            .slice(0, 5)
            .map((target, index) => {
              const progress = Math.round(
                (target.achievedAmount / target.targetAmount) * 100
              );
              return (
                <div
                  key={target.id}
                  className={`
                    flex items-center gap-4 p-3 rounded-lg transition-colors
                    ${index === 0 ? 'bg-yellow-50' : 'hover:bg-slate-50'}
                  `}
                >
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
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 truncate">
                        {target.salesRepName}
                      </span>
                      {progress >= 100 && (
                        <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {target.department}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getProgressTextColor(progress)}`}>
                      %{progress}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatCurrency(target.achievedAmount)}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </Card>
    </PageContainer>
  );
}
