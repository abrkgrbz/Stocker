'use client';

/**
 * Leave Types List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * Standardized with CRM Customer module patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowPathIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useLeaveTypes, useDeleteLeaveType, useActivateLeaveType, useDeactivateLeaveType } from '@/lib/api/hooks/useHR';
import type { LeaveTypeDto } from '@/lib/api/services/hr.types';
import { LeaveTypesStats, LeaveTypesTable } from '@/components/hr/leave-types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import {
  PageContainer,
  ListPageHeader,
  DataTableWrapper,
  Card,
} from '@/components/patterns';
import { Input, Alert, Spinner } from '@/components/primitives';

export default function LeaveTypesPage() {
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
  const { data: leaveTypes = [], isLoading, error, refetch } = useLeaveTypes();
  const deleteLeaveType = useDeleteLeaveType();
  const activateLeaveType = useActivateLeaveType();
  const deactivateLeaveType = useDeactivateLeaveType();

  // Filter leave types
  const filteredLeaveTypes = useMemo(() => {
    return leaveTypes.filter((lt) =>
      !debouncedSearch ||
      lt.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      lt.code?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [leaveTypes, debouncedSearch]);

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/leave-types/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/leave-types/${id}/edit`);
  };

  const handleDelete = async (leaveType: LeaveTypeDto) => {
    try {
      await deleteLeaveType.mutateAsync(leaveType.id);
      showSuccess('İzin türü başarıyla silindi!');
    } catch (err) {
      showApiError(err, 'İzin türü silinirken bir hata oluştu');
      throw err;
    }
  };

  const handleToggleActive = async (leaveType: LeaveTypeDto) => {
    try {
      if (leaveType.isActive) {
        await deactivateLeaveType.mutateAsync(leaveType.id);
        showSuccess('İzin türü pasifleştirildi!');
      } else {
        await activateLeaveType.mutateAsync(leaveType.id);
        showSuccess('İzin türü aktifleştirildi!');
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
        <LeaveTypesStats leaveTypes={leaveTypes} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<DocumentTextIcon className="w-5 h-5" />}
        iconColor="#7c3aed"
        title="İzin Türleri"
        description="Tüm izin türlerini görüntüle ve yönet"
        itemCount={filteredLeaveTypes.length}
        primaryAction={{
          label: 'Yeni İzin Türü',
          onClick: () => router.push('/hr/leave-types/new'),
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
          title="İzin türleri yüklenemedi"
          message={
            error instanceof Error
              ? error.message
              : 'İzin türleri getirilirken bir hata oluştu. Lütfen tekrar deneyin.'
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
              placeholder="İzin türü ara... (ad, kod)"
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
          <LeaveTypesTable
            leaveTypes={filteredLeaveTypes}
            loading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={filteredLeaveTypes.length}
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