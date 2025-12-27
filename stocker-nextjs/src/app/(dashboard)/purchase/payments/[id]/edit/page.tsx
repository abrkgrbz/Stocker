'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Form,
  Button,
  Card,
  Input,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Typography,
  Spin,
  Empty,
  Divider,
  message,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  WalletIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useSupplierPayment, useUpdateSupplierPayment } from '@/lib/api/hooks/usePurchase';
import { PaymentMethod } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const methodLabels: Record<PaymentMethod, string> = {
  Cash: 'Nakit',
  BankTransfer: 'Havale/EFT',
  CreditCard: 'Kredi Kartı',
  Check: 'Çek',
  DirectDebit: 'Otomatik Ödeme',
  Other: 'Diğer',
};

const typeLabels: Record<string, string> = {
  Standard: 'Standart',
  Advance: 'Avans',
  Partial: 'Kısmi',
  Final: 'Son',
  Refund: 'İade',
};

export default function EditSupplierPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;
  const [form] = Form.useForm();

  const { data: payment, isLoading: paymentLoading } = useSupplierPayment(paymentId);
  const updatePayment = useUpdateSupplierPayment();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.BankTransfer);

  useEffect(() => {
    if (payment) {
      setSelectedMethod(payment.method as PaymentMethod);
      form.setFieldsValue({
        paymentDate: payment.paymentDate ? dayjs(payment.paymentDate) : null,
        amount: payment.amount,
        exchangeRate: payment.exchangeRate,
        bankName: payment.bankName,
        bankAccountNumber: payment.bankAccountNumber,
        iban: payment.iban,
        swiftCode: payment.swiftCode,
        checkNumber: payment.checkNumber,
        checkDate: payment.checkDate ? dayjs(payment.checkDate) : null,
        description: payment.description,
        notes: payment.notes,
        internalNotes: payment.internalNotes,
      });
    }
  }, [payment, form]);

  if (paymentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-8">
        <Empty description="Ödeme belgesi bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/purchase/payments')}>
            Ödemelere Dön
          </Button>
        </div>
      </div>
    );
  }

  if (payment.status !== 'Draft') {
    return (
      <div className="p-8">
        <Empty description="Bu ödeme düzenlenemez. Sadece taslak ödemeler düzenlenebilir." />
        <div className="text-center mt-4">
          <Button onClick={() => router.push(`/purchase/payments/${paymentId}`)}>
            Ödemeye Dön
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = async (values: any) => {
    try {
      await updatePayment.mutateAsync({
        id: paymentId,
        data: {
          paymentDate: values.paymentDate?.toISOString(),
          amount: values.amount,
          exchangeRate: values.exchangeRate,
          bankName: values.bankName,
          bankAccountNumber: values.bankAccountNumber,
          iban: values.iban,
          swiftCode: values.swiftCode,
          checkNumber: values.checkNumber,
          checkDate: values.checkDate?.toISOString(),
          description: values.description,
          notes: values.notes,
          internalNotes: values.internalNotes,
        },
      });
      message.success('Ödeme başarıyla güncellendi');
      router.push(`/purchase/payments/${paymentId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/purchase/payments/${paymentId}`);
  };

  const isLoading = updatePayment.isPending;
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
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <WalletIcon className="w-4 h-4" style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">
                  Ödeme Düzenle
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  {payment.paymentNumber}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              icon={<XMarkIcon className="w-4 h-4" />}
              onClick={handleCancel}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
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
        >
          {/* Read-Only Info */}
          <Card title="Ödeme Bilgileri (Salt Okunur)" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Ödeme No</Text>
                  <Text strong>{payment.paymentNumber}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Tedarikçi</Text>
                  <Text strong>{payment.supplierName}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Ödeme Yöntemi</Text>
                  <Text strong>{methodLabels[payment.method as PaymentMethod] || payment.method}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Ödeme Tipi</Text>
                  <Text strong>{typeLabels[payment.type] || payment.type}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Para Birimi</Text>
                  <Text strong>{payment.currency || 'TRY'}</Text>
                </div>
              </Col>
              {payment.purchaseInvoiceNumber && (
                <Col xs={24} md={8}>
                  <div className="mb-4">
                    <Text type="secondary" className="block mb-1">İlişkili Fatura</Text>
                    <Text strong>{payment.purchaseInvoiceNumber}</Text>
                  </div>
                </Col>
              )}
            </Row>
          </Card>

          {/* Editable Fields */}
          <Card title="Düzenlenebilir Alanlar" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="paymentDate"
                  label="Ödeme Tarihi"
                  rules={[{ required: true, message: 'Tarih seçin' }]}
                >
                  <DatePicker className="w-full" format="DD.MM.YYYY" />
                </Form.Item>
              </Col>
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
                    addonAfter={payment.currency || '₺'}
                  />
                </Form.Item>
              </Col>
              {payment.currency !== 'TRY' && (
                <Col xs={24} md={12}>
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
              <TextArea rows={2} placeholder="Dahili not (tedarikçiye gösterilmez)..." />
            </Form.Item>
          </Card>
        </Form>
      </div>
    </div>
  );
}
