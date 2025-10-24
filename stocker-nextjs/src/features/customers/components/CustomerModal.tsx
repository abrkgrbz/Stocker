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
  Divider,
  Button,
  Tooltip,
  Alert,
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
  ShopOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
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
    console.log('🔵 handleSubmit called');
    try {
      // Validate current step fields first
      const currentStepFields = getStepFields(currentStep);
      console.log('🔵 Fields to validate:', currentStepFields);

      if (currentStepFields.length > 0) {
        await form.validateFields(currentStepFields);
        console.log('✅ Validation passed');
      }

      // Get ALL form values (not just validated ones)
      // This is crucial for multi-step forms where only current step is rendered
      const values = form.getFieldsValue(true);
      console.log('📋 All form values:', values);

      if (isEditMode && customer) {
        console.log('📤 Calling updateCustomer...');
        await updateCustomer.mutateAsync({
          id: customer.id,
          data: values,
        });
        console.log('✅ Update successful');

        // Success alert
        Modal.success({
          title: '✅ Başarılı!',
          content: (
            <div>
              <p><strong>{values.companyName}</strong> başarıyla güncellendi.</p>
              <p style={{ marginTop: '8px', color: '#52c41a' }}>
                Müşteri bilgileri sisteme kaydedildi.
              </p>
            </div>
          ),
          okText: 'Tamam',
        });
      } else {
        console.log('📤 Calling createCustomer with:', values);
        const result = await createCustomer.mutateAsync(values);
        console.log('✅ Create successful, result:', result);

        // Success alert
        Modal.success({
          title: '✅ Müşteri Başarıyla Oluşturuldu!',
          content: (
            <div>
              <p><strong>{values.companyName}</strong> sisteme eklendi.</p>
              <p style={{ marginTop: '8px', color: '#52c41a' }}>
                Müşteri listesinde görüntüleyebilirsiniz.
              </p>
            </div>
          ),
          okText: 'Tamam',
        });
      }

      form.resetFields();
      setCurrentStep(0);
      onSuccess();
    } catch (error: any) {
      console.error('❌ Form validation/submission failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        data: error.response?.data,
      });

      // Check if it's a validation error (form fields not filled correctly)
      if (error.errorFields) {
        message.error('Lütfen tüm gerekli alanları doğru şekilde doldurun');
        return;
      }

      // API error handling
      let errorTitle = '❌ İşlem Başarısız';
      let errorMessage = 'Müşteri kaydedilirken bir hata oluştu.';
      let errorDetails: string[] = [];

      // Extract error details from API response
      if (error.response?.data) {
        const apiError = error.response.data;

        // Conflict error (duplicate customer)
        if (apiError.type === 'Conflict' || apiError.code?.includes('Customer.')) {
          errorTitle = '⚠️ Müşteri Zaten Mevcut';

          // Check which field caused the conflict
          if (apiError.code === 'Customer.Email') {
            errorMessage = 'Bu e-posta adresi ile kayıtlı bir müşteri zaten mevcut.';
            errorDetails.push('E-posta: ' + form.getFieldValue('email'));
          } else if (apiError.code === 'Customer.TaxId') {
            errorMessage = 'Bu vergi numarası ile kayıtlı bir müşteri zaten mevcut.';
            errorDetails.push('Vergi No: ' + form.getFieldValue('taxId'));
          } else {
            errorMessage = apiError.description || 'Bu bilgilerle kayıtlı bir müşteri zaten var.';
          }
        }
        // Backend validation error
        else if (apiError.type === 'Validation' || apiError.code === 'ValidationError') {
          errorTitle = '⚠️ Geçersiz Veri';
          errorMessage = apiError.description || apiError.message || 'Girilen veriler geçersiz.';

          // Extract field-specific errors if available
          if (apiError.errors) {
            errorDetails = Object.entries(apiError.errors).map(
              ([field, messages]: [string, any]) =>
                `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
            );
          }
        }
        // RabbitMQ or infrastructure errors
        else if (error.message?.includes('RabbitMQ') || error.message?.includes('Broker unreachable')) {
          errorTitle = '⚠️ Sistem Hatası';
          errorMessage = 'Müşteri kaydedildi ancak bildirim gönderilemedi. Lütfen sistem yöneticisine bildirin.';
        }
        // Generic API error
        else {
          errorMessage = apiError.description || apiError.message || errorMessage;
          if (apiError.code) {
            errorDetails.push(`Hata Kodu: ${apiError.code}`);
          }
        }
      }
      // Network error
      else if (error.message === 'Network Error') {
        errorTitle = '🌐 Bağlantı Hatası';
        errorMessage = 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.';
      }

      // Show error modal with details
      Modal.error({
        title: errorTitle,
        content: (
          <div>
            <Alert
              message={errorMessage}
              type="error"
              showIcon
              style={{ marginBottom: errorDetails.length > 0 ? '16px' : '0' }}
            />
            {errorDetails.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <strong>Detaylar:</strong>
                <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                  {errorDetails.map((detail, index) => (
                    <li key={index} style={{ color: '#ff4d4f' }}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#8c8c8c' }}>
              Sorun devam ederse sistem yöneticisine başvurun.
            </div>
          </div>
        ),
        okText: 'Tamam',
        width: 500,
      });
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
        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
          <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            {isEditMode ? (
              <IdcardOutlined className="text-2xl text-white" />
            ) : (
              <ShopOutlined className="text-2xl text-white" />
            )}
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">
              {isEditMode ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
            </div>
            <div className="text-sm text-gray-500 font-normal">
              {isEditMode ? 'Müşteri bilgilerini güncelleyin' : 'Adım adım yeni müşteri kaydı oluşturun'}
            </div>
          </div>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      width={900}
      destroyOnClose
      footer={null}
      styles={{ body: { paddingTop: 24 } }}
    >
      {/* Progress Steps with Gradient */}
      <div className="mb-8">
        <Steps
          current={currentStep}
          items={steps}
          size="small"
          className="custom-steps"
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
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ minHeight: '400px' }}
          >
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <Divider orientation="left" className="!mt-0">
                <Space className="text-base font-semibold text-gray-700">
                  <div className="inline-flex p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                    <UserOutlined className="text-white" />
                  </div>
                  <span>Müşteri Tipi</span>
                </Space>
              </Divider>

              <Form.Item
                label={
                  <Space>
                    <span className="font-medium">Müşteri Kategorisi</span>
                    <Tooltip title="Kurumsal müşteriler için firma bilgileri, bireysel müşteriler için kişisel bilgiler kullanılır">
                      <InfoCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </Space>
                }
                name="customerType"
                rules={[{ required: true, message: 'Müşteri tipi seçiniz' }]}
              >
                <Radio.Group
                  size="large"
                  buttonStyle="solid"
                  className="w-full grid grid-cols-2 gap-3"
                >
                  <Radio.Button value="Corporate" className="!h-auto border-2 hover:border-blue-400">
                    <div className="py-4 text-center">
                      <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 mb-2">
                        <BankOutlined className="text-2xl text-white" />
                      </div>
                      <div className="font-semibold text-gray-700">🏢 Kurumsal Müşteri</div>
                    </div>
                  </Radio.Button>
                  <Radio.Button value="Individual" className="!h-auto border-2 hover:border-purple-400">
                    <div className="py-4 text-center">
                      <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 mb-2">
                        <UserOutlined className="text-2xl text-white" />
                      </div>
                      <div className="font-semibold text-gray-700">👤 Bireysel Müşteri</div>
                    </div>
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Divider orientation="left">
                <Space className="text-base font-semibold text-gray-700">
                  <div className="inline-flex p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                    <IdcardOutlined className="text-white" />
                  </div>
                  <span>Kimlik Bilgileri</span>
                </Space>
              </Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <span className="font-medium">
                        {customerType === 'Corporate' ? '🏢 Firma Adı' : '👤 Ad Soyad'}
                      </span>
                    }
                    name="companyName"
                    rules={[
                      { required: true, message: `${customerType === 'Corporate' ? 'Firma adı' : 'Ad soyad'} gereklidir` },
                      { min: 2, message: 'En az 2 karakter olmalıdır' },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder={customerType === 'Corporate' ? 'Örn: ABC Teknoloji A.Ş.' : 'Örn: Ahmet Yılmaz'}
                      prefix={<BankOutlined className="text-blue-500" />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={<span className="font-medium">👔 İrtibat Kişisi</span>}
                    name="contactPerson"
                    rules={[
                      { max: 100, message: 'En fazla 100 karakter olabilir' },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="Örn: Mehmet Demir"
                      prefix={<UserOutlined className="text-purple-500" />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={<span className="font-medium">📊 Müşteri Durumu</span>}
                name="status"
                rules={[{ required: true, message: 'Durum seçiniz' }]}
              >
                <Select size="large" className="rounded-lg">
                  <Option value="Active">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-green-500">●</span>
                      <span>Aktif Müşteri</span>
                    </span>
                  </Option>
                  <Option value="Inactive">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-gray-500">●</span>
                      <span>Pasif Müşteri</span>
                    </span>
                  </Option>
                  <Option value="Potential">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-yellow-500">●</span>
                      <span>Potansiyel Müşteri</span>
                    </span>
                  </Option>
                </Select>
              </Form.Item>
            </div>
          </motion.div>
        )}

        {/* Step 1: Contact & Address */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ minHeight: '400px' }}
          >
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <Divider orientation="left" className="!mt-0">
                <Space className="text-base font-semibold text-gray-700">
                  <div className="inline-flex p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                    <MailOutlined className="text-white" />
                  </div>
                  <span>İletişim Bilgileri</span>
                </Space>
              </Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="font-medium">📧 E-posta Adresi</span>}
                    name="email"
                    rules={[
                      { required: true, message: 'E-posta gereklidir' },
                      { type: 'email', message: 'Geçerli bir e-posta adresi girin' },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="ornek@firma.com"
                      prefix={<MailOutlined className="text-blue-500" />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={<span className="font-medium">📱 Telefon Numarası</span>}
                    name="phone"
                    rules={[
                      { pattern: /^[0-9+\s()-]+$/, message: 'Geçerli bir telefon numarası girin' },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="+90 (555) 123-4567"
                      prefix={<PhoneOutlined className="text-green-500" />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={<span className="font-medium">🌐 Website</span>}
                name="website"
                rules={[
                  { type: 'url', message: 'Geçerli bir website adresi girin (http:// veya https:// ile başlamalı)' },
                ]}
              >
                <Input
                  size="large"
                  placeholder="https://www.firma.com"
                  prefix={<GlobalOutlined className="text-cyan-500" />}
                  className="rounded-lg"
                />
              </Form.Item>

              <Divider orientation="left">
                <Space className="text-base font-semibold text-gray-700">
                  <div className="inline-flex p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
                    <EnvironmentOutlined className="text-white" />
                  </div>
                  <span>Adres Bilgileri</span>
                </Space>
              </Divider>

              <Form.Item
                label={<span className="font-medium">📍 Adres</span>}
                name="address"
              >
                <TextArea
                  size="large"
                  rows={2}
                  placeholder="Sokak, Mahalle, Bina No, vb."
                  maxLength={200}
                  showCount
                  className="rounded-lg"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label={<span className="font-medium">🏙️ Şehir</span>}
                    name="city"
                  >
                    <Input size="large" placeholder="İstanbul" className="rounded-lg" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label={<span className="font-medium">🗺️ İlçe/Bölge</span>}
                    name="state"
                  >
                    <Input size="large" placeholder="Kadıköy" className="rounded-lg" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label={<span className="font-medium">📮 Posta Kodu</span>}
                    name="postalCode"
                    rules={[
                      { pattern: /^[0-9]{5}$/, message: '5 haneli posta kodu girin' },
                    ]}
                  >
                    <Input size="large" placeholder="34000" className="rounded-lg" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={<span className="font-medium">🌍 Ülke</span>}
                name="country"
              >
                <Select size="large" className="rounded-lg">
                  <Option value="Türkiye">🇹🇷 Türkiye</Option>
                  <Option value="Almanya">🇩🇪 Almanya</Option>
                  <Option value="İngiltere">🇬🇧 İngiltere</Option>
                  <Option value="ABD">🇺🇸 ABD</Option>
                  <Option value="Fransa">🇫🇷 Fransa</Option>
                </Select>
              </Form.Item>
            </div>
          </motion.div>
        )}

        {/* Step 2: Financial Information */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ minHeight: '400px' }}
          >
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <Divider orientation="left" className="!mt-0">
                <Space className="text-base font-semibold text-gray-700">
                  <div className="inline-flex p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                    <DollarOutlined className="text-white" />
                  </div>
                  <span>Mali Bilgiler</span>
                </Space>
              </Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <Space>
                        <span className="font-medium">🆔 Vergi Numarası</span>
                        <Tooltip title="10 veya 11 haneli vergi kimlik numarası">
                          <InfoCircleOutlined className="text-gray-400" />
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
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={
                      <Space>
                        <span className="font-medium">💳 Kredi Limiti</span>
                        <Tooltip title="Müşteriye tanımlanan maksimum alacak limiti">
                          <InfoCircleOutlined className="text-gray-400" />
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
                      className="w-full rounded-lg"
                      placeholder="0"
                      formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value?.replace(/₺\s?|(,*)/g, '') as any}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={<span className="font-medium">📅 Ödeme Koşulları</span>}
                name="paymentTerms"
              >
                <Select size="large" placeholder="Ödeme koşulu seçin" className="rounded-lg">
                  <Option value="Peşin">💵 Peşin Ödeme</Option>
                  <Option value="15 Gün">📆 15 Gün Vadeli</Option>
                  <Option value="30 Gün">📆 30 Gün Vadeli</Option>
                  <Option value="45 Gün">📆 45 Gün Vadeli</Option>
                  <Option value="60 Gün">📆 60 Gün Vadeli</Option>
                  <Option value="90 Gün">📆 90 Gün Vadeli</Option>
                </Select>
              </Form.Item>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="inline-flex p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0">
                    <InfoCircleOutlined className="text-white text-lg" />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-900 mb-2">Mali Bilgiler Hakkında</div>
                    <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                      <li>Vergi numarası müşteri faturalarında kullanılacaktır</li>
                      <li>Kredi limiti, müşterinin maksimum borçlanma tutarını belirler</li>
                      <li>Ödeme koşulları, fatura vadelerini otomatik olarak ayarlar</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Notes & Summary */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ minHeight: '400px' }}
          >
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
              <Divider orientation="left" className="!mt-0">
                <Space className="text-base font-semibold text-gray-700">
                  <div className="inline-flex p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500">
                    <FileTextOutlined className="text-white" />
                  </div>
                  <span>Ek Notlar</span>
                </Space>
              </Divider>

              <Form.Item
                label={<span className="font-medium">📝 Müşteri Notları</span>}
                name="notes"
              >
                <TextArea
                  size="large"
                  rows={6}
                  placeholder="Müşteri hakkında önemli notlar, özel durumlar, tercihler vb..."
                  maxLength={500}
                  showCount
                  className="rounded-lg"
                  style={{ fontSize: '14px' }}
                />
              </Form.Item>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5 mt-6">
                <div className="flex items-start gap-3">
                  <div className="inline-flex p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex-shrink-0">
                    <CheckOutlined className="text-white text-xl" />
                  </div>
                  <div>
                    <div className="font-bold text-green-900 text-lg mb-2">Hazırsınız!</div>
                    <p className="text-sm text-green-800 m-0">
                      Tüm gerekli bilgiler toplandı. "{isEditMode ? 'Güncelle' : 'Oluştur'}" butonuna tıklayarak
                      müşteri kaydını {isEditMode ? 'güncelleyebilirsiniz' : 'oluşturabilirsiniz'}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </Form>

      {/* Footer Buttons with Gradient */}
      <div className="mt-6 flex justify-between items-center pt-6 border-t border-gray-200">
        <Button
          size="large"
          onClick={handleCancel}
          className="rounded-lg px-6 hover:bg-gray-100"
        >
          İptal
        </Button>

        <Space size="middle">
          {currentStep > 0 && (
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={handlePrev}
              className="rounded-lg px-6 hover:bg-gray-100"
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
              className="rounded-lg px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-md"
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
              className="rounded-lg px-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0 shadow-md"
            >
              {isEditMode ? 'Güncelle' : 'Oluştur'}
            </Button>
          )}
        </Space>
      </div>
    </Modal>
  );
}
