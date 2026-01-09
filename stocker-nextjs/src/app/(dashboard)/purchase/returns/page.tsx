'use client';

import React, { useState } from 'react';
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
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  usePurchaseReturns,
  useDeletePurchaseReturn,
  useApprovePurchaseReturn,
  useRejectPurchaseReturn,
  useShipPurchaseReturn,
} from '@/lib/api/hooks/usePurchase';
import type { PurchaseReturnListDto, PurchaseReturnStatus, PurchaseReturnReason } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { confirm } = Modal;

const statusConfig: Record<PurchaseReturnStatus, { bg: string; text: string; label: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Taslak' },
  Pending: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Onay Bekliyor' },
  Approved: { bg: 'bg-slate-300', text: 'text-slate-800', label: 'Onaylandı' },
  Rejected: { bg: 'bg-slate-700', text: 'text-white', label: 'Reddedildi' },
  Shipped: { bg: 'bg-slate-400', text: 'text-white', label: 'Gönderildi' },
  Received: { bg: 'bg-slate-500', text: 'text-white', label: 'Teslim Alındı' },
  Completed: { bg: 'bg-slate-900', text: 'text-white', label: 'Tamamlandı' },
  Cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'İptal' },
};

const statusLabels: Record<PurchaseReturnStatus, string> = {
  Draft: 'Taslak',
  Pending: 'Onay Bekliyor',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Shipped: 'Gönderildi',
  Received: 'Teslim Alındı',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal',
};

const reasonConfig: Record<PurchaseReturnReason, { bg: string; text: string; label: string }> = {
  Defective: { bg: 'bg-slate-700', text: 'text-white', label: 'Kusurlu' },
  WrongItem: { bg: 'bg-slate-600', text: 'text-white', label: 'Yanlış Ürün' },
  WrongQuantity: { bg: 'bg-slate-500', text: 'text-white', label: 'Yanlış Miktar' },
  Damaged: { bg: 'bg-slate-800', text: 'text-white', label: 'Hasarlı' },
  QualityIssue: { bg: 'bg-slate-600', text: 'text-white', label: 'Kalite Sorunu' },
  Expired: { bg: 'bg-slate-700', text: 'text-white', label: 'Vadesi Geçmiş' },
  NotAsDescribed: { bg: 'bg-slate-400', text: 'text-white', label: 'Tanımlandığı Gibi Değil' },
  Other: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Diğer' },
};

const reasonLabels: Record<PurchaseReturnReason, string> = {
  Defective: 'Kusurlu',
  WrongItem: 'Yanlış Ürün',
  WrongQuantity: 'Yanlış Miktar',
  Damaged: 'Hasarlı',
  QualityIssue: 'Kalite Sorunu',
  Expired: 'Vadesi Geçmiş',
  NotAsDescribed: 'Tanımlandığı Gibi Değil',
  Other: 'Diğer',
};

export default function PurchaseReturnsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseReturnStatus | undefined>();
  const [reasonFilter, setReasonFilter] = useState<PurchaseReturnReason | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  const { data: returnsData, isLoading, refetch } = usePurchaseReturns({
    searchTerm: searchText || undefined,
    status: statusFilter,
    reason: reasonFilter,
    fromDate: dateRange?.[0]?.toISOString(),
    toDate: dateRange?.[1]?.toISOString(),
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const deleteReturn = useDeletePurchaseReturn();
  const approveReturn = useApprovePurchaseReturn();
  const rejectReturn = useRejectPurchaseReturn();
  const shipReturn = useShipPurchaseReturn();

  const returns = returnsData?.items || [];
  const totalCount = returnsData?.totalCount || 0;

  const handleDelete = (record: PurchaseReturnListDto) => {
    confirm({
      title: 'İade Belgesini Sil',
      content: `"${record.returnNumber}" belgesini silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      okButtonProps: { className: '!bg-red-600 hover:!bg-red-700 !border-red-600' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: () => deleteReturn.mutate(record.id),
    });
  };

  const handleReject = (record: PurchaseReturnListDto) => {
    confirm({
      title: 'İade Talebini Reddet',
      content: `"${record.returnNumber}" iade talebini reddetmek istediğinizden emin misiniz?`,
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'İptal',
      okButtonProps: { className: '!bg-red-600 hover:!bg-red-700 !border-red-600' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: () => rejectReturn.mutate({ id: record.id, reason: 'Manuel reddetme' }),
    });
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Stats
  const pendingCount = returns.filter(r => r.status === 'Pending').length;
  const approvedCount = returns.filter(r => r.status === 'Approved').length;
  const completedCount = returns.filter(r => r.status === 'Completed').length;

  const columns: ColumnsType<PurchaseReturnListDto> = [
    {
      title: 'İade No',
      dataIndex: 'returnNumber',
      key: 'returnNumber',
      fixed: 'left',
      width: 150,
      render: (num, record) => (
        <div>
          <div className="font-medium text-slate-900">{num}</div>
          <div className="text-xs text-slate-500">
            {dayjs(record.returnDate).format('DD.MM.YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'RMA No',
      dataIndex: 'rmaNumber',
      key: 'rmaNumber',
      width: 120,
      render: (rma) => <span className="text-sm text-slate-600">{rma || '-'}</span>,
    },
    {
      title: 'Tedarikçi',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 200,
      render: (name) => <span className="text-sm font-medium text-slate-900">{name}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: PurchaseReturnStatus) => {
        const config = statusConfig[status];
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Sebep',
      dataIndex: 'reason',
      key: 'reason',
      width: 140,
      render: (reason: PurchaseReturnReason) => {
        const config = reasonConfig[reason];
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
      width: 70,
      align: 'center',
      render: (count) => <span className="text-sm text-slate-600">{count}</span>,
    },
    {
      title: 'İade Tutarı',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right',
      render: (amount, record) => (
        <span className="font-medium text-slate-900">
          {formatCurrency(amount, record.currency)}
        </span>
      ),
    },
    {
      title: 'İade Edilen',
      dataIndex: 'refundAmount',
      key: 'refundAmount',
      width: 140,
      align: 'right',
      render: (amount, record) => (
        <span className={amount > 0 ? 'font-medium text-slate-900' : 'text-slate-400'}>
          {amount > 0 ? formatCurrency(amount, record.currency) : '-'}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      fixed: 'right',
      width: 60,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeIcon className="w-4 h-4" />,
                label: 'Görüntüle',
                onClick: () => router.push(`/purchase/returns/${record.id}`),
              },
              record.status === 'Draft' && {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Düzenle',
                onClick: () => router.push(`/purchase/returns/${record.id}/edit`),
              },
              { type: 'divider' },
              record.status === 'Pending' && {
                key: 'approve',
                icon: <CheckCircleIcon className="w-4 h-4" />,
                label: 'Onayla',
                onClick: () => approveReturn.mutate({ id: record.id }),
              },
              record.status === 'Pending' && {
                key: 'reject',
                icon: <XCircleIcon className="w-4 h-4" />,
                label: 'Reddet',
                danger: true,
                onClick: () => handleReject(record),
              },
              record.status === 'Approved' && {
                key: 'ship',
                icon: <PaperAirplaneIcon className="w-4 h-4" />,
                label: 'Gönder',
                onClick: () => shipReturn.mutate({
                  id: record.id,
                  trackingNumber: 'Manuel Gönderim',
                }),
              },
              ['Shipped', 'Received'].includes(record.status) && {
                key: 'refund',
                icon: <CurrencyDollarIcon className="w-4 h-4" />,
                label: 'İade İşle',
                onClick: () => router.push(`/purchase/returns/${record.id}?action=refund`),
              },
              { type: 'divider' },
              record.status === 'Draft' && {
                key: 'delete',
                icon: <TrashIcon className="w-4 h-4" />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDelete(record),
              },
            ].filter(Boolean) as MenuProps['items'],
          }}
          trigger={['click']}
        >
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
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
              <ArrowUturnLeftIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Satın Alma İadeleri</h1>
              <p className="text-sm text-slate-500">Tedarikçilere yapılan iadeleri yönetin</p>
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
              onClick={() => router.push('/purchase/returns/new')}
            >
              Yeni İade
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Toplam</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowUturnLeftIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Onay Bekleyen</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{pendingCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Onaylandı</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{approvedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Tamamlandı</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{completedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Belge ara..."
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
              options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
            />
            <Select
              placeholder="Sebep"
              allowClear
              style={{ width: 160 }}
              value={reasonFilter}
              onChange={setReasonFilter}
              options={Object.entries(reasonLabels).map(([value, label]) => ({ value, label }))}
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
            dataSource={returns}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 1300 }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-200"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} iade`,
              onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
            }}
            onRow={(record) => ({
              onClick: () => router.push(`/purchase/returns/${record.id}`),
              className: 'cursor-pointer hover:bg-slate-50',
            })}
          />
        </div>
      </Spin>
    </div>
  );
}
