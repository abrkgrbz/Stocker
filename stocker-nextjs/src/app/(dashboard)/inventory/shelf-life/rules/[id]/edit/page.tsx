'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, Input, InputNumber, Select, Switch, Button, Space, Spin } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useShelfLifeRule, useUpdateShelfLife } from '@/lib/api/hooks/useInventory';
import type { CreateShelfLifeDto, UpdateShelfLifeDto } from '@/lib/api/services/inventory.types';
import { ShelfLifeType, ShelfLifeRuleType, ExpiryAction } from '@/lib/api/services/inventory.types';

const { TextArea } = Input;

const shelfLifeTypeOptions = [
  { value: ShelfLifeType.ExpiryDate, label: 'Son Kullanma Tarihi' },
  { value: ShelfLifeType.BestBefore, label: 'Tavsiye Edilen (Best Before)' },
  { value: ShelfLifeType.ManufacturingDateBased, label: 'Üretim Tarihi Bazlı' },
  { value: ShelfLifeType.AfterOpening, label: 'Açıldıktan Sonra' },
  { value: ShelfLifeType.AfterFirstUse, label: 'İlk Kullanımdan Sonra' },
];

const ruleTypeOptions = [
  { value: ShelfLifeRuleType.Days, label: 'Gün Bazlı' },
  { value: ShelfLifeRuleType.Percentage, label: 'Yüzde Bazlı' },
  { value: ShelfLifeRuleType.Both, label: 'Her İkisi (Gün ve Yüzde)' },
];

const expiryActionOptions = [
  { value: ExpiryAction.None, label: 'Hiçbir Şey Yapma' },
  { value: ExpiryAction.AlertOnly, label: 'Sadece Uyarı' },
  { value: ExpiryAction.BlockSales, label: 'Satışı Engelle' },
  { value: ExpiryAction.Quarantine, label: 'Karantinaya Al' },
  { value: ExpiryAction.Scrap, label: 'Hurda Olarak İşaretle' },
  { value: ExpiryAction.DiscountSale, label: 'İndirimli Satış Öner' },
];

export default function EditShelfLifeRulePage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  const { data: rule, isLoading } = useShelfLifeRule(id);
  const updateRule = useUpdateShelfLife();

  const receivingRuleType = Form.useWatch('receivingRuleType', form);
  const salesRuleType = Form.useWatch('salesRuleType', form);

  useEffect(() => {
    if (rule) {
      form.setFieldsValue({
        shelfLifeType: rule.shelfLifeType,
        totalShelfLifeDays: rule.totalShelfLifeDays,
        receivingRuleType: rule.receivingRuleType,
        minReceivingShelfLifeDays: rule.minReceivingShelfLifeDays,
        minReceivingShelfLifePercent: rule.minReceivingShelfLifePercent,
        salesRuleType: rule.salesRuleType,
        minSalesShelfLifeDays: rule.minSalesShelfLifeDays,
        minSalesShelfLifePercent: rule.minSalesShelfLifePercent,
        alertThresholdDays: rule.alertThresholdDays,
        alertThresholdPercent: rule.alertThresholdPercent,
        criticalThresholdDays: rule.criticalThresholdDays,
        criticalThresholdPercent: rule.criticalThresholdPercent,
        expiryAction: rule.expiryAction,
        autoQuarantineOnExpiry: rule.autoQuarantineOnExpiry,
        autoScrapOnExpiry: rule.autoScrapOnExpiry,
        daysBeforeQuarantineAlert: rule.daysBeforeQuarantineAlert,
        hasCustomerSpecificRules: rule.hasCustomerSpecificRules,
        defaultCustomerMinShelfLifeDays: rule.defaultCustomerMinShelfLifeDays,
        requiresSpecialStorage: rule.requiresSpecialStorage,
        storageConditions: rule.storageConditions,
      });
    }
  }, [rule, form]);

  const handleSubmit = async (values: CreateShelfLifeDto | UpdateShelfLifeDto) => {
    try {
      await updateRule.mutateAsync({ id, data: values as UpdateShelfLifeDto });
      router.push(`/inventory/shelf-life/rules/${id}`);
    } catch {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Raf ömrü kuralı bulunamadı</p>
          <Button onClick={() => router.push('/inventory/shelf-life/rules')}>
            Listeye Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push(`/inventory/shelf-life/rules/${id}`)}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 m-0">
                  Raf Ömrü Kuralı Düzenle
                </h1>
                <p className="text-sm text-slate-500 m-0">
                  {rule.productName} ({rule.productCode})
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/inventory/shelf-life/rules/${id}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateRule.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Güncelle
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={updateRule.isPending}
          className="w-full"
          scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
        >
          {/* Mevcut Ürün Bilgisi */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl mb-6">
            <div className="px-8 py-6">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-200">
                Ürün Bilgisi (Salt Okunur)
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-xs text-slate-500 mb-1">Ürün</label>
                  <p className="text-sm font-medium text-slate-900">{rule.productName}</p>
                </div>
                <div className="col-span-6">
                  <label className="block text-xs text-slate-500 mb-1">Ürün Kodu</label>
                  <p className="text-sm font-medium text-slate-900">{rule.productCode}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-8 py-6">
              {/* Temel Bilgiler */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Temel Bilgiler
                </h3>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Raf Ömrü Tipi <span className="text-red-500">*</span>
                    </label>
                    <Form.Item
                      name="shelfLifeType"
                      rules={[{ required: true, message: 'Raf ömrü tipi zorunludur' }]}
                      className="mb-0"
                    >
                      <Select
                        placeholder="Tip seçin"
                        className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                        options={shelfLifeTypeOptions}
                      />
                    </Form.Item>
                  </div>

                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Toplam Raf Ömrü (Gün) <span className="text-red-500">*</span>
                    </label>
                    <Form.Item
                      name="totalShelfLifeDays"
                      rules={[{ required: true, message: 'Toplam raf ömrü zorunludur' }]}
                      className="mb-0"
                    >
                      <InputNumber
                        placeholder="0"
                        min={1}
                        style={{ width: '100%' }}
                        className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Mal Kabul Kuralları */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Mal Kabul Kuralları
                </h3>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Kural Tipi
                    </label>
                    <Form.Item name="receivingRuleType" className="mb-0">
                      <Select
                        placeholder="Kural tipi seçin"
                        className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                        options={ruleTypeOptions}
                      />
                    </Form.Item>
                  </div>

                  {(receivingRuleType === ShelfLifeRuleType.Days ||
                    receivingRuleType === ShelfLifeRuleType.Both) && (
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">
                        Minimum Kalan Gün
                      </label>
                      <Form.Item name="minReceivingShelfLifeDays" className="mb-0">
                        <InputNumber
                          placeholder="0"
                          min={0}
                          style={{ width: '100%' }}
                          className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                        />
                      </Form.Item>
                    </div>
                  )}

                  {(receivingRuleType === ShelfLifeRuleType.Percentage ||
                    receivingRuleType === ShelfLifeRuleType.Both) && (
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">
                        Minimum Kalan %
                      </label>
                      <Form.Item name="minReceivingShelfLifePercent" className="mb-0">
                        <InputNumber
                          placeholder="0"
                          min={0}
                          max={100}
                          style={{ width: '100%' }}
                          className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                          addonAfter="%"
                        />
                      </Form.Item>
                    </div>
                  )}
                </div>
              </div>

              {/* Satış Kuralları */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Satış Kuralları
                </h3>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Kural Tipi
                    </label>
                    <Form.Item name="salesRuleType" className="mb-0">
                      <Select
                        placeholder="Kural tipi seçin"
                        className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                        options={ruleTypeOptions}
                      />
                    </Form.Item>
                  </div>

                  {(salesRuleType === ShelfLifeRuleType.Days ||
                    salesRuleType === ShelfLifeRuleType.Both) && (
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">
                        Minimum Kalan Gün
                      </label>
                      <Form.Item name="minSalesShelfLifeDays" className="mb-0">
                        <InputNumber
                          placeholder="0"
                          min={0}
                          style={{ width: '100%' }}
                          className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                        />
                      </Form.Item>
                    </div>
                  )}

                  {(salesRuleType === ShelfLifeRuleType.Percentage ||
                    salesRuleType === ShelfLifeRuleType.Both) && (
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">
                        Minimum Kalan %
                      </label>
                      <Form.Item name="minSalesShelfLifePercent" className="mb-0">
                        <InputNumber
                          placeholder="0"
                          min={0}
                          max={100}
                          style={{ width: '100%' }}
                          className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                          addonAfter="%"
                        />
                      </Form.Item>
                    </div>
                  )}
                </div>
              </div>

              {/* Uyarı Eşikleri */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Uyarı Eşikleri
                </h3>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Uyarı Eşiği (Gün)
                    </label>
                    <Form.Item name="alertThresholdDays" className="mb-0">
                      <InputNumber
                        placeholder="30"
                        min={0}
                        style={{ width: '100%' }}
                        className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Uyarı Eşiği (%)
                    </label>
                    <Form.Item name="alertThresholdPercent" className="mb-0">
                      <InputNumber
                        placeholder="20"
                        min={0}
                        max={100}
                        style={{ width: '100%' }}
                        className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                        addonAfter="%"
                      />
                    </Form.Item>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Kritik Eşik (Gün)
                    </label>
                    <Form.Item name="criticalThresholdDays" className="mb-0">
                      <InputNumber
                        placeholder="7"
                        min={0}
                        style={{ width: '100%' }}
                        className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Kritik Eşik (%)
                    </label>
                    <Form.Item name="criticalThresholdPercent" className="mb-0">
                      <InputNumber
                        placeholder="5"
                        min={0}
                        max={100}
                        style={{ width: '100%' }}
                        className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                        addonAfter="%"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Süre Dolduğunda */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Süre Dolduğunda Yapılacak İşlem
                </h3>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Süre Dolunca
                    </label>
                    <Form.Item name="expiryAction" className="mb-0">
                      <Select
                        placeholder="İşlem seçin"
                        className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                        options={expiryActionOptions}
                      />
                    </Form.Item>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Karantina Uyarısı (Gün Önce)
                    </label>
                    <Form.Item name="daysBeforeQuarantineAlert" className="mb-0">
                      <InputNumber
                        placeholder="3"
                        min={0}
                        style={{ width: '100%' }}
                        className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>

                  <div className="col-span-12 flex gap-6">
                    <Form.Item
                      name="autoQuarantineOnExpiry"
                      valuePropName="checked"
                      className="mb-0"
                    >
                      <div className="flex items-center gap-2">
                        <Switch />
                        <span className="text-sm text-slate-600">
                          Süresi dolunca otomatik karantinaya al
                        </span>
                      </div>
                    </Form.Item>

                    <Form.Item name="autoScrapOnExpiry" valuePropName="checked" className="mb-0">
                      <div className="flex items-center gap-2">
                        <Switch />
                        <span className="text-sm text-slate-600">
                          Süresi dolunca otomatik hurdaya çıkar
                        </span>
                      </div>
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Depolama Koşulları */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Depolama Koşulları
                </h3>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12">
                    <Form.Item
                      name="requiresSpecialStorage"
                      valuePropName="checked"
                      className="mb-4"
                    >
                      <div className="flex items-center gap-2">
                        <Switch />
                        <span className="text-sm text-slate-600">Özel depolama gerektirir</span>
                      </div>
                    </Form.Item>
                  </div>

                  <div className="col-span-12">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Depolama Koşulları
                    </label>
                    <Form.Item name="storageConditions" className="mb-0">
                      <TextArea
                        rows={3}
                        placeholder="Sıcaklık, nem, ışık vb. depolama koşulları..."
                        className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hidden submit button */}
          <Form.Item hidden>
            <Button htmlType="submit" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
