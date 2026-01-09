'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
} from 'antd';
import {
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import { useProducts, useCategories, useWarehouses, useSuppliers } from '@/lib/api/hooks/useInventory';
import type { ReorderRuleDto } from '@/lib/api/services/inventory.types';

const { TextArea } = Input;

interface ReorderRuleFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ReorderRuleDto;
  onFinish: (values: any) => void;
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

        {/* Header Section */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-start gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
                <ArrowsRightLeftIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Rule Name Input */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Kural adı zorunludur' },
                  { max: 100, message: 'Kural adı en fazla 100 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Kural Adı..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Kural açıklaması..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 py-6">

          {/* Kapsam */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Kapsam (Boş bırakılırsa tümüne uygulanır)
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ürün</label>
                <Form.Item name="productId" className="mb-0">
                  <Select
                    placeholder="Ürün seçin"
                    loading={productsLoading}
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    options={products.map((p) => ({
                      value: p.id,
                      label: `${p.code} - ${p.name}`,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kategori</label>
                <Form.Item name="categoryId" className="mb-0">
                  <Select
                    placeholder="Kategori seçin"
                    loading={categoriesLoading}
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    options={categories.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Depo</label>
                <Form.Item name="warehouseId" className="mb-0">
                  <Select
                    placeholder="Depo seçin"
                    loading={warehousesLoading}
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    options={warehouses.map((w) => ({
                      value: w.id,
                      label: `${w.code} - ${w.name}`,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tedarikçi</label>
                <Form.Item name="supplierId" className="mb-0">
                  <Select
                    placeholder="Tedarikçi seçin"
                    loading={suppliersLoading}
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    options={suppliers.map((s) => ({
                      value: s.id,
                      label: `${s.code} - ${s.name}`,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Tetikleyici Koşullar */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tetikleyici Koşullar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Miktar altına düşünce</label>
                <Form.Item name="triggerBelowQuantity" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="10"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Gün cinsinden stok altına düşünce</label>
                <Form.Item name="triggerBelowDaysOfStock" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="7"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 h-full">
                  <div>
                    <div className="text-sm font-medium text-slate-700">Tahmine Göre Tetikle</div>
                    <div className="text-xs text-slate-500 mt-0.5">Stok tahminine göre</div>
                  </div>
                  <Form.Item name="triggerOnForecast" valuePropName="checked" noStyle>
                    <Switch
                      checked={triggerOnForecast}
                      onChange={(val) => {
                        setTriggerOnForecast(val);
                        form.setFieldValue('triggerOnForecast', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
            {triggerOnForecast && (
              <div className="grid grid-cols-12 gap-4 mt-4">
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Tahmin Süresi (gün)</label>
                  <Form.Item name="forecastLeadTimeDays" className="mb-0">
                    <InputNumber
                      style={{ width: '100%' }}
                      min={1}
                      placeholder="14"
                      className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    />
                  </Form.Item>
                </div>
              </div>
            )}
          </div>

          {/* Sipariş Miktarı */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Sipariş Miktarı
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sabit Sipariş Miktarı</label>
                <Form.Item name="fixedReorderQuantity" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    placeholder="100"
                    disabled={useDynamic}
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hedef Miktar (Stok Seviyesi)</label>
                <Form.Item name="reorderUpToQuantity" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    placeholder="500"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 h-full">
                  <div>
                    <div className="text-sm font-medium text-slate-700">Dinamik Miktar</div>
                    <div className="text-xs text-slate-500 mt-0.5">Ekonomik sipariş miktarı</div>
                  </div>
                  <Form.Item name="useEconomicOrderQuantity" valuePropName="checked" noStyle>
                    <Switch
                      checked={useDynamic}
                      onChange={(val) => {
                        setUseDynamic(val);
                        form.setFieldValue('useEconomicOrderQuantity', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
            {useDynamic && (
              <div className="grid grid-cols-12 gap-4 mt-4">
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Minimum Miktar</label>
                  <Form.Item name="minimumOrderQuantity" className="mb-0">
                    <InputNumber
                      style={{ width: '100%' }}
                      min={1}
                      placeholder="50"
                      className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    />
                  </Form.Item>
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Maksimum Miktar</label>
                  <Form.Item name="maximumOrderQuantity" className="mb-0">
                    <InputNumber
                      style={{ width: '100%' }}
                      min={1}
                      placeholder="500"
                      className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    />
                  </Form.Item>
                </div>
              </div>
            )}
          </div>

          {/* Paket Yuvarlama */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Paket Ayarları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm font-medium text-slate-700">Paket Boyutuna Yuvarla</div>
                    <div className="text-xs text-slate-500 mt-0.5">Sipariş miktarını yuvarla</div>
                  </div>
                  <Form.Item name="roundToPackSize" valuePropName="checked" noStyle>
                    <Switch />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Paket Boyutu</label>
                <Form.Item name="packSize" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    placeholder="10"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Zamanlama */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Zamanlama
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm font-medium text-slate-700">Zamanlanmış</div>
                    <div className="text-xs text-slate-500 mt-0.5">Otomatik çalıştır</div>
                  </div>
                  <Form.Item name="isScheduled" valuePropName="checked" noStyle>
                    <Switch
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
                      placeholder="0 8 * * 1 (Her Pazartesi 08:00)"
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white font-mono"
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          </div>

          {/* Onay */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Onay Ayarları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm font-medium text-slate-700">Onay Gerekli</div>
                    <div className="text-xs text-slate-500 mt-0.5">Sipariş öncesi onay al</div>
                  </div>
                  <Form.Item name="requiresApproval" valuePropName="checked" noStyle>
                    <Switch />
                  </Form.Item>
                </div>
              </div>
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
