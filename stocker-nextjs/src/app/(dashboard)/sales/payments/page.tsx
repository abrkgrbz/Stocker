'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  DatePicker,
  Dropdown,
  Modal,
} from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  usePayments,
  useDeletePayment,
  useConfirmPayment,
  useCompletePayment,
  useRejectPayment,
} from '@/lib/api/hooks/usePayments';
import type { PaymentListItem, PaymentStatus, PaymentMethod, GetPaymentsParams } from '@/lib/api/services/payment.service';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const statusConfig: Record<PaymentStatus, { bgColor: string; textColor: string; label: string }> = {
  Pending: { bgColor: 'bg-slate-100', textColor: 'text-slate-600', label: 'Bekliyor' },
  Confirmed: { bgColor: 'bg-slate-300', textColor: 'text-slate-800', label: 'Onaylandı' },
  Completed: { bgColor: 'bg-slate-700', textColor: 'text-white', label: 'Tamamlandı' },
  Rejected: { bgColor: 'bg-slate-800', textColor: 'text-white', label: 'Reddedildi' },
  Refunded: { bgColor: 'bg-slate-900', textColor: 'text-white', label: 'İade Edildi' },
};

const methodLabels: Record<PaymentMethod, string> = {
  Cash: 'Nakit',
  BankTransfer: 'Havale/EFT',
  CreditCard: 'Kredi Kartı',
  DebitCard: 'Banka Kartı',
  Check: 'Çek',
  DirectDebit: 'Otomatik Ödeme',
  Other: 'Diğer',
};

const statusOptions = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'Pending', label: 'Bekliyor' },
  { value: 'Confirmed', label: 'Onaylandı' },
  { value: 'Completed', label: 'Tamamlandı' },
  { value: 'Rejected', label: 'Reddedildi' },
  { value: 'Refunded', label: 'İade Edildi' },
];

const methodOptions = [
  { value: '', label: 'Tüm Yöntemler' },
  { value: 'Cash', label: 'Nakit' },
  { value: 'BankTransfer', label: 'Havale/EFT' },
  { value: 'CreditCard', label: 'Kredi Kartı' },
  { value: 'DebitCard', label: 'Banka Kartı' },
  { value: 'Check', label: 'Çek' },
  { value: 'DirectDebit', label: 'Otomatik Ödeme' },
  { value: 'Other', label: 'Diğer' },
];

export default function PaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state
  const [filters, setFilters] = useState<GetPaymentsParams>({
    page: 1,
    pageSize: 20,
    searchTerm: '',
    status: searchParams.get('status') || '',
    method: searchParams.get('method') || '',
    sortBy: 'PaymentDate',
    sortDescending: true,
  });

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // API hooks
  const { data, isLoading, refetch } = usePayments(filters);
  const deletePayment = useDeletePayment();
  const confirmPayment = useConfirmPayment();
  const completePayment = useCompletePayment();
  const rejectPayment = useRejectPayment();

  const payments = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: value, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value, page: 1 }));
  };

  const handleMethodChange = (value: string) => {
    setFilters((prev) => ({ ...prev, method: value, page: 1 }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setFilters((prev) => ({
        ...prev,
        fromDate: dates[0]?.toISOString(),
        toDate: dates[1]?.toISOString(),
        page: 1,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        fromDate: undefined,
        toDate: undefined,
        page: 1,
      }));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortBy: sorter.field || 'PaymentDate',
      sortDescending: sorter.order === 'descend',
    }));
  };

  const handleConfirm = async (id: string) => {
    try {
      await confirmPayment.mutateAsync(id);
    } catch {
      // Error handled by hook
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completePayment.mutateAsync(id);
    } catch {
      // Error handled by hook
    }
  };

  const handleRejectClick = (id: string) => {
    setSelectedPaymentId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedPaymentId || !rejectReason.trim()) {
      return;
    }

    try {
      await rejectPayment.mutateAsync({ id: selectedPaymentId, reason: rejectReason });
      setRejectModalOpen(false);
    } catch {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Ödemeyi Sil',
      content: 'Bu ödemeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deletePayment.mutateAsync(id);
        } catch {
          // Error handled by hook
        }
      },
    });
  };

  const getActionItems = (record: PaymentListItem) => {
    const items: ({ key: string; icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean } | { type: 'divider' })[] = [
      {
        key: 'view',
        icon: <EyeIcon className="w-4 h-4" />,
        label: 'Görüntüle',
        onClick: () => router.push(`/sales/payments/${record.id}`),
      },
    ];

    if (record.status === 'Pending') {
      items.push(
        {
          key: 'edit',
          icon: <PencilIcon className="w-4 h-4" />,
          label: 'Düzenle',
          onClick: () => router.push(`/sales/payments/${record.id}/edit`),
        },
        {
          key: 'confirm',
          icon: <CheckCircleIcon className="w-4 h-4" />,
          label: 'Onayla',
          onClick: () => handleConfirm(record.id),
        },
        {
          key: 'reject',
          icon: <XCircleIcon className="w-4 h-4" />,
          label: 'Reddet',
          danger: true,
          onClick: () => handleRejectClick(record.id),
        },
        {
          type: 'divider',
        },
        {
          key: 'delete',
          icon: <TrashIcon className="w-4 h-4" />,
          label: 'Sil',
          danger: true,
          onClick: () => handleDelete(record.id),
        }
      );
    }

    if (record.status === 'Confirmed') {
      items.push({
        key: 'complete',
        icon: <CheckCircleIcon className="w-4 h-4" />,
        label: 'Tamamla',
        onClick: () => handleComplete(record.id),
      });
    }

    if (record.status === 'Rejected') {
      items.push({
        key: 'delete',
        icon: <TrashIcon className="w-4 h-4" />,
        label: 'Sil',
        danger: true,
        onClick: () => handleDelete(record.id),
      });
    }

    return items;
  };

  const columns: ColumnsType<PaymentListItem> = [
    {
      title: 'Ödeme No',
      dataIndex: 'paymentNumber',
      key: 'paymentNumber',
      sorter: true,
      render: (text, record) => (
        <Link href={`/sales/payments/${record.id}`} className="font-medium text-slate-900 hover:text-slate-600">
          {text}
        </Link>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      sorter: true,
      render: (date) => (
        <span className="text-slate-600">{dayjs(date).format('DD/MM/YYYY')}</span>
      ),
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
      sorter: true,
    },
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text) => <span className="text-slate-600">{text || '-'}</span>,
    },
    {
      title: 'Yöntem',
      dataIndex: 'method',
      key: 'method',
      render: (method: PaymentMethod) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {methodLabels[method]}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: PaymentStatus) => {
        const config = statusConfig[status];
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      sorter: true,
      align: 'right',
      render: (amount, record) => (
        <span className="font-semibold text-slate-900">
          {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </span>
      ),
    },
    {
      title: 'Referans',
      dataIndex: 'reference',
      key: 'reference',
      render: (text) => <span className="text-slate-600">{text || '-'}</span>,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      align: 'center',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionItems(record) }}
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <CurrencyDollarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ödemeler</h1>
            <p className="text-sm text-slate-500">
              Ödeme kayıtlarını yönetin
              {totalCount > 0 && <span className="ml-2 text-slate-400">({totalCount} ödeme)</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => router.push('/sales/payments/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Ödeme
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Ödeme ara..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            value={filters.method}
            onChange={(e) => handleMethodChange(e.target.value)}
          >
            {methodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <RangePicker
            placeholder={['Başlangıç', 'Bitiş']}
            onChange={handleDateRangeChange}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Table
          columns={columns}
          dataSource={payments}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} ödeme`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>

      {/* Reject Modal */}
      <Modal
        title="Ödemeyi Reddet"
        open={rejectModalOpen}
        onOk={handleRejectConfirm}
        onCancel={() => setRejectModalOpen(false)}
        okText="Reddet"
        cancelText="Vazgeç"
        okButtonProps={{ danger: true, loading: rejectPayment.isPending }}
      >
        <div className="mb-4">
          <p className="text-slate-600">Bu ödemeyi reddetmek istediğinizden emin misiniz?</p>
        </div>
        <textarea
          placeholder="Red sebebini girin..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
        />
      </Modal>
    </div>
  );
}
