'use client';

/**
 * Stock Movements List Page
 * Monochrome design system following lot-batches design principles
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Select,
  DatePicker,
  Modal,
  Dropdown,
  Spin,
  Button,
  Tooltip,
} from 'antd';
import {
  ArrowDownIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  ArrowUpIcon,
  ArrowUturnLeftIcon,
  DocumentIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  FunnelIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { TableEmptyState } from '@/components/primitives';
import {
  useStockMovements,
  useProducts,
  useWarehouses,
  useReverseStockMovement,
  useStockMovementSummary,
} from '@/lib/api/hooks/useInventory';
import { useAuth } from '@/lib/auth';
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

const { RangePicker } = DatePicker;

// Movement type configuration - Monochrome style
const movementTypeConfig: Record<StockMovementType, { bgColor: string; textColor: string; label: string; direction: 'in' | 'out' | 'transfer' }> = {
  Purchase: { bgColor: 'bg-slate-900', textColor: 'text-white', label: 'Satın Alma', direction: 'in' },
  Sales: { bgColor: 'bg-slate-700', textColor: 'text-white', label: 'Satış', direction: 'out' },
  PurchaseReturn: { bgColor: 'bg-slate-600', textColor: 'text-white', label: 'Satın Alma İadesi', direction: 'out' },
  SalesReturn: { bgColor: 'bg-slate-500', textColor: 'text-white', label: 'Satış İadesi', direction: 'in' },
  Transfer: { bgColor: 'bg-slate-400', textColor: 'text-white', label: 'Transfer', direction: 'transfer' },
  Production: { bgColor: 'bg-slate-800', textColor: 'text-white', label: 'Üretim', direction: 'in' },
  Consumption: { bgColor: 'bg-slate-600', textColor: 'text-white', label: 'Tüketim', direction: 'out' },
  AdjustmentIncrease: { bgColor: 'bg-slate-500', textColor: 'text-white', label: 'Artış Düzeltme', direction: 'in' },
  AdjustmentDecrease: { bgColor: 'bg-slate-500', textColor: 'text-white', label: 'Azalış Düzeltme', direction: 'out' },
  Opening: { bgColor: 'bg-slate-900', textColor: 'text-white', label: 'Açılış', direction: 'in' },
  Counting: { bgColor: 'bg-slate-400', textColor: 'text-white', label: 'Sayım', direction: 'transfer' },
  Damage: { bgColor: 'bg-slate-700', textColor: 'text-white', label: 'Hasar', direction: 'out' },
  Loss: { bgColor: 'bg-slate-700', textColor: 'text-white', label: 'Kayıp', direction: 'out' },
  Found: { bgColor: 'bg-slate-600', textColor: 'text-white', label: 'Bulunan', direction: 'in' },
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
  const { user } = useAuth();
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
    selectedWarehouse,
    selectedProduct,
    dateRange?.[0]?.toISOString() || dayjs().subtract(30, 'day').toISOString(),
    dateRange?.[1]?.toISOString() || dayjs().toISOString()
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
      okButtonProps: { className: '!bg-red-600 hover:!bg-red-700 !border-red-600' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: async () => {
        try {
          await reverseMovement.mutateAsync({
            id: movement.id,
            userId: parseInt(user?.id || '0'),
            description: 'Kullanıcı tarafından tersine çevrildi'
          });
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
            className="text-sm font-medium text-slate-900 cursor-pointer hover:text-slate-600"
            onClick={() => handleView(record.id)}
          >
            {text}
          </span>
          {record.isReversed && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-slate-700 text-white rounded">
              Tersine Çevrildi
            </span>
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
      width: 160,
      render: (type: StockMovementType) => {
        const config = movementTypeConfig[type];
        const icon = config.direction === 'in' ? <ArrowUpIcon className="w-3 h-3" /> :
                    config.direction === 'out' ? <ArrowDownIcon className="w-3 h-3" /> :
                    <ArrowPathIcon className="w-3 h-3" />;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${config.bgColor} ${config.textColor}`}>
            {icon}
            {config.label}
          </span>
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
        const prefix = config.direction === 'in' ? '+' :
                      config.direction === 'out' ? '-' : '';
        return (
          <span className="text-sm font-semibold text-slate-900">
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
            icon: <ArrowUturnLeftIcon className="w-4 h-4" />,
            label: 'Tersine Çevir',
            disabled: record.isReversed,
            danger: true,
            onClick: () => handleReverse(record),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              <EllipsisHorizontalIcon className="w-4 h-4" />
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
    <div className="min-h-screen bg-slate-50 p-8">
      <Spin spinning={isLoading}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <ArrowsRightLeftIcon className="w-7 h-7" />
              Stok Hareketleri
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Tüm stok giriş, çıkış ve transferlerini görüntüleyin
            </p>
          </div>
          <div className="flex items-center gap-3">
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
              <Button
                icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
              >
                Dışa Aktar
              </Button>
            </Dropdown>
            <Tooltip title="Yenile">
              <Button
                icon={<ArrowPathIcon className="w-4 h-4" />}
                className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
                onClick={() => refetch()}
                loading={isLoading}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              onClick={() => router.push('/inventory/stock-movements/new')}
            >
              Yeni Hareket
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Toplam Hareket</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalMovements}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowsRightLeftIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Giriş</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalInbound}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowUpIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Çıkış</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalOutbound}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowDownIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Net Değişim</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {netChange >= 0 ? '+' : ''}{netChange}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
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
            <Tooltip title="Filtreleri Temizle">
              <Button
                icon={<FunnelIcon className="w-4 h-4" />}
                className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
                onClick={handleClearFilter}
              >
                Temizle
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Table
            columns={columns}
            dataSource={movements}
            rowKey="id"
            loading={isLoading}
            locale={{
              emptyText: <TableEmptyState
                icon={ArrowsRightLeftIcon}
                title="Stok hareketi bulunamadi"
                description="Henuz stok hareketi eklenmemis veya filtrelere uygun kayit yok."
              />
            }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-200"
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
              pageSizeOptions: ['20', '50', '100'],
              defaultPageSize: 50,
            }}
            scroll={{ x: 1500 }}
          />
        </div>
      </Spin>
    </div>
  );
}
