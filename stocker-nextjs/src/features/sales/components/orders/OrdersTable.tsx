'use client';

/**
 * OrdersTable Component
 * Displays sales orders in a data table with actions
 * Feature-Based Architecture - Smart Component
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Select, DatePicker, Dropdown, Modal, Skeleton } from 'antd';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  DocumentIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { Card, DataTableWrapper, EmptyState } from '@/components/ui/enterprise-page';
import { OrderStatusBadge, orderStatusConfig } from './OrderStatusBadge';
import {
  useSalesOrders,
  useApproveSalesOrder,
  useCancelSalesOrder,
  useDeleteSalesOrder,
} from '../../hooks';
import { orderService } from '../../services/order.service';
import { generateSalesOrderPDF } from '@/lib/utils/pdf-export';
import { showSuccess, showError, showWarning, confirmDelete, confirmAction } from '@/lib/utils/sweetalert';
import type { SalesOrderListItem, GetSalesOrdersParams, SalesOrderStatus } from '../../types';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface OrdersTableProps {
  initialParams?: GetSalesOrdersParams;
  onParamsChange?: (params: GetSalesOrdersParams) => void;
  showFilters?: boolean;
  showBulkActions?: boolean;
}

const statusOptions = Object.entries(orderStatusConfig).map(([value, config]) => ({
  value,
  label: config.label,
}));

export function OrdersTable({
  initialParams = { page: 1, pageSize: 10 },
  onParamsChange,
  showFilters = true,
  showBulkActions = true,
}: OrdersTableProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<GetSalesOrdersParams>(initialParams);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SalesOrderListItem | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const { data, isLoading, isError, error, refetch } = useSalesOrders(filters);
  const approveMutation = useApproveSalesOrder();
  const cancelMutation = useCancelSalesOrder();
  const deleteMutation = useDeleteSalesOrder();

  const orders = data?.items ?? [];

  const updateFilters = (newFilters: Partial<GetSalesOrdersParams>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onParamsChange?.(updated);
  };

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

  const handleBulkPdfExport = async () => {
    if (selectedRowKeys.length === 0) {
      showWarning('Uyarı', 'Lütfen PDF oluşturmak için sipariş seçiniz');
      return;
    }
    setBulkLoading(true);
    try {
      for (const id of selectedRowKeys) {
        const order = await orderService.getOrderById(id);
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
    const draftOrders = selectedRowKeys.filter((id) => {
      const order = orders.find((o) => o.id === id);
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
    const deletableOrders = selectedRowKeys.filter((id) => {
      const order = orders.find((o) => o.id === id);
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

  const columns: ColumnsType<SalesOrderListItem> = [
    {
      title: 'Sipariş',
      key: 'order',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: orderStatusConfig[record.status as SalesOrderStatus]?.bgColor || '#64748b15' }}
          >
            <ShoppingCartIcon className="w-4 h-4" style={{ color: orderStatusConfig[record.status as SalesOrderStatus]?.color || '#64748b' }} />
          </div>
          <div>
            <div
              className="text-sm font-medium text-slate-900 cursor-pointer hover:text-indigo-600"
              onClick={() => router.push(`/sales/orders/${record.id}`)}
            >
              {record.orderNumber}
            </div>
            <div className="text-xs text-slate-500">{record.customerName}</div>
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
        <div className="text-sm text-slate-600">{dayjs(date).format('DD.MM.YYYY')}</div>
      ),
      sorter: true,
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
      dataIndex: 'totalAmount',
      key: 'totalAmount',
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
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: statusOptions.map((s) => ({ text: s.label, value: s.value })),
      render: (status: SalesOrderStatus) => <OrderStatusBadge status={status} />,
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
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Görüntüle',
            onClick: () => router.push(`/sales/orders/${record.id}`),
          },
        ];

        if (record.status === 'Draft') {
          menuItems.push(
            {
              key: 'edit',
              icon: <PencilIcon className="w-4 h-4" />,
              label: 'Düzenle',
              onClick: () => router.push(`/sales/orders/${record.id}/edit`),
            },
            {
              key: 'approve',
              icon: <CheckIcon className="w-4 h-4" />,
              label: 'Onayla',
              onClick: () => handleApprove(record.id),
            },
            { type: 'divider' },
            {
              key: 'delete',
              icon: <TrashIcon className="w-4 h-4" />,
              label: 'Sil',
              danger: true,
              onClick: () => handleDelete(record),
            }
          );
        }

        if (record.status !== 'Cancelled' && record.status !== 'Completed') {
          menuItems.push({
            key: 'cancel',
            icon: <XMarkIcon className="w-4 h-4" />,
            label: 'İptal Et',
            danger: true,
            onClick: () => handleCancelClick(record),
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

  const handleTableChange = (pagination: any, tableFilters: any, sorter: any) => {
    updateFilters({
      page: pagination.current,
      pageSize: pagination.pageSize,
      status: tableFilters.status?.[0],
      sortBy: sorter.field,
      sortDescending: sorter.order === 'descend',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        {showFilters && (
          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton.Input active style={{ width: 300 }} />
              <Skeleton.Input active style={{ width: 180 }} />
              <Skeleton.Input active style={{ width: 280 }} />
            </div>
          </div>
        )}
        <Card>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton.Avatar active size="large" shape="square" />
                <div className="flex-1 space-y-2">
                  <Skeleton.Input active size="small" block />
                  <Skeleton.Input active size="small" style={{ width: '50%' }} />
                </div>
                <Skeleton.Input active size="small" style={{ width: 100 }} />
              </div>
            ))}
          </div>
        </Card>
      </>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <EmptyState
          icon={<ShoppingCartIcon className="w-6 h-6" />}
          title="Veriler yüklenemedi"
          description={error?.message || 'Siparişler yüklenirken bir hata oluştu'}
          action={{
            label: 'Tekrar Dene',
            onClick: () => refetch(),
          }}
        />
      </Card>
    );
  }

  // Empty state
  if (orders.length === 0 && !filters.searchTerm && !filters.status) {
    return (
      <Card>
        <EmptyState
          icon={<ShoppingCartIcon className="w-6 h-6" />}
          title="Henüz sipariş yok"
          description="İlk siparişinizi oluşturmak için 'Yeni Sipariş' butonuna tıklayın"
          action={{
            label: 'Yeni Sipariş Oluştur',
            onClick: () => router.push('/sales/orders/new'),
          }}
        />
      </Card>
    );
  }

  return (
    <>
      {/* Bulk Actions Bar */}
      {showBulkActions && selectedRowKeys.length > 0 && (
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
                <DocumentIcon className="w-4 h-4" />
                PDF İndir
              </button>
              <button
                onClick={handleBulkApprove}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                Onayla
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50"
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
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Sipariş ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              allowClear
              style={{ maxWidth: 300 }}
              onChange={(e) => updateFilters({ searchTerm: e.target.value, page: 1 })}
              className="h-10"
            />
            <Select
              placeholder="Durum seçin"
              allowClear
              style={{ width: 180 }}
              options={statusOptions}
              onChange={(value) => updateFilters({ status: value, page: 1 })}
            />
            <RangePicker
              style={{ width: 280 }}
              placeholder={['Başlangıç', 'Bitiş']}
              onChange={(dates) =>
                updateFilters({
                  fromDate: dates?.[0]?.toISOString(),
                  toDate: dates?.[1]?.toISOString(),
                  page: 1,
                })
              }
            />
          </div>
        </div>
      )}

      {/* Table */}
      <DataTableWrapper>
        <Table
          rowSelection={showBulkActions ? {
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as string[]),
          } : undefined}
          columns={columns}
          dataSource={orders}
          rowKey="id"
          onChange={handleTableChange}
          scroll={{ x: 900 }}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: data?.totalCount ?? 0,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} sipariş`,
          }}
        />
      </DataTableWrapper>

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
    </>
  );
}
