'use client';

import React, { useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Row, Col, Card, Steps, Button, Space } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  IdcardOutlined,
  StarOutlined,
  FileTextOutlined,
  GlobalOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import type { Lead } from '@/lib/api/services/crm.service';

const { TextArea } = Input;

interface LeadModalProps {
  open: boolean;
  lead: Lead | null;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

export function LeadModal({ open, lead, loading, onCancel, onSubmit }: LeadModalProps) {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const isEditMode = !!lead;

  React.useEffect(() => {
    if (open && lead) {
      form.setFieldsValue(lead);
      setCurrentStep(0);
    } else if (open) {
      form.resetFields();
      setCurrentStep(0);
    }
  }, [open, lead, form]);

  const steps = [
    {
      title: 'Kişisel Bilgiler',
      icon: <UserOutlined />,
    },
    {
      title: 'İletişim',
      icon: <MailOutlined />,
    },
    {
      title: 'Firma & Lead Bilgisi',
      icon: <BankOutlined />,
    },
    {
      title: 'Notlar & Tamamla',
      icon: <FileTextOutlined />,
    },
  ];

  const handleNext = async () => {
    try {
      // Validate current step fields
      const fieldsToValidate = getStepFields(currentStep);
      await form.validateFields(fieldsToValidate);
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
      onSubmit(values);
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
        return ['firstName', 'lastName'];
      case 1:
        return ['email'];
      case 2:
        return ['source', 'status'];
      default:
        return [];
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 pb-4">
          <div className="text-lg font-semibold text-gray-800">
            {isEditMode ? 'Potansiyel Müşteri Düzenle' : 'Yeni Potansiyel Müşteri'}
          </div>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      width={800}
      destroyOnClose
      footer={null}
      styles={{ body: { paddingTop: 24 } }}
    >
      {/* Steps */}
      <div className="mb-6">
        <Steps
          current={currentStep}
          items={steps}
          className="px-4"
        />
      </div>

      <Form form={form} layout="vertical">
        {/* Step 0: Kişisel Bilgiler */}
        {currentStep === 0 && (
          <div className="min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <UserOutlined className="text-blue-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">Kişisel Bilgiler</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Ad</span>}
                    name="firstName"
                    rules={[{ required: true, message: 'Ad gerekli' }]}
                  >
                    <Input
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="Örn: Ahmet"
                      className="rounded-lg"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Soyad</span>}
                    name="lastName"
                    rules={[{ required: true, message: 'Soyad gerekli' }]}
                  >
                    <Input
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="Örn: Yılmaz"
                      className="rounded-lg"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </div>
        )}

        {/* Step 1: İletişim */}
        {currentStep === 1 && (
          <div className="min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <MailOutlined className="text-green-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">İletişim Bilgileri</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Form.Item
                label={<span className="text-gray-700 font-medium">E-posta</span>}
                name="email"
                rules={[
                  { required: true, message: 'E-posta gerekli' },
                  { type: 'email', message: 'Geçerli bir e-posta girin' },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="ornek@firma.com"
                  className="rounded-lg"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-gray-700 font-medium">Telefon</span>}
                name="phone"
              >
                <Input
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="+90 (555) 123-4567"
                  className="rounded-lg"
                  size="large"
                />
              </Form.Item>
            </Card>
          </div>
        )}

        {/* Step 2: Firma & Lead Bilgisi */}
        {currentStep === 2 && (
          <div className="min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <BankOutlined className="text-purple-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">Firma & Lead Bilgisi</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Firma</span>}
                    name="company"
                  >
                    <Input
                      prefix={<BankOutlined className="text-gray-400" />}
                      placeholder="Firma adı"
                      className="rounded-lg"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Pozisyon</span>}
                    name="jobTitle"
                  >
                    <Input
                      prefix={<IdcardOutlined className="text-gray-400" />}
                      placeholder="İş unvanı"
                      className="rounded-lg"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Kaynak</span>}
                    name="source"
                    rules={[{ required: true, message: 'Kaynak gerekli' }]}
                  >
                    <Select placeholder="Kaynak seçiniz" className="rounded-lg" size="large">
                      <Select.Option value="Website">
                        <Space>
                          <GlobalOutlined className="text-gray-500" />
                          <span>Web Sitesi</span>
                        </Space>
                      </Select.Option>
                      <Select.Option value="Referral">
                        <Space>
                          <TeamOutlined className="text-gray-500" />
                          <span>Referans</span>
                        </Space>
                      </Select.Option>
                      <Select.Option value="SocialMedia">
                        <Space>
                          <GlobalOutlined className="text-gray-500" />
                          <span>Sosyal Medya</span>
                        </Space>
                      </Select.Option>
                      <Select.Option value="Event">
                        <Space>
                          <TeamOutlined className="text-gray-500" />
                          <span>Etkinlik</span>
                        </Space>
                      </Select.Option>
                      <Select.Option value="Other">
                        <Space>
                          <FileTextOutlined className="text-gray-500" />
                          <span>Diğer</span>
                        </Space>
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Durum</span>}
                    name="status"
                    rules={[{ required: true, message: 'Durum gerekli' }]}
                  >
                    <Select placeholder="Durum seçiniz" className="rounded-lg" size="large">
                      <Select.Option value="New">Yeni</Select.Option>
                      <Select.Option value="Contacted">İletişime Geçildi</Select.Option>
                      <Select.Option value="Qualified">Nitelikli</Select.Option>
                      <Select.Option value="Unqualified">Niteliksiz</Select.Option>
                      <Select.Option value="Converted">Dönüştürüldü</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={<span className="text-gray-700 font-medium">Lead Puanı (0-100)</span>}
                name="score"
                initialValue={50}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  className="rounded-lg"
                  prefix={<StarOutlined className="text-gray-400" />}
                  size="large"
                />
              </Form.Item>
            </Card>
          </div>
        )}

        {/* Step 3: Notlar & Tamamla */}
        {currentStep === 3 && (
          <div className="min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <FileTextOutlined className="text-gray-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">Notlar</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Form.Item
                label={<span className="text-gray-700 font-medium">Notlar</span>}
                name="notes"
              >
                <TextArea
                  rows={6}
                  placeholder="Bu lead hakkında notlar..."
                  className="rounded-lg"
                  size="large"
                />
              </Form.Item>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <CheckOutlined className="text-blue-600 text-xl mt-1" />
                  <div>
                    <div className="font-semibold text-blue-900 mb-1">Tamamlamaya Hazır</div>
                    <div className="text-sm text-blue-700">
                      Lead bilgilerini gözden geçirin ve kaydetmek için "Oluştur" butonuna tıklayın.
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Form>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
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
          <Button type="primary" onClick={handleSubmit} loading={loading} icon={<CheckOutlined />} size="large">
            {isEditMode ? 'Güncelle' : 'Oluştur'}
          </Button>
        )}
      </div>
    </Modal>
  );
}
