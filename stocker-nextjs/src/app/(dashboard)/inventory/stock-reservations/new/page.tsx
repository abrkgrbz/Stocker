'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
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
  Segmented,
  Collapse,
} from 'antd';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  DocumentTextIcon,
  LockClosedIcon,
  MapPinIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import {
  useWarehouses,
  useLocations,
  useProducts,
  useCreateStockReservation,
} from '@/lib/api/hooks/useInventory';
import type { CreateStockReservationDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

const mainReservationTypes = [
  { value: 'SalesOrder', label: 'Satış Siparişi' },
  { value: 'Production', label: 'Üretim' },
  { value: 'Manual', label: 'Manuel' },
];

const otherReservationTypes = [
  { value: 'Transfer', label: 'Transfer' },
  { value: 'Project', label: 'Proje' },
  { value: 'Assembly', label: 'Montaj' },
  { value: 'Service', label: 'Servis' },
];

const documentTypes = [
  { value: 'SalesOrder', label: 'Satış Siparişi' },
  { value: 'PurchaseOrder', label: 'Satın Alma Siparişi' },
  { value: 'ProductionOrder', label: 'Üretim Emri' },
  { value: 'TransferOrder', label: 'Transfer Emri' },
];

export default function NewStockReservationPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    name: string;
    code: string;
  } | null>(null);

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
        createdByUserId: 1,
      };

      await createReservation.mutateAsync(data);
      message.success('Rezervasyon başarıyla oluşturuldu');
      router.push('/inventory/stock-reservations');
    } catch {
      // Validation error
    }
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
              <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Stok Rezervasyonu</h1>
              <p className="text-sm text-gray-400 m-0">Stok için rezervasyon oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/stock-reservations')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createReservation.isPending}
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
            reservationType: 'Manual',
            quantity: 1,
          }}
        >
          <Row gutter={48}>
            {/* Left Panel - Product & Location (40%) */}
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
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                        <ShoppingBagIcon className="w-4 h-4 text-white text-xl" />
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
                  Rezerve Miktarı
                </Text>
                <Form.Item
                  name="quantity"
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

              {/* Location */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <MapPinIcon className="w-4 h-4 mr-1" /> Depo & Lokasyon
                </Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <div className="text-xs text-gray-400 mb-1">Depo *</div>
                    <Form.Item
                      name="warehouseId"
                      rules={[{ required: true, message: 'Depo seçiniz' }]}
                      className="mb-0"
                    >
                      <Select
                        placeholder="Depo seçin"
                        variant="filled"
                        options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                        onChange={setSelectedWarehouse}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <div className="text-xs text-gray-400 mb-1">Lokasyon</div>
                    <Form.Item name="locationId" className="mb-0">
                      <Select
                        placeholder="Lokasyon"
                        allowClear
                        variant="filled"
                        options={locations.map((l) => ({ value: l.id, label: l.code }))}
                        disabled={!selectedWarehouse}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Expiration */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <CalendarIcon className="w-4 h-4 mr-1" /> Son Geçerlilik
                </Text>
                <Form.Item name="expirationDate" className="mb-0">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Süresiz"
                    variant="filled"
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>
              </div>
            </Col>

            {/* Right Panel - Form Content (60%) */}
            <Col xs={24} lg={14}>
              {/* Reservation Number - Hero Input */}
              <div className="mb-8">
                <Form.Item
                  name="reservationNumber"
                  rules={[{ required: true, message: 'Rezervasyon numarası zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Rezervasyon numarası"
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
                <div className="text-sm text-gray-400 mt-2">Örn: RES-2024-001</div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

              {/* Reservation Type */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <LockClosedIcon className="w-4 h-4 mr-1" /> Rezervasyon Türü
                </Text>
                <Form.Item
                  name="reservationType"
                  rules={[{ required: true }]}
                  className="mb-2"
                >
                  <Segmented
                    block
                    options={mainReservationTypes}
                    className="bg-gray-100/50"
                    style={{ padding: '4px' }}
                  />
                </Form.Item>
                <Select
                  size="small"
                  variant="borderless"
                  placeholder="+ Diğer türler"
                  className="text-gray-400 text-xs"
                  style={{ width: 140 }}
                  options={otherReservationTypes}
                  onChange={(val) => form.setFieldValue('reservationType', val)}
                />
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

              {/* Reference Document */}
              <Collapse
                ghost
                expandIconPosition="end"
                items={[
                  {
                    key: 'reference',
                    label: (
                      <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <DocumentTextIcon className="w-4 h-4 mr-1" /> Referans Dökümanı
                      </Text>
                    ),
                    children: (
                      <Row gutter={16}>
                        <Col span={12}>
                          <div className="text-xs text-gray-400 mb-1">Döküman Türü</div>
                          <Form.Item name="referenceDocumentType" className="mb-0">
                            <Select
                              allowClear
                              placeholder="Seçiniz"
                              variant="filled"
                              options={documentTypes}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <div className="text-xs text-gray-400 mb-1">Döküman No</div>
                          <Form.Item name="referenceDocumentNumber" className="mb-0">
                            <Input placeholder="SO-2024-001" variant="filled" />
                          </Form.Item>
                        </Col>
                      </Row>
                    ),
                  },
                ]}
              />

              {/* Notes */}
              <div className="mt-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  Notlar
                </Text>
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    rows={4}
                    placeholder="Rezervasyon hakkında notlar..."
                    variant="filled"
                  />
                </Form.Item>
              </div>
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
