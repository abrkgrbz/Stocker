'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Row,
  Col,
  Typography,
  Segmented,
  Button,
  Table,
  Space,
  Empty,
  InputNumber,
} from 'antd';
import {
  CalculatorOutlined,
  PlusOutlined,
  DeleteOutlined,
  CalendarOutlined,
  FileTextOutlined,
  InboxOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useWarehouses, useProducts, useLocations } from '@/lib/api/hooks/useInventory';
import { StockCountType, type StockCountDto, type CreateStockCountItemDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface StockCountFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: StockCountDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const countTypes = [
  { value: StockCountType.Full, label: 'Tam Sayım' },
  { value: StockCountType.Cycle, label: 'Döngüsel' },
  { value: StockCountType.Spot, label: 'Spot' },
  { value: StockCountType.Annual, label: 'Yıllık' },
  { value: StockCountType.Category, label: 'Kategori' },
  { value: StockCountType.Location, label: 'Lokasyon' },
];

export default function StockCountForm({ form, initialValues, onFinish, loading }: StockCountFormProps) {
  const [countType, setCountType] = useState<StockCountType>(StockCountType.Full);
  const [autoAdjust, setAutoAdjust] = useState(false);
  const [warehouseId, setWarehouseId] = useState<number | undefined>();
  const [items, setItems] = useState<CreateStockCountItemDto[]>([]);

  const { data: warehouses = [] } = useWarehouses();
  const { data: products = [] } = useProducts();
  const { data: locations = [] } = useLocations(warehouseId);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        countDate: initialValues.countDate ? dayjs(initialValues.countDate) : dayjs(),
      });
      setCountType(initialValues.countType);
      setAutoAdjust(initialValues.autoAdjust ?? false);
      setWarehouseId(initialValues.warehouseId);
      // Convert existing items
      if (initialValues.items) {
        setItems(initialValues.items.map(item => ({
          productId: item.productId,
          systemQuantity: item.systemQuantity,
          locationId: item.locationId,
          serialNumber: item.serialNumber,
          lotNumber: item.lotNumber,
        })));
      }
    } else {
      form.setFieldsValue({
        countDate: dayjs(),
        countType: StockCountType.Full,
        autoAdjust: false,
      });
    }
  }, [form, initialValues]);

  const handleAddItem = () => {
    setItems([...items, { productId: 0, systemQuantity: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof CreateStockCountItemDto, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleFinish = (values: any) => {
    onFinish({
      ...values,
      countDate: values.countDate?.toISOString(),
      items,
    });
  };

  const columns = [
    {
      title: 'Ürün',
      dataIndex: 'productId',
      key: 'productId',
      width: '35%',
      render: (_: any, record: CreateStockCountItemDto, index: number) => (
        <Select
          value={record.productId || undefined}
          onChange={(val) => handleItemChange(index, 'productId', val)}
          placeholder="Ürün seçin"
          showSearch
          optionFilterProp="label"
          style={{ width: '100%' }}
          variant="filled"
          options={products.map(p => ({
            value: p.id,
            label: `${p.code} - ${p.name}`,
          }))}
        />
      ),
    },
    {
      title: 'Lokasyon',
      dataIndex: 'locationId',
      key: 'locationId',
      width: '25%',
      render: (_: any, record: CreateStockCountItemDto, index: number) => (
        <Select
          value={record.locationId || undefined}
          onChange={(val) => handleItemChange(index, 'locationId', val)}
          placeholder="Lokasyon"
          allowClear
          style={{ width: '100%' }}
          variant="filled"
          options={locations.map(l => ({
            value: l.id,
            label: l.name,
          }))}
          disabled={!warehouseId}
        />
      ),
    },
    {
      title: 'Sistem Miktarı',
      dataIndex: 'systemQuantity',
      key: 'systemQuantity',
      width: '20%',
      render: (_: any, record: CreateStockCountItemDto, index: number) => (
        <InputNumber
          value={record.systemQuantity}
          onChange={(val) => handleItemChange(index, 'systemQuantity', val || 0)}
          min={0}
          style={{ width: '100%' }}
          variant="filled"
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: '10%',
      render: (_: any, __: any, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(index)}
        />
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading}
      className="stock-count-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Stock Count Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalculatorOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">
                Stok Sayımı
              </p>
              <p className="text-sm text-white/60">
                Envanter sayımı yaparak stokları doğrulayın
              </p>
            </div>
          </div>

          {/* Count Type Segmented */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Sayım Türü
            </Text>
            <Form.Item name="countType" noStyle initialValue={StockCountType.Full}>
              <Segmented
                block
                options={countTypes}
                value={countType}
                onChange={(val) => {
                  setCountType(val as StockCountType);
                  form.setFieldValue('countType', val);
                }}
                style={{ background: '#f5f5f5' }}
              />
            </Form.Item>
          </div>

          {/* Auto Adjust Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl mb-6">
            <div>
              <Text strong className="text-gray-700">Otomatik Düzeltme</Text>
              <div className="text-xs text-gray-400 mt-0.5">
                {autoAdjust ? 'Farklar otomatik düzeltilecek' : 'Manuel onay gerekecek'}
              </div>
            </div>
            <Form.Item name="autoAdjust" valuePropName="checked" noStyle>
              <Switch
                checked={autoAdjust}
                onChange={(val) => {
                  setAutoAdjust(val);
                  form.setFieldValue('autoAdjust', val);
                }}
                checkedChildren="Evet"
                unCheckedChildren="Hayır"
                style={{
                  backgroundColor: autoAdjust ? '#52c41a' : '#d9d9d9',
                  minWidth: '80px'
                }}
              />
            </Form.Item>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.totalItems || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Toplam Kalem</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.countedItems || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Sayılan</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-orange-600">
                  {initialValues.itemsWithDifferenceCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Fark Olan</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className={`text-2xl font-semibold ${(initialValues.totalDifference || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(initialValues.totalDifference || 0) >= 0 ? '+' : ''}{initialValues.totalDifference || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Net Fark</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Count Number - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="countNumber"
              rules={[
                { required: true, message: 'Sayım numarası zorunludur' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Sayım numarası"
                variant="borderless"
                style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  padding: '0',
                  color: '#1a1a1a',
                }}
                className="placeholder:text-gray-300"
                disabled={!!initialValues}
              />
            </Form.Item>
            <Form.Item name="description" className="mb-0 mt-2">
              <TextArea
                placeholder="Sayım açıklaması ekleyin..."
                variant="borderless"
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{
                  fontSize: '15px',
                  padding: '0',
                  color: '#666',
                  resize: 'none'
                }}
                className="placeholder:text-gray-300"
              />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Warehouse & Location Selection */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <EnvironmentOutlined className="mr-1" /> Depo & Lokasyon
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Depo *</div>
                <Form.Item
                  name="warehouseId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Depo seçin"
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    onChange={(val) => setWarehouseId(val)}
                    options={warehouses.map(w => ({
                      value: w.id,
                      label: w.name,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Lokasyon (Opsiyonel)</div>
                <Form.Item name="locationId" className="mb-0">
                  <Select
                    placeholder="Tüm lokasyonlar"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    disabled={!warehouseId}
                    options={locations.map(l => ({
                      value: l.id,
                      label: l.name,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Date Section */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <CalendarOutlined className="mr-1" /> Sayım Tarihi
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Sayım Tarihi *</div>
                <Form.Item
                  name="countDate"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    variant="filled"
                    placeholder="Tarih seçin"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Notes Section */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <FileTextOutlined className="mr-1" /> Notlar
            </Text>
            <Form.Item name="notes" className="mb-0">
              <TextArea
                placeholder="Sayım ile ilgili ek notlar..."
                variant="filled"
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </Form.Item>
          </div>
        </Col>
      </Row>

      {/* Stock Count Items Section - Full Width */}
      <div className="mt-8">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8" />

        <div className="flex items-center justify-between mb-4">
          <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            <InboxOutlined className="mr-1" /> Sayım Kalemleri
          </Text>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddItem}
            size="small"
          >
            Ürün Ekle
          </Button>
        </div>

        {items.length > 0 ? (
          <Table
            dataSource={items.map((item, index) => ({ ...item, key: index }))}
            columns={columns}
            pagination={false}
            size="small"
            className="stock-count-items-table"
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Henüz ürün eklenmedi"
            className="py-8 bg-gray-50/50 rounded-xl"
          >
            <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddItem}>
              İlk Ürünü Ekle
            </Button>
          </Empty>
        )}
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
