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
          title: 'Success',
          content: (
            <div>
              <p><strong>{values.companyName}</strong> has been updated successfully.</p>
            </div>
          ),
          okText: 'OK',
        });
      } else {
        console.log('📤 Calling createCustomer with:', values);
        const result = await createCustomer.mutateAsync(values);
        console.log('✅ Create successful, result:', result);

        // Success alert
        Modal.success({
          title: 'Customer Created',
          content: (
            <div>
              <p><strong>{values.companyName}</strong> has been added to the system.</p>
            </div>
          ),
          okText: 'OK',
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
        message.error('Please fill in all required fields correctly');
        return;
      }

      // API error handling
      let errorTitle = 'Operation Failed';
      let errorMessage = 'An error occurred while saving the customer.';
      let errorDetails: string[] = [];

      // Extract error details from API response
      if (error.response?.data) {
        const apiError = error.response.data;

        // Conflict error (duplicate customer)
        if (apiError.type === 'Conflict' || apiError.code?.includes('Customer.')) {
          errorTitle = 'Duplicate Entry';

          // Check which field caused the conflict
          if (apiError.code === 'Customer.Email') {
            errorMessage = 'A customer with this email address already exists.';
            errorDetails.push('Email: ' + form.getFieldValue('email'));
          } else if (apiError.code === 'Customer.TaxId') {
            errorMessage = 'A customer with this tax ID already exists.';
            errorDetails.push('Tax ID: ' + form.getFieldValue('taxId'));
          } else {
            errorMessage = apiError.description || 'A customer with these details already exists.';
          }
        }
        // Backend validation error
        else if (apiError.type === 'Validation' || apiError.code === 'ValidationError') {
          errorTitle = 'Validation Error';
          errorMessage = apiError.description || apiError.message || 'The data entered is invalid.';

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
          errorTitle = 'System Error';
          errorMessage = 'Customer saved but notification failed. Please contact system administrator.';
        }
        // Generic API error
        else {
          errorMessage = apiError.description || apiError.message || errorMessage;
          if (apiError.code) {
            errorDetails.push(`Error Code: ${apiError.code}`);
          }
        }
      }
      // Network error
      else if (error.message === 'Network Error') {
        errorTitle = 'Connection Error';
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
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
                <strong>Details:</strong>
                <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                  {errorDetails.map((detail, index) => (
                    <li key={index} style={{ color: '#ff4d4f' }}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#8c8c8c' }}>
              If the problem persists, please contact system administrator.
            </div>
          </div>
        ),
        okText: 'OK',
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
      title: 'Basic Information',
      icon: <UserOutlined />,
    },
    {
      title: 'Contact & Address',
      icon: <EnvironmentOutlined />,
    },
    {
      title: 'Financial Details',
      icon: <DollarOutlined />,
    },
    {
      title: 'Notes & Complete',
      icon: <FileTextOutlined />,
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 pb-4">
          <div className="text-lg font-semibold text-gray-800">
            {isEditMode ? 'Edit Customer' : 'New Customer'}
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
              <span className="text-sm font-medium text-gray-600">Customer Type</span>
            </Divider>

            <Form.Item
              name="customerType"
              rules={[{ required: true, message: 'Please select customer type' }]}
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
                      <div className="font-medium text-gray-800">Corporate</div>
                      <div className="text-xs text-gray-500 mt-1">Business entity</div>
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
                      <div className="font-medium text-gray-800">Individual</div>
                      <div className="text-xs text-gray-500 mt-1">Personal account</div>
                    </Card>
                  </Col>
                </Row>
              </Radio.Group>
            </Form.Item>

            <Divider orientation="left" className="!my-6">
              <span className="text-sm font-medium text-gray-600">Basic Details</span>
            </Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">{customerType === 'Corporate' ? 'Company Name' : 'Full Name'}</span>}
                  name="companyName"
                  rules={[
                    { required: true, message: `${customerType === 'Corporate' ? 'Company name' : 'Full name'} is required` },
                    { min: 2, message: 'Must be at least 2 characters' },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder={customerType === 'Corporate' ? 'e.g., ABC Technology Inc.' : 'e.g., John Smith'}
                    prefix={<BankOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">Contact Person</span>}
                  name="contactPerson"
                  rules={[
                    { max: 100, message: 'Maximum 100 characters' },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="e.g., Jane Doe"
                    prefix={<UserOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={<span className="text-sm font-medium text-gray-700">Status</span>}
              name="status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select size="large">
                <Option value="Active">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Active</span>
                  </span>
                </Option>
                <Option value="Inactive">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
                    <span>Inactive</span>
                  </span>
                </Option>
                <Option value="Potential">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
                    <span>Potential</span>
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
              <span className="text-sm font-medium text-gray-600">Contact Information</span>
            </Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">Email Address</span>}
                  name="email"
                  rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Please enter a valid email address' },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="contact@company.com"
                    prefix={<MailOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">Phone Number</span>}
                  name="phone"
                  rules={[
                    { pattern: /^[0-9+\s()-]+$/, message: 'Please enter a valid phone number' },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="+1 (555) 123-4567"
                    prefix={<PhoneOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={<span className="text-sm font-medium text-gray-700">Website</span>}
              name="website"
              rules={[
                { type: 'url', message: 'Please enter a valid URL (must start with http:// or https://)' },
              ]}
            >
              <Input
                size="large"
                placeholder="https://www.company.com"
                prefix={<GlobalOutlined className="text-gray-400" />}
              />
            </Form.Item>

            <Divider orientation="left" className="!my-6">
              <span className="text-sm font-medium text-gray-600">Address</span>
            </Divider>

            <Form.Item
              label={<span className="text-sm font-medium text-gray-700">Street Address</span>}
              name="address"
            >
              <TextArea
                size="large"
                rows={2}
                placeholder="Street, District, Building No., etc."
                maxLength={200}
                showCount
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">City</span>}
                  name="city"
                >
                  <Input size="large" placeholder="Istanbul" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">State/Region</span>}
                  name="state"
                >
                  <Input size="large" placeholder="Kadıköy" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">Postal Code</span>}
                  name="postalCode"
                  rules={[
                    { pattern: /^[0-9]{5}$/, message: 'Please enter a 5-digit postal code' },
                  ]}
                >
                  <Input size="large" placeholder="34000" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={<span className="text-sm font-medium text-gray-700">Country</span>}
              name="country"
            >
              <Select size="large">
                <Option value="Türkiye">Türkiye</Option>
                <Option value="Germany">Germany</Option>
                <Option value="United Kingdom">United Kingdom</Option>
                <Option value="United States">United States</Option>
                <Option value="France">France</Option>
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
              <span className="text-sm font-medium text-gray-600">Financial Information</span>
            </Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <Space>
                      <span className="text-sm font-medium text-gray-700">Tax ID</span>
                      <Tooltip title="10 or 11 digit tax identification number">
                        <InfoCircleOutlined className="text-gray-400" />
                      </Tooltip>
                    </Space>
                  }
                  name="taxId"
                  rules={[
                    { pattern: /^[0-9]{10,11}$/, message: 'Please enter a 10 or 11 digit tax ID' },
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
                      <span className="text-sm font-medium text-gray-700">Credit Limit</span>
                      <Tooltip title="Maximum credit limit assigned to customer">
                        <InfoCircleOutlined className="text-gray-400" />
                      </Tooltip>
                    </Space>
                  }
                  name="creditLimit"
                  rules={[
                    { type: 'number', min: 0, message: 'Credit limit cannot be negative' },
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
              label={<span className="text-sm font-medium text-gray-700">Payment Terms</span>}
              name="paymentTerms"
            >
              <Select size="large" placeholder="Select payment terms">
                <Option value="Immediate">Immediate Payment</Option>
                <Option value="15 Days">Net 15 Days</Option>
                <Option value="30 Days">Net 30 Days</Option>
                <Option value="45 Days">Net 45 Days</Option>
                <Option value="60 Days">Net 60 Days</Option>
                <Option value="90 Days">Net 90 Days</Option>
              </Select>
            </Form.Item>

            <Alert
              message="Financial Information"
              description={
                <ul className="text-sm text-gray-600 mt-2 ml-4 space-y-1 list-disc">
                  <li>Tax ID will be used on customer invoices</li>
                  <li>Credit limit determines the maximum debt amount</li>
                  <li>Payment terms automatically set invoice due dates</li>
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
              <span className="text-sm font-medium text-gray-600">Additional Notes</span>
            </Divider>

            <Form.Item
              label={<span className="text-sm font-medium text-gray-700">Customer Notes</span>}
              name="notes"
            >
              <TextArea
                size="large"
                rows={8}
                placeholder="Important notes about the customer, special conditions, preferences, etc..."
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Alert
              message="Ready to Submit"
              description={`All required information has been collected. Click "${isEditMode ? 'Update' : 'Create'}" to ${isEditMode ? 'update the customer record' : 'create the customer account'}.`}
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
          Cancel
        </Button>

        <Space>
          {currentStep > 0 && (
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={handlePrev}
            >
              Back
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
              Next
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
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          )}
        </Space>
      </div>
    </Modal>
  );
}
