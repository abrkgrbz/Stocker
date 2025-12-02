'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Space, Form, Affix } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { ProductForm } from '@/components/inventory/products';
import { useCreateProduct } from '@/lib/api/hooks/useInventory';
import type { CreateProductDto } from '@/lib/api/services/inventory.types';

const { Title } = Typography;

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
                <Title level={4} style={{ margin: 0 }}>Yeni Ürün</Title>
                <span className="text-gray-500 text-sm">Yeni ürün oluşturun</span>
              </div>
            </div>
            <Space>
              <Button
                icon={<CloseOutlined />}
                onClick={() => router.push('/inventory/products')}
              >
                İptal
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={createProduct.isPending}
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
          onFinish={handleSubmit}
          loading={createProduct.isPending}
          onCancel={() => router.push('/inventory/products')}
        />
      </div>
    </div>
  );
}
