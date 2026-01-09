'use client';

/**
 * Leaves List Page
 * Monochrome design system following inventory patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Select, DatePicker, Button, Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  useLeaves,
  useDeleteLeave,
  useApproveLeave,
  useRejectLeave,
  useEmployees,
  useLeaveTypes,
} from '@/lib/api/hooks/useHR';
import type { LeaveDto, LeaveFilterDto } from '@/lib/api/services/hr.types';
import { LeaveStatus } from '@/lib/api/services/hr.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

// Monochrome leave status configuration
const leaveStatusConfig: Record<number, { color: string; bgColor: string; label: string }> = {
  [LeaveStatus.Pending]: { color: '#475569', bgColor: '#e2e8f0', label: 'Beklemede' },
  [LeaveStatus.Approved]: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Onaylandi' },
  [LeaveStatus.Rejected]: { color: '#64748b', bgColor: '#f1f5f9', label: 'Reddedildi' },
  [LeaveStatus.Cancelled]: { color: '#94a3b8', bgColor: '#f8fafc', label: 'Iptal Edildi' },
  [LeaveStatus.Taken]: { color: '#334155', bgColor: '#e2e8f0', label: 'Kullanildi' },
  [LeaveStatus.PartiallyTaken]: { color: '#475569', bgColor: '#f1f5f9', label: 'Kismen Kullanildi' },
};

export default function LeavesPage() {
  const router = useRouter();

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<LeaveFilterDto>({});

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
  const { data: leaves = [], isLoading, refetch } = useLeaves(filters);
  const { data: employees = [] } = useEmployees();
  const { data: leaveTypes = [] } = useLeaveTypes();
  const deleteLeave = useDeleteLeave();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();

  // Filter leaves by search
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      const matchesSearch =
        !debouncedSearch ||
        leave.employeeName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (leave.employeeCode && leave.employeeCode.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (leave.leaveTypeName && leave.leaveTypeName.toLowerCase().includes(debouncedSearch.toLowerCase()));

      return matchesSearch;
    });
  }, [leaves, debouncedSearch]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = leaves.length;
    const pending = leaves.filter((l) => l.status === LeaveStatus.Pending).length;
    const approved = leaves.filter((l) => l.status === LeaveStatus.Approved).length;
    const rejected = leaves.filter((l) => l.status === LeaveStatus.Rejected).length;
    return { total, pending, approved, rejected };
  }, [leaves]);

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/leaves/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/leaves/${id}/edit`);
  };

  const handleDelete = async (leave: LeaveDto) => {
    try {
      await deleteLeave.mutateAsync(leave.id);
      showSuccess('Izin talebi basariyla silindi!');
    } catch (err) {
      showApiError(err, 'Izin talebi silinirken bir hata olustu');
    }
  };

  const handleApprove = async (leave: LeaveDto) => {
    try {
      await approveLeave.mutateAsync({ id: leave.id });
      showSuccess('Izin talebi onaylandi!');
    } catch (err) {
      showApiError(err, 'Izin talebi onaylanirken bir hata olustu');
    }
  };

  const handleReject = async (leave: LeaveDto) => {
    try {
      await rejectLeave.mutateAsync({ id: leave.id, data: { reason: 'Reddedildi' } });
      showSuccess('Izin talebi reddedildi!');
    } catch (err) {
      showApiError(err, 'Izin talebi reddedilirken bir hata olustu');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
    setFilters({});
  };

  // Table columns
  const columns: ColumnsType<LeaveDto> = [
    {
      title: 'Calisan',
      key: 'employee',
      width: 200,
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
      title: 'Izin Turu',
      dataIndex: 'leaveTypeName',
      key: 'leaveType',
      width: 140,
      render: (name) => (
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700"
        >
          {name}
        </span>
      ),
    },
    {
      title: 'Baslangic',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 110,
      render: (date) => (
        <span className="text-slate-600">
          {date ? new Date(date).toLocaleDateString('tr-TR') : '-'}
        </span>
      ),
    },
    {
      title: 'Bitis',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 110,
      render: (date) => (
        <span className="text-slate-600">
          {date ? new Date(date).toLocaleDateString('tr-TR') : '-'}
        </span>
      ),
    },
    {
      title: 'Gun',
      dataIndex: 'totalDays',
      key: 'totalDays',
      width: 80,
      align: 'center',
      render: (days) => (
        <span className="font-semibold text-slate-900">{days}</span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: LeaveStatus) => {
        const config = leaveStatusConfig[status] || { color: '#64748b', bgColor: '#f1f5f9', label: 'Bilinmiyor' };
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
      title: 'Aciklama',
      dataIndex: 'reason',
      key: 'reason',
      width: 180,
      render: (reason) => (
        <span className="text-slate-600 line-clamp-2">{reason || '-'}</span>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
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
          { type: 'divider' },
        ];

        if (record.status === LeaveStatus.Pending) {
          menuItems.push(
            {
              key: 'approve',
              icon: <CheckIcon className="w-4 h-4" />,
              label: 'Onayla',
              onClick: () => handleApprove(record),
            },
            {
              key: 'reject',
              icon: <XMarkIcon className="w-4 h-4" />,
              label: 'Reddet',
              onClick: () => handleReject(record),
            },
            { type: 'divider' }
          );
        }

        menuItems.push({
          key: 'delete',
          icon: <TrashIcon className="w-4 h-4" />,
          label: 'Sil',
          danger: true,
          onClick: () => handleDelete(record),
        });

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
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Izin Yonetimi</h1>
            <p className="text-slate-500 mt-1">Tum izin taleplerini goruntule ve yonet</p>
          </div>
        </div>
        <Space>
          <Button
            onClick={() => router.push('/hr/leave-types')}
            className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
          >
            Izin Turleri
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
            onClick={() => router.push('/hr/leaves/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Izin Talebi
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
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Talep</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.pending}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Beklemede</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.approved}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Onaylanan</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <XCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-600">{stats.rejected}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Reddedilen</div>
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
              placeholder="Izin ara... (calisan adi, sicil no, izin turu)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          <Select
            placeholder="Calisan"
            allowClear
            showSearch
            optionFilterProp="children"
            style={{ width: 180 }}
            value={filters.employeeId}
            onChange={(value) => setFilters((prev) => ({ ...prev, employeeId: value }))}
            options={employees.map((e) => ({ value: e.id, label: e.fullName }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Izin Turu"
            allowClear
            style={{ width: 160 }}
            value={filters.leaveTypeId}
            onChange={(value) => setFilters((prev) => ({ ...prev, leaveTypeId: value }))}
            options={leaveTypes.map((lt) => ({ value: lt.id, label: lt.name }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Durum"
            allowClear
            style={{ width: 140 }}
            value={filters.status}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            options={Object.entries(leaveStatusConfig).map(([value, config]) => ({
              value: Number(value),
              label: config.label,
            }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Button onClick={clearFilters} className="!border-slate-300 !text-slate-600">
            Temizle
          </Button>
        </div>

        {/* Date range filter */}
        <div className="mb-6">
          <RangePicker
            style={{ width: 300 }}
            format="DD.MM.YYYY"
            placeholder={['Baslangic Tarihi', 'Bitis Tarihi']}
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
        </div>

        {/* Results count */}
        <div className="text-sm text-slate-500 mb-4">
          {filteredLeaves.length} izin talebi listeleniyor
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredLeaves}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredLeaves.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} talep`,
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
