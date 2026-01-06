'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ComputerDesktopIcon, MagnifyingGlassIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { EmployeeAssetsStats, EmployeeAssetsTable } from '@/components/hr/employee-assets';
import { useEmployeeAssets, useDeleteEmployeeAsset } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { EmployeeAssetDto } from '@/lib/api/services/hr.types';

export default function EmployeeAssetsPage() {
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

  const { data: assetsData, isLoading, error, refetch } = useEmployeeAssets();
  const deleteAssetMutation = useDeleteEmployeeAsset();

  // Client-side filtering
  const filteredAssets = useMemo(() => {
    const assets = assetsData || [];
    if (!debouncedSearch) return assets;
    const lower = debouncedSearch.toLowerCase();
    return assets.filter((item: EmployeeAssetDto) =>
      item.assetName?.toLowerCase().includes(lower) ||
      item.assetCode?.toLowerCase().includes(lower) ||
      item.employeeName?.toLowerCase().includes(lower)
    );
  }, [assetsData, debouncedSearch]);

  const totalCount = filteredAssets.length;

  const handleView = (id: number) => {
    router.push(`/hr/employee-assets/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/employee-assets/${id}/edit`);
  };

  const handleDelete = async (asset: EmployeeAssetDto) => {
    try {
      await deleteAssetMutation.mutateAsync(asset.id);
      showSuccess('Varlık ataması başarıyla silindi');
      refetch();
    } catch (err) {
      showApiError(err, 'Varlık ataması silinemedi');
    }
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <PageContainer maxWidth="7xl" className="bg-slate-50 min-h-screen">
      {/* Stats Cards */}
      <div className="mb-8">
        <EmployeeAssetsStats assets={filteredAssets} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<ComputerDesktopIcon className="w-5 h-5" />}
        iconColor="#3b82f6"
        title="Çalışan Varlıkları"
        description="Çalışanlara atanan varlık ve ekipmanları takip edin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Varlık Ata',
          onClick: () => router.push('/hr/employee-assets/new'),
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

      {error && (
        <Alert
          variant="error"
          title="Varlıklar yüklenemedi"
          message={(error as Error).message}
          closable
          action={
            <button
              onClick={() => refetch()}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Tekrar Dene
            </button>
          }
          className="mt-6"
        />
      )}

      <DataTableWrapper className="mt-6">
        <div className="p-4 border-b border-gray-100">
          <Input
            placeholder="Varlık ara... (varlık adı, kod, çalışan)"
            prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
            size="lg"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        <EmployeeAssetsTable
          assets={filteredAssets}
          loading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </DataTableWrapper>
    </PageContainer>
  );
}
