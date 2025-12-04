'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Row,
  Col,
  Typography,
  Switch,
  InputNumber,
} from 'antd';
import {
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  UserOutlined,
  BankOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import type { SupplierDto } from '@/lib/api/services/inventory.types';

const { TextArea } = Input;
const { Text } = Typography;

interface SupplierFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: SupplierDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function SupplierForm({ form, initialValues, onFinish, loading }: SupplierFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [isPreferred, setIsPreferred] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
      setIsPreferred(initialValues.isPreferred ?? false);
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="supplier-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Supplier Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShopOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">
                Tedarikçi Bilgileri
              </p>
              <p className="text-sm text-white/60">
                Tedarikçi ve satıcı bilgilerini tanımlayın
              </p>
            </div>
          </div>

          {/* Status Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">Durum</Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isActive ? 'Tedarikçi aktif' : 'Tedarikçi pasif durumda'}
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
                <Text strong className="text-gray-700">Tercih Edilen</Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isPreferred ? 'Öncelikli tedarikçi' : 'Standart tedarikçi'}
                </div>
              </div>
              <Form.Item name="isPreferred" valuePropName="checked" noStyle initialValue={false}>
                <Switch
                  checked={isPreferred}
                  onChange={(val) => {
                    setIsPreferred(val);
                    form.setFieldValue('isPreferred', val);
                  }}
                  checkedChildren="Evet"
                  unCheckedChildren="Hayır"
                  style={{
                    backgroundColor: isPreferred ? '#f59e0b' : '#d9d9d9',
                    minWidth: '80px'
                  }}
                />
              </Form.Item>
            </div>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-1 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.productCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Ürün Sayısı</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Supplier Name - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'Tedarikçi adı zorunludur' },
                { max: 200, message: 'En fazla 200 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Tedarikçi adı"
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
                <div className="text-xs text-gray-400 mb-1">Tedarikçi Kodu *</div>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <Input
                    placeholder="SUP-001"
                    variant="filled"
                    disabled={!!initialValues}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Vergi Numarası</div>
                <Form.Item name="taxNumber" className="mb-3">
                  <Input placeholder="1234567890" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Vergi Dairesi</div>
                <Form.Item name="taxOffice" className="mb-0">
                  <Input placeholder="Vergi dairesi adı" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Contact Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <PhoneOutlined className="mr-1" /> İletişim Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Telefon</div>
                <Form.Item name="phone" className="mb-3">
                  <Input
                    placeholder="+90 212 123 4567"
                    variant="filled"
                    prefix={<PhoneOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Faks</div>
                <Form.Item name="fax" className="mb-3">
                  <Input
                    placeholder="+90 212 123 4568"
                    variant="filled"
                    prefix={<PhoneOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">E-posta</div>
                <Form.Item name="email" className="mb-3" rules={[{ type: 'email', message: 'Geçerli e-posta girin' }]}>
                  <Input
                    placeholder="info@supplier.com"
                    variant="filled"
                    prefix={<MailOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Web Sitesi</div>
                <Form.Item name="website" className="mb-0">
                  <Input
                    placeholder="https://www.supplier.com"
                    variant="filled"
                    prefix={<GlobalOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Contact Person */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <UserOutlined className="mr-1" /> İlgili Kişi
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Ad Soyad</div>
                <Form.Item name="contactPerson" className="mb-3">
                  <Input
                    placeholder="İlgili kişi adı"
                    variant="filled"
                    prefix={<UserOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Telefon</div>
                <Form.Item name="contactPhone" className="mb-3">
                  <Input
                    placeholder="+90 532 123 4567"
                    variant="filled"
                    prefix={<PhoneOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">E-posta</div>
                <Form.Item name="contactEmail" className="mb-0" rules={[{ type: 'email', message: 'Geçerli e-posta girin' }]}>
                  <Input
                    placeholder="contact@supplier.com"
                    variant="filled"
                    prefix={<MailOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Address */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <EnvironmentOutlined className="mr-1" /> Adres Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={24}>
                <div className="text-xs text-gray-400 mb-1">Adres</div>
                <Form.Item name="street" className="mb-3">
                  <TextArea
                    placeholder="Sokak/Cadde adresi"
                    variant="filled"
                    rows={2}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Şehir</div>
                <Form.Item name="city" className="mb-3">
                  <Input placeholder="İstanbul" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">İlçe/Bölge</div>
                <Form.Item name="state" className="mb-3">
                  <Input placeholder="Kadıköy" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Posta Kodu</div>
                <Form.Item name="postalCode" className="mb-3">
                  <Input placeholder="34000" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Ülke</div>
                <Form.Item name="country" className="mb-0">
                  <Input placeholder="Türkiye" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Payment Terms */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <BankOutlined className="mr-1" /> Ödeme Koşulları
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Vade (Gün)</div>
                <Form.Item name="paymentTermDays" className="mb-3">
                  <InputNumber
                    placeholder="30"
                    variant="filled"
                    min={0}
                    max={365}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Kredi Limiti (₺)</div>
                <Form.Item name="creditLimit" className="mb-0" initialValue={0}>
                  <InputNumber
                    placeholder="100000"
                    variant="filled"
                    min={0}
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
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
