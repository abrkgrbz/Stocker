'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Switch,
  InputNumber,
  Tabs,
} from 'antd';
import {
  BuildingStorefrontIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  BuildingLibraryIcon,
  MapPinIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import type { SupplierDto, SupplierType, SupplierStatus } from '@/lib/api/services/purchase.types';

const { TextArea } = Input;
const { Text } = Typography;

interface SupplierFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: SupplierDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const supplierTypeOptions = [
  { value: 'Manufacturer', label: 'Üretici' },
  { value: 'Distributor', label: 'Distribütör' },
  { value: 'Wholesaler', label: 'Toptancı' },
  { value: 'Retailer', label: 'Perakendeci' },
  { value: 'ServiceProvider', label: 'Hizmet Sağlayıcı' },
  { value: 'Contractor', label: 'Yüklenici' },
  { value: 'Other', label: 'Diğer' },
];

const paymentTermOptions = [
  { value: 'Prepaid', label: 'Peşin' },
  { value: 'Net15', label: 'Net 15 Gün' },
  { value: 'Net30', label: 'Net 30 Gün' },
  { value: 'Net45', label: 'Net 45 Gün' },
  { value: 'Net60', label: 'Net 60 Gün' },
  { value: 'Net90', label: 'Net 90 Gün' },
  { value: 'Custom', label: 'Özel' },
];

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
];

export default function SupplierForm({ form, initialValues, onFinish, loading }: SupplierFormProps) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.status === 'Active');
    } else {
      form.setFieldsValue({
        status: 'Active',
        supplierType: 'Distributor',
        currency: 'TRY',
        paymentTerms: 'Net30',
        creditLimit: 0,
        rating: 0,
      });
    }
  }, [form, initialValues]);

  const handleStatusChange = (checked: boolean) => {
    setIsActive(checked);
    form.setFieldValue('status', checked ? 'Active' : 'Inactive');
  };

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
              <BuildingStorefrontIcon className="w-16 h-16 text-white/90" />
              <p className="mt-4 text-lg font-medium text-white/90">
                Tedarikçi Bilgileri
              </p>
              <p className="text-sm text-white/60">
                Tedarikçi firma bilgilerini tanımlayın
              </p>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">Durum</Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isActive ? 'Tedarikçi aktif ve işlem yapılabilir' : 'Tedarikçi pasif durumda'}
                </div>
              </div>
              <Form.Item name="status" noStyle>
                <Switch
                  checked={isActive}
                  onChange={handleStatusChange}
                  checkedChildren="Aktif"
                  unCheckedChildren="Pasif"
                  style={{
                    backgroundColor: isActive ? '#52c41a' : '#d9d9d9',
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
                  {initialValues.creditLimit?.toLocaleString('tr-TR') || '0'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Kredi Limiti ({initialValues.currency})</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.currentBalance?.toLocaleString('tr-TR') || '0'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Güncel Bakiye ({initialValues.currency})</div>
              </div>
              <div className="p-4 bg-blue-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-blue-600">
                  {initialValues.rating?.toFixed(1) || '0.0'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Puan</div>
              </div>
              <div className="p-4 bg-green-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-green-600">
                  %{initialValues.discountRate || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">İndirim Oranı</div>
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
            <Form.Item name="description" className="mb-0 mt-2">
              <TextArea
                placeholder="Tedarikçi hakkında kısa açıklama..."
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

          {/* Tabs for different sections */}
          <Tabs
            defaultActiveKey="basic"
            items={[
              {
                key: 'basic',
                label: (
                  <span className="flex items-center">
                    <BuildingStorefrontIcon className="w-4 h-4 mr-1" />
                    Temel Bilgiler
                  </span>
                ),
                children: (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <Row gutter={16}>
                      <Col span={12}>
                        <div className="text-xs text-gray-400 mb-1">Tedarikçi Kodu *</div>
                        <Form.Item
                          name="code"
                          rules={[{ required: true, message: 'Gerekli' }]}
                          className="mb-0"
                        >
                          <Input
                            placeholder="SUP-001"
                            variant="filled"
                            disabled={!!initialValues}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <div className="text-xs text-gray-400 mb-1">Tedarikçi Tipi *</div>
                        <Form.Item
                          name="supplierType"
                          rules={[{ required: true, message: 'Gerekli' }]}
                          className="mb-0"
                        >
                          <Select
                            placeholder="Tip seçin"
                            variant="filled"
                            options={supplierTypeOptions}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <div className="text-xs text-gray-400 mb-1">Vergi No</div>
                        <Form.Item name="taxNumber" className="mb-0">
                          <Input placeholder="Vergi numarası" variant="filled" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <div className="text-xs text-gray-400 mb-1">Vergi Dairesi</div>
                        <Form.Item name="taxOffice" className="mb-0">
                          <Input placeholder="Vergi dairesi" variant="filled" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: 'contact',
                label: (
                  <span className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-1" />
                    İletişim
                  </span>
                ),
                children: (
                  <div className="space-y-6">
                    <Row gutter={16}>
                      <Col span={12}>
                        <div className="text-xs text-gray-400 mb-1 flex items-center">
                          <UserIcon className="w-3 h-3 mr-1" />
                          İlgili Kişi
                        </div>
                        <Form.Item name="contactPerson" className="mb-0">
                          <Input placeholder="Ad Soyad" variant="filled" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <div className="text-xs text-gray-400 mb-1">Ünvan</div>
                        <Form.Item name="contactTitle" className="mb-0">
                          <Input placeholder="Ünvan / Pozisyon" variant="filled" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <div className="text-xs text-gray-400 mb-1 flex items-center">
                          <EnvelopeIcon className="w-3 h-3 mr-1" />
                          E-posta *
                        </div>
                        <Form.Item
                          name="email"
                          rules={[
                            { required: true, message: 'E-posta zorunludur' },
                            { type: 'email', message: 'Geçerli e-posta girin' },
                          ]}
                          className="mb-0"
                        >
                          <Input placeholder="ornek@firma.com" variant="filled" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <div className="text-xs text-gray-400 mb-1 flex items-center">
                          <PhoneIcon className="w-3 h-3 mr-1" />
                          Telefon
                        </div>
                        <Form.Item name="phone" className="mb-0">
                          <Input placeholder="+90 (___) ___ __ __" variant="filled" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <div className="text-xs text-gray-400 mb-1 flex items-center">
                          <PhoneIcon className="w-3 h-3 mr-1" />
                          Faks
                        </div>
                        <Form.Item name="fax" className="mb-0">
                          <Input placeholder="Faks numarası" variant="filled" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <div className="text-xs text-gray-400 mb-1 flex items-center">
                          <GlobeAltIcon className="w-3 h-3 mr-1" />
                          Web Sitesi
                        </div>
                        <Form.Item name="website" className="mb-0">
                          <Input placeholder="https://www.firma.com" variant="filled" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: 'address',
                label: (
                  <span className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    Adres
                  </span>
                ),
                children: (
                  <div className="space-y-6">
                    <Row gutter={16}>
                      <Col span={24}>
                        <div className="text-xs text-gray-400 mb-1">Adres</div>
                        <Form.Item name="address" className="mb-0">
                          <TextArea
                            placeholder="Açık adres"
                            variant="filled"
                            autoSize={{ minRows: 2, maxRows: 4 }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={8}>
                        <div className="text-xs text-gray-400 mb-1">İlçe</div>
                        <Form.Item name="district" className="mb-0">
                          <Input placeholder="İlçe" variant="filled" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <div className="text-xs text-gray-400 mb-1">Şehir</div>
                        <Form.Item name="city" className="mb-0">
                          <Input placeholder="Şehir" variant="filled" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <div className="text-xs text-gray-400 mb-1">Posta Kodu</div>
                        <Form.Item name="postalCode" className="mb-0">
                          <Input placeholder="34000" variant="filled" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <div className="text-xs text-gray-400 mb-1">Ülke</div>
                        <Form.Item name="country" className="mb-0" initialValue="Türkiye">
                          <Input placeholder="Ülke" variant="filled" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: 'financial',
                label: (
                  <span className="flex items-center">
                    <BuildingLibraryIcon className="w-4 h-4 mr-1" />
                    Finansal
                  </span>
                ),
                children: (
                  <div className="space-y-6">
                    <Row gutter={16}>
                      <Col span={12}>
                        <div className="text-xs text-gray-400 mb-1">Ödeme Vadesi</div>
                        <Form.Item name="paymentTerms" className="mb-0">
                          <Select
                            placeholder="Vade seçin"
                            variant="filled"
                            options={paymentTermOptions}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <div className="text-xs text-gray-400 mb-1">Para Birimi</div>
                        <Form.Item name="currency" className="mb-0">
                          <Select
                            placeholder="Para birimi"
                            variant="filled"
                            options={currencyOptions}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <div className="text-xs text-gray-400 mb-1">Kredi Limiti</div>
                        <Form.Item name="creditLimit" className="mb-0">
                          <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            placeholder="0"
                            variant="filled"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value: string | undefined) => Number(value?.replace(/,/g, '') ?? 0)}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <div className="text-xs text-gray-400 mb-1">İndirim Oranı (%)</div>
                        <Form.Item name="discountRate" className="mb-0">
                          <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            max={100}
                            placeholder="0"
                            variant="filled"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <div className="text-xs text-gray-400 mb-1">Banka Adı</div>
                        <Form.Item name="bankName" className="mb-0">
                          <Input placeholder="Banka adı" variant="filled" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <div className="text-xs text-gray-400 mb-1">Hesap Numarası</div>
                        <Form.Item name="bankAccountNumber" className="mb-0">
                          <Input placeholder="Hesap numarası" variant="filled" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={24}>
                        <div className="text-xs text-gray-400 mb-1">IBAN</div>
                        <Form.Item name="iban" className="mb-0">
                          <Input placeholder="TR00 0000 0000 0000 0000 0000 00" variant="filled" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: 'notes',
                label: (
                  <span className="flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-1" />
                    Notlar
                  </span>
                ),
                children: (
                  <div className="space-y-6">
                    <Row gutter={16}>
                      <Col span={24}>
                        <div className="text-xs text-gray-400 mb-1">Genel Notlar</div>
                        <Form.Item name="notes" className="mb-0">
                          <TextArea
                            placeholder="Tedarikçi hakkında notlar..."
                            variant="filled"
                            autoSize={{ minRows: 4, maxRows: 8 }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={24}>
                        <div className="text-xs text-gray-400 mb-1">Dahili Notlar</div>
                        <Form.Item name="internalNotes" className="mb-0">
                          <TextArea
                            placeholder="Sadece internal kullanım için notlar..."
                            variant="filled"
                            autoSize={{ minRows: 4, maxRows: 8 }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ),
              },
            ]}
          />
        </Col>
      </Row>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
