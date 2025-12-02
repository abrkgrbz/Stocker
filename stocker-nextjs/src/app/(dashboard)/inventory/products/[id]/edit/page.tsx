'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Typography, Button, Space, Form, Spin, Alert, Affix, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CloseOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { ProductForm } from '@/components/inventory/products';
import { useProduct, useUpdateProduct } from '@/lib/api/hooks/useInventory';
import type { UpdateProductDto } from '@/lib/api/services/inventory.types';

const { Title, Text } = Typography;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);
  const [form] = Form.useForm();

  const { data: product, isLoading, error } = useProduct(productId);
  const updateProduct = useUpdateProduct();

  const handleSubmit = async (values: UpdateProductDto) => {
    try {
      await updateProduct.mutateAsync({ id: productId, data: values });
      router.push(`/inventory/products/${productId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6">
        <Alert
          message="Ürün Bulunamadı"
          description="İstenen ürün bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/products')}>
              Ürünlere Dön
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <Affix offsetTop={0}>
        <div className="bg-white border-b shadow-sm px-6 py-4">
          <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-4">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
                type="text"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Title level={4} style={{ margin: 0 }}>Ürünü Düzenle</Title>
                  {product.isActive ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>Aktif</Tag>
                  ) : (
                    <Tag color="default" icon={<StopOutlined />}>Pasif</Tag>
                  )}
                </div>
                <Text type="secondary">{product.code} - {product.name}</Text>
              </div>
            </div>
            <Space>
              <Button
                icon={<CloseOutlined />}
                onClick={() => router.push(`/inventory/products/${productId}`)}
              >
                İptal
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={updateProduct.isPending}
                onClick={() => form.submit()}
                size="large"
              >
                Kaydet
              </Button>
            </Space>
          </div>
        </div>
      </Affix>

      {/* Page Content */}
      <div className="p-6 max-w-screen-2xl mx-auto">
        <ProductForm
          form={form}
          initialValues={product}
          onFinish={handleSubmit}
          loading={updateProduct.isPending}
          onCancel={() => router.push(`/inventory/products/${productId}`)}
        />
      </div>
    </div>
  );
}
