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
  Switch,
} from 'antd';
import {
  GlobalOutlined,
  EnvironmentOutlined,
  AimOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import type { TerritoryDto } from '@/lib/api/services/crm.types';
import { TerritoryType } from '@/lib/api/services/crm.types';

const { TextArea } = Input;
const { Text } = Typography;

// Territory type options
const territoryTypeOptions = [
  { value: TerritoryType.Country, label: '🌍 Ülke' },
  { value: TerritoryType.Region, label: '🗺️ Bölge' },
  { value: TerritoryType.City, label: '🏙️ Şehir' },
  { value: TerritoryType.District, label: '📍 İlçe' },
];

const allTerritoryTypeOptions = [
  { value: TerritoryType.Country, label: 'Ülke' },
  { value: TerritoryType.Region, label: 'Bölge' },
  { value: TerritoryType.City, label: 'Şehir' },
  { value: TerritoryType.District, label: 'İlçe' },
  { value: TerritoryType.PostalCode, label: 'Posta Kodu' },
  { value: TerritoryType.Custom, label: 'Özel' },
  { value: TerritoryType.Industry, label: 'Sektör' },
  { value: TerritoryType.CustomerSegment, label: 'Müşteri Segmenti' },
];

interface TerritoryFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: TerritoryDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function TerritoryForm({ form, initialValues, onFinish, loading }: TerritoryFormProps) {
  const [territoryType, setTerritoryType] = useState<TerritoryType>(TerritoryType.Region);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
      setTerritoryType(initialValues.territoryType || TerritoryType.Region);
    } else {
      form.setFieldsValue({
        territoryType: TerritoryType.Region,
        isActive: true,
      });
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="territory-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Territory Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GlobalOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">
                Bölge
              </p>
              <p className="text-sm text-white/60">
                Satış bölgelerinizi tanımlayın
              </p>
            </div>
          </div>

          {/* Territory Type Selection */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Bölge Tipi
            </Text>
            <Form.Item name="territoryType" className="mb-0" initialValue={TerritoryType.Region}>
              <Segmented
                block
                options={territoryTypeOptions}
                value={territoryType}
                onChange={(val) => {
                  setTerritoryType(val as TerritoryType);
                  form.setFieldValue('territoryType', val);
                }}
                className="w-full"
              />
            </Form.Item>
          </div>

          {/* Active Status */}
          <div className="mb-6">
            <div className="p-4 bg-gray-50/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-sm font-medium text-gray-700 block">Aktif</Text>
                  <Text className="text-xs text-gray-400">Bölge aktif mi?</Text>
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
                  {initialValues.customerCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Müşteri</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.opportunityCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Fırsat</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Territory Name - Hero Input */}
          <div className="mb-8">
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: 'Ad zorunludur' },
                    { max: 100, message: 'En fazla 100 karakter' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Bölge Adı"
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
                placeholder="Bölge hakkında açıklama ekleyin..."
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

          {/* Geographic Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <EnvironmentOutlined className="mr-1" /> Coğrafi Bilgiler
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Ülke</div>
                <Form.Item name="country" className="mb-3">
                  <Input
                    placeholder="Türkiye"
                    variant="filled"
                    prefix={<GlobalOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Bölge</div>
                <Form.Item name="region" className="mb-3">
                  <Input
                    placeholder="Marmara"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Şehir</div>
                <Form.Item name="city" className="mb-3">
                  <Input
                    placeholder="İstanbul"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">İlçe</div>
                <Form.Item name="district" className="mb-3">
                  <Input
                    placeholder="Kadıköy"
                    variant="filled"
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
                    placeholder="1.000.000"
                    variant="filled"
                    className="w-full"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={(value) => value?.replace(/\./g, '') as unknown as number}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Hedef Yılı</div>
                <Form.Item name="targetYear" className="mb-3">
                  <InputNumber
                    placeholder="2025"
                    variant="filled"
                    className="w-full"
                    min={2020}
                    max={2100}
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
