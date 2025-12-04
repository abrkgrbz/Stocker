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
  Typography,
  Row,
  Col,
  message,
  AutoComplete,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  BarcodeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  useProducts,
  useWarehouses,
  useLocations,
  useCreateSerialNumber,
} from '@/lib/api/hooks/useInventory';
import type { CreateSerialNumberDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

export default function NewSerialNumberPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    name: string;
    code: string;
  } | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const [serialNumbers, setSerialNumbers] = useState<string[]>(['']);

  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();
  const { data: locations = [] } = useLocations(selectedWarehouse);
  const createSerialNumber = useCreateSerialNumber();

  const handleProductSelect = (value: string) => {
    const productId = Number(value);
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct({ id: product.id, name: product.name, code: product.code });
      form.setFieldsValue({ productId: product.id });
    }
  };

  const handleWarehouseChange = (value: number) => {
    setSelectedWarehouse(value);
    form.setFieldsValue({ locationId: undefined });
  };

  const handleAddSerial = () => {
    setSerialNumbers([...serialNumbers, '']);
  };

  const handleRemoveSerial = (index: number) => {
    if (serialNumbers.length > 1) {
      setSerialNumbers(serialNumbers.filter((_, i) => i !== index));
    }
  };

  const handleSerialChange = (index: number, value: string) => {
    const newSerials = [...serialNumbers];
    newSerials[index] = value;
    setSerialNumbers(newSerials);
  };

  const generateSerialNumber = (index: number) => {
    const date = dayjs().format('YYYYMMDD');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const prefix = selectedProduct?.code?.substring(0, 3).toUpperCase() || 'SN';
    handleSerialChange(index, `${prefix}-${date}-${random}`);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedProduct) {
        message.error('Lütfen bir ürün seçin');
        return;
      }

      const validSerials = serialNumbers.filter((s) => s.trim());
      if (validSerials.length === 0) {
        message.error('En az bir seri numarası girin');
        return;
      }

      // Check for duplicates
      const uniqueSerials = [...new Set(validSerials)];
      if (uniqueSerials.length !== validSerials.length) {
        message.error('Tekrar eden seri numaraları var');
        return;
      }

      // Create each serial number
      let successCount = 0;
      let errorCount = 0;

      for (const serial of uniqueSerials) {
        const data: CreateSerialNumberDto = {
          serial,
          productId: selectedProduct.id,
          warehouseId: values.warehouseId,
          locationId: values.locationId,
          manufacturedDate: values.manufacturedDate?.toISOString(),
          batchNumber: values.batchNumber,
          supplierSerial: values.supplierSerial,
          notes: values.notes,
        };

        try {
          await createSerialNumber.mutateAsync(data);
          successCount++;
        } catch {
          errorCount++;
        }
      }

      if (successCount > 0) {
        message.success(`${successCount} seri numarası oluşturuldu`);
      }
      if (errorCount > 0) {
        message.error(`${errorCount} seri numarası oluşturulamadı`);
      }

      if (errorCount === 0) {
        router.push('/inventory/serial-numbers');
      }
    } catch {
      // Validation error
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
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
              >
                <BarcodeOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Seri Numarası</h1>
                <p className="text-sm text-gray-500 m-0">Ürün seri numarası tanımlayın</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.back()}>İptal</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={createSerialNumber.isPending}
              style={{ background: '#3b82f6', borderColor: '#3b82f6' }}
            >
              Kaydet ({serialNumbers.filter((s) => s.trim()).length})
            </Button>
          </Space>
        </div>
      </div>

      {/* Form */}
      <Form form={form} layout="vertical">
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

            {/* Serial Numbers */}
            <Card
              title="Seri Numaraları"
              className="mb-6"
              extra={
                <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddSerial}>
                  Seri Ekle
                </Button>
              }
            >
              <div className="space-y-3">
                {serialNumbers.map((serial, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Seri numarası ${index + 1}`}
                      value={serial}
                      onChange={(e) => handleSerialChange(index, e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <Button onClick={() => generateSerialNumber(index)}>Oluştur</Button>
                    {serialNumbers.length > 1 && (
                      <Button danger onClick={() => handleRemoveSerial(index)}>
                        Sil
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Divider />

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="batchNumber" label="Parti/Lot Numarası">
                    <Input placeholder="Parti numarası" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="supplierSerial" label="Tedarikçi Seri No">
                    <Input placeholder="Tedarikçinin seri numarası" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="manufacturedDate" label="Üretim Tarihi">
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Üretim tarihi seçin"
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            {/* Location */}
            <Card title="Konum" className="mb-6">
              <Form.Item name="warehouseId" label="Depo">
                <Select
                  placeholder="Depo seçin"
                  allowClear
                  options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                  onChange={handleWarehouseChange}
                />
              </Form.Item>

              <Form.Item name="locationId" label="Lokasyon">
                <Select
                  placeholder="Lokasyon seçin"
                  allowClear
                  options={locations.map((l) => ({ value: l.id, label: l.code }))}
                  disabled={!selectedWarehouse}
                />
              </Form.Item>
            </Card>

            {/* Notes */}
            <Card title="Notlar">
              <Form.Item name="notes">
                <TextArea rows={4} placeholder="Seri numarası hakkında notlar..." />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
