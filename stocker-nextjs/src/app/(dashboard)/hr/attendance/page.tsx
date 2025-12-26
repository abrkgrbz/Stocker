'use client';

/**
 * Attendance Tracking Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Select,
  DatePicker,
  Dropdown,
} from 'antd';
import { Spinner } from '@/components/primitives';
import {
  PlusIcon,
  ArrowPathIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  EyeIcon,
  CheckCircleIcon,
  UserIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import { useAttendance, useEmployees } from '@/lib/api/hooks/useHR';
import type { AttendanceDto, AttendanceFilterDto } from '@/lib/api/services/hr.types';
import { AttendanceStatus } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';

const { RangePicker } = DatePicker;

export default function AttendancePage() {
  const router = useRouter();
  const [filters, setFilters] = useState<AttendanceFilterDto>({});

  // API Hooks
  const { data: attendances = [], isLoading, refetch } = useAttendance(filters);
  const { data: employees = [] } = useEmployees();

  // Stats
  const totalRecords = attendances.length;
  const presentCount = attendances.filter((a) => a.status === AttendanceStatus.Present).length;
  const lateCount = attendances.filter((a) => a.status === AttendanceStatus.Late).length;
  const absentCount = attendances.filter((a) => a.status === AttendanceStatus.Absent).length;

  const formatTime = (time?: string) => {
    if (!time) return '-';
    return time.substring(0, 5);
  };

  const getStatusConfig = (status?: AttendanceStatus) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      [AttendanceStatus.Present]: { color: 'green', text: 'Mevcut' },
      [AttendanceStatus.Absent]: { color: 'red', text: 'Yok' },
      [AttendanceStatus.Late]: { color: 'orange', text: 'Geç' },
      [AttendanceStatus.HalfDay]: { color: 'blue', text: 'Yarım Gün' },
      [AttendanceStatus.OnLeave]: { color: 'purple', text: 'İzinli' },
      [AttendanceStatus.EarlyDeparture]: { color: 'cyan', text: 'Erken Ayrılış' },
      [AttendanceStatus.Holiday]: { color: 'gold', text: 'Tatil' },
      [AttendanceStatus.Weekend]: { color: 'default', text: 'Hafta Sonu' },
      [AttendanceStatus.RemoteWork]: { color: 'geekblue', text: 'Uzaktan Çalışma' },
      [AttendanceStatus.Overtime]: { color: 'lime', text: 'Fazla Mesai' },
      [AttendanceStatus.Training]: { color: 'magenta', text: 'Eğitim' },
      [AttendanceStatus.FieldWork]: { color: 'volcano', text: 'Saha Çalışması' },
    };
    const defaultConfig = { color: 'default', text: '-' };
    if (status === undefined || status === null) return defaultConfig;
    return statusMap[status] || defaultConfig;
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
  };

  const columns: ColumnsType<AttendanceDto> = [
    {
      title: 'Çalışan',
      key: 'employee',
      width: 220,
      render: (_, record: AttendanceDto) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf615' }}>
            <UserIcon className="w-5 h-5" style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{record.employeeName || `Çalışan #${record.employeeId}`}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (date: string) => <span className="text-sm text-slate-600">{dayjs(date).format('DD.MM.YYYY')}</span>,
    },
    {
      title: 'Giriş',
      dataIndex: 'checkInTime',
      key: 'checkIn',
      width: 100,
      render: (time: string) => <span className="text-sm text-slate-600">{formatTime(time)}</span>,
    },
    {
      title: 'Çıkış',
      dataIndex: 'checkOutTime',
      key: 'checkOut',
      width: 100,
      render: (time: string) => <span className="text-sm text-slate-600">{formatTime(time)}</span>,
    },
    {
      title: 'Çalışma Süresi',
      dataIndex: 'workedHours',
      key: 'workedHours',
      width: 130,
      render: (hours: number) => (
        <span className="text-sm text-slate-600">{hours ? `${hours.toFixed(1)} saat` : '-'}</span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: AttendanceStatus) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_, record: AttendanceDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeIcon className="w-4 h-4" />,
                label: 'Görüntüle',
                onClick: () => router.push(`/hr/attendance/${record.id}`),
              },
              {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Düzenle',
                onClick: () => router.push(`/hr/attendance/${record.id}/edit`),
              },
            ],
          }}
          trigger={['click']}
        >
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <EllipsisVerticalIcon className="w-4 h-4" />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Kayıt</span>
              <div className="text-2xl font-semibold text-slate-900">{totalRecords}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#7c3aed15' }}>
              <ClockIcon className="w-6 h-6" style={{ color: '#7c3aed' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Mevcut</span>
              <div className="text-2xl font-semibold text-slate-900">{presentCount}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <CheckCircleIcon className="w-6 h-6" style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Geç Kalan</span>
              <div className="text-2xl font-semibold text-slate-900">{lateCount}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b15' }}>
              <ClockIcon className="w-6 h-6" style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Yok</span>
              <div className="text-2xl font-semibold text-slate-900">{absentCount}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ef444415' }}>
              <ExclamationTriangleIcon className="w-6 h-6" style={{ color: '#ef4444' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<ClockIcon className="w-5 h-5" />}
        iconColor="#7c3aed"
        title="Yoklama Takibi"
        description="Çalışan yoklama kayıtlarını görüntüle ve yönet"
        itemCount={totalRecords}
        primaryAction={{
          label: 'Yeni Kayıt',
          onClick: () => router.push('/hr/attendance/new'),
          icon: <PlusIcon className="w-5 h-5" />,
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

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            placeholder="Çalışan seçin"
            allowClear
            showSearch
            optionFilterProp="children"
            className="h-10"
            onChange={(value) => setFilters((prev) => ({ ...prev, employeeId: value }))}
            options={employees.map((e) => ({
              value: e.id,
              label: e.fullName,
            }))}
          />
          <RangePicker
            className="h-10"
            format="DD.MM.YYYY"
            placeholder={['Başlangıç', 'Bitiş']}
            onChange={(dates) => {
              if (dates) {
                setFilters((prev) => ({
                  ...prev,
                  startDate: dates[0]?.format('YYYY-MM-DD'),
                  endDate: dates[1]?.format('YYYY-MM-DD'),
                }));
              } else {
                setFilters((prev) => ({ ...prev, startDate: undefined, endDate: undefined }));
              }
            }}
          />
          <Select
            placeholder="Durum"
            allowClear
            className="h-10"
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            options={[
              { value: AttendanceStatus.Present, label: 'Mevcut' },
              { value: AttendanceStatus.Absent, label: 'Yok' },
              { value: AttendanceStatus.Late, label: 'Geç' },
              { value: AttendanceStatus.HalfDay, label: 'Yarım Gün' },
              { value: AttendanceStatus.OnLeave, label: 'İzinli' },
            ]}
          />
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
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
          <Table
            columns={columns}
            dataSource={attendances}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 900 }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
            }}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
