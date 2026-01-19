'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Table, Button, Empty, Select } from 'antd';
import {
  ArrowsRightLeftIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useProducts, useWarehouses, useLocations } from '@/lib/api/hooks/useInventory';
import {
  TransferType,
  TransferStatus,
  type StockTransferDto,
  type CreateStockTransferDto,
  type UpdateStockTransferDto,
  type CreateStockTransferItemDto,
} from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';
import {
  FormSection,
  FormSelect,
  FormDatePicker,
  FormTextArea,
  FormStatGrid,
  useUnsavedChanges,
} from '@/components/forms';

interface StockTransferFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: StockTransferDto;
  onFinish: (values: CreateStockTransferDto | UpdateStockTransferDto) => void;
  loading?: boolean;
}

const transferTypes = [
  { value: TransferType.Standard, label: 'Standart' },
  { value: TransferType.Urgent, label: 'Acil' },
  { value: TransferType.Replenishment, label: 'İkmal' },
  { value: TransferType.Return, label: 'İade' },
  { value: TransferType.Internal, label: 'Dahili' },
  { value: TransferType.CrossDock, label: 'Cross-Dock' },
  { value: TransferType.Consolidation, label: 'Konsolidasyon' },
];

const transferStatuses = [
  { value: TransferStatus.Draft, label: 'Taslak' },
  { value: TransferStatus.Pending, label: 'Beklemede' },
  { value: TransferStatus.Approved, label: 'Onaylandı' },
  { value: TransferStatus.Rejected, label: 'Reddedildi' },
  { value: TransferStatus.InTransit, label: 'Transfer Sürecinde' },
  { value: TransferStatus.Received, label: 'Alındı' },
  { value: TransferStatus.Completed, label: 'Tamamlandı' },
  { value: TransferStatus.Cancelled, label: 'İptal' },
  { value: TransferStatus.PartiallyReceived, label: 'Kısmen Alındı' },
];

export default function StockTransferForm({ form, initialValues, onFinish, loading }: StockTransferFormProps) {
  const [sourceWarehouseId, setSourceWarehouseId] = useState<number | undefined>();
  const [destinationWarehouseId, setDestinationWarehouseId] = useState<number | undefined>();
  const [transferType, setTransferType] = useState<TransferType>(TransferType.Standard);
  const [items, setItems] = useState<CreateStockTransferItemDto[]>([]);

  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();
  const { data: sourceLocations = [] } = useLocations(sourceWarehouseId);
  const { data: destinationLocations = [] } = useLocations(destinationWarehouseId);

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: w.name,
  }));

  const destinationWarehouseOptions = warehouses
    .filter(w => w.id !== sourceWarehouseId)
    .map(w => ({
      value: w.id,
      label: w.name,
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
        transferDate: initialValues.transferDate ? dayjs(initialValues.transferDate) : dayjs(),
        expectedArrivalDate: initialValues.expectedArrivalDate ? dayjs(initialValues.expectedArrivalDate) : null,
      });
      setSourceWarehouseId(initialValues.sourceWarehouseId);
      setDestinationWarehouseId(initialValues.destinationWarehouseId);
      setTransferType(initialValues.transferType as TransferType);
      if (initialValues.items) {
        setItems(initialValues.items.map(item => ({
          productId: item.productId,
          sourceLocationId: item.sourceLocationId,
          destinationLocationId: item.destinationLocationId,
          requestedQuantity: item.requestedQuantity,
          serialNumber: item.serialNumber,
          lotNumber: item.lotNumber,
          notes: item.notes,
        })));
      }
    } else {
      form.setFieldsValue({
        transferDate: dayjs(),
        transferType: TransferType.Standard,
      });
    }
  }, [form, initialValues]);

  const handleAddItem = () => {
    setItems([...items, { productId: 0, requestedQuantity: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof CreateStockTransferItemDto, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotalQuantity = () => {
    return items.reduce((total, item) => total + (item.requestedQuantity || 0), 0);
  };

  const handleFinish = (values: any) => {
    markAsSaved();
    onFinish({
      ...values,
      transferDate: values.transferDate?.toISOString(),
      expectedArrivalDate: values.expectedArrivalDate?.toISOString(),
      items,
    });
  };

  const columns = [
    {
      title: 'Ürün',
      dataIndex: 'productId',
      key: 'productId',
      width: '25%',
      render: (_: any, record: CreateStockTransferItemDto, index: number) => (
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
      title: 'Kaynak Lokasyon',
      dataIndex: 'sourceLocationId',
      key: 'sourceLocationId',
      width: '18%',
      render: (_: any, record: CreateStockTransferItemDto, index: number) => (
        <Select
          value={record.sourceLocationId || undefined}
          onChange={(val) => handleItemChange(index, 'sourceLocationId', val)}
          placeholder="Lokasyon"
          allowClear
          style={{ width: '100%' }}
          className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
          disabled={!sourceWarehouseId}
          options={sourceLocations.map(l => ({
            value: l.id,
            label: l.name,
          }))}
        />
      ),
    },
    {
      title: 'Hedef Lokasyon',
      dataIndex: 'destinationLocationId',
      key: 'destinationLocationId',
      width: '18%',
      render: (_: any, record: CreateStockTransferItemDto, index: number) => (
        <Select
          value={record.destinationLocationId || undefined}
          onChange={(val) => handleItemChange(index, 'destinationLocationId', val)}
          placeholder="Lokasyon"
          allowClear
          style={{ width: '100%' }}
          className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
          disabled={!destinationWarehouseId}
          options={destinationLocations.map(l => ({
            value: l.id,
            label: l.name,
          }))}
        />
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'requestedQuantity',
      key: 'requestedQuantity',
      width: '12%',
      render: (_: any, record: CreateStockTransferItemDto, index: number) => (
        <InputNumber
          value={record.requestedQuantity}
          onChange={(val) => handleItemChange(index, 'requestedQuantity', val || 0)}
          min={0}
          precision={4}
          style={{ width: '100%' }}
          className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
        />
      ),
    },
    {
      title: 'Lot/Seri No',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      width: '15%',
      render: (_: any, record: CreateStockTransferItemDto, index: number) => (
        <Input
          value={record.lotNumber || record.serialNumber || ''}
          onChange={(e) => handleItemChange(index, 'lotNumber', e.target.value)}
          placeholder="Lot/Seri"
          className="!bg-slate-50 !border-slate-300"
        />
      ),
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
            HEADER: Icon + Transfer Number + Type Selector
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Transfer Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ArrowsRightLeftIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Transfer Number - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="transferNumber"
                rules={[{ required: true, message: 'Transfer numarası zorunludur' }]}
                className="mb-0"
              >
                <Input
                  placeholder="Transfer Numarası Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                  disabled={!!initialValues}
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Transfer açıklaması..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Type Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="transferType" className="mb-0">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {transferTypes.slice(0, 3).map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setTransferType(type.value);
                        form.setFieldValue('transferType', type.value);
                      }}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        transferType === type.value
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
                    {transferStatuses.find(s => s.value === initialValues.status)?.label || initialValues.status}
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

          {/* ─────────────── TRANSFER TÜRÜ (Full Selection) ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Transfer Türü
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {transferTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setTransferType(type.value);
                    form.setFieldValue('transferType', type.value);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                    transferType === type.value
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kaynak & Hedef Depo */}
          <FormSection title="Kaynak & Hedef Depo">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormSelect
                  name="sourceWarehouseId"
                  label="Kaynak Depo"
                  required
                  placeholder="Kaynak depo seçin"
                  options={warehouseOptions}
                  onChange={(val) => setSourceWarehouseId(val)}
                />
              </div>
              <div className="col-span-6">
                <FormSelect
                  name="destinationWarehouseId"
                  label="Hedef Depo"
                  required
                  placeholder="Hedef depo seçin"
                  options={destinationWarehouseOptions}
                  onChange={(val) => setDestinationWarehouseId(val)}
                />
              </div>
            </div>
          </FormSection>

          {/* Tarihler */}
          <FormSection title="Tarihler">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormDatePicker
                  name="transferDate"
                  label="Transfer Tarihi"
                  required
                  placeholder="Tarih seçin"
                />
              </div>
              <div className="col-span-6">
                <FormDatePicker
                  name="expectedArrivalDate"
                  label="Beklenen Varış Tarihi"
                  placeholder="Tarih seçin"
                />
              </div>
            </div>
          </FormSection>

          {/* Transfer Özeti */}
          {items.length > 0 && (
            <FormSection title="Transfer Özeti">
              <FormStatGrid
                columns={initialValues ? 3 : 2}
                stats={[
                  { value: items.length, label: 'Toplam Kalem' },
                  { value: calculateTotalQuantity().toLocaleString('tr-TR', { maximumFractionDigits: 2 }), label: 'Toplam Miktar' },
                  ...(initialValues ? [{ value: initialValues.totalReceivedQuantity?.toLocaleString('tr-TR') || 0, label: 'Alınan Miktar', variant: 'success' as const }] : []),
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
                  placeholder="Transfer ile ilgili ek notlar..."
                  rows={3}
                  formItemProps={{ className: 'mb-0' }}
                />
              </div>
            </div>
          </FormSection>

          {/* Transfer Kalemleri */}
          <FormSection
            title={`Transfer Kalemleri ${items.length > 0 ? `(${items.length})` : ''}`}
            rightContent={
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
                description="Henüz transfer kalemi eklenmedi"
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
