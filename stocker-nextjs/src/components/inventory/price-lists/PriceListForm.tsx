'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Switch, Select, InputNumber, DatePicker, Table } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import type { PriceListDto, PriceListItemDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface PriceListFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: PriceListDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const CURRENCIES = [
  { value: 'TRY', label: 'TRY - Türk Lirası' },
  { value: 'USD', label: 'USD - Amerikan Doları' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - İngiliz Sterlini' },
];

export default function PriceListForm({ form, initialValues, onFinish, loading }: PriceListFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [items, setItems] = useState<PriceListItemDto[]>([]);

  useEffect(() => {
    if (initialValues) {
      const formValues = {
        ...initialValues,
        validityRange: initialValues.validFrom || initialValues.validTo
          ? [
              initialValues.validFrom ? dayjs(initialValues.validFrom) : null,
              initialValues.validTo ? dayjs(initialValues.validTo) : null,
            ]
          : undefined,
      };
      form.setFieldsValue(formValues);
      setIsActive(initialValues.isActive ?? true);
      setItems(initialValues.items || []);
    }
  }, [form, initialValues]);

  const handleFinish = (values: any) => {
    const submitData = {
      ...values,
      validFrom: values.validityRange?.[0]?.toISOString(),
      validTo: values.validityRange?.[1]?.toISOString(),
    };
    delete submitData.validityRange;
    onFinish(submitData);
  };

  const itemColumns: ColumnsType<PriceListItemDto> = [
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-800">{record.productName}</div>
          <div className="text-xs text-slate-400">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Fiyat',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price: number, record) => (
        <span className="font-medium text-slate-800">
          {price?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </span>
      ),
    },
    {
      title: 'İndirim',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      align: 'center',
      render: (discount: number) => discount ? <span className="text-slate-600">%{discount}</span> : <span className="text-slate-400">-</span>,
    },
    {
      title: 'Min Miktar',
      dataIndex: 'minQuantity',
      key: 'minQuantity',
      align: 'center',
      render: (val: number) => val ? <span className="text-slate-600">{val}</span> : <span className="text-slate-400">-</span>,
    },
    {
      title: 'Max Miktar',
      dataIndex: 'maxQuantity',
      key: 'maxQuantity',
      align: 'center',
      render: (val: number) => val ? <span className="text-slate-600">{val}</span> : <span className="text-slate-400">-</span>,
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
            HEADER: Icon + Name + Status Toggle
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Price List Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <DollarOutlined className="text-xl text-slate-500" />
              </div>
            </div>

            {/* Price List Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: '' },
                  { max: 200, message: '' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Fiyat Listesi Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Açıklama ekleyin..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Status Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-slate-600">
                  {isActive ? 'Aktif' : 'Pasif'}
                </span>
                <Form.Item name="isActive" valuePropName="checked" noStyle initialValue={true}>
                  <Switch
                    checked={isActive}
                    onChange={(val) => {
                      setIsActive(val);
                      form.setFieldValue('isActive', val);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── TEMEL BİLGİLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Liste Kodu <span className="text-red-500">*</span></label>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: '' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="PL-001"
                    disabled={!!initialValues}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Para Birimi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="currency"
                  rules={[{ required: true, message: '' }]}
                  initialValue="TRY"
                  className="mb-0"
                >
                  <Select
                    options={CURRENCIES}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Öncelik</label>
                <Form.Item name="priority" className="mb-0" initialValue={0}>
                  <InputNumber
                    placeholder="0"
                    min={0}
                    max={100}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── FİYATLANDIRMA ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Fiyatlandırma
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Global İndirim (%)</label>
                <Form.Item name="globalDiscountPercentage" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    min={0}
                    max={100}
                    addonAfter="%"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Global Markup (%)</label>
                <Form.Item name="globalMarkupPercentage" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    min={0}
                    max={1000}
                    addonAfter="%"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── GEÇERLİLİK SÜRESİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Geçerlilik Süresi
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item name="validityRange" className="mb-0">
                  <RangePicker
                    placeholder={['Başlangıç', 'Bitiş']}
                    format="DD.MM.YYYY"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
                <p className="text-xs text-slate-400 mt-1">Boş bırakılırsa sürekli geçerli olur</p>
              </div>
            </div>
          </div>

          {/* ─────────────── İSTATİSTİKLER (Düzenleme Modu) ─────────────── */}
          {initialValues && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                İstatistikler
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.itemCount || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Ürün Sayısı</div>
                  </div>
                </div>
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.priority || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Öncelik</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────── ÜRÜN FİYATLARI (Düzenleme Modu) ─────────────── */}
          {initialValues && items.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Ürün Fiyatları ({items.length})
              </h3>
              <Table
                columns={itemColumns}
                dataSource={items}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 5 }}
                className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead>tr>th]:!bg-slate-50 [&_.ant-table-thead>tr>th]:!text-slate-600 [&_.ant-table-tbody>tr>td]:!border-slate-100"
              />
            </div>
          )}

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
