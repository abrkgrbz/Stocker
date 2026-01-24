'use client';

import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Table,
  InputNumber,
  Switch,
  message,
} from 'antd';
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  CheckIcon,
  CurrencyDollarIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useCreatePriceList } from '@/lib/api/hooks/usePurchase';
import { useSuppliers } from '@/lib/api/hooks/usePurchase';
import { useProducts } from '@/lib/api/hooks/useInventory';
import type { CreatePriceListDto, CreatePriceListItemDto, PriceListType } from '@/lib/api/services/purchase.types';

const { TextArea } = Input;

interface PriceListItemRow extends CreatePriceListItemDto {
  key: string;
  productName?: string;
}

export default function NewPriceListPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [items, setItems] = useState<PriceListItemRow[]>([]);
  const [isActive, setIsActive] = useState(true);

  const createMutation = useCreatePriceList();
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers();
  const { data: productsData, isLoading: productsLoading } = useProducts();

  const handleAddItem = () => {
    const newItem: PriceListItemRow = {
      key: Date.now().toString(),
      productId: '',
      basePrice: 0,
      minQuantity: 1,
      unit: 'Adet',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };

  const handleItemChange = (key: string, field: keyof PriceListItemRow, value: any) => {
    setItems(items.map(item => {
      if (item.key === key) {
        const updated = { ...item, [field]: value };
        if (field === 'productId') {
          const product = productsData?.find((p: any) => p.id === value);
          if (product) {
            updated.productName = product.name;
            updated.unit = (product as any).unit || 'Adet';
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSubmit = async (values: any) => {
    if (items.length === 0) {
      message.error('En az bir ürün eklemelisiniz');
      return;
    }

    const data: CreatePriceListDto = {
      code: values.code,
      name: values.name,
      description: values.description,
      type: 'Standard' as PriceListType,
      supplierId: values.supplierId,
      currency: values.currency || 'TRY',
      effectiveFrom: values.effectiveFrom?.toISOString() || new Date().toISOString(),
      effectiveTo: values.effectiveTo?.toISOString(),
      isDefault: values.isDefault || false,
      notes: values.notes,
      items: items.map(item => ({
        productId: item.productId,
        basePrice: item.basePrice,
        minQuantity: item.minQuantity || 1,
        unit: item.unit,
        discountPercentage: item.discountPercentage,
      })),
    };

    try {
      await createMutation.mutateAsync(data);
      router.push('/purchase/price-lists');
    } catch (error) {
      // Error handled by hook
    }
  };

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productId',
      key: 'productId',
      width: 250,
      render: (_: any, record: PriceListItemRow) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Ürün seçin"
          value={record.productId || undefined}
          onChange={(value) => handleItemChange(record.key, 'productId', value)}
          showSearch
          optionFilterProp="children"
          loading={productsLoading}
        >
          {productsData?.map((product: any) => (
            <Select.Option key={product.id} value={product.id}>
              {product.name} ({product.sku})
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'basePrice',
      key: 'basePrice',
      width: 140,
      render: (_: any, record: PriceListItemRow) => (
        <InputNumber<number>
          min={0}
          precision={2}
          value={record.basePrice}
          onChange={(value) => handleItemChange(record.key, 'basePrice', value || 0)}
          style={{ width: '100%' }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value: string | undefined) => Number(value?.replace(/,/g, '') ?? 0)}
        />
      ),
    },
    {
      title: 'Min. Miktar',
      dataIndex: 'minQuantity',
      key: 'minQuantity',
      width: 100,
      render: (_: any, record: PriceListItemRow) => (
        <InputNumber
          min={1}
          value={record.minQuantity}
          onChange={(value) => handleItemChange(record.key, 'minQuantity', value || 1)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      render: (_: any, record: PriceListItemRow) => (
        <Select
          value={record.unit}
          onChange={(value) => handleItemChange(record.key, 'unit', value)}
          style={{ width: '100%' }}
        >
          <Select.Option value="Adet">Adet</Select.Option>
          <Select.Option value="Kg">Kg</Select.Option>
          <Select.Option value="Lt">Lt</Select.Option>
          <Select.Option value="Mt">Mt</Select.Option>
          <Select.Option value="Paket">Paket</Select.Option>
        </Select>
      ),
    },
    {
      title: 'İndirim %',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      width: 100,
      render: (_: any, record: PriceListItemRow) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discountPercentage}
          onChange={(value) => handleItemChange(record.key, 'discountPercentage', value || undefined)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_: any, record: PriceListItemRow) => (
        <button
          onClick={() => handleRemoveItem(record.key)}
          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Yeni Fiyat Listesi</h1>
                <p className="text-sm text-slate-500">Tedarikçi fiyat listesi oluşturun</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => form.submit()}
                disabled={createMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                {createMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            currency: 'TRY',
            isDefault: false,
          }}
        >
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Visual Card */}
              <div className="bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl p-8 text-white">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                    <CurrencyDollarIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Fiyat Listesi</h3>
                  <p className="text-sm text-white/70">Tedarikçi fiyatlarını tanımlayın</p>
                </div>
              </div>

              {/* Supplier Selection Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BuildingStorefrontIcon className="w-5 h-5 text-slate-400" />
                  <h3 className="font-medium text-slate-900">Tedarikçi Bilgileri</h3>
                </div>

                <Form.Item name="supplierId" label={<span className="text-sm font-medium text-slate-700">Tedarikçi</span>}>
                  <Select
                    placeholder="Tedarikçi seçin"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    loading={suppliersLoading}
                  >
                    {suppliersData?.items?.map(supplier => (
                      <Select.Option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="currency" label={<span className="text-sm font-medium text-slate-700">Para Birimi</span>}>
                  <Select placeholder="Seçin">
                    <Select.Option value="TRY">TRY (₺)</Select.Option>
                    <Select.Option value="USD">USD ($)</Select.Option>
                    <Select.Option value="EUR">EUR (€)</Select.Option>
                  </Select>
                </Form.Item>
              </div>

              {/* Status Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-sm font-medium text-slate-900">Durum</span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isActive ? 'Liste aktif ve kullanılabilir' : 'Liste pasif durumda'}
                    </p>
                  </div>
                  <Switch
                    checked={isActive}
                    onChange={setIsActive}
                  />
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <Form.Item name="isDefault" valuePropName="checked" className="mb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-slate-900">Varsayılan Liste</span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Bu tedarikçi için varsayılan fiyat listesi
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Basic Info Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: 'Liste adı zorunludur' },
                    { max: 200, message: 'En fazla 200 karakter' },
                  ]}
                  className="mb-4"
                >
                  <Input
                    placeholder="Fiyat listesi adı"
                    className="!text-xl !font-semibold !border-0 !shadow-none !p-0 !text-slate-900 placeholder:!text-slate-300"
                  />
                </Form.Item>

                <Form.Item name="description" className="mb-6">
                  <TextArea
                    placeholder="Liste hakkında açıklama..."
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    className="!border-0 !shadow-none !p-0 !text-slate-600 placeholder:!text-slate-300"
                  />
                </Form.Item>

                <div className="border-t border-slate-100 pt-6">
                  <div className="grid grid-cols-3 gap-4">
                    <Form.Item
                      name="code"
                      label={<span className="text-sm font-medium text-slate-700">Liste Kodu</span>}
                      rules={[{ required: true, message: 'Zorunlu' }]}
                    >
                      <Input placeholder="PL-001" />
                    </Form.Item>

                    <Form.Item
                      name="effectiveFrom"
                      label={<span className="text-sm font-medium text-slate-700">Başlangıç Tarihi</span>}
                    >
                      <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Tarih" />
                    </Form.Item>

                    <Form.Item
                      name="effectiveTo"
                      label={<span className="text-sm font-medium text-slate-700">Bitiş Tarihi</span>}
                    >
                      <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Tarih" />
                    </Form.Item>
                  </div>
                </div>

                <Form.Item
                  name="notes"
                  label={<span className="text-sm font-medium text-slate-700">Notlar</span>}
                >
                  <TextArea rows={2} placeholder="Ek notlar..." />
                </Form.Item>
              </div>

              {/* Price Items Card */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-900">Fiyat Kalemleri</h3>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 border border-dashed border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Ürün Ekle
                    </button>
                  </div>
                </div>
                <Table
                  columns={itemColumns}
                  dataSource={items}
                  pagination={false}
                  size="small"
                  locale={{ emptyText: 'Henüz ürün eklenmedi' }}
                  scroll={{ x: 750 }}
                  className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-600 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wide"
                />
                {items.length > 0 && (
                  <div className="px-6 py-3 border-t border-slate-100 text-right text-sm text-slate-500">
                    Toplam: {items.length} ürün
                  </div>
                )}
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
