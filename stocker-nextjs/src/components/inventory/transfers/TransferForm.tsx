'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Row,
  Col,
  Typography,
  Segmented,
  Button,
  Table,
  Space,
  Empty,
} from 'antd';
import {
  SwapOutlined,
  PlusOutlined,
  DeleteOutlined,
  CalendarOutlined,
  FileTextOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { useWarehouses, useProducts, useLocations } from '@/lib/api/hooks/useInventory';
import { TransferType, type StockTransferDto, type CreateStockTransferItemDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface TransferFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: StockTransferDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const transferTypes = [
  { value: TransferType.Standard, label: 'Standart' },
  { value: TransferType.Urgent, label: 'Acil' },
  { value: TransferType.Replenishment, label: 'Stok Takviye' },
  { value: TransferType.Return, label: 'İade' },
  { value: TransferType.Internal, label: 'Dahili' },
];

export default function TransferForm({ form, initialValues, onFinish, loading }: TransferFormProps) {
  const [transferType, setTransferType] = useState<TransferType>(TransferType.Standard);
  const [sourceWarehouseId, setSourceWarehouseId] = useState<number | undefined>();
  const [destWarehouseId, setDestWarehouseId] = useState<number | undefined>();
  const [items, setItems] = useState<CreateStockTransferItemDto[]>([]);

  const { data: warehouses = [] } = useWarehouses();
  const { data: products = [] } = useProducts();
  const { data: sourceLocations = [] } = useLocations(sourceWarehouseId);
  const { data: destLocations = [] } = useLocations(destWarehouseId);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        transferDate: initialValues.transferDate ? dayjs(initialValues.transferDate) : dayjs(),
        expectedArrivalDate: initialValues.expectedArrivalDate ? dayjs(initialValues.expectedArrivalDate) : undefined,
      });
      setTransferType(initialValues.transferType);
      setSourceWarehouseId(initialValues.sourceWarehouseId);
      setDestWarehouseId(initialValues.destinationWarehouseId);
      // Convert existing items
      if (initialValues.items) {
        setItems(initialValues.items.map(item => ({
          productId: item.productId,
          sourceLocationId: item.sourceLocationId,
          destinationLocationId: item.destinationLocationId,
          requestedQuantity: item.requestedQuantity,
          serialNumber: item.serialNumber,
          lotNumber: item.lotNumber,
          notes: item.notes,
        })));
      }
    } else {
      form.setFieldsValue({
        transferDate: dayjs(),
        transferType: TransferType.Standard,
      });
    }
  }, [form, initialValues]);

  const handleAddItem = () => {
    setItems([...items, { productId: 0, requestedQuantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof CreateStockTransferItemDto, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleFinish = (values: any) => {
    onFinish({
      ...values,
      transferDate: values.transferDate?.toISOString(),
      expectedArrivalDate: values.expectedArrivalDate?.toISOString(),
      items,
    });
  };

  const columns = [
    {
      title: 'Ürün',
      dataIndex: 'productId',
      key: 'productId',
      width: '30%',
      render: (_: any, record: CreateStockTransferItemDto, index: number) => (
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
      title: 'Kaynak Lokasyon',
      dataIndex: 'sourceLocationId',
      key: 'sourceLocationId',
      width: '20%',
      render: (_: any, record: CreateStockTransferItemDto, index: number) => (
        <Select
          value={record.sourceLocationId || undefined}
          onChange={(val) => handleItemChange(index, 'sourceLocationId', val)}
          placeholder="Lokasyon"
          allowClear
          style={{ width: '100%' }}
          variant="filled"
          options={sourceLocations.map(l => ({
            value: l.id,
            label: l.name,
          }))}
          disabled={!sourceWarehouseId}
        />
      ),
    },
    {
      title: 'Hedef Lokasyon',
      dataIndex: 'destinationLocationId',
      key: 'destinationLocationId',
      width: '20%',
      render: (_: any, record: CreateStockTransferItemDto, index: number) => (
        <Select
          value={record.destinationLocationId || undefined}
          onChange={(val) => handleItemChange(index, 'destinationLocationId', val)}
          placeholder="Lokasyon"
          allowClear
          style={{ width: '100%' }}
          variant="filled"
          options={destLocations.map(l => ({
            value: l.id,
            label: l.name,
          }))}
          disabled={!destWarehouseId}
        />
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'requestedQuantity',
      key: 'requestedQuantity',
      width: '15%',
      render: (_: any, record: CreateStockTransferItemDto, index: number) => (
        <InputNumber
          value={record.requestedQuantity}
          onChange={(val) => handleItemChange(index, 'requestedQuantity', val || 1)}
          min={1}
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
      className="transfer-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Transfer Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SwapOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">
                Stok Transferi
              </p>
              <p className="text-sm text-white/60">
                Depolar arası stok transferi oluşturun
              </p>
            </div>
          </div>

          {/* Transfer Type Segmented */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Transfer Türü
            </Text>
            <Form.Item name="transferType" noStyle initialValue={TransferType.Standard}>
              <Segmented
                block
                options={transferTypes}
                value={transferType}
                onChange={(val) => {
                  setTransferType(val as TransferType);
                  form.setFieldValue('transferType', val);
                }}
                style={{ background: '#f5f5f5' }}
              />
            </Form.Item>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.totalRequestedQuantity || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Talep Edilen</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.totalShippedQuantity || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Sevk Edilen</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.totalReceivedQuantity || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Teslim Alınan</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Transfer Number - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="transferNumber"
              rules={[
                { required: true, message: 'Transfer numarası zorunludur' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Transfer numarası"
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
                placeholder="Transfer açıklaması ekleyin..."
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

          {/* Warehouse Selection */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <SwapOutlined className="mr-1" /> Depo Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Kaynak Depo *</div>
                <Form.Item
                  name="sourceWarehouseId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Depo seçin"
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    onChange={(val) => setSourceWarehouseId(val)}
                    options={warehouses.map(w => ({
                      value: w.id,
                      label: w.name,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Hedef Depo *</div>
                <Form.Item
                  name="destinationWarehouseId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Depo seçin"
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    onChange={(val) => setDestWarehouseId(val)}
                    options={warehouses.map(w => ({
                      value: w.id,
                      label: w.name,
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
              <CalendarOutlined className="mr-1" /> Tarihler
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Transfer Tarihi *</div>
                <Form.Item
                  name="transferDate"
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
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Tahmini Varış</div>
                <Form.Item name="expectedArrivalDate" className="mb-0">
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
                placeholder="Transfer ile ilgili ek notlar..."
                variant="filled"
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </Form.Item>
          </div>
        </Col>
      </Row>

      {/* Transfer Items Section - Full Width */}
      <div className="mt-8">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8" />

        <div className="flex items-center justify-between mb-4">
          <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            <InboxOutlined className="mr-1" /> Transfer Kalemleri
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
            className="transfer-items-table"
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
