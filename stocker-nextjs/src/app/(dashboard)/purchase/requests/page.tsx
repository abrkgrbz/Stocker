'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Input,
  Dropdown,
  Modal,
  Select,
  DatePicker,
  Spin,
  Button,
  Tooltip,
} from 'antd';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PlusIcon,
  ShoppingCartIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  usePurchaseRequests,
  useDeletePurchaseRequest,
  useSubmitPurchaseRequest,
  useApprovePurchaseRequest,
  useRejectPurchaseRequest,
  useCancelPurchaseRequest,
  useConvertRequestToOrder,
} from '@/lib/api/hooks/usePurchase';
import type { PurchaseRequestListDto, PurchaseRequestStatus, PurchaseRequestPriority } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { confirm } = Modal;

const statusConfig: Record<PurchaseRequestStatus, { bg: string; text: string; label: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Taslak' },
  Pending: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Onay Bekliyor' },
  Approved: { bg: 'bg-slate-900', text: 'text-white', label: 'Onaylandı' },
  Rejected: { bg: 'bg-slate-700', text: 'text-white', label: 'Reddedildi' },
  Converted: { bg: 'bg-slate-400', text: 'text-white', label: 'Siparişe Dönüştürüldü' },
  Cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'İptal' },
};

const statusLabels: Record<PurchaseRequestStatus, string> = {
  Draft: 'Taslak',
  Pending: 'Onay Bekliyor',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Converted: 'Siparişe Dönüştürüldü',
  Cancelled: 'İptal',
};

const priorityConfig: Record<PurchaseRequestPriority, { bg: string; text: string; label: string }> = {
  Low: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Düşük' },
  Normal: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Normal' },
  High: { bg: 'bg-slate-600', text: 'text-white', label: 'Yüksek' },
  Urgent: { bg: 'bg-slate-900', text: 'text-white', label: 'Acil' },
};

const priorityLabels: Record<PurchaseRequestPriority, string> = {
  Low: 'Düşük',
  Normal: 'Normal',
  High: 'Yüksek',
  Urgent: 'Acil',
};

export default function PurchaseRequestsPage() {
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseRequestStatus | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<PurchaseRequestPriority | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  const { data: requestsData, isLoading, refetch } = usePurchaseRequests({
    searchTerm: searchText || undefined,
    status: statusFilter,
    priority: priorityFilter,
    fromDate: dateRange?.[0]?.toISOString(),
    toDate: dateRange?.[1]?.toISOString(),
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const deleteRequest = useDeletePurchaseRequest();
  const submitRequest = useSubmitPurchaseRequest();
  const approveRequest = useApprovePurchaseRequest();
  const rejectRequest = useRejectPurchaseRequest();
  const cancelRequest = useCancelPurchaseRequest();
  const convertToOrder = useConvertRequestToOrder();

  const requests = requestsData?.items || [];
  const totalCount = requestsData?.totalCount || 0;

  // Statistics
  const stats = useMemo(() => {
    return {
      total: totalCount,
      pending: requests.filter(r => r.status === 'Pending').length,
      approved: requests.filter(r => r.status === 'Approved').length,
      totalAmount: requests.reduce((sum, r) => sum + (r.estimatedTotalAmount || 0), 0),
    };
  }, [requests, totalCount]);

  const handleDelete = (record: PurchaseRequestListDto) => {
    confirm({
      title: 'Talebi Sil',
      content: `"${record.requestNumber}" talebini silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      okButtonProps: { className: '!bg-red-600 hover:!bg-red-700 !border-red-600' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: () => deleteRequest.mutate(record.id),
    });
  };

  const handleSubmit = (record: PurchaseRequestListDto) => {
    submitRequest.mutate(record.id);
  };

  const handleApprove = (record: PurchaseRequestListDto) => {
    approveRequest.mutate({ id: record.id });
  };

  const handleReject = (record: PurchaseRequestListDto) => {
    confirm({
      title: 'Talebi Reddet',
      content: 'Bu talebi reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'Vazgeç',
      okButtonProps: { className: '!bg-red-600 hover:!bg-red-700 !border-red-600' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: () => rejectRequest.mutate({ id: record.id, reason: 'Manuel red' }),
    });
  };

  const handleCancel = (record: PurchaseRequestListDto) => {
    confirm({
      title: 'Talebi İptal Et',
      content: 'Bu talebi iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      okButtonProps: { className: '!bg-red-600 hover:!bg-red-700 !border-red-600' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: () => cancelRequest.mutate({ id: record.id, reason: 'Manuel iptal' }),
    });
  };

  const handleConvertToOrder = (record: PurchaseRequestListDto) => {
    confirm({
      title: 'Siparişe Dönüştür',
      content: 'Bu talebi satın alma siparişine dönüştürmek istiyor musunuz?',
      okText: 'Dönüştür',
      cancelText: 'Vazgeç',
      okButtonProps: { className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: () => convertToOrder.mutate({ id: record.id, supplierId: '' }),
    });
  };

  const getActionMenu = (record: PurchaseRequestListDto) => {
    const items = [
      {
        key: 'view',
        icon: <EyeIcon className="w-4 h-4" />,
        label: 'Görüntüle',
        onClick: () => router.push(`/purchase/requests/${record.id}`),
      },
      record.status === 'Draft' && {
        key: 'edit',
        icon: <PencilIcon className="w-4 h-4" />,
        label: 'Düzenle',
        onClick: () => router.push(`/purchase/requests/${record.id}/edit`),
      },
      { type: 'divider' },
      record.status === 'Draft' && {
        key: 'submit',
        icon: <PaperAirplaneIcon className="w-4 h-4" />,
        label: 'Onaya Gönder',
        onClick: () => handleSubmit(record),
      },
      record.status === 'Pending' && {
        key: 'approve',
        icon: <CheckCircleIcon className="w-4 h-4" />,
        label: 'Onayla',
        onClick: () => handleApprove(record),
      },
      record.status === 'Pending' && {
        key: 'reject',
        icon: <XCircleIcon className="w-4 h-4" />,
        label: 'Reddet',
        danger: true,
        onClick: () => handleReject(record),
      },
      record.status === 'Approved' && {
        key: 'convert',
        icon: <ShoppingCartIcon className="w-4 h-4" />,
        label: 'Siparişe Dönüştür',
        onClick: () => handleConvertToOrder(record),
      },
      { type: 'divider' },
      !['Cancelled', 'Converted'].includes(record.status) && {
        key: 'cancel',
        icon: <XCircleIcon className="w-4 h-4" />,
        label: 'İptal Et',
        danger: true,
        onClick: () => handleCancel(record),
      },
      record.status === 'Draft' && {
        key: 'delete',
        icon: <TrashIcon className="w-4 h-4" />,
        label: 'Sil',
        danger: true,
        onClick: () => handleDelete(record),
      },
    ].filter(Boolean) as MenuProps['items'];

    return { items };
  };

  const columns: ColumnsType<PurchaseRequestListDto> = [
    {
      title: 'Talep No',
      dataIndex: 'requestNumber',
      key: 'requestNumber',
      fixed: 'left',
      width: 150,
      render: (requestNumber, record) => (
        <div>
          <div className="font-medium text-slate-900">{requestNumber}</div>
          <div className="text-xs text-slate-500">
            {dayjs(record.requestDate).format('DD.MM.YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Talep Eden',
      dataIndex: 'requestedByName',
      key: 'requestedByName',
      width: 150,
      render: (name, record) => (
        <div>
          <div className="font-medium text-slate-900">{name || '-'}</div>
          {record.departmentName && (
            <div className="text-xs text-slate-500">{record.departmentName}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: PurchaseRequestStatus) => {
        const config = statusConfig[status];
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Öncelik',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: PurchaseRequestPriority) => {
        const config = priorityConfig[priority];
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Kalem',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 80,
      align: 'center',
      render: (count) => <span className="text-sm text-slate-600">{count || 0}</span>,
    },
    {
      title: 'Tahmini Tutar',
      dataIndex: 'estimatedTotalAmount',
      key: 'estimatedTotalAmount',
      width: 140,
      align: 'right',
      render: (amount, record) => (
        <div>
          <div className="font-medium text-slate-900">
            {(amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency || '₺'}
          </div>
        </div>
      ),
    },
    {
      title: 'Gerekli Tarih',
      dataIndex: 'requiredDate',
      key: 'requiredDate',
      width: 120,
      render: (date) => <span className="text-sm text-slate-600">{date ? dayjs(date).format('DD.MM.YYYY') : '-'}</span>,
    },
    {
      title: '',
      key: 'actions',
      fixed: 'right',
      width: 60,
      render: (_, record) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <button
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Spin spinning={isLoading}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Satın Alma Talepleri</h1>
              <p className="text-sm text-slate-500">Departmanlardan gelen satın alma taleplerini yönetin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Tooltip title="Dışa Aktar">
              <Button
                icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
              />
            </Tooltip>
            <Tooltip title="Yenile">
              <Button
                icon={<ArrowPathIcon className="w-4 h-4" />}
                className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
                onClick={() => refetch()}
                loading={isLoading}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              onClick={() => router.push('/purchase/requests/new')}
            >
              Yeni Talep
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Toplam Talep</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Onay Bekleyen</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Onaylanan</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.approved}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Tahmini Tutar</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {stats.totalAmount.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ShoppingCartIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Talep ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
              allowClear
            />

            <Select
              placeholder="Durum"
              allowClear
              style={{ width: 160 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={Object.entries(statusLabels).map(([value, label]) => ({
                value,
                label,
              }))}
            />

            <Select
              placeholder="Öncelik"
              allowClear
              style={{ width: 130 }}
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={Object.entries(priorityLabels).map(([value, label]) => ({
                value,
                label,
              }))}
            />

            <RangePicker
              placeholder={['Başlangıç', 'Bitiş']}
              format="DD.MM.YYYY"
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Table
            columns={columns}
            dataSource={requests}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 1200 }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-200"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} talep`,
              onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
            }}
            onRow={(record) => ({
              onClick: () => router.push(`/purchase/requests/${record.id}`),
              className: 'cursor-pointer hover:bg-slate-50',
            })}
          />
        </div>
      </Spin>
    </div>
  );
}
