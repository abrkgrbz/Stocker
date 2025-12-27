'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  InputNumber,
  Typography,
  Spin,
  Alert,
  Switch,
  Tag,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CheckIcon,
  Squares2X2Icon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useProductVariant,
  useUpdateProductVariant,
} from '@/lib/api/hooks/useInventory';
import type { UpdateProductVariantDto } from '@/lib/api/services/inventory.types';

const { Text } = Typography;

export default function EditProductVariantPage() {
  const router = useRouter();
  const params = useParams();
  const variantId = Number(params.id);
  const [form] = Form.useForm();

  const { data: variant, isLoading, error } = useProductVariant(variantId);
  const updateVariant = useUpdateProductVariant();

  useEffect(() => {
    if (variant) {
      form.setFieldsValue({
        name: variant.name,
        sku: variant.sku,
        barcode: variant.barcode,
        price: variant.price,
        priceCurrency: variant.priceCurrency || 'TRY',
        costPrice: variant.costPrice,
        costPriceCurrency: variant.costPriceCurrency || 'TRY',
        weight: variant.weight,
        imageUrl: variant.imageUrl,
        isDefault: variant.isDefault,
        isActive: variant.isActive,
      });
    }
  }, [variant, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data: UpdateProductVariantDto = {
        sku: values.sku,
        barcode: values.barcode,
        name: values.name,
        price: values.price,
        priceCurrency: values.priceCurrency || 'TRY',
        costPrice: values.costPrice,
        costPriceCurrency: values.costPriceCurrency || 'TRY',
        weight: values.weight,
        imageUrl: values.imageUrl,
        isDefault: values.isDefault || false,
      };

      await updateVariant.mutateAsync({ id: variantId, data });
      router.push(`/inventory/product-variants/${variantId}`);
    } catch {
      // Validation error
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !variant) {
    return (
      <div className="p-8">
        <Alert
          message="Varyant Bulunamadı"
          description="İstenen ürün varyantı bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/product-variants')}>
              Varyantlara Dön
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
                    {variant.name}
                  </h1>
                  <Tag
                    icon={variant.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    color={variant.isActive ? 'success' : 'default'}
                  >
                    {variant.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-400 m-0">{variant.sku}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/product-variants')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateVariant.isPending}
              onClick={handleSubmit}
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
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Parent Product Info */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Ana Ürün</h3>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    <Squares2X2Icon className="w-4 h-4" style={{ fontSize: 24, color: 'white' }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{variant.productName}</div>
                    <Text type="secondary">{variant.productCode}</Text>
                  </div>
                  <Button
                    type="link"
                    onClick={() => router.push(`/inventory/products/${variant.productId}`)}
                  >
                    Ürüne Git →
                  </Button>
                </div>
              </div>

              {/* Variant Info */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Varyant Bilgileri</h3>
                <Form.Item
                  name="name"
                  label="Varyant Adı"
                  rules={[{ required: true, message: 'Varyant adı gerekli' }]}
                >
                  <Input placeholder="Kırmızı - XL" />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="sku"
                    label="SKU"
                    rules={[{ required: true, message: 'SKU gerekli' }]}
                  >
                    <Input placeholder="PRD-001-RED-XL" />
                  </Form.Item>
                  <Form.Item name="barcode" label="Barkod">
                    <Input placeholder="1234567890123" />
                  </Form.Item>
                </div>

                <Form.Item name="imageUrl" label="Görsel URL">
                  <Input placeholder="https://..." />
                </Form.Item>
              </div>

              {/* Variant Options - Read Only */}
              {variant.options && variant.options.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Özellik Değerleri</h3>
                  <div className="space-y-3">
                    {variant.options.map((option, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded"
                      >
                        <Text type="secondary">{option.attributeName}</Text>
                        <Text strong>{option.value}</Text>
                      </div>
                    ))}
                  </div>
                  <Text type="secondary" className="block mt-3 text-xs">
                    Not: Özellik değerleri oluşturulduktan sonra değiştirilemez.
                  </Text>
                </div>
              )}
            </div>

            {/* Right Column - Settings */}
            <div className="space-y-6">
              {/* Pricing */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Fiyatlandırma</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <Form.Item name="price" label="Satış Fiyatı">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        precision={2}
                        placeholder="0.00"
                      />
                    </Form.Item>
                  </div>
                  <Form.Item name="priceCurrency" label="Para Birimi">
                    <Select
                      options={[
                        { value: 'TRY', label: '₺ TRY' },
                        { value: 'USD', label: '$ USD' },
                        { value: 'EUR', label: '€ EUR' },
                      ]}
                    />
                  </Form.Item>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <Form.Item name="costPrice" label="Maliyet">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        precision={2}
                        placeholder="0.00"
                      />
                    </Form.Item>
                  </div>
                  <Form.Item name="costPriceCurrency" label="Para Birimi">
                    <Select
                      options={[
                        { value: 'TRY', label: '₺ TRY' },
                        { value: 'USD', label: '$ USD' },
                        { value: 'EUR', label: '€ EUR' },
                      ]}
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Physical */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Fiziksel Özellikler</h3>
                <Form.Item name="weight" label="Ağırlık (kg)" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={3}
                    placeholder="0.000"
                  />
                </Form.Item>
              </div>

              {/* Settings */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Ayarlar</h3>
                <div className="space-y-4">
                  <Form.Item name="isActive" label="Aktif" valuePropName="checked" className="mb-2">
                    <Switch />
                  </Form.Item>
                  <Form.Item name="isDefault" label="Varsayılan Varyant" valuePropName="checked" className="mb-0">
                    <Switch />
                  </Form.Item>
                </div>
                <Text type="secondary" className="text-xs mt-2 block">
                  Varsayılan varyant, ürünün varsayılan gösterimi olarak kullanılır.
                </Text>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
