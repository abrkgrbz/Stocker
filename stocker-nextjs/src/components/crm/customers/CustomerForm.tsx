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
  CameraOutlined,
} from '@ant-design/icons';
import type { Customer } from '@/lib/api/services/crm.service';
import { getCityNames, getDistrictsByCity } from '@/lib/data/turkey-cities';

const { TextArea } = Input;
const { Text } = Typography;

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
        {/* Left Panel - Logo & Status (30%) */}
        <Col xs={24} lg={8}>
          {/* Logo Placeholder */}
          <div className="mb-6">
            <div className="w-32 h-32 mx-auto rounded-full bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all">
              {customerType === 'Corporate' ? (
                <BankOutlined className="text-3xl text-slate-300 mb-1" />
              ) : (
                <UserOutlined className="text-3xl text-slate-300 mb-1" />
              )}
              <CameraOutlined className="text-xs text-slate-400" />
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">Logo Ekle</p>
          </div>

          {/* Status Selection */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">
              Durum
            </Text>
            <Form.Item name="status" className="mb-0" initialValue="Active">
              <Select
                options={statusOptions}
                className="w-full"
                size="large"
              />
            </Form.Item>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="space-y-3 mt-6">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-xs text-slate-400 mb-1">Kredi Limiti</div>
                <div className="text-xl font-semibold text-slate-900">
                  ₺{(initialValues.creditLimit || 0).toLocaleString('tr-TR')}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-xs text-slate-400 mb-1">Toplam Alışveriş</div>
                <div className="text-xl font-semibold text-slate-900">
                  ₺{(initialValues.totalPurchases || 0).toLocaleString('tr-TR')}
                </div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (70%) */}
        <Col xs={24} lg={16}>
          {/* Customer Type - Segmented Control at Top */}
          <div className="mb-6">
            <Form.Item name="customerType" className="mb-0" initialValue="Corporate">
              <div className="flex w-full bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerType('Corporate');
                    form.setFieldValue('customerType', 'Corporate');
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                    customerType === 'Corporate'
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <BankOutlined className="mr-2" />
                  Kurumsal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerType('Individual');
                    form.setFieldValue('customerType', 'Individual');
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                    customerType === 'Individual'
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <UserOutlined className="mr-2" />
                  Bireysel
                </button>
              </div>
            </Form.Item>
          </div>

          {/* Company Name - Hero Input */}
          <div className="mb-6">
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
                  fontSize: '24px',
                  fontWeight: 600,
                  padding: '0',
                  color: '#0f172a',
                }}
                className="placeholder:text-slate-300"
              />
            </Form.Item>
            <Form.Item name="notes" className="mb-0 mt-2">
              <TextArea
                placeholder="Müşteri hakkında notlar ekleyin..."
                variant="borderless"
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{
                  fontSize: '14px',
                  padding: '0',
                  color: '#64748b',
                  resize: 'none'
                }}
                className="placeholder:text-slate-300"
              />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 mb-6" />

          {/* Contact Info */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3 block">
              <MailOutlined className="mr-1" /> İletişim Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-slate-400 mb-1">İrtibat Kişisi</div>
                <Form.Item name="contactPerson" className="mb-3">
                  <Input
                    placeholder="Mehmet Demir"
                    prefix={<UserOutlined className="text-slate-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-slate-400 mb-1">E-posta *</div>
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
                    prefix={<MailOutlined className="text-slate-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-slate-400 mb-1">Telefon</div>
                <Form.Item name="phone" className="mb-3">
                  <Input
                    placeholder="+90 (555) 123-4567"
                    prefix={<PhoneOutlined className="text-slate-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-slate-400 mb-1">Web Sitesi</div>
                <Form.Item name="website" className="mb-3">
                  <Input
                    placeholder="https://www.firma.com"
                    prefix={<GlobalOutlined className="text-slate-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 mb-6" />

          {/* Address Info */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3 block">
              <EnvironmentOutlined className="mr-1" /> Adres Bilgileri
            </Text>
            <Form.Item name="address" className="mb-3">
              <TextArea
                placeholder="Sokak, Mahalle, Bina No..."
                rows={2}
                maxLength={200}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-slate-400 mb-1">Şehir</div>
                <Form.Item name="city" className="mb-3">
                  <Select
                    placeholder="Şehir seçin"
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
                <div className="text-xs text-slate-400 mb-1">İlçe</div>
                <Form.Item name="state" className="mb-3">
                  <Select
                    placeholder={selectedCity ? 'İlçe seçin' : 'Önce şehir seçin'}
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
                <div className="text-xs text-slate-400 mb-1">Posta Kodu</div>
                <Form.Item name="postalCode" className="mb-3">
                  <Input placeholder="34000" maxLength={10} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="country" className="mb-0" initialValue="Türkiye">
              <Input type="hidden" />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 mb-6" />

          {/* Financial Info */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3 block">
              <DollarOutlined className="mr-1" /> Mali Bilgiler
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-slate-400 mb-1">Vergi Numarası</div>
                <Form.Item
                  name="taxId"
                  rules={[
                    { pattern: /^[0-9]{10,11}$/, message: '10-11 haneli vergi no' },
                  ]}
                  className="mb-3"
                >
                  <Input
                    placeholder="1234567890"
                    prefix={<IdcardOutlined className="text-slate-400" />}
                    maxLength={11}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-slate-400 mb-1">Kredi Limiti</div>
                <Form.Item name="creditLimit" className="mb-3" initialValue={0}>
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/₺\s?|(,*)/g, '') as any}
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <div className="text-xs text-slate-400 mb-1">Ödeme Koşulları</div>
                <Form.Item name="paymentTerms" className="mb-0">
                  <Select
                    placeholder="Ödeme koşulu seçin"
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
