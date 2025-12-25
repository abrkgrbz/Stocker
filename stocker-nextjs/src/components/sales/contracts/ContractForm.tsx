'use client';

/**
 * Customer Contract Form Component
 * Enterprise-grade form following CRM CustomerForm patterns
 */

import React from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Divider } from 'antd';
import type { FormInstance } from 'antd';
import type { ContractType, ContractStatus } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';

interface ContractFormProps {
  form: FormInstance;
  onFinish: (values: any) => void;
  loading?: boolean;
  isEdit?: boolean;
  initialValues?: any;
  customers?: { id: string; name: string }[];
  loadingCustomers?: boolean;
}

const contractTypeOptions: { value: ContractType; label: string }[] = [
  { value: 'Standard', label: 'Standart' },
  { value: 'Premium', label: 'Premium' },
  { value: 'Enterprise', label: 'Kurumsal' },
  { value: 'Custom', label: 'Özel' },
  { value: 'Framework', label: 'Çerçeve Sözleşme' },
  { value: 'ServiceLevel', label: 'SLA Sözleşmesi' },
];

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

export function ContractForm({
  form,
  onFinish,
  loading = false,
  isEdit = false,
  initialValues,
  customers = [],
  loadingCustomers = false,
}: ContractFormProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      initialValues={{
        contractType: 'Standard',
        currency: 'TRY',
        ...initialValues,
        startDate: initialValues?.startDate ? dayjs(initialValues.startDate) : dayjs(),
        endDate: initialValues?.endDate ? dayjs(initialValues.endDate) : dayjs().add(1, 'year'),
      }}
    >
      {/* Section: Temel Bilgiler */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          TEMEL BİLGİLER
        </h3>
        <div className="grid grid-cols-12 gap-4">
          {!isEdit && (
            <div className="col-span-12">
              <Form.Item
                name="customerId"
                label="Müşteri"
                rules={[{ required: true, message: 'Müşteri seçiniz' }]}
              >
                <Select
                  placeholder="Müşteri seçiniz"
                  loading={loadingCustomers}
                  showSearch
                  optionFilterProp="label"
                  options={customers.map((c) => ({ value: c.id, label: c.name }))}
                />
              </Form.Item>
            </div>
          )}
          <div className="col-span-6">
            <Form.Item
              name="contractType"
              label="Sözleşme Türü"
              rules={[{ required: true, message: 'Sözleşme türü seçiniz' }]}
            >
              <Select options={contractTypeOptions} />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item name="contractNumber" label="Sözleşme Numarası">
              <Input placeholder="Otomatik oluşturulacak" disabled={!isEdit} />
            </Form.Item>
          </div>
        </div>
      </div>

      <Divider className="!my-6" />

      {/* Section: Süre */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          SÖZLEŞME SÜRESİ
        </h3>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <Form.Item
              name="startDate"
              label="Başlangıç Tarihi"
              rules={[{ required: true, message: 'Başlangıç tarihi seçiniz' }]}
            >
              <DatePicker
                format="DD.MM.YYYY"
                className="w-full"
                placeholder="Tarih seçiniz"
              />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item
              name="endDate"
              label="Bitiş Tarihi"
              rules={[{ required: true, message: 'Bitiş tarihi seçiniz' }]}
            >
              <DatePicker
                format="DD.MM.YYYY"
                className="w-full"
                placeholder="Tarih seçiniz"
              />
            </Form.Item>
          </div>
        </div>
      </div>

      <Divider className="!my-6" />

      {/* Section: Finansal Bilgiler */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          FİNANSAL BİLGİLER
        </h3>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <Form.Item name="creditLimitAmount" label="Kredi Limiti">
              <InputNumber
                className="!w-full"
                placeholder="0"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/,/g, '') as any}
              />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item name="currency" label="Para Birimi">
              <Select options={currencyOptions} />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item name="discountPercentage" label="İndirim Oranı (%)">
              <InputNumber
                className="!w-full"
                min={0}
                max={100}
                placeholder="0"
                addonAfter="%"
              />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item name="paymentTermDays" label="Ödeme Vadesi (Gün)">
              <InputNumber
                className="!w-full"
                min={0}
                placeholder="30"
              />
            </Form.Item>
          </div>
        </div>
      </div>

      <Divider className="!my-6" />

      {/* Section: SLA Bilgileri */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          SLA BİLGİLERİ
        </h3>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
            <Form.Item name="responseTimeHours" label="Yanıt Süresi (Saat)">
              <InputNumber
                className="!w-full"
                min={0}
                placeholder="24"
              />
            </Form.Item>
          </div>
          <div className="col-span-4">
            <Form.Item name="resolutionTimeHours" label="Çözüm Süresi (Saat)">
              <InputNumber
                className="!w-full"
                min={0}
                placeholder="72"
              />
            </Form.Item>
          </div>
          <div className="col-span-4">
            <Form.Item name="supportLevel" label="Destek Seviyesi">
              <Select
                placeholder="Seçiniz"
                options={[
                  { value: 'Basic', label: 'Temel' },
                  { value: 'Standard', label: 'Standart' },
                  { value: 'Premium', label: 'Premium' },
                  { value: 'Enterprise', label: 'Kurumsal' },
                ]}
              />
            </Form.Item>
          </div>
        </div>
      </div>

      <Divider className="!my-6" />

      {/* Section: Notlar */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          NOTLAR
        </h3>
        <Form.Item name="notes" label="Sözleşme Notları">
          <Input.TextArea
            rows={4}
            placeholder="Sözleşme ile ilgili notlar..."
            className="resize-none"
          />
        </Form.Item>
        <Form.Item name="terms" label="Özel Şartlar">
          <Input.TextArea
            rows={4}
            placeholder="Özel sözleşme şartları..."
            className="resize-none"
          />
        </Form.Item>
      </div>
    </Form>
  );
}
