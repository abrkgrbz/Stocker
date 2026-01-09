'use client';

/**
 * Leave Types List Page
 * Monochrome design system following inventory patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Dropdown, Space } from 'antd';
import {
  ArrowPathIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CheckCircleIcon,
  StopIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { useLeaveTypes, useDeleteLeaveType, useActivateLeaveType, useDeactivateLeaveType } from '@/lib/api/hooks/useHR';
import type { LeaveTypeDto } from '@/lib/api/services/hr.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { ColumnsType } from 'antd/es/table';

export default function LeaveTypesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

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
  const { data: leaveTypes = [], isLoading, refetch } = useLeaveTypes();
  const deleteLeaveType = useDeleteLeaveType();
  const activateLeaveType = useActivateLeaveType();
  const deactivateLeaveType = useDeactivateLeaveType();

  // Filter leave types
  const filteredLeaveTypes = useMemo(() => {
    return leaveTypes.filter((lt) =>
      !debouncedSearch ||
      lt.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      lt.code?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [leaveTypes, debouncedSearch]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = leaveTypes.length;
    const active = leaveTypes.filter((lt) => lt.isActive).length;
    const inactive = total - active;
    const totalDefaultDays = leaveTypes.reduce((sum, lt) => sum + (lt.defaultDays || 0), 0);
    return { total, active, inactive, totalDefaultDays };
  }, [leaveTypes]);

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/leave-types/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/leave-types/${id}/edit`);
  };

  const handleDelete = async (leaveType: LeaveTypeDto) => {
    try {
      await deleteLeaveType.mutateAsync(leaveType.id);
      showSuccess('Izin turu basariyla silindi!');
    } catch (err) {
      showApiError(err, 'Izin turu silinirken bir hata olustu');
    }
  };

  const handleToggleActive = async (leaveType: LeaveTypeDto) => {
    try {
      if (leaveType.isActive) {
        await deactivateLeaveType.mutateAsync(leaveType.id);
        showSuccess('Izin turu pasiflestrildi!');
      } else {
        await activateLeaveType.mutateAsync(leaveType.id);
        showSuccess('Izin turu aktiflestrildi!');
      }
    } catch (err) {
      showApiError(err, 'Islem sirasinda bir hata olustu');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
  };

  // Table columns
  const columns: ColumnsType<LeaveTypeDto> = [
    {
      title: 'Izin Turu',
      key: 'leaveType',
      width: 280,
      render: (_, record) => (
        <div className="space-y-1">
          <span
            className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600"
            onClick={() => handleView(record.id)}
          >
            {record.name}
          </span>
          <div className="text-xs text-slate-500">
            {record.code || '-'}
          </div>
          {!record.isActive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
              Pasif
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Aciklama',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (description) => (
        <span className="text-slate-600 line-clamp-2">{description || '-'}</span>
      ),
    },
    {
      title: 'Varsayilan Gun',
      dataIndex: 'defaultDays',
      key: 'defaultDays',
      width: 130,
      align: 'center',
      render: (days) => (
        <span className="font-semibold text-slate-900">{days || 0} gun</span>
      ),
    },
    {
      title: 'Ucretli mi?',
      dataIndex: 'isPaid',
      key: 'isPaid',
      width: 100,
      align: 'center',
      render: (isPaid) => (
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
          style={{
            backgroundColor: isPaid ? '#e2e8f0' : '#f1f5f9',
            color: isPaid ? '#1e293b' : '#64748b'
          }}
        >
          {isPaid ? 'Evet' : 'Hayir'}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
          style={{
            backgroundColor: isActive ? '#e2e8f0' : '#f1f5f9',
            color: isActive ? '#1e293b' : '#64748b'
          }}
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
          { type: 'divider' as const },
          {
            key: 'toggle',
            icon: record.isActive ? <StopIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />,
            label: record.isActive ? 'Pasiflestir' : 'Aktiflestir',
            onClick: () => handleToggleActive(record),
          },
          {
            key: 'delete',
            icon: <TrashIcon className="w-4 h-4" />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDelete(record),
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
            <DocumentTextIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Izin Turleri</h1>
            <p className="text-slate-500 mt-1">Tum izin turlerini goruntule ve yonet</p>
          </div>
        </div>
        <Space>
          <Button
            onClick={() => router.push('/hr/leaves')}
            className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
          >
            Izin Talepleri
          </Button>
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
            onClick={() => router.push('/hr/leave-types/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Izin Turu
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ClipboardDocumentListIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Izin Turu</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.active}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <StopIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.inactive}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Pasif</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CalendarDaysIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-600">{stats.totalDefaultDays}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Varsayilan Gun</div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Izin turu ara... (ad, kod)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          <Button onClick={clearFilters} className="!border-slate-300 !text-slate-600">
            Temizle
          </Button>
        </div>

        {/* Results count */}
        <div className="text-sm text-slate-500 mb-4">
          {filteredLeaveTypes.length} izin turu listeleniyor
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredLeaveTypes}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 900 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredLeaveTypes.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} izin turu`,
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
