'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  InputNumber,
  Typography,
  Row,
  Col,
  message,
  AutoComplete,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import {
  useProducts,
  useCreateLotBatch,
} from '@/lib/api/hooks/useInventory';
import type { CreateLotBatchDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

export default function NewLotBatchPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    name: string;
    code: string;
  } | null>(null);

  const { data: products = [] } = useProducts();
  const createLotBatch = useCreateLotBatch();

  const handleProductSelect = (value: string) => {
    const productId = Number(value);
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct({ id: product.id, name: product.name, code: product.code });
      form.setFieldsValue({ productId: product.id });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedProduct) {
        message.error('Lütfen bir ürün seçin');
        return;
      }

      const data: CreateLotBatchDto = {
        lotNumber: values.lotNumber,
        productId: selectedProduct.id,
        initialQuantity: values.initialQuantity,
        supplierId: values.supplierId,
        supplierLotNumber: values.supplierLotNumber,
        manufacturedDate: values.manufacturedDate?.toISOString(),
        expiryDate: values.expiryDate?.toISOString(),
        certificateNumber: values.certificateNumber,
        notes: values.notes,
      };

      await createLotBatch.mutateAsync(data);
      router.push('/inventory/lot-batches');
    } catch {
      // Validation error
    }
  };

  // Generate lot number suggestion
  const generateLotNumber = () => {
    const date = dayjs().format('YYYYMMDD');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    form.setFieldsValue({ lotNumber: `LOT-${date}-${random}` });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 -mx-6 px-6 py-4 mb-6"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          marginTop: '-24px',
          paddingTop: '24px',
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <InboxOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Lot/Parti</h1>
                <p className="text-sm text-gray-500 m-0">Ürün partisi veya lot numarası oluşturun</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.back()}>İptal</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={createLotBatch.isPending}
              style={{ background: '#10b981', borderColor: '#10b981' }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          initialQuantity: 1,
        }}
      >
        <Row gutter={24}>
          <Col xs={24} md={16}>
            {/* Product Selection */}
            <Card title="Ürün Seçimi" className="mb-6">
              <Form.Item
                name="productId"
                label="Ürün"
                rules={[{ required: true, message: 'Ürün seçiniz' }]}
              >
                <AutoComplete
                  placeholder="Ürün ara..."
                  value={selectedProduct?.name || ''}
                  options={products.map((p) => ({
                    value: String(p.id),
                    label: `${p.code} - ${p.name}`,
                  }))}
                  onSelect={handleProductSelect}
                  filterOption={(inputValue, option) =>
                    option?.label?.toLowerCase().includes(inputValue.toLowerCase()) ?? false
                  }
                />
              </Form.Item>

              {selectedProduct && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Text type="secondary" className="text-xs">
                    Seçilen Ürün
                  </Text>
                  <div className="font-medium">{selectedProduct.name}</div>
                  <Text type="secondary" className="text-xs">
                    {selectedProduct.code}
                  </Text>
                </div>
              )}
            </Card>

            {/* Lot Info */}
            <Card title="Lot Bilgileri" className="mb-6">
              <Row gutter={16}>
                <Col xs={24} md={16}>
                  <Form.Item
                    name="lotNumber"
                    label="Lot Numarası"
                    rules={[{ required: true, message: 'Lot numarası gerekli' }]}
                  >
                    <Input placeholder="LOT-20240101-ABCD" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label=" ">
                    <Button onClick={generateLotNumber} block>
                      Otomatik Oluştur
                    </Button>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="initialQuantity"
                label="Başlangıç Miktarı"
                rules={[{ required: true, message: 'Miktar gerekli' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="manufacturedDate" label="Üretim Tarihi">
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      placeholder="Üretim tarihi seçin"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="expiryDate" label="Son Kullanma Tarihi">
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      placeholder="SKT seçin"
                      disabledDate={(current) => current && current < dayjs().startOf('day')}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Supplier Info */}
            <Card title="Tedarikçi Bilgileri" className="mb-6">
              <Form.Item name="supplierLotNumber" label="Tedarikçi Lot Numarası">
                <Input placeholder="Tedarikçinin lot numarası" />
              </Form.Item>

              <Form.Item name="certificateNumber" label="Sertifika Numarası">
                <Input placeholder="Kalite sertifikası numarası" />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            {/* Notes */}
            <Card title="Notlar">
              <Form.Item name="notes">
                <TextArea rows={6} placeholder="Lot hakkında notlar..." />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
