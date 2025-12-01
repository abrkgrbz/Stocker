'use client';

import React from 'react';
import { Typography, Space, Button, Row, Col, Card, Statistic, Table, Tag, List, Empty, Progress } from 'antd';
import {
  AppstoreOutlined,
  ShopOutlined,
  SwapOutlined,
  FileSearchOutlined,
  WarningOutlined,
  InboxOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import {
  useProducts,
  useLowStockProducts,
  useWarehouses,
  useStockTransfers,
  useStockCounts,
  useExpiringStock,
} from '@/lib/api/hooks/useInventory';
import { TransferStatus, StockCountStatus } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function InventoryDashboardPage() {
  // Fetch inventory data
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useProducts();
  const { data: lowStockProducts = [], isLoading: lowStockLoading } = useLowStockProducts();
  const { data: warehouses = [], isLoading: warehousesLoading } = useWarehouses();
  const { data: transfers = [], isLoading: transfersLoading } = useStockTransfers(
    undefined,
    undefined,
    TransferStatus.InTransit
  );
  const { data: stockCounts = [], isLoading: stockCountsLoading } = useStockCounts(
    undefined,
    StockCountStatus.InProgress
  );
  const { data: expiringStock = [], isLoading: expiringLoading } = useExpiringStock(30);

  // Calculate stats
  const activeProducts = products.filter((p) => p.isActive).length;
  const totalProducts = products.length;
  const totalWarehouses = warehouses.length;
  const activeWarehouses = warehouses.filter((w) => w.isActive).length;
  const pendingTransfers = transfers.length;
  const activeStockCounts = stockCounts.length;
  const lowStockCount = lowStockProducts.length;
  const expiringCount = expiringStock.length;

  // Low stock table columns
  const lowStockColumns: ColumnsType<any> = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (text, record) => (
        <Link href={`/inventory/products/${record.productId}`}>
          <div>
            <div className="font-medium text-blue-600 hover:text-blue-800">{text}</div>
            <Text type="secondary" className="text-xs">{record.productCode}</Text>
          </div>
        </Link>
      ),
    },
    {
      title: 'Mevcut',
      dataIndex: 'currentQuantity',
      key: 'currentQuantity',
      align: 'right',
      render: (qty, record) => (
        <span className={qty <= record.minStockLevel ? 'text-red-600 font-semibold' : ''}>
          {qty}
        </span>
      ),
    },
    {
      title: 'Min. Stok',
      dataIndex: 'minStockLevel',
      key: 'minStockLevel',
      align: 'right',
    },
    {
      title: 'Eksik',
      dataIndex: 'shortage',
      key: 'shortage',
      align: 'right',
      render: (shortage) => (
        <Tag color="red">-{shortage}</Tag>
      ),
    },
  ];

  // Expiring stock table columns
  const expiringColumns: ColumnsType<any> = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <Text type="secondary" className="text-xs">{record.lotNumber}</Text>
        </div>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
    },
    {
      title: 'Son Kullanma',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date, record) => (
        <div>
          <div className={record.daysUntilExpiry <= 7 ? 'text-red-600' : 'text-orange-600'}>
            {dayjs(date).format('DD/MM/YYYY')}
          </div>
          <Text type="secondary" className="text-xs">{record.daysUntilExpiry} gün kaldı</Text>
        </div>
      ),
    },
  ];

  // Pending transfers columns
  const transferColumns: ColumnsType<any> = [
    {
      title: 'Transfer No',
      dataIndex: 'transferNumber',
      key: 'transferNumber',
      render: (text, record) => (
        <Link href={`/inventory/stock-transfers/${record.id}`}>
          <span className="text-blue-600 hover:text-blue-800 font-medium">{text}</span>
        </Link>
      ),
    },
    {
      title: 'Kaynak → Hedef',
      key: 'route',
      render: (_, record) => (
        <div className="text-sm">
          {record.sourceWarehouseName} → {record.destinationWarehouseName}
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig: Record<string, { color: string; label: string }> = {
          Draft: { color: 'default', label: 'Taslak' },
          Pending: { color: 'processing', label: 'Beklemede' },
          Approved: { color: 'blue', label: 'Onaylı' },
          InTransit: { color: 'orange', label: 'Yolda' },
          Received: { color: 'cyan', label: 'Teslim Alındı' },
          Completed: { color: 'green', label: 'Tamamlandı' },
          Cancelled: { color: 'red', label: 'İptal' },
        };
        const config = statusConfig[status] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <Title level={2} style={{ margin: 0 }}>
          Envanter Yönetimi
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetchProducts()}>
            Yenile
          </Button>
          <Link href="/inventory/products">
            <Button type="primary" icon={<AppstoreOutlined />}>Ürünler</Button>
          </Link>
          <Link href="/inventory/warehouses">
            <Button icon={<ShopOutlined />}>Depolar</Button>
          </Link>
          <Link href="/inventory/stock-transfers">
            <Button icon={<SwapOutlined />}>Transferler</Button>
          </Link>
          <Link href="/inventory/stock-counts">
            <Button icon={<FileSearchOutlined />}>Sayımlar</Button>
          </Link>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="Toplam Ürün"
              value={totalProducts}
              prefix={<AppstoreOutlined className="text-blue-500" />}
              suffix={<Text type="secondary" className="text-sm">/ {activeProducts} aktif</Text>}
              loading={productsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="Depolar"
              value={totalWarehouses}
              prefix={<ShopOutlined className="text-green-500" />}
              suffix={<Text type="secondary" className="text-sm">/ {activeWarehouses} aktif</Text>}
              loading={warehousesLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="Yoldaki Transferler"
              value={pendingTransfers}
              prefix={<SwapOutlined className="text-orange-500" />}
              loading={transfersLoading}
              valueStyle={pendingTransfers > 0 ? { color: '#fa8c16' } : undefined}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="Devam Eden Sayımlar"
              value={activeStockCounts}
              prefix={<FileSearchOutlined className="text-purple-500" />}
              loading={stockCountsLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Alert Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12}>
          <Card
            className={`h-full ${lowStockCount > 0 ? 'border-red-200 bg-red-50' : ''}`}
            hoverable
          >
            <Link href="/inventory/products?lowStock=true">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${lowStockCount > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <WarningOutlined className={`text-2xl ${lowStockCount > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <Text strong className="text-lg">{lowStockCount}</Text>
                    <div className="text-gray-500">Düşük Stoklu Ürün</div>
                  </div>
                </div>
                {lowStockCount > 0 && (
                  <Tag color="red" className="text-sm">Aksiyon Gerekli</Tag>
                )}
              </div>
            </Link>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card
            className={`h-full ${expiringCount > 0 ? 'border-orange-200 bg-orange-50' : ''}`}
            hoverable
          >
            <Link href="/inventory/stock?expiring=true">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${expiringCount > 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    <InboxOutlined className={`text-2xl ${expiringCount > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <Text strong className="text-lg">{expiringCount}</Text>
                    <div className="text-gray-500">SKT Yaklaşan Ürün (30 gün)</div>
                  </div>
                </div>
                {expiringCount > 0 && (
                  <Tag color="orange" className="text-sm">Dikkat</Tag>
                )}
              </div>
            </Link>
          </Card>
        </Col>
      </Row>

      {/* Tables */}
      <Row gutter={[16, 16]}>
        {/* Low Stock Products */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <WarningOutlined className="text-red-500" />
                <span>Düşük Stoklu Ürünler</span>
              </div>
            }
            extra={
              <Link href="/inventory/products?lowStock=true">
                <Button type="link">Tümünü Gör</Button>
              </Link>
            }
          >
            {lowStockProducts.length > 0 ? (
              <Table
                columns={lowStockColumns}
                dataSource={lowStockProducts.slice(0, 5)}
                rowKey="productId"
                pagination={false}
                size="small"
                loading={lowStockLoading}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Düşük stoklu ürün yok"
              />
            )}
          </Card>
        </Col>

        {/* Expiring Stock */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <InboxOutlined className="text-orange-500" />
                <span>SKT Yaklaşan Ürünler</span>
              </div>
            }
            extra={
              <Link href="/inventory/stock?expiring=true">
                <Button type="link">Tümünü Gör</Button>
              </Link>
            }
          >
            {expiringStock.length > 0 ? (
              <Table
                columns={expiringColumns}
                dataSource={expiringStock.slice(0, 5)}
                rowKey="stockId"
                pagination={false}
                size="small"
                loading={expiringLoading}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="SKT yaklaşan ürün yok"
              />
            )}
          </Card>
        </Col>

        {/* Pending Transfers */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <SwapOutlined className="text-orange-500" />
                <span>Yoldaki Transferler</span>
              </div>
            }
            extra={
              <Link href="/inventory/stock-transfers">
                <Button type="link">Tümünü Gör</Button>
              </Link>
            }
          >
            {transfers.length > 0 ? (
              <Table
                columns={transferColumns}
                dataSource={transfers.slice(0, 5)}
                rowKey="id"
                pagination={false}
                size="small"
                loading={transfersLoading}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Yolda transfer yok"
              />
            )}
          </Card>
        </Col>

        {/* Warehouse Summary */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <ShopOutlined className="text-green-500" />
                <span>Depo Özeti</span>
              </div>
            }
            extra={
              <Link href="/inventory/warehouses">
                <Button type="link">Tümünü Gör</Button>
              </Link>
            }
          >
            {warehouses.length > 0 ? (
              <List
                dataSource={warehouses.slice(0, 5)}
                loading={warehousesLoading}
                renderItem={(warehouse: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div className={`p-2 rounded-full ${warehouse.isDefault ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <ShopOutlined className={warehouse.isDefault ? 'text-blue-500' : 'text-gray-500'} />
                        </div>
                      }
                      title={
                        <Link href={`/inventory/warehouses/${warehouse.id}`}>
                          <span className="text-blue-600 hover:text-blue-800">
                            {warehouse.name}
                            {warehouse.isDefault && <Tag color="blue" className="ml-2">Varsayılan</Tag>}
                          </span>
                        </Link>
                      }
                      description={warehouse.city || 'Konum belirtilmemiş'}
                    />
                    <div className="text-right">
                      <div className="font-semibold">{warehouse.locationCount || 0} konum</div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="text-center">
                    <div className="mb-2">Henüz depo oluşturulmamış</div>
                    <Link href="/inventory/warehouses">
                      <Button type="primary" icon={<PlusOutlined />}>
                        Depo Oluştur
                      </Button>
                    </Link>
                  </div>
                }
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
