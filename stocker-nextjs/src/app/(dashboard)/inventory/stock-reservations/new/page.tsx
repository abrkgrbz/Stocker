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
  LockOutlined,
} from '@ant-design/icons';
import {
  useWarehouses,
  useLocations,
  useProducts,
  useCreateStockReservation,
} from '@/lib/api/hooks/useInventory';
import type { CreateStockReservationDto, ReservationType } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const reservationTypes: { value: string; label: string }[] = [
  { value: 'SalesOrder', label: 'Satış Siparişi' },
  { value: 'Production', label: 'Üretim' },
  { value: 'Transfer', label: 'Transfer' },
  { value: 'Manual', label: 'Manuel' },
  { value: 'Project', label: 'Proje' },
  { value: 'Assembly', label: 'Montaj' },
  { value: 'Service', label: 'Servis' },
];

export default function NewStockReservationPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string; code: string } | null>(null);

  const { data: warehouses = [] } = useWarehouses();
  const { data: locations = [] } = useLocations(selectedWarehouse);
  const { data: products = [] } = useProducts();
  const createReservation = useCreateStockReservation();

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

      const data: CreateStockReservationDto = {
        reservationNumber: values.reservationNumber,
        productId: selectedProduct.id,
        warehouseId: values.warehouseId,
        locationId: values.locationId,
        quantity: values.quantity,
        reservationType: values.reservationType,
        referenceDocumentType: values.referenceDocumentType,
        referenceDocumentNumber: values.referenceDocumentNumber,
        expirationDate: values.expirationDate?.toISOString(),
        notes: values.notes,
        createdByUserId: 1, // TODO: Get from auth context
      };

      await createReservation.mutateAsync(data);
      router.push('/inventory/stock-reservations');
    } catch (error) {
      // Validation or API error handled
    }
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
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
              >
                <LockOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Stok Rezervasyonu</h1>
                <p className="text-sm text-gray-500 m-0">Stok için rezervasyon oluşturun</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.back()}>İptal</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={createReservation.isPending}
              style={{ background: '#f97316', borderColor: '#f97316' }}
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
          reservationType: 'Manual',
          quantity: 1,
        }}
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Card title="Rezervasyon Bilgileri" className="mb-6">
              <Form.Item
                name="reservationNumber"
                label="Rezervasyon No"
                rules={[{ required: true, message: 'Rezervasyon numarası gerekli' }]}
              >
                <Input placeholder="RES-2024-001" />
              </Form.Item>

              <Form.Item
                name="reservationType"
                label="Rezervasyon Türü"
                rules={[{ required: true, message: 'Tür seçiniz' }]}
              >
                <Select options={reservationTypes} />
              </Form.Item>

              <Form.Item name="expirationDate" label="Son Geçerlilik Tarihi">
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Card>

            <Card title="Referans Dökümanı">
              <Form.Item name="referenceDocumentType" label="Döküman Türü">
                <Select
                  allowClear
                  placeholder="Seçiniz"
                  options={[
                    { value: 'SalesOrder', label: 'Satış Siparişi' },
                    { value: 'PurchaseOrder', label: 'Satın Alma Siparişi' },
                    { value: 'ProductionOrder', label: 'Üretim Emri' },
                    { value: 'TransferOrder', label: 'Transfer Emri' },
                  ]}
                />
              </Form.Item>

              <Form.Item name="referenceDocumentNumber" label="Döküman No">
                <Input placeholder="SO-2024-001" />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Ürün ve Stok" className="mb-6">
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
                  onSearch={setProductSearch}
                  onSelect={handleProductSelect}
                  filterOption={(inputValue, option) =>
                    option?.label?.toLowerCase().includes(inputValue.toLowerCase()) ?? false
                  }
                />
              </Form.Item>

              {selectedProduct && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <Text type="secondary" className="text-xs">Seçilen Ürün</Text>
                  <div className="font-medium">{selectedProduct.name}</div>
                  <Text type="secondary" className="text-xs">{selectedProduct.code}</Text>
                </div>
              )}

              <Form.Item
                name="quantity"
                label="Rezerve Miktar"
                rules={[{ required: true, message: 'Miktar gerekli' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Card>

            <Card title="Depo Bilgileri" className="mb-6">
              <Form.Item
                name="warehouseId"
                label="Depo"
                rules={[{ required: true, message: 'Depo seçiniz' }]}
              >
                <Select
                  placeholder="Depo seçin"
                  options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                  onChange={setSelectedWarehouse}
                />
              </Form.Item>

              <Form.Item name="locationId" label="Lokasyon">
                <Select
                  placeholder="Lokasyon seçin (opsiyonel)"
                  allowClear
                  options={locations.map((l) => ({ value: l.id, label: l.code }))}
                  disabled={!selectedWarehouse}
                />
              </Form.Item>
            </Card>

            <Card title="Notlar">
              <Form.Item name="notes">
                <TextArea rows={3} placeholder="Rezervasyon notları..." />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
