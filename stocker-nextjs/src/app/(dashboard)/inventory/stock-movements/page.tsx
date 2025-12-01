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
  Select,
  DatePicker,
  Modal,
  Dropdown,
} from 'antd';
import {
  ReloadOutlined,
  EyeOutlined,
  MoreOutlined,
  SwapOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  UndoOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  useStockMovements,
  useProducts,
  useWarehouses,
  useReverseStockMovement,
  useStockMovementSummary,
} from '@/lib/api/hooks/useInventory';
import type { StockMovementDto, StockMovementType } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Movement type configuration
const movementTypeConfig: Record<StockMovementType, { color: string; label: string; direction: 'in' | 'out' | 'transfer' }> = {
  Purchase: { color: 'green', label: 'Satın Alma', direction: 'in' },
  Sales: { color: 'red', label: 'Satış', direction: 'out' },
  PurchaseReturn: { color: 'orange', label: 'Satın Alma İadesi', direction: 'out' },
  SalesReturn: { color: 'cyan', label: 'Satış İadesi', direction: 'in' },
  Transfer: { color: 'blue', label: 'Transfer', direction: 'transfer' },
  Production: { color: 'purple', label: 'Üretim', direction: 'in' },
  Consumption: { color: 'magenta', label: 'Tüketim', direction: 'out' },
  AdjustmentIncrease: { color: 'lime', label: 'Artış Düzeltme', direction: 'in' },
  AdjustmentDecrease: { color: 'volcano', label: 'Azalış Düzeltme', direction: 'out' },
  Opening: { color: 'geekblue', label: 'Açılış', direction: 'in' },
  Counting: { color: 'gold', label: 'Sayım', direction: 'transfer' },
  Damage: { color: 'red', label: 'Hasar', direction: 'out' },
  Loss: { color: 'red', label: 'Kayıp', direction: 'out' },
  Found: { color: 'green', label: 'Bulunan', direction: 'in' },
};

export default function StockMovementsPage() {
  const router = useRouter();

  // Filters
  const [selectedProduct, setSelectedProduct] = useState<number | undefined>();
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const [selectedType, setSelectedType] = useState<StockMovementType | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);

  // API Hooks
  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();
  const { data: movements = [], isLoading, refetch } = useStockMovements(
    selectedProduct,
    selectedWarehouse,
    selectedType,
    dateRange?.[0]?.toISOString(),
    dateRange?.[1]?.toISOString()
  );
  const { data: summary } = useStockMovementSummary(
    dateRange?.[0]?.toISOString() || dayjs().subtract(30, 'day').toISOString(),
    dateRange?.[1]?.toISOString() || dayjs().toISOString(),
    selectedWarehouse
  );

  const reverseMovement = useReverseStockMovement();

  // Handlers
  const handleView = (id: number) => {
    router.push(`/inventory/stock-movements/${id}`);
  };

  const handleReverse = async (movement: StockMovementDto) => {
    if (movement.isReversed) {
      Modal.warning({
        title: 'Uyarı',
        content: 'Bu hareket zaten tersine çevrilmiş.',
      });
      return;
    }

    Modal.confirm({
      title: 'Hareketi Tersine Çevir',
      content: `"${movement.documentNumber}" hareketini tersine çevirmek istediğinizden emin misiniz? Bu işlem stok miktarını geri alacaktır.`,
      okText: 'Tersine Çevir',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await reverseMovement.mutateAsync({ id: movement.id, reason: 'Kullanıcı tarafından tersine çevrildi' });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  // Table columns
  const columns: ColumnsType<StockMovementDto> = [
    {
      title: 'Belge No',
      dataIndex: 'documentNumber',
      key: 'documentNumber',
      width: 150,
      render: (text, record) => (
        <div>
          <span
            className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
            onClick={() => handleView(record.id)}
          >
            {text}
          </span>
          {record.isReversed && (
            <Tag color="red" className="ml-2">Tersine Çevrildi</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'movementDate',
      key: 'movementDate',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Tür',
      dataIndex: 'movementType',
      key: 'movementType',
      width: 130,
      render: (type: StockMovementType) => {
        const config = movementTypeConfig[type];
        const icon = config.direction === 'in' ? <ArrowUpOutlined /> :
                    config.direction === 'out' ? <ArrowDownOutlined /> :
                    <SyncOutlined />;
        return (
          <Tag color={config.color} icon={icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Ürün',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.productName}</div>
          <Text type="secondary" className="text-xs">{record.productCode}</Text>
        </div>
      ),
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 120,
    },
    {
      title: 'Konum',
      key: 'locations',
      width: 150,
      render: (_, record) => {
        if (record.fromLocationName && record.toLocationName) {
          return (
            <Text type="secondary" className="text-xs">
              {record.fromLocationName} → {record.toLocationName}
            </Text>
          );
        }
        return record.toLocationName || record.fromLocationName || '-';
      },
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      render: (qty, record) => {
        const config = movementTypeConfig[record.movementType];
        const color = config.direction === 'in' ? 'text-green-600' :
                     config.direction === 'out' ? 'text-red-600' :
                     'text-blue-600';
        const prefix = config.direction === 'in' ? '+' :
                      config.direction === 'out' ? '-' : '';
        return (
          <span className={`font-semibold ${color}`}>
            {prefix}{qty}
          </span>
        );
      },
    },
    {
      title: 'Birim Maliyet',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 120,
      align: 'right',
      render: (cost) => cost ? `₺${cost.toLocaleString('tr-TR')}` : '-',
    },
    {
      title: 'Toplam',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 120,
      align: 'right',
      render: (cost) => cost ? `₺${cost.toLocaleString('tr-TR')}` : '-',
    },
    {
      title: 'Referans',
      key: 'reference',
      width: 150,
      render: (_, record) => (
        record.referenceDocumentNumber ? (
          <div>
            <Text type="secondary" className="text-xs">{record.referenceDocumentType}</Text>
            <div className="font-medium">{record.referenceDocumentNumber}</div>
          </div>
        ) : '-'
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'Görüntüle',
                onClick: () => handleView(record.id),
              },
              {
                key: 'reverse',
                icon: <UndoOutlined />,
                label: 'Tersine Çevir',
                disabled: record.isReversed,
                danger: true,
                onClick: () => handleReverse(record),
              },
            ],
          }}
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
          <Title level={2} style={{ margin: 0 }}>Stok Hareketleri</Title>
          <Text type="secondary">Tüm stok giriş, çıkış ve transferlerini görüntüleyin</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Yenile
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Toplam Hareket"
              value={summary?.totalMovements || movements.length}
              prefix={<SwapOutlined className="text-blue-500" />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Giriş"
              value={summary?.totalInbound || 0}
              prefix={<ArrowUpOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Çıkış"
              value={summary?.totalOutbound || 0}
              prefix={<ArrowDownOutlined className="text-red-500" />}
              valueStyle={{ color: '#ff4d4f' }}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Net Değişim"
              value={summary?.netChange || 0}
              prefix={<SyncOutlined className="text-purple-500" />}
              valueStyle={{
                color: (summary?.netChange || 0) >= 0 ? '#52c41a' : '#ff4d4f'
              }}
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
              placeholder="Ürün"
              value={selectedProduct}
              onChange={setSelectedProduct}
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: '100%' }}
              options={products.map((p) => ({
                value: p.id,
                label: `${p.code} - ${p.name}`,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Select
              placeholder="Depo"
              value={selectedWarehouse}
              onChange={setSelectedWarehouse}
              allowClear
              style={{ width: '100%' }}
              options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Select
              placeholder="Hareket Türü"
              value={selectedType}
              onChange={setSelectedType}
              allowClear
              style={{ width: '100%' }}
              options={Object.entries(movementTypeConfig).map(([key, value]) => ({
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
                setSelectedProduct(undefined);
                setSelectedWarehouse(undefined);
                setSelectedType(undefined);
                setDateRange([dayjs().subtract(30, 'day'), dayjs()]);
              }}
            >
              Temizle
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Movements Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={movements}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} hareket`,
          }}
          scroll={{ x: 1500 }}
        />
      </Card>
    </div>
  );
}
