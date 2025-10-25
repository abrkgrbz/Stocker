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
        <div className="flex items-center gap-3 pb-4">
          <div className="text-lg font-semibold text-gray-800">
            {isEditMode ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
          </div>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      width={800}
      destroyOnClose
      footer={null}
      styles={{ body: { paddingTop: 24 } }}
    >
      {/* Progress Steps */}
      <div className="mb-8">
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
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ minHeight: '380px' }}
          >
            <Divider orientation="left" className="!mt-0 !mb-6">
              <span className="text-sm font-medium text-gray-600">Müşteri Tipi</span>
            </Divider>

            <Form.Item
              name="customerType"
              rules={[{ required: true, message: 'Lütfen müşteri tipi seçiniz' }]}
            >
              <Radio.Group className="w-full">
                <Row gutter={16}>
                  <Col span={12}>
                    <Card
                      hoverable
                      className={`text-center cursor-pointer transition-all ${
                        customerType === 'Corporate'
                          ? 'border-blue-500 shadow-md'
                          : 'border-gray-200'
                      }`}
                      onClick={() => form.setFieldValue('customerType', 'Corporate')}
                    >
                      <Radio value="Corporate" className="hidden" />
                      <BankOutlined className="text-3xl text-gray-600 mb-2" />
                      <div className="font-medium text-gray-800">Kurumsal</div>
                      <div className="text-xs text-gray-500 mt-1">İşletme</div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      hoverable
                      className={`text-center cursor-pointer transition-all ${
                        customerType === 'Individual'
                          ? 'border-blue-500 shadow-md'
                          : 'border-gray-200'
                      }`}
                      onClick={() => form.setFieldValue('customerType', 'Individual')}
                    >
                      <Radio value="Individual" className="hidden" />
                      <UserOutlined className="text-3xl text-gray-600 mb-2" />
                      <div className="font-medium text-gray-800">Bireysel</div>
                      <div className="text-xs text-gray-500 mt-1">Şahıs</div>
                    </Card>
                  </Col>
                </Row>
              </Radio.Group>
            </Form.Item>

            <Divider orientation="left" className="!my-6">
              <span className="text-sm font-medium text-gray-600">Temel Bilgiler</span>
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
              <span className="text-sm font-medium text-gray-600">İletişim Bilgileri</span>
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
              <span className="text-sm font-medium text-gray-600">Adres Bilgileri</span>
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
              <span className="text-sm font-medium text-gray-600">Mali Bilgiler</span>
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
              <span className="text-sm font-medium text-gray-600">Ek Notlar</span>
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

      {/* Footer Buttons */}
      <div className="mt-6 flex justify-between items-center pt-6 border-t border-gray-200">
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
