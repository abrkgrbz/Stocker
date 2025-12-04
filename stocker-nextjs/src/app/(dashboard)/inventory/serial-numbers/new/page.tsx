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
  Typography,
  Row,
  Col,
  message,
  AutoComplete,
  Collapse,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  BarcodeOutlined,
  PlusOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
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

  const validCount = serialNumbers.filter((s) => s.trim()).length;

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
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Seri Numarası</h1>
              <p className="text-sm text-gray-400 m-0">Ürün seri numarası tanımlayın</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/serial-numbers')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createSerialNumber.isPending}
              onClick={handleSubmit}
              disabled={!selectedProduct || validCount === 0}
              style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
            >
              Kaydet {validCount > 0 && `(${validCount})`}
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form form={form} layout="vertical">
          <Row gutter={48}>
            {/* Left Panel - Product & Location (40%) */}
            <Col xs={24} lg={10}>
              {/* Product Selection */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <ShoppingOutlined className="mr-1" /> Ürün Seçimi
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
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <BarcodeOutlined className="text-white text-xl" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{selectedProduct.name}</div>
                        <div className="text-sm text-gray-500">Kod: {selectedProduct.code}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <EnvironmentOutlined className="mr-1" /> Konum
                </Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <div className="text-xs text-gray-400 mb-1">Depo</div>
                    <Form.Item name="warehouseId" className="mb-0">
                      <Select
                        placeholder="Depo seçin"
                        allowClear
                        variant="filled"
                        options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                        onChange={handleWarehouseChange}
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

              {/* Additional Info */}
              <Collapse
                ghost
                expandIconPosition="end"
                items={[
                  {
                    key: 'additional',
                    label: (
                      <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <CalendarOutlined className="mr-1" /> Ek Bilgiler
                      </Text>
                    ),
                    children: (
                      <>
                        <Row gutter={16}>
                          <Col span={12}>
                            <div className="text-xs text-gray-400 mb-1">Parti/Lot No</div>
                            <Form.Item name="batchNumber" className="mb-4">
                              <Input placeholder="Parti numarası" variant="filled" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <div className="text-xs text-gray-400 mb-1">Tedarikçi Seri</div>
                            <Form.Item name="supplierSerial" className="mb-4">
                              <Input placeholder="Tedarikçi seri no" variant="filled" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <div className="text-xs text-gray-400 mb-1">Üretim Tarihi</div>
                        <Form.Item name="manufacturedDate" className="mb-0">
                          <DatePicker
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            placeholder="Üretim tarihi"
                            variant="filled"
                          />
                        </Form.Item>
                      </>
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
                  <TextArea rows={3} placeholder="Seri numarası hakkında notlar..." variant="filled" />
                </Form.Item>
              </div>
            </Col>

            {/* Right Panel - Serial Numbers (60%) */}
            <Col xs={24} lg={14}>
              {/* Serial Numbers Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide block">
                      <BarcodeOutlined className="mr-1" /> Seri Numaraları
                    </Text>
                    {validCount > 0 && (
                      <span className="text-sm text-gray-400">{validCount} adet girildi</span>
                    )}
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={handleAddSerial}
                    className="text-blue-500"
                  >
                    Seri Ekle
                  </Button>
                </div>

                <div className="space-y-3">
                  {serialNumbers.map((serial, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="w-8 h-10 flex items-center justify-center text-gray-400 text-sm">
                        {index + 1}.
                      </div>
                      <Input
                        placeholder={`Seri numarası ${index + 1}`}
                        value={serial}
                        onChange={(e) => handleSerialChange(index, e.target.value)}
                        variant="filled"
                        size="large"
                        style={{ flex: 1 }}
                      />
                      <Button onClick={() => generateSerialNumber(index)} size="large">
                        Oluştur
                      </Button>
                      {serialNumbers.length > 1 && (
                        <Button
                          danger
                          onClick={() => handleRemoveSerial(index)}
                          size="large"
                          icon={<DeleteOutlined />}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddSerial} block>
                    Başka Seri Numarası Ekle
                  </Button>
                </div>
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
