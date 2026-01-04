'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Switch, Select } from 'antd';
import { ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useProducts } from '@/lib/api/hooks/useInventory';
import type { ShelfLifeDto } from '@/lib/api/services/inventory.types';

const { TextArea } = Input;

interface ShelfLifeFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ShelfLifeDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const shelfLifeTypeOptions = [
  { value: 1, label: 'Son Kullanma Tarihi' },
  { value: 2, label: 'Tavsiye Edilen Tüketim' },
  { value: 3, label: 'Üretim Tarihi Bazlı' },
  { value: 4, label: 'Açıldıktan Sonra' },
  { value: 5, label: 'Kullanıma Başladıktan Sonra' },
];

const ruleTypeOptions = [
  { value: 1, label: 'Gün Bazlı' },
  { value: 2, label: 'Yüzde Bazlı' },
  { value: 3, label: 'Her İkisi' },
];

const expiryActionOptions = [
  { value: 0, label: 'Hiçbir şey yapma' },
  { value: 1, label: 'Sadece uyar' },
  { value: 2, label: 'Satışı engelle' },
  { value: 3, label: 'Karantinaya al' },
  { value: 4, label: 'Fire yap' },
  { value: 5, label: 'İndirimli satış' },
];

const zoneTypeOptions = [
  { value: 1, label: 'Standart' },
  { value: 2, label: 'Soğuk Depo' },
  { value: 3, label: 'Dondurucu' },
  { value: 4, label: 'İklimlendirilmiş' },
  { value: 5, label: 'Tehlikeli Madde' },
  { value: 6, label: 'Karantina' },
];

export default function ShelfLifeForm({ form, initialValues, onFinish, loading }: ShelfLifeFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [autoQuarantine, setAutoQuarantine] = useState(true);
  const [requiresSpecialStorage, setRequiresSpecialStorage] = useState(false);
  const [hasCustomerRules, setHasCustomerRules] = useState(false);

  const { data: products = [] } = useProducts(true);

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
      setAutoQuarantine(initialValues.autoQuarantineOnExpiry ?? true);
      setRequiresSpecialStorage(initialValues.requiresSpecialStorage ?? false);
      setHasCustomerRules(initialValues.hasCustomerSpecificRules ?? false);
    } else {
      form.setFieldsValue({
        shelfLifeType: 1,
        receivingRuleType: 1,
        salesRuleType: 1,
        expiryAction: 3,
        autoQuarantineOnExpiry: true,
        autoScrapOnExpiry: false,
      });
    }
  }, [form, initialValues]);

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
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Product + Status Toggle
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Shelf Life Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Product Selection - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="productId"
                rules={[{ required: true, message: 'Ürün seçimi zorunludur' }]}
                className="mb-0"
              >
                <Select
                  placeholder="Ürün Seçin..."
                  disabled={!!initialValues}
                  showSearch
                  optionFilterProp="label"
                  options={productOptions}
                  variant="borderless"
                  className="!text-2xl !font-bold [&_.ant-select-selection-item]:!text-slate-900 [&_.ant-select-selection-placeholder]:!text-slate-400"
                />
              </Form.Item>
              <p className="text-sm text-slate-500 mt-1">Raf ömrü yönetimi (FEFO desteği)</p>
            </div>

            {/* Status Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-slate-600">
                  {isActive ? 'Aktif' : 'Pasif'}
                </span>
                <Form.Item name="isActive" valuePropName="checked" noStyle initialValue={true}>
                  <Switch
                    checked={isActive}
                    onChange={(val) => {
                      setIsActive(val);
                      form.setFieldValue('isActive', val);
                    }}
                  />
                </Form.Item>
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
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Raf Ömrü Türü <span className="text-red-500">*</span></label>
                <Form.Item
                  name="shelfLifeType"
                  rules={[{ required: true, message: 'Raf ömrü türü zorunludur' }]}
                  className="mb-0"
                  initialValue={1}
                >
                  <Select
                    placeholder="Tür seçin"
                    options={shelfLifeTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Toplam Raf Ömrü (gün) <span className="text-red-500">*</span></label>
                <Form.Item
                  name="totalShelfLifeDays"
                  rules={[{ required: true, message: 'Toplam raf ömrü zorunludur' }]}
                  className="mb-0"
                >
                  <InputNumber
                    placeholder="Örn: 365"
                    min={1}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── KABUL KURALLARI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Kabul Kuralları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kural Türü</label>
                <Form.Item name="receivingRuleType" className="mb-0" initialValue={1}>
                  <Select
                    placeholder="Tür seçin"
                    options={ruleTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Min. Kalan Gün</label>
                <Form.Item name="minReceivingShelfLifeDays" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 180"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Min. Kalan Yüzde (%)</label>
                <Form.Item name="minReceivingShelfLifePercent" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 75"
                    min={0}
                    max={100}
                    precision={2}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── SATIŞ KURALLARI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Satış Kuralları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kural Türü</label>
                <Form.Item name="salesRuleType" className="mb-0" initialValue={1}>
                  <Select
                    placeholder="Tür seçin"
                    options={ruleTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Min. Kalan Gün</label>
                <Form.Item name="minSalesShelfLifeDays" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 90"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Min. Kalan Yüzde (%)</label>
                <Form.Item name="minSalesShelfLifePercent" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 50"
                    min={0}
                    max={100}
                    precision={2}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── UYARI EŞİKLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4" />
              Uyarı Eşikleri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Uyarı Eşiği (gün)</label>
                <Form.Item name="alertThresholdDays" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 90"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Uyarı Eşiği (%)</label>
                <Form.Item name="alertThresholdPercent" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 25"
                    min={0}
                    max={100}
                    precision={2}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kritik Eşik (gün)</label>
                <Form.Item name="criticalThresholdDays" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 30"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kritik Eşik (%)</label>
                <Form.Item name="criticalThresholdPercent" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 10"
                    min={0}
                    max={100}
                    precision={2}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── SÜRE DOLDUĞUNDA EYLEMLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Süre Dolduğunda Eylemler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Eylem</label>
                <Form.Item name="expiryAction" className="mb-0" initialValue={3}>
                  <Select
                    placeholder="Eylem seçin"
                    options={expiryActionOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Otomatik karantina</div>
                  <Form.Item name="autoQuarantineOnExpiry" valuePropName="checked" noStyle initialValue={true}>
                    <Switch
                      size="small"
                      checked={autoQuarantine}
                      onChange={(val) => {
                        setAutoQuarantine(val);
                        form.setFieldValue('autoQuarantineOnExpiry', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Otomatik fire</div>
                  <Form.Item name="autoScrapOnExpiry" valuePropName="checked" noStyle>
                    <Switch size="small" />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Karantina Öncesi Uyarı (gün)</label>
                <Form.Item name="daysBeforeQuarantineAlert" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 7"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── DEPOLAMA KOŞULLARI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Depolama Koşulları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Özel depolama gerekli</div>
                  <Form.Item name="requiresSpecialStorage" valuePropName="checked" noStyle>
                    <Switch
                      size="small"
                      checked={requiresSpecialStorage}
                      onChange={(val) => {
                        setRequiresSpecialStorage(val);
                        form.setFieldValue('requiresSpecialStorage', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              {requiresSpecialStorage && (
                <>
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Gerekli Bölge Türü</label>
                    <Form.Item name="requiredZoneType" className="mb-0">
                      <Select
                        placeholder="Bölge türü seçin"
                        allowClear
                        options={zoneTypeOptions}
                        className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>
                  <div className="col-span-12">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Depolama Koşulları Notu</label>
                    <Form.Item name="storageConditions" className="mb-0">
                      <TextArea
                        rows={2}
                        placeholder="Örn: 2-8°C arasında soğuk zincirde muhafaza edilmelidir"
                        className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                      />
                    </Form.Item>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ─────────────── MÜŞTERİ BAZLI KURALLAR ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Müşteri Bazlı Kurallar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Müşteri bazlı kurallar var</div>
                  <Form.Item name="hasCustomerSpecificRules" valuePropName="checked" noStyle>
                    <Switch
                      size="small"
                      checked={hasCustomerRules}
                      onChange={(val) => {
                        setHasCustomerRules(val);
                        form.setFieldValue('hasCustomerSpecificRules', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              {hasCustomerRules && (
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Varsayılan Min. Gün</label>
                  <Form.Item name="defaultCustomerMinShelfLifeDays" className="mb-0">
                    <InputNumber
                      placeholder="Örn: 60"
                      min={0}
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
