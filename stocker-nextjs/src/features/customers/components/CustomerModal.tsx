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
  Card,
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
  PlusOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useCRM';
import type { Customer } from '@/lib/api/services/crm.service';
import { getCityNames, getDistrictsByCity } from '@/lib/data/turkey-cities';

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
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [districts, setDistricts] = useState<string[]>([]);

  const isEditMode = !!customer;
  const customerType = Form.useWatch('customerType', form);

  // Get city names for dropdown
  const cityNames = getCityNames();

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

      // Load districts for existing city
      if (customer.city) {
        setSelectedCity(customer.city);
        setDistricts(getDistrictsByCity(customer.city));
      }

      setCurrentStep(0);
    } else if (open) {
      form.resetFields();
      form.setFieldsValue({
        customerType: 'Corporate',
        status: 'Active',
        country: 'Türkiye',
        creditLimit: 0,
      });
      setSelectedCity('');
      setDistricts([]);
      setCurrentStep(0);
    }
  }, [open, customer, form]);

  // Handle city selection change
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    const cityDistricts = getDistrictsByCity(city);
    setDistricts(cityDistricts);

    // Reset district when city changes
    form.setFieldsValue({ state: undefined });
  };

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
          title: 'Başarılı',
          content: (
            <div>
              <p><strong>{values.companyName}</strong> başarıyla güncellendi.</p>
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
          title: 'Müşteri Oluşturuldu',
          content: (
            <div>
              <p><strong>{values.companyName}</strong> sisteme eklendi.</p>
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

      // DEBUG: Always show an alert to test
      console.log('🔴 About to show error alert...');

      // Check if it's a validation error (form fields not filled correctly)
      if (error.errorFields) {
        console.log('📋 Validation errors:', error.errorFields);
        // Show first field error
        const firstError = error.errorFields[0];
        const fieldLabel = firstError.name.join('.');
        const fieldError = firstError.errors[0];
        message.error(`${fieldLabel}: ${fieldError}`);
        return;
      }

      // API error handling
      let errorTitle = 'İşlem Başarısız';
      let errorMessage = 'Müşteri kaydedilirken bir hata oluştu.';
      let errorDetails: string[] = [];

      // Extract error details from API response
      if (error.response?.data) {
        const apiError = error.response.data;

        // Conflict error (duplicate customer)
        if (apiError.type === 'Conflict' || apiError.code?.includes('Customer.')) {
          errorTitle = 'Müşteri Zaten Mevcut';

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
          errorTitle = 'Geçersiz Veri';
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
          errorTitle = 'Sistem Hatası';
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
        errorTitle = 'Bağlantı Hatası';
        errorMessage = 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.';
      }
      // Fallback for any other error
      else if (error.message) {
        errorMessage = error.message;
        console.log('⚠️ Unhandled error type:', error);
      }

      console.log('🔴 Showing error message with:', { errorTitle, errorMessage, errorDetails });

      // Show error using message.error for better Next.js App Router compatibility
      if (errorDetails.length > 0) {
        // Show detailed error
        const detailText = errorDetails.join(' • ');
        message.error({
          content: (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{errorTitle}</div>
              <div>{errorMessage}</div>
              <div style={{ fontSize: 12, marginTop: 4, color: '#ff4d4f' }}>{detailText}</div>
            </div>
          ),
          duration: 8,
        });
      } else {
        // Show simple error
        message.error({
          content: (
            <div>
              <div style={{ fontWeight: 600 }}>{errorTitle}</div>
              <div>{errorMessage}</div>
            </div>
          ),
          duration: 6,
        });
      }
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
        <div className="relative overflow-hidden -m-6 mb-0">
          {/* Gradient Header Background */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8 pb-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/50 shadow-lg">
                {isEditMode ? (
                  <UserOutlined className="text-2xl text-white" />
                ) : (
                  <PlusOutlined className="text-2xl text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {isEditMode ? 'Müşteri Bilgilerini Düzenle' : 'Yeni Müşteri Ekle'}
                </h2>
                <p className="text-white/80 text-sm">
                  {isEditMode
                    ? 'Müşteri bilgilerini güncelleyin'
                    : 'Adım adım müşteri bilgilerini girin'}
                </p>
              </div>
            </div>
          </div>

          {/* Wave SVG Decoration */}
          <svg
            className="absolute bottom-0 left-0 w-full"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            style={{ height: '40px' }}
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
              fill="#ffffff"
            />
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
              fill="#ffffff"
            />
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      width={850}
      destroyOnHidden
      footer={null}
      styles={{ body: { paddingTop: 0 } }}
      className="modern-customer-modal"
    >
      {/* Progress Steps with Modern Design */}
      <div className="mb-8 mt-6">
        <Steps
          current={currentStep}
          items={steps}
          size="default"
          labelPlacement="vertical"
          className="modern-steps"
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
            style={{ minHeight: '380px' }}
          >
            <Divider orientation="left" className="!mt-0 !mb-6">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ✨ Müşteri Tipi
              </span>
            </Divider>

            <Form.Item
              name="customerType"
              rules={[{ required: true, message: 'Lütfen müşteri tipi seçiniz' }]}
            >
              <Radio.Group className="w-full">
                <Row gutter={16}>
                  <Col span={12}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Card
                        hoverable
                        className={`text-center cursor-pointer transition-all duration-300 ${
                          customerType === 'Corporate'
                            ? 'border-2 border-blue-500 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50'
                            : 'border-2 border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => form.setFieldValue('customerType', 'Corporate')}
                      >
                        <Radio value="Corporate" className="hidden" />
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                          customerType === 'Corporate'
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                            : 'bg-gray-100'
                        }`}>
                          <BankOutlined className={`text-3xl ${customerType === 'Corporate' ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="font-bold text-gray-800 text-lg">Kurumsal</div>
                        <div className="text-xs text-gray-500 mt-1">Şirket & İşletme</div>
                      </Card>
                    </motion.div>
                  </Col>
                  <Col span={12}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Card
                        hoverable
                        className={`text-center cursor-pointer transition-all duration-300 ${
                          customerType === 'Individual'
                            ? 'border-2 border-green-500 shadow-lg bg-gradient-to-br from-green-50 to-blue-50'
                            : 'border-2 border-gray-200 hover:border-green-300'
                        }`}
                        onClick={() => form.setFieldValue('customerType', 'Individual')}
                      >
                        <Radio value="Individual" className="hidden" />
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                          customerType === 'Individual'
                            ? 'bg-gradient-to-br from-green-500 to-blue-600'
                            : 'bg-gray-100'
                        }`}>
                          <UserOutlined className={`text-3xl ${customerType === 'Individual' ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="font-bold text-gray-800 text-lg">Bireysel</div>
                        <div className="text-xs text-gray-500 mt-1">Şahıs & Kişi</div>
                      </Card>
                    </motion.div>
                  </Col>
                </Row>
              </Radio.Group>
            </Form.Item>

            <Divider orientation="left" className="!my-6">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📝 Temel Bilgiler
              </span>
            </Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">{customerType === 'Corporate' ? 'Firma Adı' : 'Ad Soyad'}</span>}
                  name="companyName"
                  rules={[
                    { required: true, message: `${customerType === 'Corporate' ? 'Firma adı' : 'Ad soyad'} gereklidir` },
                    { min: 2, message: 'En az 2 karakter olmalıdır' },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder={customerType === 'Corporate' ? 'Örn: ABC Teknoloji A.Ş.' : 'Örn: Ahmet Yılmaz'}
                    prefix={<BankOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">İrtibat Kişisi</span>}
                  name="contactPerson"
                  rules={[
                    { max: 100, message: 'En fazla 100 karakter olabilir' },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Örn: Mehmet Demir"
                    prefix={<UserOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={<span className="text-sm font-medium text-gray-700">Durum</span>}
              name="status"
              rules={[{ required: true, message: 'Lütfen durum seçiniz' }]}
            >
              <Select size="large">
                <Option value="Active">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Aktif</span>
                  </span>
                </Option>
                <Option value="Inactive">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
                    <span>Pasif</span>
                  </span>
                </Option>
                <Option value="Potential">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
                    <span>Potansiyel</span>
                  </span>
                </Option>
              </Select>
            </Form.Item>
          </motion.div>
        )}

        {/* Step 1: Contact & Address */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ minHeight: '380px' }}
          >
            <Divider orientation="left" className="!mt-0 !mb-6">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📧 İletişim Bilgileri
              </span>
            </Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">E-posta Adresi</span>}
                  name="email"
                  rules={[
                    { required: true, message: 'E-posta gereklidir' },
                    { type: 'email', message: 'Geçerli bir e-posta adresi girin' },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="ornek@firma.com"
                    prefix={<MailOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">Telefon Numarası</span>}
                  name="phone"
                  rules={[
                    { pattern: /^[0-9+\s()-]+$/, message: 'Geçerli bir telefon numarası girin' },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="+90 (555) 123-4567"
                    prefix={<PhoneOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={<span className="text-sm font-medium text-gray-700">Website</span>}
              name="website"
              rules={[
                { type: 'url', message: 'Geçerli bir website adresi girin (http:// veya https:// ile başlamalı)' },
              ]}
            >
              <Input
                size="large"
                placeholder="https://www.firma.com"
                prefix={<GlobalOutlined className="text-gray-400" />}
              />
            </Form.Item>

            <Divider orientation="left" className="!my-6">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🌍 Adres Bilgileri
              </span>
            </Divider>

            <Form.Item
              label={<span className="text-sm font-medium text-gray-700">Adres</span>}
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
                  label={<span className="text-sm font-medium text-gray-700">Şehir</span>}
                  name="city"
                >
                  <Select
                    size="large"
                    placeholder="Şehir seçiniz"
                    showSearch
                    optionFilterProp="children"
                    onChange={handleCityChange}
                  >
                    {cityNames.map((city) => (
                      <Option key={city} value={city}>
                        {city}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">İlçe/Bölge</span>}
                  name="state"
                >
                  <Select
                    size="large"
                    placeholder={selectedCity ? 'İlçe seçiniz' : 'Önce şehir seçiniz'}
                    showSearch
                    optionFilterProp="children"
                    disabled={!selectedCity}
                  >
                    {districts.map((district) => (
                      <Option key={district} value={district}>
                        {district}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">Posta Kodu</span>}
                  name="postalCode"
                  rules={[
                    { pattern: /^[0-9]{5}$/, message: '5 haneli posta kodu girin' },
                  ]}
                >
                  <Input size="large" placeholder="34000" maxLength={10} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={<span className="text-sm font-medium text-gray-700">Ülke</span>}
              name="country"
            >
              <Select size="large">
                <Option value="Türkiye">Türkiye</Option>
                <Option value="Germany">Almanya</Option>
                <Option value="United Kingdom">İngiltere</Option>
                <Option value="United States">Amerika</Option>
                <Option value="France">Fransa</Option>
              </Select>
            </Form.Item>
          </motion.div>
        )}

        {/* Step 2: Financial Information */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ minHeight: '380px' }}
          >
            <Divider orientation="left" className="!mt-0 !mb-6">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                💰 Mali Bilgiler
              </span>
            </Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <Space>
                      <span className="text-sm font-medium text-gray-700">Vergi Numarası</span>
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
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={
                    <Space>
                      <span className="text-sm font-medium text-gray-700">Kredi Limiti</span>
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
              label={<span className="text-sm font-medium text-gray-700">Ödeme Koşulları</span>}
              name="paymentTerms"
            >
              <Select size="large" placeholder="Ödeme koşulu seçin">
                <Option value="Immediate">Peşin Ödeme</Option>
                <Option value="15 Days">15 Gün Vadeli</Option>
                <Option value="30 Days">30 Gün Vadeli</Option>
                <Option value="45 Days">45 Gün Vadeli</Option>
                <Option value="60 Days">60 Gün Vadeli</Option>
                <Option value="90 Days">90 Gün Vadeli</Option>
              </Select>
            </Form.Item>

            <Alert
              message="Mali Bilgiler Hakkında"
              description={
                <ul className="text-sm text-gray-600 mt-2 ml-4 space-y-1 list-disc">
                  <li>Vergi numarası müşteri faturalarında kullanılacaktır</li>
                  <li>Kredi limiti, müşterinin maksimum borçlanma tutarını belirler</li>
                  <li>Ödeme koşulları, fatura vadelerini otomatik olarak ayarlar</li>
                </ul>
              }
              type="info"
              showIcon
              className="mt-6"
            />
          </motion.div>
        )}

        {/* Step 3: Notes & Summary */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ minHeight: '380px' }}
          >
            <Divider orientation="left" className="!mt-0 !mb-6">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📄 Ek Notlar
              </span>
            </Divider>

            <Form.Item
              label={<span className="text-sm font-medium text-gray-700">Müşteri Notları</span>}
              name="notes"
            >
              <TextArea
                size="large"
                rows={8}
                placeholder="Müşteri hakkında önemli notlar, özel durumlar, tercihler vb..."
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Alert
              message="Tamamlamaya Hazır"
              description={`Tüm gerekli bilgiler toplandı. "${isEditMode ? 'Güncelle' : 'Oluştur'}" butonuna tıklayarak müşteri kaydını ${isEditMode ? 'güncelleyebilirsiniz' : 'oluşturabilirsiniz'}.`}
              type="success"
              showIcon
              className="mt-6"
            />
          </motion.div>
        )}
      </Form>

      {/* Footer Buttons with Modern Design */}
      <div className="mt-8 flex justify-between items-center pt-6 border-t-2 border-gradient-to-r from-blue-200 to-purple-200">
        <Button
          size="large"
          onClick={handleCancel}
          className="hover:border-red-400 hover:text-red-500 transition-all duration-300"
        >
          İptal
        </Button>

        <Space size="middle">
          {currentStep > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={handlePrev}
                className="shadow-md hover:shadow-lg transition-all duration-300"
              >
                Geri
              </Button>
            </motion.div>
          )}

          {currentStep < steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={handleNext}
                iconPosition="end"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                İleri
              </Button>
            </motion.div>
          )}

          {currentStep === steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                type="primary"
                size="large"
                icon={<CheckOutlined />}
                onClick={handleSubmit}
                loading={createCustomer.isPending || updateCustomer.isPending}
                iconPosition="end"
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isEditMode ? '✓ Güncelle' : '✓ Oluştur'}
              </Button>
            </motion.div>
          )}
        </Space>
      </div>
    </Modal>
  );
}
