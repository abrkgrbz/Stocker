'use client';

import React, { useEffect, useState } from 'react';
import { Form } from 'antd';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { useProducts, useCategories, useWarehouses, useSuppliers } from '@/lib/api/hooks/useInventory';
import type { ReorderRuleDto, CreateReorderRuleDto, UpdateReorderRuleDto } from '@/lib/api/services/inventory.types';
import {
  FormHeader,
  FormSection,
  FormInput,
  FormNumber,
  FormSelect,
  FormSwitch,
  useUnsavedChanges,
  nameFieldRules,
} from '@/components/forms';

interface ReorderRuleFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ReorderRuleDto;
  onFinish: (values: CreateReorderRuleDto | UpdateReorderRuleDto) => void;
  loading?: boolean;
}

export default function ReorderRuleForm({ form, initialValues, onFinish, loading }: ReorderRuleFormProps) {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: warehouses = [], isLoading: warehousesLoading } = useWarehouses();
  const { data: suppliers = [], isLoading: suppliersLoading } = useSuppliers();

  const [useDynamic, setUseDynamic] = useState(false);
  const [triggerOnForecast, setTriggerOnForecast] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

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
      });
      setUseDynamic(initialValues.useEconomicOrderQuantity);
      setTriggerOnForecast(initialValues.triggerOnForecast);
      setIsScheduled(initialValues.isScheduled);
    } else {
      form.setFieldsValue({
        triggerOnForecast: false,
        useEconomicOrderQuantity: false,
        roundToPackSize: false,
        isScheduled: false,
        requiresApproval: false,
      });
    }
  }, [form, initialValues]);

  const handleFinish = (values: any) => {
    markAsSaved();
    const formattedValues = {
      ...values,
      triggerOnForecast: values.triggerOnForecast || false,
      useEconomicOrderQuantity: values.useEconomicOrderQuantity || false,
      roundToPackSize: values.roundToPackSize || false,
      isScheduled: values.isScheduled || false,
      requiresApproval: values.requiresApproval || false,
    };
    onFinish(formattedValues);
  };

  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const warehouseOptions = warehouses.map((w) => ({
    value: w.id,
    label: `${w.code} - ${w.name}`,
  }));

  const supplierOptions = suppliers.map((s) => ({
    value: s.id,
    label: `${s.code} - ${s.name}`,
  }));

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
          <div className="flex items-start gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
                <ArrowsRightLeftIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Name Input */}
            <div className="flex-1">
              <FormInput
                name="name"
                placeholder="Kural Adı..."
                variant="borderless"
                rules={nameFieldRules('Kural adı', 100)}
                className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
              />
              <FormInput
                name="description"
                placeholder="Kural açıklaması..."
                variant="borderless"
                className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400 mt-1"
              />
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 py-6">

          {/* Kapsam */}
          <FormSection title="Kapsam (Boş bırakılırsa tümüne uygulanır)">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormSelect
                  name="productId"
                  label="Ürün"
                  placeholder="Ürün seçin"
                  loading={productsLoading}
                  allowClear
                  options={productOptions}
                />
              </div>
              <div className="col-span-6">
                <FormSelect
                  name="categoryId"
                  label="Kategori"
                  placeholder="Kategori seçin"
                  loading={categoriesLoading}
                  allowClear
                  options={categoryOptions}
                />
              </div>
              <div className="col-span-6">
                <FormSelect
                  name="warehouseId"
                  label="Depo"
                  placeholder="Depo seçin"
                  loading={warehousesLoading}
                  allowClear
                  options={warehouseOptions}
                />
              </div>
              <div className="col-span-6">
                <FormSelect
                  name="supplierId"
                  label="Tedarikçi"
                  placeholder="Tedarikçi seçin"
                  loading={suppliersLoading}
                  allowClear
                  options={supplierOptions}
                />
              </div>
            </div>
          </FormSection>

          {/* Tetikleyici Koşullar */}
          <FormSection title="Tetikleyici Koşullar">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormNumber
                  name="triggerBelowQuantity"
                  label="Miktar altına düşünce"
                  placeholder="10"
                  min={0}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="triggerBelowDaysOfStock"
                  label="Gün cinsinden stok altına düşünce"
                  placeholder="7"
                  min={0}
                />
              </div>
              <div className="col-span-4">
                <FormSwitch
                  form={form}
                  name="triggerOnForecast"
                  title="Tahmine Göre Tetikle"
                  value={triggerOnForecast}
                  onChange={setTriggerOnForecast}
                  descriptionTrue="Stok tahminine göre"
                  descriptionFalse="Anlık stoka göre"
                  disabled={loading}
                />
              </div>
            </div>
            {triggerOnForecast && (
              <div className="grid grid-cols-12 gap-4 mt-4">
                <div className="col-span-4">
                  <FormNumber
                    name="forecastLeadTimeDays"
                    label="Tahmin Süresi (gün)"
                    placeholder="14"
                    min={1}
                  />
                </div>
              </div>
            )}
          </FormSection>

          {/* Sipariş Miktarı */}
          <FormSection title="Sipariş Miktarı">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormNumber
                  name="fixedReorderQuantity"
                  label="Sabit Sipariş Miktarı"
                  placeholder="100"
                  min={1}
                  disabled={useDynamic}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="reorderUpToQuantity"
                  label="Hedef Miktar (Stok Seviyesi)"
                  placeholder="500"
                  min={1}
                />
              </div>
              <div className="col-span-4">
                <FormSwitch
                  form={form}
                  name="useEconomicOrderQuantity"
                  title="Dinamik Miktar"
                  value={useDynamic}
                  onChange={setUseDynamic}
                  descriptionTrue="Ekonomik sipariş miktarı"
                  descriptionFalse="Sabit miktar"
                  disabled={loading}
                />
              </div>
            </div>
            {useDynamic && (
              <div className="grid grid-cols-12 gap-4 mt-4">
                <div className="col-span-4">
                  <FormNumber
                    name="minimumOrderQuantity"
                    label="Minimum Miktar"
                    placeholder="50"
                    min={1}
                  />
                </div>
                <div className="col-span-4">
                  <FormNumber
                    name="maximumOrderQuantity"
                    label="Maksimum Miktar"
                    placeholder="500"
                    min={1}
                  />
                </div>
              </div>
            )}
          </FormSection>

          {/* Paket Ayarları */}
          <FormSection title="Paket Ayarları">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormSwitch
                  form={form}
                  name="roundToPackSize"
                  title="Paket Boyutuna Yuvarla"
                  descriptionTrue="Sipariş miktarını yuvarla"
                  descriptionFalse="Yuvarlama yapılmaz"
                  disabled={loading}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="packSize"
                  label="Paket Boyutu"
                  placeholder="10"
                  min={1}
                />
              </div>
            </div>
          </FormSection>

          {/* Zamanlama */}
          <FormSection title="Zamanlama">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormSwitch
                  form={form}
                  name="isScheduled"
                  title="Zamanlanmış"
                  value={isScheduled}
                  onChange={setIsScheduled}
                  descriptionTrue="Otomatik çalıştır"
                  descriptionFalse="Manuel tetikleme"
                  disabled={loading}
                />
              </div>
              {isScheduled && (
                <div className="col-span-4">
                  <FormInput
                    name="cronExpression"
                    label="Cron İfadesi"
                    placeholder="0 8 * * 1 (Her Pazartesi 08:00)"
                    className="font-mono"
                  />
                </div>
              )}
            </div>
          </FormSection>

          {/* Onay Ayarları */}
          <FormSection title="Onay Ayarları">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormSwitch
                  form={form}
                  name="requiresApproval"
                  title="Onay Gerekli"
                  descriptionTrue="Sipariş öncesi onay al"
                  descriptionFalse="Otomatik sipariş"
                  disabled={loading}
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
