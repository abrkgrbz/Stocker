'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Table, Empty, InputNumber, Select } from 'antd';
import {
  CalculatorIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useWarehouses, useProducts, useLocations, useStock } from '@/lib/api/hooks/useInventory';
import { StockCountType, type StockCountDto, type CreateStockCountDto, type UpdateStockCountDto, type CreateStockCountItemDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';
import {
  FormSection,
  FormSelect,
  FormDatePicker,
  FormTextArea,
  FormSwitch,
  FormStatGrid,
  useUnsavedChanges,
  requiredRule,
} from '@/components/forms';

interface StockCountFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: StockCountDto;
  onFinish: (values: CreateStockCountDto | UpdateStockCountDto) => void;
  loading?: boolean;
}

// Backend StockCountType enum ile senkronize
const countTypes = [
  { value: StockCountType.Full, label: 'Tam' },
  { value: StockCountType.Cycle, label: 'Döngüsel' },
  { value: StockCountType.Spot, label: 'Spot' },
  { value: StockCountType.Annual, label: 'Yıllık' },
  { value: StockCountType.Category, label: 'Kategori' },
  { value: StockCountType.Location, label: 'Lokasyon' },
  { value: StockCountType.ABC, label: 'ABC Sınıflandırma' },
  { value: StockCountType.Perpetual, label: 'Sürekli' },
];

export default function StockCountForm({ form, initialValues, onFinish, loading }: StockCountFormProps) {
  const [countType, setCountType] = useState<StockCountType>(StockCountType.Full);
  const [autoAdjust, setAutoAdjust] = useState(false);
  const [warehouseId, setWarehouseId] = useState<number | undefined>();
  const [items, setItems] = useState<CreateStockCountItemDto[]>([]);

  const { data: warehouses = [] } = useWarehouses();
  const { data: products = [] } = useProducts();
  const { data: locations = [] } = useLocations(warehouseId);
  const { data: warehouseStocks = [], isLoading: stocksLoading } = useStock(warehouseId);

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: w.name,
  }));

  const locationOptions = locations.map(l => ({
    value: l.id,
    label: l.name,
  }));

  // Unsaved changes tracking
  const { markAsSaved } = useUnsavedChanges({
    form,
    enabled: true,
    initialValues: initialValues || {},
  });

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        countDate: initialValues.countDate ? dayjs(initialValues.countDate) : dayjs(),
      });
      setCountType(initialValues.countType);
      setAutoAdjust(initialValues.autoAdjust ?? false);
      setWarehouseId(initialValues.warehouseId);
      if (initialValues.items) {
        setItems(initialValues.items.map(item => ({
          productId: item.productId,
          systemQuantity: item.systemQuantity,
          locationId: item.locationId,
          serialNumber: item.serialNumber,
          lotNumber: item.lotNumber,
        })));
      }
    } else {
      form.setFieldsValue({
        countDate: dayjs(),
        countType: StockCountType.Full,
        autoAdjust: false,
      });
    }
  }, [form, initialValues]);

  const handleAddItem = () => {
    setItems([...items, { productId: 0, systemQuantity: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof CreateStockCountItemDto, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleLoadAllStocks = () => {
    if (!warehouseStocks || warehouseStocks.length === 0) return;

    const newItems: CreateStockCountItemDto[] = warehouseStocks
      .filter(stock => stock.quantity > 0) // Only include products with stock
      .map(stock => ({
        productId: stock.productId,
        systemQuantity: stock.quantity,
        locationId: stock.locationId || undefined,
      }));

    setItems(newItems);
  };

  const handleFinish = (values: any) => {
    markAsSaved();
    onFinish({
      ...values,
      countDate: values.countDate?.toISOString(),
      items,
    });
  };

  const columns = [
    {
      title: 'Ürün',
      dataIndex: 'productId',
      key: 'productId',
      width: '35%',
      render: (_: any, record: CreateStockCountItemDto, index: number) => (
        <Select
          value={record.productId || undefined}
          onChange={(val) => handleItemChange(index, 'productId', val)}
          placeholder="Ürün seçin"
          showSearch
          optionFilterProp="label"
          style={{ width: '100%' }}
          className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
          options={products.map(p => ({
            value: p.id,
            label: `${p.code} - ${p.name}`,
          }))}
        />
      ),
    },
    {
      title: 'Lokasyon',
      dataIndex: 'locationId',
      key: 'locationId',
      width: '25%',
      render: (_: any, record: CreateStockCountItemDto, index: number) => (
        <Select
          value={record.locationId || undefined}
          onChange={(val) => handleItemChange(index, 'locationId', val)}
          placeholder="Lokasyon"
          allowClear
          style={{ width: '100%' }}
          className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
          options={locations.map(l => ({
            value: l.id,
            label: l.name,
          }))}
          disabled={!warehouseId}
        />
      ),
    },
    {
      title: 'Sistem Miktarı',
      dataIndex: 'systemQuantity',
      key: 'systemQuantity',
      width: '20%',
      render: (_: any, record: CreateStockCountItemDto, index: number) => (
        <InputNumber
          value={record.systemQuantity}
          onChange={(val) => handleItemChange(index, 'systemQuantity', val || 0)}
          min={0}
          style={{ width: '100%' }}
          className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: '10%',
      render: (_: any, __: any, index: number) => (
        <Button
          type="text"
          danger
          icon={<TrashIcon className="w-4 h-4" />}
          onClick={() => handleRemoveItem(index)}
        />
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Name + Type Selector
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Stock Count Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <CalculatorIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Count Number - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="countNumber"
                rules={[{ required: true, message: 'Sayım numarası zorunludur' }]}
                className="mb-0"
              >
                <Input
                  placeholder="Sayım Numarası Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                  disabled={!!initialValues}
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Sayım açıklaması..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Type Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="countType" className="mb-0" initialValue={StockCountType.Full}>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {countTypes.slice(0, 3).map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setCountType(type.value);
                        form.setFieldValue('countType', type.value);
                      }}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        countType === type.value
                          ? 'bg-white shadow-sm text-slate-900'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </Form.Item>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── SAYIM TÜRÜ (Full Selection) ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Sayım Türü
            </h3>
            <div className="grid grid-cols-6 gap-2">
              {countTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setCountType(type.value);
                    form.setFieldValue('countType', type.value);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                    countType === type.value
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Depo & Lokasyon */}
          <FormSection title="Depo & Lokasyon">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormSelect
                  name="warehouseId"
                  label="Depo"
                  required
                  placeholder="Depo seçin"
                  options={warehouseOptions}
                  onChange={(val) => setWarehouseId(val)}
                />
              </div>
              <div className="col-span-6">
                <FormSelect
                  name="locationId"
                  label="Lokasyon"
                  placeholder={warehouseId ? 'Tüm lokasyonlar' : '—'}
                  allowClear
                  disabled={!warehouseId}
                  options={locationOptions}
                />
              </div>
            </div>
          </FormSection>

          {/* Tarih & Ayarlar */}
          <FormSection title="Tarih & Ayarlar">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormDatePicker
                  name="countDate"
                  label="Sayım Tarihi"
                  required
                  placeholder="Tarih seçin"
                />
              </div>
              <div className="col-span-6">
                <FormSwitch
                  form={form}
                  name="autoAdjust"
                  title="Otomatik Düzeltme"
                  value={autoAdjust}
                  onChange={setAutoAdjust}
                  descriptionTrue="Farklar otomatik düzeltilecek"
                  descriptionFalse="Manuel onay gerekecek"
                  checkedChildren="Evet"
                  unCheckedChildren="Hayır"
                  disabled={loading}
                />
              </div>
            </div>
          </FormSection>

          {/* İstatistikler (Edit Mode) */}
          {initialValues && (
            <FormSection title="Sayım İstatistikleri">
              <FormStatGrid
                columns={4}
                stats={[
                  { value: initialValues.totalItems || 0, label: 'Toplam Kalem' },
                  { value: initialValues.countedItems || 0, label: 'Sayılan' },
                  { value: initialValues.itemsWithDifferenceCount || 0, label: 'Fark Olan', variant: 'warning' },
                  {
                    value: `${(initialValues.totalDifference || 0) >= 0 ? '+' : ''}${initialValues.totalDifference || 0}`,
                    label: 'Net Fark',
                    variant: (initialValues.totalDifference || 0) >= 0 ? 'success' : 'danger',
                  },
                ]}
              />
            </FormSection>
          )}

          {/* Notlar */}
          <FormSection title="Notlar">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <FormTextArea
                  name="notes"
                  label="Notlar"
                  placeholder="Sayım ile ilgili ek notlar..."
                  rows={3}
                  formItemProps={{ className: 'mb-0' }}
                />
              </div>
            </div>
          </FormSection>

          {/* Sayım Kalemleri */}
          <FormSection
            title={`Sayım Kalemleri ${items.length > 0 ? `(${items.length})` : ''}`}
            rightContent={
              <div className="flex gap-2">
                {warehouseId && (
                  <Button
                    type="default"
                    icon={<ArrowPathIcon className={`w-4 h-4 ${stocksLoading ? 'animate-spin' : ''}`} />}
                    onClick={handleLoadAllStocks}
                    size="small"
                    loading={stocksLoading}
                    disabled={!warehouseId || warehouseStocks.length === 0}
                    className="!border-slate-300 !text-slate-600 hover:!border-slate-400"
                  >
                    Tüm Stokları Yükle ({warehouseStocks.filter(s => s.quantity > 0).length})
                  </Button>
                )}
                <Button
                  type="dashed"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={handleAddItem}
                  size="small"
                  className="!border-slate-300 !text-slate-600 hover:!border-slate-400"
                >
                  Ürün Ekle
                </Button>
              </div>
            }
          >
            {items.length > 0 ? (
              <Table
                dataSource={items.map((item, index) => ({ ...item, key: index }))}
                columns={columns}
                pagination={false}
                size="small"
                className="[&_.ant-table]:!border-slate-200 [&_.ant-table-thead_.ant-table-cell]:!bg-slate-50 [&_.ant-table-thead_.ant-table-cell]:!text-slate-600 [&_.ant-table-thead_.ant-table-cell]:!font-medium [&_.ant-table-tbody_.ant-table-cell]:!border-slate-100"
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={warehouseId ? "Henüz ürün eklenmedi. 'Tüm Stokları Yükle' ile depodaki stokları ekleyebilirsiniz." : "Önce bir depo seçin, ardından stokları yükleyin."}
                className="py-8 bg-slate-50 rounded-lg border border-slate-200"
              >
                {warehouseId ? (
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="primary"
                      icon={<ArrowPathIcon className={`w-4 h-4 ${stocksLoading ? 'animate-spin' : ''}`} />}
                      onClick={handleLoadAllStocks}
                      loading={stocksLoading}
                      disabled={warehouseStocks.length === 0}
                      style={{ background: '#1e293b', borderColor: '#1e293b' }}
                    >
                      Tüm Stokları Yükle
                    </Button>
                    <Button
                      type="dashed"
                      icon={<PlusIcon className="w-4 h-4" />}
                      onClick={handleAddItem}
                      className="!border-slate-300 !text-slate-600 hover:!border-slate-400"
                    >
                      Tekil Ürün Ekle
                    </Button>
                  </div>
                ) : (
                  <span className="text-slate-400 text-sm">Lütfen önce bir depo seçin</span>
                )}
              </Empty>
            )}
          </FormSection>

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
