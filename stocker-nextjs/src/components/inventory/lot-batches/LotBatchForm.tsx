'use client';

import React, { useEffect, useState } from 'react';
import { Form } from 'antd';
import { BeakerIcon } from '@heroicons/react/24/outline';
import { useProducts, useSuppliers } from '@/lib/api/hooks/useInventory';
import { LotBatchStatus, type LotBatchDto, type CreateLotBatchDto, type UpdateLotBatchDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';
import {
  FormHeader,
  FormSection,
  FormInput,
  FormTextArea,
  FormSelect,
  FormNumber,
  FormDatePicker,
  FormSwitch,
  FormStatGrid,
  useUnsavedChanges,
  requiredRule,
} from '@/components/forms';

interface LotBatchFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: LotBatchDto;
  onFinish: (values: CreateLotBatchDto | UpdateLotBatchDto) => void;
  loading?: boolean;
}

const lotBatchStatuses = [
  { value: LotBatchStatus.Pending, label: 'Beklemede' },
  { value: LotBatchStatus.Received, label: 'Alındı' },
  { value: LotBatchStatus.Approved, label: 'Onaylandı' },
  { value: LotBatchStatus.Quarantined, label: 'Karantinada' },
  { value: LotBatchStatus.Rejected, label: 'Reddedildi' },
  { value: LotBatchStatus.Exhausted, label: 'Tükendi' },
  { value: LotBatchStatus.Expired, label: 'Süresi Doldu' },
  { value: LotBatchStatus.Recalled, label: 'Geri Çağrıldı' },
];

export default function LotBatchForm({ form, initialValues, onFinish, loading }: LotBatchFormProps) {
  const [isQuarantined, setIsQuarantined] = useState(false);

  const { data: products = [] } = useProducts();
  const { data: suppliers = [] } = useSuppliers();

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));

  const supplierOptions = suppliers.map(s => ({
    value: s.id,
    label: `${s.code} - ${s.name}`,
  }));

  // Unsaved changes tracking
  const { markAsSaved } = useUnsavedChanges({
    form,
    enabled: true,
    initialValues: initialValues || {},
  });

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        manufacturedDate: initialValues.manufacturedDate ? dayjs(initialValues.manufacturedDate) : null,
        expiryDate: initialValues.expiryDate ? dayjs(initialValues.expiryDate) : null,
        receivedDate: initialValues.receivedDate ? dayjs(initialValues.receivedDate) : null,
      });
      setIsQuarantined(initialValues.isQuarantined ?? false);
    }
  }, [form, initialValues]);

  const handleFinish = (values: any) => {
    markAsSaved();
    onFinish({
      ...values,
      manufacturedDate: values.manufacturedDate?.toISOString(),
      expiryDate: values.expiryDate?.toISOString(),
      receivedDate: values.receivedDate?.toISOString(),
    });
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
          icon={<BeakerIcon className="w-6 h-6 text-slate-500" />}
          titleField="lotNumber"
          titlePlaceholder="Lot Numarası Girin..."
          titleRules={[requiredRule('Lot numarası')]}
          titleDisabled={!!initialValues}
          descriptionField="supplierLotNumber"
          descriptionPlaceholder="Tedarikçi lot numarası (opsiyonel)..."
          showStatusToggle={false}
          rightContent={initialValues && (
            <FormSelect
              name="status"
              options={lotBatchStatuses}
              className="w-40"
              formItemProps={{ className: 'mb-0' }}
            />
          )}
          loading={loading}
        />

        {/* Form Body */}
        <div className="px-8 py-6">

          {/* Ürün Bilgileri */}
          <FormSection title="Ürün Bilgileri">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormSelect
                  name="productId"
                  label="Ürün"
                  required
                  placeholder="Ürün seçin"
                  disabled={!!initialValues}
                  options={productOptions}
                />
              </div>
              <div className="col-span-6">
                <FormSelect
                  name="supplierId"
                  label="Tedarikçi"
                  placeholder="Tedarikçi seçin"
                  allowClear
                  options={supplierOptions}
                />
              </div>
            </div>
          </FormSection>

          {/* Miktar Bilgileri */}
          <FormSection title="Miktar Bilgileri">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormNumber
                  name="initialQuantity"
                  label="Başlangıç Miktarı"
                  required
                  placeholder="0"
                  min={0}
                  precision={4}
                  disabled={!!initialValues}
                />
              </div>
              {initialValues && (
                <>
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Mevcut Miktar</label>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <div className="text-xl font-semibold text-slate-800">
                        {initialValues.currentQuantity?.toLocaleString('tr-TR') || 0}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Kullanılabilir</label>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <div className="text-xl font-semibold text-emerald-600">
                        {initialValues.availableQuantity?.toLocaleString('tr-TR') || 0}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </FormSection>

          {/* Tarih Bilgileri */}
          <FormSection title="Tarih Bilgileri">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormDatePicker
                  name="manufacturedDate"
                  label="Üretim Tarihi"
                  placeholder="Tarih seçin"
                />
              </div>
              <div className="col-span-4">
                <FormDatePicker
                  name="expiryDate"
                  label="Son Kullanma Tarihi"
                  placeholder="Tarih seçin"
                />
              </div>
              <div className="col-span-4">
                <FormDatePicker
                  name="receivedDate"
                  label="Alım Tarihi"
                  placeholder="Tarih seçin"
                />
              </div>
            </div>
          </FormSection>

          {/* Raf Ömrü Durumu (Edit Mode) */}
          {initialValues && initialValues.expiryDate && (
            <FormSection title="Raf Ömrü Durumu">
              <FormStatGrid
                columns={4}
                stats={[
                  {
                    value: initialValues.isExpired ? 'Evet' : 'Hayır',
                    label: 'Süresi Doldu mu?',
                    variant: initialValues.isExpired ? 'danger' : 'default',
                  },
                  {
                    value: initialValues.daysUntilExpiry ?? '-',
                    label: 'Kalan Gün',
                    variant: (initialValues.daysUntilExpiry || 0) < 30 ? 'warning' : 'default',
                  },
                  {
                    value: `%${initialValues.remainingShelfLifePercentage ?? '-'}`,
                    label: 'Kalan Raf Ömrü',
                  },
                  {
                    value: initialValues.isQuarantined ? 'Evet' : 'Hayır',
                    label: 'Karantinada',
                    variant: initialValues.isQuarantined ? 'warning' : 'success',
                  },
                ]}
              />
            </FormSection>
          )}

          {/* Karantina Durumu (Edit Mode) */}
          {initialValues && (
            <FormSection title="Karantina Durumu">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <FormSwitch
                    form={form}
                    name="isQuarantined"
                    title="Karantina"
                    value={isQuarantined}
                    onChange={setIsQuarantined}
                    descriptionTrue="Lot karantinada"
                    descriptionFalse="Lot kullanılabilir"
                    checkedChildren="Evet"
                    unCheckedChildren="Hayır"
                    disabled={loading}
                  />
                </div>
                {isQuarantined && (
                  <div className="col-span-8">
                    <FormInput
                      name="quarantineReason"
                      label="Karantina Nedeni"
                      placeholder="Karantina nedenini girin..."
                    />
                  </div>
                )}
              </div>
            </FormSection>
          )}

          {/* Ek Bilgiler */}
          <FormSection title="Ek Bilgiler">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormInput
                  name="certificateNumber"
                  label="Sertifika Numarası"
                  placeholder="Kalite sertifika no..."
                />
              </div>
              {initialValues && (
                <div className="col-span-6">
                  <FormInput
                    name="inspectionNotes"
                    label="Denetim Notları"
                    placeholder="Denetim notları..."
                  />
                </div>
              )}
              <div className="col-span-12">
                <FormTextArea
                  name="notes"
                  label="Notlar"
                  placeholder="Lot ile ilgili ek notlar..."
                  rows={3}
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
