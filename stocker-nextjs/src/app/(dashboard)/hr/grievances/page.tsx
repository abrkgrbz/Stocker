'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ExclamationCircleIcon, MagnifyingGlassIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { GrievancesStats, GrievancesTable } from '@/components/hr/grievances';
import { useGrievances, useDeleteGrievance } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { GrievanceDto } from '@/lib/api/services/hr.types';

export default function GrievancesPage() {
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

  const { data: grievancesData, isLoading, error, refetch } = useGrievances();
  const deleteGrievanceMutation = useDeleteGrievance();

  // Client-side filtering
  const filteredGrievances = useMemo(() => {
    const grievances = grievancesData || [];
    if (!debouncedSearch) return grievances;
    const lower = debouncedSearch.toLowerCase();
    return grievances.filter((item: GrievanceDto) =>
      item.subject?.toLowerCase().includes(lower) ||
      item.complainantName?.toLowerCase().includes(lower) ||
      item.grievanceType?.toLowerCase().includes(lower)
    );
  }, [grievancesData, debouncedSearch]);

  const totalCount = filteredGrievances.length;

  const handleView = (id: number) => {
    router.push(`/hr/grievances/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/grievances/${id}/edit`);
  };

  const handleDelete = async (grievance: GrievanceDto) => {
    try {
      await deleteGrievanceMutation.mutateAsync(grievance.id);
      showSuccess('Şikayet başarıyla silindi');
      refetch();
    } catch (err) {
      showApiError(err, 'Şikayet silinemedi');
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
        <GrievancesStats grievances={filteredGrievances} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<ExclamationCircleIcon className="w-5 h-5" />}
        iconColor="#8b5cf6"
        title="Şikayetler"
        description="Çalışan şikayetlerini takip edin ve yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Şikayet',
          onClick: () => router.push('/hr/grievances/new'),
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
          title="Şikayetler yüklenemedi"
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
            placeholder="Şikayet ara... (konu, şikayet eden, tür)"
            prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
            size="lg"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        <GrievancesTable
          grievances={filteredGrievances}
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
