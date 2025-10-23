'use client';

import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Radio,
  Row,
  Col,
  Space,
  message,
  Steps,
  Card,
  Divider,
  Button,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  BankOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useCRM';
import type { Customer } from '@/lib/api/services/crm.service';

const { Option } = Select;
const { TextArea } = Input;

interface CustomerModalProps {
  open: boolean;
  customer?: Customer | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function CustomerModal({
  open,
  customer,
  onCancel,
  onSuccess,
}: CustomerModalProps) {
  const [form] = Form.useForm();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const [currentStep, setCurrentStep] = useState(0);

  const isEditMode = !!customer;
  const customerType = Form.useWatch('customerType', form);

  // Initialize form with customer data when editing
  useEffect(() => {
    if (open && customer) {
      form.setFieldsValue({
        companyName: customer.companyName,
        contactPerson: customer.contactPerson || '',
        email: customer.email,
        phone: customer.phone || '',
        website: customer.website || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        country: customer.country || 'Türkiye',
        postalCode: customer.postalCode || '',
        customerType: customer.customerType,
        status: customer.status,
        creditLimit: customer.creditLimit,
        taxId: customer.taxId || '',
        paymentTerms: customer.paymentTerms || '',
        notes: customer.notes || '',
      });
      setCurrentStep(0);
    } else if (open) {
      form.resetFields();
      form.setFieldsValue({
        customerType: 'Corporate',
        status: 'Active',
        country: 'Türkiye',
        creditLimit: 0,
      });
      setCurrentStep(0);
    }
  }, [open, customer, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('📋 Form values from validateFields:', values);

      if (isEditMode && customer) {
        await updateCustomer.mutateAsync({
          id: customer.id,
          data: values,
        });
        message.success('Müşteri başarıyla güncellendi');
      } else {
        console.log('📤 Calling createCustomer with:', values);
        await createCustomer.mutateAsync(values);
        message.success('Müşteri başarıyla oluşturuldu');
      }

      form.resetFields();
      setCurrentStep(0);
      onSuccess();
    } catch (error) {
      console.error('❌ Form validation/submission failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setCurrentStep(0);
    onCancel();
  };

  const handleNext = async () => {
    try {
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

  const getStepFields = (step: number): string[] => {
    switch (step) {
      case 0:
        return ['customerType', 'companyName', 'contactPerson', 'status'];
      case 1:
        return ['email', 'phone'];
      case 2:
        return ['taxId', 'creditLimit'];
      default:
        return [];
    }
  };

  const steps = [
    {
      title: 'Temel Bilgiler',
      icon: <UserOutlined />,
    },
    {
      title: 'İletişim & Adres',
      icon: <EnvironmentOutlined />,
    },
    {
      title: 'Mali Bilgiler',
      icon: <DollarOutlined />,
    },
    {
      title: 'Notlar & Tamamla',
      icon: <FileTextOutlined />,
    },
  ];

  return (
    <Modal
      title={
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <span style={{ fontSize: '20px', fontWeight: 600 }}>
            {isEditMode ? '✏️ Müşteri Düzenle' : '➕ Yeni Müşteri Ekle'}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 400, color: '#8c8c8c' }}>
            {isEditMode ? 'Müşteri bilgilerini güncelleyin' : 'Adım adım yeni müşteri kaydı oluşturun'}
          </span>
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      width={900}
      destroyOnClose
      footer={null}
      styles={{ body: { paddingTop: 24 } }}
    >
      {/* Progress Steps */}
      <div style={{ marginBottom: 32 }}>
        <Steps
          current={currentStep}
          items={steps}
          size="small"
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          customerType: 'Corporate',
          status: 'Active',
          country: 'Türkiye',
          creditLimit: 0,
        }}
      >
        {/* Step 0: Basic Information */}
        {currentStep === 0 && (
          <div style={{ minHeight: '400px' }}>
            <Card
              bordered={false}
              style={{ backgroundColor: '#fafafa' }}
            >
              <Divider orientation="left">
                <Space>
                  <UserOutlined style={{ color: '#1890ff' }} />
                  <span style={{ fontWeight: 600 }}>Müşteri Tipi</span>
                </Space>
              </Divider>

              <Form.Item
                label={
                  <Space>
                    <span>Müşteri Kategorisi</span>
                    <Tooltip title="Kurumsal müşteriler için firma bilgileri, bireysel müşteriler için kişisel bilgiler kullanılır">
                      <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                    </Tooltip>
                  </Space>
                }
                name="customerType"
                rules={[{ required: true, message: 'Müşteri tipi seçiniz' }]}
              >
                <Radio.Group
                  size="large"
                  buttonStyle="solid"
                  style={{ width: '100%' }}
                >
                  <Radio.Button value="Corporate" style={{ width: '50%', textAlign: 'center', height: '60px', lineHeight: '48px' }}>
                    <Space direction="vertical" size={0}>
                      <BankOutlined style={{ fontSize: '20px' }} />
                      <span style={{ fontWeight: 500 }}>Kurumsal Müşteri</span>
                    </Space>
                  </Radio.Button>
                  <Radio.Button value="Individual" style={{ width: '50%', textAlign: 'center', height: '60px', lineHeight: '48px' }}>
                    <Space direction="vertical" size={0}>
                      <UserOutlined style={{ fontSize: '20px' }} />
                      <span style={{ fontWeight: 500 }}>Bireysel Müşteri</span>
                    </Space>
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Divider orientation="left">
                <Space>
                  <IdcardOutlined style={{ color: '#1890ff' }} />
                  <span style={{ fontWeight: 600 }}>Kimlik Bilgileri</span>
                </Space>
              </Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={customerType === 'Corporate' ? '🏢 Firma Adı' : '👤 Ad Soyad'}
                    name="companyName"
                    rules={[
                      { required: true, message: `${customerType === 'Corporate' ? 'Firma adı' : 'Ad soyad'} gereklidir` },
                      { min: 2, message: 'En az 2 karakter olmalıdır' },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder={customerType === 'Corporate' ? 'Örn: ABC Teknoloji A.Ş.' : 'Örn: Ahmet Yılmaz'}
                      prefix={<BankOutlined style={{ color: '#8c8c8c' }} />}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="👔 İrtibat Kişisi"
                    name="contactPerson"
                    rules={[
                      { max: 100, message: 'En fazla 100 karakter olabilir' },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="Örn: Mehmet Demir"
                      prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="📊 Müşteri Durumu"
                name="status"
                rules={[{ required: true, message: 'Durum seçiniz' }]}
              >
                <Select size="large">
                  <Option value="Active">✅ Aktif Müşteri</Option>
                  <Option value="Inactive">⏸️ Pasif Müşteri</Option>
                  <Option value="Potential">🎯 Potansiyel Müşteri</Option>
                </Select>
              </Form.Item>
            </Card>
          </div>
        )}

        {/* Step 1: Contact & Address */}
        {currentStep === 1 && (
          <div style={{ minHeight: '400px' }}>
            <Card
              bordered={false}
              style={{ backgroundColor: '#fafafa' }}
            >
              <Divider orientation="left">
                <Space>
                  <MailOutlined style={{ color: '#1890ff' }} />
                  <span style={{ fontWeight: 600 }}>İletişim Bilgileri</span>
                </Space>
              </Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="📧 E-posta Adresi"
                    name="email"
                    rules={[
                      { required: true, message: 'E-posta gereklidir' },
                      { type: 'email', message: 'Geçerli bir e-posta adresi girin' },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="ornek@firma.com"
                      prefix={<MailOutlined style={{ color: '#8c8c8c' }} />}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="📱 Telefon Numarası"
                    name="phone"
                    rules={[
                      { pattern: /^[0-9+\s()-]+$/, message: 'Geçerli bir telefon numarası girin' },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="+90 (555) 123-4567"
                      prefix={<PhoneOutlined style={{ color: '#8c8c8c' }} />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="🌐 Website"
                name="website"
                rules={[
                  { type: 'url', message: 'Geçerli bir website adresi girin (http:// veya https:// ile başlamalı)' },
                ]}
              >
                <Input
                  size="large"
                  placeholder="https://www.firma.com"
                  prefix={<GlobalOutlined style={{ color: '#8c8c8c' }} />}
                />
              </Form.Item>

              <Divider orientation="left">
                <Space>
                  <EnvironmentOutlined style={{ color: '#1890ff' }} />
                  <span style={{ fontWeight: 600 }}>Adres Bilgileri</span>
                </Space>
              </Divider>

              <Form.Item
                label="📍 Adres"
                name="address"
              >
                <TextArea
                  size="large"
                  rows={2}
                  placeholder="Sokak, Mahalle, Bina No, vb."
                  maxLength={200}
                  showCount
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="🏙️ Şehir"
                    name="city"
                  >
                    <Input size="large" placeholder="İstanbul" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="🗺️ İlçe/Bölge"
                    name="state"
                  >
                    <Input size="large" placeholder="Kadıköy" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="📮 Posta Kodu"
                    name="postalCode"
                    rules={[
                      { pattern: /^[0-9]{5}$/, message: '5 haneli posta kodu girin' },
                    ]}
                  >
                    <Input size="large" placeholder="34000" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="🌍 Ülke"
                name="country"
              >
                <Select size="large">
                  <Option value="Türkiye">🇹🇷 Türkiye</Option>
                  <Option value="Almanya">🇩🇪 Almanya</Option>
                  <Option value="İngiltere">🇬🇧 İngiltere</Option>
                  <Option value="ABD">🇺🇸 ABD</Option>
                  <Option value="Fransa">🇫🇷 Fransa</Option>
                </Select>
              </Form.Item>
            </Card>
          </div>
        )}

        {/* Step 2: Financial Information */}
        {currentStep === 2 && (
          <div style={{ minHeight: '400px' }}>
            <Card
              bordered={false}
              style={{ backgroundColor: '#fafafa' }}
            >
              <Divider orientation="left">
                <Space>
                  <DollarOutlined style={{ color: '#1890ff' }} />
                  <span style={{ fontWeight: 600 }}>Mali Bilgiler</span>
                </Space>
              </Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <Space>
                        <span>🆔 Vergi Numarası</span>
                        <Tooltip title="10 veya 11 haneli vergi kimlik numarası">
                          <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                        </Tooltip>
                      </Space>
                    }
                    name="taxId"
                    rules={[
                      { pattern: /^[0-9]{10,11}$/, message: '10 veya 11 haneli vergi numarası girin' },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="1234567890"
                      maxLength={11}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={
                      <Space>
                        <span>💳 Kredi Limiti</span>
                        <Tooltip title="Müşteriye tanımlanan maksimum alacak limiti">
                          <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                        </Tooltip>
                      </Space>
                    }
                    name="creditLimit"
                    rules={[
                      { type: 'number', min: 0, message: 'Kredi limiti negatif olamaz' },
                    ]}
                  >
                    <InputNumber
                      size="large"
                      className="w-full"
                      placeholder="0"
                      formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value?.replace(/₺\s?|(,*)/g, '') as any}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="📅 Ödeme Koşulları"
                name="paymentTerms"
              >
                <Select size="large" placeholder="Ödeme koşulu seçin">
                  <Option value="Peşin">💵 Peşin Ödeme</Option>
                  <Option value="15 Gün">📆 15 Gün Vadeli</Option>
                  <Option value="30 Gün">📆 30 Gün Vadeli</Option>
                  <Option value="45 Gün">📆 45 Gün Vadeli</Option>
                  <Option value="60 Gün">📆 60 Gün Vadeli</Option>
                  <Option value="90 Gün">📆 90 Gün Vadeli</Option>
                </Select>
              </Form.Item>

              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#e6f7ff',
                  border: '1px solid #91d5ff',
                  borderRadius: '8px',
                  marginTop: '24px',
                }}
              >
                <Space direction="vertical" size={8}>
                  <span style={{ fontWeight: 600, color: '#0050b3' }}>
                    💡 Mali Bilgiler Hakkında
                  </span>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#096dd9' }}>
                    <li>Vergi numarası müşteri faturalarında kullanılacaktır</li>
                    <li>Kredi limiti, müşterinin maksimum borçlanma tutarını belirler</li>
                    <li>Ödeme koşulları, fatura vadelerini otomatik olarak ayarlar</li>
                  </ul>
                </Space>
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Notes & Summary */}
        {currentStep === 3 && (
          <div style={{ minHeight: '400px' }}>
            <Card
              bordered={false}
              style={{ backgroundColor: '#fafafa' }}
            >
              <Divider orientation="left">
                <Space>
                  <FileTextOutlined style={{ color: '#1890ff' }} />
                  <span style={{ fontWeight: 600 }}>Ek Notlar</span>
                </Space>
              </Divider>

              <Form.Item
                label="📝 Müşteri Notları"
                name="notes"
              >
                <TextArea
                  size="large"
                  rows={6}
                  placeholder="Müşteri hakkında önemli notlar, özel durumlar, tercihler vb..."
                  maxLength={500}
                  showCount
                  style={{ fontSize: '14px' }}
                />
              </Form.Item>

              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#f6ffed',
                  border: '2px solid #b7eb8f',
                  borderRadius: '8px',
                  marginTop: '24px',
                }}
              >
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                    <span style={{ fontWeight: 600, fontSize: '16px', color: '#389e0d' }}>
                      Hazırsınız!
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#52c41a', fontSize: '14px' }}>
                    Tüm gerekli bilgiler toplandı. "{isEditMode ? 'Güncelle' : 'Oluştur'}" butonuna tıklayarak
                    müşteri kaydını {isEditMode ? 'güncelleyebilirsiniz' : 'oluşturabilirsiniz'}.
                  </p>
                </Space>
              </div>
            </Card>
          </div>
        )}
      </Form>

      {/* Footer Buttons */}
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          size="large"
          onClick={handleCancel}
        >
          İptal
        </Button>

        <Space>
          {currentStep > 0 && (
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={handlePrev}
            >
              Geri
            </Button>
          )}

          {currentStep < steps.length - 1 && (
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={handleNext}
              iconPosition="end"
            >
              İleri
            </Button>
          )}

          {currentStep === steps.length - 1 && (
            <Button
              type="primary"
              size="large"
              icon={<CheckOutlined />}
              onClick={handleSubmit}
              loading={createCustomer.isPending || updateCustomer.isPending}
              iconPosition="end"
            >
              {isEditMode ? 'Güncelle' : 'Oluştur'}
            </Button>
          )}
        </Space>
      </div>
    </Modal>
  );
}
