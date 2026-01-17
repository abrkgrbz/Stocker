'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker } from 'antd';
import { PhoneIcon } from '@heroicons/react/24/outline';
import type { CallLogDto } from '@/lib/api/services/crm.types';
import { CallDirection, CallType, CallStatus, CallOutcome } from '@/lib/api/services/crm.types';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import { FormPhoneInput } from '@/components/ui/InternationalPhoneInput';

const { TextArea } = Input;

// Call type options - Backend CallType enum ile senkronize
const callTypeOptions = [
  { value: CallType.Standard, label: 'Standart' },
  { value: CallType.Sales, label: 'Satış' },
  { value: CallType.Support, label: 'Destek' },
  { value: CallType.FollowUp, label: 'Takip' },
  { value: CallType.Campaign, label: 'Kampanya' },
  { value: CallType.Conference, label: 'Konferans' },
  { value: CallType.Callback, label: 'Geri Arama' },
];

// Call status options - Backend CallStatus enum ile senkronize
const callStatusOptions = [
  { value: CallStatus.Ringing, label: 'Çalıyor' },
  { value: CallStatus.InProgress, label: 'Devam Ediyor' },
  { value: CallStatus.OnHold, label: 'Beklemede' },
  { value: CallStatus.Transferred, label: 'Aktarıldı' },
  { value: CallStatus.Completed, label: 'Tamamlandı' },
  { value: CallStatus.Missed, label: 'Cevapsız' },
  { value: CallStatus.Abandoned, label: 'Terk Edildi' },
  { value: CallStatus.Busy, label: 'Meşgul' },
  { value: CallStatus.Failed, label: 'Başarısız' },
];

// Call outcome options - Backend CallOutcome enum ile senkronize
const callOutcomeOptions = [
  { value: CallOutcome.Successful, label: 'Başarılı' },
  { value: CallOutcome.LeftVoicemail, label: 'Mesaj Bırakıldı' },
  { value: CallOutcome.NoAnswer, label: 'Cevap Yok' },
  { value: CallOutcome.Busy, label: 'Meşgul' },
  { value: CallOutcome.WrongNumber, label: 'Yanlış Numara' },
  { value: CallOutcome.CallbackRequested, label: 'Geri Arama Talep Edildi' },
  { value: CallOutcome.NotInterested, label: 'İlgi Yok' },
  { value: CallOutcome.InformationProvided, label: 'Bilgi Verildi' },
  { value: CallOutcome.AppointmentScheduled, label: 'Randevu Alındı' },
  { value: CallOutcome.SaleMade, label: 'Satış Yapıldı' },
  { value: CallOutcome.ComplaintReceived, label: 'Şikayet Alındı' },
  { value: CallOutcome.IssueResolved, label: 'Sorun Çözüldü' },
];

interface CallLogFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: CallLogDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function CallLogForm({ form, initialValues, onFinish, loading }: CallLogFormProps) {
  const [direction, setDirection] = useState<CallDirection>(CallDirection.Outbound);
  const { data: customersData } = useCustomers({ pageSize: 100 });
  const customers = customersData?.items || [];

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
      setDirection(initialValues.direction || CallDirection.Outbound);
    } else {
      form.setFieldsValue({
        direction: CallDirection.Outbound,
        callType: CallType.Standard,
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
            HEADER: Icon + Numbers + Direction
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Call Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <PhoneIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Caller Number - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="callerNumber"
                rules={[{ required: true, message: 'Arayan numara zorunludur' }]}
                className="mb-0"
              >
                <FormPhoneInput
                  defaultCountry="TR"
                  placeholder="Arayan Numara Girin..."
                />
              </Form.Item>
            </div>

            {/* Direction Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="direction" className="mb-0" initialValue={CallDirection.Outbound}>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setDirection(CallDirection.Inbound);
                      form.setFieldValue('direction', CallDirection.Inbound);
                    }}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      direction === CallDirection.Inbound
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Gelen
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDirection(CallDirection.Outbound);
                      form.setFieldValue('direction', CallDirection.Outbound);
                    }}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      direction === CallDirection.Outbound
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Giden
                  </button>
                </div>
              </Form.Item>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── ARAMA BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Arama Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Arama Numarası <span className="text-red-500">*</span></label>
                <Form.Item
                  name="callNumber"
                  rules={[{ required: true, message: 'Arama numarası zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="CALL-001"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Aranan Numara <span className="text-red-500">*</span></label>
                <Form.Item
                  name="calledNumber"
                  rules={[{ required: true, message: 'Aranan numara zorunludur' }]}
                  className="mb-0"
                >
                  <FormPhoneInput defaultCountry="TR" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Arama Tipi</label>
                <Form.Item name="callType" className="mb-0" initialValue={CallType.Standard}>
                  <Select
                    options={callTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Başlangıç Zamanı</label>
                <Form.Item name="startTime" className="mb-0">
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Arama başlangıç zamanı"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Müşteri</label>
                <Form.Item name="customerId" className="mb-0">
                  <Select
                    placeholder="Müşteri seçin (opsiyonel)"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={customers.map(c => ({ value: c.id, label: c.companyName }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── ARAMA DURUMU ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Arama Durumu
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                <Form.Item name="status" className="mb-0">
                  <Select
                    placeholder="Arama durumu seçin"
                    allowClear
                    options={callStatusOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sonuç</label>
                <Form.Item name="outcome" className="mb-0">
                  <Select
                    placeholder="Arama sonucu seçin"
                    allowClear
                    options={callOutcomeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bitiş Zamanı</label>
                <Form.Item name="endTime" className="mb-0">
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Arama bitiş zamanı"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── NOTLAR ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    placeholder="Arama hakkında notlar..."
                    rows={3}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
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
