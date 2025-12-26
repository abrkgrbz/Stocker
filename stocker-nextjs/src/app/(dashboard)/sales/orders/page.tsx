'use client';

/**
 * Sales Orders List Page
 * Refactored to Feature-Based Architecture
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusOutlined, ReloadOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { PageContainer, ListPageHeader } from '@/components/ui/enterprise-page';
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
        icon={<ShoppingCartOutlined />}
        iconColor="#6366f1"
        title="Siparişler"
        description="Satış siparişlerini yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Sipariş',
          onClick: () => router.push('/sales/orders/new'),
          icon: <PlusOutlined />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ReloadOutlined className={isLoading ? 'animate-spin' : ''} />
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
