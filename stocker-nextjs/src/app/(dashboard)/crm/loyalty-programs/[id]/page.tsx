'use client';

/**
 * Loyalty Program Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Spin, Empty, Tag, Progress } from 'antd';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  GiftIcon,
  PencilIcon,
  StarIcon,
  TrophyIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useLoyaltyProgram } from '@/lib/api/hooks/useCRM';
import { LoyaltyProgramType } from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const programTypeLabels: Record<LoyaltyProgramType, { label: string; color: string }> = {
  [LoyaltyProgramType.PointsBased]: { label: 'Puan Bazlı', color: 'blue' },
  [LoyaltyProgramType.TierBased]: { label: 'Kademe Bazlı', color: 'purple' },
  [LoyaltyProgramType.SpendBased]: { label: 'Harcama Bazlı', color: 'green' },
  [LoyaltyProgramType.Subscription]: { label: 'Abonelik', color: 'orange' },
  [LoyaltyProgramType.Hybrid]: { label: 'Hibrit', color: 'cyan' },
};

export default function LoyaltyProgramDetailPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params.id as string;

  const { data: program, isLoading, error } = useLoyaltyProgram(programId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Sadakat programı bulunamadı" />
      </div>
    );
  }

  const typeInfo = programTypeLabels[program.programType] || { label: program.programType, color: 'default' };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/crm/loyalty-programs')}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  program.isActive ? 'bg-amber-100' : 'bg-slate-100'
                }`}
              >
                <GiftIcon className="w-4 h-4" className={`text-lg ${program.isActive ? 'text-amber-600' : 'text-slate-400'}`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{program.name}</h1>
                  <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">{program.code || 'Kod belirtilmemiş'}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/crm/loyalty-programs/${program.id}/edit`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            Düzenle
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Info Card */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Program Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Program Adı</p>
                  <p className="text-sm font-medium text-slate-900">{program.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Program Kodu</p>
                  <p className="text-sm font-medium text-slate-900">{program.code || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Program Tipi</p>
                  <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag
                    icon={program.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    color={program.isActive ? 'success' : 'default'}
                  >
                    {program.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Başlangıç Tarihi</p>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {program.startDate ? dayjs(program.startDate).format('DD/MM/YYYY') : '-'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Bitiş Tarihi</p>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {program.endDate ? dayjs(program.endDate).format('DD/MM/YYYY') : 'Süresiz'}
                    </span>
                  </div>
                </div>
              </div>

              {program.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Açıklama</p>
                  <p className="text-sm text-slate-700">{program.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Points Info Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Puan Kuralları
              </p>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                  <StarIcon className="w-4 h-4" className="text-3xl text-amber-600" />
                </div>
                <p className="text-lg font-semibold text-slate-900 mt-3">
                  {program.pointsPerSpend || 1} Puan
                </p>
                <p className="text-sm text-slate-500">
                  Her {program.spendUnit || 1} {program.currency || 'TRY'} harcamada
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Puan Değeri</span>
                  <span className="font-medium text-slate-900">
                    {program.pointValue || 0} {program.currency || 'TRY'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Min. Kullanım</span>
                  <span className="font-medium text-slate-900">
                    {program.minimumRedemptionPoints || 0} Puan
                  </span>
                </div>
                {program.pointsValidityMonths && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Geçerlilik</span>
                    <span className="font-medium text-slate-900">
                      {program.pointsValidityMonths} Ay
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bonus Points Card */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrophyIcon className="w-4 h-4" className="text-amber-500" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Bonus Puanlar
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Kayıt Bonusu</p>
                  <p className="text-xl font-semibold text-slate-900">
                    {program.signUpBonusPoints || 0} Puan
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Doğum Günü Bonusu</p>
                  <p className="text-xl font-semibold text-slate-900">
                    {program.birthdayBonusPoints || 0} Puan
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Referans Bonusu</p>
                  <p className="text-xl font-semibold text-slate-900">
                    {program.referralBonusPoints || 0} Puan
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">İnceleme Bonusu</p>
                  <p className="text-xl font-semibold text-slate-900">
                    {program.reviewBonusPoints || 0} Puan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tiers Card */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <StarIcon className="w-4 h-4" className="text-purple-500" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Kademeler
                </p>
              </div>
              {program.tiers && program.tiers.length > 0 ? (
                <div className="space-y-3">
                  {program.tiers.map((tier, index) => (
                    <div
                      key={tier.id || index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: tier.color || '#e2e8f0' }}
                        >
                          <StarIcon className="w-4 h-4" className="text-white text-sm" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{tier.name}</p>
                          <p className="text-xs text-slate-500">{tier.minimumPoints}+ Puan</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-emerald-600">
                          %{tier.discountPercentage} İndirim
                        </p>
                        {tier.bonusPointsMultiplier && tier.bonusPointsMultiplier > 1 && (
                          <p className="text-xs text-slate-500">
                            {tier.bonusPointsMultiplier}x Puan
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">Kademe tanımlanmamış</p>
              )}
            </div>
          </div>

          {/* Terms Card */}
          {program.termsAndConditions && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Şartlar ve Koşullar
                </p>
                <p className="text-sm text-slate-700 whitespace-pre-line">
                  {program.termsAndConditions}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
