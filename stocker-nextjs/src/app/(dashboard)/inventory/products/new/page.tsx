'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, message } from 'antd';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ProductForm } from '@/components/inventory/products';
import {
  FormLoadingOverlay,
  FormDraftBanner,
  FormAutoSaveIndicator,
  useUnsavedChanges,
  useFormEnhancements,
} from '@/components/forms';
import { useCreateProduct, useUploadProductImage } from '@/lib/api/hooks/useInventory';
import type { CreateProductDto, UpdateProductDto } from '@/lib/api/services/inventory.types';

interface ImageFileItem {
  file: File;
  isPrimary: boolean;
}

export default function NewProductPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createProduct = useCreateProduct();
  const uploadImage = useUploadProductImage();

  // Unsaved changes tracking
  const { confirmIfDirty, markAsSaved } = useUnsavedChanges({
    form,
    enabled: true,
  });

  // Form enhancements: auto-save draft, keyboard shortcuts
  const {
    hasDraft,
    loadDraft,
    clearDraft,
    lastAutoSave,
  } = useFormEnhancements({
    form,
    autoSaveEnabled: true,
    autoSaveInterval: 60000, // 1 minute
    storageKey: 'new_product',
    keyboardShortcutsEnabled: true,
    onSave: () => form.submit(),
  });

  const handleSubmit = async (values: (CreateProductDto | UpdateProductDto) & { imageFiles?: ImageFileItem[] }) => {
    // Extract image files from values
    const { imageFiles, ...productData } = values;

    try {
      // First create the product
      const createdProduct = await createProduct.mutateAsync(productData as CreateProductDto);

      // If images were selected, upload them
      if (imageFiles && imageFiles.length > 0 && createdProduct?.id) {
        let uploadErrors = 0;

        // Upload images sequentially to maintain order
        for (const imageItem of imageFiles) {
          try {
            await uploadImage.mutateAsync({
              productId: createdProduct.id,
              file: imageItem.file,
              options: { setAsPrimary: imageItem.isPrimary },
            });
          } catch (imageError) {
            uploadErrors++;
          }
        }

        if (uploadErrors > 0) {
          message.warning(`Ürün oluşturuldu ancak ${uploadErrors} resim yüklenemedi. Düzenleme sayfasından tekrar deneyebilirsiniz.`);
        }
      }

      // Mark as saved and clear draft
      markAsSaved();
      clearDraft();
      router.push('/inventory/products');
    } catch (error) {
      // Error handled by hook
    }
  };

  // Handle back navigation with unsaved changes check
  const handleBack = () => {
    confirmIfDirty(() => router.back());
  };

  // Handle cancel with unsaved changes check
  const handleCancel = () => {
    confirmIfDirty(() => router.push('/inventory/products'));
  };

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
              onClick={handleBack}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Yeni Ürün
              </h1>
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-400 m-0">Envantere yeni ürün ekleyin</p>
                <FormAutoSaveIndicator lastAutoSave={lastAutoSave} isActive />
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={handleCancel}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createProduct.isPending}
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
        {/* Draft Banner */}
        <FormDraftBanner
          hasDraft={hasDraft}
          onLoadDraft={loadDraft}
          onDiscardDraft={clearDraft}
          lastSaved={lastAutoSave}
        />

        {/* Form with Loading Overlay */}
        <FormLoadingOverlay loading={createProduct.isPending} message="Ürün oluşturuluyor...">
          <ProductForm
            form={form}
            onFinish={handleSubmit}
            loading={createProduct.isPending}
          />
        </FormLoadingOverlay>
      </div>
    </div>
  );
}
