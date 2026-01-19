'use client';

import React, { useEffect, useState } from 'react';
import { Form } from 'antd';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { useWarehouses } from '@/lib/api/hooks/useInventory';
import type { LocationDto, CreateLocationDto, UpdateLocationDto } from '@/lib/api/services/inventory.types';
import {
  FormHeader,
  FormSection,
  FormInput,
  FormNumber,
  FormSelect,
  FormStatGrid,
  useUnsavedChanges,
  nameFieldRules,
  codeFieldRules,
} from '@/components/forms';

interface LocationFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: LocationDto;
  onFinish: (values: CreateLocationDto | UpdateLocationDto) => void;
  loading?: boolean;
  defaultWarehouseId?: number;
}

export default function LocationForm({ form, initialValues, onFinish, loading, defaultWarehouseId }: LocationFormProps) {
  const [isActive, setIsActive] = useState(true);
  const { data: warehouses = [] } = useWarehouses();

  const warehouseOptions = warehouses.map((w) => ({
    value: w.id,
    label: w.name,
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
    } else if (defaultWarehouseId) {
      form.setFieldValue('warehouseId', defaultWarehouseId);
    }
  }, [form, initialValues, defaultWarehouseId]);

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
          icon={<MapPinIcon className="w-5 h-5 text-slate-500" />}
          titleField="name"
          titlePlaceholder="Lokasyon Adı Girin..."
          titleRules={nameFieldRules('Lokasyon adı')}
          descriptionField="description"
          descriptionPlaceholder="Lokasyon hakkında kısa açıklama..."
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
                  label="Lokasyon Kodu"
                  required
                  placeholder="LOC-001"
                  disabled={!!initialValues}
                  rules={codeFieldRules('Lokasyon kodu')}
                />
              </div>
              <div className="col-span-6">
                <FormSelect
                  name="warehouseId"
                  label="Depo"
                  required
                  placeholder="Depo seçin"
                  disabled={!!initialValues}
                  options={warehouseOptions}
                />
              </div>
            </div>
          </FormSection>

          {/* Konum Bilgileri */}
          <FormSection title="Konum Bilgileri">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormInput
                  name="aisle"
                  label="Koridor"
                  placeholder="A"
                />
              </div>
              <div className="col-span-4">
                <FormInput
                  name="shelf"
                  label="Raf"
                  placeholder="01"
                />
              </div>
              <div className="col-span-4">
                <FormInput
                  name="bin"
                  label="Bölme"
                  placeholder="001"
                />
              </div>
            </div>
          </FormSection>

          {/* Kapasite */}
          <FormSection title="Kapasite">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormNumber
                  name="capacity"
                  label="Toplam Kapasite"
                  required
                  placeholder="100"
                  min={1}
                  formItemProps={{ initialValue: 100 }}
                />
              </div>
              {initialValues && (
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Kullanılan Kapasite</label>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 font-medium">
                    {initialValues.usedCapacity} / {initialValues.capacity}
                  </div>
                </div>
              )}
            </div>
          </FormSection>

          {/* İstatistikler (Düzenleme Modu) */}
          {initialValues && (
            <FormSection title="İstatistikler">
              <FormStatGrid
                columns={2}
                stats={[
                  { value: initialValues.productCount || 0, label: 'Ürün Sayısı' },
                  {
                    value: `${initialValues.capacity > 0 ? Math.round((initialValues.usedCapacity / initialValues.capacity) * 100) : 0}%`,
                    label: 'Doluluk Oranı',
                  },
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
