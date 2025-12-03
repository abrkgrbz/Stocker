'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Typography,
  Switch,
  Segmented,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  IdcardOutlined,
  StarOutlined,
} from '@ant-design/icons';
import type { Lead } from '@/lib/api/services/crm.service';

const { TextArea } = Input;
const { Text } = Typography;

// Lead source options
const sourceOptions = [
  { value: 'Website', label: 'Web Sitesi' },
  { value: 'Referral', label: 'Referans' },
  { value: 'SocialMedia', label: 'Sosyal Medya' },
  { value: 'Event', label: 'Etkinlik' },
  { value: 'ColdCall', label: 'Soğuk Arama' },
  { value: 'Email', label: 'E-posta' },
  { value: 'Other', label: 'Diğer' },
];

// Lead status options (string enum)
const statusOptions = [
  { value: 'New', label: 'Yeni' },
  { value: 'Contacted', label: 'İletişime Geçildi' },
  { value: 'Working', label: 'Çalışılıyor' },
  { value: 'Qualified', label: 'Nitelikli' },
  { value: 'Unqualified', label: 'Niteliksiz' },
  { value: 'Converted', label: 'Dönüştürüldü' },
  { value: 'Lost', label: 'Kayıp' },
];

// Lead rating options
const ratingOptions = [
  { value: 'Hot', label: '🔥 Sıcak' },
  { value: 'Warm', label: '☀️ Ilık' },
  { value: 'Cold', label: '❄️ Soğuk' },
];

interface LeadFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: Lead;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function LeadForm({ form, initialValues, onFinish, loading }: LeadFormProps) {
  const [rating, setRating] = useState<string>('Warm');

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        status: initialValues.status ?? 0,
      });
      setRating(initialValues.rating || 'Warm');
    } else {
      form.setFieldsValue({
        status: 0,
        score: 50,
      });
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="lead-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Lead Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">
                Potansiyel Müşteri
              </p>
              <p className="text-sm text-white/60">
                Yeni iş fırsatlarını takip edin
              </p>
            </div>
          </div>

          {/* Rating Selection */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <StarOutlined className="mr-1" /> Değerlendirme
            </Text>
            <Form.Item name="rating" className="mb-0" initialValue="Warm">
              <Segmented
                block
                options={ratingOptions}
                value={rating}
                onChange={(val) => {
                  setRating(val as string);
                  form.setFieldValue('rating', val);
                }}
                className="w-full"
              />
            </Form.Item>
          </div>

          {/* Lead Score */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Lead Puanı
            </Text>
            <div className="p-4 bg-gray-50/50 rounded-xl">
              <Form.Item name="score" className="mb-0" initialValue={50}>
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  size="large"
                  variant="filled"
                  addonAfter="/ 100"
                />
              </Form.Item>
              <div className="text-xs text-gray-400 mt-2">
                Lead&apos;in potansiyel değerini 0-100 arasında puanlayın
              </div>
            </div>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.score || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Puan</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {statusOptions.find(s => s.value === initialValues.status)?.label || 'Yeni'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Durum</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Lead Name - Hero Inputs */}
          <div className="mb-8">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="firstName"
                  rules={[
                    { required: true, message: 'Ad zorunludur' },
                    { max: 100, message: 'En fazla 100 karakter' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Ad"
                    variant="borderless"
                    style={{
                      fontSize: '28px',
                      fontWeight: 600,
                      padding: '0',
                      color: '#1a1a1a',
                    }}
                    className="placeholder:text-gray-300"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="lastName"
                  rules={[
                    { required: true, message: 'Soyad zorunludur' },
                    { max: 100, message: 'En fazla 100 karakter' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Soyad"
                    variant="borderless"
                    style={{
                      fontSize: '28px',
                      fontWeight: 600,
                      padding: '0',
                      color: '#1a1a1a',
                    }}
                    className="placeholder:text-gray-300"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="description" className="mb-0 mt-2">
              <TextArea
                placeholder="Lead hakkında notlar ekleyin..."
                variant="borderless"
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{
                  fontSize: '15px',
                  padding: '0',
                  color: '#666',
                  resize: 'none'
                }}
                className="placeholder:text-gray-300"
              />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Contact Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <MailOutlined className="mr-1" /> İletişim Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">E-posta *</div>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Gerekli' },
                    { type: 'email', message: 'Geçerli e-posta girin' },
                  ]}
                  className="mb-3"
                >
                  <Input
                    placeholder="ornek@firma.com"
                    variant="filled"
                    prefix={<MailOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Telefon</div>
                <Form.Item name="phone" className="mb-3">
                  <Input
                    placeholder="+90 (555) 123-4567"
                    variant="filled"
                    prefix={<PhoneOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Company Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <BankOutlined className="mr-1" /> Firma Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Firma Adı</div>
                <Form.Item name="companyName" className="mb-3">
                  <Input
                    placeholder="ABC Teknoloji A.Ş."
                    variant="filled"
                    prefix={<BankOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Pozisyon</div>
                <Form.Item name="jobTitle" className="mb-3">
                  <Input
                    placeholder="Satın Alma Müdürü"
                    variant="filled"
                    prefix={<IdcardOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Lead Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Lead Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Kaynak *</div>
                <Form.Item
                  name="source"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <Select
                    placeholder="Kaynak seçin"
                    options={sourceOptions}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Durum *</div>
                <Form.Item
                  name="status"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                  initialValue="New"
                >
                  <Select
                    placeholder="Durum seçin"
                    options={statusOptions}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
