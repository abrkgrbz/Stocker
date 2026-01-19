'use client';

import React, { useEffect, useState } from 'react';
import { Form, DatePicker, Table } from 'antd';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import type { PriceListDto, PriceListItemDto, CreatePriceListDto, UpdatePriceListDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  FormHeader,
  FormSection,
  FormInput,
  FormNumber,
  FormSelect,
  FormStatGrid,
  useUnsavedChanges,
  nameFieldRules,
  codeFieldRules,
} from '@/components/forms';

const { RangePicker } = DatePicker;

interface PriceListFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: PriceListDto;
  onFinish: (values: CreatePriceListDto | UpdatePriceListDto) => void;
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

  // Unsaved changes tracking
  const { markAsSaved } = useUnsavedChanges({
    form,
    enabled: true,
    initialValues: initialValues || {},
  });

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
    markAsSaved();
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
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* Header */}
        <FormHeader
          form={form}
          icon={<CurrencyDollarIcon className="w-5 h-5 text-slate-500" />}
          titleField="name"
          titlePlaceholder="Fiyat Listesi Adı Girin..."
          titleRules={nameFieldRules('Fiyat listesi adı', 200)}
          descriptionField="description"
          descriptionPlaceholder="Fiyat listesi hakkında açıklama..."
          showStatusToggle={true}
          statusValue={isActive}
          onStatusChange={setIsActive}
          loading={loading}
        />

        {/* Form Body */}
        <div className="px-8 py-6">

          {/* Temel Bilgiler */}
          <FormSection title="Temel Bilgiler">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormInput
                  name="code"
                  label="Liste Kodu"
                  required
                  placeholder="PL-001"
                  disabled={!!initialValues}
                  rules={codeFieldRules('Liste kodu')}
                />
              </div>
              <div className="col-span-4">
                <FormSelect
                  name="currency"
                  label="Para Birimi"
                  required
                  placeholder="Para birimi seçin"
                  options={CURRENCIES}
                  formItemProps={{ initialValue: 'TRY' }}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="priority"
                  label="Öncelik"
                  placeholder="0"
                  min={0}
                  max={100}
                  formItemProps={{ initialValue: 0 }}
                />
              </div>
            </div>
          </FormSection>

          {/* Fiyatlandırma */}
          <FormSection title="Fiyatlandırma">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormNumber
                  name="globalDiscountPercentage"
                  label="Global İndirim (%)"
                  placeholder="0"
                  min={0}
                  max={100}
                  addonAfter="%"
                />
              </div>
              <div className="col-span-6">
                <FormNumber
                  name="globalMarkupPercentage"
                  label="Global Markup (%)"
                  placeholder="0"
                  min={0}
                  max={1000}
                  addonAfter="%"
                />
              </div>
            </div>
          </FormSection>

          {/* Geçerlilik Süresi */}
          <FormSection title="Geçerlilik Süresi">
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
          </FormSection>

          {/* İstatistikler (Düzenleme Modu) */}
          {initialValues && (
            <FormSection title="İstatistikler">
              <FormStatGrid
                columns={2}
                stats={[
                  { value: initialValues.itemCount || 0, label: 'Ürün Sayısı' },
                  { value: initialValues.priority || 0, label: 'Öncelik' },
                ]}
              />
            </FormSection>
          )}

          {/* Ürün Fiyatları (Düzenleme Modu) */}
          {initialValues && items.length > 0 && (
            <FormSection title={`Ürün Fiyatları (${items.length})`}>
              <Table
                columns={itemColumns}
                dataSource={items}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 5 }}
                className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead>tr>th]:!bg-slate-50 [&_.ant-table-thead>tr>th]:!text-slate-600 [&_.ant-table-tbody>tr>td]:!border-slate-100"
              />
            </FormSection>
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
