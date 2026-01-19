'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  DatePicker,
  InputNumber,
  Select,
  Table,
  Button,
  Empty,
} from 'antd';
import {
  AdjustmentsHorizontalIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useProducts, useWarehouses, useLocations } from '@/lib/api/hooks/useInventory';
import {
  AdjustmentType,
  AdjustmentReason,
  AdjustmentStatus,
  type InventoryAdjustmentDto,
  type CreateInventoryAdjustmentDto,
  type UpdateInventoryAdjustmentDto,
  type CreateInventoryAdjustmentItemDto,
} from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';
import {
  FormSection,
  FormInput,
  FormSelect,
  FormTextArea,
  FormStatGrid,
  useUnsavedChanges,
} from '@/components/forms';

interface InventoryAdjustmentFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: InventoryAdjustmentDto;
  onFinish: (values: CreateInventoryAdjustmentDto | UpdateInventoryAdjustmentDto) => void;
  loading?: boolean;
}

const adjustmentTypes = [
  { value: 'Increase', label: 'Artış' },
  { value: 'Decrease', label: 'Azalış' },
  { value: 'Correction', label: 'Düzeltme' },
  { value: 'Scrap', label: 'Hurda' },
  { value: 'InternalTransfer', label: 'Dahili Transfer' },
];

const adjustmentReasons = [
  { value: 'StockCountVariance', label: 'Sayım Farkı' },
  { value: 'Damage', label: 'Hasar' },
  { value: 'Loss', label: 'Kayıp' },
  { value: 'Theft', label: 'Hırsızlık' },
  { value: 'ProductionScrap', label: 'Üretim Fireleri' },
  { value: 'Expired', label: 'Süresi Dolmuş' },
  { value: 'QualityRejection', label: 'Kalite Reddi' },
  { value: 'CustomerReturn', label: 'Müşteri İadesi' },
  { value: 'SupplierReturn', label: 'Tedarikçi İadesi' },
  { value: 'SystemCorrection', label: 'Sistem Düzeltmesi' },
  { value: 'OpeningStock', label: 'Açılış Stoğu' },
  { value: 'Other', label: 'Diğer' },
];

const adjustmentStatuses = [
  { value: 'Draft', label: 'Taslak' },
  { value: 'PendingApproval', label: 'Onay Bekliyor' },
  { value: 'Approved', label: 'Onaylandı' },
  { value: 'Rejected', label: 'Reddedildi' },
  { value: 'Processed', label: 'İşlendi' },
  { value: 'Cancelled', label: 'İptal Edildi' },
];

export default function InventoryAdjustmentForm({ form, initialValues, onFinish, loading }: InventoryAdjustmentFormProps) {
  const [warehouseId, setWarehouseId] = useState<number | undefined>();
  const [items, setItems] = useState<CreateInventoryAdjustmentItemDto[]>([]);
  const [adjustmentType, setAdjustmentType] = useState<string>('Correction');

  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();
  const { data: locations = [] } = useLocations(warehouseId);

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
        adjustmentDate: initialValues.adjustmentDate ? dayjs(initialValues.adjustmentDate) : dayjs(),
      });
      setWarehouseId(initialValues.warehouseId);
      setAdjustmentType(initialValues.adjustmentType);
      if (initialValues.items) {
        setItems(initialValues.items.map(item => ({
          productId: item.productId,
          systemQuantity: item.systemQuantity,
          actualQuantity: item.actualQuantity,
          unitCost: item.unitCost,
          lotNumber: item.lotNumber,
          serialNumber: item.serialNumber,
          reasonCode: item.reasonCode,
          notes: item.notes,
        })));
      }
    } else {
      form.setFieldsValue({
        adjustmentDate: dayjs(),
        adjustmentType: 'Correction',
        reason: 'StockCountVariance',
      });
    }
  }, [form, initialValues]);

  const handleAddItem = () => {
    setItems([...items, { productId: 0, systemQuantity: 0, actualQuantity: 0, unitCost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof CreateInventoryAdjustmentItemDto, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotalCostImpact = () => {
    return items.reduce((total, item) => {
      const variance = item.actualQuantity - item.systemQuantity;
      return total + (variance * item.unitCost);
    }, 0);
  };

  const handleFinish = (values: any) => {
    markAsSaved();
    onFinish({
      ...values,
      adjustmentDate: values.adjustmentDate?.toISOString(),
      items,
    });
  };

  const columns = [
    {
      title: 'Ürün',
      dataIndex: 'productId',
      key: 'productId',
      width: '25%',
      render: (_: any, record: CreateInventoryAdjustmentItemDto, index: number) => (
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
      title: 'Sistem Miktarı',
      dataIndex: 'systemQuantity',
      key: 'systemQuantity',
      width: '15%',
      render: (_: any, record: CreateInventoryAdjustmentItemDto, index: number) => (
        <InputNumber
          value={record.systemQuantity}
          onChange={(val) => handleItemChange(index, 'systemQuantity', val || 0)}
          min={0}
          precision={4}
          style={{ width: '100%' }}
          className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
        />
      ),
    },
    {
      title: 'Gerçek Miktar',
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
      width: '15%',
      render: (_: any, record: CreateInventoryAdjustmentItemDto, index: number) => (
        <InputNumber
          value={record.actualQuantity}
          onChange={(val) => handleItemChange(index, 'actualQuantity', val || 0)}
          min={0}
          precision={4}
          style={{ width: '100%' }}
          className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
        />
      ),
    },
    {
      title: 'Fark',
      key: 'variance',
      width: '10%',
      render: (_: any, record: CreateInventoryAdjustmentItemDto) => {
        const variance = record.actualQuantity - record.systemQuantity;
        return (
          <span className={`font-semibold ${variance > 0 ? 'text-emerald-600' : variance < 0 ? 'text-red-600' : 'text-slate-500'}`}>
            {variance > 0 ? '+' : ''}{variance.toFixed(2)}
          </span>
        );
      },
    },
    {
      title: 'Birim Maliyet',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: '15%',
      render: (_: any, record: CreateInventoryAdjustmentItemDto, index: number) => (
        <InputNumber
          value={record.unitCost}
          onChange={(val) => handleItemChange(index, 'unitCost', val || 0)}
          min={0}
          precision={2}
          style={{ width: '100%' }}
          className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
        />
      ),
    },
    {
      title: 'Maliyet Etkisi',
      key: 'costImpact',
      width: '10%',
      render: (_: any, record: CreateInventoryAdjustmentItemDto) => {
        const variance = record.actualQuantity - record.systemQuantity;
        const impact = variance * record.unitCost;
        return (
          <span className={`font-semibold ${impact > 0 ? 'text-emerald-600' : impact < 0 ? 'text-red-600' : 'text-slate-500'}`}>
            {impact.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: '5%',
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
            HEADER: Icon + Number + Type Selector
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Adjustment Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <AdjustmentsHorizontalIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Adjustment Number - Title Style */}
            <div className="flex-1">
              <FormInput
                name="adjustmentNumber"
                placeholder="Düzeltme Numarası (Otomatik)..."
                variant="borderless"
                disabled={!!initialValues}
                className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
              />
              <FormInput
                name="description"
                placeholder="Düzeltme açıklaması..."
                variant="borderless"
                className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400 mt-1"
              />
            </div>

            {/* Type Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="adjustmentType" className="mb-0">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {adjustmentTypes.slice(0, 3).map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setAdjustmentType(type.value);
                        form.setFieldValue('adjustmentType', type.value);
                      }}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        adjustmentType === type.value
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

            {/* Status Badge (Edit mode) */}
            {initialValues && (
              <div className="flex-shrink-0">
                <div className="px-3 py-1.5 bg-slate-100 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">
                    {adjustmentStatuses.find(s => s.value === initialValues.status)?.label || initialValues.status}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* Düzeltme Türü */}
          <FormSection title="Düzeltme Türü">
            <div className="grid grid-cols-5 gap-2">
              {adjustmentTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setAdjustmentType(type.value);
                    form.setFieldValue('adjustmentType', type.value);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                    adjustmentType === type.value
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </FormSection>

          {/* Depo & Lokasyon */}
          <FormSection title="Depo & Lokasyon">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormSelect
                  name="warehouseId"
                  label="Depo"
                  required
                  placeholder="Depo seçin"
                  options={warehouses.map(w => ({
                    value: w.id,
                    label: w.name,
                  }))}
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
                  options={locations.map(l => ({
                    value: l.id,
                    label: l.name,
                  }))}
                />
              </div>
            </div>
          </FormSection>

          {/* Tarih & Neden */}
          <FormSection title="Tarih & Neden">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Düzeltme Tarihi <span className="text-red-500">*</span>
                </label>
                <Form.Item
                  name="adjustmentDate"
                  rules={[{ required: true, message: 'Tarih zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <FormSelect
                  name="reason"
                  label="Neden"
                  required
                  placeholder="Neden seçin"
                  options={adjustmentReasons}
                />
              </div>
              <div className="col-span-4">
                <FormInput
                  name="referenceNumber"
                  label="Referans No"
                  placeholder="Referans numarası..."
                />
              </div>
            </div>
          </FormSection>

          {/* Düzeltme Özeti */}
          {items.length > 0 && (
            <FormSection title="Düzeltme Özeti">
              <FormStatGrid
                stats={[
                  {
                    label: 'Toplam Kalem',
                    value: items.length,
                  },
                  {
                    label: 'Artış',
                    value: items.filter(i => i.actualQuantity > i.systemQuantity).length,
                    valueClassName: 'text-emerald-600',
                  },
                  {
                    label: 'Azalış',
                    value: items.filter(i => i.actualQuantity < i.systemQuantity).length,
                    valueClassName: 'text-red-600',
                  },
                  {
                    label: 'Net Maliyet Etkisi',
                    value: calculateTotalCostImpact().toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
                    valueClassName: calculateTotalCostImpact() >= 0 ? 'text-emerald-600' : 'text-red-600',
                  },
                ]}
              />
            </FormSection>
          )}

          {/* Notlar */}
          <FormSection title="Notlar">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormTextArea
                  name="internalNotes"
                  label="Dahili Notlar"
                  placeholder="Dahili kullanım için notlar..."
                  rows={2}
                />
              </div>
              <div className="col-span-6">
                <FormTextArea
                  name="accountingNotes"
                  label="Muhasebe Notları"
                  placeholder="Muhasebe için notlar..."
                  rows={2}
                />
              </div>
            </div>
          </FormSection>

          {/* Düzeltme Kalemleri */}
          <FormSection
            title={`Düzeltme Kalemleri ${items.length > 0 ? `(${items.length})` : ''}`}
            action={
              <Button
                type="dashed"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={handleAddItem}
                size="small"
                className="!border-slate-300 !text-slate-600 hover:!border-slate-400"
              >
                Kalem Ekle
              </Button>
            }
          >
            {items.length > 0 ? (
              <Table
                dataSource={items.map((item, index) => ({ ...item, key: index }))}
                columns={columns}
                pagination={false}
                size="small"
                scroll={{ x: 900 }}
                className="[&_.ant-table]:!border-slate-200 [&_.ant-table-thead_.ant-table-cell]:!bg-slate-50 [&_.ant-table-thead_.ant-table-cell]:!text-slate-600 [&_.ant-table-thead_.ant-table-cell]:!font-medium [&_.ant-table-tbody_.ant-table-cell]:!border-slate-100"
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Henüz düzeltme kalemi eklenmedi"
                className="py-8 bg-slate-50 rounded-lg border border-slate-200"
              >
                <Button
                  type="dashed"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={handleAddItem}
                  className="!border-slate-300 !text-slate-600 hover:!border-slate-400"
                >
                  İlk Kalemi Ekle
                </Button>
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
