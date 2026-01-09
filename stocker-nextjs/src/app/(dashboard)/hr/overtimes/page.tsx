'use client';

/**
 * Overtimes List Page
 * Monochrome design system following inventory module patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select, DatePicker, Table, Button, Dropdown, Tooltip, Space, Input, Modal } from 'antd';
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
} from '@heroicons/react/24/outline';
import {
  useOvertimes,
  useDeleteOvertime,
  useApproveOvertime,
  useRejectOvertime,
} from '@/lib/api/hooks/useHR';
import type { OvertimeDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';
import { showSuccess, showApiError } from '@/lib/utils/notifications';

const { RangePicker } = DatePicker;

// Format date helper
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('tr-TR');
};

// Overtime type options
const overtimeTypeOptions = [
  { value: 'Regular', label: 'Normal Mesai' },
  { value: 'Weekend', label: 'Hafta Sonu' },
  { value: 'Holiday', label: 'Tatil Gunu' },
  { value: 'Night', label: 'Gece Mesaisi' },
  { value: 'Emergency', label: 'Acil Durum' },
  { value: 'Project', label: 'Proje Bazli' },
];

// Status options
const statusOptions = [
  { value: 'Pending', label: 'Beklemede' },
  { value: 'Approved', label: 'Onaylandi' },
  { value: 'Rejected', label: 'Reddedildi' },
  { value: 'Completed', label: 'Tamamlandi' },
  { value: 'Cancelled', label: 'Iptal Edildi' },
];

// Status configuration with monochrome colors
const statusConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
  Pending: { label: 'Beklemede', bgColor: 'bg-slate-200', textColor: 'text-slate-700' },
  Approved: { label: 'Onaylandi', bgColor: 'bg-slate-700', textColor: 'text-white' },
  Rejected: { label: 'Reddedildi', bgColor: 'bg-slate-300', textColor: 'text-slate-600' },
  Completed: { label: 'Tamamlandi', bgColor: 'bg-slate-900', textColor: 'text-white' },
  Cancelled: { label: 'Iptal', bgColor: 'bg-slate-100', textColor: 'text-slate-500' },
};

// Type configuration with monochrome colors
const typeConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
  Regular: { label: 'Normal', bgColor: 'bg-slate-100', textColor: 'text-slate-600' },
  Weekend: { label: 'Hafta Sonu', bgColor: 'bg-slate-200', textColor: 'text-slate-700' },
  Holiday: { label: 'Tatil', bgColor: 'bg-slate-300', textColor: 'text-slate-800' },
  Night: { label: 'Gece', bgColor: 'bg-slate-400', textColor: 'text-white' },
  Emergency: { label: 'Acil', bgColor: 'bg-slate-700', textColor: 'text-white' },
  Project: { label: 'Proje', bgColor: 'bg-slate-500', textColor: 'text-white' },
};

export default function OvertimesPage() {
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data: overtimes = [], isLoading, refetch } = useOvertimes();
  const deleteOvertime = useDeleteOvertime();
  const approveOvertime = useApproveOvertime();
  const rejectOvertime = useRejectOvertime();

  const filteredOvertimes = useMemo(() => {
    return overtimes.filter((ot) => {
      const matchesSearch =
        !debouncedSearch ||
        ot.employeeName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        ot.reason.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesType = !selectedType || ot.overtimeType === selectedType;
      const matchesStatus = !selectedStatus || ot.status === selectedStatus;

      let matchesDate = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const otDate = dayjs(ot.date);
        matchesDate =
          otDate.isAfter(dateRange[0].subtract(1, 'day')) &&
          otDate.isBefore(dateRange[1].add(1, 'day'));
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [overtimes, debouncedSearch, selectedType, selectedStatus, dateRange]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: overtimes.length,
      pending: overtimes.filter((o) => o.status === 'Pending').length,
      approved: overtimes.filter((o) => o.status === 'Approved').length,
      totalHours: overtimes.reduce((sum, o) => sum + (o.plannedHours || 0), 0),
    };
  }, [overtimes]);

  const handleView = (id: number) => router.push(`/hr/overtimes/${id}`);
  const handleEdit = (id: number) => router.push(`/hr/overtimes/${id}/edit`);

  const handleDelete = async (overtime: OvertimeDto) => {
    try {
      await deleteOvertime.mutateAsync(overtime.id);
      showSuccess('Mesai kaydi silindi');
    } catch (err) {
      showApiError(err, 'Mesai kaydi silinirken hata olustu');
    }
  };

  const handleApprove = async (overtime: OvertimeDto) => {
    try {
      await approveOvertime.mutateAsync({ id: overtime.id });
      showSuccess('Mesai talebi onaylandi');
    } catch (err) {
      showApiError(err, 'Mesai talebi onaylanirken hata olustu');
    }
  };

  const handleReject = async (overtime: OvertimeDto) => {
    Modal.confirm({
      title: 'Mesai Talebini Reddet',
      content: 'Bu talebi reddetmek istediginizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'Iptal',
      okButtonProps: { className: '!bg-slate-900 hover:!bg-slate-800' },
      onOk: async () => {
        try {
          await rejectOvertime.mutateAsync({ id: overtime.id, reason: 'Talep reddedildi' });
          showSuccess('Mesai talebi reddedildi');
        } catch (err) {
          showApiError(err, 'Mesai talebi reddedilirken hata olustu');
        }
      },
    });
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedType(undefined);
    setSelectedStatus(undefined);
    setDateRange(null);
  };

  const hasFilters = searchText || selectedType || selectedStatus || dateRange;

  // Table columns
  const columns: ColumnsType<OvertimeDto> = [
    {
      title: 'Calisan',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 180,
      render: (value) => <span className="font-medium text-slate-900">{value}</span>,
    },
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (value) => <span className="text-slate-600">{formatDate(value)}</span>,
    },
    {
      title: 'Saat',
      dataIndex: 'hours',
      key: 'hours',
      width: 80,
      align: 'center',
      render: (value) => <span className="font-semibold text-slate-900">{value} saat</span>,
    },
    {
      title: 'Tur',
      dataIndex: 'overtimeType',
      key: 'overtimeType',
      width: 120,
      render: (type: string) => {
        const config = typeConfig[type] || typeConfig.Regular;
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Sebep',
      dataIndex: 'reason',
      key: 'reason',
      width: 200,
      ellipsis: true,
      render: (value) => <span className="text-slate-500">{value}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config = statusConfig[status] || statusConfig.Pending;
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
          ...(record.status === 'Pending' ? [
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
            <ClockIcon className="w-7 h-7" />
            Fazla Mesailer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Fazla mesai taleplerini goruntuleyin ve yonetin
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
            onClick={() => router.push('/hr/overtimes/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Mesai Talebi
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Talep</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <CalendarDaysIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.pending}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Beklemede</div>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input
            placeholder="Calisan veya sebep ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
          />
          <Select
            placeholder="Tur"
            allowClear
            style={{ width: '100%' }}
            value={selectedType}
            onChange={setSelectedType}
            options={overtimeTypeOptions}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Durum"
            allowClear
            style={{ width: '100%' }}
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={statusOptions}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <RangePicker
            style={{ width: '100%' }}
            format="DD.MM.YYYY"
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            placeholder={['Baslangic', 'Bitis']}
            className="[&_.ant-picker]:!border-slate-300 [&_.ant-picker]:!rounded-lg"
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
          dataSource={filteredOvertimes}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1000 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredOvertimes.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} mesai`,
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
