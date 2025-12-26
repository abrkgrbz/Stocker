'use client';

/**
 * Sales Orders List Page
 * Refactored to Feature-Based Architecture
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  ArrowPathIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader } from '@/components/patterns';
import { OrdersTable, OrderStats, useSalesOrders } from '@/features/sales';
import type { GetSalesOrdersParams } from '@/features/sales';

export default function SalesOrdersPage() {
  const router = useRouter();
  const [params, setParams] = useState<GetSalesOrdersParams>({ page: 1, pageSize: 10 });

  const { data, isLoading, refetch } = useSalesOrders(params);
  const orders = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <OrderStats orders={orders} totalCount={totalCount} isLoading={isLoading} />

      {/* Header */}
      <ListPageHeader
        icon={<ShoppingCartIcon className="w-5 h-5" />}
        iconColor="#6366f1"
        title="Siparişler"
        description="Satış siparişlerini yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Sipariş',
          onClick: () => router.push('/sales/orders/new'),
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

      {/* Orders Table */}
      <OrdersTable
        initialParams={params}
        onParamsChange={setParams}
        showFilters={true}
        showBulkActions={true}
      />
    </PageContainer>
  );
}
