'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Spin,
  Empty,
  Divider,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { usePurchaseInvoice, useUpdatePurchaseInvoice } from '@/lib/api/hooks/usePurchase';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function EditPurchaseInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  const [form] = Form.useForm();

  const { data: invoice, isLoading: invoiceLoading } = usePurchaseInvoice(invoiceId);
  const updateInvoice = useUpdatePurchaseInvoice();

  useEffect(() => {
    if (invoice) {
      form.setFieldsValue({
        supplierInvoiceNumber: invoice.supplierInvoiceNumber,
        dueDate: invoice.dueDate ? dayjs(invoice.dueDate) : null,
        discountRate: invoice.discountRate,
        withholdingTaxAmount: invoice.withholdingTaxAmount,
        eInvoiceId: invoice.eInvoiceId,
        eInvoiceUUID: invoice.eInvoiceUUID,
        notes: invoice.notes,
        internalNotes: invoice.internalNotes,
      });
    }
  }, [invoice, form]);

  if (invoiceLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8">
        <Empty description="Fatura bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/purchase/invoices')}>
            Faturalara Dön
          </Button>
        </div>
      </div>
    );
  }

  if (invoice.status !== 'Draft') {
    return (
      <div className="p-8">
        <Empty description="Bu fatura düzenlenemez. Sadece taslak faturalar düzenlenebilir." />
        <div className="text-center mt-4">
          <Button onClick={() => router.push(`/purchase/invoices/${invoiceId}`)}>
            Faturaya Dön
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = async (values: any) => {
    try {
      await updateInvoice.mutateAsync({
        id: invoiceId,
        data: {
          supplierInvoiceNumber: values.supplierInvoiceNumber,
          dueDate: values.dueDate?.toISOString(),
          discountRate: values.discountRate,
          withholdingTaxAmount: values.withholdingTaxAmount,
          eInvoiceId: values.eInvoiceId,
          eInvoiceUUID: values.eInvoiceUUID,
          notes: values.notes,
          internalNotes: values.internalNotes,
        },
      });
      message.success('Fatura başarıyla güncellendi');
      router.push(`/purchase/invoices/${invoiceId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/purchase/invoices/${invoiceId}`);
  };

  const isLoading = updateInvoice.isPending;

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
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
              >
                <FileTextOutlined style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">
                  Fatura Düzenle
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  {invoice.invoiceNumber}
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
        >
          {/* Read-Only Info */}
          <Card title="Fatura Bilgileri (Salt Okunur)" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Fatura No</Text>
                  <Text strong>{invoice.invoiceNumber}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Tedarikçi</Text>
                  <Text strong>{invoice.supplierName}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Fatura Tarihi</Text>
                  <Text strong>{dayjs(invoice.invoiceDate).format('DD.MM.YYYY')}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Fatura Tipi</Text>
                  <Text strong>{invoice.type}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Toplam Tutar</Text>
                  <Text strong style={{ color: '#1890ff' }}>
                    {invoice.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency || '₺'}
                  </Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Para Birimi</Text>
                  <Text strong>{invoice.currency || 'TRY'}</Text>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Editable Fields */}
          <Card title="Düzenlenebilir Alanlar" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="supplierInvoiceNumber" label="Tedarikçi Fatura No">
                  <Input placeholder="Tedarikçi fatura numarası" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="dueDate" label="Vade Tarihi">
                  <DatePicker className="w-full" format="DD.MM.YYYY" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="discountRate" label="Genel İskonto (%)">
                  <InputNumber min={0} max={100} className="w-full" placeholder="0" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="withholdingTaxAmount" label="Stopaj Tutarı">
                  <InputNumber min={0} step={0.01} className="w-full" placeholder="0.00" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* E-Invoice */}
          <Card title="E-Fatura Bilgileri" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="eInvoiceId" label="E-Fatura ID">
                  <Input placeholder="E-Fatura ID" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="eInvoiceUUID" label="E-Fatura UUID">
                  <Input placeholder="E-Fatura UUID" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Notes */}
          <Card title="Notlar" className="mb-6">
            <Form.Item name="notes" label="Genel Not">
              <TextArea rows={3} placeholder="Fatura notu..." />
            </Form.Item>
            <Form.Item name="internalNotes" label="Dahili Not">
              <TextArea rows={2} placeholder="Dahili not (müşteriye gösterilmez)..." />
            </Form.Item>
          </Card>

          {/* Items Summary (Read-Only) */}
          <Card title="Fatura Kalemleri (Salt Okunur)" className="mb-6">
            <div className="space-y-2">
              {invoice.items?.map((item, index) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <Text strong>{index + 1}. {item.productName}</Text>
                    <Text type="secondary" className="ml-2">({item.productCode})</Text>
                  </div>
                  <div className="text-right">
                    <Text>{item.quantity} {item.unit} x {item.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                    <Text strong className="ml-4">
                      {item.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </Text>
                  </div>
                </div>
              ))}
              <Divider />
              <div className="flex justify-between">
                <Text strong>Genel Toplam</Text>
                <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                  {invoice.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency || '₺'}
                </Text>
              </div>
            </div>
          </Card>
        </Form>
      </div>
    </div>
  );
}
