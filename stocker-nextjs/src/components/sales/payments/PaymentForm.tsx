'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Typography,
  DatePicker,
  Divider,
  Card,
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  BankOutlined,
  FileTextOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import { useInvoices } from '@/lib/api/hooks/useInvoices';
import type { Customer } from '@/lib/api/services/crm.service';
import type { Payment } from '@/lib/api/services/payment.service';
import dayjs from 'dayjs';

const { Text } = Typography;

interface PaymentFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: Payment;
  onFinish: (values: any) => void;
  loading?: boolean;
  preselectedInvoiceId?: string;
}

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

const methodOptions = [
  { value: 'Cash', label: 'Nakit' },
  { value: 'BankTransfer', label: 'Havale/EFT' },
  { value: 'CreditCard', label: 'Kredi Kartı' },
  { value: 'DebitCard', label: 'Banka Kartı' },
  { value: 'Check', label: 'Çek' },
  { value: 'DirectDebit', label: 'Otomatik Ödeme' },
  { value: 'Other', label: 'Diğer' },
];

export default function PaymentForm({ form, initialValues, onFinish, loading, preselectedInvoiceId }: PaymentFormProps) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();

  // Fetch customers
  const { data: customersData, isLoading: customersLoading } = useCustomers({
    searchTerm: customerSearch,
    status: 'Active',
    pageSize: 50,
  });

  // Fetch invoices for selected customer
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices({
    customerId: selectedCustomerId,
    status: 'Issued,Sent,PartiallyPaid,Overdue',
    pageSize: 100,
  });

  const customerOptions = useMemo(() =>
    customersData?.items?.map((customer: Customer) => ({
      value: customer.id.toString(),
      label: customer.companyName || customer.contactPerson,
      customer,
    })) || [], [customersData]);

  const invoiceOptions = useMemo(() =>
    invoicesData?.items?.map((invoice) => ({
      value: invoice.id,
      label: `${invoice.invoiceNumber} - ${invoice.customerName} - ${invoice.balanceDue.toLocaleString('tr-TR')} ${invoice.currency}`,
      invoice,
    })) || [], [invoicesData]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        customerId: initialValues.customerId,
        invoiceId: initialValues.invoiceId,
        paymentDate: initialValues.paymentDate ? dayjs(initialValues.paymentDate) : dayjs(),
        currency: initialValues.currency || 'TRY',
        method: initialValues.method || 'BankTransfer',
        amount: initialValues.amount,
        reference: initialValues.reference,
        description: initialValues.description,
        bankAccountName: initialValues.bankAccountName,
        transactionId: initialValues.transactionId,
      });
      setSelectedCurrency(initialValues.currency || 'TRY');
      setSelectedCustomerId(initialValues.customerId || undefined);
    } else {
      form.setFieldsValue({
        paymentDate: dayjs(),
        currency: 'TRY',
        method: 'BankTransfer',
      });
      // If preselected invoice, set it
      if (preselectedInvoiceId) {
        form.setFieldValue('invoiceId', preselectedInvoiceId);
      }
    }
  }, [form, initialValues, preselectedInvoiceId]);

  const handleCustomerSelect = (value: string) => {
    setSelectedCustomerId(value);
    // Clear invoice selection when customer changes
    form.setFieldValue('invoiceId', undefined);
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoiceOptions.find((opt: { value: string }) => opt.value === invoiceId)?.invoice;
    if (invoice) {
      form.setFieldsValue({
        customerId: invoice.customerId,
        amount: invoice.balanceDue,
        currency: invoice.currency,
      });
      setSelectedCurrency(invoice.currency);
      setSelectedCustomerId(invoice.customerId || undefined);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: selectedCurrency
    }).format(amount);

  const amount = Form.useWatch('amount', form) || 0;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="payment-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Payment Summary (35%) */}
        <Col xs={24} lg={9}>
          {/* Payment Amount Card */}
          <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <DollarOutlined className="text-green-600" />
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Ödeme Tutarı
              </Text>
            </div>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-green-600">
                {formatCurrency(amount)}
              </div>
              <Text type="secondary" className="text-sm mt-2 block">
                Bu tutarı almak üzeresiniz
              </Text>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FileTextOutlined className="text-gray-500" />
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Açıklama
              </Text>
            </div>
            <Form.Item name="description" className="mb-0">
              <Input.TextArea
                rows={4}
                placeholder="Ödeme hakkında notlar..."
                style={{ resize: 'none' }}
              />
            </Form.Item>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-gray-50/70 rounded-xl text-center">
                <div className="text-sm font-semibold text-gray-800">
                  {initialValues.paymentNumber}
                </div>
                <div className="text-xs text-gray-500 mt-1">Ödeme No</div>
              </div>
              <div className="p-4 bg-gray-50/70 rounded-xl text-center">
                <div className="text-sm font-semibold text-gray-800">
                  {initialValues.status}
                </div>
                <div className="text-xs text-gray-500 mt-1">Durum</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (65%) */}
        <Col xs={24} lg={15}>
          {/* Customer & Invoice Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <UserOutlined className="text-gray-500" />
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Müşteri ve Fatura
              </Text>
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="customerId"
                  rules={[{ required: true, message: 'Müşteri seçimi zorunludur' }]}
                  className="mb-3"
                >
                  <Select
                    showSearch
                    placeholder="Müşteri seçin veya arayın"
                    loading={customersLoading}
                    filterOption={false}
                    onSearch={setCustomerSearch}
                    onChange={handleCustomerSelect}
                    options={customerOptions}
                    size="large"
                    notFoundContent={customersLoading ? 'Yükleniyor...' : 'Müşteri bulunamadı'}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="invoiceId" className="mb-3">
                  <Select
                    showSearch
                    placeholder="Fatura seçin (opsiyonel)"
                    loading={invoicesLoading}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={handleInvoiceSelect}
                    options={invoiceOptions}
                    size="large"
                    allowClear
                    notFoundContent={invoicesLoading ? 'Yükleniyor...' : 'Bekleyen fatura yok'}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Date and Currency */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <CalendarOutlined className="text-gray-500" />
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Tarih ve Para Birimi
              </Text>
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="paymentDate"
                  rules={[{ required: true, message: 'Zorunlu' }]}
                  className="mb-3"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Ödeme Tarihi"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="currency" className="mb-3">
                  <Select
                    options={currencyOptions}
                    size="large"
                    onChange={setSelectedCurrency}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Payment Method and Amount */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <CreditCardOutlined className="text-gray-500" />
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Ödeme Detayları
              </Text>
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Ödeme Yöntemi *</div>
                <Form.Item
                  name="method"
                  rules={[{ required: true, message: 'Zorunlu' }]}
                  className="mb-3"
                >
                  <Select options={methodOptions} size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Tutar *</div>
                <Form.Item
                  name="amount"
                  rules={[{ required: true, message: 'Zorunlu' }]}
                  className="mb-3"
                >
                  <InputNumber
                    min={0}
                    precision={2}
                    style={{ width: '100%' }}
                    placeholder="0.00"
                    size="large"
                    prefix={selectedCurrency === 'TRY' ? '₺' : selectedCurrency === 'USD' ? '$' : '€'}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <div className="text-xs text-gray-400 mb-1">Referans</div>
                <Form.Item name="reference" className="mb-3">
                  <Input placeholder="Ödeme referans numarası" size="large" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Bank Details */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <BankOutlined className="text-gray-500" />
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Banka Bilgileri
              </Text>
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Banka Hesabı</div>
                <Form.Item name="bankAccountName" className="mb-3">
                  <Input placeholder="Banka hesap adı" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">İşlem Numarası</div>
                <Form.Item name="transactionId" className="mb-3">
                  <Input placeholder="Banka işlem numarası" size="large" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </Form>
  );
}
