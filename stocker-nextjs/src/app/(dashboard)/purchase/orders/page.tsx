'use client';

/**
 * Purchase Orders List Page
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
} from 'antd';
import { Spinner } from '@/components/primitives';
import type { MenuProps } from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PlusIcon,
  ShoppingCartIcon,
  TableCellsIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import type { TableProps } from 'antd';
import {
  usePurchaseOrders,
  useDeletePurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
  useSendPurchaseOrder,
  useCancelPurchaseOrder,
} from '@/lib/api/hooks/usePurchase';
import type { PurchaseOrderListDto, PurchaseOrderStatus } from '@/lib/api/services/purchase.types';
import { exportToCSV, exportToExcel, type ExportColumn, formatDateForExport, formatCurrencyForExport } from '@/lib/utils/export';
import dayjs from 'dayjs';
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

const statusConfig: Record<PurchaseOrderStatus, { color: string; label: string; bgColor: string; tagColor: string }> = {
  Draft: { color: '#64748b', label: 'Taslak', bgColor: '#64748b15', tagColor: 'default' },
  PendingApproval: { color: '#f59e0b', label: 'Onay Bekliyor', bgColor: '#f59e0b15', tagColor: 'orange' },
  Confirmed: { color: '#3b82f6', label: 'Onaylandı', bgColor: '#3b82f615', tagColor: 'blue' },
  Rejected: { color: '#ef4444', label: 'Reddedildi', bgColor: '#ef444415', tagColor: 'red' },
  Sent: { color: '#06b6d4', label: 'Gönderildi', bgColor: '#06b6d415', tagColor: 'cyan' },
  PartiallyReceived: { color: '#8b5cf6', label: 'Kısmen Alındı', bgColor: '#8b5cf615', tagColor: 'purple' },
  Received: { color: '#6366f1', label: 'Teslim Alındı', bgColor: '#6366f115', tagColor: 'geekblue' },
  Completed: { color: '#10b981', label: 'Tamamlandı', bgColor: '#10b98115', tagColor: 'green' },
  Cancelled: { color: '#64748b', label: 'İptal', bgColor: '#64748b15', tagColor: 'default' },
  Closed: { color: '#64748b', label: 'Kapatıldı', bgColor: '#64748b15', tagColor: 'default' },
};

const statusOptions = Object.entries(statusConfig).map(([value, config]) => ({
  value,
  label: config.label,
}));

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierIdFromUrl = searchParams.get('supplierId');

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const { data: ordersData, isLoading, refetch } = usePurchaseOrders({
    searchTerm: searchText || undefined,
    status: statusFilter,
    supplierId: supplierIdFromUrl || undefined,
    fromDate: dateRange?.[0]?.toISOString(),
    toDate: dateRange?.[1]?.toISOString(),
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const deleteOrder = useDeletePurchaseOrder();
  const approveOrder = useApprovePurchaseOrder();
  const rejectOrder = useRejectPurchaseOrder();
  const sendOrder = useSendPurchaseOrder();
  const cancelOrder = useCancelPurchaseOrder();

  const orders = ordersData?.items || [];
  const totalCount = ordersData?.totalCount || 0;

  // Statistics
  const stats = useMemo(() => {
    return {
      total: totalCount,
      pending: orders.filter(o => o.status === 'PendingApproval').length,
      sent: orders.filter(o => o.status === 'Sent' || o.status === 'Confirmed').length,
      totalAmount: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    };
  }, [orders, totalCount]);

  const handleDelete = async (record: PurchaseOrderListDto) => {
    const confirmed = await confirmDelete('Sipariş', record.orderNumber);
    if (confirmed) {
      try {
        await deleteOrder.mutateAsync(record.id);
        showSuccess('Başarılı', 'Sipariş silindi');
      } catch {
        showError('Sipariş silinemedi');
      }
    }
  };

  const handleApprove = async (record: PurchaseOrderListDto) => {
    try {
      await approveOrder.mutateAsync({ id: record.id });
      showSuccess('Başarılı', 'Sipariş onaylandı');
    } catch {
      showError('Sipariş onaylanamadı');
    }
  };

  const handleReject = async (record: PurchaseOrderListDto) => {
    const confirmed = await confirmAction(
      'Siparişi Reddet',
      'Bu siparişi reddetmek istediğinizden emin misiniz?',
      'Reddet'
    );
    if (confirmed) {
      try {
        await rejectOrder.mutateAsync({ id: record.id, reason: 'Manual rejection' });
        showSuccess('Başarılı', 'Sipariş reddedildi');
      } catch {
        showError('Sipariş reddedilemedi');
      }
    }
  };

  const handleSend = async (record: PurchaseOrderListDto) => {
    try {
      await sendOrder.mutateAsync(record.id);
      showSuccess('Başarılı', 'Sipariş tedarikçiye gönderildi');
    } catch {
      showError('Sipariş gönderilemedi');
    }
  };

  const handleCancel = async (record: PurchaseOrderListDto) => {
    const confirmed = await confirmAction(
      'Siparişi İptal Et',
      'Bu siparişi iptal etmek istediğinizden emin misiniz?',
      'İptal Et'
    );
    if (confirmed) {
      try {
        await cancelOrder.mutateAsync({ id: record.id, reason: 'Manual cancellation' });
        showSuccess('Başarılı', 'Sipariş iptal edildi');
      } catch {
        showError('Sipariş iptal edilemedi');
      }
    }
  };

  // Bulk Actions
  const selectedOrders = orders.filter(o => selectedRowKeys.includes(o.id));

  const handleBulkApprove = async () => {
    const pendingOrders = selectedOrders.filter(o => o.status === 'PendingApproval');
    if (pendingOrders.length === 0) {
      showWarning('Uyarı', 'Seçili siparişler arasında onay bekleyen sipariş yok');
      return;
    }
    setBulkLoading(true);
    try {
      await Promise.all(pendingOrders.map(o => approveOrder.mutateAsync({ id: o.id })));
      showSuccess('Başarılı', `${pendingOrders.length} sipariş onaylandı`);
      setSelectedRowKeys([]);
      refetch();
    } catch {
      showError('Bazı siparişler onaylanamadı');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkSend = async () => {
    const confirmedOrders = selectedOrders.filter(o => o.status === 'Confirmed');
    if (confirmedOrders.length === 0) {
      showWarning('Uyarı', 'Seçili siparişler arasında gönderilebilecek sipariş yok');
      return;
    }
    setBulkLoading(true);
    try {
      await Promise.all(confirmedOrders.map(o => sendOrder.mutateAsync(o.id)));
      showSuccess('Başarılı', `${confirmedOrders.length} sipariş tedarikçilere gönderildi`);
      setSelectedRowKeys([]);
      refetch();
    } catch {
      showError('Bazı siparişler gönderilemedi');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkCancel = async () => {
    const cancellableOrders = selectedOrders.filter(o => !['Cancelled', 'Completed', 'Closed'].includes(o.status));
    if (cancellableOrders.length === 0) {
      showWarning('Uyarı', 'Seçili siparişler arasında iptal edilebilecek sipariş yok');
      return;
    }
    const confirmed = await confirmAction(
      'Toplu İptal',
      `${cancellableOrders.length} siparişi iptal etmek istediğinizden emin misiniz?`,
      'İptal Et'
    );
    if (confirmed) {
      setBulkLoading(true);
      try {
        await Promise.all(cancellableOrders.map(o => cancelOrder.mutateAsync({ id: o.id, reason: 'Bulk cancellation' })));
        showSuccess('Başarılı', `${cancellableOrders.length} sipariş iptal edildi`);
        setSelectedRowKeys([]);
        refetch();
      } catch {
        showError('Bazı siparişler iptal edilemedi');
      } finally {
        setBulkLoading(false);
      }
    }
  };

  // Export Functions
  const exportColumns: ExportColumn<PurchaseOrderListDto>[] = [
    { key: 'orderNumber', title: 'Sipariş No' },
    { key: 'orderDate', title: 'Sipariş Tarihi', render: (v) => formatDateForExport(v) },
    { key: 'supplierName', title: 'Tedarikçi' },
    { key: 'status', title: 'Durum', render: (v) => statusConfig[v as PurchaseOrderStatus]?.label || v },
    { key: 'itemCount', title: 'Kalem Sayısı' },
    { key: 'totalAmount', title: 'Toplam Tutar', render: (v, r) => formatCurrencyForExport(v, r.currency) },
    { key: 'expectedDeliveryDate', title: 'Beklenen Teslim', render: (v) => formatDateForExport(v) },
  ];

  const handleExportExcel = async () => {
    const dataToExport = selectedRowKeys.length > 0 ? selectedOrders : orders;
    await exportToExcel(dataToExport, exportColumns, `satin-alma-siparisleri-${dayjs().format('YYYY-MM-DD')}`, 'Siparişler');
    showSuccess('Başarılı', 'Excel dosyası indirildi');
  };

  // Row Selection
  const rowSelection: TableProps<PurchaseOrderListDto>['rowSelection'] = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    preserveSelectedRowKeys: true,
  };

  const columns: ColumnsType<PurchaseOrderListDto> = [
    {
      title: 'Sipariş',
      key: 'order',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: statusConfig[record.status as PurchaseOrderStatus]?.bgColor || '#64748b15' }}
          >
            <ShoppingCartIcon className="w-5 h-5" style={{ color: statusConfig[record.status as PurchaseOrderStatus]?.color || '#64748b' }} />
          </div>
          <div>
            <div
              className="text-sm font-medium text-slate-900 cursor-pointer hover:text-indigo-600"
              onClick={(e) => { e.stopPropagation(); router.push(`/purchase/orders/${record.id}`); }}
            >
              {record.orderNumber}
            </div>
            <div className="text-xs text-slate-500">
              {dayjs(record.orderDate).format('DD.MM.YYYY')}
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
      render: (name) => (
        <div className="text-sm font-medium text-slate-900">{name}</div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: PurchaseOrderStatus) => (
        <Tag color={statusConfig[status]?.tagColor}>
          {statusConfig[status]?.label || status}
        </Tag>
      ),
    },
    {
      title: 'Kalem',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 80,
      align: 'center',
      render: (count) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
          {count || 0}
        </span>
      ),
    },
    {
      title: 'Toplam Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right',
      render: (amount, record) => (
        <div className="text-sm font-medium text-slate-900">
          {(amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency || '₺'}
        </div>
      ),
    },
    {
      title: 'Beklenen Teslim',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      width: 130,
      render: (date) => (
        <div className="text-sm text-slate-600">
          {date ? dayjs(date).format('DD.MM.YYYY') : '-'}
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      fixed: 'right',
      width: 60,
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Görüntüle',
            onClick: () => router.push(`/purchase/orders/${record.id}`),
          },
        ];

        if (record.status === 'Draft') {
          menuItems.push({
            key: 'edit',
            icon: <PencilIcon className="w-4 h-4" />,
            label: 'Düzenle',
            onClick: () => router.push(`/purchase/orders/${record.id}/edit`),
          });
        }

        menuItems.push({ type: 'divider' });

        if (record.status === 'PendingApproval') {
          menuItems.push(
            {
              key: 'approve',
              icon: <CheckCircleIcon className="w-4 h-4" />,
              label: 'Onayla',
              onClick: () => handleApprove(record),
            },
            {
              key: 'reject',
              icon: <XCircleIcon className="w-4 h-4" />,
              label: 'Reddet',
              danger: true,
              onClick: () => handleReject(record),
            }
          );
        }

        if (record.status === 'Confirmed') {
          menuItems.push({
            key: 'send',
            icon: <PaperAirplaneIcon className="w-4 h-4" />,
            label: 'Tedarikçiye Gönder',
            onClick: () => handleSend(record),
          });
        }

        if (!['Cancelled', 'Completed', 'Closed'].includes(record.status)) {
          menuItems.push({
            key: 'cancel',
            icon: <XCircleIcon className="w-4 h-4" />,
            label: 'İptal Et',
            danger: true,
            onClick: () => handleCancel(record),
          });
        }

        if (record.status === 'Draft') {
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
            <button
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <EllipsisVerticalIcon className="w-4 h-4" />
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
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Sipariş</span>
              <div className="text-2xl font-semibold text-slate-900">{stats.total}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6366f115' }}>
              <ShoppingCartIcon className="w-5 h-5" style={{ color: '#6366f1' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Onay Bekleyen</span>
              <div className="text-2xl font-semibold text-slate-900">{stats.pending}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: stats.pending > 0 ? '#f59e0b15' : '#64748b15' }}>
              <ClockIcon className="w-5 h-5" style={{ color: stats.pending > 0 ? '#f59e0b' : '#64748b' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Gönderilen</span>
              <div className="text-2xl font-semibold text-slate-900">{stats.sent}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#06b6d415' }}>
              <PaperAirplaneIcon className="w-5 h-5" style={{ color: '#06b6d4' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Tutar</span>
              <div className="text-2xl font-semibold text-slate-900">
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(stats.totalAmount)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <CurrencyDollarIcon className="w-5 h-5" style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<ShoppingCartIcon className="w-5 h-5" />}
        iconColor="#10b981"
        title="Satın Alma Siparişleri"
        description="Tedarikçilere verilen siparişleri yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Sipariş',
          onClick: () => router.push('/purchase/orders/new'),
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md hover:bg-slate-50"
            >
              <TableCellsIcon className="w-4 h-4" />
              Excel {selectedRowKeys.length > 0 && `(${selectedRowKeys.length})`}
            </button>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      />

      {/* Bulk Actions Bar */}
      {selectedRowKeys.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-indigo-700 font-medium">
              {selectedRowKeys.length} sipariş seçildi
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkApprove}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                <CheckCircleIcon className="w-4 h-4" />
                Onayla
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
                onClick={handleBulkCancel}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50"
              >
                <XCircleIcon className="w-4 h-4" />
                İptal
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
            placeholder="Sipariş ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 300 }}
            allowClear
            className="h-10"
          />
          <Select
            placeholder="Durum seçin"
            allowClear
            style={{ width: 180 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
          <RangePicker
            placeholder={['Başlangıç', 'Bitiş']}
            format="DD.MM.YYYY"
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            style={{ width: 280 }}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            loading={isLoading || bulkLoading}
            rowSelection={rowSelection}
            scroll={{ x: 1100 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} sipariş`,
              onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
            }}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
