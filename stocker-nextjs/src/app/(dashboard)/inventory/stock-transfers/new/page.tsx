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
  Table,
  InputNumber,
  AutoComplete,
  Collapse,
  Segmented,
} from 'antd';
import {
  ArrowLeftIcon,
  ArrowsRightLeftIcon,
  CalendarIcon,
  CheckIcon,
  DocumentTextIcon,
  InboxIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  useWarehouses,
  useLocations,
  useProducts,
  useCreateStockTransfer,
} from '@/lib/api/hooks/useInventory';
import { TransferType, type CreateStockTransferDto, type CreateStockTransferItemDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface TransferItem extends CreateStockTransferItemDto {
  key: string;
  productCode?: string;
  productName?: string;
}

const transferTypes = [
  { value: TransferType.Standard, label: 'Standart' },
  { value: TransferType.Urgent, label: 'Acil' },
  { value: TransferType.Replenishment, label: 'İkmal' },
  { value: TransferType.Return, label: 'İade' },
  { value: TransferType.Internal, label: 'Dahili' },
  { value: TransferType.CrossDock, label: 'Cross-Dock' },
  { value: TransferType.Consolidation, label: 'Konsolidasyon' },
];

export default function NewStockTransferPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [items, setItems] = useState<TransferItem[]>([]);
  const [selectedSourceWarehouse, setSelectedSourceWarehouse] = useState<number | undefined>();
  const [selectedDestWarehouse, setSelectedDestWarehouse] = useState<number | undefined>();
  const [transferType, setTransferType] = useState<TransferType>(TransferType.Standard);

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

  const handleItemChange = (key: string, field: keyof TransferItem, value: unknown) => {
    setItems(
      items.map((item) => {
        if (item.key === key) {
          if (field === 'productId') {
            const product = products.find((p) => p.id === value);
            return {
              ...item,
              productId: value as number,
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
        return;
      }

      const invalidItems = items.filter((item) => !item.productId || item.requestedQuantity <= 0);
      if (invalidItems.length > 0) {
        return;
      }

      const data: CreateStockTransferDto = {
        transferNumber: values.transferNumber,
        transferDate: values.transferDate?.toISOString() || new Date().toISOString(),
        sourceWarehouseId: values.sourceWarehouseId,
        destinationWarehouseId: values.destinationWarehouseId,
        transferType: transferType,
        description: values.description,
        notes: values.notes,
        expectedArrivalDate: values.expectedArrivalDate?.toISOString(),
        createdByUserId: 1,
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
    } catch {
      // Validation or API error handled
    }
  };

  const columns: ColumnsType<TransferItem> = [
    {
      title: 'Ürün',
      dataIndex: 'productId',
      key: 'productId',
      width: 280,
      render: (_, record) => (
        <AutoComplete
          style={{ width: '100%' }}
          placeholder="Ürün ara..."
          value={record.productName || ''}
          options={products.map((p) => ({
            value: p.id,
            label: `${p.code} - ${p.name}`,
          }))}
          onSelect={(value) => handleItemChange(record.key, 'productId', value)}
          filterOption={(inputValue, option) =>
            option?.label?.toString().toLowerCase().includes(inputValue.toLowerCase()) || false
          }
          variant="filled"
        />
      ),
    },
    {
      title: 'Kaynak Lokasyon',
      dataIndex: 'sourceLocationId',
      key: 'sourceLocationId',
      width: 160,
      render: (value, record) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Lokasyon"
          value={value}
          onChange={(val) => handleItemChange(record.key, 'sourceLocationId', val)}
          allowClear
          variant="filled"
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
      width: 160,
      render: (value, record) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Lokasyon"
          value={value}
          onChange={(val) => handleItemChange(record.key, 'destinationLocationId', val)}
          allowClear
          variant="filled"
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
      width: 100,
      render: (value, record) => (
        <InputNumber
          style={{ width: '100%' }}
          min={1}
          value={value}
          onChange={(val) => handleItemChange(record.key, 'requestedQuantity', val || 1)}
          variant="filled"
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
          variant="filled"
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
          variant="filled"
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<TrashIcon className="w-4 h-4" />}
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ];

  const totalQuantity = items.reduce((sum, item) => sum + (item.requestedQuantity || 0), 0);

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
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              className="hover:bg-gray-100"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
              >
                <ArrowsRightLeftIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 m-0">Yeni Stok Transferi</h1>
                <p className="text-xs text-gray-500 m-0">Depolar arası stok hareketi oluşturun</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.back()}>İptal</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              onClick={handleSubmit}
              loading={createTransfer.isPending}
              disabled={items.length === 0}
              style={{ background: '#1a1a1a', borderColor: '#1a1a1a', color: 'white' }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            transferDate: dayjs(),
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column - Transfer Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Transfer Number - Hero Input */}
              <div>
                <Form.Item
                  name="transferNumber"
                  rules={[{ required: true, message: 'Transfer numarası gerekli' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Transfer numarası girin"
                    variant="borderless"
                    style={{
                      fontSize: '28px',
                      fontWeight: 600,
                      padding: '0',
                      color: '#1a1a1a',
                    }}
                  />
                </Form.Item>
                <p className="text-sm text-gray-400 mt-1">Örn: TR-2024-001</p>
              </div>

              {/* Gradient Divider */}
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent" />

              {/* Transfer Type */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  Transfer Türü
                </label>
                <Segmented
                  value={transferType}
                  onChange={(val) => setTransferType(val as TransferType)}
                  options={transferTypes}
                  block
                />
              </div>

              {/* Gradient Divider */}
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent" />

              {/* Warehouses */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  <InboxIcon className="w-4 h-4 mr-2" />
                  Depolar
                </label>

                <div className="space-y-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}
                  >
                    <p className="text-xs font-medium text-amber-700 mb-2">KAYNAK DEPO</p>
                    <Form.Item
                      name="sourceWarehouseId"
                      rules={[{ required: true, message: 'Kaynak depo seçiniz' }]}
                      className="mb-0"
                    >
                      <Select
                        placeholder="Depo seçin"
                        options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                        onChange={setSelectedSourceWarehouse}
                        variant="borderless"
                        style={{ background: 'white', borderRadius: 8 }}
                      />
                    </Form.Item>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <ArrowsRightLeftIcon className="w-4 h-4 text-gray-400 rotate-90" />
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)' }}
                  >
                    <p className="text-xs font-medium text-emerald-700 mb-2">HEDEF DEPO</p>
                    <Form.Item
                      name="destinationWarehouseId"
                      rules={[{ required: true, message: 'Hedef depo seçiniz' }]}
                      className="mb-0"
                    >
                      <Select
                        placeholder="Depo seçin"
                        options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                        onChange={setSelectedDestWarehouse}
                        variant="borderless"
                        style={{ background: 'white', borderRadius: 8 }}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Gradient Divider */}
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent" />

              {/* Dates */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Tarihler
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    name="transferDate"
                    label={<span className="text-gray-600 text-sm">Transfer Tarihi</span>}
                    rules={[{ required: true, message: 'Tarih gerekli' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      variant="filled"
                    />
                  </Form.Item>

                  <Form.Item
                    name="expectedArrivalDate"
                    label={<span className="text-gray-600 text-sm">Tahmini Varış</span>}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      variant="filled"
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Notes - Collapsible */}
              <Collapse
                ghost
                items={[
                  {
                    key: 'notes',
                    label: (
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                        Notlar ve Açıklama
                      </span>
                    ),
                    children: (
                      <div className="space-y-4 pt-2">
                        <Form.Item
                          name="description"
                          label={<span className="text-gray-600 text-sm">Açıklama</span>}
                        >
                          <TextArea
                            rows={2}
                            placeholder="Transfer açıklaması..."
                            variant="filled"
                          />
                        </Form.Item>

                        <Form.Item
                          name="notes"
                          label={<span className="text-gray-600 text-sm">Notlar</span>}
                        >
                          <TextArea
                            rows={2}
                            placeholder="Ek notlar..."
                            variant="filled"
                          />
                        </Form.Item>
                      </div>
                    ),
                  },
                ]}
              />
            </div>

            {/* Right Column - Items */}
            <div className="lg:col-span-3">
              {/* Summary Card */}
              <div
                className="p-6 rounded-2xl mb-6"
                style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Transfer Özeti</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">{items.length} Kalem</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-600 font-medium">Toplam Miktar</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">{totalQuantity}</p>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Transfer Kalemleri
                  </label>
                  <Button
                    type="primary"
                    icon={<PlusIcon className="w-4 h-4" />}
                    onClick={handleAddItem}
                    style={{ background: '#1a1a1a', borderColor: '#1a1a1a', color: 'white' }}
                  >
                    Ürün Ekle
                  </Button>
                </div>

                {items.length === 0 ? (
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all"
                    onClick={handleAddItem}
                  >
                    <ArrowsRightLeftIcon className="w-10 h-10 text-gray-300 mb-3 mx-auto" />
                    <p className="text-gray-500 font-medium">Henüz ürün eklenmedi</p>
                    <p className="text-gray-400 text-sm mt-1">Transfer edilecek ürünleri ekleyin</p>
                  </div>
                ) : (
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <Table
                      columns={columns}
                      dataSource={items}
                      rowKey="key"
                      pagination={false}
                      scroll={{ x: 1000 }}
                      size="middle"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
