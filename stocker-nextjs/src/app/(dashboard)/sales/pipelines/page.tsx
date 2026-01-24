'use client';

import React from 'react';
import { Spin } from 'antd';
import {
  FunnelIcon,
  PlusIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
  RectangleStackIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { usePipelines } from '@/features/sales';
import type { SalesPipelineListDto } from '@/features/sales';
import Link from 'next/link';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function PipelineCard({ pipeline }: { pipeline: SalesPipelineListDto }) {
  return (
    <Link
      href={`/sales/pipelines/${pipeline.id}`}
      className="block bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md hover:border-slate-300 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
            <FunnelIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{pipeline.name}</h3>
            <p className="text-xs text-slate-500">{pipeline.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pipeline.isDefault && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-white">
              <CheckBadgeIcon className="w-3 h-3" />
              Varsayilan
            </span>
          )}
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            pipeline.isActive ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'
          }`}>
            {pipeline.isActive ? 'Aktif' : 'Pasif'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <RectangleStackIcon className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Asamalar</p>
            <p className="text-sm font-semibold text-slate-900">{pipeline.stageCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Firsatlar</p>
            <p className="text-sm font-semibold text-slate-900">{pipeline.totalOpportunities}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CurrencyDollarIcon className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Deger</p>
            <p className="text-sm font-semibold text-slate-900">{formatCurrency(pipeline.totalPipelineValue)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Tur: <span className="font-medium text-slate-700">{pipeline.type || 'Sales'}</span>
        </p>
      </div>
    </Link>
  );
}

export default function PipelinesPage() {
  const { data, isLoading, refetch } = usePipelines({});
  const pipelines = data?.items || [];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <FunnelIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Satis Pipeline&apos;lari</h1>
            <p className="text-sm text-slate-500">Satis sureclerinizi yonetin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/sales/pipelines/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Pipeline
          </Link>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Spin size="large" />
        </div>
      ) : pipelines.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <FunnelIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Henuz pipeline yok</h3>
          <p className="text-sm text-slate-500 mb-6">Ilk satis pipeline&apos;inizi olusturun</p>
          <Link
            href="/sales/pipelines/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Pipeline
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pipelines.map((pipeline) => (
            <PipelineCard key={pipeline.id} pipeline={pipeline} />
          ))}
        </div>
      )}
    </div>
  );
}
