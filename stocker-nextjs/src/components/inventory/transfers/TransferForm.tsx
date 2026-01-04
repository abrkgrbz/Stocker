'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Table,
  Empty,
} from 'antd';
import {
  ArrowsRightLeftIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useWarehouses, useProducts, useLocations } from '@/lib/api/hooks/useInventory';
import { TransferType, type StockTransferDto, type CreateStockTransferItemDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface TransferFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: StockTransferDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

// Backend TransferType enum ile senkronize
const transferTypes = [
  { value: TransferType.Standard, label: 'Standart' },
  { value: TransferType.Urgent, label: 'Acil' },
  { value: TransferType.Replenishment, label: 'Takviye' },
  { value: TransferType.Return, label: 'İade' },
  { value: TransferType.Internal, label: 'Dahili' },
  { value: TransferType.CrossDock, label: 'Cross-Dock' },
  { value: TransferType.Consolidation, label: 'Konsolidasyon' },
];

export default function TransferForm({ form, initialValues, onFinish, loading }: TransferFormProps) {
  const [transferType, setTransferType] = useState<TransferType>(TransferType.Standard);
  const [sourceWarehouseId, setSourceWarehouseId] = useState<number | undefined>();
  const [destWarehouseId, setDestWarehouseId] = useState<number | undefined>();
  const [items, setItems] = useState<CreateStockTransferItemDto[]>([]);

  const { data: warehouses = [] } = useWarehouses();
  const { data: products = [] } = useProducts();
  const { data: sourceLocations = [] } = useLocations(sourceWarehouseId);
  const { data: destLocations = [] } = useLocations(destWarehouseId);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        transferDate: initialValues.transferDate ? dayjs(initialValues.transferDate) : dayjs(),
        expectedArrivalDate: initialValues.expectedArrivalDate ? dayjs(initialValues.expectedArrivalDate) : undefined,
      });
      setTransferType(initialValues.transferType);
      setSourceWarehouseId(initialValues.sourceWarehouseId);
      setDestWarehouseId(initialValues.destinationWarehouseId);
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
    setItems([...items, { productId: 0, requestedQuantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof CreateStockTransferItemDto, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleFinish = (values: any) => {
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
      width: '30%',
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
      width: '20%',
      render: (_: any, record: CreateStockTransferItemDto, index: number) => (
        <Select
          value={record.sourceLocationId || undefined}
          onChange={(val) => handleItemChange(index, 'sourceLocationId', val)}
          placeholder="Lokasyon"
          allowClear
          style={{ width: '100%' }}
          className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
          options={sourceLocations.map(l => ({
            value: l.id,
            label: l.name,
          }))}
          disabled={!sourceWarehouseId}
        />
      ),
    },
    {
      title: 'Hedef Lokasyon',
      dataIndex: 'destinationLocationId',
      key: 'destinationLocationId',
      width: '20%',
      render: (_: any, record: CreateStockTransferItemDto, index: number) => (
        <Select
          value={record.destinationLocationId || undefined}
          onChange={(val) => handleItemChange(index, 'destinationLocationId', val)}
          placeholder="Lokasyon"
          allowClear
          style={{ width: '100%' }}
          className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
          options={destLocations.map(l => ({
            value: l.id,
            label: l.name,
          }))}
          disabled={!destWarehouseId}
        />
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'requestedQuantity',
      key: 'requestedQuantity',
      width: '15%',
      render: (_: any, record: CreateStockTransferItemDto, index: number) => (
        <InputNumber
          value={record.requestedQuantity}
          onChange={(val) => handleItemChange(index, 'requestedQuantity', val || 1)}
          min={1}
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
            {/* Transfer Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ArrowsRightLeftIcon className="w-5 h-5 text-slate-500" />
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
              <Form.Item name="transferType" className="mb-0" initialValue={TransferType.Standard}>
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
            <div className="grid grid-cols-5 gap-2">
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

          {/* ─────────────── DEPO BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Depo Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kaynak Depo <span className="text-red-500">*</span></label>
                <Form.Item
                  name="sourceWarehouseId"
                  rules={[{ required: true, message: 'Kaynak depo seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Depo seçin"
                    showSearch
                    optionFilterProp="label"
                    onChange={(val) => setSourceWarehouseId(val)}
                    options={warehouses.map(w => ({
                      value: w.id,
                      label: w.name,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hedef Depo <span className="text-red-500">*</span></label>
                <Form.Item
                  name="destinationWarehouseId"
                  rules={[{ required: true, message: 'Hedef depo seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Depo seçin"
                    showSearch
                    optionFilterProp="label"
                    onChange={(val) => setDestWarehouseId(val)}
                    options={warehouses.map(w => ({
                      value: w.id,
                      label: w.name,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── TARİHLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tarihler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Transfer Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="transferDate"
                  rules={[{ required: true, message: 'Transfer tarihi zorunludur' }]}
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
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tahmini Varış</label>
                <Form.Item name="expectedArrivalDate" className="mb-0">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── İSTATİSTİKLER (Edit Mode) ─────────────── */}
          {initialValues && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Transfer İstatistikleri
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-2xl font-semibold text-slate-800">
                    {initialValues.totalRequestedQuantity || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Talep Edilen</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-2xl font-semibold text-slate-800">
                    {initialValues.totalShippedQuantity || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Sevk Edilen</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-2xl font-semibold text-slate-800">
                    {initialValues.totalReceivedQuantity || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Teslim Alınan</div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────── NOTLAR ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    placeholder="Transfer ile ilgili ek notlar..."
                    rows={3}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── TRANSFER KALEMLERİ ─────────────── */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Transfer Kalemleri
              </h3>
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
                description="Henüz ürün eklenmedi"
                className="py-8 bg-slate-50 rounded-lg border border-slate-200"
              >
                <Button
                  type="dashed"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={handleAddItem}
                  className="!border-slate-300 !text-slate-600 hover:!border-slate-400"
                >
                  İlk Ürünü Ekle
                </Button>
              </Empty>
            )}
          </div>

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
