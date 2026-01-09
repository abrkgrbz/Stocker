'use client';

/**
 * Invoices List Page
 * Monochrome Design System
 */

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  DatePicker,
  Dropdown,
} from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  useInvoices,
  useDeleteInvoice,
  useIssueInvoice,
  useSendInvoice,
  useCancelInvoice,
} from '@/lib/api/hooks/useInvoices';
import type { InvoiceListItem, InvoiceStatus, GetInvoicesParams } from '@/lib/api/services/invoice.service';
import { InvoiceService } from '@/lib/api/services/invoice.service';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { generateInvoicePDF } from '@/lib/utils/pdf-export';
import {
  showSuccess,
  showError,
  showWarning,
  confirmDelete,
  confirmAction,
} from '@/lib/utils/sweetalert';

const { RangePicker } = DatePicker;

const statusConfig: Record<InvoiceStatus, { bgColor: string; textColor: string; label: string }> = {
  Draft: { bgColor: 'bg-slate-100', textColor: 'text-slate-600', label: 'Taslak' },
  Issued: { bgColor: 'bg-slate-200', textColor: 'text-slate-700', label: 'Kesildi' },
  Sent: { bgColor: 'bg-slate-300', textColor: 'text-slate-800', label: 'Gönderildi' },
  PartiallyPaid: { bgColor: 'bg-slate-400', textColor: 'text-white', label: 'Kısmi Ödendi' },
  Paid: { bgColor: 'bg-slate-700', textColor: 'text-white', label: 'Ödendi' },
  Overdue: { bgColor: 'bg-slate-800', textColor: 'text-white', label: 'Vadesi Geçmiş' },
  Cancelled: { bgColor: 'bg-slate-900', textColor: 'text-white', label: 'İptal Edildi' },
};

const statusOptions = [
  { value: '', label: 'Tüm Durumlar' },
  ...Object.entries(statusConfig).map(([value, config]) => ({
    value,
    label: config.label,
  })),
];

const typeOptions = [
  { value: '', label: 'Tüm Tipler' },
  { value: 'Sales', label: 'Satış' },
  { value: 'Return', label: 'İade' },
  { value: 'Credit', label: 'Alacak' },
  { value: 'Debit', label: 'Borç' },
];

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<GetInvoicesParams>({
    page: 1,
    pageSize: 20,
    searchTerm: '',
    status: searchParams.get('status') || '',
    type: searchParams.get('type') || '',
    sortBy: 'InvoiceDate',
    sortDescending: true,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const { data, isLoading, refetch } = useInvoices(filters);
  const deleteInvoice = useDeleteInvoice();
  const issueInvoice = useIssueInvoice();
  const sendInvoice = useSendInvoice();
  const cancelInvoice = useCancelInvoice();

  const invoices = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Calculate stats
  const stats = useMemo(() => {
    const draft = invoices.filter(i => i.status === 'Draft').length;
    const overdue = invoices.filter(i => i.status === 'Overdue').length;
    const totalValue = invoices.reduce((sum, i) => sum + (i.grandTotal || 0), 0);
    const totalDue = invoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);
    return { draft, overdue, totalValue, totalDue };
  }, [invoices]);

  const handleIssue = async (id: string) => {
    try {
      await issueInvoice.mutateAsync(id);
      showSuccess('Başarılı', 'Fatura kesildi');
    } catch {
      showError('Fatura kesme başarısız');
    }
  };

  const handleSend = async (id: string) => {
    try {
      await sendInvoice.mutateAsync(id);
      showSuccess('Başarılı', 'Fatura gönderildi');
    } catch {
      showError('Gönderim başarısız');
    }
  };

  const handleCancel = async (invoice: InvoiceListItem) => {
    const confirmed = await confirmAction(
      'Faturayı İptal Et',
      'Bu faturayı iptal etmek istediğinizden emin misiniz?',
      'İptal Et'
    );
    if (confirmed) {
      try {
        await cancelInvoice.mutateAsync(invoice.id);
        showSuccess('Başarılı', 'Fatura iptal edildi');
      } catch {
        showError('İptal işlemi başarısız');
      }
    }
  };

  const handleDelete = async (invoice: InvoiceListItem) => {
    const confirmed = await confirmDelete('Fatura', invoice.invoiceNumber);
    if (confirmed) {
      try {
        await deleteInvoice.mutateAsync(invoice.id);
        showSuccess('Başarılı', 'Fatura silindi');
      } catch {
        showError('Silme işlemi başarısız');
      }
    }
  };

  // Bulk operations
  const handleBulkPdfExport = async () => {
    if (selectedRowKeys.length === 0) {
      showWarning('Uyarı', 'Lütfen PDF oluşturmak için fatura seçiniz');
      return;
    }
    setBulkLoading(true);
    try {
      for (const id of selectedRowKeys) {
        const invoice = await InvoiceService.getInvoiceById(id);
        await generateInvoicePDF(invoice);
      }
      showSuccess('Başarılı', `${selectedRowKeys.length} fatura PDF olarak indirildi`);
    } catch {
      showError('PDF oluşturulurken hata oluştu');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkIssue = async () => {
    const draftInvoices = selectedRowKeys.filter(id => {
      const inv = invoices.find(i => i.id === id);
      return inv?.status === 'Draft';
    });

    if (draftInvoices.length === 0) {
      showWarning('Uyarı', 'Seçili faturalar arasında kesilebilecek taslak fatura bulunamadı');
      return;
    }

    const confirmed = await confirmAction(
      'Toplu Fatura Kesme',
      `${draftInvoices.length} adet taslak fatura kesilecek. Devam etmek istiyor musunuz?`,
      'Kes'
    );

    if (confirmed) {
      setBulkLoading(true);
      let successCount = 0;
      try {
        for (const id of draftInvoices) {
          try {
            await issueInvoice.mutateAsync(id);
            successCount++;
          } catch {
            // Continue with others
          }
        }
        showSuccess('Başarılı', `${successCount} fatura başarıyla kesildi`);
        setSelectedRowKeys([]);
        refetch();
      } finally {
        setBulkLoading(false);
      }
    }
  };

  const handleBulkSend = async () => {
    const issuedInvoices = selectedRowKeys.filter(id => {
      const inv = invoices.find(i => i.id === id);
      return inv?.status === 'Issued';
    });

    if (issuedInvoices.length === 0) {
      showWarning('Uyarı', 'Seçili faturalar arasında gönderilebilecek fatura bulunamadı');
      return;
    }

    const confirmed = await confirmAction(
      'Toplu Fatura Gönderimi',
      `${issuedInvoices.length} adet fatura gönderilecek. Devam etmek istiyor musunuz?`,
      'Gönder'
    );

    if (confirmed) {
      setBulkLoading(true);
      let successCount = 0;
      try {
        for (const id of issuedInvoices) {
          try {
            await sendInvoice.mutateAsync(id);
            successCount++;
          } catch {
            // Continue with others
          }
        }
        showSuccess('Başarılı', `${successCount} fatura başarıyla gönderildi`);
        setSelectedRowKeys([]);
        refetch();
      } finally {
        setBulkLoading(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    const deletableInvoices = selectedRowKeys.filter(id => {
      const inv = invoices.find(i => i.id === id);
      return inv?.status === 'Draft' || inv?.status === 'Cancelled';
    });

    if (deletableInvoices.length === 0) {
      showWarning('Uyarı', 'Seçili faturalar arasında silinebilecek fatura bulunamadı (sadece taslak veya iptal edilmiş faturalar silinebilir)');
      return;
    }

    const confirmed = await confirmDelete('Fatura', `${deletableInvoices.length} fatura`);
    if (confirmed) {
      setBulkLoading(true);
      let successCount = 0;
      try {
        for (const id of deletableInvoices) {
          try {
            await deleteInvoice.mutateAsync(id);
            successCount++;
          } catch {
            // Continue with others
          }
        }
        showSuccess('Başarılı', `${successCount} fatura başarıyla silindi`);
        setSelectedRowKeys([]);
        refetch();
      } finally {
        setBulkLoading(false);
      }
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortBy: sorter.field || 'InvoiceDate',
      sortDescending: sorter.order === 'descend',
    }));
  };

  const columns: ColumnsType<InvoiceListItem> = [
    {
      title: 'Fatura',
      key: 'invoice',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <DocumentTextIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <Link
              href={`/sales/invoices/${record.id}`}
              className="text-sm font-medium text-slate-900 hover:text-slate-600"
            >
              {record.invoiceNumber}
            </Link>
            <div className="text-xs text-slate-500">
              {record.customerName}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      width: 100,
      sorter: true,
      render: (date) => (
        <div className="text-sm text-slate-600">
          {dayjs(date).format('DD.MM.YYYY')}
        </div>
      ),
    },
    {
      title: 'Vade',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 100,
      sorter: true,
      render: (date, record) => {
        const isOverdue = record.status === 'Overdue';
        return (
          <div className={`text-sm ${isOverdue ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
            {dayjs(date).format('DD.MM.YYYY')}
          </div>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: InvoiceStatus) => {
        const config = statusConfig[status];
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Toplam',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      width: 130,
      sorter: true,
      align: 'right',
      render: (total, record) => (
        <div className="text-sm font-medium text-slate-900">
          {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </div>
      ),
    },
    {
      title: 'Ödenen',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 130,
      align: 'right',
      render: (amount, record) => (
        <div className="text-sm text-slate-600">
          {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </div>
      ),
    },
    {
      title: 'Kalan',
      dataIndex: 'balanceDue',
      key: 'balanceDue',
      width: 130,
      align: 'right',
      render: (balance, record) => (
        <div className={`text-sm font-medium ${balance > 0 ? 'text-slate-900' : 'text-slate-500'}`}>
          {balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </div>
      ),
    },
    {
      title: 'E-Fatura',
      dataIndex: 'isEInvoice',
      key: 'isEInvoice',
      width: 90,
      align: 'center',
      render: (isEInvoice) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${isEInvoice ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-600'}`}>
          {isEInvoice ? 'E-Fatura' : 'Normal'}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_, record) => {
        const menuItems: ({ key: string; icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean } | { type: 'divider' })[] = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Görüntüle',
            onClick: () => router.push(`/sales/invoices/${record.id}`),
          },
        ];

        if (record.status === 'Draft') {
          menuItems.push(
            {
              key: 'edit',
              icon: <PencilIcon className="w-4 h-4" />,
              label: 'Düzenle',
              onClick: () => router.push(`/sales/invoices/${record.id}/edit`),
            },
            {
              key: 'issue',
              icon: <CheckCircleIcon className="w-4 h-4" />,
              label: 'Kes',
              onClick: () => handleIssue(record.id),
            },
            { type: 'divider' as const },
            {
              key: 'delete',
              icon: <TrashIcon className="w-4 h-4" />,
              label: 'Sil',
              danger: true,
              onClick: () => handleDelete(record),
            }
          );
        }

        if (record.status === 'Issued') {
          menuItems.push({
            key: 'send',
            icon: <EnvelopeIcon className="w-4 h-4" />,
            label: 'Gönder',
            onClick: () => handleSend(record.id),
          });
        }

        if (record.status !== 'Cancelled' && record.status !== 'Paid' && record.status !== 'Draft') {
          menuItems.push({
            key: 'cancel',
            icon: <XCircleIcon className="w-4 h-4" />,
            label: 'İptal Et',
            danger: true,
            onClick: () => handleCancel(record),
          });
        }

        if (record.status === 'Cancelled') {
          menuItems.push({
            key: 'delete',
            icon: <TrashIcon className="w-4 h-4" />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDelete(record),
          });
        }

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <DocumentTextIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Faturalar</h1>
            <p className="text-sm text-slate-500">
              Satış faturalarını yönetin
              {totalCount > 0 && <span className="ml-2 text-slate-400">({totalCount} fatura)</span>}
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
            onClick={() => router.push('/sales/invoices/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Fatura
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Toplam Fatura</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Taslak</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.draft}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Vadesi Geçmiş</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.overdue}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Toplam Bakiye</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(stats.totalDue)}
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRowKeys.length > 0 && (
        <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700 font-medium">
              {selectedRowKeys.length} fatura seçildi
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkPdfExport}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                <DocumentIcon className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={handleBulkIssue}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                <CheckCircleIcon className="w-4 h-4" />
                Kes
              </button>
              <button
                onClick={handleBulkSend}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                Gönder
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                <TrashIcon className="w-4 h-4" />
                Sil
              </button>
              <button
                onClick={() => setSelectedRowKeys([])}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
              >
                Temizle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Fatura ara..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              onChange={(e) => setFilters((prev) => ({ ...prev, searchTerm: e.target.value, page: 1 }))}
            />
          </div>
          <select
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            value={filters.type}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value, page: 1 }))}
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <RangePicker
            placeholder={['Başlangıç', 'Bitiş']}
            style={{ width: 280 }}
            onChange={(dates) => {
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
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          </div>
        ) : (
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={invoices}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: filters.page,
              pageSize: filters.pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} fatura`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        )}
      </div>
    </div>
  );
}
