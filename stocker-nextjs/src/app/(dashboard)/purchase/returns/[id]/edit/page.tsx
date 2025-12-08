'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Form,
  Button,
  Card,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Spin,
  Empty,
  Divider,
  Tag,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { usePurchaseReturn, useUpdatePurchaseReturn } from '@/lib/api/hooks/usePurchase';
import type { PurchaseReturnReason, RefundMethod } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const reasonLabels: Record<PurchaseReturnReason, string> = {
  Defective: 'Kusurlu',
  WrongItem: 'Yanlış Ürün',
  WrongQuantity: 'Yanlış Miktar',
  Damaged: 'Hasarlı',
  QualityIssue: 'Kalite Sorunu',
  Expired: 'Vadesi Geçmiş',
  NotAsDescribed: 'Tanımlandığı Gibi Değil',
  Other: 'Diğer',
};

const typeLabels: Record<string, string> = {
  Standard: 'Standart',
  Defective: 'Kusurlu Ürün',
  Warranty: 'Garanti',
  Exchange: 'Değişim',
};

const refundMethodOptions = [
  { value: 'Credit', label: 'Alacak' },
  { value: 'BankTransfer', label: 'Havale/EFT' },
  { value: 'Check', label: 'Çek' },
  { value: 'Cash', label: 'Nakit' },
  { value: 'Replacement', label: 'Ürün Değişimi' },
];

export default function EditPurchaseReturnPage() {
  const params = useParams();
  const router = useRouter();
  const returnId = params.id as string;
  const [form] = Form.useForm();

  const { data: purchaseReturn, isLoading: returnLoading } = usePurchaseReturn(returnId);
  const updateReturn = useUpdatePurchaseReturn();

  useEffect(() => {
    if (purchaseReturn) {
      form.setFieldsValue({
        rmaNumber: purchaseReturn.rmaNumber,
        reasonDetails: purchaseReturn.reasonDetails,
        refundMethod: purchaseReturn.refundMethod,
        notes: purchaseReturn.notes,
        internalNotes: purchaseReturn.internalNotes,
      });
    }
  }, [purchaseReturn, form]);

  if (returnLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!purchaseReturn) {
    return (
      <div className="p-8">
        <Empty description="İade belgesi bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/purchase/returns')}>
            İadelere Dön
          </Button>
        </div>
      </div>
    );
  }

  if (purchaseReturn.status !== 'Draft') {
    return (
      <div className="p-8">
        <Empty description="Bu iade düzenlenemez. Sadece taslak iadeler düzenlenebilir." />
        <div className="text-center mt-4">
          <Button onClick={() => router.push(`/purchase/returns/${returnId}`)}>
            İadeye Dön
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = async (values: any) => {
    try {
      await updateReturn.mutateAsync({
        id: returnId,
        data: {
          rmaNumber: values.rmaNumber,
          reasonDetails: values.reasonDetails,
          refundMethod: values.refundMethod,
          notes: values.notes,
          internalNotes: values.internalNotes,
        },
      });
      message.success('İade talebi başarıyla güncellendi');
      router.push(`/purchase/returns/${returnId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/purchase/returns/${returnId}`);
  };

  const isLoading = updateReturn.isPending;

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
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
              >
                <RollbackOutlined style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">
                  İade Düzenle
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  {purchaseReturn.returnNumber}
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
          <Card title="İade Bilgileri (Salt Okunur)" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">İade No</Text>
                  <Text strong>{purchaseReturn.returnNumber}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Tedarikçi</Text>
                  <Text strong>{purchaseReturn.supplierName}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">İade Tarihi</Text>
                  <Text strong>{dayjs(purchaseReturn.returnDate).format('DD.MM.YYYY')}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">İade Tipi</Text>
                  <Text strong>{typeLabels[purchaseReturn.type] || purchaseReturn.type}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">İade Sebebi</Text>
                  <Tag color="orange">
                    {reasonLabels[purchaseReturn.reason as PurchaseReturnReason] || purchaseReturn.reason}
                  </Tag>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">İade Tutarı</Text>
                  <Text strong style={{ color: '#ef4444', fontSize: 18 }}>
                    {purchaseReturn.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {purchaseReturn.currency || '₺'}
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Editable Fields */}
          <Card title="Düzenlenebilir Alanlar" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="rmaNumber" label="RMA Numarası">
                  <Input placeholder="Tedarikçi RMA numarası" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="refundMethod" label="İade Yöntemi">
                  <Select placeholder="Seçin (opsiyonel)" allowClear>
                    {refundMethodOptions.map(opt => (
                      <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="reasonDetails" label="Sebep Detayı">
                  <TextArea rows={3} placeholder="İade sebebini detaylı açıklayın..." />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Notes */}
          <Card title="Notlar" className="mb-6">
            <Form.Item name="notes" label="Genel Not">
              <TextArea rows={2} placeholder="Genel notlar..." />
            </Form.Item>
            <Form.Item name="internalNotes" label="Dahili Not">
              <TextArea rows={2} placeholder="Dahili not (tedarikçiye gösterilmez)..." />
            </Form.Item>
          </Card>

          {/* Items Summary (Read-Only) */}
          <Card title="İade Kalemleri (Salt Okunur)" className="mb-6">
            <div className="space-y-2">
              {purchaseReturn.items?.map((item, index) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <Text strong>{index + 1}. {item.productName}</Text>
                    <Text type="secondary" className="ml-2">({item.productCode})</Text>
                    <Tag color="orange" className="ml-2">
                      {reasonLabels[item.reason as PurchaseReturnReason] || item.reason}
                    </Tag>
                  </div>
                  <div className="text-right">
                    <Text>{item.quantity} {item.unit} x {item.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                    <Text strong className="ml-4 text-red-600">
                      {item.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </Text>
                  </div>
                </div>
              ))}
              <Divider />
              <div className="flex justify-between">
                <Text strong>Toplam İade Tutarı</Text>
                <Text strong style={{ fontSize: 16, color: '#ef4444' }}>
                  {purchaseReturn.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {purchaseReturn.currency || '₺'}
                </Text>
              </div>
            </div>
          </Card>
        </Form>
      </div>
    </div>
  );
}
