'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Switch, Select } from 'antd';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useProducts, useCategories, useWarehouses, useSuppliers } from '@/lib/api/hooks/useInventory';
import type { ReorderRuleDto } from '@/lib/api/services/inventory.types';

const { TextArea } = Input;

interface ReorderRuleFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ReorderRuleDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const statusOptions = [
  { value: 0, label: 'Aktif' },
  { value: 1, label: 'Duraklatıldı' },
  { value: 2, label: 'Devre Dışı' },
];

export default function ReorderRuleForm({ form, initialValues, onFinish, loading }: ReorderRuleFormProps) {
  const [isScheduled, setIsScheduled] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [useEoq, setUseEoq] = useState(false);
  const [roundToPack, setRoundToPack] = useState(false);

  const { data: products = [] } = useProducts(true);
  const { data: categories = [] } = useCategories(true);
  const { data: warehouses = [] } = useWarehouses(true);
  const { data: suppliers = [] } = useSuppliers();

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));

  const categoryOptions = categories.map(c => ({
    value: c.id,
    label: c.name,
  }));

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: w.name,
  }));

  const supplierOptions = suppliers.map(s => ({
    value: s.id,
    label: s.name,
  }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsScheduled(initialValues.isScheduled ?? false);
      setRequiresApproval(initialValues.requiresApproval ?? false);
      setUseEoq(initialValues.useEconomicOrderQuantity ?? false);
      setRoundToPack(initialValues.roundToPackSize ?? false);
    } else {
      form.setFieldsValue({
        status: 0,
        priority: 100,
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
            HEADER: Icon + Name + Status
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Rule Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ArrowPathIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Rule Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Kural adı zorunludur' },
                  { max: 200, message: 'Kural adı en fazla 200 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Yeniden Sipariş Kuralı Adı..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <p className="text-sm text-slate-500 mt-1">Otomatik sipariş oluşturma kuralı</p>
            </div>

            {/* Status Badge */}
            <div className="flex-shrink-0">
              <Form.Item name="status" className="mb-0" initialValue={0}>
                <Select
                  options={statusOptions}
                  className="w-32 [&_.ant-select-selector]:!bg-slate-100 [&_.ant-select-selector]:!border-0"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── KAPSAM BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Kapsam Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ürün (opsiyonel)</label>
                <Form.Item name="productId" className="mb-0">
                  <Select
                    placeholder="Belirli ürün seçin"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={productOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kategori (opsiyonel)</label>
                <Form.Item name="categoryId" className="mb-0">
                  <Select
                    placeholder="Kategori seçin"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={categoryOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Depo (opsiyonel)</label>
                <Form.Item name="warehouseId" className="mb-0">
                  <Select
                    placeholder="Depo seçin"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={warehouseOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tedarikçi (opsiyonel)</label>
                <Form.Item name="supplierId" className="mb-0">
                  <Select
                    placeholder="Tedarikçi seçin"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={supplierOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Açıklama</label>
                <Form.Item name="description" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="Kural açıklaması..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── TETİKLEME KOŞULLARI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tetikleme Koşulları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Miktar Altına Düşünce</label>
                <Form.Item name="triggerBelowQuantity" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 10"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Stok Günü Altına Düşünce</label>
                <Form.Item name="triggerBelowDaysOfStock" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 7"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tahmin Temin Süresi (gün)</label>
                <Form.Item name="forecastLeadTimeDays" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 14"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Tahmine göre tetikle</div>
                  <Form.Item name="triggerOnForecast" valuePropName="checked" noStyle>
                    <Switch size="small" />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────── SİPARİŞ AYARLARI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Sipariş Ayarları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sabit Sipariş Miktarı</label>
                <Form.Item name="fixedReorderQuantity" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 100"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hedefe Tamamla</label>
                <Form.Item name="reorderUpToQuantity" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 500"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 h-full">
                  <div className="text-sm text-slate-700">Ekonomik Sipariş Miktarı (EOQ)</div>
                  <Form.Item name="useEconomicOrderQuantity" valuePropName="checked" noStyle>
                    <Switch
                      size="small"
                      checked={useEoq}
                      onChange={(val) => {
                        setUseEoq(val);
                        form.setFieldValue('useEconomicOrderQuantity', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Minimum Sipariş</label>
                <Form.Item name="minimumOrderQuantity" className="mb-0">
                  <InputNumber
                    placeholder="Min"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maksimum Sipariş</label>
                <Form.Item name="maximumOrderQuantity" className="mb-0">
                  <InputNumber
                    placeholder="Max"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 h-full">
                  <div className="text-sm text-slate-700">Paket boyutuna yuvarla</div>
                  <Form.Item name="roundToPackSize" valuePropName="checked" noStyle>
                    <Switch
                      size="small"
                      checked={roundToPack}
                      onChange={(val) => {
                        setRoundToPack(val);
                        form.setFieldValue('roundToPackSize', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              {roundToPack && (
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Paket Boyutu</label>
                  <Form.Item name="packSize" className="mb-0">
                    <InputNumber
                      placeholder="Örn: 12"
                      min={1}
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          </div>

          {/* ─────────────── ZAMANLAMA VE ONAY ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Zamanlama ve Onay
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Zamanlanmış çalışma</div>
                  <Form.Item name="isScheduled" valuePropName="checked" noStyle>
                    <Switch
                      size="small"
                      checked={isScheduled}
                      onChange={(val) => {
                        setIsScheduled(val);
                        form.setFieldValue('isScheduled', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              {isScheduled && (
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Cron İfadesi</label>
                  <Form.Item name="cronExpression" className="mb-0">
                    <Input
                      placeholder="0 8 * * *"
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                    />
                  </Form.Item>
                </div>
              )}
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Onay gerekli</div>
                  <Form.Item name="requiresApproval" valuePropName="checked" noStyle>
                    <Switch
                      size="small"
                      checked={requiresApproval}
                      onChange={(val) => {
                        setRequiresApproval(val);
                        form.setFieldValue('requiresApproval', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Öncelik (düşük = yüksek öncelik)</label>
                <Form.Item name="priority" className="mb-0" initialValue={100}>
                  <InputNumber
                    placeholder="100"
                    min={1}
                    max={1000}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── İSTATİSTİKLER (Düzenleme Modu) ─────────────── */}
          {initialValues && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Çalışma İstatistikleri
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.executionCount || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Çalışma Sayısı</div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-sm font-medium text-slate-800">
                      {initialValues.lastExecutedAt
                        ? new Date(initialValues.lastExecutedAt).toLocaleDateString('tr-TR')
                        : '-'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Son Çalışma</div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-sm font-medium text-slate-800">
                      {initialValues.nextScheduledRun
                        ? new Date(initialValues.nextScheduledRun).toLocaleDateString('tr-TR')
                        : '-'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Sonraki Çalışma</div>
                  </div>
                </div>
              </div>
            </div>
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
