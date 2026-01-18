'use client';

import React from 'react';
import { Modal, Form, Input, Select, DatePicker, Row, Col, Spin } from 'antd';
import { showError } from '@/lib/utils/notifications';
import {
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  TrophyIcon,
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
import type { Activity } from '@/lib/api/services/crm.service';
import { useCustomers, useLeads, useDeals } from '@/lib/api/hooks/useCRM';
import dayjs from 'dayjs';

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

interface ActivityModalProps {
  open: boolean;
  activity: Activity | null;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialType?: number;
}

export function ActivityModal({
  open,
  activity,
  loading,
  onCancel,
  onSubmit,
  initialType,
}: ActivityModalProps) {
  const [form] = Form.useForm();
  const isEditMode = !!activity;

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
    if (open && activity) {
      form.setFieldsValue({
        ...activity,
        startTime: dayjs(activity.startTime),
        endTime: activity.endTime ? dayjs(activity.endTime) : null,
      });
    } else if (open) {
      form.resetFields();
      form.setFieldsValue({
        type: initialType,
        status: 7, // Planlandı
        priority: 2, // Normal
      });
    }
  }, [open, activity, form, initialType]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Validate that at least one relationship exists
      if (!values.leadId && !values.customerId && !values.dealId) {
        showError('En az bir ilişki (Müşteri, Lead veya Deal) seçmelisiniz');
        return;
      }

      // Validate startTime
      if (!values.startTime) {
        showError('Başlangıç zamanı gerekli');
        return;
      }

      // Map frontend fields to backend CreateActivityCommand
      const mappedValues = {
        subject: values.title,
        description: values.description || null,
        type: values.type,
        status: values.status,
        priority: values.priority || 2,
        dueDate: values.startTime.toISOString(),
        duration: values.endTime
          ? Math.round((values.endTime.valueOf() - values.startTime.valueOf()) / 60000)
          : null,
        location: values.location || null,
        leadId: values.leadId ? String(values.leadId) : null,
        customerId: values.customerId ? String(values.customerId) : null,
        contactId: values.contactId ? String(values.contactId) : null,
        opportunityId: values.opportunityId ? String(values.opportunityId) : null,
        dealId: values.dealId ? String(values.dealId) : null,
        notes: values.notes || null,
      };

      onSubmit(mappedValues);
    } catch (error) {
      console.error('Validation failed:', error);
      showError('Lütfen tüm gerekli alanları doldurun');
    }
  };

  return (
    <Modal
      title={
        <span className="text-lg font-semibold text-slate-900">
          {isEditMode ? 'Aktiviteyi Düzenle' : 'Yeni Aktivite'}
        </span>
      }
      open={open}
      onCancel={onCancel}
      width={720}
      destroyOnClose
      centered
      styles={{
        mask: {
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
        },
        content: {
          borderRadius: '12px',
          overflow: 'hidden',
        },
        header: {
          borderBottom: '1px solid #e2e8f0',
          padding: '20px 24px',
          marginBottom: 0,
        },
        body: {
          padding: '24px',
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
        },
        footer: {
          borderTop: '1px solid #e2e8f0',
          padding: '16px 24px',
        },
      }}
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : isEditMode ? 'Güncelle' : 'Oluştur'}
          </button>
        </div>
      }
    >
      <Spin spinning={isDataLoading} tip="Veriler yükleniyor...">
        <Form form={form} layout="vertical" className="space-y-6">
          {/* Temel Bilgiler */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Temel Bilgiler
            </h3>
            <div className="space-y-4">
              <Form.Item
                name="title"
                label={<span className="text-sm text-slate-700">Başlık</span>}
                rules={[
                  { required: true, message: 'Başlık gerekli' },
                  { max: 200, message: 'Başlık en fazla 200 karakter olabilir' },
                ]}
              >
                <Input
                  placeholder="Örn: Müşteri Görüşmesi - Ürün Demo"
                  className="!rounded-lg !border-slate-300 !bg-slate-50"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="type"
                    label={<span className="text-sm text-slate-700">Aktivite Tipi</span>}
                    rules={[{ required: true, message: 'Tip gerekli' }]}
                  >
                    <Select
                      placeholder="Tip seçin"
                      showSearch
                      optionFilterProp="label"
                      className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!bg-slate-50"
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
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="status"
                    label={<span className="text-sm text-slate-700">Durum</span>}
                    rules={[{ required: true, message: 'Durum gerekli' }]}
                  >
                    <Select
                      placeholder="Durum seçin"
                      showSearch
                      optionFilterProp="label"
                      className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!bg-slate-50"
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
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="priority"
                    label={<span className="text-sm text-slate-700">Öncelik</span>}
                    rules={[{ required: true, message: 'Öncelik gerekli' }]}
                  >
                    <Select
                      placeholder="Öncelik seçin"
                      className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!bg-slate-50"
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
                </Col>
              </Row>
            </div>
          </div>

          {/* Tarih ve Konum */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Tarih ve Konum
            </h3>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="startTime"
                  label={<span className="text-sm text-slate-700">Başlangıç</span>}
                  rules={[{ required: true, message: 'Başlangıç zamanı gerekli' }]}
                >
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    style={{ width: '100%' }}
                    placeholder="Tarih ve saat"
                    className="!rounded-lg !border-slate-300 !bg-slate-50"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="endTime"
                  label={<span className="text-sm text-slate-700">Bitiş (Opsiyonel)</span>}
                >
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    style={{ width: '100%' }}
                    placeholder="Tarih ve saat"
                    className="!rounded-lg !border-slate-300 !bg-slate-50"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="location"
                  label={<span className="text-sm text-slate-700">Konum (Opsiyonel)</span>}
                >
                  <Input
                    placeholder="Örn: Merkez Ofis"
                    maxLength={500}
                    className="!rounded-lg !border-slate-300 !bg-slate-50"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* İlgili Kayıtlar */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              İlgili Kayıtlar
              <span className="ml-2 text-xs font-normal text-slate-400">(En az bir kayıt seçilmeli)</span>
            </h3>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="customerId"
                  label={<span className="text-sm text-slate-700">Müşteri</span>}
                >
                  <Select
                    showSearch
                    placeholder="Müşteri seçin"
                    allowClear
                    optionFilterProp="label"
                    className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!bg-slate-50"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={customers?.map((customer) => ({
                      value: customer.id,
                      label: customer.companyName,
                    })) || []}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="leadId"
                  label={<span className="text-sm text-slate-700">Lead</span>}
                >
                  <Select
                    showSearch
                    placeholder="Lead seçin"
                    allowClear
                    optionFilterProp="label"
                    className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!bg-slate-50"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={leads?.map((lead) => ({
                      value: lead.id,
                      label: `${lead.firstName} ${lead.lastName}`,
                    })) || []}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="dealId"
                  label={<span className="text-sm text-slate-700">Deal</span>}
                >
                  <Select
                    showSearch
                    placeholder="Deal seçin"
                    allowClear
                    optionFilterProp="label"
                    className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!bg-slate-50"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={deals?.map((deal) => ({
                      value: deal.id,
                      label: `${deal.title} - ₺${deal.value?.toLocaleString('tr-TR') || '0'}`,
                    })) || []}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Detaylar */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Detaylar
            </h3>
            <div className="space-y-4">
              <Form.Item
                name="description"
                label={<span className="text-sm text-slate-700">Açıklama (Opsiyonel)</span>}
                rules={[{ max: 1000, message: 'Açıklama en fazla 1000 karakter olabilir' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="Aktivite hakkında detaylı açıklama..."
                  showCount
                  maxLength={1000}
                  className="!rounded-lg !border-slate-300 !bg-slate-50"
                />
              </Form.Item>

              <Form.Item
                name="notes"
                label={<span className="text-sm text-slate-700">Notlar (Opsiyonel)</span>}
                rules={[{ max: 2000, message: 'Notlar en fazla 2000 karakter olabilir' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="Özel notlar, hatırlatmalar veya önemli detaylar..."
                  showCount
                  maxLength={2000}
                  className="!rounded-lg !border-slate-300 !bg-slate-50"
                />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
}
