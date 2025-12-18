'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Button,
  Table,
  Empty,
  InputNumber,
} from 'antd';
import {
  CalculatorOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useWarehouses, useProducts, useLocations } from '@/lib/api/hooks/useInventory';
import { StockCountType, type StockCountDto, type CreateStockCountItemDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface StockCountFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: StockCountDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const countTypes = [
  { value: StockCountType.Full, label: 'Tam' },
  { value: StockCountType.Cycle, label: 'Döngüsel' },
  { value: StockCountType.Spot, label: 'Spot' },
  { value: StockCountType.Annual, label: 'Yıllık' },
  { value: StockCountType.Category, label: 'Kategori' },
  { value: StockCountType.Location, label: 'Lokasyon' },
];

export default function StockCountForm({ form, initialValues, onFinish, loading }: StockCountFormProps) {
  const [countType, setCountType] = useState<StockCountType>(StockCountType.Full);
  const [autoAdjust, setAutoAdjust] = useState(false);
  const [warehouseId, setWarehouseId] = useState<number | undefined>();
  const [items, setItems] = useState<CreateStockCountItemDto[]>([]);

  const { data: warehouses = [] } = useWarehouses();
  const { data: products = [] } = useProducts();
  const { data: locations = [] } = useLocations(warehouseId);

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

  const handleFinish = (values: any) => {
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
          icon={<DeleteOutlined />}
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
                <CalculatorOutlined className="text-xl text-slate-500" />
              </div>
            </div>

            {/* Count Number - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="countNumber"
                rules={[{ required: true, message: '' }]}
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

          {/* ─────────────── DEPO & LOKASYON ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Depo & Lokasyon
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Depo <span className="text-red-500">*</span></label>
                <Form.Item
                  name="warehouseId"
                  rules={[{ required: true, message: '' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Depo seçin"
                    showSearch
                    optionFilterProp="label"
                    onChange={(val) => setWarehouseId(val)}
                    options={warehouses.map(w => ({
                      value: w.id,
                      label: w.name,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Lokasyon</label>
                <Form.Item name="locationId" className="mb-0">
                  <Select
                    placeholder={warehouseId ? 'Tüm lokasyonlar' : '—'}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    disabled={!warehouseId}
                    options={locations.map(l => ({
                      value: l.id,
                      label: l.name,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── TARİH & AYARLAR ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tarih & Ayarlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sayım Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="countDate"
                  rules={[{ required: true, message: '' }]}
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Otomatik Düzeltme</label>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm text-slate-700">
                      {autoAdjust ? 'Farklar otomatik düzeltilecek' : 'Manuel onay gerekecek'}
                    </div>
                  </div>
                  <Form.Item name="autoAdjust" valuePropName="checked" noStyle>
                    <Switch
                      checked={autoAdjust}
                      onChange={(val) => {
                        setAutoAdjust(val);
                        form.setFieldValue('autoAdjust', val);
                      }}
                      checkedChildren="Evet"
                      unCheckedChildren="Hayır"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────── İSTATİSTİKLER (Edit Mode) ─────────────── */}
          {initialValues && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Sayım İstatistikleri
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-2xl font-semibold text-slate-800">
                    {initialValues.totalItems || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Toplam Kalem</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-2xl font-semibold text-slate-800">
                    {initialValues.countedItems || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Sayılan</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-2xl font-semibold text-orange-600">
                    {initialValues.itemsWithDifferenceCount || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Fark Olan</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className={`text-2xl font-semibold ${(initialValues.totalDifference || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(initialValues.totalDifference || 0) >= 0 ? '+' : ''}{initialValues.totalDifference || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Net Fark</div>
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
                    placeholder="Sayım ile ilgili ek notlar..."
                    rows={3}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── SAYIM KALEMLERİ ─────────────── */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Sayım Kalemleri
              </h3>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
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
                  icon={<PlusOutlined />}
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
