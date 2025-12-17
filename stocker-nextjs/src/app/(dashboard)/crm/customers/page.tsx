'use client';

/**
 * Customers List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Alert, Spin } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  TeamOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import type { Customer } from '@/lib/api/services/crm.service';
import { CustomersStats, CustomersTable } from '@/components/crm/customers';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';

export default function CustomersPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch customers from API
  const { data, isLoading, error, refetch } = useCustomers({
    pageNumber: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const customers = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const handleCreate = () => {
    router.push('/crm/customers/new');
  };

  const handleEdit = (customer: Customer) => {
    router.push(`/crm/customers/${customer.id}/edit`);
  };

  const handleView = (customerId: number) => {
    router.push(`/crm/customers/${customerId}`);
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <CustomersStats customers={customers} totalCount={totalCount} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<TeamOutlined />}
        iconColor="#3b82f6"
        title="Müşteriler"
        description="Müşteri portföyünüzü yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Müşteri Ekle',
          onClick: handleCreate,
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

      {/* Error Alert */}
      {error && (
        <Alert
          message="Müşteriler yüklenemedi"
          description={
            error instanceof Error
              ? error.message
              : 'Müşteriler getirilirken bir hata oluştu. Lütfen tekrar deneyin.'
          }
          type="error"
          showIcon
          closable
          action={
            <button
              onClick={() => refetch()}
              className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            >
              Tekrar Dene
            </button>
          }
          className="mb-6"
        />
      )}

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <Input
          placeholder="Müşteri ara... (şirket adı, yetkili kişi, e-posta)"
          prefix={<SearchOutlined className="text-slate-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          className="h-10"
        />
      </div>

      {/* Customers Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <CustomersTable
            customers={customers}
            loading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onEdit={handleEdit}
            onView={handleView}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
