'use client';

import React, { useEffect, useState } from 'react';
import { Form, Collapse } from 'antd';
import { ClockIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useProducts } from '@/lib/api/hooks/useInventory';
import {
  ShelfLifeType,
  ShelfLifeRuleType,
  ExpiryAction,
  ZoneType,
  type ShelfLifeDto,
  type CreateShelfLifeDto,
  type UpdateShelfLifeDto,
} from '@/lib/api/services/inventory.types';
import {
  FormSection,
  FormInput,
  FormNumber,
  FormSelect,
  FormSwitch,
  useUnsavedChanges,
} from '@/components/forms';

interface ShelfLifeFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ShelfLifeDto;
  onFinish: (values: CreateShelfLifeDto | UpdateShelfLifeDto) => void;
  loading?: boolean;
}

const shelfLifeTypes = [
  { value: ShelfLifeType.ExpiryDate, label: 'Son Kullanma Tarihi' },
  { value: ShelfLifeType.BestBefore, label: 'Tavsiye Edilen Tüketim' },
  { value: ShelfLifeType.ManufacturingDateBased, label: 'Üretim Tarihi Bazlı' },
  { value: ShelfLifeType.AfterOpening, label: 'Açtıktan Sonra' },
  { value: ShelfLifeType.AfterFirstUse, label: 'İlk Kullanımdan Sonra' },
];

const shelfLifeRuleTypes = [
  { value: ShelfLifeRuleType.Days, label: 'Gün' },
  { value: ShelfLifeRuleType.Percentage, label: 'Yüzde' },
  { value: ShelfLifeRuleType.Both, label: 'Her İkisi' },
];

const expiryActions = [
  { value: ExpiryAction.None, label: 'Hiçbir Şey Yapma' },
  { value: ExpiryAction.AlertOnly, label: 'Sadece Uyarı' },
  { value: ExpiryAction.BlockSales, label: 'Satışı Engelle' },
  { value: ExpiryAction.Quarantine, label: 'Karantinaya Al' },
  { value: ExpiryAction.Scrap, label: 'Hurdaya Çıkar' },
  { value: ExpiryAction.DiscountSale, label: 'İndirimli Satış' },
];

const zoneTypes = [
  { value: ZoneType.Storage, label: 'Depolama' },
  { value: ZoneType.Receiving, label: 'Kabul' },
  { value: ZoneType.Shipping, label: 'Sevkiyat' },
  { value: ZoneType.Quality, label: 'Kalite Kontrol' },
  { value: ZoneType.Returns, label: 'İade' },
  { value: ZoneType.Quarantine, label: 'Karantina' },
  { value: ZoneType.ColdStorage, label: 'Soğuk Depo' },
  { value: ZoneType.Hazardous, label: 'Tehlikeli Madde' },
];

export default function ShelfLifeForm({ form, initialValues, onFinish, loading }: ShelfLifeFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [requiresSpecialStorage, setRequiresSpecialStorage] = useState(false);
  const [hasCustomerSpecificRules, setHasCustomerSpecificRules] = useState(false);
  const [autoQuarantineOnExpiry, setAutoQuarantineOnExpiry] = useState(true);
  const [autoScrapOnExpiry, setAutoScrapOnExpiry] = useState(false);

  const { data: products = [] } = useProducts();

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
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
      setIsActive(initialValues.isActive);
      setRequiresSpecialStorage(initialValues.requiresSpecialStorage);
      setHasCustomerSpecificRules(initialValues.hasCustomerSpecificRules);
      setAutoQuarantineOnExpiry(initialValues.autoQuarantineOnExpiry);
      setAutoScrapOnExpiry(initialValues.autoScrapOnExpiry);
    } else {
      form.setFieldsValue({
        shelfLifeType: ShelfLifeType.ExpiryDate,
        receivingRuleType: ShelfLifeRuleType.Days,
        salesRuleType: ShelfLifeRuleType.Days,
        expiryAction: ExpiryAction.Quarantine,
        autoQuarantineOnExpiry: true,
        autoScrapOnExpiry: false,
      });
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
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Clock Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Product Select */}
            <div className="flex-1">
              <FormSelect
                name="productId"
                required
                placeholder="Ürün Seçin..."
                disabled={!!initialValues}
                options={productOptions}
                formItemProps={{
                  className: 'mb-0',
                  rules: [{ required: true, message: 'Ürün seçimi zorunludur' }],
                }}
                className="w-full [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!shadow-none [&_.ant-select-selection-item]:!text-2xl [&_.ant-select-selection-item]:!font-bold [&_.ant-select-selection-placeholder]:!text-2xl [&_.ant-select-selection-placeholder]:!font-medium [&_.ant-select-selection-placeholder]:!text-slate-400"
              />
              <p className="text-sm text-slate-500 mt-1">Raf ömrü kuralı tanımlayın</p>
            </div>

            {/* Active Toggle */}
            {initialValues && (
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                  <span className="text-sm text-slate-600">Aktif</span>
                  <FormSwitch
                    form={form}
                    name="isActive"
                    value={isActive}
                    onChange={setIsActive}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 py-6">

          {/* Temel Ayarlar */}
          <FormSection title="Temel Ayarlar">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormSelect
                  name="shelfLifeType"
                  label="Raf Ömrü Türü"
                  required
                  placeholder="Tür seçin"
                  options={shelfLifeTypes}
                />
              </div>
              <div className="col-span-6">
                <FormNumber
                  name="totalShelfLifeDays"
                  label="Toplam Raf Ömrü (Gün)"
                  required
                  placeholder="365"
                  min={1}
                />
              </div>
            </div>
          </FormSection>

          {/* Kabul Kuralları */}
          <FormSection title="Kabul Kuralları">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormSelect
                  name="receivingRuleType"
                  label="Kural Türü"
                  options={shelfLifeRuleTypes}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="minReceivingShelfLifeDays"
                  label="Min. Gün"
                  placeholder="180"
                  min={0}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="minReceivingShelfLifePercent"
                  label="Min. Yüzde (%)"
                  placeholder="50"
                  min={0}
                  max={100}
                  precision={2}
                />
              </div>
            </div>
          </FormSection>

          {/* Satış Kuralları */}
          <FormSection title="Satış Kuralları">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormSelect
                  name="salesRuleType"
                  label="Kural Türü"
                  options={shelfLifeRuleTypes}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="minSalesShelfLifeDays"
                  label="Min. Gün"
                  placeholder="90"
                  min={0}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="minSalesShelfLifePercent"
                  label="Min. Yüzde (%)"
                  placeholder="25"
                  min={0}
                  max={100}
                  precision={2}
                />
              </div>
            </div>
          </FormSection>

          {/* Uyarı Eşikleri */}
          <FormSection title="Uyarı Eşikleri">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <FormNumber
                  name="alertThresholdDays"
                  label="Uyarı (Gün)"
                  placeholder="90"
                  min={0}
                />
              </div>
              <div className="col-span-3">
                <FormNumber
                  name="alertThresholdPercent"
                  label="Uyarı (%)"
                  placeholder="25"
                  min={0}
                  max={100}
                  precision={2}
                />
              </div>
              <div className="col-span-3">
                <FormNumber
                  name="criticalThresholdDays"
                  label="Kritik (Gün)"
                  placeholder="30"
                  min={0}
                />
              </div>
              <div className="col-span-3">
                <FormNumber
                  name="criticalThresholdPercent"
                  label="Kritik (%)"
                  placeholder="10"
                  min={0}
                  max={100}
                  precision={2}
                />
              </div>
            </div>
          </FormSection>

          {/* Süre Dolumunda Eylemler */}
          <FormSection title="Süre Dolumunda Eylemler">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormSelect
                  name="expiryAction"
                  label="Eylem"
                  options={expiryActions}
                />
              </div>
              <div className="col-span-6">
                <FormNumber
                  name="daysBeforeQuarantineAlert"
                  label="Karantina Uyarı Süresi (Gün)"
                  placeholder="7"
                  min={0}
                />
              </div>
              <div className="col-span-6">
                <FormSwitch
                  form={form}
                  name="autoQuarantineOnExpiry"
                  title="Otomatik Karantina"
                  value={autoQuarantineOnExpiry}
                  onChange={setAutoQuarantineOnExpiry}
                  descriptionTrue="Süre dolduğunda otomatik karantinaya al"
                  descriptionFalse="Süre dolduğunda otomatik karantinaya alma"
                  disabled={loading}
                />
              </div>
              <div className="col-span-6">
                <FormSwitch
                  form={form}
                  name="autoScrapOnExpiry"
                  title="Otomatik Hurda"
                  value={autoScrapOnExpiry}
                  onChange={setAutoScrapOnExpiry}
                  descriptionTrue="Süre dolduğunda otomatik hurdaya çıkar"
                  descriptionFalse="Süre dolduğunda otomatik hurdaya çıkarma"
                  disabled={loading}
                />
              </div>
            </div>
          </FormSection>

          {/* Gelişmiş Ayarlar */}
          <Collapse
            ghost
            expandIconPosition="end"
            className="!bg-transparent [&_.ant-collapse-header]:!px-0 [&_.ant-collapse-content-box]:!px-0"
            items={[
              {
                key: 'advanced',
                label: (
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Cog6ToothIcon className="w-4 h-4" /> Gelişmiş Ayarlar
                  </h3>
                ),
                children: (
                  <div className="pt-4 space-y-6">
                    {/* Müşteri Bazlı Kurallar */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-6">
                        <FormSwitch
                          form={form}
                          name="hasCustomerSpecificRules"
                          title="Müşteri Bazlı Kurallar"
                          value={hasCustomerSpecificRules}
                          onChange={setHasCustomerSpecificRules}
                          descriptionTrue="Müşteriye özel raf ömrü kuralları aktif"
                          descriptionFalse="Müşteriye özel raf ömrü kuralları pasif"
                          disabled={loading}
                        />
                      </div>
                      {hasCustomerSpecificRules && (
                        <div className="col-span-6">
                          <FormNumber
                            name="defaultCustomerMinShelfLifeDays"
                            label="Varsayılan Müşteri Min. Gün"
                            placeholder="60"
                            min={0}
                          />
                        </div>
                      )}
                    </div>

                    {/* Depolama Koşulları */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-4">
                        <FormSwitch
                          form={form}
                          name="requiresSpecialStorage"
                          title="Özel Depolama"
                          value={requiresSpecialStorage}
                          onChange={setRequiresSpecialStorage}
                          descriptionTrue="Özel depolama gerekli"
                          descriptionFalse="Özel depolama gerekli değil"
                          disabled={loading}
                        />
                      </div>
                      {requiresSpecialStorage && (
                        <>
                          <div className="col-span-4">
                            <FormSelect
                              name="requiredZoneType"
                              label="Gerekli Bölge Türü"
                              placeholder="Bölge türü seçin"
                              allowClear
                              options={zoneTypes}
                            />
                          </div>
                          <div className="col-span-4">
                            <FormInput
                              name="storageConditions"
                              label="Depolama Koşulları"
                              placeholder="Örn: 2-8°C arası..."
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ),
              },
            ]}
          />

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
