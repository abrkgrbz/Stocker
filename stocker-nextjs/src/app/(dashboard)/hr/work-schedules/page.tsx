'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select, DatePicker, Card, Row, Col } from 'antd';
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
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
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
      showSuccess('Başarılı', 'Çalışma programı silindi');
    } catch (err) {
      showApiError(err, 'Çalışma programı silinirken hata oluştu');
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
    <PageContainer maxWidth="7xl" className="bg-slate-50 min-h-screen">
      {/* Stats Cards */}
      <div className="mb-8">
        <WorkSchedulesStats schedules={schedules as WorkScheduleDto[]} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<CalendarIcon className="w-5 h-5" />}
        iconColor="#8b5cf6"
        title="Çalışma Programları"
        description="Çalışan çalışma programlarını görüntüleyin ve yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Program',
          onClick: () => router.push('/hr/work-schedules/new'),
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <div className="flex items-center gap-2">
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
          </div>
        }
      />

      {error && (
        <Alert
          variant="error"
          title="Programlar yüklenemedi"
          message={(error as Error).message}
          closable
          action={
            <button onClick={() => refetch()} className="text-red-600 hover:text-red-800 font-medium">
              Tekrar Dene
            </button>
          }
          className="mt-6"
        />
      )}

      <Card className="mt-6 mb-4 border border-gray-100 shadow-sm">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Çalışan veya vardiya ara..."
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              size="lg"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Çalışan seçin"
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: '100%', height: '44px' }}
              value={selectedEmployeeId}
              onChange={setSelectedEmployeeId}
              options={employees.map((e) => ({
                value: e.id,
                label: e.fullName,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%', height: '44px' }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              format="DD.MM.YYYY"
              placeholder={['Başlangıç', 'Bitiş']}
            />
          </Col>
          {hasFilters && (
            <Col xs={24} sm={12} md={4}>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                Temizle
              </button>
            </Col>
          )}
        </Row>
      </Card>

      <DataTableWrapper>
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
      </DataTableWrapper>
    </PageContainer>
  );
}
