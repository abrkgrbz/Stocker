'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Segmented,
  InputNumber,
  DatePicker,
} from 'antd';
import {
  ShareAltOutlined,
  UserOutlined,
  MailOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import type { ReferralDto } from '@/lib/api/services/crm.types';
import { ReferralType, ReferralStatus, ReferralRewardType } from '@/lib/api/services/crm.types';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import { FormPhoneInput } from '@/components/ui/InternationalPhoneInput';

const { TextArea } = Input;
const { Text } = Typography;

// Referral type options
const referralTypeOptions = [
  { value: ReferralType.Customer, label: '👤 Müşteri' },
  { value: ReferralType.Partner, label: '🤝 Partner' },
  { value: ReferralType.Employee, label: '👨‍💼 Çalışan' },
  { value: ReferralType.Affiliate, label: '🔗 Affiliate' },
];

const allReferralTypeOptions = [
  { value: ReferralType.Customer, label: 'Müşteri' },
  { value: ReferralType.Partner, label: 'Partner' },
  { value: ReferralType.Employee, label: 'Çalışan' },
  { value: ReferralType.Influencer, label: 'Influencer' },
  { value: ReferralType.Affiliate, label: 'Affiliate' },
  { value: ReferralType.Other, label: 'Diğer' },
];

// Reward type options
const rewardTypeOptions = [
  { value: ReferralRewardType.Cash, label: 'Nakit' },
  { value: ReferralRewardType.Discount, label: 'İndirim' },
  { value: ReferralRewardType.Points, label: 'Puan' },
  { value: ReferralRewardType.Credit, label: 'Kredi' },
  { value: ReferralRewardType.Gift, label: 'Hediye' },
  { value: ReferralRewardType.FreeProduct, label: 'Ücretsiz Ürün' },
  { value: ReferralRewardType.FreeService, label: 'Ücretsiz Hizmet' },
];

// Status options
const statusOptions = [
  { value: ReferralStatus.New, label: 'Yeni' },
  { value: ReferralStatus.Contacted, label: 'İletişime Geçildi' },
  { value: ReferralStatus.Qualified, label: 'Nitelikli' },
  { value: ReferralStatus.Converted, label: 'Dönüştürüldü' },
  { value: ReferralStatus.Rejected, label: 'Reddedildi' },
  { value: ReferralStatus.Expired, label: 'Süresi Doldu' },
];

interface ReferralFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ReferralDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function ReferralForm({ form, initialValues, onFinish, loading }: ReferralFormProps) {
  const [referralType, setReferralType] = useState<ReferralType>(ReferralType.Customer);
  const { data: customersData } = useCustomers({ pageSize: 100 });
  const customers = customersData?.items || [];

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
      setReferralType(initialValues.referralType || ReferralType.Customer);
    } else {
      form.setFieldsValue({
        referralType: ReferralType.Customer,
        status: ReferralStatus.New,
        rewardType: ReferralRewardType.Points,
        currency: 'TRY',
      });
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="referral-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Referral Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShareAltOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">
                Referans
              </p>
              <p className="text-sm text-white/60">
                Referans programınızı büyütün
              </p>
            </div>
          </div>

          {/* Referral Type Selection */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <ShareAltOutlined className="mr-1" /> Referans Tipi
            </Text>
            <Form.Item name="referralType" className="mb-0" initialValue={ReferralType.Customer}>
              <Segmented
                block
                options={referralTypeOptions}
                value={referralType}
                onChange={(val) => {
                  setReferralType(val as ReferralType);
                  form.setFieldValue('referralType', val);
                }}
                className="w-full"
              />
            </Form.Item>
          </div>

          {/* Status */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Durum
            </Text>
            <Form.Item name="status" className="mb-0" initialValue={ReferralStatus.New}>
              <Select
                options={statusOptions}
                variant="filled"
                size="large"
                className="w-full"
              />
            </Form.Item>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.referrerReward || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Referrer Ödülü</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.referredReward || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Referred Ödülü</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Referrer Info - Hero Section */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <UserOutlined className="mr-1" /> Referans Veren
            </Text>
            <Form.Item
              name="referrerName"
              rules={[
                { required: true, message: 'Ad zorunludur' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Referans Veren Adı"
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
            <Row gutter={16} className="mt-4">
              <Col span={12}>
                <Form.Item name="referrerEmail" className="mb-3">
                  <Input
                    placeholder="E-posta"
                    variant="filled"
                    prefix={<MailOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="referrerPhone" className="mb-3">
                  <FormPhoneInput defaultCountry="TR" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="referrerCustomerId" className="mb-0">
              <Select
                placeholder="Mevcut müşteri seçin (opsiyonel)"
                variant="filled"
                allowClear
                showSearch
                optionFilterProp="label"
                options={customers.map(c => ({ value: c.id, label: c.companyName }))}
              />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Referred Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <UserOutlined className="mr-1" /> Referans Edilen
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Ad *</div>
                <Form.Item
                  name="referredName"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <Input
                    placeholder="Ad Soyad"
                    variant="filled"
                    prefix={<UserOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Firma</div>
                <Form.Item name="referredCompany" className="mb-3">
                  <Input
                    placeholder="Firma adı"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">E-posta</div>
                <Form.Item name="referredEmail" className="mb-3">
                  <Input
                    placeholder="ornek@firma.com"
                    variant="filled"
                    prefix={<MailOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Telefon</div>
                <Form.Item name="referredPhone" className="mb-3">
                  <FormPhoneInput defaultCountry="TR" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Reward Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <GiftOutlined className="mr-1" /> Ödül Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Ödül Tipi</div>
                <Form.Item name="rewardType" className="mb-3" initialValue={ReferralRewardType.Points}>
                  <Select
                    placeholder="Tip seçin"
                    options={rewardTypeOptions}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Referrer Ödülü</div>
                <Form.Item name="referrerReward" className="mb-3">
                  <InputNumber
                    placeholder="100"
                    variant="filled"
                    className="w-full"
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Referred Ödülü</div>
                <Form.Item name="referredReward" className="mb-3">
                  <InputNumber
                    placeholder="50"
                    variant="filled"
                    className="w-full"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Message */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Referans Mesajı
            </Text>
            <Form.Item name="referralMessage" className="mb-3">
              <TextArea
                placeholder="Referans ile ilgili mesaj veya not..."
                variant="filled"
                autoSize={{ minRows: 3, maxRows: 5 }}
              />
            </Form.Item>
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
