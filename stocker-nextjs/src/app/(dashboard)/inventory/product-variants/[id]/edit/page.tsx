'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  InputNumber,
  Typography,
  Row,
  Col,
  Spin,
  Empty,
  Switch,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
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

  const { data: variant, isLoading } = useProductVariant(variantId);
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
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Varyant bulunamadı" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 -mx-6 px-6 py-4 mb-6"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          marginTop: '-24px',
          paddingTop: '24px',
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
              >
                <AppstoreOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">Varyant Düzenle</h1>
                <p className="text-sm text-gray-500 m-0">{variant.name}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.back()}>İptal</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={updateVariant.isPending}
              style={{ background: '#6366f1', borderColor: '#6366f1' }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Form */}
      <Form form={form} layout="vertical">
        <Row gutter={24}>
          <Col xs={24} md={16}>
            {/* Parent Product Info */}
            <Card title="Ana Ürün" className="mb-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  <AppstoreOutlined style={{ fontSize: 24, color: 'white' }} />
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
            </Card>

            {/* Variant Info */}
            <Card title="Varyant Bilgileri" className="mb-6">
              <Form.Item
                name="name"
                label="Varyant Adı"
                rules={[{ required: true, message: 'Varyant adı gerekli' }]}
              >
                <Input placeholder="Kırmızı - XL" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="sku"
                    label="SKU"
                    rules={[{ required: true, message: 'SKU gerekli' }]}
                  >
                    <Input placeholder="PRD-001-RED-XL" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="barcode" label="Barkod">
                    <Input placeholder="1234567890123" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="imageUrl" label="Görsel URL">
                <Input placeholder="https://..." />
              </Form.Item>
            </Card>

            {/* Variant Options - Read Only */}
            {variant.options && variant.options.length > 0 && (
              <Card title="Özellik Değerleri" className="mb-6">
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
              </Card>
            )}
          </Col>

          <Col xs={24} md={8}>
            {/* Pricing */}
            <Card title="Fiyatlandırma" className="mb-6">
              <Row gutter={8}>
                <Col span={16}>
                  <Form.Item name="price" label="Satış Fiyatı">
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      precision={2}
                      placeholder="0.00"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="priceCurrency" label="Para Birimi">
                    <Select
                      options={[
                        { value: 'TRY', label: '₺ TRY' },
                        { value: 'USD', label: '$ USD' },
                        { value: 'EUR', label: '€ EUR' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={8}>
                <Col span={16}>
                  <Form.Item name="costPrice" label="Maliyet">
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      precision={2}
                      placeholder="0.00"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="costPriceCurrency" label="Para Birimi">
                    <Select
                      options={[
                        { value: 'TRY', label: '₺ TRY' },
                        { value: 'USD', label: '$ USD' },
                        { value: 'EUR', label: '€ EUR' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Physical */}
            <Card title="Fiziksel Özellikler" className="mb-6">
              <Form.Item name="weight" label="Ağırlık (kg)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={3}
                  placeholder="0.000"
                />
              </Form.Item>
            </Card>

            {/* Settings */}
            <Card title="Ayarlar">
              <Form.Item name="isActive" label="Aktif" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="isDefault" label="Varsayılan Varyant" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Text type="secondary" className="text-xs">
                Varsayılan varyant, ürünün varsayılan gösterimi olarak kullanılır.
              </Text>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
