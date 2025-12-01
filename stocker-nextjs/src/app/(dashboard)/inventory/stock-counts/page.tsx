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
  Progress,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  MoreOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EditOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
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

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Stock count status configuration
const statusConfig: Record<StockCountStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Draft: { color: 'default', label: 'Taslak', icon: <EditOutlined /> },
  InProgress: { color: 'processing', label: 'Devam Ediyor', icon: <PlayCircleOutlined /> },
  Completed: { color: 'blue', label: 'Tamamlandı', icon: <CheckCircleOutlined /> },
  Approved: { color: 'green', label: 'Onaylandı', icon: <CheckCircleOutlined /> },
  Rejected: { color: 'red', label: 'Reddedildi', icon: <CloseCircleOutlined /> },
  Adjusted: { color: 'purple', label: 'Düzeltildi', icon: <ExclamationCircleOutlined /> },
  Cancelled: { color: 'red', label: 'İptal', icon: <CloseCircleOutlined /> },
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

  // Calculate stats
  const totalCounts = stockCounts.length;
  const inProgressCounts = stockCounts.filter((c) => c.status === 'InProgress').length;
  const completedCounts = stockCounts.filter((c) => c.status === 'Completed' || c.status === 'Approved').length;
  const totalDifferences = stockCounts.reduce((sum, c) => sum + (c.itemsWithDifference || 0), 0);

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
          // TODO: Get actual user ID
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
          // TODO: Get actual user ID
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
    const items = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Görüntüle',
        onClick: () => handleView(stockCount.id),
      },
    ];

    switch (stockCount.status) {
      case 'Draft':
        items.push(
          {
            key: 'start',
            icon: <PlayCircleOutlined />,
            label: 'Başlat',
            onClick: () => handleStart(stockCount),
          },
          {
            key: 'cancel',
            icon: <CloseCircleOutlined />,
            label: 'İptal Et',
            onClick: () => handleCancel(stockCount),
          } as any
        );
        break;
      case 'InProgress':
        items.push(
          {
            key: 'complete',
            icon: <CheckCircleOutlined />,
            label: 'Tamamla',
            onClick: () => handleComplete(stockCount),
          },
          {
            key: 'cancel',
            icon: <CloseCircleOutlined />,
            label: 'İptal Et',
            onClick: () => handleCancel(stockCount),
          } as any
        );
        break;
      case 'Completed':
        items.push({
          key: 'approve',
          icon: <CheckCircleOutlined />,
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
          className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
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
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
    },
    {
      title: 'Konum',
      dataIndex: 'locationName',
      key: 'locationName',
      width: 120,
      render: (location) => location || '-',
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
          <div>
            <Progress percent={percent} size="small" />
            <Text type="secondary" className="text-xs">
              {record.countedItems} / {record.totalItems}
            </Text>
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
        diff > 0 ? (
          <Tag color="orange">{diff}</Tag>
        ) : (
          <Tag color="green">0</Tag>
        )
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
          <Title level={2} style={{ margin: 0 }}>Stok Sayımları</Title>
          <Text type="secondary">Envanter sayım işlemlerini yönetin</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Yenile
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/inventory/stock-counts/new')}>
            Yeni Sayım
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Toplam Sayım"
              value={totalCounts}
              prefix={<FileSearchOutlined className="text-blue-500" />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className={inProgressCounts > 0 ? 'border-blue-200' : ''}>
            <Statistic
              title="Devam Eden"
              value={inProgressCounts}
              prefix={<PlayCircleOutlined className={inProgressCounts > 0 ? 'text-blue-500' : 'text-gray-400'} />}
              valueStyle={inProgressCounts > 0 ? { color: '#1890ff' } : undefined}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Tamamlanan"
              value={completedCounts}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className={totalDifferences > 0 ? 'border-orange-200' : ''}>
            <Statistic
              title="Toplam Fark"
              value={totalDifferences}
              prefix={<ExclamationCircleOutlined className={totalDifferences > 0 ? 'text-orange-500' : 'text-gray-400'} />}
              suffix="kalem"
              valueStyle={totalDifferences > 0 ? { color: '#fa8c16' } : undefined}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Depo"
              value={selectedWarehouse}
              onChange={setSelectedWarehouse}
              allowClear
              style={{ width: '100%' }}
              options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
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
          <Col xs={24} sm={12} lg={8}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              placeholder={['Başlangıç', 'Bitiş']}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Button
              onClick={() => {
                setSelectedWarehouse(undefined);
                setSelectedStatus(undefined);
                setDateRange(null);
              }}
            >
              Temizle
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Stock Counts Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={stockCounts}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} sayım`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}
