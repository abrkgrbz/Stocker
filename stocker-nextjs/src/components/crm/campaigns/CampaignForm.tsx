'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, DatePicker } from 'antd';
import { TrophyIcon } from '@heroicons/react/24/outline';
import type { Campaign } from '@/lib/api/services/crm.service';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

// Campaign type options
const campaignTypeOptions = [
  { value: 'Email', label: 'E-posta' },
  { value: 'SocialMedia', label: 'Sosyal Medya' },
  { value: 'Webinar', label: 'Webinar' },
  { value: 'Event', label: 'Etkinlik' },
  { value: 'Conference', label: 'Konferans' },
  { value: 'Advertisement', label: 'Reklam' },
  { value: 'Banner', label: 'Banner' },
  { value: 'Telemarketing', label: 'Telefonla Pazarlama' },
  { value: 'PublicRelations', label: 'Halkla İlişkiler' },
];

// Campaign status options
const campaignStatusOptions = [
  { value: 'Planned', label: 'Planlandı' },
  { value: 'InProgress', label: 'Devam Ediyor' },
  { value: 'Completed', label: 'Tamamlandı' },
  { value: 'OnHold', label: 'Beklemede' },
  { value: 'Aborted', label: 'İptal Edildi' },
];

interface CampaignFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: Campaign;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function CampaignForm({ form, initialValues, onFinish, loading }: CampaignFormProps) {
  const [campaignType, setCampaignType] = useState<string>('Email');
  const [budgetedCost, setBudgetedCost] = useState<number>(0);
  const [expectedRevenue, setExpectedRevenue] = useState<number>(0);
  const [targetLeads, setTargetLeads] = useState<number>(0);
  const [actualCost, setActualCost] = useState<number>(0);
  const [actualRevenue, setActualRevenue] = useState<number>(0);
  const [actualLeads, setActualLeads] = useState<number>(0);
  const [convertedLeads, setConvertedLeads] = useState<number>(0);
  const [campaignStatus, setCampaignStatus] = useState<string>('Planned');

  useEffect(() => {
    if (initialValues) {
      const formValues = {
        ...initialValues,
        dateRange: initialValues.startDate && initialValues.endDate
          ? [dayjs(initialValues.startDate), dayjs(initialValues.endDate)]
          : undefined,
      };
      form.setFieldsValue(formValues);
      setCampaignType(initialValues.type || 'Email');
      setBudgetedCost(initialValues.budgetedCost || 0);
      setExpectedRevenue(initialValues.expectedRevenue || 0);
      setTargetLeads(initialValues.targetLeads || 0);
      setActualCost(initialValues.actualCost || 0);
      setActualRevenue(initialValues.actualRevenue || 0);
      setActualLeads(initialValues.actualLeads || 0);
      setConvertedLeads(initialValues.convertedLeads || 0);
      setCampaignStatus(initialValues.status || 'Planned');
    } else {
      form.setFieldsValue({
        status: 'Planned',
        type: 'Email',
        budgetedCost: 0,
        expectedRevenue: 0,
        targetLeads: 0,
        actualCost: 0,
        actualRevenue: 0,
        actualLeads: 0,
        convertedLeads: 0,
      });
    }
  }, [form, initialValues]);

  // Calculate metrics
  const expectedProfit = expectedRevenue - budgetedCost;
  const roi = budgetedCost > 0 ? ((expectedProfit / budgetedCost) * 100) : 0;
  const costPerLead = targetLeads > 0 ? (budgetedCost / targetLeads) : 0;

  // Actual metrics
  const actualProfit = actualRevenue - actualCost;
  const actualRoi = actualCost > 0 ? ((actualProfit / actualCost) * 100) : 0;
  const conversionRate = actualLeads > 0 ? ((convertedLeads / actualLeads) * 100) : 0;

  // Check if campaign is in progress or completed to show actual fields
  const showActualFields = ['InProgress', 'Completed', 'OnHold', 'Aborted'].includes(campaignStatus);

  const handleFormFinish = (values: any) => {
    if (values.dateRange) {
      values.startDate = values.dateRange[0].format('YYYY-MM-DD');
      values.endDate = values.dateRange[1].format('YYYY-MM-DD');
      delete values.dateRange;
    }
    onFinish(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormFinish}
      disabled={loading}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Name + Type Selector
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Campaign Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <TrophyIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Campaign Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Kampanya adı zorunludur' },
                  { max: 200, message: 'En fazla 200 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Kampanya Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Kampanya hakkında kısa not..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Type Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="type" className="mb-0" initialValue="Email">
                <Select
                  options={campaignTypeOptions}
                  onChange={(val) => {
                    setCampaignType(val);
                    form.setFieldValue('type', val);
                  }}
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

          {/* ─────────────── BÜTÇE BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Bütçe Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Planlanan Bütçe (₺) <span className="text-red-500">*</span></label>
                <Form.Item
                  name="budgetedCost"
                  rules={[{ required: true, message: 'Bütçe zorunludur' }]}
                  className="mb-0"
                >
                  <InputNumber
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0}
                    placeholder="0"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value?.replace(/,/g, '') || 0) as any}
                    onChange={(val) => setBudgetedCost(val || 0)}
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Beklenen Gelir (₺) <span className="text-red-500">*</span></label>
                <Form.Item
                  name="expectedRevenue"
                  rules={[{ required: true, message: 'Beklenen gelir zorunludur' }]}
                  className="mb-0"
                >
                  <InputNumber
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0}
                    placeholder="0"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value?.replace(/,/g, '') || 0) as any}
                    onChange={(val) => setExpectedRevenue(val || 0)}
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Beklenen Kar</label>
                <div className={`h-[32px] flex items-center px-3 rounded-md text-sm font-semibold ${
                  expectedProfit >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  ₺{expectedProfit.toLocaleString('tr-TR')}
                  {budgetedCost > 0 && (
                    <span className="ml-2 text-xs font-normal">
                      (ROI: %{roi.toFixed(1)})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────── HEDEF BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Hedef Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hedef Lead Sayısı <span className="text-red-500">*</span></label>
                <Form.Item
                  name="targetLeads"
                  rules={[{ required: true, message: 'Hedef lead sayısı zorunludur' }]}
                  className="mb-0"
                >
                  <InputNumber
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0}
                    placeholder="0"
                    onChange={(val) => setTargetLeads(val || 0)}
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Lead Başına Maliyet</label>
                <div className="h-[32px] flex items-center px-3 rounded-md text-sm font-semibold bg-slate-50 text-slate-700">
                  ₺{costPerLead.toFixed(2)}
                </div>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hedef Kitle</label>
                <Form.Item name="targetAudience" className="mb-0">
                  <Input
                    placeholder="örn: 25-40 yaş profesyoneller"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── ZAMANLAMA ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Zamanlama
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kampanya Tarihleri <span className="text-red-500">*</span></label>
                <Form.Item
                  name="dateRange"
                  rules={[{ required: true, message: 'Tarih aralığı zorunludur' }]}
                  className="mb-0"
                >
                  <RangePicker
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                    format="DD/MM/YYYY"
                    placeholder={['Başlangıç', 'Bitiş']}
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum <span className="text-red-500">*</span></label>
                <Form.Item
                  name="status"
                  rules={[{ required: true, message: 'Durum seçimi zorunludur' }]}
                  className="mb-0"
                  initialValue="Planned"
                >
                  <Select
                    placeholder="Seçin"
                    options={campaignStatusOptions}
                    onChange={(val) => setCampaignStatus(val)}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── GERÇEKLEŞEN DEĞERLER ─────────────── */}
          {showActualFields && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Gerçekleşen Değerler
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Gerçekleşen Maliyet (₺)</label>
                  <Form.Item name="actualCost" className="mb-0">
                    <InputNumber
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                      min={0}
                      placeholder="0"
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => Number(value?.replace(/,/g, '') || 0) as any}
                      onChange={(val) => setActualCost(val || 0)}
                    />
                  </Form.Item>
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Gerçekleşen Gelir (₺)</label>
                  <Form.Item name="actualRevenue" className="mb-0">
                    <InputNumber
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                      min={0}
                      placeholder="0"
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => Number(value?.replace(/,/g, '') || 0) as any}
                      onChange={(val) => setActualRevenue(val || 0)}
                    />
                  </Form.Item>
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Gerçekleşen Kar</label>
                  <div className={`h-[32px] flex items-center px-3 rounded-md text-sm font-semibold ${
                    actualProfit >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    ₺{actualProfit.toLocaleString('tr-TR')}
                    {actualCost > 0 && (
                      <span className="ml-2 text-xs font-normal">
                        (ROI: %{actualRoi.toFixed(1)})
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Dönüşüm Oranı</label>
                  <div className={`h-[32px] flex items-center px-3 rounded-md text-sm font-semibold ${
                    conversionRate >= 10 ? 'bg-green-50 text-green-700' : conversionRate >= 5 ? 'bg-yellow-50 text-yellow-700' : 'bg-slate-50 text-slate-700'
                  }`}>
                    %{conversionRate.toFixed(1)}
                  </div>
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Gerçekleşen Lead Sayısı</label>
                  <Form.Item name="actualLeads" className="mb-0">
                    <InputNumber
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                      min={0}
                      placeholder="0"
                      onChange={(val) => setActualLeads(val || 0)}
                    />
                  </Form.Item>
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Dönüşen Lead Sayısı</label>
                  <Form.Item name="convertedLeads" className="mb-0">
                    <InputNumber
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                      min={0}
                      max={actualLeads || undefined}
                      placeholder="0"
                      onChange={(val) => setConvertedLeads(val || 0)}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────── NOTLAR ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    placeholder="Kampanya hakkında ek notlar..."
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
