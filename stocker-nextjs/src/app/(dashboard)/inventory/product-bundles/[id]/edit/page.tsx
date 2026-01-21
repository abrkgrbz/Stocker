'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  InputNumber,
  Typography,
  Spin,
  Alert,
  Table,
  AutoComplete,
  Switch,
  Divider,
  Tag,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  GiftIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  useProductBundle,
  useProducts,
  useUpdateProductBundle,
} from '@/lib/api/hooks/useInventory';
import {
  BundleType,
  BundlePricingType,
  type UpdateProductBundleDto,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

interface BundleItem {
  key: string;
  productId: number;
  productCode?: string;
  productName?: string;
  productPrice?: number;
  quantity: number;
  isRequired: boolean;
  isDefault: boolean;
  overridePrice?: number;
  displayOrder: number;
}

const bundleTypes: { value: BundleType; label: string }[] = [
  { value: BundleType.FixedBundle, label: 'Sabit' },
  { value: BundleType.ConfigurableBundle, label: 'Yapılandırılabilir' },
  { value: BundleType.Kit, label: 'Kit' },
  { value: BundleType.Pack, label: 'Paket' },
  { value: BundleType.Combo, label: 'Kombo' },
];

const pricingTypes: { value: BundlePricingType; label: string }[] = [
  { value: BundlePricingType.FixedPrice, label: 'Sabit Fiyat' },
  { value: BundlePricingType.DynamicSum, label: 'Dinamik Toplam' },
  { value: BundlePricingType.DiscountedSum, label: 'İndirimli Toplam' },
  { value: BundlePricingType.PercentageDiscount, label: 'Yüzde İndirim' },
];

export default function EditProductBundlePage() {
  const router = useRouter();
  const params = useParams();
  const bundleId = Number(params.id);
  const [form] = Form.useForm();
  const [items, setItems] = useState<BundleItem[]>([]);
  const [pricingType, setPricingType] = useState<BundlePricingType>(BundlePricingType.FixedPrice);

  const { data: bundle, isLoading, error } = useProductBundle(bundleId);
  const { data: products = [] } = useProducts();
  const updateBundle = useUpdateProductBundle();

  useEffect(() => {
    if (bundle) {
      form.setFieldsValue({
        code: bundle.code,
        name: bundle.name,
        description: bundle.description,
        bundleType: bundle.bundleType,
        pricingType: bundle.pricingType,
        fixedPrice: bundle.fixedPrice,
        discountPercentage: bundle.discountPercentage,
        discountAmount: bundle.discountAmount,
        requireAllItems: bundle.requireAllItems,
        minSelectableItems: bundle.minSelectableItems,
        maxSelectableItems: bundle.maxSelectableItems,
        validFrom: bundle.validFrom ? dayjs(bundle.validFrom) : undefined,
        validTo: bundle.validTo ? dayjs(bundle.validTo) : undefined,
        displayOrder: bundle.displayOrder,
        isActive: bundle.isActive,
      });
      setPricingType(bundle.pricingType);
      if (bundle.items) {
        setItems(
          bundle.items.map((item, index) => ({
            key: `item-${item.id || index}`,
            productId: item.productId,
            productCode: item.productCode,
            productName: item.productName,
            productPrice: item.productPrice,
            quantity: item.quantity,
            isRequired: item.isRequired,
            isDefault: item.isDefault,
            overridePrice: item.overridePrice,
            displayOrder: item.displayOrder,
          }))
        );
      }
    }
  }, [bundle, form]);

  const handleAddItem = () => {
    const newItem: BundleItem = {
      key: `item-${Date.now()}`,
      productId: 0,
      quantity: 1,
      isRequired: true,
      isDefault: true,
      displayOrder: items.length + 1,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const handleItemChange = (key: string, field: keyof BundleItem, value: unknown) => {
    setItems(
      items.map((item) => {
        if (item.key === key) {
          if (field === 'productId' && typeof value === 'number') {
            const product = products.find((p) => p.id === value);
            return {
              ...item,
              productId: value,
              productCode: product?.code,
              productName: product?.name,
              productPrice: product?.unitPrice,
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data: UpdateProductBundleDto = {
        name: values.name,
        description: values.description,
        pricingType: values.pricingType,
        fixedPrice: values.fixedPrice,
        fixedPriceCurrency: 'TRY',
        discountPercentage: values.discountPercentage,
        discountAmount: values.discountAmount,
        requireAllItems: values.requireAllItems,
        minSelectableItems: values.minSelectableItems,
        maxSelectableItems: values.maxSelectableItems,
        validFrom: values.validFrom?.toISOString(),
        validTo: values.validTo?.toISOString(),
        displayOrder: values.displayOrder || 0,
      };

      await updateBundle.mutateAsync({ id: bundleId, data });
      router.push(`/inventory/product-bundles/${bundleId}`);
    } catch {
      // Validation error
    }
  };

  const calculatedTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.overridePrice || item.productPrice || 0;
      return sum + price * (item.quantity || 1);
    }, 0);
  }, [items]);

  const itemColumns: ColumnsType<BundleItem> = [
    {
      title: 'Ürün',
      dataIndex: 'productId',
      key: 'productId',
      width: 300,
      render: (_, record) => (
        <AutoComplete
          placeholder="Ürün seçin..."
          value={record.productName || ''}
          options={products.map((p) => ({
            value: String(p.id),
            label: `${p.code} - ${p.name}`,
          }))}
          onSelect={(value) => handleItemChange(record.key, 'productId', Number(value))}
          filterOption={(input, option) =>
            option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false
          }
          style={{ width: '100%' }}
          className="[&_.ant-select-selector]:!bg-slate-50"
        />
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleItemChange(record.key, 'quantity', value || 1)}
          style={{ width: '100%' }}
          className="[&.ant-input-number]:!bg-slate-50"
        />
      ),
    },
    {
      title: 'Fiyat',
      key: 'price',
      width: 120,
      render: (_, record) => (
        <InputNumber
          placeholder={record.productPrice?.toString() || '0'}
          value={record.overridePrice}
          onChange={(value) => handleItemChange(record.key, 'overridePrice', value)}
          style={{ width: '100%' }}
          prefix="₺"
          className="[&.ant-input-number]:!bg-slate-50"
        />
      ),
    },
    {
      title: 'Zorunlu',
      dataIndex: 'isRequired',
      key: 'isRequired',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Switch
          size="small"
          checked={record.isRequired}
          onChange={(checked) => handleItemChange(record.key, 'isRequired', checked)}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<TrashIcon className="w-4 h-4" />}
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="p-8">
        <Alert
          message="Paket Bulunamadı"
          description="İstenen ürün paketi bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/product-bundles')}>
              Paketlere Dön
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {bundle.name}
                  </h1>
                  <Tag
                    icon={bundle.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />}
                    color={bundle.isActive ? 'success' : 'default'}
                    className="ml-2"
                  >
                    {bundle.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-400 m-0">{bundle.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/inventory/product-bundles/${bundleId}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              onClick={handleSubmit}
              loading={updateBundle.isPending}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Paket Bilgileri */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  <GiftIcon className="w-4 h-4 mr-2" /> Paket Bilgileri
                </h3>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Paket Kodu</label>
                    <Form.Item
                      name="code"
                      rules={[{ required: true, message: 'Kod gerekli' }]}
                      className="mb-0"
                    >
                      <Input
                        placeholder="BND-001"
                        disabled
                        className="!bg-slate-50 !border-slate-300"
                      />
                    </Form.Item>
                  </div>
                  <div className="col-span-8">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Paket Adı <span className="text-red-500">*</span></label>
                    <Form.Item
                      name="name"
                      rules={[{ required: true, message: 'Ad gerekli' }]}
                      className="mb-0"
                    >
                      <Input
                        placeholder="Başlangıç Paketi"
                        className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                      />
                    </Form.Item>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Açıklama</label>
                  <Form.Item name="description" className="mb-0">
                    <TextArea
                      rows={3}
                      placeholder="Paket açıklaması..."
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                    />
                  </Form.Item>
                </div>

                <div className="grid grid-cols-12 gap-4 mt-4">
                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Paket Tipi</label>
                    <Form.Item name="bundleType" className="mb-0">
                      <Select
                        options={bundleTypes}
                        disabled
                        className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>
                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Fiyatlandırma Tipi</label>
                    <Form.Item name="pricingType" className="mb-0">
                      <Select
                        options={pricingTypes}
                        onChange={(value) => setPricingType(value)}
                        className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Paket Ürünleri */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Paket Ürünleri ({items.length})
                  </h3>
                  <Button type="dashed" icon={<PlusIcon className="w-4 h-4" />} onClick={handleAddItem} size="small">
                    Ürün Ekle
                  </Button>
                </div>
                <Table
                  columns={itemColumns}
                  dataSource={items}
                  rowKey="key"
                  pagination={false}
                  size="small"
                  locale={{ emptyText: 'Henüz ürün eklenmedi' }}
                />

                {items.length > 0 && (
                  <>
                    <Divider />
                    <div className="flex justify-end">
                      <div className="text-right">
                        <Text type="secondary">Hesaplanan Toplam:</Text>
                        <div className="text-2xl font-bold text-slate-800">
                          {calculatedTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <Text type="secondary" className="block mt-3 text-xs">
                  Not: Paket ürünleri edit modunda sadece görüntüleme amaçlıdır.
                </Text>
              </div>
            </div>

            <div className="space-y-6">
              {/* Fiyatlandırma */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Fiyatlandırma
                </h3>
                {pricingType === BundlePricingType.FixedPrice && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Sabit Fiyat</label>
                    <Form.Item name="fixedPrice" className="mb-0">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        precision={2}
                        prefix="₺"
                        placeholder="0.00"
                        className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>
                )}

                {(pricingType === BundlePricingType.PercentageDiscount ||
                  pricingType === BundlePricingType.DiscountedSum) && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">İndirim Yüzdesi</label>
                      <Form.Item name="discountPercentage" className="mb-0">
                        <InputNumber
                          style={{ width: '100%' }}
                          min={0}
                          max={100}
                          precision={2}
                          suffix="%"
                          placeholder="0"
                          className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                        />
                      </Form.Item>
                    </div>
                    {pricingType === BundlePricingType.DiscountedSum && (
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">İndirim Tutarı</label>
                        <Form.Item name="discountAmount" className="mb-0">
                          <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            precision={2}
                            prefix="₺"
                            placeholder="0.00"
                            className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                          />
                        </Form.Item>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Geçerlilik */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Geçerlilik
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Başlangıç Tarihi</label>
                    <Form.Item name="validFrom" className="mb-0">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Bitiş Tarihi</label>
                    <Form.Item name="validTo" className="mb-0">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Ayarlar */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Ayarlar
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Text className="text-slate-600">Aktif</Text>
                    <Form.Item name="isActive" valuePropName="checked" className="mb-0">
                      <Switch />
                    </Form.Item>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text className="text-slate-600">Tüm Ürünler Zorunlu</Text>
                    <Form.Item name="requireAllItems" valuePropName="checked" className="mb-0">
                      <Switch />
                    </Form.Item>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Görüntüleme Sırası</label>
                    <Form.Item name="displayOrder" className="mb-0">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
