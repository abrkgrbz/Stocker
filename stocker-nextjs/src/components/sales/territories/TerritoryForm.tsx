'use client';

/**
 * Sales Territory Form Component
 * Enterprise-grade form following CRM CustomerForm patterns
 */

import React from 'react';
import { Form, Input, Select, InputNumber, Divider } from 'antd';
import type { FormInstance } from 'antd';
import type { TerritoryType, SalesTerritoryListDto } from '@/lib/api/services/sales.service';

interface TerritoryFormProps {
  form: FormInstance;
  onFinish: (values: any) => void;
  loading?: boolean;
  isEdit?: boolean;
  initialValues?: any;
  parentTerritories?: SalesTerritoryListDto[];
  loadingParents?: boolean;
}

const territoryTypeOptions: { value: TerritoryType; label: string }[] = [
  { value: 'Country', label: 'Ülke' },
  { value: 'Region', label: 'Bölge' },
  { value: 'City', label: 'Şehir' },
  { value: 'District', label: 'İlçe' },
  { value: 'Zone', label: 'Zon' },
  { value: 'Custom', label: 'Özel' },
];

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

export function TerritoryForm({
  form,
  onFinish,
  loading = false,
  isEdit = false,
  initialValues,
  parentTerritories = [],
  loadingParents = false,
}: TerritoryFormProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      initialValues={{
        territoryType: 'Region',
        annualTargetCurrency: 'TRY',
        ...initialValues,
      }}
    >
      {/* Section: Temel Bilgiler */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          TEMEL BİLGİLER
        </h3>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <Form.Item
              name="territoryCode"
              label="Bölge Kodu"
              rules={[{ required: !isEdit, message: 'Bölge kodu giriniz' }]}
            >
              <Input
                placeholder="TR-IST"
                style={{ textTransform: 'uppercase' }}
                disabled={isEdit}
              />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item
              name="name"
              label="Bölge Adı"
              rules={[{ required: true, message: 'Bölge adı giriniz' }]}
            >
              <Input placeholder="İstanbul Bölgesi" />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item
              name="territoryType"
              label="Bölge Türü"
              rules={[{ required: !isEdit, message: 'Bölge türü seçiniz' }]}
            >
              <Select options={territoryTypeOptions} disabled={isEdit} />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item name="parentTerritoryId" label="Üst Bölge">
              <Select
                placeholder="Üst bölge seçiniz (opsiyonel)"
                loading={loadingParents}
                showSearch
                optionFilterProp="label"
                allowClear
                disabled={isEdit}
                options={parentTerritories.map((t) => ({
                  value: t.id,
                  label: `${t.territoryCode} - ${t.name}`
                }))}
              />
            </Form.Item>
          </div>
        </div>
      </div>

      <Divider className="!my-6" />

      {/* Section: Konum Bilgileri */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          KONUM BİLGİLERİ
        </h3>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <Form.Item name="country" label="Ülke">
              <Input placeholder="Türkiye" />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item name="region" label="Bölge">
              <Input placeholder="Marmara" />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item name="city" label="Şehir">
              <Input placeholder="İstanbul" />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item name="district" label="İlçe">
              <Input placeholder="Kadıköy" />
            </Form.Item>
          </div>
        </div>
      </div>

      <Divider className="!my-6" />

      {/* Section: Açıklama */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          AÇIKLAMA
        </h3>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <Form.Item name="description" label="Bölge Açıklaması">
              <Input.TextArea
                rows={3}
                placeholder="Bölge ile ilgili açıklama..."
                className="resize-none"
              />
            </Form.Item>
          </div>
          <div className="col-span-12">
            <Form.Item name="notes" label="Notlar">
              <Input.TextArea
                rows={2}
                placeholder="Ek notlar..."
                className="resize-none"
              />
            </Form.Item>
          </div>
        </div>
      </div>

      <Divider className="!my-6" />

      {/* Section: Hedefler */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          YILLIK HEDEFLER
        </h3>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <Form.Item name="annualTargetAmount" label="Hedef Tutarı">
              <InputNumber
                className="!w-full"
                placeholder="0"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/,/g, '') as any}
              />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item name="annualTargetCurrency" label="Para Birimi">
              <Select options={currencyOptions} />
            </Form.Item>
          </div>
        </div>
      </div>
    </Form>
  );
}
