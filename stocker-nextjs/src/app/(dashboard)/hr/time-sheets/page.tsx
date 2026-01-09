'use client';

/**
 * Time Sheets List Page
 * Monochrome design system following inventory module patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select, Table, Button, Dropdown, Tooltip, Space, Input, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowPathIcon,
  ClockIcon,
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XMarkIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useTimeSheets, useDeleteTimeSheet } from '@/lib/api/hooks/useHR';
import type { TimeSheetDto } from '@/lib/api/services/hr.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';

// Format date helper
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('tr-TR');
};

// Status options
const statusOptions = [
  { value: 'Draft', label: 'Taslak' },
  { value: 'Submitted', label: 'Gonderildi' },
  { value: 'Approved', label: 'Onaylandi' },
  { value: 'Rejected', label: 'Reddedildi' },
  { value: 'Paid', label: 'Odendi' },
];

// Status configuration with monochrome colors
const statusConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
  Draft: { label: 'Taslak', bgColor: 'bg-slate-100', textColor: 'text-slate-600' },
  Submitted: { label: 'Gonderildi', bgColor: 'bg-slate-200', textColor: 'text-slate-700' },
  Approved: { label: 'Onaylandi', bgColor: 'bg-slate-700', textColor: 'text-white' },
  Rejected: { label: 'Reddedildi', bgColor: 'bg-slate-300', textColor: 'text-slate-600' },
  Paid: { label: 'Odendi', bgColor: 'bg-slate-900', textColor: 'text-white' },
};

export default function TimeSheetsPage() {
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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

  const { data: timeSheets = [], isLoading, refetch } = useTimeSheets();
  const deleteTimeSheet = useDeleteTimeSheet();

  const filteredTimeSheets = useMemo(() => {
    return timeSheets.filter((ts: TimeSheetDto) => {
      const matchesSearch =
        !debouncedSearch ||
        ts.employeeName?.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesStatus = !selectedStatus || ts.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [timeSheets, debouncedSearch, selectedStatus]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: timeSheets.length,
      draft: timeSheets.filter((t) => t.status === 'Draft').length,
      submitted: timeSheets.filter((t) => t.status === 'Submitted').length,
      approved: timeSheets.filter((t) => t.status === 'Approved').length,
      totalHours: timeSheets.reduce((sum, t) => sum + (t.totalWorkHours || 0), 0),
    };
  }, [timeSheets]);

  const handleView = (id: number) => router.push(`/hr/time-sheets/${id}`);
  const handleEdit = (id: number) => router.push(`/hr/time-sheets/${id}/edit`);

  const handleDelete = async (timeSheet: TimeSheetDto) => {
    try {
      await deleteTimeSheet.mutateAsync(timeSheet.id);
      showSuccess('Puantaj kaydi silindi');
    } catch (err) {
      showApiError(err, 'Puantaj kaydi silinirken hata olustu');
    }
  };

  const handleApprove = async (_timeSheet: TimeSheetDto) => {
    showSuccess('Onay islemi henuz uygulanmadi');
  };

  const handleReject = async (_timeSheet: TimeSheetDto) => {
    Modal.confirm({
      title: 'Puantaji Reddet',
      content: 'Bu puantaji reddetmek istediginizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'Iptal',
      okButtonProps: { className: '!bg-slate-900 hover:!bg-slate-800' },
      onOk: async () => {
        showSuccess('Reddetme islemi henuz uygulanmadi');
      },
    });
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedStatus(undefined);
  };

  const hasFilters = searchText || selectedStatus;

  // Table columns
  const columns: ColumnsType<TimeSheetDto> = [
    {
      title: 'Calisan',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 200,
      render: (value) => <span className="font-medium text-slate-900">{value}</span>,
    },
    {
      title: 'Donem Baslangici',
      dataIndex: 'periodStart',
      key: 'periodStart',
      width: 120,
      render: (value) => <span className="text-slate-600">{formatDate(value)}</span>,
    },
    {
      title: 'Donem Bitisi',
      dataIndex: 'periodEnd',
      key: 'periodEnd',
      width: 120,
      render: (value) => <span className="text-slate-500">{formatDate(value)}</span>,
    },
    {
      title: 'Toplam Saat',
      dataIndex: 'totalWorkHours',
      key: 'totalWorkHours',
      width: 120,
      align: 'center',
      render: (value) => <span className="font-semibold text-slate-900">{value || 0}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config = statusConfig[status] || statusConfig.Draft;
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {config.label}
          </span>
        );
      },
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
          ...(record.status === 'Submitted' ? [
            { key: 'approve', icon: <CheckCircleIcon className="w-4 h-4" />, label: 'Onayla', onClick: () => handleApprove(record) },
            { key: 'reject', icon: <XMarkIcon className="w-4 h-4" />, label: 'Reddet', onClick: () => handleReject(record) },
          ] : []),
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
            <DocumentTextIcon className="w-7 h-7" />
            Puantaj
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Calisan calisma saatlerini goruntuleyin ve yonetin
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
            onClick={() => router.push('/hr/time-sheets/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Puantaj
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Puantaj</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <CalendarDaysIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.submitted}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Gonderilen</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
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
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalHours}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Saat</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Calisan ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
            />
          </div>
          <Select
            placeholder="Durum"
            allowClear
            style={{ width: '100%' }}
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={statusOptions}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          {hasFilters && (
            <Button
              onClick={clearFilters}
              icon={<XMarkIcon className="w-4 h-4" />}
              className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
            >
              Temizle
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Table
          columns={columns}
          dataSource={filteredTimeSheets as TimeSheetDto[]}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1000 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredTimeSheets.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} puantaj`,
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
