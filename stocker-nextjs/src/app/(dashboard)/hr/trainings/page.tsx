'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select } from 'antd';
import { MagnifyingGlassIcon, BookOpenIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { TrainingsStats, TrainingsTable } from '@/components/hr/trainings';
import { useTrainings, useDeleteTraining } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { TrainingDto } from '@/lib/api/services/hr.types';
import { TrainingStatus } from '@/lib/api/services/hr.types';

export default function TrainingsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TrainingStatus | undefined>();
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

  // API Hooks
  const { data: trainings = [], isLoading, error, refetch } = useTrainings();
  const deleteTraining = useDeleteTraining();

  // Filter trainings
  const filteredTrainings = useMemo(() => {
    let result = trainings;

    if (statusFilter !== undefined) {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (debouncedSearch.trim()) {
      const search = debouncedSearch.toLowerCase();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(search) ||
          t.provider?.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search)
      );
    }

    return result;
  }, [trainings, debouncedSearch, statusFilter]);

  // Paginate
  const paginatedTrainings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTrainings.slice(start, start + pageSize);
  }, [filteredTrainings, currentPage, pageSize]);

  const totalCount = filteredTrainings.length;

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleDelete = async (training: TrainingDto) => {
    try {
      await deleteTraining.mutateAsync(training.id);
      showSuccess('Egitim Silindi', `"${training.title}" egitimi basariyla silindi.`);
    } catch (err) {
      showApiError(err, 'Egitim silinirken bir hata olustu');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <BookOpenIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Egitim Yonetimi</h1>
              <p className="text-sm text-slate-500">Sirket egitimlerini planlayin ve takip edin</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => router.push('/hr/trainings/new')}
            className="flex items-center gap-2 px-4 py-2 !bg-slate-900 hover:!bg-slate-800 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Egitim
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <TrainingsStats trainings={trainings} loading={isLoading} />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Egitimler yuklenemedi</p>
              <p className="text-sm text-slate-500">{(error as Error).message}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      )}

      {/* Filters Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[280px] max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Egitim ara... (baslik, saglayici)"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
          <div className="w-48">
            <Select
              placeholder="Durum filtrele"
              allowClear
              style={{ width: '100%', height: '42px' }}
              onChange={(value) => setStatusFilter(value)}
              className="[&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
              options={[
                { value: TrainingStatus.Scheduled, label: 'Planlandi' },
                { value: TrainingStatus.InProgress, label: 'Devam Ediyor' },
                { value: TrainingStatus.Completed, label: 'Tamamlandi' },
                { value: TrainingStatus.Cancelled, label: 'Iptal Edildi' },
                { value: TrainingStatus.Postponed, label: 'Ertelendi' },
              ]}
            />
          </div>
          <div className="text-sm text-slate-500">
            {totalCount} kayit
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <TrainingsTable
          trainings={paginatedTrainings}
          loading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onView={(id) => router.push(`/hr/trainings/${id}`)}
          onEdit={(id) => router.push(`/hr/trainings/${id}/edit`)}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
