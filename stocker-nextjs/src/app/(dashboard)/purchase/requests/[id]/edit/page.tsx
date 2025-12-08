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
  Divider,
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
import { usePurchaseRequest, useUpdatePurchaseRequest } from '@/lib/api/hooks/usePurchase';
import type { PurchaseRequestPriority } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const priorityOptions = [
  { value: 'Low', label: 'Düşük' },
  { value: 'Normal', label: 'Normal' },
  { value: 'High', label: 'Yüksek' },
  { value: 'Urgent', label: 'Acil' },
];

const priorityColors: Record<PurchaseRequestPriority, string> = {
  Low: 'default',
  Normal: 'blue',
  High: 'orange',
  Urgent: 'red',
};

export default function EditPurchaseRequestPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;
  const [form] = Form.useForm();

  const { data: request, isLoading: requestLoading } = usePurchaseRequest(requestId);
  const updateRequest = useUpdatePurchaseRequest();

  useEffect(() => {
    if (request) {
      form.setFieldsValue({
        priority: request.priority,
        requiredDate: request.requiredDate ? dayjs(request.requiredDate) : null,
        purpose: request.purpose,
        justification: request.justification,
        budgetAmount: request.budgetAmount,
        budgetCode: request.budgetCode,
        notes: request.notes,
      });
    }
  }, [request, form]);

  if (requestLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8">
        <Empty description="Talep bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/purchase/requests')}>
            Taleplere Dön
          </Button>
        </div>
      </div>
    );
  }

  if (request.status !== 'Draft') {
    return (
      <div className="p-8">
        <Empty description="Bu talep düzenlenemez. Sadece taslak talepler düzenlenebilir." />
        <div className="text-center mt-4">
          <Button onClick={() => router.push(`/purchase/requests/${requestId}`)}>
            Talebe Dön
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = async (values: any) => {
    try {
      await updateRequest.mutateAsync({
        id: requestId,
        data: {
          priority: values.priority,
          requiredDate: values.requiredDate?.toISOString(),
          purpose: values.purpose,
          justification: values.justification,
          budgetAmount: values.budgetAmount,
          budgetCode: values.budgetCode,
          notes: values.notes,
        },
      });
      message.success('Talep başarıyla güncellendi');
      router.push(`/purchase/requests/${requestId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/purchase/requests/${requestId}`);
  };

  const isLoading = updateRequest.isPending;

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record: any) => (
        <div>
          <div className="font-medium">{name}</div>
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
      title: 'Tahmini Birim Fiyat',
      dataIndex: 'estimatedUnitPrice',
      key: 'estimatedUnitPrice',
      width: 150,
      align: 'right' as const,
      render: (price: number) => `${(price || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`,
    },
    {
      title: 'Toplam',
      dataIndex: 'estimatedTotalAmount',
      key: 'estimatedTotalAmount',
      width: 150,
      align: 'right' as const,
      render: (amount: number) => (
        <span className="font-medium">
          {(amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
        </span>
      ),
    },
    {
      title: 'Tercih Edilen Tedarikçi',
      dataIndex: 'preferredSupplierName',
      key: 'preferredSupplierName',
      width: 180,
      render: (name: string) => name || '-',
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
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
              >
                <FileTextOutlined style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">
                  Talebi Düzenle
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  {request.requestNumber}
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
          <Card title="Talep Bilgileri (Salt Okunur)" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Talep No</Text>
                  <Text strong>{request.requestNumber}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Talep Eden</Text>
                  <Text strong>{request.requestedByName || '-'}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Talep Tarihi</Text>
                  <Text strong>{dayjs(request.requestDate).format('DD.MM.YYYY')}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Departman</Text>
                  <Text strong>{request.departmentName || '-'}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Kalem Sayısı</Text>
                  <Text strong>{request.items?.length || 0}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Tahmini Tutar</Text>
                  <Text strong style={{ color: '#8b5cf6', fontSize: 18 }}>
                    {(request.estimatedTotalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {request.currency || '₺'}
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Editable Fields */}
          <Card title="Düzenlenebilir Alanlar" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="priority"
                  label="Öncelik"
                  rules={[{ required: true, message: 'Öncelik seçin' }]}
                >
                  <Select options={priorityOptions} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="requiredDate" label="Gerekli Tarih">
                  <DatePicker
                    className="w-full"
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="budgetCode" label="Bütçe Kodu">
                  <Input placeholder="ör: BTC-2024-001" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="budgetAmount" label="Bütçe Tutarı">
                  <InputNumber
                    className="w-full"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => (parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0) as unknown as 0}
                    precision={2}
                    min={0}
                    addonAfter="₺"
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="purpose"
                  label="Amaç"
                  rules={[{ required: true, message: 'Amaç belirtin' }]}
                >
                  <TextArea rows={2} placeholder="Bu talebin amacını açıklayın..." />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="justification" label="Gerekçe">
                  <TextArea rows={2} placeholder="Talebin gerekçesini detaylı açıklayın..." />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="notes" label="Notlar">
                  <TextArea rows={2} placeholder="Ek notlar..." />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Items (Read-Only) */}
          <Card title="Talep Kalemleri (Salt Okunur)" className="mb-6">
            <Text type="secondary" className="block mb-4">
              Kalemleri düzenlemek için lütfen talebi silin ve yeni bir talep oluşturun.
            </Text>
            <Table
              columns={itemColumns}
              dataSource={request.items || []}
              rowKey="id"
              pagination={false}
              summary={() => (request.items?.length || 0) > 0 ? (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Text strong>Toplam ({request.items?.length} kalem)</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text strong style={{ fontSize: 16, color: '#8b5cf6' }}>
                      {(request.estimatedTotalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} />
                </Table.Summary.Row>
              ) : null}
            />
          </Card>
        </Form>
      </div>
    </div>
  );
}
