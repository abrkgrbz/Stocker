'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Switch, Button, Table, Popconfirm, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  TagIcon,
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import type {
  PriceListDto,
  PriceListItemDto,
  PriceListCustomerDto,
  CreatePriceListDto,
  AddPriceListItemDto,
  PriceListType,
} from '@/features/sales/types';

// =====================================
// TYPES
// =====================================

interface PriceListFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialData?: PriceListDto | null;
  onSubmit: (values: CreatePriceListDto) => Promise<void>;
  onAddItem?: (item: AddPriceListItemDto) => Promise<void>;
  onUpdateItemPrice?: (itemId: string, unitPrice: number) => Promise<void>;
  onRemoveItem?: (itemId: string) => Promise<void>;
  onAssignCustomer?: (customerId: string, customerName: string) => Promise<void>;
  onRemoveCustomer?: (customerId: string) => Promise<void>;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit' | 'view';
}

interface PriceListFormValues {
  code: string;
  name: string;
  description?: string;
  type: PriceListType;
  currencyCode: string;
  validFrom?: dayjs.Dayjs;
  validTo?: dayjs.Dayjs;
  isTaxIncluded: boolean;
  priority: number;
  isActive: boolean;
}

// =====================================
// CONSTANTS
// =====================================

const priceListTypes: { value: PriceListType; label: string }[] = [
  { value: 'Standard', label: 'Standart' },
  { value: 'Promotional', label: 'Promosyon' },
  { value: 'Contract', label: 'Sözleşme' },
  { value: 'Wholesale', label: 'Toptan' },
  { value: 'Retail', label: 'Perakende' },
];

const currencies = [
  { value: 'TRY', label: 'TRY - Türk Lirası' },
  { value: 'USD', label: 'USD - Amerikan Doları' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - İngiliz Sterlini' },
];

// =====================================
// COMPONENT
// =====================================

export function PriceListForm({
  form,
  initialData,
  onSubmit,
  onAddItem,
  onUpdateItemPrice,
  onRemoveItem,
  onAssignCustomer,
  onRemoveCustomer,
  isSubmitting = false,
  mode = 'create',
}: PriceListFormProps) {
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  // =====================================
  // STATE
  // =====================================
  const [items, setItems] = useState<PriceListItemDto[]>(initialData?.items || []);
  const [customers, setCustomers] = useState<PriceListCustomerDto[]>(initialData?.assignedCustomers || []);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);

  // =====================================
  // EFFECTS
  // =====================================
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        code: initialData.code,
        name: initialData.name,
        description: initialData.description,
        type: initialData.type as PriceListType,
        currencyCode: initialData.currencyCode,
        validFrom: initialData.validFrom ? dayjs(initialData.validFrom) : undefined,
        validTo: initialData.validTo ? dayjs(initialData.validTo) : undefined,
        isTaxIncluded: initialData.isTaxIncluded,
        priority: initialData.priority,
        isActive: initialData.isActive,
      });
      setItems(initialData.items || []);
      setCustomers(initialData.assignedCustomers || []);
    }
  }, [initialData, form]);

  // =====================================
  // COMPUTED VALUES
  // =====================================
  const summary = useMemo(() => {
    const totalItems = items.length;
    const activeItems = items.filter(i => i.isActive).length;
    const avgPrice = items.length > 0
      ? items.reduce((sum, i) => sum + i.unitPrice, 0) / items.length
      : 0;
    return { totalItems, activeItems, avgPrice };
  }, [items]);

  // =====================================
  // HANDLERS
  // =====================================
  const handleFormSubmit = async (values: PriceListFormValues) => {
    const submitData: CreatePriceListDto = {
      code: values.code,
      name: values.name,
      description: values.description,
      type: values.type,
      currencyCode: values.currencyCode,
      validFrom: values.validFrom?.toISOString(),
      validTo: values.validTo?.toISOString(),
      isTaxIncluded: values.isTaxIncluded,
      priority: values.priority,
    };
    await onSubmit(submitData);
  };

  const handleUpdatePrice = async (itemId: string) => {
    if (onUpdateItemPrice && editingPrice > 0) {
      await onUpdateItemPrice(itemId, editingPrice);
      setEditingItemId(null);
      message.success('Fiyat güncellendi');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (onRemoveItem) {
      await onRemoveItem(itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
      message.success('Ürün kaldırıldı');
    }
  };

  const handleRemoveCustomer = async (customerId: string) => {
    if (onRemoveCustomer) {
      await onRemoveCustomer(customerId);
      setCustomers(prev => prev.filter(c => c.customerId !== customerId));
      message.success('Müşteri kaldırıldı');
    }
  };

  // =====================================
  // TABLE COLUMNS
  // =====================================
  const itemColumns: ColumnsType<PriceListItemDto> = [
    {
      title: 'Ürün Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 150,
      render: (value: number, record) => {
        if (editingItemId === record.id) {
          return (
            <div className="flex items-center gap-2">
              <InputNumber
                value={editingPrice}
                onChange={(val) => setEditingPrice(val || 0)}
                min={0}
                precision={2}
                className="w-24"
              />
              <Button size="small" type="primary" onClick={() => handleUpdatePrice(record.id)}>
                Kaydet
              </Button>
              <Button size="small" onClick={() => setEditingItemId(null)}>
                İptal
              </Button>
            </div>
          );
        }
        return (
          <span
            className={!isViewMode ? 'cursor-pointer hover:text-slate-600' : ''}
            onClick={() => {
              if (!isViewMode) {
                setEditingItemId(record.id);
                setEditingPrice(value);
              }
            }}
          >
            {value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
          </span>
        );
      },
    },
    {
      title: 'Min. Miktar',
      dataIndex: 'minQuantity',
      key: 'minQuantity',
      width: 100,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
        }`}>
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    ...(isViewMode ? [] : [{
      title: 'İşlem',
      key: 'action',
      width: 80,
      render: (_: unknown, record: PriceListItemDto) => (
        <Popconfirm
          title="Bu ürünü listeden kaldırmak istediğinize emin misiniz?"
          onConfirm={() => handleRemoveItem(record.id)}
          okText="Evet"
          cancelText="Hayır"
        >
          <Button type="text" danger icon={<TrashIcon className="w-4 h-4" />} />
        </Popconfirm>
      ),
    }]),
  ];

  const customerColumns: ColumnsType<PriceListCustomerDto> = [
    {
      title: 'Müşteri Adı',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Geçerlilik Başlangıç',
      dataIndex: 'validFrom',
      key: 'validFrom',
      width: 150,
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Geçerlilik Bitiş',
      dataIndex: 'validTo',
      key: 'validTo',
      width: 150,
      render: (date?: string) => date ? dayjs(date).format('DD.MM.YYYY') : '-',
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
        }`}>
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    ...(isViewMode ? [] : [{
      title: 'İşlem',
      key: 'action',
      width: 80,
      render: (_: unknown, record: PriceListCustomerDto) => (
        <Popconfirm
          title="Bu müşteriyi listeden kaldırmak istediğinize emin misiniz?"
          onConfirm={() => handleRemoveCustomer(record.customerId)}
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
            <TagIcon className="w-8 h-8 text-slate-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900">
              {isViewMode ? 'Fiyat Listesi Detayı' : isEditMode ? 'Fiyat Listesi Düzenle' : 'Yeni Fiyat Listesi'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Ürün fiyatlarını yönetin ve müşterilere atayın
            </p>
          </div>
          {isEditMode && initialData && (
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{summary.totalItems} Ürün</p>
              <p className="text-sm text-slate-500">
                Ort: {summary.avgPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {initialData.currencyCode}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        disabled={isViewMode}
        initialValues={{
          type: 'Standard',
          currencyCode: 'TRY',
          isTaxIncluded: true,
          priority: 0,
          isActive: true,
        }}
        className="p-6"
      >
        {/* Basic Info Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
            <ClipboardDocumentListIcon className="w-4 h-4" />
            Temel Bilgiler
          </h3>
          <div className="grid grid-cols-12 gap-4">
            <Form.Item
              name="code"
              label="Liste Kodu"
              rules={[{ required: true, message: 'Liste kodu zorunludur' }]}
              className="col-span-4"
            >
              <Input
                placeholder="PL-001"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="name"
              label="Liste Adı"
              rules={[{ required: true, message: 'Liste adı zorunludur' }]}
              className="col-span-4"
            >
              <Input
                placeholder="2024 Standart Fiyat Listesi"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="type"
              label="Liste Tipi"
              className="col-span-4"
            >
              <Select
                options={priceListTypes}
                className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Açıklama"
              className="col-span-12"
            >
              <Input.TextArea
                rows={2}
                placeholder="Liste açıklaması..."
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>
          </div>
        </div>

        {/* Currency & Validity Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
            <CurrencyDollarIcon className="w-4 h-4" />
            Para Birimi & Geçerlilik
          </h3>
          <div className="grid grid-cols-12 gap-4">
            <Form.Item
              name="currencyCode"
              label="Para Birimi"
              rules={[{ required: true, message: 'Para birimi zorunludur' }]}
              className="col-span-3"
            >
              <Select
                options={currencies}
                className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
              />
            </Form.Item>

            <Form.Item
              name="validFrom"
              label="Geçerlilik Başlangıç"
              className="col-span-3"
            >
              <DatePicker
                format="DD.MM.YYYY"
                placeholder="Başlangıç tarihi"
                className="w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="validTo"
              label="Geçerlilik Bitiş"
              className="col-span-3"
            >
              <DatePicker
                format="DD.MM.YYYY"
                placeholder="Bitiş tarihi"
                className="w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="priority"
              label="Öncelik"
              className="col-span-3"
            >
              <InputNumber
                min={0}
                max={100}
                placeholder="0"
                className="w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="isTaxIncluded"
              label="KDV Dahil"
              valuePropName="checked"
              className="col-span-3"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Aktif"
              valuePropName="checked"
              className="col-span-3"
            >
              <Switch />
            </Form.Item>
          </div>
        </div>

        {/* Items Section - Only in edit/view mode */}
        {(isEditMode || isViewMode) && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <CalendarDaysIcon className="w-4 h-4" />
              Ürünler ({items.length})
              {!isViewMode && onAddItem && (
                <Button
                  type="link"
                  size="small"
                  icon={<PlusIcon className="w-4 h-4" />}
                  className="ml-auto"
                >
                  Ürün Ekle
                </Button>
              )}
            </h3>
            <Table
              columns={itemColumns}
              dataSource={items}
              rowKey="id"
              pagination={items.length > 10 ? { pageSize: 10 } : false}
              size="small"
              className="border border-slate-200 rounded-lg"
            />
          </div>
        )}

        {/* Customers Section - Only in edit/view mode */}
        {(isEditMode || isViewMode) && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <UserGroupIcon className="w-4 h-4" />
              Atanan Müşteriler ({customers.length})
              {!isViewMode && onAssignCustomer && (
                <Button
                  type="link"
                  size="small"
                  icon={<PlusIcon className="w-4 h-4" />}
                  className="ml-auto"
                >
                  Müşteri Ata
                </Button>
              )}
            </h3>
            <Table
              columns={customerColumns}
              dataSource={customers}
              rowKey="id"
              pagination={customers.length > 10 ? { pageSize: 10 } : false}
              size="small"
              className="border border-slate-200 rounded-lg"
            />
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

export default PriceListForm;
