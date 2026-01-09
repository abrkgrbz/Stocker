'use client';

/**
 * Sales Quotations List Page
 * Monochrome Design System
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  ArrowPathIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { QuotationsTable, useQuotations } from '@/features/sales';
import type { GetQuotationsParams } from '@/features/sales';

export default function QuotationsPage() {
  const router = useRouter();
  const [params, setParams] = useState<GetQuotationsParams>({ page: 1, pageSize: 10 });

  const { data, isLoading, refetch } = useQuotations(params);
  const totalCount = data?.totalCount ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <DocumentTextIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Satış Teklifleri</h1>
            <p className="text-sm text-slate-500">
              Müşterilere sunulan teklifleri yönetin
              {totalCount > 0 && <span className="ml-2 text-slate-400">({totalCount} teklif)</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => router.push('/sales/quotations/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Teklif
          </button>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <QuotationsTable
          initialParams={params}
          onParamsChange={setParams}
          showFilters={true}
        />
      </div>
    </div>
  );
}
