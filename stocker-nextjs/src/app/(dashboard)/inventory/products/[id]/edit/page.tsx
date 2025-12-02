'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Typography, Button, Space, Form, Spin, Alert } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
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
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
          >
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>Ürünü Düzenle</Title>
            <Text type="secondary">{product.code} - {product.name}</Text>
          </div>
        </div>
        <Space>
          <Button onClick={() => router.push(`/inventory/products/${productId}`)}>
            İptal
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={updateProduct.isPending}
            onClick={() => form.submit()}
          >
            Kaydet
          </Button>
        </Space>
      </div>

      {/* Product Form */}
      <ProductForm
        form={form}
        initialValues={product}
        onFinish={handleSubmit}
        loading={updateProduct.isPending}
      />
    </div>
  );
}
