'use client';

import React, { useEffect, useState } from 'react';
import { Form } from 'antd';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { useProducts, useWarehouses, useSuppliers, useUnits } from '@/lib/api/hooks/useInventory';
import type { QualityControlDto, CreateQualityControlDto, UpdateQualityControlDto } from '@/lib/api/services/inventory.types';
import {
  FormSection,
  FormInput,
  FormTextArea,
  FormSelect,
  FormNumber,
  useUnsavedChanges,
} from '@/components/forms';

interface QualityControlFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: QualityControlDto;
  onFinish: (values: CreateQualityControlDto | UpdateQualityControlDto) => void;
  loading?: boolean;
}

const qcTypeOptions = [
  { value: 1, label: 'Giriş Denetimi' },
  { value: 2, label: 'Çıkış Denetimi' },
  { value: 3, label: 'Süreç İçi Denetim' },
  { value: 4, label: 'Final Denetimi' },
  { value: 5, label: 'Periyodik Denetim' },
  { value: 6, label: 'Müşteri Şikayeti' },
  { value: 7, label: 'İade Denetimi' },
];

export default function QualityControlForm({ form, initialValues, onFinish, loading }: QualityControlFormProps) {
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>();

  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();
  const { data: suppliers = [] } = useSuppliers();
  const { data: units = [] } = useUnits(true);

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: `${w.code} - ${w.name}`,
  }));

  const supplierOptions = suppliers.map(s => ({
    value: s.id,
    label: `${s.code} - ${s.name}`,
  }));

  const unitOptions = units.map(u => ({
    value: u.code,
    label: `${u.name} (${u.symbol || u.code})`,
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
      setSelectedProductId(initialValues.productId);
    } else {
      form.setFieldsValue({
        inspectedQuantity: 1,
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
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* QC Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ClipboardDocumentCheckIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Title */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 m-0">
                {initialValues ? 'Kalite Kontrol Düzenle' : 'Yeni Kalite Kontrol'}
              </h2>
              <p className="text-sm text-slate-500 m-0 mt-1">
                {initialValues ? `QC No: ${initialValues.qcNumber}` : 'Ürün kalite kontrolü için yeni kayıt oluşturun'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 py-6">

          {/* Temel Bilgiler */}
          <FormSection title="Temel Bilgiler">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormSelect
                  name="productId"
                  label="Ürün"
                  required
                  placeholder="Ürün seçin"
                  disabled={!!initialValues}
                  options={productOptions}
                  onChange={(value) => setSelectedProductId(value)}
                />
              </div>
              <div className="col-span-6">
                <FormSelect
                  name="qcType"
                  label="Kontrol Tipi"
                  required
                  placeholder="Tip seçin"
                  disabled={!!initialValues}
                  options={qcTypeOptions}
                  showSearch={false}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="inspectedQuantity"
                  label="Denetlenen Miktar"
                  required
                  placeholder="100"
                  min={0}
                  disabled={!!initialValues}
                />
              </div>
              <div className="col-span-4">
                <FormSelect
                  name="unit"
                  label="Birim"
                  required
                  placeholder="Birim seçin"
                  disabled={!!initialValues}
                  options={unitOptions}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="sampleQuantity"
                  label="Numune Miktarı"
                  placeholder="10"
                  min={0}
                />
              </div>
            </div>
          </FormSection>

          {/* Lot ve Tedarikçi Bilgileri */}
          <FormSection title="Lot ve Tedarikçi Bilgileri">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormInput
                  name="lotNumber"
                  label="Lot Numarası"
                  placeholder="LOT-2024-001"
                />
              </div>
              <div className="col-span-4">
                <FormSelect
                  name="supplierId"
                  label="Tedarikçi"
                  placeholder="Tedarikçi seçin"
                  allowClear
                  options={supplierOptions}
                />
              </div>
              <div className="col-span-4">
                <FormInput
                  name="purchaseOrderNumber"
                  label="Satınalma Sipariş No"
                  placeholder="PO-2024-001"
                />
              </div>
            </div>
          </FormSection>

          {/* Denetim Bilgileri */}
          <FormSection title="Denetim Bilgileri">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormSelect
                  name="warehouseId"
                  label="Depo"
                  placeholder="Depo seçin"
                  allowClear
                  options={warehouseOptions}
                />
              </div>
              <div className="col-span-4">
                <FormInput
                  name="inspectionLocation"
                  label="Denetim Yeri"
                  placeholder="Kalite Kontrol Bölümü"
                />
              </div>
              <div className="col-span-4">
                <FormInput
                  name="inspectionStandard"
                  label="Denetim Standardı"
                  placeholder="ISO 9001"
                />
              </div>
              <div className="col-span-12">
                <FormTextArea
                  name="inspectionNotes"
                  label="Denetim Notları"
                  placeholder="Denetim hakkında notlar..."
                  rows={3}
                />
              </div>
              {initialValues && (
                <div className="col-span-12">
                  <FormTextArea
                    name="internalNotes"
                    label="Dahili Notlar"
                    placeholder="Dahili notlar..."
                    rows={2}
                  />
                </div>
              )}
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
