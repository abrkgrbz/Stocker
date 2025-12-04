'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  Dropdown,
  Select,
  DatePicker,
  message,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
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

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Transfer status configuration
const statusConfig: Record<TransferStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Draft: { color: 'default', label: 'Taslak', icon: <EditOutlined /> },
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
    // Handle date preset
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

    // Handle status
    if (filters.status) {
      setSelectedStatus(filters.status as TransferStatus);
    }

    // Handle source warehouse
    if (filters.sourceWarehouseId) {
      setSelectedSourceWarehouse(filters.sourceWarehouseId as number);
    }

    // Handle destination warehouse
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
          // TODO: Get actual user ID
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
          // TODO: Get actual user ID
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
          // TODO: Get actual user ID
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
    const items = [
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
          } as any
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
          } as any
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
          className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
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
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Kaynak Depo',
      dataIndex: 'sourceWarehouseName',
      key: 'sourceWarehouseName',
      width: 150,
    },
    {
      title: 'Hedef Depo',
      dataIndex: 'destinationWarehouseName',
      key: 'destinationWarehouseName',
      width: 150,
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
        return typeLabels[type] || type;
      },
    },
    {
      title: 'Kalem',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 80,
      align: 'center',
      render: (count) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: 'Miktar',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 100,
      align: 'right',
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
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionItems(record) }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>Stok Transferleri</Title>
          <Text type="secondary">Depolar arası stok transferlerini yönetin</Text>
        </div>
        <Space>
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
            <Button icon={<DownloadOutlined />}>Dışa Aktar</Button>
          </Dropdown>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Yenile
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/inventory/stock-transfers/new')}>
            Yeni Transfer
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Toplam Transfer"
              value={totalTransfers}
              prefix={<SwapOutlined className="text-blue-500" />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className={pendingTransfers > 0 ? 'border-yellow-200' : ''}>
            <Statistic
              title="Bekleyen"
              value={pendingTransfers}
              prefix={<ClockCircleOutlined className={pendingTransfers > 0 ? 'text-yellow-500' : 'text-gray-400'} />}
              valueStyle={pendingTransfers > 0 ? { color: '#faad14' } : undefined}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className={inTransitTransfers > 0 ? 'border-orange-200' : ''}>
            <Statistic
              title="Yolda"
              value={inTransitTransfers}
              prefix={<RocketOutlined className={inTransitTransfers > 0 ? 'text-orange-500' : 'text-gray-400'} />}
              valueStyle={inTransitTransfers > 0 ? { color: '#fa8c16' } : undefined}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Tamamlanan"
              value={completedTransfers}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={5}>
            <Select
              placeholder="Kaynak Depo"
              value={selectedSourceWarehouse}
              onChange={setSelectedSourceWarehouse}
              allowClear
              style={{ width: '100%' }}
              options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
            />
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Select
              placeholder="Hedef Depo"
              value={selectedDestWarehouse}
              onChange={setSelectedDestWarehouse}
              allowClear
              style={{ width: '100%' }}
              options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
            />
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Select
              placeholder="Durum"
              value={selectedStatus}
              onChange={setSelectedStatus}
              allowClear
              style={{ width: '100%' }}
              options={Object.entries(statusConfig).map(([key, value]) => ({
                value: key,
                label: value.label,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              placeholder={['Başlangıç', 'Bitiş']}
            />
          </Col>
          <Col xs={24} sm={12} lg={3}>
            <Button
              onClick={() => {
                setSelectedSourceWarehouse(undefined);
                setSelectedDestWarehouse(undefined);
                setSelectedStatus(undefined);
                setDateRange(null);
              }}
            >
              Temizle
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={bulkSelection.selectionCount}
        totalCount={transfers.length}
        actions={bulkActions}
        onClearSelection={bulkSelection.clear}
        onExportSelected={handleExportSelected}
      />

      {/* Transfers Table */}
      <Card>
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
      </Card>
    </div>
  );
}
