'use client';

import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  InputNumber,
  Switch,
} from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  MailOutlined,
  DollarOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import type { SalesTeamDto } from '@/lib/api/services/crm.types';
import { useTerritories } from '@/lib/api/hooks/useCRM';

const { TextArea } = Input;
const { Text } = Typography;

// Target period options
const targetPeriodOptions = [
  { value: 'Monthly', label: 'Aylık' },
  { value: 'Quarterly', label: 'Çeyreklik' },
  { value: 'Yearly', label: 'Yıllık' },
];

// Communication channel options
const communicationChannelOptions = [
  { value: 'Slack', label: 'Slack' },
  { value: 'Teams', label: 'Microsoft Teams' },
  { value: 'Email', label: 'E-posta' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Other', label: 'Diğer' },
];

interface SalesTeamFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: SalesTeamDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function SalesTeamForm({ form, initialValues, onFinish, loading }: SalesTeamFormProps) {
  const { data: territories = [] } = useTerritories({ pageSize: 100, isActive: true });

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
    } else {
      form.setFieldsValue({
        isActive: true,
        targetPeriod: 'Monthly',
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
      className="sales-team-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Sales Team Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TeamOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">
                Satış Ekibi
              </p>
              <p className="text-sm text-white/60">
                Ekiplerinizi organize edin
              </p>
            </div>
          </div>

          {/* Active Status */}
          <div className="mb-6">
            <div className="p-4 bg-gray-50/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-sm font-medium text-gray-700 block">Aktif</Text>
                  <Text className="text-xs text-gray-400">Ekip aktif mi?</Text>
                </div>
                <Form.Item name="isActive" valuePropName="checked" className="mb-0" initialValue={true}>
                  <Switch />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.activeMemberCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Aktif Üye</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.totalMemberCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Toplam Üye</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Team Name - Hero Input */}
          <div className="mb-8">
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: 'Ekip adı zorunludur' },
                    { max: 100, message: 'En fazla 100 karakter' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Ekip Adı"
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
              <Col span={8}>
                <Form.Item
                  name="code"
                  rules={[
                    { required: true, message: 'Kod zorunludur' },
                    { max: 20, message: 'En fazla 20 karakter' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Kod"
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
                placeholder="Ekip hakkında açıklama ekleyin..."
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

          {/* Team Leader Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <UserOutlined className="mr-1" /> Ekip Lideri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Lider Adı</div>
                <Form.Item name="teamLeaderName" className="mb-3">
                  <Input
                    placeholder="Ekip lideri adı"
                    variant="filled"
                    prefix={<UserOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Ekip E-postası</div>
                <Form.Item name="teamEmail" className="mb-3">
                  <Input
                    placeholder="satis@firma.com"
                    variant="filled"
                    prefix={<MailOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Sales Targets */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <DollarOutlined className="mr-1" /> Satış Hedefleri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Satış Hedefi (₺)</div>
                <Form.Item name="salesTarget" className="mb-3">
                  <InputNumber
                    placeholder="500.000"
                    variant="filled"
                    className="w-full"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={(value) => value?.replace(/\./g, '') as unknown as number}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Hedef Periyodu</div>
                <Form.Item name="targetPeriod" className="mb-3" initialValue="Monthly">
                  <Select
                    placeholder="Periyot seçin"
                    options={targetPeriodOptions}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Territory & Communication */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <GlobalOutlined className="mr-1" /> Bölge ve İletişim
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Bölge</div>
                <Form.Item name="territoryId" className="mb-3">
                  <Select
                    placeholder="Bölge seçin"
                    variant="filled"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={(territories || []).map(t => ({ value: t.id, label: t.name }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">İletişim Kanalı</div>
                <Form.Item name="communicationChannel" className="mb-3">
                  <Select
                    placeholder="Kanal seçin"
                    options={communicationChannelOptions}
                    variant="filled"
                    allowClear
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
