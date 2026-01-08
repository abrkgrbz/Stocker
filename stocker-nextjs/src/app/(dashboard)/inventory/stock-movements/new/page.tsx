'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Spin,
  message,
} from 'antd';
import {
  ArrowLeftIcon,
  ArrowsRightLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CubeIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import {
  useProducts,
  useWarehouses,
  useLocations,
  useCreateStockMovement,
} from '@/lib/api/hooks/useInventory';
import type { CreateStockMovementDto, StockMovementType } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

// Movement type configuration with categories
interface MovementTypeConfigItem {
  color: string;
  label: string;
  direction: 'in' | 'out' | 'transfer';
  description: string;
  bgColor: string;
  category: 'in' | 'out' | 'other';
}

const movementTypeConfig: Record<string, MovementTypeConfigItem> = {
  // Giriş İşlemleri
  Purchase: {
    color: '#10b981',
    label: 'Satın Alma',
    direction: 'in',
    description: 'Tedarikçiden ürün girişi',
    bgColor: '#ecfdf5',
    category: 'in',
  },
  SalesReturn: {
    color: '#06b6d4',
    label: 'Satış İadesi',
    direction: 'in',
    description: 'Müşteriden ürün iadesi',
    bgColor: '#ecfeff',
    category: 'in',
  },
  Production: {
    color: '#8b5cf6',
    label: 'Üretim',
    direction: 'in',
    description: 'Üretimden stok girişi',
    bgColor: '#f5f3ff',
    category: 'in',
  },
  Opening: {
    color: '#6366f1',
    label: 'Açılış',
    direction: 'in',
    description: 'Açılış stok girişi',
    bgColor: '#eef2ff',
    category: 'in',
  },
  AdjustmentIncrease: {
    color: '#84cc16',
    label: 'Artış Düzeltme',
    direction: 'in',
    description: 'Sayım fazlası düzeltme',
    bgColor: '#f7fee7',
    category: 'in',
  },
  Found: {
    color: '#059669',
    label: 'Bulunan',
    direction: 'in',
    description: 'Bulunan ürün girişi',
    bgColor: '#ecfdf5',
    category: 'in',
  },
  // Çıkış İşlemleri
  Sales: {
    color: '#ef4444',
    label: 'Satış',
    direction: 'out',
    description: 'Müşteriye ürün çıkışı',
    bgColor: '#fef2f2',
    category: 'out',
  },
  PurchaseReturn: {
    color: '#f97316',
    label: 'Satın Alma İadesi',
    direction: 'out',
    description: 'Tedarikçiye ürün iadesi',
    bgColor: '#fff7ed',
    category: 'out',
  },
  Consumption: {
    color: '#ec4899',
    label: 'Tüketim',
    direction: 'out',
    description: 'Üretim için malzeme çıkışı',
    bgColor: '#fdf2f8',
    category: 'out',
  },
  AdjustmentDecrease: {
    color: '#f59e0b',
    label: 'Azalış Düzeltme',
    direction: 'out',
    description: 'Sayım eksiği düzeltme',
    bgColor: '#fffbeb',
    category: 'out',
  },
  Damage: {
    color: '#dc2626',
    label: 'Hasar',
    direction: 'out',
    description: 'Hasarlı ürün çıkışı',
    bgColor: '#fef2f2',
    category: 'out',
  },
  Loss: {
    color: '#991b1b',
    label: 'Kayıp',
    direction: 'out',
    description: 'Kayıp ürün çıkışı',
    bgColor: '#fef2f2',
    category: 'out',
  },
  // Transfer & Diğer
  Transfer: {
    color: '#3b82f6',
    label: 'Transfer',
    direction: 'transfer',
    description: 'Depolar arası transfer',
    bgColor: '#eff6ff',
    category: 'other',
  },
};

// Group types by category
const groupedTypes = {
  in: Object.entries(movementTypeConfig).filter(([, v]) => v.category === 'in'),
  out: Object.entries(movementTypeConfig).filter(([, v]) => v.category === 'out'),
  other: Object.entries(movementTypeConfig).filter(([, v]) => v.category === 'other'),
};

// Category labels
const categoryLabels = {
  in: { title: 'Stok Giriş İşlemleri', icon: ArrowUpIcon, color: '#10b981' },
  out: { title: 'Stok Çıkış İşlemleri', icon: ArrowDownIcon, color: '#ef4444' },
  other: { title: 'Transfer & Diğer', icon: ArrowsRightLeftIcon, color: '#3b82f6' },
};

// Movement type card component with keyboard support
interface MovementTypeCardProps {
  typeKey: string;
  config: MovementTypeConfigItem;
  isSelected: boolean;
  onSelect: () => void;
  tabIndex: number;
}

const MovementTypeCard: React.FC<MovementTypeCardProps> = ({
  typeKey,
  config,
  isSelected,
  onSelect,
  tabIndex,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <button
      key={typeKey}
      type="button"
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      aria-pressed={isSelected}
      aria-label={`${config.label}: ${config.description}`}
      className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
        isSelected
          ? 'border-slate-900 bg-slate-50 shadow-sm'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white'
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: config.bgColor }}
        >
          {config.direction === 'in' ? (
            <ArrowUpIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: config.color }} />
          ) : config.direction === 'out' ? (
            <ArrowDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: config.color }} />
          ) : (
            <ArrowsRightLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: config.color }} />
          )}
        </div>
        <span className="font-medium text-slate-900 text-sm sm:text-base">{config.label}</span>
      </div>
      <p className="text-xs text-slate-500 line-clamp-2">{config.description}</p>
    </button>
  );
};

export default function NewStockMovementPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [selectedMovementType, setSelectedMovementType] = useState<StockMovementType | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);

  // API Hooks
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: warehouses = [], isLoading: warehousesLoading } = useWarehouses();
  const { data: locations = [] } = useLocations(selectedWarehouseId || undefined);
  const createMovement = useCreateStockMovement();

  // Get selected entities for sidebar display
  const selectedProduct = useMemo(() =>
    products.find(p => p.id === selectedProductId),
    [products, selectedProductId]
  );
  const selectedWarehouse = useMemo(() =>
    warehouses.find(w => w.id === selectedWarehouseId),
    [warehouses, selectedWarehouseId]
  );

  // Generate document number
  const generateDocNumber = () => {
    const prefix = 'STK';
    const date = dayjs().format('YYYYMMDD');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${date}-${random}`;
  };

  const handleSubmit = async (values: CreateStockMovementDto) => {
    try {
      await createMovement.mutateAsync({
        ...values,
        movementDate: values.movementDate ? dayjs(values.movementDate).toISOString() : dayjs().toISOString(),
        userId: 1, // Will be set by backend
      });
      message.success('Stok hareketi başarıyla oluşturuldu');
      router.push('/inventory/stock-movements');
    } catch {
      // Error handled by hook
    }
  };

  const handleMovementTypeChange = useCallback((value: StockMovementType) => {
    setSelectedMovementType(value);
    form.setFieldsValue({ movementType: value });

    // Scroll to form section after selection
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [form]);

  const handleWarehouseChange = (value: number) => {
    setSelectedWarehouseId(value);
    // Clear location when warehouse changes
    form.setFieldsValue({ fromLocationId: undefined, toLocationId: undefined });
  };

  if (productsLoading || warehousesLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const typeConfig = selectedMovementType ? movementTypeConfig[selectedMovementType] : null;

  // Calculate tab indices for keyboard navigation
  let tabIndex = 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-50 px-4 sm:px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push('/inventory/stock-movements')}
              className="!text-slate-500 hover:!text-slate-800"
              aria-label="Geri dön"
            />
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <ArrowsRightLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900 m-0">Yeni Stok Hareketi</h1>
                <p className="text-xs sm:text-sm text-slate-500 m-0">
                  {selectedMovementType
                    ? `${typeConfig?.label} işlemi oluşturuluyor`
                    : 'Hareket türü seçerek başlayın'}
                </p>
              </div>
            </div>
          </div>

          {/* Keyboard shortcut hint */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono">Tab</kbd>
            <span>ile gezin</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono">Enter</kbd>
            <span>ile seçin</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-8">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                documentNumber: generateDocNumber(),
                movementDate: dayjs(),
                quantity: 1,
                unitCost: 0,
              }}
            >
              {/* Movement Type Selection - Grouped */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-6">
                <h3 className="text-base font-semibold text-slate-900 mb-1">Hareket Türü</h3>
                <p className="text-sm text-slate-500 mb-4">İşlem türünü seçerek devam edin</p>

                <Form.Item
                  name="movementType"
                  rules={[{ required: true, message: 'Hareket türü seçiniz' }]}
                  className="mb-0"
                >
                  <div className="space-y-6">
                    {/* Stok Giriş İşlemleri */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: '#ecfdf5' }}>
                          <ArrowUpIcon className="w-3.5 h-3.5" style={{ color: categoryLabels.in.color }} />
                        </div>
                        <h4 className="text-sm font-medium text-slate-700">{categoryLabels.in.title}</h4>
                        <span className="text-xs text-slate-400">({groupedTypes.in.length})</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {groupedTypes.in.map(([key, config]) => (
                          <MovementTypeCard
                            key={key}
                            typeKey={key}
                            config={config}
                            isSelected={selectedMovementType === key}
                            onSelect={() => handleMovementTypeChange(key as StockMovementType)}
                            tabIndex={++tabIndex}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Stok Çıkış İşlemleri */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: '#fef2f2' }}>
                          <ArrowDownIcon className="w-3.5 h-3.5" style={{ color: categoryLabels.out.color }} />
                        </div>
                        <h4 className="text-sm font-medium text-slate-700">{categoryLabels.out.title}</h4>
                        <span className="text-xs text-slate-400">({groupedTypes.out.length})</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {groupedTypes.out.map(([key, config]) => (
                          <MovementTypeCard
                            key={key}
                            typeKey={key}
                            config={config}
                            isSelected={selectedMovementType === key}
                            onSelect={() => handleMovementTypeChange(key as StockMovementType)}
                            tabIndex={++tabIndex}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Transfer & Diğer */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: '#eff6ff' }}>
                          <ArrowsRightLeftIcon className="w-3.5 h-3.5" style={{ color: categoryLabels.other.color }} />
                        </div>
                        <h4 className="text-sm font-medium text-slate-700">{categoryLabels.other.title}</h4>
                        <span className="text-xs text-slate-400">({groupedTypes.other.length})</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {groupedTypes.other.map(([key, config]) => (
                          <MovementTypeCard
                            key={key}
                            typeKey={key}
                            config={config}
                            isSelected={selectedMovementType === key}
                            onSelect={() => handleMovementTypeChange(key as StockMovementType)}
                            tabIndex={++tabIndex}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Form.Item>
              </div>

              {/* Product and Details - shown after type selection */}
              {selectedMovementType && (
                <div ref={formSectionRef}>
                  {/* Document Info */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-6">
                    <h3 className="text-base font-semibold text-slate-900 mb-4">Belge Bilgileri</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Form.Item
                        name="documentNumber"
                        label="Belge No"
                        rules={[{ required: true, message: 'Belge no giriniz' }]}
                      >
                        <Input
                          placeholder="STK-20260108-001"
                          size="large"
                          prefix={<DocumentTextIcon className="w-4 h-4 text-slate-400" />}
                        />
                      </Form.Item>

                      <Form.Item
                        name="movementDate"
                        label="Tarih"
                        rules={[{ required: true, message: 'Tarih seçiniz' }]}
                      >
                        <DatePicker
                          className="w-full"
                          size="large"
                          format="DD/MM/YYYY HH:mm"
                          showTime
                        />
                      </Form.Item>
                    </div>
                  </div>

                  {/* Product Selection */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-6">
                    <h3 className="text-base font-semibold text-slate-900 mb-4">Ürün Bilgileri</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Form.Item
                        name="productId"
                        label="Ürün"
                        rules={[{ required: true, message: 'Ürün seçiniz' }]}
                        className="sm:col-span-2"
                      >
                        <Select
                          showSearch
                          placeholder="Ürün ara ve seç..."
                          optionFilterProp="label"
                          onChange={(value) => setSelectedProductId(value)}
                          filterOption={(input, option) =>
                            String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          options={products.map(p => ({
                            value: p.id,
                            label: `${p.code} - ${p.name}`,
                          }))}
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item
                        name="quantity"
                        label="Miktar"
                        rules={[{ required: true, message: 'Miktar giriniz' }]}
                      >
                        <InputNumber
                          className="w-full"
                          placeholder="0"
                          min={1}
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item
                        name="unitCost"
                        label="Birim Maliyet"
                        rules={[{ required: true, message: 'Birim maliyet giriniz' }]}
                      >
                        <InputNumber
                          className="w-full"
                          placeholder="0.00"
                          min={0}
                          precision={2}
                          size="large"
                          prefix="₺"
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                      </Form.Item>

                      <Form.Item
                        name="serialNumber"
                        label="Seri No"
                      >
                        <Input placeholder="Seri numarası (opsiyonel)" size="large" />
                      </Form.Item>

                      <Form.Item
                        name="lotNumber"
                        label="Lot No"
                      >
                        <Input placeholder="Lot numarası (opsiyonel)" size="large" />
                      </Form.Item>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-6">
                    <h3 className="text-base font-semibold text-slate-900 mb-4">Depo ve Konum</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Form.Item
                        name="warehouseId"
                        label="Depo"
                        rules={[{ required: true, message: 'Depo seçiniz' }]}
                        className="sm:col-span-2"
                      >
                        <Select
                          placeholder="Depo seçiniz"
                          onChange={handleWarehouseChange}
                          options={warehouses.map(w => ({
                            value: w.id,
                            label: `${w.code} - ${w.name}`,
                          }))}
                          size="large"
                        />
                      </Form.Item>

                      {selectedWarehouseId && typeConfig?.direction === 'out' && (
                        <Form.Item
                          name="fromLocationId"
                          label="Kaynak Konum"
                        >
                          <Select
                            placeholder="Kaynak konum seçiniz"
                            allowClear
                            options={locations.map(l => ({
                              value: l.id,
                              label: `${l.code} - ${l.name}`,
                            }))}
                            size="large"
                          />
                        </Form.Item>
                      )}

                      {selectedWarehouseId && typeConfig?.direction === 'in' && (
                        <Form.Item
                          name="toLocationId"
                          label="Hedef Konum"
                        >
                          <Select
                            placeholder="Hedef konum seçiniz"
                            allowClear
                            options={locations.map(l => ({
                              value: l.id,
                              label: `${l.code} - ${l.name}`,
                            }))}
                            size="large"
                          />
                        </Form.Item>
                      )}

                      {selectedWarehouseId && typeConfig?.direction === 'transfer' && (
                        <>
                          <Form.Item
                            name="fromLocationId"
                            label="Kaynak Konum"
                          >
                            <Select
                              placeholder="Kaynak konum"
                              allowClear
                              options={locations.map(l => ({
                                value: l.id,
                                label: `${l.code} - ${l.name}`,
                              }))}
                              size="large"
                            />
                          </Form.Item>
                          <Form.Item
                            name="toLocationId"
                            label="Hedef Konum"
                          >
                            <Select
                              placeholder="Hedef konum"
                              allowClear
                              options={locations.map(l => ({
                                value: l.id,
                                label: `${l.code} - ${l.name}`,
                              }))}
                              size="large"
                            />
                          </Form.Item>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Reference & Description */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-6">
                    <h3 className="text-base font-semibold text-slate-900 mb-4">Referans ve Açıklama</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Form.Item
                        name="referenceDocumentType"
                        label="Referans Belge Türü"
                      >
                        <Select
                          placeholder="Belge türü seçiniz"
                          allowClear
                          options={[
                            { value: 'PurchaseOrder', label: 'Satın Alma Siparişi' },
                            { value: 'SalesOrder', label: 'Satış Siparişi' },
                            { value: 'Invoice', label: 'Fatura' },
                            { value: 'DeliveryNote', label: 'İrsaliye' },
                            { value: 'ProductionOrder', label: 'Üretim Emri' },
                            { value: 'Other', label: 'Diğer' },
                          ]}
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item
                        name="referenceDocumentNumber"
                        label="Referans Belge No"
                      >
                        <Input placeholder="Referans belge numarası" size="large" />
                      </Form.Item>

                      <Form.Item
                        name="description"
                        label="Açıklama"
                        className="sm:col-span-2"
                      >
                        <Input.TextArea
                          placeholder="Hareket ile ilgili notlar..."
                          rows={3}
                          size="large"
                        />
                      </Form.Item>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <Button
                      size="large"
                      onClick={() => router.push('/inventory/stock-movements')}
                      className="w-full sm:w-auto"
                    >
                      İptal
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={createMovement.isPending}
                      icon={<ArrowsRightLeftIcon className="w-4 h-4" />}
                      className="!bg-slate-900 hover:!bg-slate-800 w-full sm:w-auto"
                    >
                      Hareketi Kaydet
                    </Button>
                  </div>
                </div>
              )}
            </Form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Selected Movement Type */}
            {typeConfig && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Hareket Türü</h3>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: typeConfig.bgColor }}
                  >
                    {typeConfig.direction === 'in' ? (
                      <ArrowUpIcon className="w-6 h-6" style={{ color: typeConfig.color }} />
                    ) : typeConfig.direction === 'out' ? (
                      <ArrowDownIcon className="w-6 h-6" style={{ color: typeConfig.color }} />
                    ) : (
                      <ArrowsRightLeftIcon className="w-6 h-6" style={{ color: typeConfig.color }} />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{typeConfig.label}</div>
                    <div className="text-sm text-slate-500">
                      {typeConfig.direction === 'in' ? 'Stok Girişi' :
                       typeConfig.direction === 'out' ? 'Stok Çıkışı' : 'Transfer'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Product */}
            {selectedProduct && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Seçilen Ürün</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                    <CubeIcon className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{selectedProduct.name}</div>
                    <div className="text-sm text-slate-500">{selectedProduct.code}</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Mevcut Stok</span>
                    <span className="font-medium text-slate-900">{selectedProduct.totalStockQuantity || 0}</span>
                  </div>
                  {selectedProduct.unitPrice && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Birim Fiyat</span>
                      <span className="font-medium text-slate-900">₺{selectedProduct.unitPrice.toLocaleString('tr-TR')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selected Warehouse */}
            {selectedWarehouse && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Seçilen Depo</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                    <BuildingOffice2Icon className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{selectedWarehouse.name}</div>
                    <div className="text-sm text-slate-500">{selectedWarehouse.code}</div>
                  </div>
                </div>
                {locations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{locations.length} konum mevcut</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Help */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Bilgi</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Hareket türü, stok miktarının artış veya azalış yönünü belirler.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Belge numarası otomatik oluşturulur, değiştirebilirsiniz.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Seri ve lot numaraları takip edilen ürünler için kullanılır.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Referans belgesi ile hareketi ilişkilendirebilirsiniz.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
