'use client';

import React, { useEffect, useState } from 'react';
import { Form } from 'antd';
import { TagIcon } from '@heroicons/react/24/outline';
import { useCategories } from '@/lib/api/hooks/useInventory';
import type { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '@/lib/api/services/inventory.types';
import {
  FormHeader,
  FormSection,
  FormInput,
  FormSelect,
  FormNumber,
  FormStatGrid,
  useUnsavedChanges,
  nameFieldRules,
  codeFieldRules,
  urlFieldRules,
} from '@/components/forms';

interface CategoryFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: CategoryDto;
  onFinish: (values: CreateCategoryDto | UpdateCategoryDto) => void;
  loading?: boolean;
}

export default function CategoryForm({ form, initialValues, onFinish, loading }: CategoryFormProps) {
  const [isActive, setIsActive] = useState(true);

  const { data: categories = [] } = useCategories(true);

  // Filter out the current category and its children from parent options
  const parentOptions = categories
    .filter(c => !initialValues || c.id !== initialValues.id)
    .map(c => ({
      value: c.id,
      label: c.name,
    }));

  // Unsaved changes tracking
  const { markAsSaved } = useUnsavedChanges({
    form,
    enabled: true,
    initialValues: initialValues || {},
  });

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
    } else {
      form.setFieldsValue({
        displayOrder: 0,
        isActive: true,
      });
    }
  }, [form, initialValues]);

  // Handle form submission
  const handleFinish = (values: any) => {
    markAsSaved();
    onFinish(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* Header */}
        <FormHeader
          form={form}
          icon={<TagIcon className="w-6 h-6 text-slate-500" />}
          titleField="name"
          titlePlaceholder="Kategori Adı Girin..."
          titleRules={nameFieldRules('Kategori adı')}
          descriptionField="description"
          descriptionPlaceholder="Kategori hakkında kısa açıklama..."
          showStatusToggle={true}
          statusValue={isActive}
          onStatusChange={setIsActive}
          loading={loading}
        />

        {/* Form Body */}
        <div className="px-8 py-6">

          {/* Temel Bilgiler */}
          <FormSection title="Temel Bilgiler">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormInput
                  name="code"
                  label="Kategori Kodu"
                  required
                  placeholder="CAT-001"
                  disabled={!!initialValues}
                  rules={codeFieldRules('Kategori kodu')}
                />
              </div>
              <div className="col-span-6">
                <FormSelect
                  name="parentCategoryId"
                  label="Üst Kategori"
                  placeholder="Ana kategori seçin (opsiyonel)"
                  allowClear
                  options={parentOptions}
                />
              </div>
            </div>
          </FormSection>

          {/* Görsel ve Sıralama */}
          <FormSection title="Görsel ve Sıralama">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-8">
                <FormInput
                  name="imageUrl"
                  label="Görsel URL"
                  placeholder="https://example.com/category-image.jpg"
                  rules={urlFieldRules()}
                  help="Kategori için görsel URL adresi"
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="displayOrder"
                  label="Görüntüleme Sırası"
                  placeholder="0"
                  min={0}
                  formItemProps={{ initialValue: 0 }}
                  help="Düşük değerler önce gösterilir"
                />
              </div>
            </div>
          </FormSection>

          {/* İstatistikler (Düzenleme Modu) */}
          {initialValues && (
            <FormSection title="İstatistikler">
              <FormStatGrid
                columns={2}
                stats={[
                  { value: initialValues.productCount || 0, label: 'Ürün Sayısı' },
                  { value: initialValues.subCategories?.length || 0, label: 'Alt Kategori' },
                ]}
              />
            </FormSection>
          )}

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
