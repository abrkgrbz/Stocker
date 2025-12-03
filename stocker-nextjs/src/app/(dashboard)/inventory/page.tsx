'use client';

import React, { useMemo } from 'react';
import { Typography, Space, Button, Row, Col, Card, Statistic, Table, Tag, List, Empty, Progress, Tooltip } from 'antd';
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
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  EditOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import {
  useProducts,
  useLowStockProducts,
  useWarehouses,
  useStockTransfers,
  useStockCounts,
  useExpiringStock,
  useStockMovements,
  useCategories,
} from '@/lib/api/hooks/useInventory';
import { TransferStatus, StockCountStatus } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import type { ProductDto, StockMovementDto, CategoryDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const { Title, Text } = Typography;

// Color palette
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const productTypeLabels: Record<string, string> = {
  Raw: 'Hammadde',
  SemiFinished: 'Yarı Mamul',
  Finished: 'Mamul',
  Service: 'Hizmet',
  Consumable: 'Sarf Malzeme',
  FixedAsset: 'Duran Varlık',
};

export default function InventoryDashboardPage() {
  // Fetch inventory data
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useProducts(true);
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
  const { data: stockMovements = [], isLoading: movementsLoading } = useStockMovements();
  const { data: categories = [] } = useCategories();

  // Calculate stats
  const activeProducts = products.filter((p: ProductDto) => p.isActive).length;
  const totalProducts = products.length;
  const totalWarehouses = warehouses.length;
  const activeWarehouses = warehouses.filter((w: any) => w.isActive).length;
  const pendingTransfers = transfers.length;
  const activeStockCounts = stockCounts.length;
  const lowStockCount = lowStockProducts.length;
  const expiringCount = expiringStock.length;

  // Calculate total stock value
  const totalStockValue = useMemo(() => {
    return products.reduce((sum: number, p: ProductDto) => sum + (p.unitPrice || 0) * p.totalStockQuantity, 0);
  }, [products]);

  // Calculate total stock quantity
  const totalStockQuantity = useMemo(() => {
    return products.reduce((sum: number, p: ProductDto) => sum + p.totalStockQuantity, 0);
  }, [products]);

  // Product type distribution
  const productTypeData = useMemo(() => {
    const typeMap = new Map<string, number>();
    products.forEach((p: ProductDto) => {
      const type = p.productType || 'Other';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    return Array.from(typeMap.entries()).map(([name, value]) => ({
      name: productTypeLabels[name] || name,
      value,
    }));
  }, [products]);

  // Category distribution by value
  const categoryValueData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    products.forEach((p: ProductDto) => {
      const cat = p.categoryName || 'Kategorisiz';
      const value = (p.unitPrice || 0) * p.totalStockQuantity;
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + value);
    });
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [products]);

  // Stock movement trend (last 7 days)
  const movementTrendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = dayjs().subtract(6 - i, 'day');
      return {
        date: date.format('DD/MM'),
        fullDate: date.format('YYYY-MM-DD'),
        giren: 0,
        cikan: 0,
      };
    });

    stockMovements.forEach((m: StockMovementDto) => {
      const moveDate = dayjs(m.movementDate).format('YYYY-MM-DD');
      const dayData = last7Days.find((d) => d.fullDate === moveDate);
      if (dayData) {
        const isIncoming = ['Purchase', 'Return', 'TransferIn', 'AdjustmentIncrease', 'Production'].includes(m.movementType);
        if (isIncoming) {
          dayData.giren += m.quantity;
        } else {
          dayData.cikan += m.quantity;
        }
      }
    });

    return last7Days;
  }, [stockMovements]);

  // Top products by value
  const topProductsByValue = useMemo(() => {
    return [...products]
      .map((p: ProductDto) => ({
        name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
        fullName: p.name,
        value: (p.unitPrice || 0) * p.totalStockQuantity,
        quantity: p.totalStockQuantity,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [products]);

  // Stock health overview
  const stockHealthData = useMemo(() => {
    let healthy = 0;
    let warning = 0;
    let critical = 0;
    let outOfStock = 0;

    products.forEach((p: ProductDto) => {
      if (p.totalStockQuantity === 0) {
        outOfStock++;
      } else if (p.totalStockQuantity < p.minStockLevel) {
        critical++;
      } else if (p.totalStockQuantity < p.minStockLevel * 1.5) {
        warning++;
      } else {
        healthy++;
      }
    });

    return [
      { name: 'Sağlıklı', value: healthy, color: '#10b981' },
      { name: 'Uyarı', value: warning, color: '#f59e0b' },
      { name: 'Kritik', value: critical, color: '#ef4444' },
      { name: 'Stok Yok', value: outOfStock, color: '#6b7280' },
    ];
  }, [products]);

  // Low stock table columns
  const lowStockColumns: ColumnsType<any> = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record: any) => (
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
      render: (qty: number, record: any) => (
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
      render: (shortage: number) => (
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
      render: (text: string, record: any) => (
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
      render: (date: string, record: any) => (
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
      render: (text: string, record: any) => (
        <Link href={`/inventory/stock-transfers/${record.id}`}>
          <span className="text-blue-600 hover:text-blue-800 font-medium">{text}</span>
        </Link>
      ),
    },
    {
      title: 'Kaynak → Hedef',
      key: 'route',
      render: (_: any, record: any) => (
        <div className="text-sm">
          {record.sourceWarehouseName} → {record.destinationWarehouseName}
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
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

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString('tr-TR')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <Title level={2} style={{ margin: 0 }}>
          Envanter Yönetimi
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetchProducts()} loading={productsLoading}>
            Yenile
          </Button>
          <Link href="/inventory/products">
            <Button type="primary" icon={<AppstoreOutlined />}>Ürünler</Button>
          </Link>
          <Link href="/inventory/warehouses">
            <Button icon={<ShopOutlined />}>Depolar</Button>
          </Link>
          <Link href="/inventory/stock-adjustments">
            <Button icon={<EditOutlined />}>Stok Düzeltme</Button>
          </Link>
        </Space>
      </div>

      {/* Main Stats Cards */}
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
              title="Toplam Stok Değeri"
              value={totalStockValue}
              prefix={<DollarOutlined className="text-green-500" />}
              suffix="₺"
              precision={0}
              loading={productsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="Toplam Stok Miktarı"
              value={totalStockQuantity}
              prefix={<InboxOutlined className="text-purple-500" />}
              loading={productsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="Aktif Depolar"
              value={activeWarehouses}
              prefix={<ShopOutlined className="text-orange-500" />}
              suffix={<Text type="secondary" className="text-sm">/ {totalWarehouses} toplam</Text>}
              loading={warehousesLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Alert Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className={`h-full ${lowStockCount > 0 ? 'border-red-200 bg-red-50' : ''}`} hoverable>
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
                {lowStockCount > 0 && <Tag color="red">Aksiyon Gerekli</Tag>}
              </div>
            </Link>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className={`h-full ${pendingTransfers > 0 ? 'border-orange-200 bg-orange-50' : ''}`} hoverable>
            <Link href="/inventory/stock-transfers">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${pendingTransfers > 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    <SwapOutlined className={`text-2xl ${pendingTransfers > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <Text strong className="text-lg">{pendingTransfers}</Text>
                    <div className="text-gray-500">Yoldaki Transfer</div>
                  </div>
                </div>
                {pendingTransfers > 0 && <Tag color="orange">Takip Et</Tag>}
              </div>
            </Link>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className={`h-full ${expiringCount > 0 ? 'border-yellow-200 bg-yellow-50' : ''}`} hoverable>
            <Link href="/inventory/stock?expiring=true">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${expiringCount > 0 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                    <InboxOutlined className={`text-2xl ${expiringCount > 0 ? 'text-yellow-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <Text strong className="text-lg">{expiringCount}</Text>
                    <div className="text-gray-500">SKT Yaklaşan (30 gün)</div>
                  </div>
                </div>
                {expiringCount > 0 && <Tag color="gold">Dikkat</Tag>}
              </div>
            </Link>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* Stock Movement Trend */}
        <Col xs={24} lg={16}>
          <Card title={<><RiseOutlined className="text-blue-500 mr-2" />Stok Hareket Trendi (Son 7 Gün)</>}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={movementTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="giren" name="Giren" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="cikan" name="Çıkan" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Stock Health */}
        <Col xs={24} lg={8}>
          <Card title={<><WarningOutlined className="text-orange-500 mr-2" />Stok Sağlığı</>}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockHealthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                >
                  {stockHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {stockHealthData.map((item, index) => (
                <div key={index} className="flex items-center gap-1 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* Top Products by Value */}
        <Col xs={24} lg={12}>
          <Card title={<><DollarOutlined className="text-green-500 mr-2" />En Değerli 10 Ürün (Stok Değerine Göre)</>}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={topProductsByValue} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                <RechartsTooltip
                  formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`}
                  labelFormatter={(label) => topProductsByValue.find(p => p.name === label)?.fullName || label}
                />
                <Bar dataKey="value" name="Stok Değeri" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Category Distribution */}
        <Col xs={24} lg={12}>
          <Card title={<><AppstoreOutlined className="text-purple-500 mr-2" />Kategori Bazlı Stok Değeri</>}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={categoryValueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`} />
                <RechartsTooltip formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`} />
                <Bar dataKey="value" name="Stok Değeri" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {categoryValueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Product Type Distribution */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={8}>
          <Card title={<><InboxOutlined className="text-cyan-500 mr-2" />Ürün Tipi Dağılımı</>}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={productTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {productTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Low Stock Products Table */}
        <Col xs={24} lg={8}>
          <Card
            title={<><WarningOutlined className="text-red-500 mr-2" />Düşük Stoklu Ürünler</>}
            extra={<Link href="/inventory/products?lowStock=true"><Button type="link" size="small">Tümünü Gör</Button></Link>}
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
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Düşük stoklu ürün yok" />
            )}
          </Card>
        </Col>

        {/* Pending Transfers Table */}
        <Col xs={24} lg={8}>
          <Card
            title={<><SwapOutlined className="text-orange-500 mr-2" />Yoldaki Transferler</>}
            extra={<Link href="/inventory/stock-transfers"><Button type="link" size="small">Tümünü Gör</Button></Link>}
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
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Yolda transfer yok" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={[16, 16]}>
        {/* Expiring Stock */}
        <Col xs={24} lg={12}>
          <Card
            title={<><InboxOutlined className="text-yellow-600 mr-2" />SKT Yaklaşan Ürünler</>}
            extra={<Link href="/inventory/stock?expiring=true"><Button type="link" size="small">Tümünü Gör</Button></Link>}
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
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="SKT yaklaşan ürün yok" />
            )}
          </Card>
        </Col>

        {/* Warehouse Summary */}
        <Col xs={24} lg={12}>
          <Card
            title={<><ShopOutlined className="text-green-500 mr-2" />Depo Özeti</>}
            extra={<Link href="/inventory/warehouses"><Button type="link" size="small">Tümünü Gör</Button></Link>}
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
                      <Button type="primary" icon={<PlusOutlined />}>Depo Oluştur</Button>
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
