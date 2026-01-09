'use client';

/**
 * Holidays List Page
 * Monochrome design system following inventory page patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select, Table } from 'antd';
import {
  ArrowPathIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useHolidays, useDeleteHoliday } from '@/lib/api/hooks/useHR';
import type { HolidayDto } from '@/lib/api/services/hr.types';
import { HolidaysStats, HolidaysTable } from '@/components/hr/holidays';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';

export default function HolidaysPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [yearFilter, setYearFilter] = useState<number | undefined>(dayjs().year());

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
  const { data: holidays = [], isLoading, error, refetch } = useHolidays(yearFilter);
  const deleteHoliday = useDeleteHoliday();

  // Filter holidays
  const filteredHolidays = useMemo(() => {
    return holidays.filter((h) =>
      !debouncedSearch ||
      h.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [holidays, debouncedSearch]);

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/holidays/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/holidays/${id}/edit`);
  };

  const handleDelete = async (holiday: HolidayDto) => {
    try {
      await deleteHoliday.mutateAsync(holiday.id);
      showSuccess('Tatil gunu basariyla silindi!');
    } catch (err) {
      showApiError(err, 'Tatil gunu silinirken bir hata olustu');
      throw err;
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
    setYearFilter(dayjs().year());
  };

  const currentYear = dayjs().year();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - 2 + i,
    label: `${currentYear - 2 + i}`,
  }));

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Resmi Tatiller</h1>
            <p className="text-sm text-slate-500">
              {filteredHolidays.length} tatil gunu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => router.push('/hr/holidays/new')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Tatil
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <HolidaysStats holidays={holidays} loading={isLoading} />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Tatiller yuklenemedi</p>
              <p className="text-sm text-slate-500">
                {error instanceof Error
                  ? error.message
                  : 'Tatil gunleri getirilirken bir hata olustu. Lutfen tekrar deneyin.'}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Tatil ara..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>
          <Select
            placeholder="Yil secin"
            className="h-12 [&_.ant-select-selector]:!h-12 [&_.ant-select-selector]:!py-2 [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selection-item]:!leading-8"
            value={yearFilter}
            onChange={(value) => setYearFilter(value)}
            allowClear
            options={yearOptions}
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
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          </div>
        ) : (
          <HolidaysTable
            holidays={filteredHolidays}
            loading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={filteredHolidays.length}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
