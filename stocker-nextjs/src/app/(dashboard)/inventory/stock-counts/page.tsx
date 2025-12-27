'use client';

/**
 * Stock Counts List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Modal,
  Dropdown,
  Select,
  DatePicker,
  Progress,
  message,
  Spin,
} from 'antd';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  DocumentIcon,
  DocumentMagnifyingGlassIcon,
  EllipsisHorizontalIcon,
  ExclamationCircleIcon,
  EyeIcon,
  PencilIcon,
  PlayCircleIcon,
  PlusIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useStockCounts,
  useWarehouses,
  useStartStockCount,
  useCompleteStockCount,
  useApproveStockCount,
  useCancelStockCount,
} from '@/lib/api/hooks/useInventory';
import type { StockCountListDto, StockCountStatus, StockCountType } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  exportToPDF,
  exportToExcel,
  stockCountColumns,
  stockCountStatusLabels,
  stockCountTypeLabels,
} from '@/lib/utils/export-utils';
import SavedFiltersDropdown from '@/components/inventory/SavedFiltersDropdown';
import { resolveDatePreset } from '@/hooks/useSavedFilters';
import BulkActionsBar, { createCountBulkActions } from '@/components/inventory/BulkActionsBar';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';

const { RangePicker } = DatePicker;

// Stock count status configuration
const statusConfig: Record<StockCountStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Draft: { color: 'default', label: 'Taslak', icon: <PencilIcon className="w-4 h-4" /> },
  InProgress: { color: 'processing', label: 'Devam Ediyor', icon: <PlayCircleIcon className="w-4 h-4" /> },
  Completed: { color: 'blue', label: 'Tamamlandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Approved: { color: 'green', label: 'Onaylandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Rejected: { color: 'red', label: 'Reddedildi', icon: <XCircleIcon className="w-4 h-4" /> },
  Adjusted: { color: 'purple', label: 'Düzeltildi', icon: <ExclamationCircleIcon className="w-4 h-4" /> },
  Cancelled: { color: 'red', label: 'İptal', icon: <XCircleIcon className="w-4 h-4" /> },
};

// Stock count type configuration
const typeConfig: Record<StockCountType, { color: string; label: string }> = {
  Full: { color: 'blue', label: 'Tam Sayım' },
  Cycle: { color: 'cyan', label: 'Döngüsel' },
  Spot: { color: 'orange', label: 'Ani Sayım' },
  Annual: { color: 'purple', label: 'Yıllık' },
  Category: { color: 'green', label: 'Kategori' },
  Location: { color: 'gold', label: 'Lokasyon' },
  ABC: { color: 'magenta', label: 'ABC Analizi' },
  Perpetual: { color: 'geekblue', label: 'Sürekli' },
};

export default function StockCountsPage() {
  const router = useRouter();

  // Filters
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<StockCountStatus | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // API Hooks
  const { data: warehouses = [] } = useWarehouses();
  const { data: stockCounts = [], isLoading, refetch } = useStockCounts(
    selectedWarehouse,
    selectedStatus,
    dateRange?.[0]?.toISOString(),
    dateRange?.[1]?.toISOString()
  );

  const startStockCount = useStartStockCount();
  const completeStockCount = useCompleteStockCount();
  const approveStockCount = useApproveStockCount();
  const cancelStockCount = useCancelStockCount();

  // Bulk selection
  const bulkSelection = useBulkSelection({
    items: stockCounts,
    getItemId: (count) => count.id,
  });

  // Calculate stats
  const totalCounts = stockCounts.length;
  const inProgressCounts = stockCounts.filter((c) => c.status === 'InProgress').length;
  const completedCounts = stockCounts.filter((c) => c.status === 'Completed' || c.status === 'Approved').length;
  const totalDifferences = stockCounts.reduce((sum, c) => sum + (c.itemsWithDifference || 0), 0);

  // Get current filters for SavedFiltersDropdown
  const currentFilters = {
    warehouseId: selectedWarehouse,
    status: selectedStatus,
    dateRange: dateRange ? {
      start: dateRange[0]?.toISOString(),
      end: dateRange[1]?.toISOString(),
    } : undefined,
  };

  // Apply saved filter
  const handleApplyFilter = (filters: Record<string, unknown>) => {
    if (filters.datePreset) {
      const resolved = resolveDatePreset(filters.datePreset as string);
      if (resolved) {
        setDateRange([dayjs(resolved.start), dayjs(resolved.end)]);
      }
    } else if (filters.dateRange) {
      const dr = filters.dateRange as { start?: string; end?: string };
      setDateRange([
        dr.start ? dayjs(dr.start) : null,
        dr.end ? dayjs(dr.end) : null,
      ]);
    }

    if (filters.status) {
      setSelectedStatus(filters.status as StockCountStatus);
    }

    if (filters.warehouseId) {
      setSelectedWarehouse(filters.warehouseId as number);
    }
  };

  // Clear filters
  const handleClearFilter = () => {
    setSelectedWarehouse(undefined);
    setSelectedStatus(undefined);
    setDateRange(null);
  };

  // Bulk action handlers
  const handleBulkStart = async () => {
    const draftItems = bulkSelection.selectedItems.filter((c) => c.status === 'Draft');
    for (const count of draftItems) {
      try {
        await startStockCount.mutateAsync({ id: count.id, countedByUserId: 1 });
      } catch (error) {
        // Continue with next item
      }
    }
    bulkSelection.clear();
    message.success(`${draftItems.length} sayım başlatıldı`);
  };

  const handleBulkComplete = async () => {
    const inProgressItems = bulkSelection.selectedItems.filter((c) => c.status === 'InProgress');
    for (const count of inProgressItems) {
      try {
        await completeStockCount.mutateAsync(count.id);
      } catch (error) {
        // Continue with next item
      }
    }
    bulkSelection.clear();
    message.success(`${inProgressItems.length} sayım tamamlandı`);
  };

  const handleBulkApprove = async () => {
    const completedItems = bulkSelection.selectedItems.filter((c) => c.status === 'Completed');
    for (const count of completedItems) {
      try {
        await approveStockCount.mutateAsync({ id: count.id, approvedByUserId: 1 });
      } catch (error) {
        // Continue with next item
      }
    }
    bulkSelection.clear();
    message.success(`${completedItems.length} sayım onaylandı`);
  };

  const handleBulkCancel = async () => {
    const cancellableItems = bulkSelection.selectedItems.filter(
      (c) => c.status === 'Draft' || c.status === 'InProgress'
    );
    for (const count of cancellableItems) {
      try {
        await cancelStockCount.mutateAsync({ id: count.id, reason: 'Toplu iptal işlemi' });
      } catch (error) {
        // Continue with next item
      }
    }
    bulkSelection.clear();
    message.success(`${cancellableItems.length} sayım iptal edildi`);
  };

  // Bulk export selected
  const handleExportSelected = (format: 'pdf' | 'excel') => {
    const exportData = bulkSelection.selectedItems.map((c) => ({
      ...c,
      status: stockCountStatusLabels[c.status] || c.status,
      countType: stockCountTypeLabels[c.countType] || c.countType,
    }));

    if (format === 'pdf') {
      exportToPDF({
        columns: stockCountColumns,
        data: exportData,
        options: {
          title: 'Seçili Stok Sayımları',
          filename: `secili-sayimlar-${dayjs().format('YYYY-MM-DD')}`,
          summaryData: [{ label: 'Seçili Sayım', value: exportData.length }],
        },
      });
    } else {
      exportToExcel({
        columns: stockCountColumns,
        data: exportData,
        options: {
          title: 'Seçili Stok Sayımları',
          filename: `secili-sayimlar-${dayjs().format('YYYY-MM-DD')}`,
          summaryData: [{ label: 'Seçili Sayım', value: exportData.length }],
        },
      });
    }
  };

  // Bulk actions
  const bulkActions = createCountBulkActions(
    handleBulkStart,
    handleBulkComplete,
    handleBulkApprove,
    handleBulkCancel
  );

  // Export handlers
  const handleExportPDF = () => {
    if (stockCounts.length === 0) {
      Modal.warning({ title: 'Uyarı', content: 'Dışa aktarılacak sayım bulunamadı' });
      return;
    }

    const exportData = stockCounts.map((c) => ({
      ...c,
      status: stockCountStatusLabels[c.status] || c.status,
      countType: stockCountTypeLabels[c.countType] || c.countType,
    }));

    exportToPDF({
      columns: stockCountColumns,
      data: exportData,
      options: {
        title: 'Stok Sayımları Raporu',
        filename: `stok-sayimlari-${dayjs().format('YYYY-MM-DD')}`,
        subtitle: dateRange
          ? `${dayjs(dateRange[0]).format('DD/MM/YYYY')} - ${dayjs(dateRange[1]).format('DD/MM/YYYY')}`
          : undefined,
        summaryData: [
          { label: 'Toplam Sayım', value: totalCounts },
          { label: 'Devam Eden', value: inProgressCounts },
          { label: 'Tamamlanan', value: completedCounts },
          { label: 'Farklı Kalem', value: totalDifferences },
        ],
      },
    });
  };

  const handleExportExcel = () => {
    if (stockCounts.length === 0) {
      Modal.warning({ title: 'Uyarı', content: 'Dışa aktarılacak sayım bulunamadı' });
      return;
    }

    const exportData = stockCounts.map((c) => ({
      ...c,
      status: stockCountStatusLabels[c.status] || c.status,
      countType: stockCountTypeLabels[c.countType] || c.countType,
    }));

    exportToExcel({
      columns: stockCountColumns,
      data: exportData,
      options: {
        title: 'Stok Sayımları',
        filename: `stok-sayimlari-${dayjs().format('YYYY-MM-DD')}`,
        summaryData: [
          { label: 'Toplam Sayım', value: totalCounts },
          { label: 'Devam Eden', value: inProgressCounts },
          { label: 'Tamamlanan', value: completedCounts },
          { label: 'Farklı Kalem', value: totalDifferences },
        ],
      },
    });
  };

  // Handlers
  const handleView = (id: number) => {
    router.push(`/inventory/stock-counts/${id}`);
  };

  const handleStart = async (stockCount: StockCountListDto) => {
    Modal.confirm({
      title: 'Sayımı Başlat',
      content: `"${stockCount.countNumber}" sayımını başlatmak istediğinizden emin misiniz?`,
      okText: 'Başlat',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await startStockCount.mutateAsync({ id: stockCount.id, countedByUserId: 1 });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleComplete = async (stockCount: StockCountListDto) => {
    Modal.confirm({
      title: 'Sayımı Tamamla',
      content: `"${stockCount.countNumber}" sayımını tamamlamak istediğinizden emin misiniz?`,
      okText: 'Tamamla',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await completeStockCount.mutateAsync(stockCount.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleApprove = async (stockCount: StockCountListDto) => {
    Modal.confirm({
      title: 'Sayımı Onayla',
      content: `"${stockCount.countNumber}" sayımını onaylamak istediğinizden emin misiniz? Bu işlem stok miktarlarını güncelleyecektir.`,
      okText: 'Onayla',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await approveStockCount.mutateAsync({ id: stockCount.id, approvedByUserId: 1 });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleCancel = async (stockCount: StockCountListDto) => {
    Modal.confirm({
      title: 'Sayımı İptal Et',
      content: `"${stockCount.countNumber}" sayımını iptal etmek istediğinizden emin misiniz?`,
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await cancelStockCount.mutateAsync({ id: stockCount.id, reason: 'Kullanıcı tarafından iptal edildi' });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  // Get action items based on status
  const getActionItems = (stockCount: StockCountListDto) => {
    const items: any[] = [
      {
        key: 'view',
        icon: <EyeIcon className="w-4 h-4" />,
        label: 'Görüntüle',
        onClick: () => handleView(stockCount.id),
      },
    ];

    switch (stockCount.status) {
      case 'Draft':
        items.push(
          {
            key: 'start',
            icon: <PlayCircleIcon className="w-4 h-4" />,
            label: 'Başlat',
            onClick: () => handleStart(stockCount),
          },
          {
            key: 'cancel',
            icon: <XCircleIcon className="w-4 h-4" />,
            label: 'İptal Et',
            onClick: () => handleCancel(stockCount),
          }
        );
        break;
      case 'InProgress':
        items.push(
          {
            key: 'complete',
            icon: <CheckCircleIcon className="w-4 h-4" />,
            label: 'Tamamla',
            onClick: () => handleComplete(stockCount),
          },
          {
            key: 'cancel',
            icon: <XCircleIcon className="w-4 h-4" />,
            label: 'İptal Et',
            onClick: () => handleCancel(stockCount),
          }
        );
        break;
      case 'Completed':
        items.push({
          key: 'approve',
          icon: <CheckCircleIcon className="w-4 h-4" />,
          label: 'Onayla',
          onClick: () => handleApprove(stockCount),
        });
        break;
    }

    return items;
  };

  // Table columns
  const columns: ColumnsType<StockCountListDto> = [
    {
      title: 'Sayım No',
      dataIndex: 'countNumber',
      key: 'countNumber',
      width: 150,
      render: (text, record) => (
        <span
          className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800"
          onClick={() => handleView(record.id)}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'countDate',
      key: 'countDate',
      width: 120,
      render: (date) => (
        <span className="text-sm text-slate-600">
          {dayjs(date).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
      render: (name) => <span className="text-sm text-slate-900">{name}</span>,
    },
    {
      title: 'Konum',
      dataIndex: 'locationName',
      key: 'locationName',
      width: 120,
      render: (location) => (
        <span className="text-sm text-slate-600">{location || '-'}</span>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'countType',
      key: 'countType',
      width: 120,
      render: (type: StockCountType) => {
        const config = typeConfig[type];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'İlerleme',
      key: 'progress',
      width: 150,
      render: (_, record) => {
        const percent = record.totalItems > 0
          ? Math.round((record.countedItems / record.totalItems) * 100)
          : 0;
        return (
          <div style={{ width: 120 }}>
            <Progress percent={percent} size="small" />
            <span className="text-xs text-slate-500">
              {record.countedItems} / {record.totalItems}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Fark',
      dataIndex: 'itemsWithDifference',
      key: 'itemsWithDifference',
      width: 80,
      align: 'center',
      render: (diff) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
          diff > 0 ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
        }`}>
          {diff || 0}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: StockCountStatus) => {
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown menu={{ items: getActionItems(record) }} trigger={['click']}>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Sayım</span>
              <div className="text-2xl font-semibold text-slate-900">{totalCounts}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <DocumentMagnifyingGlassIcon className="w-4 h-4 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Devam Eden</span>
              <div className={`text-2xl font-semibold ${inProgressCounts > 0 ? 'text-blue-600' : 'text-slate-900'}`}>
                {inProgressCounts}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: inProgressCounts > 0 ? '#3b82f615' : '#64748b15' }}>
              <PlayCircleIcon className="w-4 h-4" style={{ color: inProgressCounts > 0 ? '#3b82f6' : '#64748b' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Tamamlanan</span>
              <div className="text-2xl font-semibold text-slate-900">{completedCounts}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <CheckCircleIcon className="w-4 h-4" style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Fark</span>
              <div className={`text-2xl font-semibold ${totalDifferences > 0 ? 'text-orange-600' : 'text-slate-900'}`}>
                {totalDifferences}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: totalDifferences > 0 ? '#f9731615' : '#64748b15' }}>
              <ExclamationCircleIcon className="w-4 h-4" style={{ color: totalDifferences > 0 ? '#f97316' : '#64748b' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<DocumentMagnifyingGlassIcon className="w-4 h-4" />}
        iconColor="#3b82f6"
        title="Stok Sayımları"
        description="Envanter sayım işlemlerini yönetin"
        itemCount={stockCounts.length}
        primaryAction={{
          label: 'Yeni Sayım',
          onClick: () => router.push('/inventory/stock-counts/new'),
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <div className="flex items-center gap-2">
            <SavedFiltersDropdown
              entityType="stock-counts"
              currentFilters={currentFilters}
              onApplyFilter={handleApplyFilter}
              onClearFilter={handleClearFilter}
            />
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'pdf',
                    icon: <DocumentIcon className="w-4 h-4" />,
                    label: 'PDF İndir',
                    onClick: handleExportPDF,
                  },
                  {
                    key: 'excel',
                    icon: <DocumentIcon className="w-4 h-4" />,
                    label: 'Excel İndir',
                    onClick: handleExportExcel,
                  },
                ],
              }}
            >
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <ArrowDownTrayIcon className="w-4 h-4" />
                Dışa Aktar
              </button>
            </Dropdown>
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

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Select
            placeholder="Depo"
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
            allowClear
            style={{ width: 180 }}
            options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
          />
          <Select
            placeholder="Durum"
            value={selectedStatus}
            onChange={setSelectedStatus}
            allowClear
            style={{ width: 150 }}
            options={Object.entries(statusConfig).map(([key, value]) => ({
              value: key,
              label: value.label,
            }))}
          />
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ width: 280 }}
            placeholder={['Başlangıç', 'Bitiş']}
          />
          <button
            onClick={handleClearFilter}
            className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Temizle
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={bulkSelection.selectionCount}
        totalCount={stockCounts.length}
        actions={bulkActions}
        onClearSelection={bulkSelection.clear}
        onExportSelected={handleExportSelected}
      />

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
            columns={columns}
            dataSource={stockCounts}
            rowKey="id"
            loading={isLoading}
            rowSelection={{
              selectedRowKeys: Array.from(bulkSelection.selectedIds),
              onChange: (selectedRowKeys) => {
                bulkSelection.clear();
                selectedRowKeys.forEach((key) => bulkSelection.select(key as string | number));
              },
              getCheckboxProps: (record) => ({
                disabled: record.status === 'Approved' || record.status === 'Cancelled' || record.status === 'Adjusted',
              }),
            }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} sayım`,
            }}
            scroll={{ x: 1200 }}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
