'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Form,
  Button,
  Card,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Typography,
  Divider,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
  WalletOutlined,
  BankOutlined,
  CreditCardOutlined,
  DollarOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useCreateSupplierPayment, useSuppliers, usePurchaseInvoices } from '@/lib/api/hooks/usePurchase';
import { PaymentMethod, PurchaseInvoiceStatus } from '@/lib/api/services/purchase.types';
import type { SupplierPaymentType } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const typeOptions = [
  { value: 'Standard', label: 'Standart Ödeme' },
  { value: 'Advance', label: 'Avans' },
  { value: 'Partial', label: 'Kısmi Ödeme' },
  { value: 'Final', label: 'Son Ödeme' },
  { value: 'Refund', label: 'İade' },
];

const methodOptions = [
  { value: 'Cash', label: 'Nakit', icon: <DollarOutlined /> },
  { value: 'BankTransfer', label: 'Havale/EFT', icon: <BankOutlined /> },
  { value: 'CreditCard', label: 'Kredi Kartı', icon: <CreditCardOutlined /> },
  { value: 'Check', label: 'Çek', icon: <WalletOutlined /> },
  { value: 'DirectDebit', label: 'Otomatik Ödeme', icon: <SyncOutlined /> },
  { value: 'Other', label: 'Diğer', icon: <WalletOutlined /> },
];

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
];

export default function NewSupplierPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');
  const [form] = Form.useForm();

  const createPayment = useCreateSupplierPayment();
  const { data: suppliersData } = useSuppliers({ pageSize: 1000 });
  const { data: invoicesData } = usePurchaseInvoices({ pageSize: 1000, status: PurchaseInvoiceStatus.Approved });

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.BankTransfer);
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');

  const suppliers = suppliersData?.items || [];
  const invoices = invoicesData?.items || [];

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      // Find the supplier and set it
      const supplier = suppliers.find(s => s.name === invoice.supplierName);
      form.setFieldsValue({
        supplierId: supplier?.id,
        amount: invoice.remainingAmount,
        purchaseInvoiceId: invoiceId,
        purchaseInvoiceNumber: invoice.invoiceNumber,
      });
    }
  };

  const handleSave = async (values: any) => {
    try {
      await createPayment.mutateAsync({
        ...values,
        paymentDate: values.paymentDate?.toISOString(),
        checkDate: values.checkDate?.toISOString(),
        currency: selectedCurrency,
        method: selectedMethod,
      });
      message.success('Ödeme başarıyla oluşturuldu');
      router.push('/purchase/payments');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push('/purchase/payments');
  };

  const isLoading = createPayment.isPending;
  const showBankFields = ['BankTransfer', 'DirectDebit'].includes(selectedMethod);
  const showCheckFields = selectedMethod === 'Check';

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <WalletOutlined style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">
                  Yeni Tedarikçi Ödemesi
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  Tedarikçiye ödeme kaydı oluşturun
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => form.submit()}
              loading={isLoading}
              className="px-6"
            >
              Kaydet
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            paymentDate: dayjs(),
            type: 'Standard',
            method: 'BankTransfer',
            currency: 'TRY',
            exchangeRate: 1,
            amount: 0,
          }}
        >
          <Row gutter={24}>
            {/* Left Column */}
            <Col xs={24} lg={14}>
              {/* Basic Info */}
              <Card title="Temel Bilgiler" className="mb-6">
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="supplierId"
                      label="Tedarikçi"
                      rules={[{ required: true, message: 'Tedarikçi seçin' }]}
                    >
                      <Select
                        placeholder="Tedarikçi seçin"
                        showSearch
                        optionFilterProp="children"
                      >
                        {suppliers.map(supplier => (
                          <Select.Option key={supplier.id} value={supplier.id}>
                            {supplier.code} - {supplier.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="purchaseInvoiceId" label="İlişkili Fatura">
                      <Select
                        placeholder="Fatura seçin (opsiyonel)"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        onChange={handleInvoiceSelect}
                      >
                        {invoices.map(invoice => (
                          <Select.Option key={invoice.id} value={invoice.id}>
                            {invoice.invoiceNumber} - {invoice.supplierName} ({invoice.remainingAmount.toLocaleString('tr-TR')} ₺)
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="paymentDate"
                      label="Ödeme Tarihi"
                      rules={[{ required: true, message: 'Tarih seçin' }]}
                    >
                      <DatePicker className="w-full" format="DD.MM.YYYY" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="type" label="Ödeme Tipi">
                      <Select>
                        {typeOptions.map(opt => (
                          <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="method" label="Ödeme Yöntemi">
                      <Select onChange={(value) => setSelectedMethod(value)}>
                        {methodOptions.map(opt => (
                          <Select.Option key={opt.value} value={opt.value}>
                            <span className="flex items-center gap-2">
                              {opt.icon} {opt.label}
                            </span>
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Amount */}
              <Card title="Tutar Bilgileri" className="mb-6">
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="amount"
                      label="Ödeme Tutarı"
                      rules={[{ required: true, message: 'Tutar girin' }]}
                    >
                      <InputNumber
                        min={0}
                        step={0.01}
                        className="w-full"
                        placeholder="0.00"
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item name="currency" label="Para Birimi">
                      <Select onChange={(value) => setSelectedCurrency(value)}>
                        {currencyOptions.map(opt => (
                          <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  {selectedCurrency !== 'TRY' && (
                    <Col xs={24} md={6}>
                      <Form.Item name="exchangeRate" label="Döviz Kuru">
                        <InputNumber
                          min={0}
                          step={0.0001}
                          className="w-full"
                          placeholder="1.00"
                        />
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              </Card>

              {/* Bank Details */}
              {showBankFields && (
                <Card title="Banka Bilgileri" className="mb-6">
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item name="bankName" label="Banka Adı">
                        <Input placeholder="Banka adı" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="bankAccountNumber" label="Hesap No">
                        <Input placeholder="Hesap numarası" />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item name="iban" label="IBAN">
                        <Input placeholder="TR00 0000 0000 0000 0000 0000 00" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="swiftCode" label="SWIFT Kodu">
                        <Input placeholder="SWIFT kodu" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              )}

              {/* Check Details */}
              {showCheckFields && (
                <Card title="Çek Bilgileri" className="mb-6">
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item name="checkNumber" label="Çek No">
                        <Input placeholder="Çek numarası" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="checkDate" label="Çek Tarihi">
                        <DatePicker className="w-full" format="DD.MM.YYYY" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="bankName" label="Banka">
                        <Input placeholder="Çekin bankası" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              )}

              {/* Notes */}
              <Card title="Notlar" className="mb-6">
                <Form.Item name="description" label="Açıklama">
                  <TextArea rows={2} placeholder="Ödeme açıklaması..." />
                </Form.Item>
                <Form.Item name="notes" label="Genel Not">
                  <TextArea rows={2} placeholder="Genel notlar..." />
                </Form.Item>
                <Form.Item name="internalNotes" label="Dahili Not">
                  <TextArea rows={2} placeholder="Dahili not (müşteriye gösterilmez)..." />
                </Form.Item>
              </Card>
            </Col>

            {/* Right Column - Summary */}
            <Col xs={24} lg={10}>
              <Card title="Özet" className="mb-6 sticky top-28">
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Ödeme Tutarı</div>
                    <div className="text-3xl font-bold text-green-600">
                      {(form.getFieldValue('amount') || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {selectedCurrency === 'TRY' ? '₺' : selectedCurrency}
                    </div>
                  </div>

                  <Divider />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Text type="secondary">Ödeme Yöntemi</Text>
                      <Text strong>
                        {methodOptions.find(m => m.value === selectedMethod)?.label || '-'}
                      </Text>
                    </div>
                    <div className="flex justify-between">
                      <Text type="secondary">Para Birimi</Text>
                      <Text strong>{selectedCurrency}</Text>
                    </div>
                  </div>

                  <Divider />

                  <div className="text-xs text-gray-500">
                    <p className="mb-2">
                      • Ödeme kaydedildikten sonra onay sürecine gönderilecektir.
                    </p>
                    <p className="mb-2">
                      • Onaylanan ödemeler işlendikten sonra tamamlanmış olarak işaretlenebilir.
                    </p>
                    <p>
                      • Banka mutabakatı için işlendikten sonra mutabakat yapılması gerekir.
                    </p>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}
