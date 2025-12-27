'use client';

/**
 * Stock Movements List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Select,
  DatePicker,
  Modal,
  Dropdown,
  Spin,
} from 'antd';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  DocumentIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
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
import {
  exportToPDF,
  exportToExcel,
  stockMovementColumns,
  movementTypeLabels,
} from '@/lib/utils/export-utils';
import SavedFiltersDropdown from '@/components/inventory/SavedFiltersDropdown';
import { resolveDatePreset } from '@/hooks/useSavedFilters';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';

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

  // Get current filters for SavedFiltersDropdown
  const currentFilters = {
    productId: selectedProduct,
    warehouseId: selectedWarehouse,
    movementType: selectedType,
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

    if (filters.movementType) {
      setSelectedType(filters.movementType as StockMovementType);
    } else if (filters.movementTypes && Array.isArray(filters.movementTypes)) {
      setSelectedType(filters.movementTypes[0] as StockMovementType);
    }

    if (filters.warehouseId) {
      setSelectedWarehouse(filters.warehouseId as number);
    }

    if (filters.productId) {
      setSelectedProduct(filters.productId as number);
    }
  };

  // Clear filters
  const handleClearFilter = () => {
    setSelectedProduct(undefined);
    setSelectedWarehouse(undefined);
    setSelectedType(undefined);
    setDateRange([dayjs().subtract(30, 'day'), dayjs()]);
  };

  // Export handlers
  const handleExportPDF = () => {
    if (movements.length === 0) {
      Modal.warning({ title: 'Uyarı', content: 'Dışa aktarılacak hareket bulunamadı' });
      return;
    }

    const exportData = movements.map((m) => ({
      ...m,
      movementType: movementTypeLabels[m.movementType] || m.movementType,
    }));

    exportToPDF({
      columns: stockMovementColumns,
      data: exportData,
      options: {
        title: 'Stok Hareketleri Raporu',
        filename: `stok-hareketleri-${dayjs().format('YYYY-MM-DD')}`,
        subtitle: dateRange
          ? `${dayjs(dateRange[0]).format('DD/MM/YYYY')} - ${dayjs(dateRange[1]).format('DD/MM/YYYY')}`
          : undefined,
        summaryData: [
          { label: 'Toplam Hareket', value: summary?.totalMovements || movements.length },
          { label: 'Toplam Giriş', value: summary?.totalInbound || 0 },
          { label: 'Toplam Çıkış', value: summary?.totalOutbound || 0 },
          { label: 'Net Değişim', value: summary?.netChange || 0 },
        ],
      },
    });
  };

  const handleExportExcel = () => {
    if (movements.length === 0) {
      Modal.warning({ title: 'Uyarı', content: 'Dışa aktarılacak hareket bulunamadı' });
      return;
    }

    const exportData = movements.map((m) => ({
      ...m,
      movementType: movementTypeLabels[m.movementType] || m.movementType,
    }));

    exportToExcel({
      columns: stockMovementColumns,
      data: exportData,
      options: {
        title: 'Stok Hareketleri',
        filename: `stok-hareketleri-${dayjs().format('YYYY-MM-DD')}`,
        summaryData: [
          { label: 'Toplam Hareket', value: summary?.totalMovements || movements.length },
          { label: 'Toplam Giriş', value: summary?.totalInbound || 0 },
          { label: 'Toplam Çıkış', value: summary?.totalOutbound || 0 },
          { label: 'Net Değişim', value: summary?.netChange || 0 },
          { label: 'Tarih Aralığı', value: dateRange ? `${dayjs(dateRange[0]).format('DD/MM/YYYY')} - ${dayjs(dateRange[1]).format('DD/MM/YYYY')}` : 'Tümü' },
        ],
      },
    });
  };

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
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800"
            onClick={() => handleView(record.id)}
          >
            {text}
          </span>
          {record.isReversed && (
            <Tag color="red" className="text-xs">Tersine Çevrildi</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'movementDate',
      key: 'movementDate',
      width: 140,
      render: (date) => (
        <span className="text-sm text-slate-600">
          {dayjs(date).format('DD/MM/YYYY HH:mm')}
        </span>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'movementType',
      key: 'movementType',
      width: 140,
      render: (type: StockMovementType) => {
        const config = movementTypeConfig[type];
        const icon = config.direction === 'in' ? <ArrowUpOutlined /> :
                    config.direction === 'out' ? <ArrowDownOutlined /> :
                    <ArrowPathIcon className="w-4 h-4" />;
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
          <div className="text-sm font-medium text-slate-900">{record.productName}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 120,
      render: (name) => <span className="text-sm text-slate-600">{name}</span>,
    },
    {
      title: 'Konum',
      key: 'locations',
      width: 150,
      render: (_, record) => {
        if (record.fromLocationName && record.toLocationName) {
          return (
            <span className="text-xs text-slate-500">
              {record.fromLocationName} → {record.toLocationName}
            </span>
          );
        }
        return (
          <span className="text-sm text-slate-600">
            {record.toLocationName || record.fromLocationName || '-'}
          </span>
        );
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
        const colorClass = config.direction === 'in' ? 'text-green-600' :
                     config.direction === 'out' ? 'text-red-600' :
                     'text-blue-600';
        const prefix = config.direction === 'in' ? '+' :
                      config.direction === 'out' ? '-' : '';
        return (
          <span className={`text-sm font-semibold ${colorClass}`}>
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
      render: (cost) => (
        <span className="text-sm text-slate-600">
          {cost ? `₺${cost.toLocaleString('tr-TR')}` : '-'}
        </span>
      ),
    },
    {
      title: 'Toplam',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 120,
      align: 'right',
      render: (cost) => (
        <span className="text-sm font-medium text-slate-900">
          {cost ? `₺${cost.toLocaleString('tr-TR')}` : '-'}
        </span>
      ),
    },
    {
      title: 'Referans',
      key: 'reference',
      width: 150,
      render: (_, record) => (
        record.referenceDocumentNumber ? (
          <div>
            <div className="text-xs text-slate-500">{record.referenceDocumentType}</div>
            <div className="text-sm font-medium text-slate-700">{record.referenceDocumentNumber}</div>
          </div>
        ) : <span className="text-slate-400">-</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
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
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              <EllipsisHorizontalIcon className="w-4 h-4 text-sm" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  // Stats
  const totalMovements = summary?.totalMovements || movements.length;
  const totalInbound = summary?.totalInbound || 0;
  const totalOutbound = summary?.totalOutbound || 0;
  const netChange = summary?.netChange || 0;

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Hareket</span>
              <div className="text-2xl font-semibold text-slate-900">{totalMovements}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <SwapOutlined style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Giriş</span>
              <div className="text-2xl font-semibold text-green-600">{totalInbound}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <ArrowUpOutlined style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Çıkış</span>
              <div className="text-2xl font-semibold text-red-600">{totalOutbound}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ef444415' }}>
              <ArrowDownOutlined style={{ color: '#ef4444' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Net Değişim</span>
              <div className={`text-2xl font-semibold ${netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netChange >= 0 ? '+' : ''}{netChange}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf615' }}>
              <ArrowPathIcon className="w-4 h-4 text-violet-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<SwapOutlined />}
        iconColor="#3b82f6"
        title="Stok Hareketleri"
        description="Tüm stok giriş, çıkış ve transferlerini görüntüleyin"
        itemCount={movements.length}
        secondaryActions={
          <div className="flex items-center gap-2">
            <SavedFiltersDropdown
              entityType="stock-movements"
              currentFilters={currentFilters}
              onApplyFilter={handleApplyFilter}
              onClearFilter={handleClearFilter}
            />
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
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <ArrowDownTrayIcon className="w-4 h-4" />
                Dışa Aktar
              </button>
            </Dropdown>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className="w-4 h-4" className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Select
            placeholder="Ürün"
            value={selectedProduct}
            onChange={setSelectedProduct}
            allowClear
            showSearch
            optionFilterProp="label"
            style={{ width: 200 }}
            options={products.map((p) => ({
              value: p.id,
              label: `${p.code} - ${p.name}`,
            }))}
          />
          <Select
            placeholder="Depo"
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
            allowClear
            style={{ width: 180 }}
            options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
          />
          <Select
            placeholder="Hareket Türü"
            value={selectedType}
            onChange={setSelectedType}
            allowClear
            style={{ width: 180 }}
            options={Object.entries(movementTypeConfig).map(([key, value]) => ({
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
            dataSource={movements}
            rowKey="id"
            loading={isLoading}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} hareket`,
            }}
            scroll={{ x: 1500 }}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
