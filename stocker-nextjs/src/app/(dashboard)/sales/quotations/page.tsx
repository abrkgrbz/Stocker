'use client';

/**
 * Sales Quotations List Page
 * Refactored to Feature-Based Architecture
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  ArrowPathIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader } from '@/components/patterns';
import { QuotationsTable, useQuotations } from '@/features/sales';
import type { GetQuotationsParams } from '@/features/sales';

export default function QuotationsPage() {
  const router = useRouter();
  const [params, setParams] = useState<GetQuotationsParams>({ page: 1, pageSize: 10 });

  const { data, isLoading, refetch } = useQuotations(params);
  const totalCount = data?.totalCount ?? 0;

  return (
    <PageContainer maxWidth="7xl">
      {/* Header */}
      <ListPageHeader
        icon={<DocumentTextIcon className="w-5 h-5" />}
        iconColor="#6366f1"
        title="Satış Teklifleri"
        description="Müşterilere sunulan teklifleri yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Teklif',
          onClick: () => router.push('/sales/quotations/new'),
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Quotations Table */}
      <QuotationsTable
        initialParams={params}
        onParamsChange={setParams}
        showFilters={true}
      />
    </PageContainer>
  );
}
