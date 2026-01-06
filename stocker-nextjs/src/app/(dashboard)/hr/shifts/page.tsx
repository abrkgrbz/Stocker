'use client';

/**
 * Shifts List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * Standardized with CRM Customer module patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowPathIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useShifts, useDeleteShift, useActivateShift, useDeactivateShift } from '@/lib/api/hooks/useHR';
import type { ShiftDto } from '@/lib/api/services/hr.types';
import { ShiftsStats, ShiftsTable } from '@/components/hr/shifts';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import {
  PageContainer,
  ListPageHeader,
  DataTableWrapper,
  Card,
} from '@/components/patterns';
import { Input, Alert, Spinner } from '@/components/primitives';

export default function ShiftsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

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
  const { data: shifts = [], isLoading, error, refetch } = useShifts();
  const deleteShift = useDeleteShift();
  const activateShift = useActivateShift();
  const deactivateShift = useDeactivateShift();

  // Filter shifts
  const filteredShifts = useMemo(() => {
    return shifts.filter((s) =>
      !debouncedSearch ||
      s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      s.code?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [shifts, debouncedSearch]);

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/shifts/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/shifts/${id}/edit`);
  };

  const handleDelete = async (shift: ShiftDto) => {
    try {
      await deleteShift.mutateAsync(shift.id);
      showSuccess('Vardiya başarıyla silindi!');
    } catch (err) {
      showApiError(err, 'Vardiya silinirken bir hata oluştu');
      throw err;
    }
  };

  const handleToggleActive = async (shift: ShiftDto) => {
    try {
      if (shift.isActive) {
        await deactivateShift.mutateAsync(shift.id);
        showSuccess('Vardiya pasifleştirildi!');
      } else {
        await activateShift.mutateAsync(shift.id);
        showSuccess('Vardiya aktifleştirildi!');
      }
    } catch (err) {
      showApiError(err, 'İşlem sırasında bir hata oluştu');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <ShiftsStats shifts={shifts} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<ClockIcon className="w-5 h-5" />}
        iconColor="#7c3aed"
        title="Vardiya Yönetimi"
        description="Tüm vardiyaları görüntüle ve yönet"
        itemCount={filteredShifts.length}
        primaryAction={{
          label: 'Yeni Vardiya',
          onClick: () => router.push('/hr/shifts/new'),
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
          title="Vardiyalar yüklenemedi"
          message={
            error instanceof Error
              ? error.message
              : 'Vardiyalar getirilirken bir hata oluştu. Lütfen tekrar deneyin.'
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <Input
              placeholder="Vardiya ara... (ad, kod)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="lg"
            />
          </div>
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
          <ShiftsTable
            shifts={filteredShifts}
            loading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={filteredShifts.length}
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