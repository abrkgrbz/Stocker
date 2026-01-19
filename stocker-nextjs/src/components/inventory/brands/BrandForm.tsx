'use client';

import React, { useEffect, useState } from 'react';
import { Form } from 'antd';
import { BuildingOfficeIcon, LinkIcon } from '@heroicons/react/24/outline';
import type { BrandDto, CreateBrandDto, UpdateBrandDto } from '@/lib/api/services/inventory.types';
import {
  FormHeader,
  FormSection,
  FormInput,
  FormStatGrid,
  useUnsavedChanges,
  nameFieldRules,
  codeFieldRules,
  urlFieldRules,
} from '@/components/forms';

interface BrandFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: BrandDto;
  onFinish: (values: CreateBrandDto | UpdateBrandDto) => void;
  loading?: boolean;
}

export default function BrandForm({ form, initialValues, onFinish, loading }: BrandFormProps) {
  const [isActive, setIsActive] = useState(true);

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
    }
  }, [form, initialValues]);

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
          icon={<BuildingOfficeIcon className="w-6 h-6 text-slate-500" />}
          titleField="name"
          titlePlaceholder="Marka Adı Girin..."
          titleRules={nameFieldRules('Marka adı')}
          descriptionField="description"
          descriptionPlaceholder="Marka hakkında kısa açıklama..."
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
                  label="Marka Kodu"
                  required
                  placeholder="BRD-001"
                  disabled={!!initialValues}
                  rules={codeFieldRules('Marka kodu')}
                />
              </div>
              {initialValues && (
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Ürün Sayısı</label>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 font-medium">
                    {initialValues.productCount || 0} ürün
                  </div>
                </div>
              )}
            </div>
          </FormSection>

          {/* Web & Medya */}
          <FormSection title="Web & Medya">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormInput
                  name="website"
                  label="Web Sitesi"
                  placeholder="https://www.example.com"
                  prefix={<LinkIcon className="w-4 h-4 text-slate-400" />}
                  rules={urlFieldRules()}
                />
              </div>
              <div className="col-span-6">
                <FormInput
                  name="logoUrl"
                  label="Logo URL"
                  placeholder="https://www.example.com/logo.png"
                  prefix={<LinkIcon className="w-4 h-4 text-slate-400" />}
                  rules={urlFieldRules()}
                />
              </div>
            </div>
          </FormSection>

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
