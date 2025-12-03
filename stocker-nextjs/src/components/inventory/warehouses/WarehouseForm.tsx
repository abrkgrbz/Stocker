'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Switch,
  Row,
  Col,
  Collapse,
  Typography,
  Segmented,
} from 'antd';
import {
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  SettingOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import type { WarehouseDto } from '@/lib/api/services/inventory.types';

const { TextArea } = Input;
const { Text } = Typography;

interface WarehouseFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: WarehouseDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const warehouseTypes = [
  { value: 'main', label: 'Ana Depo' },
  { value: 'branch', label: 'Şube Deposu' },
  { value: 'transit', label: 'Transit Depo' },
];

export default function WarehouseForm({ form, initialValues, onFinish, loading }: WarehouseFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
      setIsDefault(initialValues.isDefault ?? false);
    } else {
      form.setFieldsValue({
        totalArea: 0,
        isDefault: false,
      });
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="warehouse-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Warehouse Visual Representation */}
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
              <HomeOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">
                Depo Bilgileri
              </p>
              <p className="text-sm text-white/60">
                Envanter yönetimi için depo tanımlayın
              </p>
            </div>
          </div>

          {/* Status Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">Durum</Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isActive ? 'Depo aktif ve kullanılabilir' : 'Depo pasif durumda'}
                </div>
              </div>
              <Form.Item name="isActive" valuePropName="checked" noStyle initialValue={true}>
                <Switch
                  checked={isActive}
                  onChange={(val) => {
                    setIsActive(val);
                    form.setFieldValue('isActive', val);
                  }}
                  checkedChildren="Aktif"
                  unCheckedChildren="Pasif"
                  style={{
                    backgroundColor: isActive ? '#52c41a' : '#d9d9d9',
                    minWidth: '80px'
                  }}
                />
              </Form.Item>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">Varsayılan Depo</Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isDefault ? 'Bu depo varsayılan olarak seçilecek' : 'Varsayılan depo değil'}
                </div>
              </div>
              <Form.Item name="isDefault" valuePropName="checked" noStyle>
                <Switch
                  checked={isDefault}
                  onChange={(val) => {
                    setIsDefault(val);
                    form.setFieldValue('isDefault', val);
                  }}
                  checkedChildren="Evet"
                  unCheckedChildren="Hayır"
                  style={{
                    backgroundColor: isDefault ? '#1890ff' : '#d9d9d9',
                    minWidth: '80px'
                  }}
                />
              </Form.Item>
            </div>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.locationCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Lokasyon</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.productCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Ürün</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Warehouse Name - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'Depo adı zorunludur' },
                { max: 200, message: 'En fazla 200 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Depo adı"
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
            <Form.Item name="description" className="mb-0 mt-2">
              <TextArea
                placeholder="Depo açıklaması ekleyin..."
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

          {/* Basic Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Temel Bilgiler
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Depo Kodu *</div>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="WH-001"
                    variant="filled"
                    disabled={!!initialValues}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Toplam Alan (m²)</div>
                <Form.Item name="totalArea" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="0"
                    variant="filled"
                    addonAfter="m²"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Address Section */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <EnvironmentOutlined className="mr-1" /> Adres Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={24}>
                <div className="text-xs text-gray-400 mb-1">Sokak / Cadde</div>
                <Form.Item name="street" className="mb-3">
                  <Input placeholder="Adres detayı" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Şehir</div>
                <Form.Item name="city" className="mb-0">
                  <Input placeholder="İstanbul" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">İlçe / Eyalet</div>
                <Form.Item name="state" className="mb-0">
                  <Input placeholder="Kadıköy" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Posta Kodu</div>
                <Form.Item name="postalCode" className="mb-0">
                  <Input placeholder="34000" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} className="mt-3">
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Ülke</div>
                <Form.Item name="country" className="mb-0">
                  <Input placeholder="Türkiye" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Contact Section */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <PhoneOutlined className="mr-1" /> İletişim
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Telefon</div>
                <Form.Item name="phone" className="mb-0">
                  <Input
                    placeholder="+90 212 000 00 00"
                    variant="filled"
                    prefix={<PhoneOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Depo Sorumlusu</div>
                <Form.Item name="manager" className="mb-0">
                  <Input
                    placeholder="Ad Soyad"
                    variant="filled"
                    prefix={<UserOutlined className="text-gray-400" />}
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
