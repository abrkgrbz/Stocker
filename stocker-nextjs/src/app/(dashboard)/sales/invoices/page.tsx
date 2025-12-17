'use client';

/**
 * Invoices List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  Tag,
  Input,
  Select,
  DatePicker,
  Dropdown,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  FileTextOutlined,
  SendOutlined,
  DollarOutlined,
  MailOutlined,
  FilePdfOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
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
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';
import {
  showSuccess,
  showError,
  showWarning,
  confirmDelete,
  confirmAction,
} from '@/lib/utils/sweetalert';

const { RangePicker } = DatePicker;

const statusConfig: Record<InvoiceStatus, { color: string; label: string; bgColor: string; tagColor: string }> = {
  Draft: { color: '#64748b', label: 'Taslak', bgColor: '#64748b15', tagColor: 'default' },
  Issued: { color: '#3b82f6', label: 'Kesildi', bgColor: '#3b82f615', tagColor: 'blue' },
  Sent: { color: '#06b6d4', label: 'Gönderildi', bgColor: '#06b6d415', tagColor: 'cyan' },
  PartiallyPaid: { color: '#f59e0b', label: 'Kısmi Ödendi', bgColor: '#f59e0b15', tagColor: 'orange' },
  Paid: { color: '#10b981', label: 'Ödendi', bgColor: '#10b98115', tagColor: 'green' },
  Overdue: { color: '#ef4444', label: 'Vadesi Geçmiş', bgColor: '#ef444415', tagColor: 'red' },
  Cancelled: { color: '#ef4444', label: 'İptal Edildi', bgColor: '#ef444415', tagColor: 'red' },
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
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: statusConfig[record.status]?.bgColor || '#64748b15' }}
          >
            <FileTextOutlined style={{ color: statusConfig[record.status]?.color || '#64748b' }} />
          </div>
          <div>
            <Link
              href={`/sales/invoices/${record.id}`}
              className="text-sm font-medium text-slate-900 hover:text-indigo-600"
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
          <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
            {dayjs(date).format('DD.MM.YYYY')}
          </div>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: InvoiceStatus) => (
        <Tag color={statusConfig[status]?.tagColor}>
          {statusConfig[status]?.label}
        </Tag>
      ),
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
        <div className="text-sm text-emerald-600">
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
        <div className={`text-sm font-medium ${balance > 0 ? 'text-red-600' : 'text-slate-500'}`}>
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
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${isEInvoice ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
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
        const menuItems: any[] = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'Görüntüle',
            onClick: () => router.push(`/sales/invoices/${record.id}`),
          },
        ];

        if (record.status === 'Draft') {
          menuItems.push(
            {
              key: 'edit',
              icon: <EditOutlined />,
              label: 'Düzenle',
              onClick: () => router.push(`/sales/invoices/${record.id}/edit`),
            },
            {
              key: 'issue',
              icon: <CheckCircleOutlined />,
              label: 'Kes',
              onClick: () => handleIssue(record.id),
            },
            { type: 'divider' as const },
            {
              key: 'delete',
              icon: <DeleteOutlined />,
              label: 'Sil',
              danger: true,
              onClick: () => handleDelete(record),
            }
          );
        }

        if (record.status === 'Issued') {
          menuItems.push({
            key: 'send',
            icon: <MailOutlined />,
            label: 'Gönder',
            onClick: () => handleSend(record.id),
          });
        }

        if (record.status !== 'Cancelled' && record.status !== 'Paid' && record.status !== 'Draft') {
          menuItems.push({
            key: 'cancel',
            icon: <CloseCircleOutlined />,
            label: 'İptal Et',
            danger: true,
            onClick: () => handleCancel(record),
          });
        }

        if (record.status === 'Cancelled') {
          menuItems.push({
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDelete(record),
          });
        }

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              <MoreOutlined className="text-sm" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Fatura</span>
              <div className="text-2xl font-semibold text-slate-900">{totalCount}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6366f115' }}>
              <FileTextOutlined style={{ color: '#6366f1' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Taslak</span>
              <div className="text-2xl font-semibold text-slate-900">{stats.draft}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: stats.draft > 0 ? '#f59e0b15' : '#64748b15' }}>
              <ClockCircleOutlined style={{ color: stats.draft > 0 ? '#f59e0b' : '#64748b' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Vadesi Geçmiş</span>
              <div className="text-2xl font-semibold text-slate-900">{stats.overdue}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: stats.overdue > 0 ? '#ef444415' : '#64748b15' }}>
              <WarningOutlined style={{ color: stats.overdue > 0 ? '#ef4444' : '#64748b' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Bakiye</span>
              <div className="text-2xl font-semibold text-slate-900">
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(stats.totalDue)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: stats.totalDue > 0 ? '#ef444415' : '#10b98115' }}>
              <DollarOutlined style={{ color: stats.totalDue > 0 ? '#ef4444' : '#10b981' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<FileTextOutlined />}
        iconColor="#10b981"
        title="Faturalar"
        description="Satış faturalarını yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Fatura',
          onClick: () => router.push('/sales/invoices/new'),
          icon: <PlusOutlined />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ReloadOutlined className={isLoading ? 'animate-spin' : ''} />
          </button>
        }
      />

      {/* Bulk Actions Bar */}
      {selectedRowKeys.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-indigo-700 font-medium">
              {selectedRowKeys.length} fatura seçildi
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkPdfExport}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                <FilePdfOutlined />
                PDF
              </button>
              <button
                onClick={handleBulkIssue}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                <CheckCircleOutlined />
                Kes
              </button>
              <button
                onClick={handleBulkSend}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                <SendOutlined />
                Gönder
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50"
              >
                <DeleteOutlined />
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
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Fatura ara..."
            prefix={<SearchOutlined className="text-slate-400" />}
            allowClear
            style={{ maxWidth: 300 }}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchTerm: e.target.value, page: 1 }))}
            className="h-10"
          />
          <Select
            placeholder="Durum seçin"
            options={statusOptions}
            value={filters.status}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value, page: 1 }))}
            style={{ width: 160 }}
            allowClear
          />
          <Select
            placeholder="Tip seçin"
            options={typeOptions}
            value={filters.type}
            onChange={(value) => setFilters((prev) => ({ ...prev, type: value, page: 1 }))}
            style={{ width: 140 }}
            allowClear
          />
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
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
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
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
