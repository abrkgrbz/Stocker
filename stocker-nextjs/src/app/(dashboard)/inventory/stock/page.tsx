'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  Select,
  Input,
  Space,
  Tag,
  Button,
  Tooltip,
  Progress,
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
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUpTrayIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentIcon,
  EllipsisHorizontalIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FunnelIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PrinterIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import type { ColumnsType } from 'antd/es/table';
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

const { Search } = Input;

// Monochrome color palette
const MONOCHROME_COLORS = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'];

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
    return { status: 'warning', label: 'Düşük Stok' };
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
  if (percent <= minPercent) return MONOCHROME_COLORS[0];
  if (percent <= minPercent * 1.5) return MONOCHROME_COLORS[2];
  return MONOCHROME_COLORS[4];
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
        productName: product?.name || 'Bilinmeyen Ürün',
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
      title: 'Ürün Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      fixed: 'left' as const,
      sorter: (a, b) => a.productCode.localeCompare(b.productCode),
      render: (code, record) => (
        <Link href={`/inventory/products/${record.productId}`}>
          <span className="font-medium text-slate-900 hover:text-slate-600">{code}</span>
        </Link>
      ),
    },
    {
      title: 'Ürün Adı',
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
      render: (name) => (
        <Space>
          <BuildingStorefrontIcon className="w-4 h-4 text-slate-400" />
          <span className="text-slate-700">{name}</span>
        </Space>
      ),
    },
    {
      title: 'Konum',
      dataIndex: 'locationName',
      key: 'locationName',
      width: 100,
      render: (name) => <span className="text-slate-500">{name || '-'}</span>,
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
          <span className="font-medium text-slate-900">{formatNumber(qty)}</span>
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
        <span className={qty > 0 ? 'text-amber-600' : 'text-slate-400'}>
          {formatNumber(qty)}
        </span>
      ),
    },
    {
      title: 'Kullanılabilir',
      dataIndex: 'availableQuantity',
      key: 'availableQuantity',
      width: 110,
      align: 'right' as const,
      sorter: (a, b) => a.availableQuantity - b.availableQuantity,
      render: (qty, record) => (
        <span className={`font-medium ${qty <= 0 ? 'text-red-600' : qty <= record.minStockLevel ? 'text-amber-600' : 'text-emerald-600'}`}>
          {formatNumber(qty)}
        </span>
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
          <div className="space-y-1">
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
                  ? 'default'
                  : 'green'
              }
            >
              {record.statusLabel}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Min / Max',
      key: 'minMax',
      width: 100,
      align: 'center' as const,
      render: (_, record) => (
        <span className="text-slate-500">
          {formatNumber(record.minStockLevel)} / {formatNumber(record.maxStockLevel)}
        </span>
      ),
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 110,
      align: 'right' as const,
      render: (price) => <span className="text-slate-700">{formatCurrency(price)}</span>,
    },
    {
      title: 'Toplam Değer',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 130,
      align: 'right' as const,
      sorter: (a, b) => a.totalValue - b.totalValue,
      render: (value) => (
        <span className="font-medium text-slate-900">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space>
          <Tooltip title="Detay">
            <Button
              type="text"
              size="small"
              icon={<EyeIcon className="w-4 h-4" />}
              className="!text-slate-600 hover:!text-slate-900"
              onClick={() => handleViewDetail(record.productId)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'history',
                  icon: <ClockIcon className="w-4 h-4" />,
                  label: <Link href={`/inventory/stock-movements?productId=${record.productId}`}>Hareket Geçmişi</Link>,
                },
                {
                  key: 'adjust',
                  icon: <ArrowsRightLeftIcon className="w-4 h-4" />,
                  label: <Link href={`/inventory/stock-adjustments/new?productId=${record.productId}&warehouseId=${record.warehouseId}`}>Stok Ayarlama</Link>,
                },
                { type: 'divider' },
                {
                  key: 'transfer',
                  icon: <ArrowTopRightOnSquareIcon className="w-4 h-4" />,
                  label: <Link href={`/inventory/stock-transfers/new?productId=${record.productId}&sourceWarehouseId=${record.warehouseId}`}>Transfer Oluştur</Link>,
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" size="small" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="!text-slate-600 hover:!text-slate-900" />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Spin spinning={stockLoading}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <InboxIcon className="w-4 h-4" />
              Stok Listesi
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Tüm depolardaki stok durumunu görüntüleyin ve yönetin
            </p>
          </div>
          <Space size="middle">
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'export-stock',
                    icon: <ArrowDownTrayIcon className="w-4 h-4" />,
                    label: 'Stok Verisini İndir',
                    onClick: () => exportStockMutation.mutate({ warehouseId: selectedWarehouseId }),
                  },
                  {
                    key: 'export-summary',
                    icon: <DocumentIcon className="w-4 h-4" />,
                    label: 'Stok Özeti İndir',
                    onClick: () => exportStockSummaryMutation.mutate(),
                  },
                  { type: 'divider' },
                  {
                    key: 'download-template',
                    icon: <DocumentIcon className="w-4 h-4" />,
                    label: 'İçe Aktarma Şablonu',
                    onClick: () => downloadTemplateMutation.mutate(),
                  },
                ],
              }}
              trigger={['click']}
            >
              <Button
                icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
                loading={exportStockMutation.isPending || exportStockSummaryMutation.isPending || downloadTemplateMutation.isPending}
              >
                Excel İndir
              </Button>
            </Dropdown>
            <Button
              icon={<ArrowUpTrayIcon className="w-4 h-4" />}
              className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
              onClick={() => setImportModalVisible(true)}
              loading={importStockMutation.isPending}
            >
              Excel İçe Aktar
            </Button>
            <Button
              icon={<PrinterIcon className="w-4 h-4" />}
              className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
            >
              Yazdır
            </Button>
            <Button
              type="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              onClick={() => message.info('Stok girişi sayfasına yönlendiriliyorsunuz')}
            >
              Stok Girişi
            </Button>
          </Space>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 sm:col-span-6 lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs text-slate-500 mb-1">Toplam Değer</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(summaryStats.totalValue)}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs text-slate-500 mb-1">Toplam Miktar</p>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(summaryStats.totalQuantity)}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <Squares2X2Icon className="w-4 h-4 text-slate-400" />
                <p className="text-xs text-slate-500">Ürün Çeşidi</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{summaryStats.uniqueProducts}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                <p className="text-xs text-slate-500">Düşük Stok</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">{summaryStats.lowStockCount}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <ExclamationCircleIcon className="w-4 h-4 text-red-500" />
                <p className="text-xs text-slate-500">Stok Bitti</p>
              </div>
              <p className="text-2xl font-bold text-red-600">{summaryStats.outOfStockCount}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <InboxIcon className="w-4 h-4 text-slate-400" />
                <p className="text-xs text-slate-500">Kayıt Sayısı</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{filteredData.length}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <Search
              placeholder="Ürün kodu, adı veya depo ara..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              style={{ width: 280 }}
            />
            <Select
              placeholder="Depo Seç"
              allowClear
              style={{ width: 180 }}
              value={selectedWarehouseId}
              onChange={setSelectedWarehouseId}
              options={warehouses.map((w: WarehouseDto) => ({
                label: w.name,
                value: w.id,
              }))}
            />
            <Select
              placeholder="Kategori Seç"
              allowClear
              style={{ width: 180 }}
              value={selectedCategoryId}
              onChange={setSelectedCategoryId}
              options={categories.map((c: any) => ({
                label: c.name,
                value: c.id,
              }))}
            />
            <Select
              placeholder="Stok Durumu"
              allowClear
              style={{ width: 160 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: 'Normal', value: 'normal' },
                { label: 'Düşük Stok', value: 'low' },
                { label: 'Stok Bitti', value: 'out' },
                { label: 'Fazla Stok', value: 'over' },
              ]}
            />
            <div className="flex-1" />
            <Tooltip title="Filtreleri Temizle">
              <Button
                icon={<FunnelIcon className="w-4 h-4" />}
                className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
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
              <Button
                icon={<ArrowPathIcon className="w-4 h-4" />}
                className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
                onClick={() => refetchStock()}
              />
            </Tooltip>
          </div>
        </div>

        {/* Stock Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="key"
            size="small"
            scroll={{ x: 1600, y: 600 }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
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
                      <span className="font-medium text-slate-900">Sayfa Toplamı</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="right">
                      <span className="font-medium text-slate-900">{formatNumber(totalQty)}</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6} />
                    <Table.Summary.Cell index={7} align="right">
                      <span className="font-medium text-slate-900">{formatNumber(totalAvailable)}</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={8} colSpan={3} />
                    <Table.Summary.Cell index={11} align="right">
                      <span className="font-medium text-slate-900">{formatCurrency(totalValue)}</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={12} />
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </div>
      </Spin>

      {/* Stock Detail Modal */}
      <Modal
        title={
          <span className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <InboxIcon className="w-4 h-4" />
            Ürün Stok Detayı
          </span>
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
          <div className="flex items-center justify-center py-12">
            <Spin />
          </div>
        ) : stockSummary ? (
          <div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Toplam Stok</p>
                <p className="text-2xl font-bold text-slate-900">{stockSummary.totalQuantity || 0} <span className="text-sm font-normal text-slate-500">adet</span></p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs text-amber-700 mb-1">Toplam Rezerve</p>
                <p className="text-2xl font-bold text-amber-600">{stockSummary.totalReserved || 0} <span className="text-sm font-normal text-amber-500">adet</span></p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-xs text-emerald-700 mb-1">Kullanılabilir</p>
                <p className="text-2xl font-bold text-emerald-600">{stockSummary.totalAvailable || 0} <span className="text-sm font-normal text-emerald-500">adet</span></p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BuildingStorefrontIcon className="w-4 h-4 text-slate-400" />
                  <p className="text-xs text-slate-500">Depo Sayısı</p>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stockSummary.warehouseCount || 0}</p>
              </div>
            </div>

            <Divider className="!my-4">Stok Seviyeleri</Divider>

            <div className="grid grid-cols-2 gap-6 mb-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Min. Stok Seviyesi</p>
                <p className="text-xl font-bold text-slate-900">{stockSummary.minStockLevel || 0} <span className="text-sm font-normal text-slate-500">adet</span></p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Yeniden Sipariş Seviyesi</p>
                <p className="text-xl font-bold text-slate-900">{stockSummary.reorderLevel || 0} <span className="text-sm font-normal text-slate-500">adet</span></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg ${stockSummary.isBelowMinimum ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {stockSummary.isBelowMinimum ? '⚠️ Minimum seviyenin altında' : '✓ Stok seviyesi yeterli'}
              </div>
              <div className={`p-3 rounded-lg ${stockSummary.needsReorder ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {stockSummary.needsReorder ? '📦 Yeniden sipariş gerekli' : '✓ Sipariş gerekmiyor'}
              </div>
            </div>
          </div>
        ) : (
          <Empty description="Stok bilgisi bulunamadı" />
        )}
      </Modal>

      {/* Excel Import Modal */}
      <Modal
        title={
          <span className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <ArrowUpTrayIcon className="w-4 h-4" />
            Excel'den Stok Ayarlaması İçe Aktar
          </span>
        }
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={[
          <Button
            key="template"
            className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
            onClick={() => downloadTemplateMutation.mutate()}
          >
            Şablonu İndir
          </Button>,
          <Button
            key="cancel"
            className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
            onClick={() => setImportModalVisible(false)}
          >
            İptal
          </Button>,
        ]}
        width={500}
      >
        <div className="py-5">
          <Upload.Dragger
            name="file"
            accept=".xlsx,.xls"
            beforeUpload={handleExcelImport}
            showUploadList={false}
            disabled={importStockMutation.isPending}
          >
            <p className="ant-upload-drag-icon">
              <InboxIcon className="w-12 h-12 text-slate-400" />
            </p>
            <p className="ant-upload-text text-slate-700">
              Excel dosyasını buraya sürükleyin veya tıklayarak seçin
            </p>
            <p className="ant-upload-hint text-slate-500">
              Sadece .xlsx veya .xls dosyaları kabul edilir.
              Doğru format için önce şablonu indirin.
            </p>
          </Upload.Dragger>

          {importStockMutation.isPending && (
            <div className="text-center mt-5">
              <Spin tip="İçe aktarılıyor..." />
            </div>
          )}

          {importStockMutation.data && (
            <div className="mt-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 mb-1" />
                  <p className="text-xs text-emerald-700">Başarılı</p>
                  <p className="text-xl font-bold text-emerald-600">{importStockMutation.data.successCount}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <ExclamationCircleIcon className="w-5 h-5 text-red-600 mb-1" />
                  <p className="text-xs text-red-700">Hata</p>
                  <p className="text-xl font-bold text-red-600">{importStockMutation.data.errorCount}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-500">Toplam</p>
                  <p className="text-xl font-bold text-slate-900">{importStockMutation.data.totalRows}</p>
                </div>
              </div>

              {importStockMutation.data.errors && importStockMutation.data.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-red-600 font-medium mb-2">Hatalar:</p>
                  <ul className="max-h-36 overflow-auto text-sm">
                    {importStockMutation.data.errors.slice(0, 10).map((err, idx) => (
                      <li key={idx} className="text-slate-600">
                        <span className="text-slate-400">Satır {err.rowNumber}:</span> {err.errorMessage}
                      </li>
                    ))}
                    {importStockMutation.data.errors.length > 10 && (
                      <li className="text-slate-400">
                        ...ve {importStockMutation.data.errors.length - 10} hata daha
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
