'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  InputNumber,
  Typography,
  Row,
  Col,
  message,
  AutoComplete,
  Statistic,
  Divider,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  EditOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import {
  useWarehouses,
  useLocations,
  useProducts,
  useStock,
  useAdjustStock,
} from '@/lib/api/hooks/useInventory';
import type { StockAdjustmentDto } from '@/lib/api/services/inventory.types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const adjustmentReasons = [
  { value: 'CountDiscrepancy', label: 'Sayım Farkı' },
  { value: 'Damage', label: 'Hasar' },
  { value: 'Theft', label: 'Kayıp/Çalıntı' },
  { value: 'Expiry', label: 'Son Kullanma Tarihi' },
  { value: 'QualityIssue', label: 'Kalite Sorunu' },
  { value: 'SystemError', label: 'Sistem Hatası' },
  { value: 'Donation', label: 'Bağış' },
  { value: 'InternalUse', label: 'Dahili Kullanım' },
  { value: 'Found', label: 'Bulunan Stok' },
  { value: 'Other', label: 'Diğer' },
];

export default function NewStockAdjustmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get('productId');
  const preselectedWarehouseId = searchParams.get('warehouseId');

  const [form] = Form.useForm();
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>(
    preselectedWarehouseId ? Number(preselectedWarehouseId) : undefined
  );
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    name: string;
    code: string;
  } | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [newQuantity, setNewQuantity] = useState<number>(0);

  const { data: warehouses = [] } = useWarehouses();
  const { data: locations = [] } = useLocations(selectedWarehouse);
  const { data: products = [] } = useProducts();
  const { data: currentStock, refetch: refetchStock } = useStock(
    selectedProduct?.id,
    selectedWarehouse
  );
  const adjustStock = useAdjustStock();

  const currentQuantity = currentStock?.[0]?.quantity || 0;
  const difference = newQuantity - currentQuantity;

  useEffect(() => {
    if (preselectedProductId) {
      const product = products.find((p) => p.id === Number(preselectedProductId));
      if (product) {
        setSelectedProduct({ id: product.id, name: product.name, code: product.code });
        form.setFieldsValue({ productId: product.id });
      }
    }
  }, [preselectedProductId, products, form]);

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
    if (selectedProduct) {
      refetchStock();
    }
  };

  useEffect(() => {
    if (currentStock?.[0]) {
      setNewQuantity(currentStock[0].quantity);
    }
  }, [currentStock]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedProduct) {
        message.error('Lütfen bir ürün seçin');
        return;
      }

      if (newQuantity === currentQuantity) {
        message.warning('Yeni miktar mevcut stok ile aynı');
        return;
      }

      const data: StockAdjustmentDto = {
        productId: selectedProduct.id,
        warehouseId: values.warehouseId,
        locationId: values.locationId,
        newQuantity: newQuantity,
        reason: values.reason,
        notes: values.notes,
      };

      await adjustStock.mutateAsync(data);
      router.push('/inventory/stock-adjustments');
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
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
              >
                <EditOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">Stok Düzeltme</h1>
                <p className="text-sm text-gray-500 m-0">Manuel stok düzeltmesi yapın</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.back()}>İptal</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={adjustStock.isPending}
              style={{ background: '#ef4444', borderColor: '#ef4444' }}
            >
              Düzeltmeyi Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Form */}
      <Form form={form} layout="vertical">
        <Row gutter={24}>
          {/* Left Column */}
          <Col xs={24} md={14}>
            <Card title="Ürün ve Depo Seçimi" className="mb-6">
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
                  <Text type="secondary" className="text-xs">
                    Seçilen Ürün
                  </Text>
                  <div className="font-medium">{selectedProduct.name}</div>
                  <Text type="secondary" className="text-xs">
                    {selectedProduct.code}
                  </Text>
                </div>
              )}

              <Form.Item
                name="warehouseId"
                label="Depo"
                rules={[{ required: true, message: 'Depo seçiniz' }]}
                initialValue={preselectedWarehouseId ? Number(preselectedWarehouseId) : undefined}
              >
                <Select
                  placeholder="Depo seçin"
                  options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                  onChange={handleWarehouseChange}
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

            <Card title="Düzeltme Detayları">
              <Form.Item
                name="reason"
                label="Düzeltme Nedeni"
                rules={[{ required: true, message: 'Neden seçiniz' }]}
              >
                <Select placeholder="Neden seçin" options={adjustmentReasons} />
              </Form.Item>

              <Form.Item name="notes" label="Notlar">
                <TextArea rows={3} placeholder="Düzeltme açıklaması..." />
              </Form.Item>
            </Card>
          </Col>

          {/* Right Column - Quantity */}
          <Col xs={24} md={10}>
            <Card title="Stok Miktarı" className="mb-6">
              {selectedProduct && selectedWarehouse ? (
                <>
                  <div className="text-center mb-6">
                    <Statistic
                      title="Mevcut Stok"
                      value={currentQuantity}
                      valueStyle={{ fontSize: 32 }}
                    />
                  </div>

                  <Divider />

                  <div className="mb-4">
                    <Text className="block mb-2">Yeni Miktar:</Text>
                    <InputNumber
                      value={newQuantity}
                      onChange={(val) => setNewQuantity(val || 0)}
                      min={0}
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </div>

                  <div className="flex justify-center gap-2 mb-4">
                    <Button
                      size="small"
                      onClick={() => setNewQuantity(Math.max(0, newQuantity - 10))}
                    >
                      -10
                    </Button>
                    <Button size="small" onClick={() => setNewQuantity(Math.max(0, newQuantity - 1))}>
                      -1
                    </Button>
                    <Button size="small" onClick={() => setNewQuantity(newQuantity + 1)}>
                      +1
                    </Button>
                    <Button size="small" onClick={() => setNewQuantity(newQuantity + 10)}>
                      +10
                    </Button>
                  </div>

                  <Divider />

                  <div className="text-center">
                    <Text type="secondary" className="block mb-2">
                      Fark
                    </Text>
                    <div
                      className="text-2xl font-bold flex items-center justify-center gap-2"
                      style={{
                        color:
                          difference > 0
                            ? '#10b981'
                            : difference < 0
                            ? '#ef4444'
                            : '#6b7280',
                      }}
                    >
                      {difference > 0 ? (
                        <ArrowUpOutlined />
                      ) : difference < 0 ? (
                        <ArrowDownOutlined />
                      ) : (
                        <SwapOutlined />
                      )}
                      {difference > 0 ? '+' : ''}
                      {difference}
                    </div>
                  </div>

                  {difference !== 0 && (
                    <Alert
                      className="mt-4"
                      message={
                        difference > 0
                          ? `Stok ${difference} adet artırılacak`
                          : `Stok ${Math.abs(difference)} adet azaltılacak`
                      }
                      type={difference > 0 ? 'success' : 'warning'}
                      showIcon
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Text type="secondary">
                    Stok bilgilerini görmek için ürün ve depo seçin
                  </Text>
                </div>
              )}
            </Card>

            <Alert
              message="Dikkat"
              description="Stok düzeltmeleri geri alınamaz. Lütfen değişikliklerinizi kaydetmeden önce kontrol edin."
              type="warning"
              showIcon
            />
          </Col>
        </Row>
      </Form>
    </div>
  );
}
