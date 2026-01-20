'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Alert, Tag, message } from 'antd';
import { Spinner } from '@/components/primitives';
import { ArrowLeftIcon, CheckIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { ProductForm } from '@/components/inventory/products';
import { useProduct, useUpdateProduct, useUploadProductImage } from '@/lib/api/hooks/useInventory';
import type { CreateProductDto, UpdateProductDto } from '@/lib/api/services/inventory.types';

interface ImageFileItem {
  file: File;
  isPrimary: boolean;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);
  const [form] = Form.useForm();

  const { data: product, isLoading, error } = useProduct(productId);
  const updateProduct = useUpdateProduct();
  const uploadImage = useUploadProductImage();

  const handleSubmit = async (values: (CreateProductDto | UpdateProductDto) & { imageFiles?: ImageFileItem[] }) => {
    // Extract image files from values
    const { imageFiles, ...productData } = values;

    try {
      // Update product data
      await updateProduct.mutateAsync({ id: productId, data: productData as UpdateProductDto });

      // If new images were selected, upload them
      if (imageFiles && imageFiles.length > 0) {
        let uploadErrors = 0;

        // Upload images sequentially
        for (const imageItem of imageFiles) {
          try {
            await uploadImage.mutateAsync({
              productId: productId,
              file: imageItem.file,
              options: { setAsPrimary: imageItem.isPrimary },
            });
          } catch (imageError) {
            uploadErrors++;
          }
        }

        if (uploadErrors > 0) {
          message.warning(`Ürün güncellendi ancak ${uploadErrors} resim yüklenemedi. Lütfen tekrar deneyin.`);
        }
      }

      router.push(`/inventory/products/${productId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-8">
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
                    {product.name}
                  </h1>
                  <Tag
                    icon={product.isActive ? <CheckCircleIcon className="w-3 h-3" /> : <ClockIcon className="w-3 h-3" />}
                    color={product.isActive ? 'success' : 'default'}
                    className="ml-2"
                  >
                    {product.isActive ? 'Aktif' : 'Taslak'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-400 m-0">{product.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/inventory/products/${productId}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateProduct.isPending}
              onClick={() => form.submit()}
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
        <ProductForm
          form={form}
          initialValues={product}
          onFinish={handleSubmit}
          loading={updateProduct.isPending}
        />
      </div>
    </div>
  );
}
