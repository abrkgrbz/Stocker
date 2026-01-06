'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ExclamationTriangleIcon, MagnifyingGlassIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { DisciplinaryActionsStats, DisciplinaryActionsTable } from '@/components/hr/disciplinary-actions';
import { useDisciplinaryActions, useDeleteDisciplinaryAction } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { DisciplinaryActionDto } from '@/lib/api/services/hr.types';

export default function DisciplinaryActionsPage() {
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

  const { data: actionsData, isLoading, error, refetch } = useDisciplinaryActions();
  const deleteActionMutation = useDeleteDisciplinaryAction();

  // Client-side filtering
  const filteredActions = useMemo(() => {
    const actions = actionsData || [];
    if (!debouncedSearch) return actions;
    const lower = debouncedSearch.toLowerCase();
    return actions.filter((item: DisciplinaryActionDto) =>
      item.employeeName?.toLowerCase().includes(lower) ||
      item.actionType?.toLowerCase().includes(lower)
    );
  }, [actionsData, debouncedSearch]);

  const totalCount = filteredActions.length;

  const handleView = (id: number) => {
    router.push(`/hr/disciplinary-actions/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/disciplinary-actions/${id}/edit`);
  };

  const handleDelete = async (action: DisciplinaryActionDto) => {
    try {
      await deleteActionMutation.mutateAsync(action.id);
      showSuccess('Disiplin işlemi başarıyla silindi');
      refetch();
    } catch (err) {
      showApiError(err, 'Disiplin işlemi silinemedi');
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
        <DisciplinaryActionsStats actions={filteredActions} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<ExclamationTriangleIcon className="w-5 h-5" />}
        iconColor="#ef4444"
        title="Disiplin İşlemleri"
        description="Çalışan disiplin süreçlerini takip edin ve yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Disiplin İşlemi',
          onClick: () => router.push('/hr/disciplinary-actions/new'),
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
          title="Disiplin işlemleri yüklenemedi"
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
            placeholder="Disiplin işlemi ara... (çalışan, işlem türü)"
            prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
            size="lg"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        <DisciplinaryActionsTable
          actions={filteredActions}
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
