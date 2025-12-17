'use client';

/**
 * Stock Transfers List Page
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
  message,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  MoreOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  InboxOutlined,
  RocketOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
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
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';

const { RangePicker } = DatePicker;

// Transfer status configuration
const statusConfig: Record<TransferStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Draft: { color: 'default', label: 'Taslak', icon: null },
  Pending: { color: 'processing', label: 'Beklemede', icon: <ClockCircleOutlined /> },
  Approved: { color: 'blue', label: 'Onaylı', icon: <CheckCircleOutlined /> },
  Rejected: { color: 'red', label: 'Reddedildi', icon: <CloseCircleOutlined /> },
  InTransit: { color: 'orange', label: 'Yolda', icon: <RocketOutlined /> },
  Received: { color: 'cyan', label: 'Teslim Alındı', icon: <InboxOutlined /> },
  PartiallyReceived: { color: 'gold', label: 'Kısmi Teslim', icon: <InboxOutlined /> },
  Completed: { color: 'green', label: 'Tamamlandı', icon: <CheckCircleOutlined /> },
  Cancelled: { color: 'red', label: 'İptal', icon: <CloseCircleOutlined /> },
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
  const totalTransfers = transfers.length;
  const pendingTransfers = transfers.filter((t) => t.status === 'Pending').length;
  const inTransitTransfers = transfers.filter((t) => t.status === 'InTransit').length;
  const completedTransfers = transfers.filter((t) => t.status === 'Completed').length;

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
    for (const transfer of pendingItems) {
      try {
        await approveTransfer.mutateAsync({ id: transfer.id, approvedByUserId: 1 });
      } catch (error) {
        // Continue with next item
      }
    }
    bulkSelection.clear();
    message.success(`${pendingItems.length} transfer onaylandı`);
  };

  const handleBulkShip = async () => {
    const approvedItems = bulkSelection.selectedItems.filter((t) => t.status === 'Approved');
    for (const transfer of approvedItems) {
      try {
        await shipTransfer.mutateAsync({ id: transfer.id, shippedByUserId: 1 });
      } catch (error) {
        // Continue with next item
      }
    }
    bulkSelection.clear();
    message.success(`${approvedItems.length} transfer sevk edildi`);
  };

  const handleBulkReject = async () => {
    const pendingItems = bulkSelection.selectedItems.filter((t) => t.status === 'Pending');
    for (const transfer of pendingItems) {
      try {
        await cancelTransfer.mutateAsync({ id: transfer.id, reason: 'Toplu reddetme işlemi' });
      } catch (error) {
        // Continue with next item
      }
    }
    bulkSelection.clear();
    message.success(`${pendingItems.length} transfer reddedildi`);
  };

  const handleBulkCancel = async () => {
    const cancellableItems = bulkSelection.selectedItems.filter(
      (t) => t.status === 'Draft' || t.status === 'Pending'
    );
    for (const transfer of cancellableItems) {
      try {
        await cancelTransfer.mutateAsync({ id: transfer.id, reason: 'Toplu iptal işlemi' });
      } catch (error) {
        // Continue with next item
      }
    }
    bulkSelection.clear();
    message.success(`${cancellableItems.length} transfer iptal edildi`);
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
          { label: 'Toplam Transfer', value: totalTransfers },
          { label: 'Bekleyen', value: pendingTransfers },
          { label: 'Yolda', value: inTransitTransfers },
          { label: 'Tamamlanan', value: completedTransfers },
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
          { label: 'Toplam Transfer', value: totalTransfers },
          { label: 'Bekleyen', value: pendingTransfers },
          { label: 'Yolda', value: inTransitTransfers },
          { label: 'Tamamlanan', value: completedTransfers },
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
        icon: <EyeOutlined />,
        label: 'Görüntüle',
        onClick: () => handleView(transfer.id),
      },
    ];

    switch (transfer.status) {
      case 'Draft':
        items.push(
          {
            key: 'submit',
            icon: <SendOutlined />,
            label: 'Onaya Gönder',
            onClick: () => handleSubmit(transfer),
          },
          {
            key: 'cancel',
            icon: <CloseCircleOutlined />,
            label: 'İptal Et',
            onClick: () => handleCancel(transfer),
          }
        );
        break;
      case 'Pending':
        items.push(
          {
            key: 'approve',
            icon: <CheckCircleOutlined />,
            label: 'Onayla',
            onClick: () => handleApprove(transfer),
          },
          {
            key: 'cancel',
            icon: <CloseCircleOutlined />,
            label: 'Reddet',
            onClick: () => handleCancel(transfer),
          }
        );
        break;
      case 'Approved':
        items.push({
          key: 'ship',
          icon: <RocketOutlined />,
          label: 'Sevk Et',
          onClick: () => handleShip(transfer),
        });
        break;
      case 'InTransit':
        items.push({
          key: 'receive',
          icon: <InboxOutlined />,
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
      render: (type) => {
        const typeLabels: Record<string, string> = {
          Standard: 'Standart',
          Urgent: 'Acil',
          Replenishment: 'İkmal',
          Return: 'İade',
          Internal: 'Dahili',
          CrossDock: 'Cross-Dock',
          Consolidation: 'Konsolidasyon',
        };
        return <span className="text-sm text-slate-600">{typeLabels[type] || type}</span>;
      },
    },
    {
      title: 'Kalem',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 80,
      align: 'center',
      render: (count) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">
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
      width: 130,
      render: (status: TransferStatus) => {
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
            <MoreOutlined className="text-sm" />
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
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Transfer</span>
              <div className="text-2xl font-semibold text-slate-900">{totalTransfers}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <SwapOutlined style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Bekleyen</span>
              <div className={`text-2xl font-semibold ${pendingTransfers > 0 ? 'text-yellow-600' : 'text-slate-900'}`}>
                {pendingTransfers}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: pendingTransfers > 0 ? '#f59e0b15' : '#64748b15' }}>
              <ClockCircleOutlined style={{ color: pendingTransfers > 0 ? '#f59e0b' : '#64748b' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Yolda</span>
              <div className={`text-2xl font-semibold ${inTransitTransfers > 0 ? 'text-orange-600' : 'text-slate-900'}`}>
                {inTransitTransfers}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: inTransitTransfers > 0 ? '#f9731615' : '#64748b15' }}>
              <RocketOutlined style={{ color: inTransitTransfers > 0 ? '#f97316' : '#64748b' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Tamamlanan</span>
              <div className="text-2xl font-semibold text-slate-900">{completedTransfers}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <CheckCircleOutlined style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<SwapOutlined />}
        iconColor="#3b82f6"
        title="Stok Transferleri"
        description="Depolar arası stok transferlerini yönetin"
        itemCount={transfers.length}
        primaryAction={{
          label: 'Yeni Transfer',
          onClick: () => router.push('/inventory/stock-transfers/new'),
          icon: <PlusOutlined />,
        }}
        secondaryActions={
          <div className="flex items-center gap-2">
            <SavedFiltersDropdown
              entityType="stock-transfers"
              currentFilters={currentFilters}
              onApplyFilter={handleApplyFilter}
              onClearFilter={handleClearFilter}
            />
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'pdf',
                    icon: <FilePdfOutlined />,
                    label: 'PDF İndir',
                    onClick: handleExportPDF,
                  },
                  {
                    key: 'excel',
                    icon: <FileExcelOutlined />,
                    label: 'Excel İndir',
                    onClick: handleExportExcel,
                  },
                ],
              }}
            >
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <DownloadOutlined />
                Dışa Aktar
              </button>
            </Dropdown>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
            >
              <ReloadOutlined className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Select
            placeholder="Kaynak Depo"
            value={selectedSourceWarehouse}
            onChange={setSelectedSourceWarehouse}
            allowClear
            style={{ width: 180 }}
            options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
          />
          <Select
            placeholder="Hedef Depo"
            value={selectedDestWarehouse}
            onChange={setSelectedDestWarehouse}
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
        totalCount={transfers.length}
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
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} transfer`,
            }}
            scroll={{ x: 1200 }}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
