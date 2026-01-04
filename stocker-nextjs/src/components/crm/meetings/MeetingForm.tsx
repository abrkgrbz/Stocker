'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker } from 'antd';
import { CalendarIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import type { MeetingDto } from '@/lib/api/services/crm.types';
import { MeetingType, MeetingPriority, MeetingLocationType, MeetingStatus } from '@/lib/api/services/crm.types';
import { useCustomers } from '@/lib/api/hooks/useCRM';

const { TextArea } = Input;

// Meeting type options
const meetingTypeOptions = [
  { value: MeetingType.General, label: 'Genel' },
  { value: MeetingType.Sales, label: 'Satış' },
  { value: MeetingType.Demo, label: 'Demo' },
  { value: MeetingType.Presentation, label: 'Sunum' },
  { value: MeetingType.Negotiation, label: 'Müzakere' },
  { value: MeetingType.Contract, label: 'Sözleşme' },
  { value: MeetingType.Kickoff, label: 'Başlangıç' },
  { value: MeetingType.Review, label: 'İnceleme' },
  { value: MeetingType.Planning, label: 'Planlama' },
  { value: MeetingType.Training, label: 'Eğitim' },
  { value: MeetingType.Workshop, label: 'Workshop' },
  { value: MeetingType.Webinar, label: 'Webinar' },
  { value: MeetingType.Conference, label: 'Konferans' },
  { value: MeetingType.OneOnOne, label: 'Birebir' },
  { value: MeetingType.TeamMeeting, label: 'Ekip Toplantısı' },
  { value: MeetingType.BusinessLunch, label: 'İş Yemeği' },
  { value: MeetingType.SiteVisit, label: 'Saha Ziyareti' },
];

// Priority options
const priorityOptions = [
  { value: MeetingPriority.Low, label: 'Düşük' },
  { value: MeetingPriority.Normal, label: 'Normal' },
  { value: MeetingPriority.High, label: 'Yüksek' },
  { value: MeetingPriority.Urgent, label: 'Acil' },
];

// Location type options
const locationTypeOptions = [
  { value: MeetingLocationType.InPerson, label: 'Yüz Yüze' },
  { value: MeetingLocationType.Online, label: 'Online' },
  { value: MeetingLocationType.Hybrid, label: 'Hibrit' },
  { value: MeetingLocationType.Phone, label: 'Telefon' },
];

// Meeting status options - Backend MeetingStatus enum ile senkronize
const meetingStatusOptions = [
  { value: MeetingStatus.Scheduled, label: 'Planlandı' },
  { value: MeetingStatus.Confirmed, label: 'Onaylandı' },
  { value: MeetingStatus.InProgress, label: 'Devam Ediyor' },
  { value: MeetingStatus.Completed, label: 'Tamamlandı' },
  { value: MeetingStatus.Cancelled, label: 'İptal Edildi' },
];

// Online platform options
const onlinePlatformOptions = [
  { value: 'Zoom', label: 'Zoom' },
  { value: 'MicrosoftTeams', label: 'Microsoft Teams' },
  { value: 'GoogleMeet', label: 'Google Meet' },
  { value: 'Webex', label: 'Webex' },
  { value: 'Skype', label: 'Skype' },
  { value: 'Other', label: 'Diğer' },
];

interface MeetingFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: Partial<MeetingDto> & Record<string, any>;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function MeetingForm({ form, initialValues, onFinish, loading }: MeetingFormProps) {
  const [priority, setPriority] = useState<MeetingPriority>(MeetingPriority.Normal);
  const [locationType, setLocationType] = useState<MeetingLocationType>(MeetingLocationType.InPerson);
  const { data: customersData } = useCustomers({ pageSize: 100 });
  const customers = customersData?.items || [];

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
      setPriority(initialValues.priority || MeetingPriority.Normal);
      setLocationType(initialValues.locationType || MeetingLocationType.InPerson);
    } else {
      form.setFieldsValue({
        priority: MeetingPriority.Normal,
        meetingType: MeetingType.General,
        locationType: MeetingLocationType.InPerson,
      });
    }
  }, [form, initialValues]);

  const showOnlineFields = locationType === MeetingLocationType.Online || locationType === MeetingLocationType.Hybrid;
  const showPhysicalFields = locationType === MeetingLocationType.InPerson || locationType === MeetingLocationType.Hybrid;

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
            HEADER: Icon + Title + Priority
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Meeting Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Meeting Title - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="title"
                rules={[
                  { required: true, message: 'Toplantı başlığı zorunludur' },
                  { max: 200, message: 'En fazla 200 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Toplantı Başlığı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Toplantı hakkında kısa not..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Priority Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="priority" className="mb-0" initialValue={MeetingPriority.Normal}>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setPriority(MeetingPriority.Low);
                      form.setFieldValue('priority', MeetingPriority.Low);
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      priority === MeetingPriority.Low
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Düşük
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPriority(MeetingPriority.Normal);
                      form.setFieldValue('priority', MeetingPriority.Normal);
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      priority === MeetingPriority.Normal
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPriority(MeetingPriority.High);
                      form.setFieldValue('priority', MeetingPriority.High);
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      priority === MeetingPriority.High
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Yüksek
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

          {/* ─────────────── TOPLANTI BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Toplantı Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Toplantı Tipi</label>
                <Form.Item name="meetingType" className="mb-0" initialValue={MeetingType.General}>
                  <Select
                    options={meetingTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Konum Tipi</label>
                <Form.Item name="locationType" className="mb-0" initialValue={MeetingLocationType.InPerson}>
                  <Select
                    options={locationTypeOptions}
                    onChange={(val) => setLocationType(val as MeetingLocationType)}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                <Form.Item name="status" className="mb-0" initialValue={MeetingStatus.Scheduled}>
                  <Select
                    options={meetingStatusOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
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

          {/* ─────────────── TARİH VE SAAT ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tarih ve Saat
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Başlangıç <span className="text-red-500">*</span></label>
                <Form.Item
                  name="startTime"
                  rules={[{ required: true, message: 'Başlangıç tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Tarih ve saat seçin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bitiş <span className="text-red-500">*</span></label>
                <Form.Item
                  name="endTime"
                  rules={[{ required: true, message: 'Bitiş tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Tarih ve saat seçin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── KONUM BİLGİLERİ ─────────────── */}
          {showPhysicalFields && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Konum Bilgileri
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Adres</label>
                  <Form.Item name="location" className="mb-0">
                    <Input
                      placeholder="Toplantı adresi"
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                    />
                  </Form.Item>
                </div>
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Toplantı Odası</label>
                  <Form.Item name="meetingRoom" className="mb-0">
                    <Input
                      placeholder="Oda adı veya numarası"
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────── ONLİNE TOPLANTI ─────────────── */}
          {showOnlineFields && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Online Toplantı Bilgileri
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Platform</label>
                  <Form.Item name="onlineMeetingPlatform" className="mb-0">
                    <Select
                      placeholder="Platform seçin"
                      options={onlinePlatformOptions}
                      allowClear
                      className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                    />
                  </Form.Item>
                </div>
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Toplantı Linki</label>
                  <Form.Item name="onlineMeetingLink" className="mb-0">
                    <Input
                      placeholder="https://..."
                      prefix={<VideoCameraIcon className="w-4 h-4 text-slate-400" />}
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────── GÜNDEM ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Gündem
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item name="agenda" className="mb-0">
                  <TextArea
                    placeholder="Toplantı gündemi..."
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
