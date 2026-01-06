'use client';

/**
 * Positions List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * Standardized with CRM Customer module patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select } from 'antd';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import {
  usePositions,
  useDepartments,
  useDeletePosition,
  useActivatePosition,
  useDeactivatePosition,
} from '@/lib/api/hooks/useHR';
import type { PositionDto } from '@/lib/api/services/hr.types';
import { PositionsStats, PositionsTable } from '@/components/hr/positions';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import {
  PageContainer,
  ListPageHeader,
  DataTableWrapper,
  Card,
} from '@/components/patterns';
import { Input, Alert, Spinner } from '@/components/primitives';

export default function PositionsPage() {
  const router = useRouter();

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>();
  const [includeInactive, setIncludeInactive] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // API Hooks
  const { data: positions = [], isLoading, error, refetch } = usePositions(selectedDepartment, includeInactive);
  const { data: departments = [] } = useDepartments();
  const deletePosition = useDeletePosition();
  const activatePosition = useActivatePosition();
  const deactivatePosition = useDeactivatePosition();

  // Filter positions
  const filteredPositions = useMemo(() => {
    return positions.filter((pos) => {
      const matchesSearch =
        !debouncedSearch ||
        pos.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (pos.code && pos.code.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (pos.description && pos.description.toLowerCase().includes(debouncedSearch.toLowerCase()));

      return matchesSearch;
    });
  }, [positions, debouncedSearch]);

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/positions/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/positions/${id}/edit`);
  };

  const handleDelete = async (position: PositionDto) => {
    try {
      await deletePosition.mutateAsync(position.id);
      showSuccess('Pozisyon başarıyla silindi!');
    } catch (err) {
      showApiError(err, 'Pozisyon silinirken bir hata oluştu');
      throw err;
    }
  };

  const handleToggleActive = async (position: PositionDto) => {
    try {
      if (position.isActive) {
        await deactivatePosition.mutateAsync(position.id);
        showSuccess('Pozisyon pasifleştirildi!');
      } else {
        await activatePosition.mutateAsync(position.id);
        showSuccess('Pozisyon aktifleştirildi!');
      }
    } catch (err) {
      showApiError(err, 'İşlem sırasında bir hata oluştu');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
    setSelectedDepartment(undefined);
    setIncludeInactive(false);
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <PositionsStats positions={positions} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<ShieldCheckIcon className="w-5 h-5" />}
        iconColor="#8b5cf6"
        title="Pozisyonlar"
        description="Tüm pozisyonları görüntüle ve yönet"
        itemCount={filteredPositions.length}
        primaryAction={{
          label: 'Yeni Pozisyon',
          onClick: () => router.push('/hr/positions/new'),
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

      {/* Error Alert */}
      {error && (
        <Alert
          variant="error"
          title="Pozisyonlar yüklenemedi"
          message={
            error instanceof Error
              ? error.message
              : 'Pozisyonlar getirilirken bir hata oluştu. Lütfen tekrar deneyin.'
          }
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Pozisyon ara... (ad, kod, açıklama)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="lg"
            />
          </div>
          <Select
            placeholder="Departman"
            allowClear
            className="h-10"
            style={{ height: 48 }}
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
          />
          <Select
            className="h-10"
            style={{ height: 48 }}
            value={includeInactive}
            onChange={setIncludeInactive}
            options={[
              { value: false, label: 'Sadece Aktifler' },
              { value: true, label: 'Tümü' },
            ]}
          />
          <button
            onClick={clearFilters}
            className="h-12 px-4 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Temizle
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <PositionsTable
            positions={filteredPositions}
            loading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={filteredPositions.length}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
