'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RocketLaunchIcon, MagnifyingGlassIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { OnboardingsStats, OnboardingsTable } from '@/components/hr/onboardings';
import { useOnboardings, useDeleteOnboarding } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { OnboardingDto } from '@/lib/api/services/hr.types';

export default function OnboardingsPage() {
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

  const { data: onboardingsData, isLoading, error, refetch } = useOnboardings();
  const deleteOnboardingMutation = useDeleteOnboarding();

  // Client-side filtering
  const filteredOnboardings = useMemo(() => {
    const onboardings = onboardingsData || [];
    if (!debouncedSearch) return onboardings;
    const lower = debouncedSearch.toLowerCase();
    return onboardings.filter((item: OnboardingDto) =>
      item.employeeName?.toLowerCase().includes(lower) ||
      item.buddyName?.toLowerCase().includes(lower)
    );
  }, [onboardingsData, debouncedSearch]);

  const totalCount = filteredOnboardings.length;

  const handleView = (id: number) => {
    router.push(`/hr/onboardings/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/onboardings/${id}/edit`);
  };

  const handleDelete = async (onboarding: OnboardingDto) => {
    try {
      await deleteOnboardingMutation.mutateAsync(onboarding.id);
      showSuccess('Onboarding sureci basariyla silindi');
      refetch();
    } catch (err) {
      showApiError(err, 'Onboarding sureci silinemedi');
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
        <OnboardingsStats onboardings={filteredOnboardings} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<RocketLaunchIcon className="w-5 h-5" />}
        iconColor="#64748b"
        title="Ise Alisim Surecleri"
        description="Yeni calisan oryantasyonlarini yonetin ve takip edin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Onboarding',
          onClick: () => router.push('/hr/onboardings/new'),
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
          title="Onboarding surecleri yuklenemedi"
          message={(error as Error).message}
          closable
          action={
            <button
              onClick={() => refetch()}
              className="text-slate-700 hover:text-slate-900 font-medium"
            >
              Tekrar Dene
            </button>
          }
          className="mt-6"
        />
      )}

      <div className="bg-white border border-slate-200 rounded-xl mt-6">
        <div className="p-4 border-b border-slate-100">
          <Input
            placeholder="Onboarding ara... (calisan adi, buddy)"
            prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
            size="lg"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        <OnboardingsTable
          onboardings={filteredOnboardings}
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
