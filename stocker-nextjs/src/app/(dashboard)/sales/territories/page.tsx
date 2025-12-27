'use client';

/**
 * Sales Territories List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Alert, Spin, Select, Modal } from 'antd';
import {
  ArrowPathIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  useSalesTerritories,
  useActivateSalesTerritory,
  useDeactivateSalesTerritory,
  useDeleteSalesTerritory,
} from '@/lib/api/hooks/useSales';
import type { SalesTerritoryQueryParams, TerritoryType, TerritoryStatus } from '@/lib/api/services/sales.service';
import { TerritoriesStats, TerritoriesTable } from '@/components/sales/territories';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';

const typeOptions: { value: TerritoryType; label: string }[] = [
  { value: 'Country', label: 'Ülke' },
  { value: 'Region', label: 'Bölge' },
  { value: 'City', label: 'Şehir' },
  { value: 'District', label: 'İlçe' },
  { value: 'Zone', label: 'Zon' },
  { value: 'Custom', label: 'Özel' },
];

export default function TerritoriesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<SalesTerritoryQueryParams>({});

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch territories
  const { data, isLoading, error, refetch } = useSalesTerritories({
    page: currentPage,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    ...filters,
  });

  const activateMutation = useActivateSalesTerritory();
  const deactivateMutation = useDeactivateSalesTerritory();
  const deleteMutation = useDeleteSalesTerritory();

  const territories = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const handleCreate = () => {
    router.push('/sales/territories/new');
  };

  const handleActivate = async (id: string) => {
    try {
      await activateMutation.mutateAsync(id);
    } catch {
      // Error handled by hook
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateMutation.mutateAsync(id);
    } catch {
      // Error handled by hook
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Bölgeyi Sil',
      content: 'Bu bölgeyi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
        } catch {
          // Error handled by hook
        }
      },
    });
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <TerritoriesStats territories={territories} totalCount={totalCount} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<GlobeAltIcon className="w-4 h-4" />}
        iconColor="#8b5cf6"
        title="Satış Bölgeleri"
        description="Satış bölgelerini yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Bölge',
          onClick: handleCreate,
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Error Alert */}
      {error && (
        <Alert
          message="Bölgeler yüklenemedi"
          description={
            error instanceof Error
              ? error.message
              : 'Bölgeler getirilirken bir hata oluştu. Lütfen tekrar deneyin.'
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

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Bölge ara... (kod, ad)"
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="h-10"
          />
          <Select
            placeholder="Tür"
            allowClear
            options={typeOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, territoryType: value }))}
            className="h-10"
          />
          <Select<TerritoryStatus>
            placeholder="Durum"
            allowClear
            options={[
              { value: 'Active', label: 'Aktif' },
              { value: 'Inactive', label: 'Pasif' },
              { value: 'Suspended', label: 'Askıda' },
            ]}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            className="h-10"
          />
        </div>
      </div>

      {/* Territories Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <TerritoriesTable
            territories={territories}
            loading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
            onDelete={handleDelete}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
