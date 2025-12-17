'use client';

/**
 * Sales Orders List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Input,
  Select,
  DatePicker,
  Dropdown,
  Modal,
  Spin,
  Checkbox,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  MoreOutlined,
  FilePdfOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import {
  useSalesOrders,
  useApproveSalesOrder,
  useCancelSalesOrder,
  useDeleteSalesOrder,
} from '@/lib/api/hooks/useSales';
import type { SalesOrderListItem, SalesOrderStatus, GetSalesOrdersParams } from '@/lib/api/services/sales.service';
import { SalesService } from '@/lib/api/services/sales.service';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import { generateSalesOrderPDF } from '@/lib/utils/pdf-export';
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

const statusConfig: Record<SalesOrderStatus, { color: string; label: string; bgColor: string }> = {
  Draft: { color: '#64748b', label: 'Taslak', bgColor: '#64748b15' },
  Approved: { color: '#3b82f6', label: 'Onaylı', bgColor: '#3b82f615' },
  Confirmed: { color: '#06b6d4', label: 'Onaylandı', bgColor: '#06b6d415' },
  Shipped: { color: '#8b5cf6', label: 'Gönderildi', bgColor: '#8b5cf615' },
  Delivered: { color: '#6366f1', label: 'Teslim Edildi', bgColor: '#6366f115' },
  Completed: { color: '#10b981', label: 'Tamamlandı', bgColor: '#10b98115' },
  Cancelled: { color: '#ef4444', label: 'İptal', bgColor: '#ef444415' },
};

const statusOptions = Object.entries(statusConfig).map(([value, config]) => ({
  value,
  label: config.label,
}));

export default function SalesOrdersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<GetSalesOrdersParams>({
    page: 1,
    pageSize: 10,
  });
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SalesOrderListItem | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const { data, isLoading, refetch } = useSalesOrders(filters);
  const approveMutation = useApproveSalesOrder();
  const cancelMutation = useCancelSalesOrder();
  const deleteMutation = useDeleteSalesOrder();

  const orders = data?.items ?? [];

  // Calculate stats
  const stats = useMemo(() => {
    const total = data?.totalCount ?? 0;
    const draft = orders.filter(o => o.status === 'Draft').length;
    const pending = orders.filter(o => ['Approved', 'Confirmed', 'Shipped'].includes(o.status)).length;
    const totalValue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    return { total, draft, pending, totalValue };
  }, [orders, data?.totalCount]);

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      showSuccess('Başarılı', 'Sipariş onaylandı');
    } catch {
      showError('Sipariş onaylanamadı');
    }
  };

  const handleCancelClick = (order: SalesOrderListItem) => {
    setSelectedOrder(order);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedOrder || !cancelReason.trim()) {
      showWarning('Uyarı', 'İptal sebebi girilmelidir');
      return;
    }
    try {
      await cancelMutation.mutateAsync({ id: selectedOrder.id, reason: cancelReason });
      showSuccess('Başarılı', 'Sipariş iptal edildi');
      setCancelModalOpen(false);
      setSelectedOrder(null);
    } catch {
      showError('Sipariş iptal edilemedi');
    }
  };

  const handleDelete = async (order: SalesOrderListItem) => {
    const confirmed = await confirmDelete('Sipariş', order.orderNumber);
    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(order.id);
        showSuccess('Başarılı', 'Sipariş silindi');
      } catch {
        showError('Sipariş silinemedi');
      }
    }
  };

  // Bulk operations
  const handleBulkPdfExport = async () => {
    if (selectedRowKeys.length === 0) {
      showWarning('Uyarı', 'Lütfen PDF oluşturmak için sipariş seçiniz');
      return;
    }
    setBulkLoading(true);
    try {
      for (const id of selectedRowKeys) {
        const order = await SalesService.getOrderById(id);
        await generateSalesOrderPDF(order);
      }
      showSuccess('Başarılı', `${selectedRowKeys.length} sipariş PDF olarak indirildi`);
    } catch {
      showError('PDF oluşturulurken hata oluştu');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    const draftOrders = selectedRowKeys.filter(id => {
      const order = orders.find(o => o.id === id);
      return order?.status === 'Draft';
    });

    if (draftOrders.length === 0) {
      showWarning('Uyarı', 'Seçili siparişler arasında onaylanabilecek taslak sipariş bulunamadı');
      return;
    }

    const confirmed = await confirmAction(
      'Toplu Sipariş Onaylama',
      `${draftOrders.length} adet taslak sipariş onaylanacak. Devam etmek istiyor musunuz?`,
      'Onayla'
    );

    if (confirmed) {
      setBulkLoading(true);
      let successCount = 0;
      try {
        for (const id of draftOrders) {
          try {
            await approveMutation.mutateAsync(id);
            successCount++;
          } catch {
            // Continue with others
          }
        }
        showSuccess('Başarılı', `${successCount} sipariş başarıyla onaylandı`);
        setSelectedRowKeys([]);
        refetch();
      } finally {
        setBulkLoading(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    const deletableOrders = selectedRowKeys.filter(id => {
      const order = orders.find(o => o.id === id);
      return order?.status === 'Draft';
    });

    if (deletableOrders.length === 0) {
      showWarning('Uyarı', 'Seçili siparişler arasında silinebilecek sipariş bulunamadı (sadece taslak siparişler silinebilir)');
      return;
    }

    const confirmed = await confirmDelete('Sipariş', `${deletableOrders.length} sipariş`);
    if (confirmed) {
      setBulkLoading(true);
      let successCount = 0;
      try {
        for (const id of deletableOrders) {
          try {
            await deleteMutation.mutateAsync(id);
            successCount++;
          } catch {
            // Continue with others
          }
        }
        showSuccess('Başarılı', `${successCount} sipariş başarıyla silindi`);
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

  const columns: ColumnsType<SalesOrderListItem> = [
    {
      title: 'Sipariş',
      key: 'order',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: statusConfig[record.status]?.bgColor || '#64748b15' }}
          >
            <ShoppingCartOutlined style={{ color: statusConfig[record.status]?.color || '#64748b' }} />
          </div>
          <div>
            <div
              className="text-sm font-medium text-slate-900 cursor-pointer hover:text-indigo-600"
              onClick={() => router.push(`/sales/orders/${record.id}`)}
            >
              {record.orderNumber}
            </div>
            <div className="text-xs text-slate-500">
              {record.customerName}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 120,
      render: (date: string) => (
        <div className="text-sm text-slate-600">
          {dayjs(date).format('DD.MM.YYYY')}
        </div>
      ),
      sorter: true,
    },
    {
      title: 'Teslim Tarihi',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: 120,
      render: (date: string | null) => (
        <div className="text-sm text-slate-600">
          {date ? dayjs(date).format('DD.MM.YYYY') : '-'}
        </div>
      ),
    },
    {
      title: 'Kalem',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 80,
      align: 'center',
      render: (count: number) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
          {count}
        </span>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      width: 140,
      align: 'right',
      render: (amount: number, record) => (
        <div className="text-sm font-medium text-slate-900">
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: record.currency }).format(amount)}
        </div>
      ),
      sorter: true,
    },
    {
      title: 'Temsilci',
      dataIndex: 'salesPersonName',
      key: 'salesPersonName',
      width: 150,
      render: (name: string | null) => (
        <div className="text-sm text-slate-600">{name || '-'}</div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: statusOptions.map((s) => ({ text: s.label, value: s.value })),
      render: (status: SalesOrderStatus) => (
        <Tag color={statusConfig[status]?.color === '#10b981' ? 'green' :
                    statusConfig[status]?.color === '#ef4444' ? 'red' :
                    statusConfig[status]?.color === '#3b82f6' ? 'blue' :
                    statusConfig[status]?.color === '#06b6d4' ? 'cyan' :
                    statusConfig[status]?.color === '#8b5cf6' ? 'purple' :
                    statusConfig[status]?.color === '#6366f1' ? 'geekblue' : 'default'}>
          {statusConfig[status]?.label}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'Görüntüle',
            onClick: () => router.push(`/sales/orders/${record.id}`),
          },
        ];

        if (record.status === 'Draft') {
          menuItems.push(
            {
              key: 'edit',
              icon: <EditOutlined />,
              label: 'Düzenle',
              onClick: () => router.push(`/sales/orders/${record.id}/edit`),
            },
            {
              key: 'approve',
              icon: <CheckOutlined />,
              label: 'Onayla',
              onClick: () => handleApprove(record.id),
            },
            { type: 'divider' },
            {
              key: 'delete',
              icon: <DeleteOutlined />,
              label: 'Sil',
              danger: true,
              onClick: () => handleDelete(record),
            }
          );
        }

        if (record.status !== 'Cancelled' && record.status !== 'Completed') {
          menuItems.push({
            key: 'cancel',
            icon: <CloseOutlined />,
            label: 'İptal Et',
            danger: true,
            onClick: () => handleCancelClick(record),
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

  const handleTableChange = (pagination: any, tableFilters: any, sorter: any) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
      status: tableFilters.status?.[0],
      sortBy: sorter.field,
      sortDescending: sorter.order === 'descend',
    }));
  };

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
              <ShoppingCartOutlined style={{ color: '#6366f1' }} />
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
              <span className="text-xs text-slate-500 uppercase tracking-wide">İşlemde</span>
              <div className="text-2xl font-semibold text-slate-900">{stats.pending}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <CheckCircleOutlined style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Tutar</span>
              <div className="text-2xl font-semibold text-slate-900">
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(stats.totalValue)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <DollarOutlined style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<ShoppingCartOutlined />}
        iconColor="#6366f1"
        title="Siparişler"
        description="Satış siparişlerini yönetin"
        itemCount={data?.totalCount ?? 0}
        primaryAction={{
          label: 'Yeni Sipariş',
          onClick: () => router.push('/sales/orders/new'),
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
              {selectedRowKeys.length} sipariş seçildi
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkPdfExport}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                <FilePdfOutlined />
                PDF İndir
              </button>
              <button
                onClick={handleBulkApprove}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                <CheckOutlined />
                Onayla
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
            placeholder="Sipariş ara..."
            prefix={<SearchOutlined className="text-slate-400" />}
            allowClear
            style={{ maxWidth: 300 }}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchTerm: e.target.value, page: 1 }))
            }
            className="h-10"
          />
          <Select
            placeholder="Durum seçin"
            allowClear
            style={{ width: 180 }}
            options={statusOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value, page: 1 }))}
          />
          <RangePicker
            style={{ width: 280 }}
            placeholder={['Başlangıç', 'Bitiş']}
            onChange={(dates) =>
              setFilters((prev) => ({
                ...prev,
                fromDate: dates?.[0]?.toISOString(),
                toDate: dates?.[1]?.toISOString(),
                page: 1,
              }))
            }
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
            dataSource={orders}
            rowKey="id"
            loading={isLoading}
            onChange={handleTableChange}
            scroll={{ x: 1100 }}
            pagination={{
              current: filters.page,
              pageSize: filters.pageSize,
              total: data?.totalCount ?? 0,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} sipariş`,
            }}
          />
        </DataTableWrapper>
      )}

      {/* Cancel Modal */}
      <Modal
        title="Siparişi İptal Et"
        open={cancelModalOpen}
        onOk={handleCancelConfirm}
        onCancel={() => setCancelModalOpen(false)}
        okText="İptal Et"
        okType="danger"
        cancelText="Vazgeç"
        confirmLoading={cancelMutation.isPending}
      >
        <div className="mb-4">
          <p className="text-sm text-slate-600">
            <strong className="text-slate-900">{selectedOrder?.orderNumber}</strong> numaralı siparişi iptal etmek üzeresiniz.
          </p>
        </div>
        <Input.TextArea
          placeholder="İptal sebebini giriniz..."
          rows={4}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>
    </PageContainer>
  );
}
