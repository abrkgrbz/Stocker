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
  Table,
  InputNumber,
  Typography,
  Divider,
  Row,
  Col,
  message,
  AutoComplete,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import {
  useWarehouses,
  useLocations,
  useProducts,
  useCreateStockTransfer,
} from '@/lib/api/hooks/useInventory';
import type { CreateStockTransferDto, CreateStockTransferItemDto, TransferType } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface TransferItem extends CreateStockTransferItemDto {
  key: string;
  productCode?: string;
  productName?: string;
}

const transferTypes: { value: string; label: string }[] = [
  { value: 'Standard', label: 'Standart' },
  { value: 'Urgent', label: 'Acil' },
  { value: 'Replenishment', label: 'İkmal' },
  { value: 'Return', label: 'İade' },
  { value: 'Internal', label: 'Dahili' },
  { value: 'CrossDock', label: 'Cross-Dock' },
  { value: 'Consolidation', label: 'Konsolidasyon' },
];

export default function NewStockTransferPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [items, setItems] = useState<TransferItem[]>([]);
  const [selectedSourceWarehouse, setSelectedSourceWarehouse] = useState<number | undefined>();
  const [selectedDestWarehouse, setSelectedDestWarehouse] = useState<number | undefined>();
  const [productSearch, setProductSearch] = useState('');

  const { data: warehouses = [] } = useWarehouses();
  const { data: sourceLocations = [] } = useLocations(selectedSourceWarehouse);
  const { data: destLocations = [] } = useLocations(selectedDestWarehouse);
  const { data: products = [] } = useProducts();
  const createTransfer = useCreateStockTransfer();

  const handleAddItem = () => {
    const newItem: TransferItem = {
      key: `item-${Date.now()}`,
      productId: 0,
      requestedQuantity: 1,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const handleItemChange = (key: string, field: keyof TransferItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.key === key) {
          if (field === 'productId') {
            const product = products.find((p) => p.id === value);
            return {
              ...item,
              productId: value,
              productCode: product?.code,
              productName: product?.name,
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (items.length === 0) {
        message.error('En az bir ürün eklemelisiniz');
        return;
      }

      const invalidItems = items.filter((item) => !item.productId || item.requestedQuantity <= 0);
      if (invalidItems.length > 0) {
        message.error('Tüm ürünlerin seçili ve miktarlarının geçerli olduğundan emin olun');
        return;
      }

      const data: CreateStockTransferDto = {
        transferNumber: values.transferNumber,
        transferDate: values.transferDate.toISOString(),
        sourceWarehouseId: values.sourceWarehouseId,
        destinationWarehouseId: values.destinationWarehouseId,
        transferType: values.transferType,
        description: values.description,
        notes: values.notes,
        expectedArrivalDate: values.expectedArrivalDate?.toISOString(),
        createdByUserId: 1, // TODO: Get from auth context
        items: items.map((item) => ({
          productId: item.productId,
          sourceLocationId: item.sourceLocationId,
          destinationLocationId: item.destinationLocationId,
          requestedQuantity: item.requestedQuantity,
          serialNumber: item.serialNumber,
          lotNumber: item.lotNumber,
          notes: item.notes,
        })),
      };

      await createTransfer.mutateAsync(data);
      router.push('/inventory/stock-transfers');
    } catch (error) {
      // Validation or API error handled
    }
  };

  const columns: ColumnsType<TransferItem> = [
    {
      title: 'Ürün',
      dataIndex: 'productId',
      key: 'productId',
      width: 300,
      render: (_, record) => (
        <AutoComplete
          style={{ width: '100%' }}
          placeholder="Ürün ara..."
          value={record.productName || ''}
          options={products.map((p) => ({
            value: p.id,
            label: `${p.code} - ${p.name}`,
          }))}
          onSearch={setProductSearch}
          onSelect={(value) => handleItemChange(record.key, 'productId', value)}
          filterOption={false}
        />
      ),
    },
    {
      title: 'Kaynak Lokasyon',
      dataIndex: 'sourceLocationId',
      key: 'sourceLocationId',
      width: 180,
      render: (value, record) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Lokasyon"
          value={value}
          onChange={(val) => handleItemChange(record.key, 'sourceLocationId', val)}
          allowClear
          options={sourceLocations.map((l) => ({
            value: l.id,
            label: l.code,
          }))}
        />
      ),
    },
    {
      title: 'Hedef Lokasyon',
      dataIndex: 'destinationLocationId',
      key: 'destinationLocationId',
      width: 180,
      render: (value, record) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Lokasyon"
          value={value}
          onChange={(val) => handleItemChange(record.key, 'destinationLocationId', val)}
          allowClear
          options={destLocations.map((l) => ({
            value: l.id,
            label: l.code,
          }))}
        />
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'requestedQuantity',
      key: 'requestedQuantity',
      width: 120,
      render: (value, record) => (
        <InputNumber
          style={{ width: '100%' }}
          min={1}
          value={value}
          onChange={(val) => handleItemChange(record.key, 'requestedQuantity', val || 1)}
        />
      ),
    },
    {
      title: 'Lot No',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      width: 120,
      render: (value, record) => (
        <Input
          placeholder="Lot"
          value={value}
          onChange={(e) => handleItemChange(record.key, 'lotNumber', e.target.value)}
        />
      ),
    },
    {
      title: 'Seri No',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 120,
      render: (value, record) => (
        <Input
          placeholder="Seri"
          value={value}
          onChange={(e) => handleItemChange(record.key, 'serialNumber', e.target.value)}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ];

  const totalQuantity = items.reduce((sum, item) => sum + (item.requestedQuantity || 0), 0);

  return (
    <div className="max-w-7xl mx-auto">
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
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
              >
                <SwapOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Stok Transferi</h1>
                <p className="text-sm text-gray-500 m-0">Depolar arası stok transferi oluşturun</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.back()}>İptal</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={createTransfer.isPending}
              style={{ background: '#3b82f6', borderColor: '#3b82f6' }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Form */}
      <Form form={form} layout="vertical" initialValues={{ transferDate: dayjs(), transferType: 'Standard' }}>
        <Row gutter={24}>
          {/* Left Column - Transfer Info */}
          <Col xs={24} lg={8}>
            <Card title="Transfer Bilgileri" className="mb-6">
              <Form.Item
                name="transferNumber"
                label="Transfer No"
                rules={[{ required: true, message: 'Transfer numarası gerekli' }]}
              >
                <Input placeholder="TR-2024-001" />
              </Form.Item>

              <Form.Item
                name="transferDate"
                label="Transfer Tarihi"
                rules={[{ required: true, message: 'Tarih gerekli' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item
                name="transferType"
                label="Transfer Türü"
                rules={[{ required: true, message: 'Tür seçiniz' }]}
              >
                <Select options={transferTypes} />
              </Form.Item>

              <Form.Item name="expectedArrivalDate" label="Tahmini Varış Tarihi">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Card>

            <Card title="Depolar" className="mb-6">
              <Form.Item
                name="sourceWarehouseId"
                label="Kaynak Depo"
                rules={[{ required: true, message: 'Kaynak depo seçiniz' }]}
              >
                <Select
                  placeholder="Depo seçin"
                  options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                  onChange={setSelectedSourceWarehouse}
                />
              </Form.Item>

              <Form.Item
                name="destinationWarehouseId"
                label="Hedef Depo"
                rules={[{ required: true, message: 'Hedef depo seçiniz' }]}
              >
                <Select
                  placeholder="Depo seçin"
                  options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                  onChange={setSelectedDestWarehouse}
                />
              </Form.Item>
            </Card>

            <Card title="Notlar">
              <Form.Item name="description" label="Açıklama">
                <TextArea rows={2} placeholder="Transfer açıklaması..." />
              </Form.Item>

              <Form.Item name="notes" label="Notlar">
                <TextArea rows={2} placeholder="Ek notlar..." />
              </Form.Item>
            </Card>
          </Col>

          {/* Right Column - Items */}
          <Col xs={24} lg={16}>
            <Card
              title="Transfer Kalemleri"
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
                  Ürün Ekle
                </Button>
              }
            >
              <Table
                columns={columns}
                dataSource={items}
                rowKey="key"
                pagination={false}
                scroll={{ x: 1100 }}
                locale={{ emptyText: 'Henüz ürün eklenmedi' }}
              />

              {items.length > 0 && (
                <>
                  <Divider />
                  <div className="flex justify-end">
                    <div className="text-right">
                      <Text type="secondary">Toplam Kalem: </Text>
                      <Text strong>{items.length}</Text>
                      <span className="mx-4">|</span>
                      <Text type="secondary">Toplam Miktar: </Text>
                      <Text strong>{totalQuantity}</Text>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
