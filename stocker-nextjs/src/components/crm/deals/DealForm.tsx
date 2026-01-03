'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, DatePicker } from 'antd';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import type { Deal } from '@/lib/api/services/crm.service';
import { useCustomers, usePipelines } from '@/lib/api/hooks/useCRM';
import dayjs from 'dayjs';

const { TextArea } = Input;

// Status options
const statusOptions = [
  { value: 'Open', label: 'Açık' },
  { value: 'Won', label: 'Kazanıldı' },
  { value: 'Lost', label: 'Kaybedildi' },
];

// Priority options
const priorityOptions = [
  { value: 'Low', label: 'Düşük' },
  { value: 'Medium', label: 'Orta' },
  { value: 'High', label: 'Yüksek' },
  { value: 'Urgent', label: 'Acil' },
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

interface DealFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: Deal;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function DealForm({ form, initialValues, onFinish, loading }: DealFormProps) {
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [dealStatus, setDealStatus] = useState<string>('Open');

  // Fetch data
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const { data: pipelines = [], isLoading: pipelinesLoading } = usePipelines();
  const customers = customersData?.items || [];

  // Get stages from selected pipeline
  const stages = selectedPipeline
    ? pipelines.find((p) => p.id === selectedPipeline)?.stages || []
    : [];

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        expectedCloseDate: initialValues.expectedCloseDate ? dayjs(initialValues.expectedCloseDate) : null,
      });
      setSelectedPipeline(initialValues.pipelineId || null);
      setDealStatus(initialValues.status || 'Open');
    } else {
      const defaultPipeline = pipelines.find((p) => p.isDefault) || pipelines[0];
      if (defaultPipeline) {
        setSelectedPipeline(defaultPipeline.id);
        form.setFieldsValue({
          pipelineId: defaultPipeline.id,
          stageId: defaultPipeline.stages?.[0]?.id,
          status: 'Open',
          probability: 50,
          priority: 'Medium',
          currency: 'TRY',
        });
      }
    }
  }, [form, initialValues, pipelines]);

  const handleFormFinish = (values: any) => {
    if (values.expectedCloseDate) {
      values.expectedCloseDate = values.expectedCloseDate.toISOString();
    }
    onFinish(values);
  };

  const handlePipelineChange = (pipelineId: string) => {
    setSelectedPipeline(pipelineId);
    const pipeline = pipelines.find((p) => p.id === pipelineId);
    if (pipeline?.stages?.length) {
      form.setFieldsValue({ stageId: pipeline.stages[0].id });
    } else {
      form.setFieldsValue({ stageId: undefined });
    }
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
            HEADER: Icon + Title
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Deal Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Deal Title - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="title"
                rules={[
                  { required: true, message: 'Fırsat adı zorunludur' },
                  { max: 200, message: 'En fazla 200 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Fırsat Başlığı Girin..."
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

            {/* Status Badge */}
            <div className="flex-shrink-0">
              <Form.Item name="status" className="mb-0" initialValue="Open">
                <Select
                  options={statusOptions}
                  onChange={(val) => setDealStatus(val)}
                  className="w-32 [&_.ant-select-selector]:!bg-slate-100 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!rounded-lg"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── MÜŞTERİ BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Müşteri Bilgileri
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
                    filterOption={(input, option) =>
                      (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    optionLabelProp="label"
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                    options={customers.map((customer) => ({
                      value: customer.id,
                      label: customer.companyName || customer.contactPerson || customer.email || 'İsimsiz Müşteri',
                      companyName: customer.companyName,
                      contactPerson: customer.contactPerson,
                      email: customer.email,
                    }))}
                    optionRender={(option) => (
                      <div className="flex flex-col w-full">
                        <span className="font-medium text-slate-900">
                          {option.data.companyName || option.data.contactPerson || option.data.email || 'İsimsiz Müşteri'}
                        </span>
                        {(option.data.companyName || option.data.contactPerson) && option.data.email && (
                          <span className="text-xs text-slate-400">{option.data.email}</span>
                        )}
                      </div>
                    )}
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Öncelik</label>
                <Form.Item name="priority" className="mb-0" initialValue="Medium">
                  <Select
                    options={priorityOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── FİNANSAL BİLGİLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Finansal Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tutar <span className="text-red-500">*</span></label>
                <Form.Item
                  name="amount"
                  rules={[{ required: true, message: 'Tutar zorunludur' }]}
                  className="mb-0"
                >
                  <InputNumber
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/,/g, '') as any}
                    placeholder="0"
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
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Olasılık (%) <span className="text-red-500">*</span></label>
                <Form.Item
                  name="probability"
                  rules={[{ required: true, message: 'Olasılık zorunludur' }]}
                  className="mb-0"
                  initialValue={50}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    placeholder="50"
                    addonAfter="%"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kaynak</label>
                <Form.Item name="source" className="mb-0">
                  <Select
                    placeholder="Seçin"
                    allowClear
                    options={sourceOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── SATIŞ SÜRECİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Satış Süreci
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Pipeline <span className="text-red-500">*</span></label>
                <Form.Item
                  name="pipelineId"
                  rules={[{ required: true, message: 'Pipeline seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Pipeline seçin"
                    loading={pipelinesLoading}
                    onChange={handlePipelineChange}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  >
                    {pipelines.map((pipeline) => (
                      <Select.Option key={pipeline.id} value={pipeline.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{pipeline.name}</span>
                          <span className="text-slate-400 text-xs">({pipeline.stages?.length || 0} aşama)</span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Aşama <span className="text-red-500">*</span></label>
                <Form.Item
                  name="stageId"
                  rules={[{ required: true, message: 'Aşama seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder={selectedPipeline ? "Aşama seçin" : "Önce pipeline seçin"}
                    disabled={!selectedPipeline}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  >
                    {stages.map((stage) => (
                      <Select.Option key={stage.id} value={stage.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          />
                          <span>{stage.name}</span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── TARİH BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tarih Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
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

          {/* ─────────────── RAKİP BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Rekabet Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
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

          {/* ─────────────── SONUÇ BİLGİLERİ (LOST/WON) ─────────────── */}
          {(dealStatus === 'Lost' || dealStatus === 'Won') && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                {dealStatus === 'Lost' ? 'Kayıp Bilgileri' : 'Kazanma Bilgileri'}
              </h3>
              <div className="grid grid-cols-12 gap-4">
                {dealStatus === 'Lost' && (
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
                )}
                {dealStatus === 'Won' && (
                  <div className="col-span-12">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Kazanma Detayları</label>
                    <Form.Item name="wonDetails" className="mb-0">
                      <TextArea
                        placeholder="Fırsatın nasıl kazanıldığını açıklayın..."
                        rows={3}
                        className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                      />
                    </Form.Item>
                  </div>
                )}
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
