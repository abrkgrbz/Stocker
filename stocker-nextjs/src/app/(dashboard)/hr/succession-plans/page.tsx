'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { StarIcon, MagnifyingGlassIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { SuccessionPlansStats, SuccessionPlansTable } from '@/components/hr/succession-plans';
import { useSuccessionPlans, useDeleteSuccessionPlan } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { SuccessionPlanDto } from '@/lib/api/services/hr.types';

export default function SuccessionPlansPage() {
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

  const { data: plansData, isLoading, error, refetch } = useSuccessionPlans();
  const deletePlanMutation = useDeleteSuccessionPlan();

  // Client-side filtering
  const filteredPlans = useMemo(() => {
    const plans = plansData || [];
    if (!debouncedSearch) return plans;
    const lower = debouncedSearch.toLowerCase();
    return plans.filter((item: SuccessionPlanDto) =>
      item.positionTitle?.toLowerCase().includes(lower) ||
      item.departmentName?.toLowerCase().includes(lower) ||
      item.currentIncumbentName?.toLowerCase().includes(lower)
    );
  }, [plansData, debouncedSearch]);

  const totalCount = filteredPlans.length;

  const handleView = (id: number) => {
    router.push(`/hr/succession-plans/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/succession-plans/${id}/edit`);
  };

  const handleDelete = async (plan: SuccessionPlanDto) => {
    try {
      await deletePlanMutation.mutateAsync(plan.id);
      showSuccess('Yedekleme planı başarıyla silindi');
      refetch();
    } catch (err) {
      showApiError(err, 'Yedekleme planı silinemedi');
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
        <SuccessionPlansStats plans={filteredPlans} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<StarIcon className="w-5 h-5" />}
        iconColor="#f59e0b"
        title="Yedekleme Planları"
        description="Kritik pozisyonlar için yedekleme planlarını yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Plan',
          onClick: () => router.push('/hr/succession-plans/new'),
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
          title="Yedekleme planları yüklenemedi"
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
            placeholder="Plan ara... (pozisyon, departman, mevcut kişi)"
            prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
            size="lg"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        <SuccessionPlansTable
          plans={filteredPlans}
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
