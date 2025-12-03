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
  Segmented,
} from 'antd';
import {
  UserOutlined,
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import type { Customer } from '@/lib/api/services/crm.service';
import { getCityNames, getDistrictsByCity } from '@/lib/data/turkey-cities';

const { TextArea } = Input;
const { Text } = Typography;

// Customer type options
const customerTypeOptions = [
  { value: 'Corporate', label: '🏢 Kurumsal' },
  { value: 'Individual', label: '👤 Bireysel' },
];

// Customer status options
const statusOptions = [
  { value: 'Active', label: 'Aktif' },
  { value: 'Inactive', label: 'Pasif' },
  { value: 'Potential', label: 'Potansiyel' },
];

// Payment terms options
const paymentTermsOptions = [
  { value: 'Immediate', label: 'Peşin' },
  { value: '15 Days', label: '15 Gün Vadeli' },
  { value: '30 Days', label: '30 Gün Vadeli' },
  { value: '45 Days', label: '45 Gün Vadeli' },
  { value: '60 Days', label: '60 Gün Vadeli' },
  { value: '90 Days', label: '90 Gün Vadeli' },
];

interface CustomerFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: Customer;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function CustomerForm({ form, initialValues, onFinish, loading }: CustomerFormProps) {
  const [customerType, setCustomerType] = useState<string>('Corporate');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [districts, setDistricts] = useState<string[]>([]);

  const cityNames = getCityNames();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        country: initialValues.country || 'Türkiye',
      });
      setCustomerType(initialValues.customerType || 'Corporate');
      if (initialValues.city) {
        setSelectedCity(initialValues.city);
        setDistricts(getDistrictsByCity(initialValues.city));
      }
    } else {
      form.setFieldsValue({
        customerType: 'Corporate',
        status: 'Active',
        country: 'Türkiye',
        creditLimit: 0,
      });
    }
  }, [form, initialValues]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    const cityDistricts = getDistrictsByCity(city);
    setDistricts(cityDistricts);
    form.setFieldsValue({ state: undefined });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="customer-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Customer Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {customerType === 'Corporate' ? (
                <BankOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              ) : (
                <UserOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              )}
              <p className="mt-4 text-lg font-medium text-white/90">
                {customerType === 'Corporate' ? 'Kurumsal Müşteri' : 'Bireysel Müşteri'}
              </p>
              <p className="text-sm text-white/60">
                Müşteri bilgilerini yönetin
              </p>
            </div>
          </div>

          {/* Customer Type Selection */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Müşteri Tipi
            </Text>
            <Form.Item name="customerType" className="mb-0" initialValue="Corporate">
              <Segmented
                block
                options={customerTypeOptions}
                value={customerType}
                onChange={(val) => {
                  setCustomerType(val as string);
                  form.setFieldValue('customerType', val);
                }}
                className="w-full"
              />
            </Form.Item>
          </div>

          {/* Status Selection */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Durum
            </Text>
            <Form.Item name="status" className="mb-0" initialValue="Active">
              <Select
                options={statusOptions}
                variant="filled"
                size="large"
              />
            </Form.Item>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  ₺{(initialValues.creditLimit || 0).toLocaleString('tr-TR')}
                </div>
                <div className="text-xs text-gray-500 mt-1">Kredi Limiti</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.status === 'Active' ? '✓ Aktif' : initialValues.status}
                </div>
                <div className="text-xs text-gray-500 mt-1">Durum</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Company Name - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="companyName"
              rules={[
                { required: true, message: 'Firma/Ad zorunludur' },
                { max: 200, message: 'En fazla 200 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder={customerType === 'Corporate' ? 'Firma Adı' : 'Ad Soyad'}
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
            <Form.Item name="notes" className="mb-0 mt-2">
              <TextArea
                placeholder="Müşteri hakkında notlar ekleyin..."
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
                <div className="text-xs text-gray-400 mb-1">İrtibat Kişisi</div>
                <Form.Item name="contactPerson" className="mb-3">
                  <Input
                    placeholder="Mehmet Demir"
                    variant="filled"
                    prefix={<UserOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
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
            </Row>
            <Row gutter={16}>
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
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Web Sitesi</div>
                <Form.Item name="website" className="mb-3">
                  <Input
                    placeholder="https://www.firma.com"
                    variant="filled"
                    prefix={<GlobalOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Address Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <EnvironmentOutlined className="mr-1" /> Adres Bilgileri
            </Text>
            <Form.Item name="address" className="mb-3">
              <TextArea
                placeholder="Sokak, Mahalle, Bina No..."
                variant="filled"
                rows={2}
                maxLength={200}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Şehir</div>
                <Form.Item name="city" className="mb-3">
                  <Select
                    placeholder="Şehir seçin"
                    variant="filled"
                    showSearch
                    optionFilterProp="children"
                    onChange={handleCityChange}
                  >
                    {cityNames.map((city) => (
                      <Select.Option key={city} value={city}>
                        {city}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">İlçe</div>
                <Form.Item name="state" className="mb-3">
                  <Select
                    placeholder={selectedCity ? 'İlçe seçin' : 'Önce şehir seçin'}
                    variant="filled"
                    showSearch
                    optionFilterProp="children"
                    disabled={!selectedCity}
                  >
                    {districts.map((district) => (
                      <Select.Option key={district} value={district}>
                        {district}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Posta Kodu</div>
                <Form.Item name="postalCode" className="mb-3">
                  <Input placeholder="34000" variant="filled" maxLength={10} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="country" className="mb-0" initialValue="Türkiye">
              <Input type="hidden" />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Financial Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <DollarOutlined className="mr-1" /> Mali Bilgiler
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Vergi Numarası</div>
                <Form.Item
                  name="taxId"
                  rules={[
                    { pattern: /^[0-9]{10,11}$/, message: '10-11 haneli vergi no' },
                  ]}
                  className="mb-3"
                >
                  <Input
                    placeholder="1234567890"
                    variant="filled"
                    prefix={<IdcardOutlined className="text-gray-400" />}
                    maxLength={11}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Kredi Limiti</div>
                <Form.Item name="creditLimit" className="mb-3" initialValue={0}>
                  <InputNumber
                    style={{ width: '100%' }}
                    variant="filled"
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/₺\s?|(,*)/g, '') as any}
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <div className="text-xs text-gray-400 mb-1">Ödeme Koşulları</div>
                <Form.Item name="paymentTerms" className="mb-0">
                  <Select
                    placeholder="Ödeme koşulu seçin"
                    variant="filled"
                    options={paymentTermsOptions}
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
