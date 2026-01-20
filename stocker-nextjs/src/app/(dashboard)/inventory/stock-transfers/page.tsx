'use client';

/**
 * Stock Transfers Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Modal,
  Dropdown,
  Select,
  DatePicker,
  message,
  Spin,
  Button,
  Space,
} from 'antd';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  InboxIcon,
  PaperAirplaneIcon,
  PlusIcon,
  RocketLaunchIcon,
  TruckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { TableEmptyState } from '@/components/primitives';
import {
  useStockTransfers,
  useWarehouses,
  useSubmitStockTransfer,
  useApproveStockTransfer,
  useShipStockTransfer,
  useReceiveStockTransfer,
  useCancelStockTransfer,
} from '@/lib/api/hooks/useInventory';
import type { StockTransferListDto, TransferStatus } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  exportToPDF,
  exportToExcel,
  stockTransferColumns,
  transferStatusLabels,
  transferTypeLabels,
} from '@/lib/utils/export-utils';
import SavedFiltersDropdown from '@/components/inventory/SavedFiltersDropdown';
import { resolveDatePreset } from '@/hooks/useSavedFilters';
import BulkActionsBar, { createTransferBulkActions } from '@/components/inventory/BulkActionsBar';
import { useBulkSelection } from '@/hooks/useBulkSelection';

const { RangePicker } = DatePicker;

// Monochrome transfer status configuration
const statusConfig: Record<TransferStatus, { bgColor: string; textColor: string; label: string; icon: React.ReactNode }> = {
  Draft: { bgColor: 'bg-slate-100', textColor: 'text-slate-600', label: 'Taslak', icon: null },
  Pending: { bgColor: 'bg-slate-200', textColor: 'text-slate-700', label: 'Beklemede', icon: <ClockIcon className="w-3.5 h-3.5" /> },
  Approved: { bgColor: 'bg-slate-400', textColor: 'text-white', label: 'Onaylı', icon: <CheckCircleIcon className="w-3.5 h-3.5" /> },
  Rejected: { bgColor: 'bg-slate-300', textColor: 'text-slate-700', label: 'Reddedildi', icon: <XCircleIcon className="w-3.5 h-3.5" /> },
  InTransit: { bgColor: 'bg-slate-500', textColor: 'text-white', label: 'Yolda', icon: <RocketLaunchIcon className="w-3.5 h-3.5" /> },
  Received: { bgColor: 'bg-slate-600', textColor: 'text-white', label: 'Teslim Alındı', icon: <InboxIcon className="w-3.5 h-3.5" /> },
  PartiallyReceived: { bgColor: 'bg-slate-500', textColor: 'text-white', label: 'Kısmi Teslim', icon: <InboxIcon className="w-3.5 h-3.5" /> },
  Completed: { bgColor: 'bg-slate-900', textColor: 'text-white', label: 'Tamamlandı', icon: <CheckCircleIcon className="w-3.5 h-3.5" /> },
  Cancelled: { bgColor: 'bg-slate-300', textColor: 'text-slate-600', label: 'İptal', icon: <XCircleIcon className="w-3.5 h-3.5" /> },
};

// Transfer type labels
const typeLabels: Record<string, string> = {
  Standard: 'Standart',
  Urgent: 'Acil',
  Replenishment: 'İkmal',
  Return: 'İade',
  Internal: 'Dahili',
  CrossDock: 'Cross-Dock',
  Consolidation: 'Konsolidasyon',
};

export default function StockTransfersPage() {
  const router = useRouter();

  // Filters
  const [selectedSourceWarehouse, setSelectedSourceWarehouse] = useState<number | undefined>();
  const [selectedDestWarehouse, setSelectedDestWarehouse] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<TransferStatus | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // API Hooks
  const { data: warehouses = [] } = useWarehouses();
  const { data: transfers = [], isLoading, refetch } = useStockTransfers(
    selectedSourceWarehouse,
    selectedDestWarehouse,
    selectedStatus,
    dateRange?.[0]?.toISOString(),
    dateRange?.[1]?.toISOString()
  );

  const submitTransfer = useSubmitStockTransfer();
  const approveTransfer = useApproveStockTransfer();
  const shipTransfer = useShipStockTransfer();
  const receiveTransfer = useReceiveStockTransfer();
  const cancelTransfer = useCancelStockTransfer();

  // Bulk selection
  const bulkSelection = useBulkSelection({
    items: transfers,
    getItemId: (transfer) => transfer.id,
  });

  // Calculate stats
  const stats = {
    total: transfers.length,
    pending: transfers.filter((t) => t.status === 'Pending').length,
    inTransit: transfers.filter((t) => t.status === 'InTransit').length,
    completed: transfers.filter((t) => t.status === 'Completed').length,
  };

  // Get current filters for SavedFiltersDropdown
  const currentFilters = {
    sourceWarehouseId: selectedSourceWarehouse,
    destinationWarehouseId: selectedDestWarehouse,
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
      setSelectedStatus(filters.status as TransferStatus);
    }

    if (filters.sourceWarehouseId) {
      setSelectedSourceWarehouse(filters.sourceWarehouseId as number);
    }

    if (filters.destinationWarehouseId) {
      setSelectedDestWarehouse(filters.destinationWarehouseId as number);
    }
  };

  // Clear filters
  const handleClearFilter = () => {
    setSelectedSourceWarehouse(undefined);
    setSelectedDestWarehouse(undefined);
    setSelectedStatus(undefined);
    setDateRange(null);
  };

  // Bulk action handlers
  const handleBulkApprove = async () => {
    const pendingItems = bulkSelection.selectedItems.filter((t) => t.status === 'Pending');
    let successCount = 0;
    let failCount = 0;

    for (const transfer of pendingItems) {
      try {
        await approveTransfer.mutateAsync({ id: transfer.id, approvedByUserId: 1 });
        successCount++;
      } catch (error) {
        failCount++;
      }
    }
    bulkSelection.clear();

    if (failCount === 0) {
      message.success(`${successCount} transfer onaylandı`);
    } else if (successCount === 0) {
      message.error(`Transferler onaylanamadı`);
    } else {
      message.warning(`${successCount} transfer onaylandı, ${failCount} transfer başarısız`);
    }
  };

  const handleBulkShip = async () => {
    const approvedItems = bulkSelection.selectedItems.filter((t) => t.status === 'Approved');
    let successCount = 0;
    let failCount = 0;

    for (const transfer of approvedItems) {
      try {
        await shipTransfer.mutateAsync({ id: transfer.id, shippedByUserId: 1 });
        successCount++;
      } catch (error) {
        failCount++;
      }
    }
    bulkSelection.clear();

    if (failCount === 0) {
      message.success(`${successCount} transfer sevk edildi`);
    } else if (successCount === 0) {
      message.error(`Transferler sevk edilemedi`);
    } else {
      message.warning(`${successCount} transfer sevk edildi, ${failCount} transfer başarısız`);
    }
  };

  const handleBulkReject = async () => {
    const pendingItems = bulkSelection.selectedItems.filter((t) => t.status === 'Pending');
    let successCount = 0;
    let failCount = 0;

    for (const transfer of pendingItems) {
      try {
        await cancelTransfer.mutateAsync({ id: transfer.id, reason: 'Toplu reddetme işlemi' });
        successCount++;
      } catch (error) {
        failCount++;
      }
    }
    bulkSelection.clear();

    if (failCount === 0) {
      message.success(`${successCount} transfer reddedildi`);
    } else if (successCount === 0) {
      message.error(`Transferler reddedilemedi`);
    } else {
      message.warning(`${successCount} transfer reddedildi, ${failCount} transfer başarısız`);
    }
  };

  const handleBulkCancel = async () => {
    const cancellableItems = bulkSelection.selectedItems.filter(
      (t) => t.status === 'Draft' || t.status === 'Pending'
    );
    let successCount = 0;
    let failCount = 0;

    for (const transfer of cancellableItems) {
      try {
        await cancelTransfer.mutateAsync({ id: transfer.id, reason: 'Toplu iptal işlemi' });
        successCount++;
      } catch (error) {
        failCount++;
      }
    }
    bulkSelection.clear();

    if (failCount === 0) {
      message.success(`${successCount} transfer iptal edildi`);
    } else if (successCount === 0) {
      message.error(`Transferler iptal edilemedi`);
    } else {
      message.warning(`${successCount} transfer iptal edildi, ${failCount} transfer başarısız`);
    }
  };

  // Bulk export selected
  const handleExportSelected = (format: 'pdf' | 'excel') => {
    const exportData = bulkSelection.selectedItems.map((t) => ({
      ...t,
      status: transferStatusLabels[t.status] || t.status,
      transferType: transferTypeLabels[t.transferType] || t.transferType,
    }));

    if (format === 'pdf') {
      exportToPDF({
        columns: stockTransferColumns,
        data: exportData,
        options: {
          title: 'Seçili Stok Transferleri',
          filename: `secili-transferler-${dayjs().format('YYYY-MM-DD')}`,
          summaryData: [{ label: 'Seçili Transfer', value: exportData.length }],
        },
      });
    } else {
      exportToExcel({
        columns: stockTransferColumns,
        data: exportData,
        options: {
          title: 'Seçili Stok Transferleri',
          filename: `secili-transferler-${dayjs().format('YYYY-MM-DD')}`,
          summaryData: [{ label: 'Seçili Transfer', value: exportData.length }],
        },
      });
    }
  };

  // Bulk actions
  const bulkActions = createTransferBulkActions(
    handleBulkApprove,
    handleBulkReject,
    handleBulkShip,
    handleBulkCancel
  );

  // Export handlers
  const handleExportPDF = () => {
    if (transfers.length === 0) {
      Modal.warning({ title: 'Uyarı', content: 'Dışa aktarılacak transfer bulunamadı' });
      return;
    }

    const exportData = transfers.map((t) => ({
      ...t,
      status: transferStatusLabels[t.status] || t.status,
      transferType: transferTypeLabels[t.transferType] || t.transferType,
    }));

    exportToPDF({
      columns: stockTransferColumns,
      data: exportData,
      options: {
        title: 'Stok Transferleri Raporu',
        filename: `stok-transferleri-${dayjs().format('YYYY-MM-DD')}`,
        subtitle: dateRange
          ? `${dayjs(dateRange[0]).format('DD/MM/YYYY')} - ${dayjs(dateRange[1]).format('DD/MM/YYYY')}`
          : undefined,
        summaryData: [
          { label: 'Toplam Transfer', value: stats.total },
          { label: 'Bekleyen', value: stats.pending },
          { label: 'Yolda', value: stats.inTransit },
          { label: 'Tamamlanan', value: stats.completed },
        ],
      },
    });
  };

  const handleExportExcel = () => {
    if (transfers.length === 0) {
      Modal.warning({ title: 'Uyarı', content: 'Dışa aktarılacak transfer bulunamadı' });
      return;
    }

    const exportData = transfers.map((t) => ({
      ...t,
      status: transferStatusLabels[t.status] || t.status,
      transferType: transferTypeLabels[t.transferType] || t.transferType,
    }));

    exportToExcel({
      columns: stockTransferColumns,
      data: exportData,
      options: {
        title: 'Stok Transferleri',
        filename: `stok-transferleri-${dayjs().format('YYYY-MM-DD')}`,
        summaryData: [
          { label: 'Toplam Transfer', value: stats.total },
          { label: 'Bekleyen', value: stats.pending },
          { label: 'Yolda', value: stats.inTransit },
          { label: 'Tamamlanan', value: stats.completed },
        ],
      },
    });
  };

  // Handlers
  const handleView = (id: number) => {
    router.push(`/inventory/stock-transfers/${id}`);
  };

  const handleSubmit = async (transfer: StockTransferListDto) => {
    Modal.confirm({
      title: 'Transferi Gönder',
      content: `"${transfer.transferNumber}" transferini onaya göndermek istediğinizden emin misiniz?`,
      okText: 'Gönder',
      cancelText: 'İptal',
      okButtonProps: { className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: async () => {
        try {
          await submitTransfer.mutateAsync(transfer.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleApprove = async (transfer: StockTransferListDto) => {
    Modal.confirm({
      title: 'Transferi Onayla',
      content: `"${transfer.transferNumber}" transferini onaylamak istediğinizden emin misiniz?`,
      okText: 'Onayla',
      cancelText: 'İptal',
      okButtonProps: { className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: async () => {
        try {
          await approveTransfer.mutateAsync({ id: transfer.id, approvedByUserId: 1 });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleShip = async (transfer: StockTransferListDto) => {
    Modal.confirm({
      title: 'Transferi Sevk Et',
      content: `"${transfer.transferNumber}" transferini sevk etmek istediğinizden emin misiniz?`,
      okText: 'Sevk Et',
      cancelText: 'İptal',
      okButtonProps: { className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: async () => {
        try {
          await shipTransfer.mutateAsync({ id: transfer.id, shippedByUserId: 1 });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleReceive = async (transfer: StockTransferListDto) => {
    Modal.confirm({
      title: 'Transferi Teslim Al',
      content: `"${transfer.transferNumber}" transferini teslim almak istediğinizden emin misiniz?`,
      okText: 'Teslim Al',
      cancelText: 'İptal',
      okButtonProps: { className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: async () => {
        try {
          await receiveTransfer.mutateAsync({ id: transfer.id, receivedByUserId: 1 });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleCancel = async (transfer: StockTransferListDto) => {
    Modal.confirm({
      title: 'Transferi İptal Et',
      content: `"${transfer.transferNumber}" transferini iptal etmek istediğinizden emin misiniz?`,
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await cancelTransfer.mutateAsync({ id: transfer.id, reason: 'Kullanıcı tarafından iptal edildi' });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  // Get action items based on status
  const getActionItems = (transfer: StockTransferListDto) => {
    const items: any[] = [
      {
        key: 'view',
        icon: <EyeIcon className="w-4 h-4" />,
        label: 'Görüntüle',
        onClick: () => handleView(transfer.id),
      },
    ];

    switch (transfer.status) {
      case 'Draft':
        items.push(
          {
            key: 'submit',
            icon: <PaperAirplaneIcon className="w-4 h-4" />,
            label: 'Onaya Gönder',
            onClick: () => handleSubmit(transfer),
          },
          { type: 'divider' },
          {
            key: 'cancel',
            icon: <XCircleIcon className="w-4 h-4" />,
            label: 'İptal Et',
            danger: true,
            onClick: () => handleCancel(transfer),
          }
        );
        break;
      case 'Pending':
        items.push(
          {
            key: 'approve',
            icon: <CheckCircleIcon className="w-4 h-4" />,
            label: 'Onayla',
            onClick: () => handleApprove(transfer),
          },
          { type: 'divider' },
          {
            key: 'cancel',
            icon: <XCircleIcon className="w-4 h-4" />,
            label: 'Reddet',
            danger: true,
            onClick: () => handleCancel(transfer),
          }
        );
        break;
      case 'Approved':
        items.push({
          key: 'ship',
          icon: <RocketLaunchIcon className="w-4 h-4" />,
          label: 'Sevk Et',
          onClick: () => handleShip(transfer),
        });
        break;
      case 'InTransit':
        items.push({
          key: 'receive',
          icon: <InboxIcon className="w-4 h-4" />,
          label: 'Teslim Al',
          onClick: () => handleReceive(transfer),
        });
        break;
    }

    return items;
  };

  // Table columns
  const columns: ColumnsType<StockTransferListDto> = [
    {
      title: 'Transfer No',
      dataIndex: 'transferNumber',
      key: 'transferNumber',
      width: 150,
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
      title: 'Tarih',
      dataIndex: 'transferDate',
      key: 'transferDate',
      width: 120,
      render: (date) => (
        <span className="text-sm text-slate-600">
          {dayjs(date).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Kaynak Depo',
      dataIndex: 'sourceWarehouseName',
      key: 'sourceWarehouseName',
      width: 150,
      render: (name) => <span className="text-sm text-slate-900">{name}</span>,
    },
    {
      title: 'Hedef Depo',
      dataIndex: 'destinationWarehouseName',
      key: 'destinationWarehouseName',
      width: 150,
      render: (name) => <span className="text-sm text-slate-900">{name}</span>,
    },
    {
      title: 'Tür',
      dataIndex: 'transferType',
      key: 'transferType',
      width: 120,
      render: (type) => <span className="text-sm text-slate-600">{typeLabels[type] || type}</span>,
    },
    {
      title: 'Kalem',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 80,
      align: 'center',
      render: (count) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
          {count}
        </span>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 100,
      align: 'right',
      render: (qty) => <span className="text-sm font-medium text-slate-900">{qty}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: TransferStatus) => {
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
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors" aria-label="Satır işlemleri">
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
          <h1 className="text-2xl font-bold text-slate-900">Stok Transferleri</h1>
          <p className="text-slate-500 mt-1">Depolar arası stok transferlerini yönetin</p>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            onClick={() => refetch()}
            disabled={isLoading}
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
            onClick={() => router.push('/inventory/stock-transfers/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Transfer
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ArrowsRightLeftIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Transfer</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.pending}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Bekleyen</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-500 flex items-center justify-center">
              <RocketLaunchIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.inTransit}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Yolda</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.completed}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Tamamlanan</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <SavedFiltersDropdown
            entityType="stock-transfers"
            currentFilters={currentFilters}
            onApplyFilter={handleApplyFilter}
            onClearFilter={handleClearFilter}
          />
          <Select
            placeholder="Kaynak Depo"
            value={selectedSourceWarehouse}
            onChange={setSelectedSourceWarehouse}
            allowClear
            style={{ width: 180 }}
            options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Hedef Depo"
            value={selectedDestWarehouse}
            onChange={setSelectedDestWarehouse}
            allowClear
            style={{ width: 180 }}
            options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
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
        totalCount={transfers.length}
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
            dataSource={transfers}
            rowKey="id"
            loading={isLoading}
            rowSelection={{
              selectedRowKeys: Array.from(bulkSelection.selectedIds),
              onChange: (selectedRowKeys) => {
                bulkSelection.clear();
                selectedRowKeys.forEach((key) => bulkSelection.select(key as string | number));
              },
              getCheckboxProps: (record) => ({
                disabled: record.status === 'Completed' || record.status === 'Cancelled',
              }),
            }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
            }}
            locale={{
              emptyText: <TableEmptyState
                icon={TruckIcon}
                title="Transfer bulunamadi"
                description="Henuz transfer eklenmemis veya filtrelere uygun kayit yok."
              />
            }}
            scroll={{ x: 1200 }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        )}
      </div>
    </div>
  );
}
