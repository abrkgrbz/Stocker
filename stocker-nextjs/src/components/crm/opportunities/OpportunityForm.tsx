'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Slider } from 'antd';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useCustomers, usePipelines } from '@/lib/api/hooks/useCRM';
import type { OpportunityDto } from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

// Opportunity status options - synced with backend enum: Open=1, Won=2, Lost=3, OnHold=4
const statusOptions = [
  { value: 'Open', label: 'Açık' },
  { value: 'Won', label: 'Kazanıldı' },
  { value: 'Lost', label: 'Kaybedildi' },
  { value: 'OnHold', label: 'Beklemede' },
];

// Currency options
const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
];

// Source options
const sourceOptions = [
  { value: 'Website', label: 'Web Sitesi' },
  { value: 'Referral', label: 'Referans' },
  { value: 'SocialMedia', label: 'Sosyal Medya' },
  { value: 'Email', label: 'E-posta' },
  { value: 'ColdCall', label: 'Soğuk Arama' },
  { value: 'Event', label: 'Etkinlik' },
  { value: 'Partner', label: 'İş Ortağı' },
  { value: 'Other', label: 'Diğer' },
];

interface OpportunityFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: OpportunityDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function OpportunityForm({ form, initialValues, onFinish, loading }: OpportunityFormProps) {
  const [probability, setProbability] = useState(50);
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [opportunityStatus, setOpportunityStatus] = useState<string>('Open');

  // Fetch customers and pipelines
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const { data: pipelines = [] } = usePipelines();

  const customers = customersData?.items || [];

  // Get stages from selected pipeline
  const stages = selectedPipeline
    ? (pipelines as any[]).find((p: any) => p.id === selectedPipeline)?.stages || []
    : [];

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        expectedCloseDate: initialValues.expectedCloseDate ? dayjs(initialValues.expectedCloseDate) : null,
        currentStageId: initialValues.currentStageId,
      });
      setProbability(initialValues.probability || 50);
      setAmount(initialValues.amount || 0);
      setOpportunityStatus(initialValues.status || 'Open');
      if (initialValues.pipelineId) {
        setSelectedPipeline(initialValues.pipelineId);
      }
    } else {
      form.setFieldsValue({
        probability: 50,
        status: 'Open',
        currency: 'TRY',
      });
    }
  }, [form, initialValues]);

  // Calculate expected value
  const expectedValue = (amount * probability) / 100;

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
            HEADER: Icon + Name + Status
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Opportunity Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Opportunity Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Fırsat adı zorunludur' },
                  { max: 200, message: 'En fazla 200 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Fırsat Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Fırsat hakkında kısa not..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Status Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="status" className="mb-0" initialValue="Open">
                <Select
                  options={statusOptions}
                  onChange={(val) => setOpportunityStatus(val)}
                  className="w-40 [&_.ant-select-selector]:!bg-slate-100 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!rounded-lg"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── FİNANSAL BİLGİLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Finansal Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tutar <span className="text-red-500">*</span></label>
                <Form.Item
                  name="amount"
                  rules={[{ required: true, message: 'Tutar zorunludur' }]}
                  className="mb-0"
                >
                  <InputNumber
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/,/g, '') as any}
                    placeholder="0"
                    onChange={(val) => setAmount(val || 0)}
                  />
                </Form.Item>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Para Birimi</label>
                <Form.Item name="currency" className="mb-0" initialValue="TRY">
                  <Select
                    options={currencyOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Olasılık (%{probability})</label>
                <Form.Item name="probability" className="mb-0" initialValue={50}>
                  <Slider
                    min={0}
                    max={100}
                    marks={{ 0: '0%', 50: '50%', 100: '100%' }}
                    value={probability}
                    onChange={(val) => {
                      setProbability(val);
                      form.setFieldValue('probability', val);
                    }}
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Beklenen Değer</label>
                <div className="h-[32px] flex items-center px-3 rounded-md text-sm font-semibold bg-green-50 text-green-700">
                  {expectedValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────── MÜŞTERİ VE TARİH ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Müşteri ve Tarih
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Müşteri <span className="text-red-500">*</span></label>
                <Form.Item
                  name="customerId"
                  rules={[{ required: true, message: 'Müşteri seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Müşteri seçin"
                    showSearch
                    loading={customersLoading}
                    optionFilterProp="label"
                    options={customers.map((c: any) => ({
                      label: c.customerName || c.companyName,
                      value: c.id,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tahmini Kapanış Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="expectedCloseDate"
                  rules={[{ required: true, message: 'Tahmini kapanış tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                    format="DD/MM/YYYY"
                    placeholder="Tarih seçin"
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── SATIŞ SÜRECİ (OPSİYONEL) ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Satış Süreci (Opsiyonel)
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Pipeline</label>
                <Form.Item name="pipelineId" className="mb-0">
                  <Select
                    placeholder="Pipeline seçin (opsiyonel)"
                    allowClear
                    onChange={(val) => {
                      setSelectedPipeline(val);
                      form.setFieldValue('currentStageId', undefined);
                    }}
                    options={(pipelines as any[]).map((p: any) => ({
                      label: `${p.name} (${p.stages?.length || 0} aşama)`,
                      value: p.id,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Aşama</label>
                <Form.Item name="currentStageId" className="mb-0">
                  <Select
                    placeholder={selectedPipeline ? 'Aşama seçin' : 'Önce pipeline seçin'}
                    allowClear
                    disabled={!selectedPipeline}
                    options={stages.map((s: any) => ({
                      label: s.name,
                      value: s.id,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <div className="text-xs text-slate-500 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong>Bilgi:</strong> Pipeline ve aşama seçimi opsiyoneldir. Fırsatları satış süreçlerine bağlamak için kullanabilirsiniz.
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────── EK BİLGİLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ek Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kaynak</label>
                <Form.Item name="source" className="mb-0">
                  <Select
                    placeholder="Kaynak seçin"
                    allowClear
                    options={sourceOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Rakip Firma</label>
                <Form.Item name="competitorName" className="mb-0">
                  <Input
                    placeholder="Rakip firma adı"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── SONUÇ BİLGİLERİ (LOST) ─────────────── */}
          {opportunityStatus === 'Lost' && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Kayıp Bilgileri
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Kayıp Nedeni</label>
                  <Form.Item name="lostReason" className="mb-0">
                    <TextArea
                      placeholder="Fırsatın neden kaybedildiğini açıklayın..."
                      rows={3}
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────── NOTLAR ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    placeholder="Fırsat hakkında ek notlar..."
                    rows={3}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Hidden submit */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
