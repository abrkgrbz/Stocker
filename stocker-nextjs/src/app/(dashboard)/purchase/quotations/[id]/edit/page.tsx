'use client';

import React, { useEffect } from 'react';
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
  Table,
  Spin,
  Empty,
  Tag,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useQuotation, useUpdateQuotation } from '@/lib/api/hooks/usePurchase';
import type { QuotationStatus, QuotationPriority } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const priorityOptions = [
  { value: 'Low', label: 'Düşük' },
  { value: 'Normal', label: 'Normal' },
  { value: 'High', label: 'Yüksek' },
  { value: 'Urgent', label: 'Acil' },
];

const statusConfig: Record<QuotationStatus, { color: string; text: string }> = {
  Draft: { color: 'default', text: 'Taslak' },
  Sent: { color: 'blue', text: 'Gönderildi' },
  PartiallyResponded: { color: 'orange', text: 'Kısmi Yanıt' },
  FullyResponded: { color: 'green', text: 'Tam Yanıt' },
  UnderReview: { color: 'purple', text: 'İnceleniyor' },
  Evaluated: { color: 'cyan', text: 'Değerlendirildi' },
  SupplierSelected: { color: 'lime', text: 'Tedarikçi Seçildi' },
  Awarded: { color: 'gold', text: 'İhale Edildi' },
  Converted: { color: 'green', text: 'Siparişe Dönüştürüldü' },
  Expired: { color: 'red', text: 'Süresi Doldu' },
  Cancelled: { color: 'gray', text: 'İptal Edildi' },
  Closed: { color: 'default', text: 'Kapatıldı' },
};

export default function EditQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params.id as string;
  const [form] = Form.useForm();

  const { data: quotation, isLoading: quotationLoading } = useQuotation(quotationId);
  const updateQuotation = useUpdateQuotation();

  useEffect(() => {
    if (quotation) {
      form.setFieldsValue({
        title: quotation.title,
        priority: quotation.priority,
        responseDeadline: quotation.responseDeadline ? dayjs(quotation.responseDeadline) : null,
        validUntil: quotation.validUntil ? dayjs(quotation.validUntil) : null,
        notes: quotation.notes,
        internalNotes: quotation.internalNotes,
        terms: quotation.terms,
      });
    }
  }, [quotation, form]);

  if (quotationLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="p-8">
        <Empty description="Teklif talebi bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/purchase/quotations')}>
            Teklif Taleplerine Dön
          </Button>
        </div>
      </div>
    );
  }

  if (quotation.status !== 'Draft') {
    return (
      <div className="p-8">
        <Empty description="Bu teklif talebi düzenlenemez. Sadece taslak talepler düzenlenebilir." />
        <div className="text-center mt-4">
          <Button onClick={() => router.push(`/purchase/quotations/${quotationId}`)}>
            Talebe Dön
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = async (values: any) => {
    try {
      await updateQuotation.mutateAsync({
        id: quotationId,
        data: {
          title: values.title,
          priority: values.priority,
          responseDeadline: values.responseDeadline?.toISOString(),
          validUntil: values.validUntil?.toISOString(),
          notes: values.notes,
          internalNotes: values.internalNotes,
          terms: values.terms,
        },
      });
      message.success('Teklif talebi başarıyla güncellendi');
      router.push(`/purchase/quotations/${quotationId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/purchase/quotations/${quotationId}`);
  };

  const isLoading = updateQuotation.isPending;
  const status = statusConfig[quotation.status as QuotationStatus] || statusConfig.Draft;

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record: any) => (
        <div>
          <div className="font-medium">{name || 'Belirtilmemiş'}</div>
          {record.productCode && (
            <div className="text-xs text-gray-500">{record.productCode}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center' as const,
      render: (qty: number, record: any) => `${qty} ${record.unit || 'Adet'}`,
    },
    {
      title: 'Özellikler',
      dataIndex: 'specifications',
      key: 'specifications',
      ellipsis: true,
      render: (specs: string) => specs || '-',
    },
  ];

  const supplierColumns = [
    {
      title: 'Tedarikçi',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (name: string, record: any) => (
        <div>
          <div className="font-medium">{name}</div>
          {record.supplierCode && (
            <div className="text-xs text-gray-500">{record.supplierCode}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'responseStatus',
      key: 'responseStatus',
      width: 120,
      render: (status: string) => {
        const colors: Record<string, string> = {
          Pending: 'default',
          Sent: 'blue',
          Responded: 'green',
          Declined: 'red',
        };
        const labels: Record<string, string> = {
          Pending: 'Bekliyor',
          Sent: 'Gönderildi',
          Responded: 'Yanıtladı',
          Declined: 'Reddetti',
        };
        return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>;
      },
    },
    {
      title: 'Teklif Tutarı',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right' as const,
      render: (amount: number, record: any) =>
        amount > 0
          ? `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${record.currency || quotation.currency}`
          : '-',
    },
  ];

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
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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
                style={{ background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)' }}
              >
                <FileTextOutlined style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">
                  Teklif Talebini Düzenle
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  {quotation.quotationNumber}
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
      <div className="max-w-5xl mx-auto px-8 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {/* Read-Only Info */}
          <Card title="Teklif Bilgileri (Salt Okunur)" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Teklif No</Text>
                  <Text strong>{quotation.quotationNumber}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Durum</Text>
                  <Tag color={status.color}>{status.text}</Tag>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Oluşturma Tarihi</Text>
                  <Text strong>
                    {quotation.quotationDate
                      ? dayjs(quotation.quotationDate).format('DD.MM.YYYY')
                      : '-'}
                  </Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Tedarikçi Sayısı</Text>
                  <Text strong>{quotation.supplierCount || 0}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Para Birimi</Text>
                  <Text strong>{quotation.currency}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Kalem Sayısı</Text>
                  <Text strong>{quotation.items?.length || 0}</Text>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Editable Fields */}
          <Card title="Düzenlenebilir Alanlar" className="mb-6">
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item name="title" label="Başlık">
                  <Input placeholder="Teklif talebi başlığı" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="priority" label="Öncelik">
                  <Select options={priorityOptions} placeholder="Öncelik seçin" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="responseDeadline" label="Son Teklif Tarihi">
                  <DatePicker
                    className="w-full"
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="validUntil" label="Geçerlilik Tarihi">
                  <DatePicker
                    className="w-full"
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="terms" label="Şartlar ve Koşullar">
                  <TextArea rows={3} placeholder="Teklif şartları ve koşulları..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="notes" label="Notlar">
                  <TextArea rows={2} placeholder="Tedarikçilere görünecek notlar..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="internalNotes" label="Dahili Notlar">
                  <TextArea rows={2} placeholder="Sadece dahili kullanım için..." />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Items (Read-Only) */}
          <Card title="Ürünler (Salt Okunur)" className="mb-6">
            <Text type="secondary" className="block mb-4">
              Ürünleri düzenlemek için lütfen talebi silin ve yeni bir talep oluşturun.
            </Text>
            <Table
              columns={itemColumns}
              dataSource={quotation.items || []}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>

          {/* Suppliers (Read-Only) */}
          <Card title="Tedarikçiler (Salt Okunur)">
            <Text type="secondary" className="block mb-4">
              Tedarikçileri düzenlemek için lütfen talebi silin ve yeni bir talep oluşturun.
            </Text>
            <Table
              columns={supplierColumns}
              dataSource={quotation.suppliers || []}
              rowKey="supplierId"
              pagination={false}
              size="small"
            />
          </Card>
        </Form>
      </div>
    </div>
  );
}
