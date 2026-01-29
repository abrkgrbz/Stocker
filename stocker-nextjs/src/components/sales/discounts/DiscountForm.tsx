'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
} from 'antd';
import { PercentBadgeIcon } from '@heroicons/react/24/outline';
import type { DiscountType, DiscountValueType, DiscountApplicability } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface Discount {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  valueType: DiscountValueType;
  value: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  applicability: DiscountApplicability;
  validFrom: string;
  validTo?: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  isCumulative: boolean;
  priority: number;
  currency: string;
  createdAt: string;
}

interface DiscountFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: Discount;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const discountTypeOptions: { value: DiscountType; label: string; description: string }[] = [
  { value: 'Percentage', label: 'Yüzde İndirim', description: 'Toplam tutardan yüzde indirim' },
  { value: 'FixedAmount', label: 'Sabit Tutar', description: 'Toplam tutardan sabit tutar indirim' },
  { value: 'BuyXGetY', label: 'X Al Y Öde', description: 'Belirli adet alana ücretsiz ürün' },
  { value: 'Tiered', label: 'Kademeli İndirim', description: 'Tutara göre kademeli indirim' },
];

const valueTypeOptions: { value: DiscountValueType; label: string }[] = [
  { value: 'Percentage', label: 'Yüzde (%)' },
  { value: 'FixedAmount', label: 'Sabit Tutar' },
];

const applicabilityOptions: { value: DiscountApplicability; label: string; description: string }[] = [
  { value: 'All', label: 'Tümüne Uygulanır', description: 'Tüm ürünler ve müşteriler' },
  { value: 'SpecificProducts', label: 'Belirli Ürünler', description: 'Seçilen ürünlere uygulanır' },
  { value: 'SpecificCategories', label: 'Belirli Kategoriler', description: 'Seçilen kategorilere uygulanır' },
  { value: 'SpecificCustomers', label: 'Belirli Müşteriler', description: 'Seçilen müşterilere uygulanır' },
];

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

export default function DiscountForm({ form, initialValues, onFinish, loading }: DiscountFormProps) {
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');
  const [selectedValueType, setSelectedValueType] = useState<DiscountValueType>('Percentage');
  const [discountValue, setDiscountValue] = useState(0);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        code: initialValues.code,
        name: initialValues.name,
        description: initialValues.description,
        discountType: initialValues.discountType || 'Percentage',
        valueType: initialValues.valueType || 'Percentage',
        value: initialValues.value,
        minPurchaseAmount: initialValues.minPurchaseAmount,
        maxDiscountAmount: initialValues.maxDiscountAmount,
        applicability: initialValues.applicability || 'All',
        validFrom: initialValues.validFrom ? dayjs(initialValues.validFrom) : dayjs(),
        validTo: initialValues.validTo ? dayjs(initialValues.validTo) : undefined,
        usageLimit: initialValues.usageLimit,
        isActive: initialValues.isActive ?? true,
        isCumulative: initialValues.isCumulative ?? false,
        priority: initialValues.priority || 1,
        currency: initialValues.currency || 'TRY',
      });
      setSelectedCurrency(initialValues.currency || 'TRY');
      setSelectedValueType(initialValues.valueType || 'Percentage');
      setDiscountValue(initialValues.value || 0);
    } else {
      form.setFieldsValue({
        discountType: 'Percentage',
        valueType: 'Percentage',
        applicability: 'All',
        validFrom: dayjs(),
        isActive: true,
        isCumulative: false,
        priority: 1,
        currency: 'TRY',
        value: 0,
      });
    }
  }, [form, initialValues]);

  const handleValueTypeChange = (valueType: DiscountValueType) => {
    setSelectedValueType(valueType);
    // Clear value when type changes
    form.setFieldValue('value', 0);
    setDiscountValue(0);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: selectedCurrency
    }).format(amount);

  const getValueDisplay = () => {
    if (selectedValueType === 'Percentage') {
      return `%${discountValue}`;
    }
    return formatCurrency(discountValue);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Title + Value Display
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Discount Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <PercentBadgeIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Discount Title */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {initialValues ? `İndirim: ${initialValues.code}` : 'Yeni İndirim'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {initialValues ? 'İndirimi düzenleyin' : 'Yeni indirim tanımı oluşturun'}
              </p>
            </div>

            {/* Value Display */}
            <div className="flex-shrink-0">
              <div className="bg-slate-100 px-6 py-3 rounded-xl text-center">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  İndirim Değeri
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {getValueDisplay()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── TEMEL BİLGİLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İndirim Kodu <span className="text-red-500">*</span></label>
                <Form.Item
                  name="code"
                  rules={[
                    { required: true, message: 'İndirim kodu zorunludur' },
                    { pattern: /^[A-Z0-9_-]+$/i, message: 'Sadece harf, rakam ve tire kullanın' }
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Örn: YILBASI25"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white uppercase"
                    onChange={(e) => e.target.value = e.target.value.toUpperCase()}
                  />
                </Form.Item>
              </div>
              <div className="col-span-8">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İndirim Adı <span className="text-red-500">*</span></label>
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: 'İndirim adı zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Örn: Yılbaşı Kampanyası"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Açıklama</label>
                <Form.Item name="description" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="İndirim hakkında açıklama..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── İNDİRİM TÜRÜ VE DEĞERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              İndirim Türü ve Değeri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İndirim Türü <span className="text-red-500">*</span></label>
                <Form.Item
                  name="discountType"
                  rules={[{ required: true, message: 'İndirim türü zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    options={discountTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Değer Türü <span className="text-red-500">*</span></label>
                <Form.Item
                  name="valueType"
                  rules={[{ required: true, message: 'Değer türü zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    options={valueTypeOptions}
                    onChange={handleValueTypeChange}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  İndirim Değeri <span className="text-red-500">*</span>
                </label>
                <Form.Item
                  name="value"
                  rules={[{ required: true, message: 'İndirim değeri zorunludur' }]}
                  className="mb-0"
                >
                  <InputNumber
                    min={0}
                    max={selectedValueType === 'Percentage' ? 100 : undefined}
                    precision={2}
                    placeholder="0"
                    prefix={selectedValueType === 'Percentage' ? '%' : (selectedCurrency === 'TRY' ? '₺' : selectedCurrency === 'USD' ? '$' : '€')}
                    onChange={(value) => setDiscountValue(value || 0)}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Para Birimi</label>
                <Form.Item name="currency" className="mb-0">
                  <Select
                    options={currencyOptions}
                    onChange={setSelectedCurrency}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Min. Alışveriş Tutarı</label>
                <Form.Item name="minPurchaseAmount" className="mb-0">
                  <InputNumber
                    min={0}
                    precision={2}
                    placeholder="0.00"
                    prefix={selectedCurrency === 'TRY' ? '₺' : selectedCurrency === 'USD' ? '$' : '€'}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maks. İndirim Tutarı</label>
                <Form.Item name="maxDiscountAmount" className="mb-0">
                  <InputNumber
                    min={0}
                    precision={2}
                    placeholder="Limitsiz"
                    prefix={selectedCurrency === 'TRY' ? '₺' : selectedCurrency === 'USD' ? '$' : '€'}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── UYGULANACAK KAPSAM ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Uygulanacak Kapsam
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Uygulama Alanı <span className="text-red-500">*</span></label>
                <Form.Item
                  name="applicability"
                  rules={[{ required: true, message: 'Uygulama alanı zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    options={applicabilityOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Öncelik</label>
                <Form.Item name="priority" className="mb-0">
                  <InputNumber
                    min={1}
                    max={100}
                    placeholder="1"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kullanım Limiti</label>
                <Form.Item name="usageLimit" className="mb-0">
                  <InputNumber
                    min={1}
                    placeholder="Limitsiz"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── GEÇERLİLİK SÜRESİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Geçerlilik Süresi
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Başlangıç Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="validFrom"
                  rules={[{ required: true, message: 'Başlangıç tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Tarih seçin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bitiş Tarihi</label>
                <Form.Item name="validTo" className="mb-0">
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Süresiz"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── AYARLAR ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ayarlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm font-medium text-slate-900">Aktif</div>
                    <div className="text-xs text-slate-500">İndirim kullanılabilir durumda mı?</div>
                  </div>
                  <Form.Item name="isActive" valuePropName="checked" className="mb-0">
                    <Switch />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm font-medium text-slate-900">Kümülatif</div>
                    <div className="text-xs text-slate-500">Diğer indirimlerle birleştirilebilir mi?</div>
                  </div>
                  <Form.Item name="isCumulative" valuePropName="checked" className="mb-0">
                    <Switch />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Mode Info */}
          {initialValues && (
            <div className="mt-8">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                İndirim Bilgileri
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">İndirim Kodu</div>
                    <div className="text-sm font-semibold text-slate-900">{initialValues.code}</div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Kullanım Sayısı</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {initialValues.usageCount} / {initialValues.usageLimit || '∞'}
                    </div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Oluşturulma</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {dayjs(initialValues.createdAt).format('DD.MM.YYYY')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Hidden submit */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
