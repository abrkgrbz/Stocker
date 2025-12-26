'use client';

/**
 * Pipeline Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Empty, Tag, Progress } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  PencilIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ChevronRightIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { usePipeline, usePipelineStatistics } from '@/lib/api/hooks/useCRM';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

export default function PipelineDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pipelineId = params.id as string;

  const { data: pipeline, isLoading, error } = usePipeline(pipelineId);
  const { data: stats } = usePipelineStatistics(pipelineId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !pipeline) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Pipeline bulunamadı" />
      </div>
    );
  }

  const stages = pipeline.stages || [];
  const totalDeals = stats?.totalDeals || 0;
  const totalValue = stats?.totalValue || 0;

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
              onClick={() => router.push('/crm/pipelines')}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  pipeline.isActive ? 'bg-indigo-100' : 'bg-slate-100'
                }`}
              >
                <FunnelIcon
                  className={`w-6 h-6 ${pipeline.isActive ? 'text-indigo-600' : 'text-slate-400'}`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{pipeline.name}</h1>
                  {pipeline.isDefault && (
                    <Tag color="gold" icon={<StarIcon className="w-3 h-3" />}>
                      Varsayılan
                    </Tag>
                  )}
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {stages.length} Aşama • {totalDeals} Fırsat
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/crm/pipelines/${pipeline.id}/edit`)}
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
                Pipeline Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Pipeline Adı</p>
                  <p className="text-sm font-medium text-slate-900">{pipeline.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag
                    icon={pipeline.isActive ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
                    color={pipeline.isActive ? 'success' : 'default'}
                  >
                    {pipeline.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Varsayılan</p>
                  <Tag color={pipeline.isDefault ? 'gold' : 'default'}>
                    {pipeline.isDefault ? 'Evet' : 'Hayır'}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Aşama Sayısı</p>
                  <p className="text-sm font-medium text-slate-900">{stages.length}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Oluşturma Tarihi</p>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {pipeline.createdAt ? dayjs(pipeline.createdAt).format('DD/MM/YYYY') : '-'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Para Birimi</p>
                  <p className="text-sm font-medium text-slate-900">{pipeline.currency || 'TRY'}</p>
                </div>
              </div>

              {pipeline.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Açıklama</p>
                  <p className="text-sm text-slate-700">{pipeline.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Özet
              </p>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-10 h-10 text-indigo-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-3">
                  ₺{totalValue.toLocaleString('tr-TR')}
                </p>
                <p className="text-sm text-slate-500">Toplam Değer</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Toplam Fırsat</span>
                  <span className="font-medium text-slate-900">{totalDeals}</span>
                </div>
                {stats?.winRate !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Kazanma Oranı</span>
                    <span className="font-medium text-emerald-600">%{stats.winRate}</span>
                  </div>
                )}
                {stats?.velocity !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Ortalama Süre</span>
                    <span className="font-medium text-slate-900">{stats.velocity} Gün</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pipeline Stages */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Pipeline Aşamaları
              </p>
              {stages.length > 0 ? (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {stages
                    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                    .map((stage: any, index: number) => (
                      <React.Fragment key={stage.id || index}>
                        <div
                          className="flex-shrink-0 p-4 rounded-lg border min-w-[180px]"
                          style={{
                            borderColor: stage.color || '#e2e8f0',
                            backgroundColor: stage.color ? `${stage.color}10` : '#f8fafc',
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: stage.color || '#94a3b8' }}
                            />
                            <p className="text-sm font-medium text-slate-900 m-0">{stage.name}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500">
                              Sıra: {stage.order || index + 1}
                            </p>
                            {stage.probability !== undefined && (
                              <p className="text-xs text-slate-500">
                                Olasılık: %{stage.probability}
                              </p>
                            )}
                            {stage.targetDays !== undefined && (
                              <p className="text-xs text-slate-500">
                                Hedef: {stage.targetDays} gün
                              </p>
                            )}
                          </div>
                        </div>
                        {index < stages.length - 1 && (
                          <ChevronRightIcon className="w-5 h-5 text-slate-300 flex-shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">
                  Henüz aşama tanımlanmamış
                </p>
              )}
            </div>
          </div>

          {/* Stage Distribution */}
          {stats?.stageDistribution && stats.stageDistribution.length > 0 && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Aşama Dağılımı
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.stageDistribution.map((dist: any) => (
                    <div key={dist.stageId} className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-900 mb-2">{dist.stageName}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Fırsat</span>
                          <span className="font-medium">{dist.dealCount}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Değer</span>
                          <span className="font-medium">₺{dist.totalValue?.toLocaleString('tr-TR')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
