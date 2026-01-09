'use client';

/**
 * Stock Counts Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Modal,
  Dropdown,
  Select,
  DatePicker,
  Progress,
  message,
  Spin,
  Button,
  Space,
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
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  useStockCounts,
  useWarehouses,
  useStartStockCount,
  useCompleteStockCount,
  useApproveStockCount,
  useCancelStockCount,
} from '@/lib/api/hooks/useInventory';
import { StockCountStatus, StockCountType } from '@/lib/api/services/inventory.types';
import type { StockCountListDto } from '@/lib/api/services/inventory.types';
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

const { RangePicker } = DatePicker;

// Monochrome status configuration
const statusConfig: Record<StockCountStatus, { bgColor: string; textColor: string; label: string; icon: React.ReactNode }> = {
  [StockCountStatus.Draft]: { bgColor: 'bg-slate-200', textColor: 'text-slate-700', label: 'Taslak', icon: <ClockIcon className="w-3.5 h-3.5" /> },
  [StockCountStatus.InProgress]: { bgColor: 'bg-slate-400', textColor: 'text-white', label: 'Devam Ediyor', icon: <PlayCircleIcon className="w-3.5 h-3.5" /> },
  [StockCountStatus.Completed]: { bgColor: 'bg-slate-700', textColor: 'text-white', label: 'Tamamlandı', icon: <CheckCircleIcon className="w-3.5 h-3.5" /> },
  [StockCountStatus.Approved]: { bgColor: 'bg-slate-900', textColor: 'text-white', label: 'Onaylandı', icon: <CheckCircleIcon className="w-3.5 h-3.5" /> },
  [StockCountStatus.Rejected]: { bgColor: 'bg-slate-500', textColor: 'text-white', label: 'Reddedildi', icon: <XCircleIcon className="w-3.5 h-3.5" /> },
  [StockCountStatus.Adjusted]: { bgColor: 'bg-slate-600', textColor: 'text-white', label: 'Düzeltildi', icon: <DocumentMagnifyingGlassIcon className="w-3.5 h-3.5" /> },
  [StockCountStatus.Cancelled]: { bgColor: 'bg-slate-300', textColor: 'text-slate-600', label: 'İptal', icon: <XCircleIcon className="w-3.5 h-3.5" /> },
};

// Count type configuration
const typeConfig: Record<StockCountType, { label: string }> = {
  [StockCountType.Full]: { label: 'Tam Sayım' },
  [StockCountType.Cycle]: { label: 'Döngüsel Sayım' },
  [StockCountType.Spot]: { label: 'Spot Sayım' },
  [StockCountType.Annual]: { label: 'Yıllık Sayım' },
  [StockCountType.Category]: { label: 'Kategori Sayımı' },
  [StockCountType.Location]: { label: 'Lokasyon Sayımı' },
  [StockCountType.ABC]: { label: 'ABC Sayımı' },
  [StockCountType.Perpetual]: { label: 'Sürekli Sayım' },
};

export default function StockCountsPage() {
  const router = useRouter();

  // Filters
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<StockCountStatus | undefined>();
  const [selectedType, setSelectedType] = useState<StockCountType | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // API Hooks
  const { data: warehouses = [] } = useWarehouses();
  const { data: stockCounts = [], isLoading, refetch } = useStockCounts(
    selectedWarehouse,
    selectedStatus,
    dateRange?.[0]?.toISOString(),
    dateRange?.[1]?.toISOString()
  );

  const startCount = useStartStockCount();
  const completeCount = useCompleteStockCount();
  const approveCount = useApproveStockCount();
  const cancelCount = useCancelStockCount();

  // Bulk selection
  const bulkSelection = useBulkSelection({
    items: stockCounts,
    getItemId: (count) => count.id,
  });

  // Filter by type (client-side since API might not support it)
  const filteredCounts = selectedType
    ? stockCounts.filter((c) => c.countType === selectedType)
    : stockCounts;

  // Calculate stats
  const stats = {
    total: stockCounts.length,
    draft: stockCounts.filter((c) => c.status === StockCountStatus.Draft).length,
    inProgress: stockCounts.filter((c) => c.status === StockCountStatus.InProgress).length,
    completed: stockCounts.filter((c) => c.status === StockCountStatus.Completed).length,
    approved: stockCounts.filter((c) => c.status === StockCountStatus.Approved).length,
  };

  // Get current filters for SavedFiltersDropdown
  const currentFilters = {
    warehouseId: selectedWarehouse,
    status: selectedStatus,
    countType: selectedType,
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

    if (filters.countType) {
      setSelectedType(filters.countType as StockCountType);
    }

    if (filters.warehouseId) {
      setSelectedWarehouse(filters.warehouseId as number);
    }
  };

  // Clear filters
  const handleClearFilter = () => {
    setSelectedWarehouse(undefined);
    setSelectedStatus(undefined);
    setSelectedType(undefined);
    setDateRange(null);
  };

  // Bulk action handlers
  const handleBulkStart = async () => {
    const draftItems = bulkSelection.selectedItems.filter((c) => c.status === StockCountStatus.Draft);
    for (const count of draftItems) {
      try {
        await startCount.mutateAsync({ id: count.id, countedByUserId: 1 });
      } catch (error) {
        // Continue with next item
      }
    }
    bulkSelection.clear();
    message.success(`${draftItems.length} sayım başlatıldı`);
  };

  const handleBulkComplete = async () => {
    const inProgressItems = bulkSelection.selectedItems.filter(
      (c) => c.status === StockCountStatus.InProgress
    );
    for (const count of inProgressItems) {
      try {
        await completeCount.mutateAsync(count.id);
      } catch (error) {
        // Continue with next item
      }
    }
    bulkSelection.clear();
    message.success(`${inProgressItems.length} sayım tamamlandı`);
  };

  const handleBulkApprove = async () => {
    const completedItems = bulkSelection.selectedItems.filter(
      (c) => c.status === StockCountStatus.Completed
    );
    for (const count of completedItems) {
      try {
        await approveCount.mutateAsync({ id: count.id, approvedByUserId: 1 });
      } catch (error) {
        // Continue with next item
      }
    }
    bulkSelection.clear();
    message.success(`${completedItems.length} sayım onaylandı`);
  };

  const handleBulkCancel = async () => {
    const cancellableItems = bulkSelection.selectedItems.filter(
      (c) => c.status === StockCountStatus.Draft || c.status === StockCountStatus.InProgress
    );
    for (const count of cancellableItems) {
      try {
        await cancelCount.mutateAsync({ id: count.id, reason: 'Toplu iptal işlemi' });
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
          { label: 'Toplam Sayım', value: stats.total },
          { label: 'Devam Eden', value: stats.inProgress },
          { label: 'Tamamlanan', value: stats.completed },
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
          { label: 'Toplam Sayım', value: stats.total },
          { label: 'Devam Eden', value: stats.inProgress },
          { label: 'Tamamlanan', value: stats.completed },
        ],
      },
    });
  };

  // Handlers
  const handleView = (id: number) => {
    router.push(`/inventory/stock-counts/${id}`);
  };

  const handleStart = async (count: StockCountListDto) => {
    Modal.confirm({
      title: 'Sayımı Başlat',
      content: `"${count.countNumber}" sayımını başlatmak istediğinizden emin misiniz?`,
      okText: 'Başlat',
      cancelText: 'İptal',
      okButtonProps: { className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: async () => {
        try {
          await startCount.mutateAsync({ id: count.id, countedByUserId: 1 });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleComplete = async (count: StockCountListDto) => {
    Modal.confirm({
      title: 'Sayımı Tamamla',
      content: `"${count.countNumber}" sayımını tamamlamak istediğinizden emin misiniz?`,
      okText: 'Tamamla',
      cancelText: 'İptal',
      okButtonProps: { className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: async () => {
        try {
          await completeCount.mutateAsync(count.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleApprove = async (count: StockCountListDto) => {
    Modal.confirm({
      title: 'Sayımı Onayla',
      content: `"${count.countNumber}" sayımını onaylamak istediğinizden emin misiniz? Bu işlem stok miktarlarını güncelleyecektir.`,
      okText: 'Onayla',
      cancelText: 'İptal',
      okButtonProps: { className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: async () => {
        try {
          await approveCount.mutateAsync({ id: count.id, approvedByUserId: 1 });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleCancel = async (count: StockCountListDto) => {
    Modal.confirm({
      title: 'Sayımı İptal Et',
      content: `"${count.countNumber}" sayımını iptal etmek istediğinizden emin misiniz?`,
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await cancelCount.mutateAsync({ id: count.id, reason: 'Kullanıcı tarafından iptal edildi' });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  // Get action items based on status
  const getActionItems = (count: StockCountListDto) => {
    const items: any[] = [
      {
        key: 'view',
        icon: <EyeIcon className="w-4 h-4" />,
        label: 'Görüntüle',
        onClick: () => handleView(count.id),
      },
    ];

    switch (count.status) {
      case StockCountStatus.Draft:
        items.push(
          {
            key: 'start',
            icon: <PlayCircleIcon className="w-4 h-4" />,
            label: 'Başlat',
            onClick: () => handleStart(count),
          },
          {
            key: 'edit',
            icon: <PencilIcon className="w-4 h-4" />,
            label: 'Düzenle',
            onClick: () => router.push(`/inventory/stock-counts/${count.id}/edit`),
          },
          { type: 'divider' },
          {
            key: 'cancel',
            icon: <XCircleIcon className="w-4 h-4" />,
            label: 'İptal Et',
            danger: true,
            onClick: () => handleCancel(count),
          }
        );
        break;
      case StockCountStatus.InProgress:
        items.push(
          {
            key: 'complete',
            icon: <CheckCircleIcon className="w-4 h-4" />,
            label: 'Tamamla',
            onClick: () => handleComplete(count),
          },
          { type: 'divider' },
          {
            key: 'cancel',
            icon: <XCircleIcon className="w-4 h-4" />,
            label: 'İptal Et',
            danger: true,
            onClick: () => handleCancel(count),
          }
        );
        break;
      case StockCountStatus.Completed:
        items.push({
          key: 'approve',
          icon: <CheckCircleIcon className="w-4 h-4" />,
          label: 'Onayla',
          onClick: () => handleApprove(count),
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
      width: 140,
      render: (text, record) => (
        <button
          className="text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors"
          onClick={() => handleView(record.id)}
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
      render: (name) => <span className="text-sm text-slate-700">{name}</span>,
    },
    {
      title: 'Tür',
      dataIndex: 'countType',
      key: 'countType',
      width: 120,
      render: (type: StockCountType) => (
        <span className="text-sm text-slate-600">{typeConfig[type]?.label || type}</span>
      ),
    },
    {
      title: 'Tarih',
      key: 'dates',
      width: 140,
      render: (_, record) => (
        <div className="text-sm">
          <div className="text-slate-900">{dayjs(record.countDate).format('DD/MM/YYYY')}</div>
        </div>
      ),
    },
    {
      title: 'İlerleme',
      key: 'progress',
      width: 150,
      render: (_, record) => {
        const total = record.totalItems || 0;
        const counted = record.countedItems || 0;
        const percent = total > 0 ? Math.round((counted / total) * 100) : 0;
        return (
          <div style={{ width: 120 }}>
            <Progress
              percent={percent}
              size="small"
              format={() => `${counted}/${total}`}
              strokeColor="#475569"
              trailColor="#e2e8f0"
            />
          </div>
        );
      },
    },
    {
      title: 'Farklar',
      key: 'discrepancies',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const discrepancies = record.itemsWithDifference || 0;
        if (discrepancies === 0) {
          return <span className="text-sm text-slate-400">-</span>;
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-200 text-slate-700">
            <ExclamationCircleIcon className="w-3.5 h-3.5" />
            {discrepancies}
          </span>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: StockCountStatus) => {
        const config = statusConfig[status];
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {config.icon}
            {config.label}
          </span>
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
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stok Sayımları</h1>
          <p className="text-slate-500 mt-1">Stok sayımlarını yönetin ve izleyin</p>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            onClick={() => refetch()}
            className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
          >
            Yenile
          </Button>
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
            <Button
              icon={<ArrowDownTrayIcon className="w-4 h-4" />}
              className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
            >
              Dışa Aktar
            </Button>
          </Dropdown>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/inventory/stock-counts/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Sayım
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <DocumentMagnifyingGlassIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.draft}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Taslak</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-400 flex items-center justify-center">
              <PlayCircleIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.inProgress}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Devam Eden</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.completed}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Tamamlandı</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.approved}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Onaylandı</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <SavedFiltersDropdown
            entityType="stock-counts"
            currentFilters={currentFilters}
            onApplyFilter={handleApplyFilter}
            onClearFilter={handleClearFilter}
          />
          <Select
            placeholder="Depo"
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
            allowClear
            style={{ width: 180 }}
            options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Sayım Türü"
            value={selectedType}
            onChange={setSelectedType}
            allowClear
            style={{ width: 150 }}
            options={Object.entries(typeConfig).map(([key, value]) => ({
              value: key,
              label: value.label,
            }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Durum"
            value={selectedStatus}
            onChange={setSelectedStatus}
            allowClear
            style={{ width: 160 }}
            options={Object.entries(statusConfig).map(([key, value]) => ({
              value: key,
              label: value.label,
            }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ width: 280 }}
            placeholder={['Başlangıç', 'Bitiş']}
            className="!rounded-lg [&_.ant-picker]:!border-slate-300"
          />
          <Button
            onClick={handleClearFilter}
            className="!border-slate-300 !text-slate-600 hover:!border-slate-400"
          >
            Temizle
          </Button>
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
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredCounts}
            rowKey="id"
            loading={isLoading}
            rowSelection={{
              selectedRowKeys: Array.from(bulkSelection.selectedIds),
              onChange: (selectedRowKeys) => {
                bulkSelection.clear();
                selectedRowKeys.forEach((key) => bulkSelection.select(key as string | number));
              },
              getCheckboxProps: (record) => ({
                disabled: record.status === StockCountStatus.Approved || record.status === StockCountStatus.Cancelled,
              }),
            }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} sayım`,
            }}
            scroll={{ x: 1100 }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        )}
      </div>
    </div>
  );
}
