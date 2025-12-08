'use client';

import React, { useState, useMemo } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Table,
  Select,
  Input,
  Space,
  Tag,
  Button,
  Tooltip,
  Progress,
  Statistic,
  Badge,
  Dropdown,
  Empty,
  Spin,
  Divider,
  Modal,
  message,
  Upload,
} from 'antd';
import type { UploadProps } from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  ShopOutlined,
  AppstoreOutlined,
  SwapOutlined,
  PlusOutlined,
  MinusOutlined,
  EyeOutlined,
  HistoryOutlined,
  MoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ExportOutlined,
  PrinterOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import {
  useStock,
  useWarehouses,
  useCategories,
  useProducts,
  useProductStockSummary,
  useExportStockToExcel,
  useExportStockSummaryToExcel,
  useImportStockAdjustmentsFromExcel,
  useGetStockAdjustmentTemplate,
} from '@/lib/api/hooks/useInventory';
import type { StockDto, ProductDto, WarehouseDto } from '@/lib/api/services/inventory.types';

const { Title, Text } = Typography;
const { Search } = Input;

// Utility functions
const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '0';
  return new Intl.NumberFormat('tr-TR').format(value);
};

const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '₺0';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Stock level status
const getStockStatus = (
  quantity: number,
  minStock: number,
  maxStock: number
): { status: 'success' | 'warning' | 'error' | 'default'; label: string } => {
  if (quantity <= 0) {
    return { status: 'error', label: 'Stok Yok' };
  }
  if (quantity <= minStock) {
    return { status: 'warning', label: 'Dusuk Stok' };
  }
  if (maxStock > 0 && quantity >= maxStock) {
    return { status: 'default', label: 'Fazla Stok' };
  }
  return { status: 'success', label: 'Normal' };
};

// Stock level progress
const getStockProgress = (quantity: number, minStock: number, maxStock: number): number => {
  if (maxStock <= 0) return 50; // Default to middle if no max
  return Math.min(100, (quantity / maxStock) * 100);
};

const getProgressColor = (percent: number, minPercent: number): string => {
  if (percent <= minPercent) return '#f5222d';
  if (percent <= minPercent * 1.5) return '#faad14';
  return '#52c41a';
};

interface StockTableRow {
  key: string;
  productId: number;
  productCode: string;
  productName: string;
  categoryName: string;
  unit: string;
  warehouseId: number;
  warehouseName: string;
  locationId?: number;
  locationName?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  unitPrice: number;
  totalValue: number;
  status: 'success' | 'warning' | 'error' | 'default';
  statusLabel: string;
}

export default function StockListPage() {
  // State
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Data fetching
  const { data: stocks = [], isLoading: stockLoading, refetch: refetchStock } = useStock(
    selectedWarehouseId,
    undefined,
    undefined
  );
  const { data: warehouses = [] } = useWarehouses();
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts(true);

  // Product stock summary for detail modal
  const { data: stockSummary, isLoading: summaryLoading } = useProductStockSummary(
    selectedProductId || 0
  );

  // Excel export/import hooks
  const exportStockMutation = useExportStockToExcel();
  const exportStockSummaryMutation = useExportStockSummaryToExcel();
  const importStockMutation = useImportStockAdjustmentsFromExcel();
  const downloadTemplateMutation = useGetStockAdjustmentTemplate();
  const [importModalVisible, setImportModalVisible] = useState(false);

  // Handle Excel import
  const handleExcelImport: UploadProps['beforeUpload'] = (file) => {
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    file.type === 'application/vnd.ms-excel' ||
                    file.name.endsWith('.xlsx') ||
                    file.name.endsWith('.xls');

    if (!isExcel) {
      message.error('Sadece Excel dosyaları (.xlsx, .xls) yükleyebilirsiniz!');
      return false;
    }

    importStockMutation.mutate(file, {
      onSuccess: () => {
        setImportModalVisible(false);
        refetchStock();
      },
    });

    return false; // Prevent auto upload
  };

  // Create a product lookup map
  const productMap = useMemo(() => {
    const map = new Map<number, ProductDto>();
    products.forEach((p: ProductDto) => map.set(p.id, p));
    return map;
  }, [products]);

  // Create a warehouse lookup map
  const warehouseMap = useMemo(() => {
    const map = new Map<number, WarehouseDto>();
    warehouses.forEach((w: WarehouseDto) => map.set(w.id, w));
    return map;
  }, [warehouses]);

  // Transform stock data for table
  const tableData: StockTableRow[] = useMemo(() => {
    return stocks.map((stock: StockDto) => {
      const product = productMap.get(stock.productId);
      const warehouse = warehouseMap.get(stock.warehouseId);
      const availableQty = stock.quantity - (stock.reservedQuantity || 0);
      const minStock = product?.minStockLevel || 0;
      const maxStock = product?.maxStockLevel || 0;
      const stockStatus = getStockStatus(stock.quantity, minStock, maxStock);

      return {
        key: `${stock.productId}-${stock.warehouseId}-${stock.locationId || 0}`,
        productId: stock.productId,
        productCode: product?.code || stock.productId.toString(),
        productName: product?.name || 'Bilinmeyen Urun',
        categoryName: product?.categoryName || '-',
        unit: product?.unitName || 'Adet',
        warehouseId: stock.warehouseId,
        warehouseName: warehouse?.name || 'Bilinmeyen Depo',
        locationId: stock.locationId,
        locationName: stock.locationName || '-',
        quantity: stock.quantity,
        reservedQuantity: stock.reservedQuantity || 0,
        availableQuantity: availableQty,
        minStockLevel: minStock,
        maxStockLevel: maxStock,
        reorderPoint: product?.reorderLevel || 0,
        unitPrice: product?.unitPrice || 0,
        totalValue: (product?.unitPrice || 0) * stock.quantity,
        status: stockStatus.status,
        statusLabel: stockStatus.label,
      };
    });
  }, [stocks, productMap, warehouseMap]);

  // Filtered data
  const filteredData = useMemo(() => {
    let result = tableData;

    // Filter by category
    if (selectedCategoryId) {
      const categoryProducts = products
        .filter((p: ProductDto) => p.categoryId === selectedCategoryId)
        .map((p: ProductDto) => p.id);
      result = result.filter((row) => categoryProducts.includes(row.productId));
    }

    // Filter by status
    if (statusFilter) {
      result = result.filter((row) => {
        if (statusFilter === 'low') return row.status === 'warning';
        if (statusFilter === 'out') return row.status === 'error';
        if (statusFilter === 'over') return row.status === 'default';
        if (statusFilter === 'normal') return row.status === 'success';
        return true;
      });
    }

    // Filter by search text
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(
        (row) =>
          row.productCode.toLowerCase().includes(lowerSearch) ||
          row.productName.toLowerCase().includes(lowerSearch) ||
          row.warehouseName.toLowerCase().includes(lowerSearch)
      );
    }

    return result;
  }, [tableData, selectedCategoryId, statusFilter, searchText, products]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalValue = filteredData.reduce((sum, row) => sum + row.totalValue, 0);
    const totalQuantity = filteredData.reduce((sum, row) => sum + row.quantity, 0);
    const lowStockCount = filteredData.filter((row) => row.status === 'warning').length;
    const outOfStockCount = filteredData.filter((row) => row.status === 'error').length;
    const uniqueProducts = new Set(filteredData.map((row) => row.productId)).size;

    return {
      totalValue,
      totalQuantity,
      lowStockCount,
      outOfStockCount,
      uniqueProducts,
    };
  }, [filteredData]);

  // Handle view detail
  const handleViewDetail = (productId: number) => {
    setSelectedProductId(productId);
    setDetailModalVisible(true);
  };

  // Table columns
  const columns: ColumnsType<StockTableRow> = [
    {
      title: 'Urun Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      fixed: 'left' as const,
      sorter: (a, b) => a.productCode.localeCompare(b.productCode),
      render: (code, record) => (
        <Link href={`/inventory/products/${record.productId}`}>
          <Text strong style={{ color: '#1890ff' }}>{code}</Text>
        </Link>
      ),
    },
    {
      title: 'Urun Adi',
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
      ellipsis: true,
      sorter: (a, b) => a.productName.localeCompare(b.productName),
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 130,
      render: (name, record) => (
        <Space>
          <ShopOutlined />
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Konum',
      dataIndex: 'locationName',
      key: 'locationName',
      width: 100,
      render: (name) => name || '-',
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right' as const,
      sorter: (a, b) => a.quantity - b.quantity,
      render: (qty, record) => (
        <Tooltip title={`Birim: ${record.unit}`}>
          <Text strong>{formatNumber(qty)}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Rezerve',
      dataIndex: 'reservedQuantity',
      key: 'reservedQuantity',
      width: 90,
      align: 'right' as const,
      render: (qty) => (
        <Text type={qty > 0 ? 'warning' : 'secondary'}>
          {formatNumber(qty)}
        </Text>
      ),
    },
    {
      title: 'Kullanilabilir',
      dataIndex: 'availableQuantity',
      key: 'availableQuantity',
      width: 110,
      align: 'right' as const,
      sorter: (a, b) => a.availableQuantity - b.availableQuantity,
      render: (qty, record) => (
        <Text strong style={{ color: qty <= 0 ? '#f5222d' : qty <= record.minStockLevel ? '#faad14' : '#52c41a' }}>
          {formatNumber(qty)}
        </Text>
      ),
    },
    {
      title: 'Stok Durumu',
      key: 'status',
      width: 180,
      render: (_, record) => {
        const progress = getStockProgress(record.quantity, record.minStockLevel, record.maxStockLevel);
        const minPercent = record.maxStockLevel > 0 ? (record.minStockLevel / record.maxStockLevel) * 100 : 20;
        return (
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Progress
              percent={progress}
              size="small"
              strokeColor={getProgressColor(progress, minPercent)}
              showInfo={false}
            />
            <Tag
              color={
                record.status === 'error'
                  ? 'red'
                  : record.status === 'warning'
                  ? 'orange'
                  : record.status === 'default'
                  ? 'blue'
                  : 'green'
              }
            >
              {record.statusLabel}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: 'Min / Max',
      key: 'minMax',
      width: 100,
      align: 'center' as const,
      render: (_, record) => (
        <Text type="secondary">
          {formatNumber(record.minStockLevel)} / {formatNumber(record.maxStockLevel)}
        </Text>
      ),
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 110,
      align: 'right' as const,
      render: (price) => formatCurrency(price),
    },
    {
      title: 'Toplam Deger',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 130,
      align: 'right' as const,
      sorter: (a, b) => a.totalValue - b.totalValue,
      render: (value) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space>
          <Tooltip title="Detay">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record.productId)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'history',
                  icon: <HistoryOutlined />,
                  label: <Link href={`/inventory/stock-movements?productId=${record.productId}`}>Hareket Gecmisi</Link>,
                },
                {
                  key: 'adjust',
                  icon: <SwapOutlined />,
                  label: <Link href={`/inventory/stock-adjustments/new?productId=${record.productId}&warehouseId=${record.warehouseId}`}>Stok Ayarlama</Link>,
                },
                { type: 'divider' },
                {
                  key: 'transfer',
                  icon: <ExportOutlined />,
                  label: <Link href={`/inventory/stock-transfers/new?productId=${record.productId}&sourceWarehouseId=${record.warehouseId}`}>Transfer Olustur</Link>,
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Spin spinning={stockLoading}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <InboxOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <Title level={3} style={{ margin: 0 }}>
                  Stok Listesi
                </Title>
              </Space>
            </Col>
            <Col>
              <Space>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'export-stock',
                        icon: <DownloadOutlined />,
                        label: 'Stok Verisini İndir',
                        onClick: () => exportStockMutation.mutate({ warehouseId: selectedWarehouseId }),
                      },
                      {
                        key: 'export-summary',
                        icon: <FileExcelOutlined />,
                        label: 'Stok Özeti İndir',
                        onClick: () => exportStockSummaryMutation.mutate(),
                      },
                      { type: 'divider' },
                      {
                        key: 'download-template',
                        icon: <FileExcelOutlined />,
                        label: 'İçe Aktarma Şablonu',
                        onClick: () => downloadTemplateMutation.mutate(),
                      },
                    ],
                  }}
                  trigger={['click']}
                >
                  <Button
                    icon={<DownloadOutlined />}
                    loading={exportStockMutation.isPending || exportStockSummaryMutation.isPending || downloadTemplateMutation.isPending}
                  >
                    Excel İndir
                  </Button>
                </Dropdown>
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => setImportModalVisible(true)}
                  loading={importStockMutation.isPending}
                >
                  Excel İçe Aktar
                </Button>
                <Button icon={<PrinterOutlined />}>Yazdır</Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => message.info('Stok girişi sayfasına yönlendiriliyorsunuz')}
                >
                  Stok Girişi
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Summary Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={8} md={4}>
            <Card size="small">
              <Statistic
                title="Toplam Deger"
                value={summaryStats.totalValue}
                prefix={<span style={{ fontSize: 14 }}>₺</span>}
                valueStyle={{ fontSize: 18, color: '#1890ff' }}
                formatter={(value) => formatNumber(Number(value))}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Card size="small">
              <Statistic
                title="Toplam Miktar"
                value={summaryStats.totalQuantity}
                valueStyle={{ fontSize: 18 }}
                formatter={(value) => formatNumber(Number(value))}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Card size="small">
              <Statistic
                title="Urun Cesidi"
                value={summaryStats.uniqueProducts}
                prefix={<AppstoreOutlined style={{ fontSize: 14 }} />}
                valueStyle={{ fontSize: 18, color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Card size="small">
              <Statistic
                title="Dusuk Stok"
                value={summaryStats.lowStockCount}
                prefix={<WarningOutlined style={{ fontSize: 14, color: '#faad14' }} />}
                valueStyle={{ fontSize: 18, color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Card size="small">
              <Statistic
                title="Stok Bitti"
                value={summaryStats.outOfStockCount}
                prefix={<ExclamationCircleOutlined style={{ fontSize: 14, color: '#f5222d' }} />}
                valueStyle={{ fontSize: 18, color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Card size="small">
              <Statistic
                title="Kayit Sayisi"
                value={filteredData.length}
                prefix={<InboxOutlined style={{ fontSize: 14 }} />}
                valueStyle={{ fontSize: 18 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Search
                placeholder="Urun kodu, adi veya depo ara..."
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Depo Sec"
                allowClear
                style={{ width: '100%' }}
                value={selectedWarehouseId}
                onChange={setSelectedWarehouseId}
                options={warehouses.map((w: WarehouseDto) => ({
                  label: w.name,
                  value: w.id,
                }))}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Kategori Sec"
                allowClear
                style={{ width: '100%' }}
                value={selectedCategoryId}
                onChange={setSelectedCategoryId}
                options={categories.map((c: any) => ({
                  label: c.name,
                  value: c.id,
                }))}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Stok Durumu"
                allowClear
                style={{ width: '100%' }}
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: 'Normal', value: 'normal' },
                  { label: 'Dusuk Stok', value: 'low' },
                  { label: 'Stok Bitti', value: 'out' },
                  { label: 'Fazla Stok', value: 'over' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Space>
                <Tooltip title="Filtreleri Temizle">
                  <Button
                    icon={<FilterOutlined />}
                    onClick={() => {
                      setSearchText('');
                      setSelectedWarehouseId(undefined);
                      setSelectedCategoryId(undefined);
                      setStatusFilter(undefined);
                    }}
                  >
                    Temizle
                  </Button>
                </Tooltip>
                <Tooltip title="Yenile">
                  <Button icon={<ReloadOutlined />} onClick={() => refetchStock()} />
                </Tooltip>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Stock Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="key"
            size="small"
            scroll={{ x: 1600, y: 600 }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayit`,
              pageSizeOptions: ['20', '50', '100', '200'],
              defaultPageSize: 50,
            }}
            summary={(pageData) => {
              const totalQty = pageData.reduce((sum, row) => sum + row.quantity, 0);
              const totalAvailable = pageData.reduce((sum, row) => sum + row.availableQuantity, 0);
              const totalValue = pageData.reduce((sum, row) => sum + row.totalValue, 0);

              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={5}>
                      <Text strong>Sayfa Toplami</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="right">
                      <Text strong>{formatNumber(totalQty)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6} />
                    <Table.Summary.Cell index={7} align="right">
                      <Text strong>{formatNumber(totalAvailable)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={8} colSpan={3} />
                    <Table.Summary.Cell index={11} align="right">
                      <Text strong style={{ color: '#1890ff' }}>{formatCurrency(totalValue)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={12} />
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </Card>
      </Spin>

      {/* Stock Detail Modal */}
      <Modal
        title={
          <Space>
            <InboxOutlined />
            <span>Urun Stok Detayi</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedProductId(null);
        }}
        footer={null}
        width={700}
      >
        {summaryLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : stockSummary ? (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Toplam Stok"
                  value={stockSummary.totalQuantity || 0}
                  valueStyle={{ color: '#1890ff' }}
                  suffix="adet"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Toplam Rezerve"
                  value={stockSummary.totalReserved || 0}
                  valueStyle={{ color: '#faad14' }}
                  suffix="adet"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Kullanilabilir"
                  value={stockSummary.totalAvailable || 0}
                  valueStyle={{ color: '#52c41a' }}
                  suffix="adet"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Depo Sayisi"
                  value={stockSummary.warehouseCount || 0}
                  prefix={<ShopOutlined />}
                />
              </Col>
            </Row>

            <Divider>Stok Seviyeleri</Divider>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Min. Stok Seviyesi"
                  value={stockSummary.minStockLevel || 0}
                  suffix="adet"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Yeniden Siparis Seviyesi"
                  value={stockSummary.reorderLevel || 0}
                  suffix="adet"
                />
              </Col>
              <Col span={12}>
                <Text type={stockSummary.isBelowMinimum ? 'danger' : 'success'}>
                  {stockSummary.isBelowMinimum ? '⚠️ Minimum seviyenin altinda' : '✓ Stok seviyesi yeterli'}
                </Text>
              </Col>
              <Col span={12}>
                <Text type={stockSummary.needsReorder ? 'warning' : 'success'}>
                  {stockSummary.needsReorder ? '📦 Yeniden siparis gerekli' : '✓ Siparis gerekmiyor'}
                </Text>
              </Col>
            </Row>
          </div>
        ) : (
          <Empty description="Stok bilgisi bulunamadi" />
        )}
      </Modal>

      {/* Excel Import Modal */}
      <Modal
        title={
          <Space>
            <UploadOutlined />
            <span>Excel'den Stok Ayarlaması İçe Aktar</span>
          </Space>
        }
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={[
          <Button key="template" onClick={() => downloadTemplateMutation.mutate()}>
            Şablonu İndir
          </Button>,
          <Button key="cancel" onClick={() => setImportModalVisible(false)}>
            İptal
          </Button>,
        ]}
        width={500}
      >
        <div style={{ padding: '20px 0' }}>
          <Upload.Dragger
            name="file"
            accept=".xlsx,.xls"
            beforeUpload={handleExcelImport}
            showUploadList={false}
            disabled={importStockMutation.isPending}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">
              Excel dosyasını buraya sürükleyin veya tıklayarak seçin
            </p>
            <p className="ant-upload-hint">
              Sadece .xlsx veya .xls dosyaları kabul edilir.
              Doğru format için önce şablonu indirin.
            </p>
          </Upload.Dragger>

          {importStockMutation.isPending && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Spin tip="İçe aktarılıyor..." />
            </div>
          )}

          {importStockMutation.data && (
            <div style={{ marginTop: 20 }}>
              <Row gutter={[16, 8]}>
                <Col span={8}>
                  <Statistic
                    title="Başarılı"
                    value={importStockMutation.data.successCount}
                    valueStyle={{ color: '#52c41a', fontSize: 18 }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Hata"
                    value={importStockMutation.data.errorCount}
                    valueStyle={{ color: '#f5222d', fontSize: 18 }}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Toplam"
                    value={importStockMutation.data.totalRows}
                    valueStyle={{ fontSize: 18 }}
                  />
                </Col>
              </Row>

              {importStockMutation.data.errors && importStockMutation.data.errors.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Text type="danger">Hatalar:</Text>
                  <ul style={{ maxHeight: 150, overflow: 'auto', marginTop: 8 }}>
                    {importStockMutation.data.errors.slice(0, 10).map((err, idx) => (
                      <li key={idx}>
                        <Text type="secondary">Satır {err.rowNumber}:</Text> {err.errorMessage}
                      </li>
                    ))}
                    {importStockMutation.data.errors.length > 10 && (
                      <li>
                        <Text type="secondary">...ve {importStockMutation.data.errors.length - 10} hata daha</Text>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
