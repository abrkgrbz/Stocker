'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Input,
  DatePicker,
  Button,
  Space,
  InputNumber,
  Typography,
  Row,
  Col,
  message,
  AutoComplete,
  Collapse,
} from 'antd';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  InboxIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { useProducts, useCreateLotBatch } from '@/lib/api/hooks/useInventory';
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
      message.success('Lot/Parti başarıyla oluşturuldu');
      router.push('/inventory/lot-batches');
    } catch {
      // Validation error
    }
  };

  // Generate lot number suggestion
  const generateLotNumber = () => {
    const date = dayjs().format('YYYYMMDD');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = selectedProduct?.code?.substring(0, 3).toUpperCase() || 'LOT';
    form.setFieldsValue({ lotNumber: `${prefix}-${date}-${random}` });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Lot/Parti</h1>
              <p className="text-sm text-gray-400 m-0">Ürün partisi veya lot numarası oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/lot-batches')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createLotBatch.isPending}
              onClick={handleSubmit}
              disabled={!selectedProduct}
              style={{ background: '#1a1a1a', borderColor: '#1a1a1a', color: 'white' }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            initialQuantity: 1,
          }}
        >
          <Row gutter={48}>
            {/* Left Panel - Product & Quantity (40%) */}
            <Col xs={24} lg={10}>
              {/* Product Selection */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <ShoppingBagIcon className="w-4 h-4 mr-1" /> Ürün Seçimi
                </Text>
                <Form.Item
                  name="productId"
                  rules={[{ required: true, message: 'Ürün seçiniz' }]}
                  className="mb-2"
                >
                  <AutoComplete
                    placeholder="Ürün kodu veya adı ile arayın..."
                    size="large"
                    value={selectedProduct?.name || ''}
                    options={products.map((p) => ({
                      value: String(p.id),
                      label: (
                        <div className="flex items-center justify-between py-1">
                          <span className="font-medium">{p.name}</span>
                          <span className="text-gray-400">({p.code})</span>
                        </div>
                      ),
                    }))}
                    onSelect={handleProductSelect}
                    filterOption={(inputValue, option) =>
                      products
                        .find((p) => String(p.id) === option?.value)
                        ?.name?.toLowerCase()
                        .includes(inputValue.toLowerCase()) ||
                      products
                        .find((p) => String(p.id) === option?.value)
                        ?.code?.toLowerCase()
                        .includes(inputValue.toLowerCase()) ||
                      false
                    }
                  />
                </Form.Item>
                {selectedProduct && (
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <InboxIcon className="w-4 h-4 text-white text-xl" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{selectedProduct.name}</div>
                        <div className="text-sm text-gray-500">Kod: {selectedProduct.code}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  Başlangıç Miktarı
                </Text>
                <Form.Item
                  name="initialQuantity"
                  rules={[{ required: true, message: 'Miktar gerekli' }]}
                  className="mb-0"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    size="large"
                    variant="filled"
                    placeholder="1"
                  />
                </Form.Item>
              </div>

              {/* Dates */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <CalendarIcon className="w-4 h-4 mr-1" /> Tarihler
                </Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <div className="text-xs text-gray-400 mb-1">Üretim Tarihi</div>
                    <Form.Item name="manufacturedDate" className="mb-0">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        placeholder="Seçin"
                        variant="filled"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <div className="text-xs text-gray-400 mb-1">Son Kullanma</div>
                    <Form.Item name="expiryDate" className="mb-0">
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        placeholder="SKT"
                        variant="filled"
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Notes */}
              <div>
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  Notlar
                </Text>
                <Form.Item name="notes" className="mb-0">
                  <TextArea rows={4} placeholder="Lot hakkında notlar..." variant="filled" />
                </Form.Item>
              </div>
            </Col>

            {/* Right Panel - Form Content (60%) */}
            <Col xs={24} lg={14}>
              {/* Lot Number - Hero Input */}
              <div className="mb-8">
                <Form.Item
                  name="lotNumber"
                  rules={[{ required: true, message: 'Lot numarası zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Lot numarası"
                    variant="borderless"
                    style={{
                      fontSize: '28px',
                      fontWeight: 600,
                      padding: '0',
                      color: '#1a1a1a',
                    }}
                    className="placeholder:text-gray-300"
                  />
                </Form.Item>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-400">Örn: LOT-20240101-ABCD</span>
                  <Button type="link" size="small" onClick={generateLotNumber} className="p-0">
                    Otomatik Oluştur
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

              {/* Supplier Info */}
              <Collapse
                ghost
                expandIconPosition="end"
                defaultActiveKey={['supplier']}
                items={[
                  {
                    key: 'supplier',
                    label: (
                      <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <TruckIcon className="w-4 h-4 mr-1 inline" /> Tedarikçi Bilgileri
                      </Text>
                    ),
                    children: (
                      <Row gutter={16}>
                        <Col span={24}>
                          <div className="text-xs text-gray-400 mb-1">Tedarikçi Lot Numarası</div>
                          <Form.Item name="supplierLotNumber" className="mb-4">
                            <Input placeholder="Tedarikçinin lot numarası" variant="filled" />
                          </Form.Item>
                        </Col>
                      </Row>
                    ),
                  },
                  {
                    key: 'certificate',
                    label: (
                      <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <ShieldCheckIcon className="w-4 h-4 mr-1" /> Sertifika Bilgileri
                      </Text>
                    ),
                    children: (
                      <Form.Item name="certificateNumber" className="mb-0">
                        <Input placeholder="Kalite sertifikası numarası" variant="filled" />
                      </Form.Item>
                    ),
                  },
                ]}
              />
            </Col>
          </Row>

          {/* Hidden submit button */}
          <Form.Item hidden>
            <Button htmlType="submit" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
