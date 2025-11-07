'use client';

import React, { useState } from 'react';
import { Drawer, Form, Input, Select, DatePicker, Row, Col, Card, Space, Alert, Steps, Button, Spin, Tag, message } from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ShopOutlined,
  WhatsAppOutlined,
  MessageOutlined,
  VideoCameraOutlined,
  BookOutlined,
  ToolOutlined,
  GlobalOutlined,
  SyncOutlined,
  CoffeeOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  PhoneTwoTone,
  QuestionCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  StarOutlined,
  FireOutlined,
  CloseCircleOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import type { Activity } from '@/lib/api/services/crm.service';
import { useCustomers, useLeads, useDeals } from '@/hooks/useCRM';
import dayjs from 'dayjs';

const { TextArea } = Input;

// Activity Type enum values (1-30) with Turkish labels
const activityTypes = [
  { value: 1, label: 'Telefon Görüşmesi', icon: <PhoneOutlined />, color: 'blue' },
  { value: 2, label: 'E-posta', icon: <MailOutlined />, color: 'cyan' },
  { value: 3, label: 'Toplantı', icon: <TeamOutlined />, color: 'green' },
  { value: 4, label: 'Görev', icon: <FileTextOutlined />, color: 'orange' },
  { value: 5, label: 'Not', icon: <FileTextOutlined />, color: 'default' },
  { value: 6, label: 'Etkinlik', icon: <CalendarOutlined />, color: 'purple' },
  { value: 7, label: 'Demo', icon: <ToolOutlined />, color: 'geekblue' },
  { value: 8, label: 'Sunum', icon: <BookOutlined />, color: 'volcano' },
  { value: 9, label: 'Ziyaret', icon: <EnvironmentOutlined />, color: 'magenta' },
  { value: 10, label: 'Diğer', icon: <QuestionCircleOutlined />, color: 'default' },
  { value: 11, label: 'WhatsApp Mesajı', icon: <WhatsAppOutlined />, color: 'green' },
  { value: 12, label: 'SMS', icon: <MessageOutlined />, color: 'blue' },
  { value: 13, label: 'Video Görüşme', icon: <VideoCameraOutlined />, color: 'red' },
  { value: 14, label: 'Eğitim', icon: <BookOutlined />, color: 'gold' },
  { value: 15, label: 'Atölye Çalışması', icon: <ToolOutlined />, color: 'lime' },
  { value: 16, label: 'Webinar', icon: <GlobalOutlined />, color: 'cyan' },
  { value: 17, label: 'Takip', icon: <SyncOutlined />, color: 'orange' },
  { value: 18, label: 'İş Yemeği', icon: <CoffeeOutlined />, color: 'gold' },
  { value: 19, label: 'Akşam Yemeği', icon: <CoffeeOutlined />, color: 'volcano' },
  { value: 20, label: 'Konferans', icon: <TeamOutlined />, color: 'purple' },
  { value: 21, label: 'Saha Ziyareti', icon: <EnvironmentOutlined />, color: 'blue' },
  { value: 22, label: 'Ürün Demosu', icon: <ToolOutlined />, color: 'geekblue' },
  { value: 23, label: 'Müzakere', icon: <DollarOutlined />, color: 'gold' },
  { value: 24, label: 'Sözleşme İmzalama', icon: <FileTextOutlined />, color: 'green' },
  { value: 25, label: 'Destek Talebi', icon: <QuestionCircleOutlined />, color: 'orange' },
  { value: 26, label: 'Şikayet İşleme', icon: <WarningOutlined />, color: 'red' },
  { value: 27, label: 'Anket', icon: <FileTextOutlined />, color: 'cyan' },
  { value: 28, label: 'İnceleme/Gözden Geçirme', icon: <CheckCircleOutlined />, color: 'purple' },
  { value: 29, label: 'Planlama', icon: <CalendarOutlined />, color: 'blue' },
  { value: 30, label: 'Raporlama', icon: <FileTextOutlined />, color: 'magenta' },
];

// Activity Status enum values (1-12) with Turkish labels
const activityStatuses = [
  { value: 1, label: 'Başlamadı', icon: <ClockCircleOutlined />, color: 'default' },
  { value: 2, label: 'Devam Ediyor', icon: <SyncOutlined spin />, color: 'processing' },
  { value: 3, label: 'Tamamlandı', icon: <CheckCircleOutlined />, color: 'success' },
  { value: 4, label: 'İptal Edildi', icon: <CloseCircleOutlined />, color: 'error' },
  { value: 5, label: 'Ertelendi', icon: <ClockCircleOutlined />, color: 'warning' },
  { value: 6, label: 'Birini Bekliyor', icon: <UserOutlined />, color: 'default' },
  { value: 7, label: 'Planlandı', icon: <CalendarOutlined />, color: 'blue' },
  { value: 8, label: 'Yeniden Planlandı', icon: <CalendarOutlined />, color: 'orange' },
  { value: 9, label: 'Katılım Olmadı', icon: <WarningOutlined />, color: 'warning' },
  { value: 10, label: 'Kısmen Tamamlandı', icon: <CheckCircleOutlined />, color: 'processing' },
  { value: 11, label: 'Beklemede', icon: <ClockCircleOutlined />, color: 'default' },
  { value: 12, label: 'Takip Gerekiyor', icon: <SyncOutlined />, color: 'warning' },
];

// Activity Priority enum values (1-5) with Turkish labels
const activityPriorities = [
  { value: 1, label: 'Düşük', icon: <ArrowDownOutlined />, color: 'default' },
  { value: 2, label: 'Normal', icon: <MinusOutlined />, color: 'blue' },
  { value: 3, label: 'Yüksek', icon: <ArrowUpOutlined />, color: 'orange' },
  { value: 4, label: 'Acil', icon: <ExclamationCircleOutlined />, color: 'red' },
  { value: 5, label: 'Kritik', icon: <FireOutlined />, color: 'error' },
];

interface ActivityModalProps {
  open: boolean;
  activity: Activity | null;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialType?: number; // Quick action initial type
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
  const [currentStep, setCurrentStep] = useState(0);
  const isEditMode = !!activity;

  // Fetch data for dropdowns
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const { data: leadsData, isLoading: leadsLoading } = useLeads();
  const { data: dealsData, isLoading: dealsLoading } = useDeals();

  // Extract arrays from API response (handle both array and object responses)
  const customers = Array.isArray(customersData) ? customersData : customersData?.data || customersData?.items || [];
  const leads = Array.isArray(leadsData) ? leadsData : leadsData?.data || leadsData?.items || [];
  const deals = Array.isArray(dealsData) ? dealsData : dealsData?.data || dealsData?.items || [];

  React.useEffect(() => {
    if (open && activity) {
      form.setFieldsValue({
        ...activity,
        startTime: dayjs(activity.startTime),
        endTime: activity.endTime ? dayjs(activity.endTime) : null,
      });
      setCurrentStep(0);
    } else if (open) {
      form.resetFields();
      // Set default values
      form.setFieldsValue({
        type: initialType, // Quick action type
        status: 7, // Planlandı
        priority: 2, // Normal
      });
      setCurrentStep(0);
    }
  }, [open, activity, form, initialType]);

  const steps = [
    {
      title: 'Temel Bilgiler',
      icon: <FileTextOutlined />,
    },
    {
      title: 'Tarih ve Öncelik',
      icon: <CalendarOutlined />,
    },
    {
      title: 'İlgili Kayıtlar',
      icon: <UserOutlined />,
    },
    {
      title: 'Detaylar & Tamamla',
      icon: <CheckCircleOutlined />,
    },
  ];

  const handleNext = async () => {
    try {
      const fieldsToValidate = getStepFields(currentStep);

      // Validate current step fields first
      if (fieldsToValidate.length > 0) {
        await form.validateFields(fieldsToValidate);
      }

      // Additional validation for step 2 (İlgili Kayıtlar) - validate BEFORE moving to step 3
      if (currentStep === 2) {
        const values = form.getFieldsValue();
        if (!values.leadId && !values.customerId && !values.dealId) {
          throw new Error('En az bir ilişki (Müşteri, Lead veya Deal) seçmelisiniz');
        }
      }

      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Validation failed:', error);
      // Show error message to user
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Map frontend fields to backend CreateActivityCommand
      const mappedValues = {
        subject: values.title, // Map title to subject
        description: values.description || null,
        type: values.type, // Integer enum value
        status: values.status, // Integer enum value
        priority: values.priority || 2, // Integer enum value, default Normal
        dueDate: values.startTime.toISOString(), // Map startTime to dueDate
        duration: values.endTime ? Math.round((values.endTime.valueOf() - values.startTime.valueOf()) / 60000) : null, // Calculate duration in minutes
        location: values.location || null,
        leadId: values.leadId || null,
        customerId: values.customerId || null,
        contactId: values.contactId || null,
        opportunityId: values.opportunityId || null,
        dealId: values.dealId || null,
        notes: values.notes || null,
      };

      onSubmit(mappedValues);
      setCurrentStep(0);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    setCurrentStep(0);
    onCancel();
  };

  const getStepFields = (step: number): string[] => {
    switch (step) {
      case 0:
        return ['title', 'type', 'status'];
      case 1:
        return ['startTime', 'priority'];
      case 2:
        // Step 2 validation is handled in handleNext
        return [];
      default:
        return [];
    }
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold text-gray-800">
            {isEditMode ? 'Aktiviteyi Düzenle' : 'Yeni Aktivite Oluştur'}
          </div>
        </div>
      }
      open={open}
      onClose={handleCancel}
      width={800}
      destroyOnClose
      styles={{
        mask: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
        },
      }}
      footer={
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrev}
            disabled={currentStep === 0}
            icon={<ArrowLeftOutlined />}
            size="large"
          >
            Geri
          </Button>

          <div className="text-sm text-gray-500">
            Adım {currentStep + 1} / {steps.length}
          </div>

          {currentStep < steps.length - 1 ? (
            <Button type="primary" onClick={handleNext} icon={<ArrowRightOutlined />} iconPosition="end" size="large">
              İleri
            </Button>
          ) : (
            <Button type="primary" onClick={handleSubmit} loading={loading} icon={<CheckCircleOutlined />} size="large">
              {isEditMode ? 'Güncelle' : 'Oluştur'}
            </Button>
          )}
        </div>
      }
    >
      {/* Steps */}
      <div className="mb-6">
        <Steps current={currentStep} items={steps} className="px-4" />
      </div>

      <Form form={form} layout="vertical">
        {/* Step 0: Temel Bilgiler */}
        {currentStep === 0 && (
          <div className="min-h-[400px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileTextOutlined className="text-blue-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">Temel Bilgiler</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Form.Item
                label={<span className="text-gray-700 font-medium">Başlık</span>}
                name="title"
                rules={[
                  { required: true, message: 'Başlık gerekli' },
                  { max: 200, message: 'Başlık en fazla 200 karakter olabilir' }
                ]}
              >
                <Input
                  prefix={<FileTextOutlined className="text-gray-400" />}
                  placeholder="Örn: Müşteri Görüşmesi - Ürün Demo"
                  className="rounded-lg"
                  size="large"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Aktivite Tipi</span>}
                    name="type"
                    rules={[{ required: true, message: 'Aktivite tipi gerekli' }]}
                  >
                    <Select
                      placeholder="Aktivite tipi seçiniz"
                      className="rounded-lg"
                      size="large"
                      showSearch
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {activityTypes.map((type) => (
                        <Select.Option key={type.value} value={type.value} label={type.label}>
                          <Space>
                            {type.icon}
                            <span>{type.label}</span>
                          </Space>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Durum</span>}
                    name="status"
                    rules={[{ required: true, message: 'Durum gerekli' }]}
                  >
                    <Select
                      placeholder="Durum seçiniz"
                      className="rounded-lg"
                      size="large"
                      showSearch
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {activityStatuses.map((status) => (
                        <Select.Option key={status.value} value={status.value} label={status.label}>
                          <Space>
                            {status.icon}
                            <Tag color={status.color}>{status.label}</Tag>
                          </Space>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Alert
                message="30 Farklı Aktivite Tipi"
                description="Telefon görüşmesinden webinara, ziyaretten sözleşme imzalamaya kadar 30 farklı aktivite tipinden birini seçebilirsiniz."
                type="info"
                showIcon
                className="mt-2"
              />
            </Card>
          </div>
        )}

        {/* Step 1: Tarih ve Öncelik */}
        {currentStep === 1 && (
          <div className="min-h-[400px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <CalendarOutlined className="text-green-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">Tarih, Saat ve Öncelik</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Başlangıç Zamanı</span>}
                    name="startTime"
                    rules={[{ required: true, message: 'Başlangıç zamanı gerekli' }]}
                  >
                    <DatePicker
                      showTime
                      format="DD/MM/YYYY HH:mm"
                      style={{ width: '100%' }}
                      className="rounded-lg"
                      placeholder="Tarih ve saat seçiniz"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Bitiş Zamanı (Opsiyonel)</span>}
                    name="endTime"
                  >
                    <DatePicker
                      showTime
                      format="DD/MM/YYYY HH:mm"
                      style={{ width: '100%' }}
                      className="rounded-lg"
                      placeholder="Tarih ve saat seçiniz"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Öncelik Seviyesi</span>}
                    name="priority"
                    rules={[{ required: true, message: 'Öncelik seviyesi gerekli' }]}
                  >
                    <Select
                      placeholder="Öncelik seçiniz"
                      className="rounded-lg"
                      size="large"
                    >
                      {activityPriorities.map((priority) => (
                        <Select.Option key={priority.value} value={priority.value}>
                          <Space>
                            {priority.icon}
                            <Tag color={priority.color}>{priority.label}</Tag>
                          </Space>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Konum (Opsiyonel)</span>}
                    name="location"
                  >
                    <Input
                      prefix={<EnvironmentOutlined className="text-gray-400" />}
                      placeholder="Örn: Merkez Ofis, Toplantı Odası A"
                      className="rounded-lg"
                      size="large"
                      maxLength={500}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Alert
                message="Süre Otomatik Hesaplanır"
                description="Bitiş zamanı belirtirseniz, aktivite süresi otomatik olarak dakika cinsinden hesaplanır ve kaydedilir."
                type="info"
                showIcon
                className="mt-2"
              />
            </Card>
          </div>
        )}

        {/* Step 2: İlgili Kayıtlar */}
        {currentStep === 2 && (
          <div className="min-h-[400px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <UserOutlined className="text-purple-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">İlgili Kayıtlar</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Spin spinning={customersLoading || leadsLoading || dealsLoading} tip="Veriler yükleniyor...">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={<span className="text-gray-700 font-medium">Müşteri</span>}
                      name="customerId"
                    >
                      <Select
                        showSearch
                        placeholder="Müşteri seçiniz"
                        className="rounded-lg"
                        size="large"
                        allowClear
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={customers?.map((customer) => ({
                          value: customer.id,
                          label: customer.companyName,
                        })) || []}
                        suffixIcon={<ShopOutlined className="text-gray-400" />}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={<span className="text-gray-700 font-medium">Lead (Potansiyel Müşteri)</span>}
                      name="leadId"
                    >
                      <Select
                        showSearch
                        placeholder="Lead seçiniz"
                        className="rounded-lg"
                        size="large"
                        allowClear
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={leads?.map((lead) => ({
                          value: lead.id,
                          label: `${lead.firstName} ${lead.lastName} - ${lead.company || 'N/A'}`,
                        })) || []}
                        suffixIcon={<UserOutlined className="text-gray-400" />}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={<span className="text-gray-700 font-medium">Deal (Satış Fırsatı)</span>}
                      name="dealId"
                    >
                      <Select
                        showSearch
                        placeholder="Deal seçiniz"
                        className="rounded-lg"
                        size="large"
                        allowClear
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={deals?.map((deal) => ({
                          value: deal.id,
                          label: `${deal.title} - ₺${deal.value?.toLocaleString('tr-TR') || '0'}`,
                        })) || []}
                        suffixIcon={<TrophyOutlined className="text-gray-400" />}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={<span className="text-gray-700 font-medium">İletişim / Fırsat ID</span>}
                      name="contactId"
                      tooltip="Gelecekte eklenecek özellik"
                    >
                      <Input
                        placeholder="İletişim veya Fırsat ID"
                        className="rounded-lg"
                        prefix={<UserOutlined className="text-gray-400" />}
                        size="large"
                        disabled
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Alert
                  message="⚠️ En Az Bir İlişki Gerekli"
                  description="Bu aktiviteyi oluşturmak için en az bir kayıt (Müşteri, Lead veya Deal) ile ilişkilendirmeniz gerekmektedir."
                  type="warning"
                  showIcon
                />
              </Spin>
            </Card>
          </div>
        )}

        {/* Step 3: Detaylar & Tamamla */}
        {currentStep === 3 && (
          <div className="min-h-[400px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <CheckCircleOutlined className="text-orange-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">Detaylar ve Notlar</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Form.Item
                label={<span className="text-gray-700 font-medium">Açıklama</span>}
                name="description"
                rules={[
                  { max: 1000, message: 'Açıklama en fazla 1000 karakter olabilir' }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Aktivite hakkında detaylı açıklama..."
                  className="rounded-lg"
                  size="large"
                  showCount
                  maxLength={1000}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-gray-700 font-medium">Notlar</span>}
                name="notes"
                rules={[
                  { max: 2000, message: 'Notlar en fazla 2000 karakter olabilir' }
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="Aktivite ile ilgili özel notlar, hatırlatmalar veya önemli detaylar..."
                  className="rounded-lg"
                  size="large"
                  showCount
                  maxLength={2000}
                />
              </Form.Item>

              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-blue-600 text-xl mt-1" />
                  <div>
                    <div className="font-semibold text-blue-900 mb-1">✨ Tamamlamaya Hazır</div>
                    <div className="text-sm text-blue-700">
                      Aktivite bilgilerini gözden geçirin ve kaydetmek için "<strong>{isEditMode ? 'Güncelle' : 'Oluştur'}</strong>" butonuna tıklayın.
                      Oluşturulduktan sonra aktivite takvim ve listede görünür olacaktır.
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Form>
    </Drawer>
  );
}

