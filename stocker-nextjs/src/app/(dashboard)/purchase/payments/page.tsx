'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Input,
  Tag,
  Dropdown,
  Modal,
  Select,
  DatePicker,
} from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlayCircleIcon,
  PlusIcon,
  TrashIcon,
  WalletIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  useSupplierPayments,
  useDeleteSupplierPayment,
  useApproveSupplierPayment,
  useRejectSupplierPayment,
  useProcessSupplierPayment,
  useReconcileSupplierPayment,
} from '@/lib/api/hooks/usePurchase';
import type { SupplierPaymentListDto, SupplierPaymentStatus, PaymentMethod } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { confirm } = Modal;

const statusColors: Record<SupplierPaymentStatus, string> = {
  Draft: 'default',
  PendingApproval: 'blue',
  Approved: 'cyan',
  Rejected: 'red',
  Processed: 'geekblue',
  Completed: 'green',
  Cancelled: 'default',
  Failed: 'error',
};

const statusLabels: Record<SupplierPaymentStatus, string> = {
  Draft: 'Taslak',
  PendingApproval: 'Onay Bekliyor',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Processed: 'İşlendi',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal',
  Failed: 'Başarısız',
};

const methodLabels: Record<PaymentMethod, string> = {
  Cash: 'Nakit',
  BankTransfer: 'Havale/EFT',
  CreditCard: 'Kredi Kartı',
  Check: 'Çek',
  DirectDebit: 'Otomatik Ödeme',
  Other: 'Diğer',
};

const methodIcons: Record<PaymentMethod, React.ReactNode> = {
  Cash: <CurrencyDollarIcon className="w-4 h-4" />,
  BankTransfer: <BuildingLibraryIcon className="w-4 h-4" />,
  CreditCard: <CreditCardIcon className="w-4 h-4" />,
  Check: <WalletIcon className="w-4 h-4" />,
  DirectDebit: <ArrowPathIcon className="w-4 h-4" />,
  Other: <WalletIcon className="w-4 h-4" />,
};

export default function SupplierPaymentsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<SupplierPaymentStatus | undefined>();
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | undefined>();
  const [reconciledFilter, setReconciledFilter] = useState<boolean | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  const { data: paymentsData, isLoading, refetch } = useSupplierPayments({
    searchTerm: searchText || undefined,
    status: statusFilter,
    method: methodFilter,
    isReconciled: reconciledFilter,
    fromDate: dateRange?.[0]?.toISOString(),
    toDate: dateRange?.[1]?.toISOString(),
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const deletePayment = useDeleteSupplierPayment();
  const approvePayment = useApproveSupplierPayment();
  const rejectPayment = useRejectSupplierPayment();
  const processPayment = useProcessSupplierPayment();
  const reconcilePayment = useReconcileSupplierPayment();

  const payments = paymentsData?.items || [];
  const totalCount = paymentsData?.totalCount || 0;

  const handleDelete = (record: SupplierPaymentListDto) => {
    confirm({
      title: 'Ödeme Belgesini Sil',
      content: `"${record.paymentNumber}" ödeme belgesini silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => deletePayment.mutate(record.id),
    });
  };

  const handleReject = (record: SupplierPaymentListDto) => {
    confirm({
      title: 'Ödemeyi Reddet',
      content: `"${record.paymentNumber}" ödemesini reddetmek istediğinizden emin misiniz?`,
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => rejectPayment.mutate({ id: record.id, reason: 'Manuel reddetme' }),
    });
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const columns: ColumnsType<SupplierPaymentListDto> = [
    {
      title: 'Ödeme No',
      dataIndex: 'paymentNumber',
      key: 'paymentNumber',
      fixed: 'left',
      width: 150,
      render: (num, record) => (
        <div>
          <div className="font-medium text-slate-900 hover:text-slate-700">{num}</div>
          <div className="text-xs text-slate-500">
            {dayjs(record.paymentDate).format('DD.MM.YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Tedarikçi',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 200,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: SupplierPaymentStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: 'Yöntem',
      dataIndex: 'method',
      key: 'method',
      width: 130,
      render: (method: PaymentMethod) => (
        <span className="flex items-center gap-2">
          {methodIcons[method]}
          <span>{methodLabels[method]}</span>
        </span>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      align: 'right',
      render: (amount, record) => (
        <span className="font-semibold text-slate-900">
          {formatCurrency(amount, record.currency)}
        </span>
      ),
    },
    {
      title: 'Fatura No',
      dataIndex: 'purchaseInvoiceNumber',
      key: 'purchaseInvoiceNumber',
      width: 130,
      render: (num) => num || '-',
    },
    {
      title: 'Mutabakat',
      dataIndex: 'isReconciled',
      key: 'isReconciled',
      width: 100,
      align: 'center',
      render: (isReconciled: boolean) => (
        <Tag color={isReconciled ? 'green' : 'orange'}>
          {isReconciled ? 'Yapıldı' : 'Bekliyor'}
        </Tag>
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
                onClick: () => router.push(`/purchase/payments/${record.id}`),
              },
              record.status === 'Draft' && {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Düzenle',
                onClick: () => router.push(`/purchase/payments/${record.id}/edit`),
              },
              { type: 'divider' },
              record.status === 'PendingApproval' && {
                key: 'approve',
                icon: <CheckCircleIcon className="w-4 h-4" />,
                label: 'Onayla',
                onClick: () => approvePayment.mutate({ id: record.id }),
              },
              record.status === 'PendingApproval' && {
                key: 'reject',
                icon: <XCircleIcon className="w-4 h-4" />,
                label: 'Reddet',
                danger: true,
                onClick: () => handleReject(record),
              },
              record.status === 'Approved' && {
                key: 'process',
                icon: <PlayCircleIcon className="w-4 h-4" />,
                label: 'İşle',
                onClick: () => processPayment.mutate(record.id),
              },
              record.status === 'Completed' && !record.isReconciled && {
                key: 'reconcile',
                icon: <ArrowPathIcon className="w-4 h-4" />,
                label: 'Mutabakat Yap',
                onClick: () => reconcilePayment.mutate({ id: record.id, bankTransactionId: `BANK-${record.paymentNumber}` }),
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
              <EllipsisVerticalIcon className="w-4 h-4" />
            </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <WalletIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tedarikçi Ödemeleri</h1>
            <p className="text-sm text-slate-500">Tedarikçilere yapılan ödemeleri yönetin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white border border-slate-200 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white border border-slate-200 rounded-md transition-colors"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push('/purchase/payments/new')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Ödeme
          </button>
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
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
          />
          <Select
            placeholder="Ödeme Yöntemi"
            allowClear
            style={{ width: 150 }}
            value={methodFilter}
            onChange={setMethodFilter}
            options={Object.entries(methodLabels).map(([value, label]) => ({ value, label }))}
          />
          <Select
            placeholder="Mutabakat"
            allowClear
            style={{ width: 130 }}
            value={reconciledFilter}
            onChange={setReconciledFilter}
            options={[
              { value: true, label: 'Yapıldı' },
              { value: false, label: 'Bekliyor' },
            ]}
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={payments}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 1200 }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => <span className="text-sm text-slate-500">Toplam {total} ödeme</span>,
              onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
            }}
            onRow={(record) => ({
              onClick: () => router.push(`/purchase/payments/${record.id}`),
              className: 'cursor-pointer',
            })}
          />
        )}
      </div>
    </div>
  );
}
