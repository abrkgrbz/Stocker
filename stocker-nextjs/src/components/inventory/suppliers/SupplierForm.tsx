'use client';

import React, { useEffect, useState } from 'react';
import { Form } from 'antd';
import {
  BuildingStorefrontIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import type { SupplierDto, CreateSupplierDto, UpdateSupplierDto } from '@/lib/api/services/inventory.types';
import {
  FormHeader,
  FormSection,
  FormInput,
  FormTextArea,
  FormNumber,
  FormStatGrid,
  useUnsavedChanges,
  nameFieldRules,
  codeFieldRules,
  emailFieldRules,
  phoneFieldRules,
  urlFieldRules,
  taxNumberRule,
} from '@/components/forms';

interface SupplierFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: SupplierDto;
  onFinish: (values: CreateSupplierDto | UpdateSupplierDto) => void;
  loading?: boolean;
}

export default function SupplierForm({ form, initialValues, onFinish, loading }: SupplierFormProps) {
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
    } else {
      form.setFieldsValue({
        paymentTerm: 30,
        creditLimit: 0,
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
          icon={<BuildingStorefrontIcon className="w-5 h-5 text-slate-500" />}
          titleField="name"
          titlePlaceholder="Tedarikçi Adı Girin..."
          titleRules={nameFieldRules('Tedarikçi adı')}
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
              <div className="col-span-4">
                <FormInput
                  name="code"
                  label="Tedarikçi Kodu"
                  required
                  placeholder="SUP-001"
                  disabled={!!initialValues}
                  rules={codeFieldRules('Tedarikçi kodu')}
                />
              </div>
              <div className="col-span-4">
                <FormInput
                  name="taxNumber"
                  label="Vergi Numarası"
                  placeholder="1234567890"
                  rules={[taxNumberRule]}
                />
              </div>
              <div className="col-span-4">
                <FormInput
                  name="taxOffice"
                  label="Vergi Dairesi"
                  placeholder="Vergi dairesi adı"
                />
              </div>
            </div>
          </FormSection>

          {/* İletişim Bilgileri */}
          <FormSection title="İletişim Bilgileri">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormInput
                  name="phone"
                  label="Telefon"
                  placeholder="+90 212 123 4567"
                  prefix={<PhoneIcon className="w-4 h-4 text-slate-400" />}
                  rules={phoneFieldRules()}
                />
              </div>
              <div className="col-span-6">
                <FormInput
                  name="fax"
                  label="Faks"
                  placeholder="+90 212 123 4568"
                  prefix={<PhoneIcon className="w-4 h-4 text-slate-400" />}
                  rules={phoneFieldRules()}
                />
              </div>
              <div className="col-span-6">
                <FormInput
                  name="email"
                  label="E-posta"
                  placeholder="info@supplier.com"
                  prefix={<EnvelopeIcon className="w-4 h-4 text-slate-400" />}
                  rules={emailFieldRules()}
                />
              </div>
              <div className="col-span-6">
                <FormInput
                  name="website"
                  label="Web Sitesi"
                  placeholder="https://www.supplier.com"
                  prefix={<GlobeAltIcon className="w-4 h-4 text-slate-400" />}
                  rules={urlFieldRules()}
                />
              </div>
            </div>
          </FormSection>

          {/* İlgili Kişi */}
          <FormSection title="İlgili Kişi">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormInput
                  name="contactPerson"
                  label="Ad Soyad"
                  placeholder="İlgili kişi adı"
                  prefix={<UserIcon className="w-4 h-4 text-slate-400" />}
                />
              </div>
              <div className="col-span-4">
                <FormInput
                  name="contactPhone"
                  label="Telefon"
                  placeholder="+90 532 123 4567"
                  prefix={<PhoneIcon className="w-4 h-4 text-slate-400" />}
                  rules={phoneFieldRules()}
                />
              </div>
              <div className="col-span-4">
                <FormInput
                  name="contactEmail"
                  label="E-posta"
                  placeholder="contact@supplier.com"
                  prefix={<EnvelopeIcon className="w-4 h-4 text-slate-400" />}
                  rules={emailFieldRules()}
                />
              </div>
            </div>
          </FormSection>

          {/* Adres Bilgileri */}
          <FormSection title="Adres Bilgileri">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <FormTextArea
                  name="street"
                  label="Adres"
                  placeholder="Sokak/Cadde adresi"
                  rows={2}
                />
              </div>
              <div className="col-span-4">
                <FormInput
                  name="city"
                  label="Şehir"
                  placeholder="İstanbul"
                />
              </div>
              <div className="col-span-4">
                <FormInput
                  name="state"
                  label="İlçe/Bölge"
                  placeholder="Kadıköy"
                />
              </div>
              <div className="col-span-4">
                <FormInput
                  name="postalCode"
                  label="Posta Kodu"
                  placeholder="34000"
                />
              </div>
              <div className="col-span-6">
                <FormInput
                  name="country"
                  label="Ülke"
                  placeholder="Türkiye"
                />
              </div>
            </div>
          </FormSection>

          {/* Ödeme Koşulları */}
          <FormSection title="Ödeme Koşulları">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormNumber
                  name="paymentTerm"
                  label="Vade (Gün)"
                  placeholder="30"
                  min={0}
                  max={365}
                  formItemProps={{ initialValue: 30 }}
                />
              </div>
              <div className="col-span-6">
                <FormNumber
                  name="creditLimit"
                  label="Kredi Limiti (₺)"
                  placeholder="100000"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                  formItemProps={{ initialValue: 0 }}
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
