'use client';

import React from 'react';
import { Form, Input, Select, DatePicker, Row, Col, Spin } from 'antd';
import type { FormInstance } from 'antd';
import {
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  BookOpenIcon,
  WrenchIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  QuestionMarkCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  FireIcon,
  XCircleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import { useCustomers, useLeads, useDeals } from '@/lib/api/hooks/useCRM';

const { TextArea } = Input;

// Activity Type enum values (1-30) with Turkish labels
const activityTypes = [
  { value: 1, label: 'Telefon Görüşmesi', icon: <PhoneIcon className="w-4 h-4" /> },
  { value: 2, label: 'E-posta', icon: <EnvelopeIcon className="w-4 h-4" /> },
  { value: 3, label: 'Toplantı', icon: <UserGroupIcon className="w-4 h-4" /> },
  { value: 4, label: 'Görev', icon: <DocumentTextIcon className="w-4 h-4" /> },
  { value: 5, label: 'Not', icon: <DocumentTextIcon className="w-4 h-4" /> },
  { value: 6, label: 'Etkinlik', icon: <CalendarIcon className="w-4 h-4" /> },
  { value: 7, label: 'Demo', icon: <WrenchIcon className="w-4 h-4" /> },
  { value: 8, label: 'Sunum', icon: <BookOpenIcon className="w-4 h-4" /> },
  { value: 9, label: 'Ziyaret', icon: <MapPinIcon className="w-4 h-4" /> },
  { value: 10, label: 'Diğer', icon: <QuestionMarkCircleIcon className="w-4 h-4" /> },
  { value: 11, label: 'WhatsApp Mesajı', icon: <ChatBubbleLeftRightIcon className="w-4 h-4" /> },
  { value: 12, label: 'SMS', icon: <ChatBubbleLeftRightIcon className="w-4 h-4" /> },
  { value: 13, label: 'Video Görüşme', icon: <VideoCameraIcon className="w-4 h-4" /> },
  { value: 14, label: 'Eğitim', icon: <BookOpenIcon className="w-4 h-4" /> },
  { value: 15, label: 'Atölye Çalışması', icon: <WrenchIcon className="w-4 h-4" /> },
  { value: 16, label: 'Webinar', icon: <GlobeAltIcon className="w-4 h-4" /> },
  { value: 17, label: 'Takip', icon: <ArrowPathIcon className="w-4 h-4" /> },
  { value: 18, label: 'İş Yemeği', icon: <BuildingStorefrontIcon className="w-4 h-4" /> },
  { value: 19, label: 'Akşam Yemeği', icon: <BuildingStorefrontIcon className="w-4 h-4" /> },
  { value: 20, label: 'Konferans', icon: <UserGroupIcon className="w-4 h-4" /> },
  { value: 21, label: 'Saha Ziyareti', icon: <MapPinIcon className="w-4 h-4" /> },
  { value: 22, label: 'Ürün Demosu', icon: <WrenchIcon className="w-4 h-4" /> },
  { value: 23, label: 'Müzakere', icon: <CurrencyDollarIcon className="w-4 h-4" /> },
  { value: 24, label: 'Sözleşme İmzalama', icon: <DocumentTextIcon className="w-4 h-4" /> },
  { value: 25, label: 'Destek Talebi', icon: <QuestionMarkCircleIcon className="w-4 h-4" /> },
  { value: 26, label: 'Şikayet İşleme', icon: <ExclamationTriangleIcon className="w-4 h-4" /> },
  { value: 27, label: 'Anket', icon: <DocumentTextIcon className="w-4 h-4" /> },
  { value: 28, label: 'İnceleme/Gözden Geçirme', icon: <CheckCircleIcon className="w-4 h-4" /> },
  { value: 29, label: 'Planlama', icon: <CalendarIcon className="w-4 h-4" /> },
  { value: 30, label: 'Raporlama', icon: <DocumentTextIcon className="w-4 h-4" /> },
];

// Activity Status enum values (1-12) with Turkish labels
const activityStatuses = [
  { value: 1, label: 'Başlamadı', icon: <ClockIcon className="w-4 h-4" /> },
  { value: 2, label: 'Devam Ediyor', icon: <ArrowPathIcon className="w-4 h-4" /> },
  { value: 3, label: 'Tamamlandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
  { value: 4, label: 'İptal Edildi', icon: <XCircleIcon className="w-4 h-4" /> },
  { value: 5, label: 'Ertelendi', icon: <ClockIcon className="w-4 h-4" /> },
  { value: 6, label: 'Birini Bekliyor', icon: <UserIcon className="w-4 h-4" /> },
  { value: 7, label: 'Planlandı', icon: <CalendarIcon className="w-4 h-4" /> },
  { value: 8, label: 'Yeniden Planlandı', icon: <CalendarIcon className="w-4 h-4" /> },
  { value: 9, label: 'Katılım Olmadı', icon: <ExclamationTriangleIcon className="w-4 h-4" /> },
  { value: 10, label: 'Kısmen Tamamlandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
  { value: 11, label: 'Beklemede', icon: <ClockIcon className="w-4 h-4" /> },
  { value: 12, label: 'Takip Gerekiyor', icon: <ArrowPathIcon className="w-4 h-4" /> },
];

// Activity Priority enum values (1-5) with Turkish labels
const activityPriorities = [
  { value: 1, label: 'Düşük', icon: <ArrowDownIcon className="w-4 h-4" /> },
  { value: 2, label: 'Normal', icon: <MinusIcon className="w-4 h-4" /> },
  { value: 3, label: 'Yüksek', icon: <ArrowUpIcon className="w-4 h-4" /> },
  { value: 4, label: 'Acil', icon: <ExclamationCircleIcon className="w-4 h-4" /> },
  { value: 5, label: 'Kritik', icon: <FireIcon className="w-4 h-4" /> },
];

interface ActivityFormProps {
  form: FormInstance;
  initialValues?: any;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export function ActivityForm({
  form,
  initialValues,
  onFinish,
  loading = false,
}: ActivityFormProps) {
  // Fetch data for dropdowns
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const { data: leadsData, isLoading: leadsLoading } = useLeads();
  const { data: dealsData, isLoading: dealsLoading } = useDeals();

  // Extract arrays from API response
  const customers = Array.isArray(customersData) ? customersData : customersData?.items || [];
  const leads = Array.isArray(leadsData) ? leadsData : leadsData?.items || [];
  const deals = Array.isArray(dealsData) ? dealsData : dealsData?.items || [];

  const isDataLoading = customersLoading || leadsLoading || dealsLoading;

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [form, initialValues]);

  return (
    <Spin spinning={isDataLoading} tip="Veriler yükleniyor...">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={loading}
      >
        {/* Temel Bilgiler */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
            Temel Bilgiler
          </h3>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Başlık</label>
              <Form.Item
                name="title"
                className="mb-0"
                rules={[
                  { required: true, message: 'Başlık gerekli' },
                  { max: 200, message: 'Başlık en fazla 200 karakter olabilir' },
                ]}
              >
                <Input
                  placeholder="Örn: Müşteri Görüşmesi - Ürün Demo"
                  className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                />
              </Form.Item>
            </div>

            <div className="col-span-4">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Aktivite Tipi</label>
              <Form.Item
                name="type"
                className="mb-0"
                rules={[{ required: true, message: 'Tip gerekli' }]}
              >
                <Select
                  placeholder="Tip seçin"
                  showSearch
                  optionFilterProp="label"
                  className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {activityTypes.map((type) => (
                    <Select.Option key={type.value} value={type.value} label={type.label}>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{type.icon}</span>
                        <span>{type.label}</span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div className="col-span-4">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
              <Form.Item
                name="status"
                className="mb-0"
                rules={[{ required: true, message: 'Durum gerekli' }]}
              >
                <Select
                  placeholder="Durum seçin"
                  showSearch
                  optionFilterProp="label"
                  className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {activityStatuses.map((status) => (
                    <Select.Option key={status.value} value={status.value} label={status.label}>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{status.icon}</span>
                        <span>{status.label}</span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div className="col-span-4">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Öncelik</label>
              <Form.Item
                name="priority"
                className="mb-0"
                rules={[{ required: true, message: 'Öncelik gerekli' }]}
              >
                <Select
                  placeholder="Öncelik seçin"
                  className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                >
                  {activityPriorities.map((priority) => (
                    <Select.Option key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{priority.icon}</span>
                        <span>{priority.label}</span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Tarih ve Konum */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
            Tarih ve Konum
          </h3>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Başlangıç</label>
              <Form.Item
                name="startTime"
                className="mb-0"
                rules={[{ required: true, message: 'Başlangıç zamanı gerekli' }]}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                  placeholder="Tarih ve saat"
                  className="!bg-slate-50 !border-slate-300"
                />
              </Form.Item>
            </div>

            <div className="col-span-4">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Bitiş (Opsiyonel)</label>
              <Form.Item name="endTime" className="mb-0">
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                  placeholder="Tarih ve saat"
                  className="!bg-slate-50 !border-slate-300"
                />
              </Form.Item>
            </div>

            <div className="col-span-4">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Konum (Opsiyonel)</label>
              <Form.Item name="location" className="mb-0">
                <Input
                  placeholder="Örn: Merkez Ofis"
                  maxLength={500}
                  className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* İlgili Kayıtlar */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
            İlgili Kayıtlar
            <span className="ml-2 text-xs font-normal text-slate-400">(En az bir kayıt seçilmeli)</span>
          </h3>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Müşteri</label>
              <Form.Item name="customerId" className="mb-0">
                <Select
                  showSearch
                  placeholder="Müşteri seçin"
                  allowClear
                  optionFilterProp="label"
                  className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={customers?.map((customer) => ({
                    value: customer.id,
                    label: customer.companyName,
                  })) || []}
                />
              </Form.Item>
            </div>

            <div className="col-span-4">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Lead</label>
              <Form.Item name="leadId" className="mb-0">
                <Select
                  showSearch
                  placeholder="Lead seçin"
                  allowClear
                  optionFilterProp="label"
                  className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={leads?.map((lead) => ({
                    value: lead.id,
                    label: `${lead.firstName} ${lead.lastName}`,
                  })) || []}
                />
              </Form.Item>
            </div>

            <div className="col-span-4">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Deal</label>
              <Form.Item name="dealId" className="mb-0">
                <Select
                  showSearch
                  placeholder="Deal seçin"
                  allowClear
                  optionFilterProp="label"
                  className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={deals?.map((deal) => ({
                    value: deal.id,
                    label: `${deal.title} - ₺${deal.value?.toLocaleString('tr-TR') || '0'}`,
                  })) || []}
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Detaylar */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
            Detaylar
          </h3>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Açıklama (Opsiyonel)</label>
              <Form.Item
                name="description"
                className="mb-0"
                rules={[{ max: 1000, message: 'Açıklama en fazla 1000 karakter olabilir' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="Aktivite hakkında detaylı açıklama..."
                  showCount
                  maxLength={1000}
                  className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                />
              </Form.Item>
            </div>

            <div className="col-span-12">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Notlar (Opsiyonel)</label>
              <Form.Item
                name="notes"
                className="mb-0"
                rules={[{ max: 2000, message: 'Notlar en fazla 2000 karakter olabilir' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="Özel notlar, hatırlatmalar veya önemli detaylar..."
                  showCount
                  maxLength={2000}
                  className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Hidden submit button */}
        <Form.Item hidden>
          <button type="submit" />
        </Form.Item>
      </Form>
    </Spin>
  );
}
