'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Input,
  Select,
  Button,
  Space,
  Dropdown,
  Progress,
  Empty,
} from 'antd';
import {
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  StopIcon,
  CogIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  useProductionOrders,
  useDeleteProductionOrder,
  useStartProductionOrder,
  useCompleteProductionOrder,
  useCancelProductionOrder,
} from '@/lib/api/hooks/useManufacturing';
import type { ProductionOrderListDto, ProductionOrderStatus, OrderPriority } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { confirmDelete } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';

// Status configuration - monochrome palette
const statusConfig: Record<number, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  0: { color: '#94a3b8', bgColor: '#f8fafc', label: 'Taslak', icon: <DocumentTextIcon className="w-3 h-3" /> },
  1: { color: '#64748b', bgColor: '#f1f5f9', label: 'Planlandı', icon: <ClockIcon className="w-3 h-3" /> },
  2: { color: '#475569', bgColor: '#e2e8f0', label: 'Onaylı', icon: <CheckCircleIcon className="w-3 h-3" /> },
  3: { color: '#334155', bgColor: '#cbd5e1', label: 'Serbest', icon: <PlayIcon className="w-3 h-3" /> },
  4: { color: '#1e293b', bgColor: '#94a3b8', label: 'Üretimde', icon: <CogIcon className="w-3 h-3" /> },
  5: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Tamamlandı', icon: <CheckCircleIcon className="w-3 h-3" /> },
  6: { color: '#475569', bgColor: '#e2e8f0', label: 'Kapatıldı', icon: <StopIcon className="w-3 h-3" /> },
  7: { color: '#ef4444', bgColor: '#fee2e2', label: 'İptal', icon: <XMarkIcon className="w-3 h-3" /> },
};

// Priority configuration
const priorityConfig: Record<OrderPriority, { color: string; bgColor: string; label: string }> = {
  Low: { color: '#64748b', bgColor: '#f1f5f9', label: 'Düşük' },
  Normal: { color: '#475569', bgColor: '#e2e8f0', label: 'Normal' },
  High: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Yüksek' },
  Urgent: { color: '#dc2626', bgColor: '#fee2e2', label: 'Acil' },
};

interface FilterState {
  searchText: string;
  status?: ProductionOrderStatus;
  priority?: OrderPriority;
}

const defaultFilters: FilterState = {
  searchText: '',
  status: undefined,
  priority: undefined,
};

export default function ProductionOrdersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.searchText]);

  // API Hooks
  const { data: orders = [], isLoading, refetch } = useProductionOrders({
    status: filters.status,
  });
  const deleteOrder = useDeleteProductionOrder();
  const startOrder = useStartProductionOrder();
  const completeOrder = useCompleteProductionOrder();
  const cancelOrder = useCancelProductionOrder();

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = !debouncedSearch ||
        order.orderNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        order.productName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        order.productCode.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesSearch;
    });
  }, [orders, debouncedSearch]);

  // Stats
  const stats = useMemo(() => ({
    total: orders.length,
    inProgress: orders.filter(o => o.status === 4).length,
    planned: orders.filter(o => o.status === 1 || o.status === 2).length,
    completed: orders.filter(o => o.status === 5 || o.status === 6).length,
  }), [orders]);

  const hasActiveFilters = useMemo(() => {
    return filters.searchText !== '' || filters.status !== undefined || filters.priority !== undefined;
  }, [filters]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  // Action handlers
  const handleView = (id: string) => {
    router.push(`/manufacturing/production-orders/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/manufacturing/production-orders/${id}/edit`);
  };

  const handleDelete = async (order: ProductionOrderListDto) => {
    const confirmed = await confirmDelete('Üretim Emri', order.orderNumber);
    if (confirmed) {
      try {
        await deleteOrder.mutateAsync(order.id);
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleStart = async (order: ProductionOrderListDto) => {
    try {
      await startOrder.mutateAsync({ id: order.id, data: {} });
    } catch {
      // Error handled by hook
    }
  };

  const handleComplete = async (order: ProductionOrderListDto) => {
    try {
      await completeOrder.mutateAsync({ id: order.id, data: { completedQuantity: order.plannedQuantity } });
    } catch {
      // Error handled by hook
    }
  };

  const handleCancel = async (order: ProductionOrderListDto) => {
    try {
      await cancelOrder.mutateAsync({ id: order.id, reason: 'İptal edildi' });
    } catch {
      // Error handled by hook
    }
  };

  // Table columns
  const columns: ColumnsType<ProductionOrderListDto> = [
    {
      title: 'Emir No',
      key: 'orderNumber',
      width: 160,
      render: (_, record) => (
        <div className="space-y-1">
          <span
            className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600"
            onClick={() => handleView(record.id)}
          >
            {record.orderNumber}
          </span>
          <div>
            {(() => {
              const config = priorityConfig[record.priority];
              return (
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: config.bgColor, color: config.color }}
                >
                  {config.label}
                </span>
              );
            })()}
          </div>
        </div>
      ),
    },
    {
      title: 'Ürün',
      key: 'product',
      width: 220,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.productName}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: ProductionOrderStatus) => {
        const config = statusConfig[status] || { color: '#64748b', bgColor: '#f1f5f9', label: 'Bilinmiyor', icon: null };
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.icon}
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Miktar',
      key: 'quantity',
      width: 160,
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-900">
              {record.completedQuantity}/{record.plannedQuantity}
            </span>
            <span className="text-xs text-slate-500">{record.unitOfMeasure}</span>
          </div>
          <Progress
            percent={record.progress}
            size="small"
            strokeColor="#1e293b"
            trailColor="#e2e8f0"
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: 'Planlanan Tarih',
      key: 'plannedDate',
      width: 160,
      render: (_, record) => (
        <div className="text-sm">
          <div className="text-slate-900">{dayjs(record.plannedStartDate).format('DD.MM.YYYY')}</div>
          <div className="text-xs text-slate-500">
            - {dayjs(record.plannedEndDate).format('DD.MM.YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Gerçekleşen',
      key: 'actualDate',
      width: 160,
      render: (_, record) => (
        record.actualStartDate ? (
          <div className="text-sm">
            <div className="text-slate-900">{dayjs(record.actualStartDate).format('DD.MM.YYYY')}</div>
            {record.actualEndDate && (
              <div className="text-xs text-slate-500">
                - {dayjs(record.actualEndDate).format('DD.MM.YYYY')}
              </div>
            )}
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        )
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Görüntüle',
            onClick: () => handleView(record.id),
          },
          {
            key: 'edit',
            icon: <PencilSquareIcon className="w-4 h-4" />,
            label: 'Düzenle',
            onClick: () => handleEdit(record.id),
            disabled: record.status >= 4,
          },
          { type: 'divider' as const },
        ];

        // Add status-specific actions
        if (record.status === 3) {
          menuItems.push({
            key: 'start',
            icon: <PlayIcon className="w-4 h-4" />,
            label: 'Başlat',
            onClick: () => handleStart(record),
          });
        }

        if (record.status === 4) {
          menuItems.push({
            key: 'complete',
            icon: <CheckCircleIcon className="w-4 h-4" />,
            label: 'Tamamla',
            onClick: () => handleComplete(record),
          });
        }

        if (record.status < 5) {
          menuItems.push({
            key: 'cancel',
            icon: <XMarkIcon className="w-4 h-4" />,
            label: 'İptal Et',
            danger: true,
            onClick: () => handleCancel(record),
          });
        }

        if (record.status === 0) {
          menuItems.push({ type: 'divider' as const });
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
            <Button
              type="text"
              icon={<EllipsisHorizontalIcon className="w-4 h-4" />}
              className="text-slate-600 hover:text-slate-900"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Üretim Emirleri</h1>
          <p className="text-slate-500 mt-1">Üretim süreçlerinizi yönetin ve takip edin</p>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            onClick={() => refetch()}
            loading={isLoading}
            className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/manufacturing/production-orders/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Emir
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Emir</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <CogIcon className="w-5 h-5 text-white animate-spin-slow" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.inProgress}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Üretimde</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.planned}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Planlandı</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.completed}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Tamamlandı</div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Input
            placeholder="Emir no, ürün adı veya kodu ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={filters.searchText}
            onChange={(e) => updateFilter('searchText', e.target.value)}
            allowClear
            style={{ width: 300 }}
            className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
          />
          <Select
            placeholder="Durum"
            value={filters.status}
            onChange={(v) => updateFilter('status', v)}
            allowClear
            style={{ width: 150 }}
            options={[
              { value: 0, label: 'Taslak' },
              { value: 1, label: 'Planlandı' },
              { value: 2, label: 'Onaylı' },
              { value: 3, label: 'Serbest' },
              { value: 4, label: 'Üretimde' },
              { value: 5, label: 'Tamamlandı' },
              { value: 6, label: 'Kapatıldı' },
              { value: 7, label: 'İptal' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Öncelik"
            value={filters.priority}
            onChange={(v) => updateFilter('priority', v)}
            allowClear
            style={{ width: 130 }}
            options={[
              { value: 'Low', label: 'Düşük' },
              { value: 'Normal', label: 'Normal' },
              { value: 'High', label: 'Yüksek' },
              { value: 'Urgent', label: 'Acil' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              icon={<XMarkIcon className="w-4 h-4" />}
              className="!border-slate-300 ml-auto"
            >
              Filtreleri Temizle
            </Button>
          )}
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1300 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredOrders.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} emir`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Üretim emri bulunamadı"
              />
            ),
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}
