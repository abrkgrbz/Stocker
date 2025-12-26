'use client';

/**
 * =====================================
 * CUSTOMER FORM - ENTERPRISE UI
 * =====================================
 *
 * Migrated from Ant Design to custom primitives.
 * Uses FormSection pattern with new input components.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { BuildingOfficeIcon, UserIcon } from '@heroicons/react/24/outline';
import type { Customer } from '@/lib/api/services/crm.service';

// Primitives
import {
  Input,
  Textarea,
  Select,
  CurrencyInput,
  PhoneInput,
  CitySelect,
  DistrictSelect,
  TaxNumberInput,
} from '@/components/primitives';

// Patterns
import { FormSection, FormField } from '@/components/patterns/forms/FormSection';

// =====================================
// OPTIONS
// =====================================

const statusOptions = [
  { value: 'Active', label: 'Aktif' },
  { value: 'Inactive', label: 'Pasif' },
  { value: 'Potential', label: 'Potansiyel' },
];

const paymentTermsOptions = [
  { value: 'Immediate', label: 'Peşin' },
  { value: '15 Days', label: '15 Gün' },
  { value: '30 Days', label: '30 Gün' },
  { value: '45 Days', label: '45 Gün' },
  { value: '60 Days', label: '60 Gün' },
  { value: '90 Days', label: '90 Gün' },
];

// =====================================
// TYPES
// =====================================

export interface CustomerFormData {
  companyName: string;
  customerType: 'Corporate' | 'Individual';
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId: string;
  taxOffice: string;
  creditLimit: number;
  paymentTerms: string;
  status: string;
  notes: string;
}

export interface CustomerFormProps {
  initialValues?: Customer;
  onSubmit: (values: CustomerFormData) => void;
  loading?: boolean;
}

// =====================================
// FORM COMPONENT
// =====================================

export default function CustomerFormNew({
  initialValues,
  onSubmit,
  loading = false,
}: CustomerFormProps) {
  // Form state
  const [formData, setFormData] = useState<CustomerFormData>({
    companyName: '',
    customerType: 'Corporate',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Türkiye',
    taxId: '',
    taxOffice: '',
    creditLimit: 0,
    paymentTerms: '',
    status: 'Active',
    notes: '',
  });

  // Validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});

  // Initialize with existing values
  useEffect(() => {
    if (initialValues) {
      setFormData({
        companyName: initialValues.companyName || '',
        customerType: (initialValues.customerType as 'Corporate' | 'Individual') || 'Corporate',
        contactPerson: initialValues.contactPerson || '',
        email: initialValues.email || '',
        phone: initialValues.phone || '',
        website: initialValues.website || '',
        address: initialValues.address || '',
        city: initialValues.city || '',
        state: initialValues.state || '',
        postalCode: initialValues.postalCode || '',
        country: initialValues.country || 'Türkiye',
        taxId: initialValues.taxId || '',
        taxOffice: initialValues.taxOffice || '',
        creditLimit: initialValues.creditLimit || 0,
        paymentTerms: initialValues.paymentTerms || '',
        status: initialValues.status || 'Active',
        notes: initialValues.notes || '',
      });
    }
  }, [initialValues]);

  // Field change handler
  const handleChange = useCallback(<K extends keyof CustomerFormData>(
    field: K,
    value: CustomerFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // City change handler (clears district)
  const handleCityChange = useCallback((city: string | null) => {
    setFormData((prev) => ({
      ...prev,
      city: city || '',
      state: '', // Reset district when city changes
    }));
  }, []);

  // Validate form
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerFormData, string>> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Müşteri adı zorunludur';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (formData.taxId && !/^[0-9]{10,11}$/.test(formData.taxId)) {
      newErrors.taxId = 'Geçerli bir vergi numarası girin (10-11 hane)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">
        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Logo + Name + Type Selector
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Logo Placeholder */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-200 transition-all">
                {formData.customerType === 'Corporate' ? (
                  <BuildingOfficeIcon className="h-6 w-6 text-slate-500" />
                ) : (
                  <UserIcon className="h-6 w-6 text-slate-500" />
                )}
              </div>
            </div>

            {/* Company/Customer Name */}
            <div className="flex-1">
              <Input
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder={
                  formData.customerType === 'Corporate'
                    ? 'Firma Adı Girin...'
                    : 'Ad Soyad Girin...'
                }
                variant="borderless"
                error={!!errors.companyName}
                disabled={loading}
                className="!text-2xl !font-bold !text-slate-900"
              />
              {errors.companyName && (
                <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>
              )}
            </div>

            {/* Type Selector */}
            <div className="flex-shrink-0">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleChange('customerType', 'Corporate')}
                  disabled={loading}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    formData.customerType === 'Corporate'
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Kurumsal
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('customerType', 'Individual')}
                  disabled={loading}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    formData.customerType === 'Individual'
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Bireysel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">
          {/* ─────────────── İLETİŞİM BİLGİLERİ ─────────────── */}
          <FormSection title="İletişim Bilgileri">
            <FormField label="İrtibat Kişisi" span={6}>
              <Input
                value={formData.contactPerson}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
                placeholder="—"
                disabled={loading}
              />
            </FormField>

            <FormField label="E-posta" required span={6} error={errors.email}>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="ornek@firma.com"
                error={!!errors.email}
                disabled={loading}
              />
            </FormField>

            <FormField label="Telefon" span={6}>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => handleChange('phone', value)}
                disabled={loading}
              />
            </FormField>

            <FormField label="Web Sitesi" span={6}>
              <Input
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://"
                disabled={loading}
              />
            </FormField>
          </FormSection>

          {/* ─────────────── ADRES BİLGİLERİ ─────────────── */}
          <FormSection title="Adres Bilgileri">
            <FormField label="Adres" span={12}>
              <Textarea
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Sokak, mahalle, bina no..."
                rows={2}
                maxLength={200}
                disabled={loading}
              />
            </FormField>

            <FormField label="Şehir" span={4}>
              <CitySelect
                value={formData.city || null}
                onChange={(cityName) => handleCityChange(cityName)}
                valueType="name"
                showPlateCode={false}
                disabled={loading}
              />
            </FormField>

            <FormField label="İlçe" span={4}>
              <DistrictSelect
                cityCode={formData.city || null}
                cityValueType="name"
                value={formData.state || null}
                onChange={(district) => handleChange('state', district || '')}
                disabled={loading}
              />
            </FormField>

            <FormField label="Posta Kodu" span={4}>
              <Input
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                placeholder="34000"
                maxLength={10}
                disabled={loading}
              />
            </FormField>
          </FormSection>

          {/* ─────────────── MALİ BİLGİLER ─────────────── */}
          <FormSection title="Mali Bilgiler">
            <FormField label="Vergi Numarası" span={6} error={errors.taxId}>
              <TaxNumberInput
                value={formData.taxId}
                onChange={(value) => handleChange('taxId', value)}
                error={!!errors.taxId}
                disabled={loading}
              />
            </FormField>

            <FormField label="Vergi Dairesi" span={6}>
              <Input
                value={formData.taxOffice}
                onChange={(e) => handleChange('taxOffice', e.target.value)}
                placeholder="—"
                disabled={loading}
              />
            </FormField>

            <FormField label="Kredi Limiti" span={4}>
              <CurrencyInput
                value={formData.creditLimit}
                onChange={(value) => handleChange('creditLimit', value ?? 0)}
                disabled={loading}
              />
            </FormField>

            <FormField label="Ödeme Vadesi" span={4}>
              <Select
                value={formData.paymentTerms || null}
                onChange={(value) => handleChange('paymentTerms', value || '')}
                options={paymentTermsOptions}
                placeholder="Seçin"
                disabled={loading}
              />
            </FormField>

            <FormField label="Durum" span={4}>
              <Select
                value={formData.status}
                onChange={(value) => handleChange('status', value || 'Active')}
                options={statusOptions}
                disabled={loading}
              />
            </FormField>
          </FormSection>

          {/* ─────────────── NOTLAR ─────────────── */}
          <FormSection title="Notlar" className="mb-0">
            <FormField span={12}>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Müşteri hakkında ek notlar..."
                rows={3}
                disabled={loading}
              />
            </FormField>
          </FormSection>
        </div>
      </div>

      {/* Hidden submit button for form submission */}
      <button type="submit" className="hidden" />
    </form>
  );
}
