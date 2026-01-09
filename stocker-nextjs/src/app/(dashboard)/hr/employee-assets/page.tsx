'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'antd';
import { ComputerDesktopIcon, MagnifyingGlassIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
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
      showSuccess('Varlik atamasi basariyla silindi');
      refetch();
    } catch (err) {
      showApiError(err, 'Varlik atamasi silinemedi');
    }
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Stats Cards */}
      <div className="mb-8">
        <EmployeeAssetsStats assets={filteredAssets} loading={isLoading} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <ComputerDesktopIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Calisan Varliklari</h1>
            <p className="text-sm text-slate-500">Calisanlara atanan varlik ve ekipmanlari takip edin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{totalCount} varlik</span>
          <Button
            icon={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            disabled={isLoading}
            className="!border-slate-300 !text-slate-600 hover:!text-slate-900 hover:!border-slate-400"
          />
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/hr/employee-assets/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Varlik Ata
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Varliklar yuklenemedi</p>
              <p className="text-sm text-slate-500">{(error as Error).message}</p>
            </div>
            <Button onClick={() => refetch()} className="!border-slate-300 !text-slate-700">
              Tekrar Dene
            </Button>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Varlik ara... (varlik adi, kod, calisan)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
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
      </div>
    </div>
  );
}
