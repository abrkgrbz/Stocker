'use client';

/**
 * Work Schedules List Page
 * Monochrome design system following inventory page patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select, DatePicker } from 'antd';
import {
  ArrowPathIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useWorkSchedules, useDeleteWorkSchedule, useEmployees } from '@/lib/api/hooks/useHR';
import type { WorkScheduleDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';
import { WorkSchedulesStats, WorkSchedulesTable } from '@/components/hr/work-schedules';
import { showSuccess, showApiError } from '@/lib/utils/notifications';

const { RangePicker } = DatePicker;

export default function WorkSchedulesPage() {
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const startDate = dateRange?.[0]?.format('YYYY-MM-DD');
  const endDate = dateRange?.[1]?.format('YYYY-MM-DD');

  const { data: schedules = [], isLoading, error, refetch } = useWorkSchedules(selectedEmployeeId, startDate, endDate);
  const { data: employees = [] } = useEmployees();
  const deleteSchedule = useDeleteWorkSchedule();

  const filteredSchedules = useMemo(() => {
    if (!debouncedSearch) return schedules;
    const lower = debouncedSearch.toLowerCase();
    return schedules.filter((s: WorkScheduleDto) =>
      s.employeeName?.toLowerCase().includes(lower) ||
      s.shiftName?.toLowerCase().includes(lower)
    );
  }, [schedules, debouncedSearch]);

  const totalCount = filteredSchedules.length;

  const handleView = (id: number) => router.push(`/hr/work-schedules/${id}`);
  const handleEdit = (id: number) => router.push(`/hr/work-schedules/${id}/edit`);

  const handleDelete = async (schedule: WorkScheduleDto) => {
    try {
      await deleteSchedule.mutateAsync(schedule.id);
      showSuccess('Basarili', 'Calisma programi silindi');
    } catch (err) {
      showApiError(err, 'Calisma programi silinirken hata olustu');
    }
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedEmployeeId(undefined);
    setDateRange(null);
  };

  const hasFilters = searchText || selectedEmployeeId || dateRange;

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Calisma Programlari</h1>
            <p className="text-sm text-slate-500">
              {totalCount} program
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/hr/work-schedules/assign')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            title="Toplu Atama"
          >
            <UsersIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => router.push('/hr/work-schedules/new')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Program
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <WorkSchedulesStats schedules={schedules as WorkScheduleDto[]} loading={isLoading} />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Programlar yuklenemedi</p>
              <p className="text-sm text-slate-500">{(error as Error).message}</p>
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
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Calisan veya vardiya ara..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          <Select
            placeholder="Calisan secin"
            allowClear
            showSearch
            optionFilterProp="label"
            className="h-12 [&_.ant-select-selector]:!h-12 [&_.ant-select-selector]:!py-2 [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selection-item]:!leading-8"
            value={selectedEmployeeId}
            onChange={setSelectedEmployeeId}
            options={employees.map((e) => ({
              value: e.id,
              label: e.fullName,
            }))}
          />
          <RangePicker
            className="h-12 [&_.ant-picker-input_input]:!py-2 !border-slate-200"
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            format="DD.MM.YYYY"
            placeholder={['Baslangic', 'Bitis']}
          />
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-1 h-12 px-4 text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          </div>
        ) : (
          <WorkSchedulesTable
            schedules={filteredSchedules as WorkScheduleDto[]}
            loading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
