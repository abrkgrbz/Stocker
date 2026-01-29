'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Button, Table, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  DocumentMinusIcon,
  DocumentTextIcon,
  CubeIcon,
  CalculatorIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type {
  CreditNoteDto,
  CreditNoteItemDto,
  CreateCreditNoteCommand,
  CreateCreditNoteItemCommand,
  CreditNoteType,
  CreditNoteReason,
} from '@/features/sales/types';

// =====================================
// TYPES
// =====================================

interface CreditNoteFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialData?: CreditNoteDto | null;
  onSubmit: (values: CreateCreditNoteCommand) => Promise<void>;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit' | 'view';
}

interface CreditNoteFormValues {
  invoiceId: string;
  type: CreditNoteType;
  reason: CreditNoteReason;
  reasonDescription?: string;
  salesReturnId?: string;
  notes?: string;
}

interface ItemRow extends CreateCreditNoteItemCommand {
  key: string;
  lineTotal: number;
}

// =====================================
// CONSTANTS
// =====================================

const creditNoteTypes: { value: CreditNoteType; label: string }[] = [
  { value: 'Return', label: 'İade' },
  { value: 'Discount', label: 'İskonto' },
  { value: 'Correction', label: 'Düzeltme' },
  { value: 'Cancellation', label: 'İptal' },
  { value: 'Other', label: 'Diğer' },
];

const creditNoteReasons: { value: CreditNoteReason; label: string }[] = [
  { value: 'ProductReturn', label: 'Ürün İadesi' },
  { value: 'Damaged', label: 'Hasarlı Ürün' },
  { value: 'WrongProduct', label: 'Yanlış Ürün' },
  { value: 'PriceCorrection', label: 'Fiyat Düzeltme' },
  { value: 'QuantityCorrection', label: 'Miktar Düzeltme' },
  { value: 'Discount', label: 'İskonto' },
  { value: 'Cancellation', label: 'Fatura İptali' },
  { value: 'Other', label: 'Diğer' },
];

// =====================================
// COMPONENT
// =====================================

export function CreditNoteForm({
  form,
  initialData,
  onSubmit,
  isSubmitting = false,
  mode = 'create',
}: CreditNoteFormProps) {
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  // =====================================
  // STATE
  // =====================================
  const [items, setItems] = useState<ItemRow[]>([]);

  // =====================================
  // EFFECTS
  // =====================================
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        invoiceId: initialData.invoiceId,
        type: initialData.type as CreditNoteType,
        reason: initialData.reason as CreditNoteReason,
        reasonDescription: initialData.reasonDescription,
        salesReturnId: initialData.salesReturnId,
        notes: initialData.notes,
      });
      // Map existing items
      const mappedItems: ItemRow[] = initialData.items.map((item: CreditNoteItemDto, index: number) => ({
        key: item.id || `item-${index}`,
        invoiceItemId: item.id,
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        discountRate: item.discountRate,
        taxRate: item.taxRate,
        lineTotal: item.lineTotal,
      }));
      setItems(mappedItems);
    }
  }, [initialData, form]);

  // =====================================
  // COMPUTED VALUES
  // =====================================
  const totals = useMemo(() => {
    const subTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalDiscount = items.reduce((sum, item) => {
      const discount = (item.unitPrice * item.quantity * (item.discountRate || 0)) / 100;
      return sum + discount;
    }, 0);
    const totalTax = items.reduce((sum, item) => {
      const taxBase = item.unitPrice * item.quantity * (1 - (item.discountRate || 0) / 100);
      return sum + (taxBase * (item.taxRate || 0)) / 100;
    }, 0);
    const grandTotal = subTotal - totalDiscount + totalTax;
    return { subTotal, totalDiscount, totalTax, grandTotal };
  }, [items]);

  // =====================================
  // HANDLERS
  // =====================================
  const handleFormSubmit = async (values: CreditNoteFormValues) => {
    const submitItems: CreateCreditNoteItemCommand[] = items.map(item => ({
      invoiceItemId: item.invoiceItemId,
      productId: item.productId,
      productCode: item.productCode,
      productName: item.productName,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      discountRate: item.discountRate,
      taxRate: item.taxRate,
    }));

    const submitData: CreateCreditNoteCommand = {
      invoiceId: values.invoiceId,
      type: values.type,
      reason: values.reason,
      reasonDescription: values.reasonDescription,
      salesReturnId: values.salesReturnId,
      notes: values.notes,
      items: submitItems,
    };

    await onSubmit(submitData);
  };

  const addNewItem = () => {
    const newItem: ItemRow = {
      key: `new-${Date.now()}`,
      productCode: '',
      productName: '',
      quantity: 1,
      unit: 'Adet',
      unitPrice: 0,
      discountRate: 0,
      taxRate: 20,
      lineTotal: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (key: string, field: keyof ItemRow, value: unknown) => {
    setItems(prev => prev.map(item => {
      if (item.key !== key) return item;
      const updated = { ...item, [field]: value };
      // Recalculate line total
      const discountedPrice = updated.unitPrice * (1 - (updated.discountRate || 0) / 100);
      const taxAmount = discountedPrice * (updated.taxRate || 0) / 100;
      updated.lineTotal = (discountedPrice + taxAmount) * updated.quantity;
      return updated;
    }));
  };

  const removeItem = (key: string) => {
    setItems(prev => prev.filter(item => item.key !== key));
  };

  // =====================================
  // TABLE COLUMNS
  // =====================================
  const itemColumns: ColumnsType<ItemRow> = [
    {
      title: 'Ürün Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      render: (value: string, record) => isViewMode ? value : (
        <Input
          value={value}
          onChange={(e) => updateItem(record.key, 'productCode', e.target.value)}
          placeholder="Kod"
          className="!bg-slate-50 !border-slate-300"
        />
      ),
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'productName',
      key: 'productName',
      render: (value: string, record) => isViewMode ? value : (
        <Input
          value={value}
          onChange={(e) => updateItem(record.key, 'productName', e.target.value)}
          placeholder="Ürün adı"
          className="!bg-slate-50 !border-slate-300"
        />
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (value: number, record) => isViewMode ? value : (
        <InputNumber
          value={value}
          onChange={(val) => updateItem(record.key, 'quantity', val || 0)}
          min={0}
          className="w-full !bg-slate-50 !border-slate-300"
        />
      ),
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (value: number, record) => isViewMode ?
        value.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : (
        <InputNumber
          value={value}
          onChange={(val) => updateItem(record.key, 'unitPrice', val || 0)}
          min={0}
          precision={2}
          className="w-full !bg-slate-50 !border-slate-300"
        />
      ),
    },
    {
      title: 'İskonto %',
      dataIndex: 'discountRate',
      key: 'discountRate',
      width: 100,
      render: (value: number, record) => isViewMode ? `%${value}` : (
        <InputNumber
          value={value}
          onChange={(val) => updateItem(record.key, 'discountRate', val || 0)}
          min={0}
          max={100}
          precision={2}
          className="w-full !bg-slate-50 !border-slate-300"
        />
      ),
    },
    {
      title: 'KDV %',
      dataIndex: 'taxRate',
      key: 'taxRate',
      width: 100,
      render: (value: number, record) => isViewMode ? `%${value}` : (
        <InputNumber
          value={value}
          onChange={(val) => updateItem(record.key, 'taxRate', val || 0)}
          min={0}
          max={100}
          precision={2}
          className="w-full !bg-slate-50 !border-slate-300"
        />
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'lineTotal',
      key: 'lineTotal',
      width: 120,
      render: (value: number) => (
        <span className="font-medium">
          {value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    ...(isViewMode ? [] : [{
      title: '',
      key: 'action',
      width: 50,
      render: (_: unknown, record: ItemRow) => (
        <Popconfirm
          title="Bu kalemi silmek istediğinize emin misiniz?"
          onConfirm={() => removeItem(record.key)}
          okText="Evet"
          cancelText="Hayır"
        >
          <Button type="text" danger icon={<TrashIcon className="w-4 h-4" />} />
        </Popconfirm>
      ),
    }]),
  ];

  // =====================================
  // RENDER
  // =====================================
  return (
    <div className="bg-white rounded-lg border border-slate-200">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <DocumentMinusIcon className="w-8 h-8 text-slate-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900">
              {isViewMode ? 'Alacak Dekontu Detayı' : isEditMode ? 'Alacak Dekontu Düzenle' : 'Yeni Alacak Dekontu'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              İade, iskonto veya düzeltme için alacak dekontu oluşturun
            </p>
            {initialData && (
              <p className="text-xs text-slate-400 mt-1">
                Dekont No: {initialData.creditNoteNumber}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-red-600">
              -{totals.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY
            </p>
            <p className="text-sm text-slate-500">Toplam Alacak</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        disabled={isViewMode}
        initialValues={{
          type: 'Return',
          reason: 'ProductReturn',
        }}
        className="p-6"
      >
        {/* Credit Note Info Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4" />
            Dekont Bilgileri
          </h3>
          <div className="grid grid-cols-12 gap-4">
            <Form.Item
              name="invoiceId"
              label="Fatura"
              rules={[{ required: true, message: 'Fatura seçimi zorunludur' }]}
              className="col-span-4"
            >
              <Select
                showSearch
                placeholder="Fatura seçin"
                optionFilterProp="label"
                options={[]}
                className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
              />
            </Form.Item>

            <Form.Item
              name="type"
              label="Dekont Tipi"
              rules={[{ required: true, message: 'Dekont tipi zorunludur' }]}
              className="col-span-4"
            >
              <Select
                options={creditNoteTypes}
                className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
              />
            </Form.Item>

            <Form.Item
              name="reason"
              label="Sebep"
              rules={[{ required: true, message: 'Sebep zorunludur' }]}
              className="col-span-4"
            >
              <Select
                options={creditNoteReasons}
                className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
              />
            </Form.Item>

            <Form.Item
              name="salesReturnId"
              label="İlişkili İade"
              className="col-span-4"
            >
              <Select
                showSearch
                allowClear
                placeholder="İade kaydı seçin (opsiyonel)"
                optionFilterProp="label"
                options={[]}
                className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
              />
            </Form.Item>

            <Form.Item
              name="reasonDescription"
              label="Açıklama"
              className="col-span-8"
            >
              <Input
                placeholder="Detaylı açıklama..."
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>
          </div>
        </div>

        {/* Items Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
            <CubeIcon className="w-4 h-4" />
            Kalemler
            {!isViewMode && (
              <Button
                type="link"
                size="small"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={addNewItem}
                className="ml-auto"
              >
                Kalem Ekle
              </Button>
            )}
          </h3>
          <Table
            columns={itemColumns}
            dataSource={items}
            rowKey="key"
            pagination={false}
            size="small"
            className="border border-slate-200 rounded-lg"
          />
        </div>

        {/* Summary Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
            <CalculatorIcon className="w-4 h-4" />
            Özet
          </h3>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6" />
            <div className="col-span-6 space-y-2">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Ara Toplam:</span>
                <span className="font-medium">{totals.subTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">İskonto:</span>
                <span className="font-medium text-green-600">-{totals.totalDiscount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">KDV:</span>
                <span className="font-medium">{totals.totalTax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY</span>
              </div>
              <div className="flex justify-between py-3 bg-slate-50 px-3 rounded-lg">
                <span className="font-bold text-slate-900">Genel Toplam:</span>
                <span className="font-bold text-red-600 text-lg">-{totals.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
            Notlar
          </h3>
          <Form.Item name="notes" className="mb-0">
            <Input.TextArea
              rows={3}
              placeholder="Ek notlar..."
              className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
            />
          </Form.Item>
        </div>

        {/* Status Info - View Mode */}
        {isViewMode && initialData && (
          <div className="mb-8 p-4 bg-slate-50 rounded-lg">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-200">
              Durum Bilgileri
            </h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Durum:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  initialData.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  initialData.status === 'Draft' ? 'bg-slate-100 text-slate-600' :
                  initialData.status === 'Voided' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {initialData.status}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Onay:</span>
                <span className="ml-2">{initialData.isApproved ? 'Onaylandı' : 'Bekliyor'}</span>
              </div>
              <div>
                <span className="text-slate-500">Uygulandı:</span>
                <span className="ml-2 font-medium">{(initialData.appliedAmount || 0).toLocaleString('tr-TR')} TRY</span>
              </div>
              <div>
                <span className="text-slate-500">Kalan:</span>
                <span className="ml-2 font-medium">{(initialData.remainingAmount || 0).toLocaleString('tr-TR')} TRY</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {!isViewMode && (
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button size="large">İptal</Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isSubmitting}
              className="!bg-slate-900 hover:!bg-slate-800"
            >
              {isEditMode ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
}

export default CreditNoteForm;
