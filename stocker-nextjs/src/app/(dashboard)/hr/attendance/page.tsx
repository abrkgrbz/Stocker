'use client';

/**
 * Attendance Tracking Page
 * Monochrome design system following inventory patterns
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Select, DatePicker, Button, Dropdown, Space } from 'antd';
import {
  ArrowPathIcon,
  ClockIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilSquareIcon,
  EllipsisHorizontalIcon,
  UsersIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { useAttendance, useEmployees } from '@/lib/api/hooks/useHR';
import type { AttendanceDto, AttendanceFilterDto } from '@/lib/api/services/hr.types';
import { AttendanceStatus } from '@/lib/api/services/hr.types';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

// Monochrome attendance status configuration
const attendanceStatusConfig: Record<number, { color: string; bgColor: string; label: string }> = {
  [AttendanceStatus.Present]: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Mevcut' },
  [AttendanceStatus.Absent]: { color: '#475569', bgColor: '#cbd5e1', label: 'Yok' },
  [AttendanceStatus.Late]: { color: '#334155', bgColor: '#e2e8f0', label: 'Gec' },
  [AttendanceStatus.HalfDay]: { color: '#64748b', bgColor: '#f1f5f9', label: 'Yarim Gun' },
  [AttendanceStatus.OnLeave]: { color: '#334155', bgColor: '#f1f5f9', label: 'Izinli' },
};

export default function AttendancePage() {
  const router = useRouter();
  const [filters, setFilters] = useState<AttendanceFilterDto>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // API Hooks
  const { data: attendances = [], isLoading, refetch } = useAttendance(filters);
  const { data: employees = [] } = useEmployees();

  // Calculate stats
  const stats = useMemo(() => {
    const total = attendances.length;
    const present = attendances.filter((a) => a.status === AttendanceStatus.Present).length;
    const absent = attendances.filter((a) => a.status === AttendanceStatus.Absent).length;
    const late = attendances.filter((a) => a.status === AttendanceStatus.Late).length;
    return { total, present, absent, late };
  }, [attendances]);

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/attendance/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/attendance/${id}/edit`);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
  };

  // Table columns
  const columns: ColumnsType<AttendanceDto> = [
    {
      title: 'Calisan',
      key: 'employee',
      width: 220,
      render: (_, record) => (
        <div className="space-y-1">
          <span className="font-semibold text-slate-900">
            {record.employeeName}
          </span>
          <div className="text-xs text-slate-500">
            {record.employeeCode}
          </div>
        </div>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date) => (
        <span className="text-slate-600">
          {date ? new Date(date).toLocaleDateString('tr-TR') : '-'}
        </span>
      ),
    },
    {
      title: 'Giris Saati',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      width: 100,
      render: (time) => (
        <span className="text-slate-600">{time || '-'}</span>
      ),
    },
    {
      title: 'Cikis Saati',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      width: 100,
      render: (time) => (
        <span className="text-slate-600">{time || '-'}</span>
      ),
    },
    {
      title: 'Calisma Suresi',
      dataIndex: 'workingHours',
      key: 'workingHours',
      width: 120,
      render: (hours) => (
        <span className="font-medium text-slate-900">
          {hours ? `${hours.toFixed(1)} saat` : '-'}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: AttendanceStatus) => {
        const config = attendanceStatusConfig[status] || { color: '#64748b', bgColor: '#f1f5f9', label: 'Bilinmiyor' };
        return (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Notlar',
      dataIndex: 'notes',
      key: 'notes',
      width: 200,
      render: (notes) => (
        <span className="text-slate-600 line-clamp-2">{notes || '-'}</span>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Goruntule',
            onClick: () => handleView(record.id),
          },
          {
            key: 'edit',
            icon: <PencilSquareIcon className="w-4 h-4" />,
            label: 'Duzenle',
            onClick: () => handleEdit(record.id),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="text-slate-600 hover:text-slate-900" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <ClockIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Yoklama Takibi</h1>
            <p className="text-slate-500 mt-1">Calisan yoklama kayitlarini goruntule ve yonet</p>
          </div>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            onClick={() => refetch()}
            loading={isLoading}
            className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/hr/attendance/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Kayit
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Kayit</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.present}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Mevcut</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <XCircleIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.absent}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Devamsiz</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-600">{stats.late}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Gec Gelen</div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Select
            placeholder="Calisan secin"
            allowClear
            showSearch
            optionFilterProp="children"
            style={{ width: 220 }}
            value={filters.employeeId}
            onChange={(value) => setFilters((prev) => ({ ...prev, employeeId: value }))}
            options={employees.map((e) => ({
              value: e.id,
              label: e.fullName,
            }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <RangePicker
            style={{ width: 280 }}
            format="DD.MM.YYYY"
            placeholder={['Baslangic', 'Bitis']}
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
            className="[&_.ant-picker]:!border-slate-300 [&_.ant-picker]:!rounded-lg"
          />
          <Select
            placeholder="Durum"
            allowClear
            style={{ width: 140 }}
            value={filters.status}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            options={Object.entries(attendanceStatusConfig).map(([value, config]) => ({
              value: Number(value),
              label: config.label,
            }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Button onClick={clearFilters} className="!border-slate-300 !text-slate-600">
            Temizle
          </Button>
        </div>

        {/* Results count */}
        <div className="text-sm text-slate-500 mb-4">
          {attendances.length} kayit listeleniyor
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={attendances}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1100 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: attendances.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayit`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}
