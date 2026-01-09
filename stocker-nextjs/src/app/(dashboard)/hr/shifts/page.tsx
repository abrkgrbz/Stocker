'use client';

/**
 * Shifts List Page
 * Monochrome design system following inventory module patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Dropdown, Tooltip, Space, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowPathIcon,
  ClockIcon,
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  StopIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useShifts, useDeleteShift, useActivateShift, useDeactivateShift } from '@/lib/api/hooks/useHR';
import type { ShiftDto } from '@/lib/api/services/hr.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';

export default function ShiftsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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
  const { data: shifts = [], isLoading, refetch } = useShifts();
  const deleteShift = useDeleteShift();
  const activateShift = useActivateShift();
  const deactivateShift = useDeactivateShift();

  // Filter shifts
  const filteredShifts = useMemo(() => {
    return shifts.filter((s) =>
      !debouncedSearch ||
      s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      s.code?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [shifts, debouncedSearch]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: shifts.length,
      active: shifts.filter((s) => s.isActive).length,
      inactive: shifts.filter((s) => !s.isActive).length,
    };
  }, [shifts]);

  // CRUD Handlers
  const handleView = (id: number) => router.push(`/hr/shifts/${id}`);
  const handleEdit = (id: number) => router.push(`/hr/shifts/${id}/edit`);

  const handleDelete = async (shift: ShiftDto) => {
    try {
      await deleteShift.mutateAsync(shift.id);
      showSuccess('Vardiya basariyla silindi!');
    } catch (err) {
      showApiError(err, 'Vardiya silinirken bir hata olustu');
    }
  };

  const handleToggleActive = async (shift: ShiftDto) => {
    try {
      if (shift.isActive) {
        await deactivateShift.mutateAsync(shift.id);
        showSuccess('Vardiya pasiflestirild!');
      } else {
        await activateShift.mutateAsync(shift.id);
        showSuccess('Vardiya aktiflesitrild!');
      }
    } catch (err) {
      showApiError(err, 'Islem sirasinda bir hata olustu');
    }
  };

  const clearFilters = () => setSearchText('');

  // Table columns
  const columns: ColumnsType<ShiftDto> = [
    {
      title: 'Vardiya Adi',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (value) => <span className="font-medium text-slate-900">{value}</span>,
    },
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (value) => <span className="text-slate-600">{value || '-'}</span>,
    },
    {
      title: 'Baslangic',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 100,
      render: (value) => <span className="text-slate-700">{value}</span>,
    },
    {
      title: 'Bitis',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 100,
      render: (value) => <span className="text-slate-700">{value}</span>,
    },
    {
      title: 'Mola (dk)',
      dataIndex: 'breakDurationMinutes',
      key: 'breakDurationMinutes',
      width: 100,
      align: 'center',
      render: (value) => <span className="text-slate-500">{value || 0}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive: boolean) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
            isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
          }`}
        >
          {isActive ? <CheckCircleIcon className="w-4 h-4" /> : <StopIcon className="w-4 h-4" />}
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          { key: 'view', icon: <EyeIcon className="w-4 h-4" />, label: 'Goruntule', onClick: () => handleView(record.id) },
          { key: 'edit', icon: <PencilSquareIcon className="w-4 h-4" />, label: 'Duzenle', onClick: () => handleEdit(record.id) },
          { type: 'divider' as const },
          {
            key: 'toggle',
            icon: record.isActive ? <StopIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />,
            label: record.isActive ? 'Pasiflestir' : 'Aktiflestir',
            onClick: () => handleToggleActive(record),
          },
          { key: 'delete', icon: <TrashIcon className="w-4 h-4" />, label: 'Sil', danger: true, onClick: () => handleDelete(record) },
        ];
        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="!text-slate-600 hover:!text-slate-900" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <ClockIcon className="w-7 h-7" />
            Vardiya Yonetimi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tum vardiyalari goruntule ve yonet
          </p>
        </div>
        <Space size="middle">
          <Tooltip title="Yenile">
            <Button
              icon={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={() => refetch()}
              loading={isLoading}
              className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/hr/shifts/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Vardiya
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Vardiya</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.active}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif Vardiya</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <StopIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-500">{stats.inactive}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Pasif Vardiya</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <Input
              placeholder="Vardiya ara... (ad, kod)"
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
            />
          </div>
          <Button
            onClick={clearFilters}
            className="h-10 !border-slate-300 hover:!border-slate-400 !text-slate-600"
          >
            Temizle
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Table
          columns={columns}
          dataSource={filteredShifts}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 900 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredShifts.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} vardiya`,
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
