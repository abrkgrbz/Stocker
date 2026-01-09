'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select } from 'antd';
import {
  ArrowPathIcon,
  TrophyIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { usePerformanceReviews, useDeletePerformanceReview, useEmployees } from '@/lib/api/hooks/useHR';
import type { PerformanceReviewDto } from '@/lib/api/services/hr.types';
import { PerformanceStats, PerformanceTable } from '@/components/hr/performance';
import { showSuccess, showApiError } from '@/lib/utils/notifications';

const statusOptions = [
  { value: 'Draft', label: 'Taslak' },
  { value: 'InProgress', label: 'Devam Ediyor' },
  { value: 'Completed', label: 'Tamamlandi' },
  { value: 'Cancelled', label: 'Iptal' },
];

export default function PerformancePage() {
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data: reviews = [], isLoading, error, refetch } = usePerformanceReviews(selectedEmployeeId);
  const { data: employees = [] } = useEmployees();
  const deleteReview = useDeletePerformanceReview();

  const filteredReviews = useMemo(() => {
    return reviews.filter((r: PerformanceReviewDto) => {
      const matchesSearch =
        !debouncedSearch ||
        r.employeeName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        r.reviewPeriod?.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesStatus = !selectedStatus || r.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [reviews, debouncedSearch, selectedStatus]);

  const totalCount = filteredReviews.length;

  const handleView = (id: number) => router.push(`/hr/performance/${id}`);
  const handleEdit = (id: number) => router.push(`/hr/performance/${id}/edit`);

  const handleDelete = async (review: PerformanceReviewDto) => {
    try {
      await deleteReview.mutateAsync(review.id);
      showSuccess('Basarili', 'Degerlendirme silindi');
    } catch (err) {
      showApiError(err, 'Degerlendirme silinirken hata olustu');
    }
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedEmployeeId(undefined);
    setSelectedStatus(undefined);
  };

  const hasFilters = searchText || selectedEmployeeId || selectedStatus;

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <TrophyIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Performans Degerlendirme</h1>
              <p className="text-sm text-slate-500">Calisan performans degerlendirmelerini goruntuyleyin ve yonetin</p>
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
            onClick={() => router.push('/hr/performance/new')}
            className="flex items-center gap-2 px-4 py-2 !bg-slate-900 hover:!bg-slate-800 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Degerlendirme
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <PerformanceStats reviews={reviews as PerformanceReviewDto[]} loading={isLoading} />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Degerlendirmeler yuklenemedi</p>
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
          <div className="flex-1 min-w-[240px] max-w-sm">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Calisan veya donem ara..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
          <div className="w-48">
            <Select
              placeholder="Calisan secin"
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: '100%', height: '42px' }}
              value={selectedEmployeeId}
              onChange={setSelectedEmployeeId}
              className="[&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
              options={employees.map((e) => ({
                value: e.id,
                label: e.fullName,
              }))}
            />
          </div>
          <div className="w-40">
            <Select
              placeholder="Durum"
              allowClear
              style={{ width: '100%', height: '42px' }}
              value={selectedStatus}
              onChange={setSelectedStatus}
              className="[&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
              options={statusOptions}
            />
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
              Temizle
            </button>
          )}
          <div className="text-sm text-slate-500 ml-auto">
            {totalCount} kayit
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <PerformanceTable
          reviews={filteredReviews as PerformanceReviewDto[]}
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
