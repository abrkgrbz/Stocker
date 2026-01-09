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
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  useGoodsReceipts,
  useDeleteGoodsReceipt,
  useCompleteGoodsReceipt,
  useCancelGoodsReceipt,
} from '@/lib/api/hooks/usePurchase';
import type { GoodsReceiptListDto, GoodsReceiptStatus } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { confirm } = Modal;

const statusConfig: Record<GoodsReceiptStatus, { bg: string; text: string; label: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Taslak' },
  Pending: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Beklemede' },
  Confirmed: { bg: 'bg-slate-300', text: 'text-slate-800', label: 'Onaylandı' },
  Completed: { bg: 'bg-slate-900', text: 'text-white', label: 'Tamamlandı' },
  Cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'İptal' },
};

const statusLabels: Record<GoodsReceiptStatus, string> = {
  Draft: 'Taslak',
  Pending: 'Beklemede',
  Confirmed: 'Onaylandı',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal',
};

export default function GoodsReceiptsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<GoodsReceiptStatus | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  const { data: receiptsData, isLoading, refetch } = useGoodsReceipts({
    searchTerm: searchText || undefined,
    status: statusFilter,
    fromDate: dateRange?.[0]?.toISOString(),
    toDate: dateRange?.[1]?.toISOString(),
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const deleteReceipt = useDeleteGoodsReceipt();
  const completeReceipt = useCompleteGoodsReceipt();
  const cancelReceipt = useCancelGoodsReceipt();

  const receipts = receiptsData?.items || [];
  const totalCount = receiptsData?.totalCount || 0;

  const handleDelete = (record: GoodsReceiptListDto) => {
    confirm({
      title: 'Mal Alım Belgesini Sil',
      content: `"${record.receiptNumber}" belgesini silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      okButtonProps: { className: '!bg-red-600 hover:!bg-red-700 !border-red-600' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: () => deleteReceipt.mutate(record.id),
    });
  };

  // Stats
  const draftCount = receipts.filter(r => r.status === 'Draft').length;
  const pendingCount = receipts.filter(r => r.status === 'Pending').length;
  const completedCount = receipts.filter(r => r.status === 'Completed').length;

  const columns: ColumnsType<GoodsReceiptListDto> = [
    {
      title: 'Belge No',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
      fixed: 'left',
      width: 150,
      render: (num, record) => (
        <div>
          <div className="font-medium text-slate-900">{num}</div>
          <div className="text-xs text-slate-500">
            {dayjs(record.receiptDate).format('DD.MM.YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Sipariş No',
      dataIndex: 'purchaseOrderNumber',
      key: 'purchaseOrderNumber',
      width: 130,
      render: (num) => <span className="text-sm text-slate-600">{num || '-'}</span>,
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
      width: 140,
      render: (status: GoodsReceiptStatus) => {
        const config = statusConfig[status];
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
      render: (count) => <span className="text-sm text-slate-600">{count}</span>,
    },
    {
      title: 'Toplam Miktar',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 120,
      align: 'center',
      render: (qty) => <span className="text-sm font-medium text-slate-900">{qty}</span>,
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
      render: (name) => <span className="text-sm text-slate-600">{name || '-'}</span>,
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
                onClick: () => router.push(`/purchase/goods-receipts/${record.id}`),
              },
              record.status === 'Draft' && {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Düzenle',
              },
              { type: 'divider' },
              !['Completed', 'Cancelled'].includes(record.status) && {
                key: 'complete',
                icon: <CheckCircleIcon className="w-4 h-4" />,
                label: 'Tamamla',
                onClick: () => completeReceipt.mutate(record.id),
              },
              !['Completed', 'Cancelled'].includes(record.status) && {
                key: 'cancel',
                icon: <XCircleIcon className="w-4 h-4" />,
                label: 'İptal Et',
                danger: true,
                onClick: () => cancelReceipt.mutate({ id: record.id, reason: 'Manual cancellation' }),
              },
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
              <InboxIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Mal Alım Belgeleri</h1>
              <p className="text-sm text-slate-500">Tedarikçilerden gelen malları kaydedin</p>
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
              onClick={() => router.push('/purchase/goods-receipts/new')}
            >
              Yeni Mal Alımı
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
                <InboxIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Taslak</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{draftCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <PencilIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Beklemede</p>
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
                <p className="text-xs text-slate-500 uppercase tracking-wide">Tamamlandı</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{completedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-600" />
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
              style={{ width: 180 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
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
            dataSource={receipts}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 1100 }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-200"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} belge`,
              onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
            }}
            onRow={(record) => ({
              onClick: () => router.push(`/purchase/goods-receipts/${record.id}`),
              className: 'cursor-pointer hover:bg-slate-50',
            })}
          />
        </div>
      </Spin>
    </div>
  );
}
