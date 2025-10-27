'use client';

import React, { useState } from 'react';
import { Drawer, Form, Input, Select, DatePicker, Row, Col, Card, Space, Alert, Steps, Button } from 'antd';
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
} from '@ant-design/icons';
import type { Activity } from '@/lib/api/services/crm.service';
import dayjs from 'dayjs';

const { TextArea } = Input;

// Activity type configuration
const activityConfig: Record<
  Activity['type'],
  { icon: React.ReactNode; color: string; label: string }
> = {
  Call: { icon: <PhoneOutlined />, color: 'blue', label: 'Arama' },
  Email: { icon: <MailOutlined />, color: 'cyan', label: 'E-posta' },
  Meeting: { icon: <TeamOutlined />, color: 'green', label: 'Toplantı' },
  Task: { icon: <FileTextOutlined />, color: 'orange', label: 'Görev' },
  Note: { icon: <FileTextOutlined />, color: 'default', label: 'Not' },
};

interface ActivityModalProps {
  open: boolean;
  activity: Activity | null;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

export function ActivityModal({
  open,
  activity,
  loading,
  onCancel,
  onSubmit,
}: ActivityModalProps) {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const isEditMode = !!activity;

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
      setCurrentStep(0);
    }
  }, [open, activity, form]);

  const steps = [
    {
      title: 'Temel Bilgiler',
      icon: <FileTextOutlined />,
    },
    {
      title: 'Tarih ve Saat',
      icon: <CalendarOutlined />,
    },
    {
      title: 'İlgili Kayıtlar',
      icon: <UserOutlined />,
    },
    {
      title: 'Açıklama & Tamamla',
      icon: <CheckCircleOutlined />,
    },
  ];

  const handleNext = async () => {
    try {
      const fieldsToValidate = getStepFields(currentStep);
      await form.validateFields(fieldsToValidate);

      // Additional validation for step 2 (related entities)
      if (currentStep === 2) {
        await validateStep2();
      }

      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Validation failed:', error);
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
        type: values.type,
        status: values.status,
        priority: values.priority || 'Medium', // Default priority
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
        return ['startTime'];
      case 2:
        // At least one entity ID must be provided
        return [];
      default:
        return [];
    }
  };

  const validateStep2 = () => {
    const values = form.getFieldsValue();
    if (!values.leadId && !values.customerId && !values.contactId && !values.opportunityId && !values.dealId) {
      return Promise.reject(new Error('En az bir ilişki (Müşteri, Lead, İletişim, Fırsat veya Deal) seçmelisiniz'));
    }
    return Promise.resolve();
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold text-gray-800">
            {isEditMode ? 'Aktiviteyi Düzenle' : 'Yeni Aktivite'}
          </div>
        </div>
      }
      open={open}
      onClose={handleCancel}
      width={720}
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
          <div className="min-h-[300px]">
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
                rules={[{ required: true, message: 'Başlık gerekli' }]}
              >
                <Input
                  prefix={<FileTextOutlined className="text-gray-400" />}
                  placeholder="Örn: Müşteri Görüşmesi"
                  className="rounded-lg"
                  size="large"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Tip</span>}
                    name="type"
                    rules={[{ required: true, message: 'Tip gerekli' }]}
                  >
                    <Select placeholder="Aktivite tipi seçiniz" className="rounded-lg" size="large">
                      {Object.entries(activityConfig).map(([key, config]) => (
                        <Select.Option key={key} value={key}>
                          <Space>
                            {config.icon}
                            {config.label}
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
                    initialValue="Scheduled"
                  >
                    <Select placeholder="Durum seçiniz" className="rounded-lg" size="large">
                      <Select.Option value="Scheduled">
                        <Space>
                          <ClockCircleOutlined className="text-blue-500" />
                          <span>Zamanlanmış</span>
                        </Space>
                      </Select.Option>
                      <Select.Option value="Completed">
                        <Space>
                          <CheckCircleOutlined className="text-green-500" />
                          <span>Tamamlandı</span>
                        </Space>
                      </Select.Option>
                      <Select.Option value="Cancelled">
                        <Space>
                          <CheckCircleOutlined className="text-red-500" />
                          <span>İptal Edildi</span>
                        </Space>
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </div>
        )}

        {/* Step 1: Tarih ve Saat */}
        {currentStep === 1 && (
          <div className="min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <CalendarOutlined className="text-green-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">Tarih ve Saat</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Başlangıç</span>}
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
                    label={<span className="text-gray-700 font-medium">Bitiş</span>}
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

              <Alert
                message="Zaman Planlaması"
                description="Bitiş zamanı opsiyoneldir. Belirtmezseniz, aktivite tüm gün için zamanlanmış sayılır."
                type="info"
                showIcon
                className="mt-2"
              />
            </Card>
          </div>
        )}

        {/* Step 2: İlgili Kayıtlar */}
        {currentStep === 2 && (
          <div className="min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <UserOutlined className="text-purple-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">İlgili Kayıtlar</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Müşteri ID</span>}
                    name="customerId"
                  >
                    <Input
                      placeholder="Müşteri GUID"
                      className="rounded-lg"
                      prefix={<UserOutlined className="text-gray-400" />}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Lead ID</span>}
                    name="leadId"
                  >
                    <Input
                      placeholder="Lead GUID"
                      className="rounded-lg"
                      prefix={<UserOutlined className="text-gray-400" />}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">İletişim ID</span>}
                    name="contactId"
                  >
                    <Input
                      placeholder="İletişim GUID"
                      className="rounded-lg"
                      prefix={<UserOutlined className="text-gray-400" />}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Fırsat ID</span>}
                    name="opportunityId"
                  >
                    <Input
                      placeholder="Fırsat GUID"
                      className="rounded-lg"
                      prefix={<TrophyOutlined className="text-gray-400" />}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Deal ID</span>}
                    name="dealId"
                  >
                    <Input
                      placeholder="Deal GUID"
                      className="rounded-lg"
                      prefix={<TrophyOutlined className="text-gray-400" />}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Alert
                message="⚠️ En Az Bir İlişki Gerekli"
                description="Bu aktiviteyi oluşturmak için en az bir kayıt (Müşteri, Lead, İletişim, Fırsat veya Deal) ile ilişkilendirmeniz gerekmektedir."
                type="warning"
                showIcon
              />
            </Card>
          </div>
        )}

        {/* Step 3: Açıklama & Tamamla */}
        {currentStep === 3 && (
          <div className="min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <CheckCircleOutlined className="text-orange-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">Açıklama</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Form.Item
                label={<span className="text-gray-700 font-medium">Detaylar</span>}
                name="description"
              >
                <TextArea
                  rows={6}
                  placeholder="Aktivite hakkında notlar..."
                  className="rounded-lg"
                  size="large"
                />
              </Form.Item>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-blue-600 text-xl mt-1" />
                  <div>
                    <div className="font-semibold text-blue-900 mb-1">Tamamlamaya Hazır</div>
                    <div className="text-sm text-blue-700">
                      Aktivite bilgilerini gözden geçirin ve kaydetmek için "{isEditMode ? 'Güncelle' : 'Oluştur'}" butonuna tıklayın.
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
