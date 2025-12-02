'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Space, Form, Card } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { ProductForm } from '@/components/inventory/products';
import { useCreateProduct } from '@/lib/api/hooks/useInventory';
import type { CreateProductDto } from '@/lib/api/services/inventory.types';

const { Title, Text } = Typography;

export default function NewProductPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createProduct = useCreateProduct();

  const handleSubmit = async (values: CreateProductDto) => {
    try {
      await createProduct.mutateAsync(values);
      router.push('/inventory/products');
    } catch (error) {
      // Error handled by hook
    }
  };

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
            <Title level={2} style={{ margin: 0 }}>Yeni Ürün</Title>
            <Text type="secondary">Yeni ürün oluşturun</Text>
          </div>
        </div>
        <Space>
          <Button onClick={() => router.push('/inventory/products')}>
            İptal
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={createProduct.isPending}
            onClick={() => form.submit()}
          >
            Kaydet
          </Button>
        </Space>
      </div>

      {/* Product Form */}
      <ProductForm
        form={form}
        onFinish={handleSubmit}
        loading={createProduct.isPending}
      />
    </div>
  );
}
