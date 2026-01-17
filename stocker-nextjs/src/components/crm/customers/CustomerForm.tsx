'use client';

/**
 * =====================================
 * CUSTOMER FORM - ENTERPRISE UI
 * =====================================
 *
 * Migrated from Ant Design to custom primitives.
 * Uses FormSection pattern with new input components.
 */

import React, { useEffect, useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { BuildingOfficeIcon, UserIcon, ShieldCheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import type { Customer } from '@/lib/api/services/crm.service';
import { TurkishBusinessEntityType, TurkishBusinessEntityTypeLabels } from '@/lib/api/services/crm.types';

// Primitives
import {
  Input,
  Textarea,
  Select,
  CurrencyInput,
  PhoneInput,
  TaxNumberInput,
  NumberInput,
} from '@/components/primitives';

// Location
import { CascadeLocationSelect } from '@/components/ui/CascadeLocationSelect';
import type { SelectedLocation } from '@/lib/api/services/location.types';

// Patterns
import { FormSection, FormField } from '@/components/patterns/forms/FormSection';

// =====================================
// OPTIONS
// =====================================

// Backend CustomerStatus enum ile senkronize
const statusOptions = [
  { value: 'Active', label: 'Aktif' },
  { value: 'Inactive', label: 'Pasif' },
  { value: 'Prospect', label: 'Potansiyel' },
  { value: 'Suspended', label: 'Askıya Alınmış' },
];

const paymentTermsOptions = [
  { value: 'Immediate', label: 'Peşin' },
  { value: '15 Days', label: '15 Gün' },
  { value: '30 Days', label: '30 Gün' },
  { value: '45 Days', label: '45 Gün' },
  { value: '60 Days', label: '60 Gün' },
  { value: '90 Days', label: '90 Gün' },
];

const industryOptions = [
  { value: 'Technology', label: 'Teknoloji' },
  { value: 'Finance', label: 'Finans' },
  { value: 'Healthcare', label: 'Sağlık' },
  { value: 'Manufacturing', label: 'Üretim' },
  { value: 'Retail', label: 'Perakende' },
  { value: 'Education', label: 'Eğitim' },
  { value: 'Construction', label: 'İnşaat' },
  { value: 'Transportation', label: 'Ulaşım' },
  { value: 'Agriculture', label: 'Tarım' },
  { value: 'Energy', label: 'Enerji' },
  { value: 'RealEstate', label: 'Gayrimenkul' },
  { value: 'Hospitality', label: 'Turizm/Otelcilik' },
  { value: 'Media', label: 'Medya' },
  { value: 'Telecommunications', label: 'Telekomünikasyon' },
  { value: 'Other', label: 'Diğer' },
];

// Turkish Business Entity Types (Türk Ticaret Kanunu)
const businessEntityTypeOptions = Object.entries(TurkishBusinessEntityTypeLabels).map(([value, label]) => ({
  value,
  label,
}));

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
  industry: string;
  annualRevenue: number | null;
  numberOfEmployees: number | null;
  description: string;
  address: string;
  // GeoLocation IDs (FK to Master DB)
  countryId: string | null;
  cityId: string | null;
  districtId: string | null;
  // Denormalized location names (for display/backward compatibility)
  city: string;
  state: string;  // district name mapped to state for legacy
  postalCode: string;
  country: string;
  taxId: string;
  taxOffice: string;
  creditLimit: number;
  paymentTerms: string;
  status: string;
  notes: string;
  // ═══════════════════════════════════════════════════════════════
  // TURKISH COMPLIANCE FIELDS
  // ═══════════════════════════════════════════════════════════════
  // Business Entity (Şirket Türü)
  businessEntityType: string;           // A.Ş., Ltd. Şti., etc.
  mersisNo: string;                     // MERSIS No (16 hane)
  tradeRegistryNo: string;              // Ticaret Sicil No
  // e-Fatura (GİB)
  kepAddress: string;                   // KEP Adresi
  eInvoiceRegistered: boolean;          // e-Fatura Mükellefi
  // Individual (Bireysel)
  tcKimlikNo: string;                   // TC Kimlik No (11 hane)
  // KVKK Consent
  kvkkDataProcessingConsent: boolean;   // Veri işleme izni
  kvkkMarketingConsent: boolean;        // Pazarlama izni
  kvkkCommunicationConsent: boolean;    // İletişim izni
}

export interface CustomerFormRef {
  submit: () => void;
  getValues: () => CustomerFormData;
  validate: () => boolean;
  isDirty: () => boolean;
}

export interface CustomerFormProps {
  initialValues?: Customer;
  onFinish: (values: CustomerFormData) => void;
  loading?: boolean;
}

// =====================================
// FORM COMPONENT
// =====================================

const CustomerForm = forwardRef<CustomerFormRef, CustomerFormProps>(function CustomerForm(
  { initialValues, onFinish, loading = false },
  ref
) {
  // Form state
  const [formData, setFormData] = useState<CustomerFormData>({
    companyName: '',
    customerType: 'Corporate',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    annualRevenue: null,
    numberOfEmployees: null,
    description: '',
    address: '',
    // GeoLocation IDs
    countryId: null,
    cityId: null,
    districtId: null,
    // Denormalized location names
    city: '',
    state: '',
    postalCode: '',
    country: '',
    taxId: '',
    taxOffice: '',
    creditLimit: 0,
    paymentTerms: '',
    status: 'Active',
    notes: '',
    // Turkish Compliance Fields
    businessEntityType: '',
    mersisNo: '',
    tradeRegistryNo: '',
    kepAddress: '',
    eInvoiceRegistered: false,
    tcKimlikNo: '',
    kvkkDataProcessingConsent: false,
    kvkkMarketingConsent: false,
    kvkkCommunicationConsent: false,
  });

  // Validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});

  // Form dirty state (has user made changes)
  const [isDirty, setIsDirty] = useState(false);

  // Form ref for submit
  const formRef = useRef<HTMLFormElement>(null);

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
        industry: initialValues.industry || '',
        annualRevenue: initialValues.annualRevenue ?? null,
        numberOfEmployees: initialValues.numberOfEmployees ?? null,
        description: initialValues.description || '',
        address: initialValues.address || '',
        // GeoLocation IDs from backend
        countryId: initialValues.countryId || null,
        cityId: initialValues.cityId || null,
        districtId: initialValues.districtId || null,
        // Denormalized location names
        city: initialValues.city || '',
        state: initialValues.state || initialValues.district || '',
        postalCode: initialValues.postalCode || '',
        country: initialValues.country || '',
        taxId: initialValues.taxId || '',
        taxOffice: initialValues.taxOffice || '',
        creditLimit: initialValues.creditLimit || 0,
        paymentTerms: initialValues.paymentTerms || '',
        status: initialValues.status || 'Active',
        notes: initialValues.notes || '',
        // Turkish Compliance Fields
        businessEntityType: initialValues.businessEntityType || '',
        mersisNo: initialValues.mersisNo || '',
        tradeRegistryNo: initialValues.tradeRegistryNo || '',
        kepAddress: initialValues.kepAddress || '',
        eInvoiceRegistered: initialValues.eInvoiceRegistered || false,
        tcKimlikNo: initialValues.tcKimlikNo || '',
        kvkkDataProcessingConsent: initialValues.kvkkDataProcessingConsent || false,
        kvkkMarketingConsent: initialValues.kvkkMarketingConsent || false,
        kvkkCommunicationConsent: initialValues.kvkkCommunicationConsent || false,
      });
    }
  }, [initialValues]);

  // Field change handler
  const handleChange = useCallback(<K extends keyof CustomerFormData>(
    field: K,
    value: CustomerFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Mark form as dirty when user makes changes
    setIsDirty(true);
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Location change handler for CascadeLocationSelect
  const handleLocationChange = useCallback((location: SelectedLocation) => {
    setFormData((prev) => ({
      ...prev,
      countryId: location.countryId || null,
      cityId: location.cityId || null,
      districtId: location.districtId || null,
      country: location.countryName || '',
      city: location.cityName || '',
      state: location.districtName || '',  // district maps to state for legacy
    }));
    setIsDirty(true);
  }, []);

  // Validate form
  const validate = useCallback((): boolean => {
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

    // ═══════════════════════════════════════════════════════════════
    // TURKISH COMPLIANCE VALIDATIONS
    // ═══════════════════════════════════════════════════════════════

    // TC Kimlik No validation (Individual customers)
    if (formData.customerType === 'Individual' && formData.tcKimlikNo) {
      if (!/^[0-9]{11}$/.test(formData.tcKimlikNo)) {
        newErrors.tcKimlikNo = 'TC Kimlik No 11 haneli olmalıdır';
      } else if (formData.tcKimlikNo[0] === '0') {
        newErrors.tcKimlikNo = 'TC Kimlik No 0 ile başlayamaz';
      } else {
        // TC Kimlik No algoritma kontrolü
        const digits = formData.tcKimlikNo.split('').map(Number);
        const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
        const digit10 = (oddSum * 7 - evenSum) % 10;
        const digit11 = (digits.slice(0, 10).reduce((a, b) => a + b, 0)) % 10;

        if (digits[9] !== digit10 || digits[10] !== digit11) {
          newErrors.tcKimlikNo = 'Geçersiz TC Kimlik No';
        }
      }
    }

    // MERSIS No validation (Corporate customers)
    if (formData.customerType === 'Corporate' && formData.mersisNo) {
      if (!/^[0-9]{16}$/.test(formData.mersisNo)) {
        newErrors.mersisNo = 'MERSIS No 16 haneli olmalıdır';
      }
    }

    // KEP Address validation (Corporate customers)
    if (formData.customerType === 'Corporate' && formData.kepAddress) {
      // KEP addresses typically end with .kep.tr
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.kepAddress)) {
        newErrors.kepAddress = 'Geçerli bir KEP adresi girin';
      }
    }

    // KVKK Consent validation - Data processing consent is required
    if (!formData.kvkkDataProcessingConsent) {
      newErrors.kvkkDataProcessingConsent = 'KVKK veri işleme onayı zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Form submit handler
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onFinish(formData);
    }
  }, [validate, onFinish, formData]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    submit: () => {
      if (validate()) {
        onFinish(formData);
      }
    },
    getValues: () => formData,
    validate,
    isDirty: () => isDirty,
  }), [validate, onFinish, formData, isDirty]);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full">
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

          {/* ─────────────── İŞLETME BİLGİLERİ (Sadece Kurumsal için) ─────────────── */}
          {formData.customerType !== 'Individual' && (
            <FormSection title="İşletme Bilgileri">
              {/* Şirket Türü - Sadece Kurumsal için */}
              {formData.customerType === 'Corporate' && (
                <FormField label="Şirket Türü" span={4}>
                  <Select
                    value={formData.businessEntityType || null}
                    onChange={(value) => handleChange('businessEntityType', value || '')}
                    options={businessEntityTypeOptions}
                    placeholder="Seçin"
                    disabled={loading}
                  />
                </FormField>
              )}

              <FormField label="Sektör" span={formData.customerType === 'Corporate' ? 4 : 6}>
                <Select
                  value={formData.industry || null}
                  onChange={(value) => handleChange('industry', value || '')}
                  options={industryOptions}
                  placeholder="Seçin"
                  disabled={loading}
                />
              </FormField>

              <FormField label="Yıllık Gelir" span={formData.customerType === 'Corporate' ? 4 : 6}>
                <CurrencyInput
                  value={formData.annualRevenue ?? undefined}
                  onChange={(value) => handleChange('annualRevenue', value ?? null)}
                  disabled={loading}
                />
              </FormField>

              <FormField label="Çalışan Sayısı" span={4}>
                <NumberInput
                  value={formData.numberOfEmployees ?? undefined}
                  onChange={(value) => handleChange('numberOfEmployees', value ?? null)}
                  placeholder="0"
                  min={0}
                  disabled={loading}
                />
              </FormField>

              <FormField label="Açıklama" span={12}>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Müşteri/Şirket hakkında genel bilgi..."
                  rows={2}
                  disabled={loading}
                />
              </FormField>
            </FormSection>
          )}

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

            {/* GeoLocation Cascade Select: Country → City → District */}
            <FormField span={12}>
              <CascadeLocationSelect
                value={{
                  countryId: formData.countryId || undefined,
                  countryName: formData.country || undefined,
                  cityId: formData.cityId || undefined,
                  cityName: formData.city || undefined,
                  districtId: formData.districtId || undefined,
                  districtName: formData.state || undefined,
                }}
                onChange={handleLocationChange}
                showDistrict={true}
                disabled={loading}
                layout="grid"
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

            {/* TC Kimlik No - Sadece Bireysel için */}
            {formData.customerType === 'Individual' && (
              <FormField label="TC Kimlik No" span={6} error={errors.tcKimlikNo}>
                <Input
                  value={formData.tcKimlikNo}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                    handleChange('tcKimlikNo', value);
                  }}
                  placeholder="11 haneli TC Kimlik No"
                  maxLength={11}
                  error={!!errors.tcKimlikNo}
                  disabled={loading}
                />
              </FormField>
            )}

            <FormField label="Kredi Limiti" span={formData.customerType === 'Individual' ? 6 : 4}>
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

          {/* ─────────────── RESMİ KAYIT & e-FATURA BİLGİLERİ ─────────────── */}
          {formData.customerType === 'Corporate' && (
            <FormSection title="Resmi Kayıt & e-Fatura Bilgileri">
              <FormField label="MERSIS No" span={6} error={errors.mersisNo}>
                <Input
                  value={formData.mersisNo}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                    handleChange('mersisNo', value);
                  }}
                  placeholder="16 haneli MERSIS numarası"
                  maxLength={16}
                  error={!!errors.mersisNo}
                  disabled={loading}
                />
              </FormField>

              <FormField label="Ticaret Sicil No" span={6}>
                <Input
                  value={formData.tradeRegistryNo}
                  onChange={(e) => handleChange('tradeRegistryNo', e.target.value)}
                  placeholder="Ticaret sicil numarası"
                  disabled={loading}
                />
              </FormField>

              <FormField label="KEP Adresi" span={6} error={errors.kepAddress}>
                <Input
                  type="email"
                  value={formData.kepAddress}
                  onChange={(e) => handleChange('kepAddress', e.target.value)}
                  placeholder="ornek@hs01.kep.tr"
                  error={!!errors.kepAddress}
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-slate-500">
                  e-Fatura göndermek için KEP adresi gereklidir
                </p>
              </FormField>

              <FormField label="e-Fatura Mükellefi" span={6}>
                <div className="flex items-center h-10">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.eInvoiceRegistered}
                      onChange={(e) => handleChange('eInvoiceRegistered', e.target.checked)}
                      disabled={loading}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-slate-700">
                      {formData.eInvoiceRegistered ? 'Evet' : 'Hayır'}
                    </span>
                  </label>
                </div>
              </FormField>
            </FormSection>
          )}

          {/* ─────────────── KVKK RIZA YÖNETİMİ ─────────────── */}
          <FormSection
            title="KVKK Rıza Yönetimi"
            description="6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında müşteri onayları"
          >
            <FormField span={12}>
              <div className="space-y-4">
                {/* Veri İşleme İzni */}
                <div>
                  <label className={`flex items-start gap-3 cursor-pointer group ${errors.kvkkDataProcessingConsent ? 'ring-2 ring-red-500 ring-offset-2 rounded-lg p-2 -m-2' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formData.kvkkDataProcessingConsent}
                      onChange={(e) => handleChange('kvkkDataProcessingConsent', e.target.checked)}
                      disabled={loading}
                      className={`mt-0.5 h-5 w-5 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-0 ${errors.kvkkDataProcessingConsent ? 'border-red-500' : 'border-slate-300'}`}
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                        Kişisel Veri İşleme İzni
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Müşteri, kişisel verilerinin toplanması, işlenmesi ve saklanmasına izin vermektedir.
                      </p>
                    </div>
                    <span className="text-xs font-medium text-red-500">Zorunlu</span>
                  </label>
                  {errors.kvkkDataProcessingConsent && (
                    <p className="text-xs text-red-500 mt-2 ml-8">{errors.kvkkDataProcessingConsent}</p>
                  )}
                </div>

                {/* Pazarlama İzni */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.kvkkMarketingConsent}
                    onChange={(e) => handleChange('kvkkMarketingConsent', e.target.checked)}
                    disabled={loading}
                    className="mt-0.5 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      Pazarlama İletişimi İzni
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Müşteri, tanıtım ve pazarlama amaçlı iletişim almayı kabul etmektedir.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-400">İsteğe Bağlı</span>
                </label>

                {/* İletişim İzni */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.kvkkCommunicationConsent}
                    onChange={(e) => handleChange('kvkkCommunicationConsent', e.target.checked)}
                    disabled={loading}
                    className="mt-0.5 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      Elektronik İletişim İzni
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Müşteri, e-posta, SMS ve telefon ile iletişim kurulmasını kabul etmektedir.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-400">İsteğe Bağlı</span>
                </label>

                {/* KVKK Bilgilendirme Notu */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex gap-2">
                    <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium">KVKK Bilgilendirmesi</p>
                      <p className="mt-1">
                        Bu izinler 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında alınmaktadır.
                        Müşteri istediği zaman bu izinleri geri çekme hakkına sahiptir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
});

export default CustomerForm;
