'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Tag, Dropdown, Select, DatePicker } from 'antd';
import { Spinner } from '@/components/primitives';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  TableCellsIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  usePurchaseInvoices,
  useDeletePurchaseInvoice,
  useApprovePurchaseInvoice,
  useRejectPurchaseInvoice,
  useMarkInvoiceAsPaid,
} from '@/lib/api/hooks/usePurchase';
import type { PurchaseInvoiceListDto, PurchaseInvoiceStatus } from '@/lib/api/services/purchase.types';
import { exportToExcel, type ExportColumn, formatDateForExport, formatCurrencyForExport } from '@/lib/utils/export';
import { confirmDelete, showSuccess, showError, showWarning, confirmAction } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';

const { RangePicker } = DatePicker;

const statusConfig: Record<PurchaseInvoiceStatus, { color: string; label: string; bgColor: string; tagColor: string }> = {
  Draft: { color: '#64748b', label: 'Taslak', bgColor: '#64748b15', tagColor: 'default' },
  PendingApproval: { color: '#f59e0b', label: 'Onay Bekliyor', bgColor: '#f59e0b15', tagColor: 'orange' },
  Approved: { color: '#8b5cf6', label: 'Onaylandı', bgColor: '#8b5cf615', tagColor: 'purple' },
  Rejected: { color: '#ef4444', label: 'Reddedildi', bgColor: '#ef444415', tagColor: 'red' },
  PartiallyPaid: { color: '#3b82f6', label: 'Kısmen Ödendi', bgColor: '#3b82f615', tagColor: 'blue' },
  Paid: { color: '#10b981', label: 'Ödendi', bgColor: '#10b98115', tagColor: 'green' },
  Cancelled: { color: '#6b7280', label: 'İptal', bgColor: '#6b728015', tagColor: 'default' },
};

export default function PurchaseInvoicesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseInvoiceStatus | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const { data: invoicesData, isLoading, refetch } = usePurchaseInvoices({
    searchTerm: searchText || undefined,
    status: statusFilter,
    fromDate: dateRange?.[0]?.toISOString(),
    toDate: dateRange?.[1]?.toISOString(),
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const deleteInvoice = useDeletePurchaseInvoice();
  const approveInvoice = useApprovePurchaseInvoice();
  const rejectInvoice = useRejectPurchaseInvoice();
  const markAsPaid = useMarkInvoiceAsPaid();

  const invoices = invoicesData?.items || [];
  const totalCount = invoicesData?.totalCount || 0;

  // Statistics
  const stats = useMemo(() => {
    return {
      total: totalCount,
      pending: invoices.filter(i => i.status === 'PendingApproval').length,
      overdue: invoices.filter(i => i.dueDate && dayjs(i.dueDate).isBefore(dayjs(), 'day') && i.status !== 'Paid').length,
      totalBalance: invoices.reduce((sum, i) => sum + (i.remainingAmount || 0), 0),
    };
  }, [invoices, totalCount]);

  const handleDelete = async (record: PurchaseInvoiceListDto) => {
    const confirmed = await confirmDelete('Fatura', record.invoiceNumber, 'Bu işlem geri alınamaz!');
    if (confirmed) {
      try {
        await deleteInvoice.mutateAsync(record.id);
        showSuccess('Başarılı', 'Fatura silindi');
      } catch {
        showError('Fatura silinemedi');
      }
    }
  };

  // Bulk Actions
  const selectedInvoices = invoices.filter(i => selectedRowKeys.includes(i.id));

  const handleBulkApprove = async () => {
    const pendingInvoices = selectedInvoices.filter(i => i.status === 'PendingApproval');
    if (pendingInvoices.length === 0) {
      showWarning('Uyarı', 'Seçili faturalar arasında onay bekleyen fatura yok');
      return;
    }
    setBulkLoading(true);
    try {
      await Promise.all(pendingInvoices.map(i => approveInvoice.mutateAsync({ id: i.id })));
      showSuccess('Başarılı', `${pendingInvoices.length} fatura onaylandı`);
      setSelectedRowKeys([]);
      refetch();
    } catch {
      showError('Bazı faturalar onaylanamadı');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkReject = async () => {
    const pendingInvoices = selectedInvoices.filter(i => i.status === 'PendingApproval');
    if (pendingInvoices.length === 0) {
      showWarning('Uyarı', 'Seçili faturalar arasında onay bekleyen fatura yok');
      return;
    }
    const confirmed = await confirmAction('Toplu Reddet', `${pendingInvoices.length} faturayı reddetmek istediğinizden emin misiniz?`, 'Reddet');
    if (confirmed) {
      setBulkLoading(true);
      try {
        await Promise.all(pendingInvoices.map(i => rejectInvoice.mutateAsync({ id: i.id, reason: 'Bulk rejection' })));
        showSuccess('Başarılı', `${pendingInvoices.length} fatura reddedildi`);
        setSelectedRowKeys([]);
        refetch();
      } catch {
        showError('Bazı faturalar reddedilemedi');
      } finally {
        setBulkLoading(false);
      }
    }
  };

  const handleBulkMarkPaid = async () => {
    const approvedInvoices = selectedInvoices.filter(i => i.status === 'Approved' || i.status === 'PartiallyPaid');
    if (approvedInvoices.length === 0) {
      showWarning('Uyarı', 'Seçili faturalar arasında ödendi işaretlenecek fatura yok');
      return;
    }
    setBulkLoading(true);
    try {
      await Promise.all(approvedInvoices.map(i => markAsPaid.mutateAsync({ id: i.id })));
      showSuccess('Başarılı', `${approvedInvoices.length} fatura ödendi olarak işaretlendi`);
      setSelectedRowKeys([]);
      refetch();
    } catch {
      showError('Bazı faturalar güncellenemedi');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    const draftInvoices = selectedInvoices.filter(i => i.status === 'Draft');
    if (draftInvoices.length === 0) {
      showWarning('Uyarı', 'Sadece taslak faturalar silinebilir');
      return;
    }
    const confirmed = await confirmDelete('fatura', `${draftInvoices.length} adet`, 'Bu işlem geri alınamaz!');
    if (confirmed) {
      setBulkLoading(true);
      try {
        await Promise.all(draftInvoices.map(i => deleteInvoice.mutateAsync(i.id)));
        showSuccess('Başarılı', `${draftInvoices.length} fatura silindi`);
        setSelectedRowKeys([]);
        refetch();
      } catch {
        showError('Bazı faturalar silinemedi');
      } finally {
        setBulkLoading(false);
      }
    }
  };

  // Export Functions
  const exportColumns: ExportColumn<PurchaseInvoiceListDto>[] = [
    { key: 'invoiceNumber', title: 'Fatura No' },
    { key: 'invoiceDate', title: 'Fatura Tarihi', render: (v) => formatDateForExport(v) },
    { key: 'supplierName', title: 'Tedarikçi' },
    { key: 'status', title: 'Durum', render: (v) => statusConfig[v as PurchaseInvoiceStatus]?.label || v },
    { key: 'totalAmount', title: 'Toplam Tutar', render: (v, r) => formatCurrencyForExport(v, r.currency) },
    { key: 'paidAmount', title: 'Ödenen', render: (v) => formatCurrencyForExport(v, 'TRY') },
    { key: 'remainingAmount', title: 'Kalan', render: (v) => formatCurrencyForExport(v, 'TRY') },
    { key: 'dueDate', title: 'Vade Tarihi', render: (v) => formatDateForExport(v) },
  ];

  const handleExportExcel = async () => {
    const dataToExport = selectedRowKeys.length > 0 ? selectedInvoices : invoices;
    await exportToExcel(dataToExport, exportColumns, `satin-alma-faturalari-${dayjs().format('YYYY-MM-DD')}`, 'Faturalar');
    showSuccess('Başarılı', 'Excel dosyası indirildi');
  };

  // Row Selection
  const rowSelection: TableProps<PurchaseInvoiceListDto>['rowSelection'] = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    preserveSelectedRowKeys: true,
  };

  const columns: ColumnsType<PurchaseInvoiceListDto> = [
    {
      title: 'Fatura',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      fixed: 'left',
      width: 180,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: statusConfig[record.status as PurchaseInvoiceStatus]?.bgColor || '#64748b15' }}
          >
            <DocumentTextIcon className="w-5 h-5" style={{ color: statusConfig[record.status as PurchaseInvoiceStatus]?.color || '#64748b' }} />
          </div>
          <div>
            <div
              className="text-sm font-medium text-slate-900 cursor-pointer hover:text-indigo-600"
              onClick={(e) => { e.stopPropagation(); router.push(`/purchase/invoices/${record.id}`); }}
            >
              {record.invoiceNumber}
            </div>
            <div className="text-xs text-slate-500">
              {dayjs(record.invoiceDate).format('DD.MM.YYYY')}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tedarikçi',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 200,
      render: (name) => <span className="text-sm text-slate-700">{name}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: PurchaseInvoiceStatus) => {
        const config = statusConfig[status] || statusConfig.Draft;
        return <Tag color={config.tagColor}>{config.label}</Tag>;
      },
    },
    {
      title: 'Toplam Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right',
      render: (amount, record) => (
        <span className="text-sm font-semibold text-slate-900">
          {(amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency || '₺'}
        </span>
      ),
    },
    {
      title: 'Ödenen',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 120,
      align: 'right',
      render: (amount) => (
        <span className="text-sm text-emerald-600">
          {(amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
        </span>
      ),
    },
    {
      title: 'Kalan',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      width: 120,
      align: 'right',
      render: (amount) => (
        <span className={`text-sm font-medium ${amount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
          {(amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
        </span>
      ),
    },
    {
      title: 'Vade Tarihi',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date, record) => {
        if (!date) return <span className="text-slate-400">-</span>;
        const isOverdue = dayjs(date).isBefore(dayjs(), 'day') && record.status !== 'Paid';
        return (
          <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
            {dayjs(date).format('DD.MM.YYYY')}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      fixed: 'right',
      width: 50,
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          { key: 'view', icon: <EyeIcon className="w-4 h-4" />, label: 'Görüntüle', onClick: () => router.push(`/purchase/invoices/${record.id}`) },
          ...(record.status === 'Draft' ? [{ key: 'edit', icon: <PencilIcon className="w-4 h-4" />, label: 'Düzenle', onClick: () => router.push(`/purchase/invoices/${record.id}/edit`) }] : []),
          { type: 'divider' },
          ...(record.status === 'PendingApproval' ? [{ key: 'approve', icon: <CheckCircleIcon className="w-4 h-4" />, label: 'Onayla', onClick: () => approveInvoice.mutate({ id: record.id }) }] : []),
          ...(record.status === 'Approved' ? [{ key: 'pay', icon: <CurrencyDollarIcon className="w-4 h-4" />, label: 'Ödendi İşaretle', onClick: () => markAsPaid.mutate({ id: record.id }) }] : []),
          { type: 'divider' },
          ...(record.status === 'Draft' ? [{ key: 'delete', icon: <TrashIcon className="w-4 h-4" />, label: 'Sil', danger: true, onClick: () => handleDelete(record) }] : []),
        ];
        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" onClick={(e) => e.stopPropagation()}>
              <EllipsisVerticalIcon className="w-4 h-4 text-slate-400" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ListPageHeader
        title="Satın Alma Faturaları"
        description="Tedarikçi faturalarını yönetin"
        icon={<DocumentTextIcon className="w-5 h-5 text-blue-600" />}
        primaryAction={{
          label: 'Yeni Fatura',
          icon: <PlusIcon className="w-4 h-4" />,
          onClick: () => router.push('/purchase/invoices/new'),
        }}
        secondaryActions={
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          >
            <TableCellsIcon className="w-4 h-4" />
            Excel İndir
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border border-slate-200">
          <div className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#6366f115' }}>
              <DocumentTextIcon className="w-6 h-6" style={{ color: '#6366f1' }} />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">{stats.total}</div>
              <div className="text-sm text-slate-500">Toplam Fatura</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-slate-200">
          <div className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f59e0b15' }}>
              <ClockIcon className="w-6 h-6" style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">{stats.pending}</div>
              <div className="text-sm text-slate-500">Onay Bekliyor</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-slate-200">
          <div className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#ef444415' }}>
              <ExclamationTriangleIcon className="w-6 h-6" style={{ color: '#ef4444' }} />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">{stats.overdue}</div>
              <div className="text-sm text-slate-500">Vadesi Geçmiş</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-slate-200">
          <div className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <CurrencyDollarIcon className="w-6 h-6" style={{ color: '#10b981' }} />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">
                {stats.totalBalance.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₺
              </div>
              <div className="text-sm text-slate-500">Toplam Bakiye</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-slate-200 mb-6">
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Fatura ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-72"
              allowClear
            />
            <Select
              placeholder="Durum"
              allowClear
              className="w-40"
              value={statusFilter}
              onChange={setStatusFilter}
              options={Object.entries(statusConfig).map(([value, config]) => ({ value, label: config.label }))}
            />
            <RangePicker
              placeholder={['Başlangıç', 'Bitiş']}
              format="DD.MM.YYYY"
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
            />
          </div>

          {/* Bulk Actions Bar */}
          {selectedRowKeys.length > 0 && (
            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-700">
                {selectedRowKeys.length} fatura seçildi
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5"
                  onClick={handleBulkApprove}
                  disabled={bulkLoading}
                >
                  <CheckCircleIcon className="w-3 h-3" />
                  Onayla
                </button>
                <button
                  className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
                  onClick={handleBulkMarkPaid}
                  disabled={bulkLoading}
                >
                  <CurrencyDollarIcon className="w-3 h-3" />
                  Ödendi İşaretle
                </button>
                <button
                  className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1.5"
                  onClick={handleBulkReject}
                  disabled={bulkLoading}
                >
                  <XCircleIcon className="w-3 h-3" />
                  Reddet
                </button>
                <button
                  className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1.5"
                  onClick={handleBulkDelete}
                  disabled={bulkLoading}
                >
                  <TrashIcon className="w-3 h-3" />
                  Sil
                </button>
                <button
                  className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  onClick={() => setSelectedRowKeys([])}
                >
                  Temizle
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      <DataTableWrapper>
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="id"
          loading={isLoading || bulkLoading}
          rowSelection={rowSelection}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total) => <span className="text-sm text-slate-500">Toplam {total} fatura</span>,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
          onRow={(record) => ({
            onClick: () => router.push(`/purchase/invoices/${record.id}`),
            className: 'cursor-pointer',
          })}
        />
      </DataTableWrapper>
    </PageContainer>
  );
}
