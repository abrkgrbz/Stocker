'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Table,
  Divider,
  Spin,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  InboxIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useGoodsReceipt, useUpdateGoodsReceipt, useSuppliers } from '@/lib/api/hooks/usePurchase';
import { useProducts, useWarehouses } from '@/lib/api/hooks/useInventory';
import type { ItemCondition } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface ReceiptItem {
  key: string;
  id?: string;
  productId?: string;
  productCode: string;
  productName: string;
  unit: string;
  orderedQuantity: number;
  receivedQuantity: number;
  condition: ItemCondition;
  lotNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  storageLocation?: string;
  notes?: string;
}

const conditionOptions = [
  { value: 'Good', label: 'Iyi' },
  { value: 'Damaged', label: 'Hasarli' },
  { value: 'Defective', label: 'Kusurlu' },
  { value: 'Expired', label: 'Vadesi Gecmis' },
  { value: 'Other', label: 'Diger' },
];

export default function EditGoodsReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const receiptId = params.id as string;
  const [form] = Form.useForm();

  const { data: receipt, isLoading: receiptLoading } = useGoodsReceipt(receiptId);
  const updateReceipt = useUpdateGoodsReceipt();
  const { data: suppliersData } = useSuppliers({ pageSize: 1000 });
  const { data: productsData } = useProducts();
  const { data: warehousesData } = useWarehouses();

  const [items, setItems] = useState<ReceiptItem[]>([]);

  const suppliers = suppliersData?.items || [];
  const products = productsData || [];
  const warehouses = warehousesData || [];

  useEffect(() => {
    if (receipt) {
      form.setFieldsValue({
        ...receipt,
        receiptDate: receipt.receiptDate ? dayjs(receipt.receiptDate) : null,
        deliveryDate: receipt.deliveryDate ? dayjs(receipt.deliveryDate) : null,
      });

      if (receipt.items) {
        setItems(receipt.items.map((item, index) => ({
          key: item.id || index.toString(),
          id: item.id,
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          unit: item.unit,
          orderedQuantity: item.orderedQuantity,
          receivedQuantity: item.receivedQuantity,
          condition: item.condition as ItemCondition,
          lotNumber: item.lotNumber,
          serialNumber: item.serialNumber,
          storageLocation: item.storageLocation,
          notes: item.notes,
        })));
      }
    }
  }, [receipt, form]);

  if (receiptLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
          <InboxIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-medium text-slate-900 mb-2">Mal alim belgesi bulunamadi</h2>
        <p className="text-sm text-slate-500 mb-4">Bu belge silinmis veya erisim yetkiniz yok olabilir.</p>
        <button
          onClick={() => router.push('/purchase/goods-receipts')}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Mal Alim Belgelerine Don
        </button>
      </div>
    );
  }

  if (receipt.status !== 'Draft') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
          <InboxIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-medium text-slate-900 mb-2">Bu belge duzenlenemez</h2>
        <p className="text-sm text-slate-500 mb-4">Sadece taslak belgeler duzenlenebilir.</p>
        <button
          onClick={() => router.push(`/purchase/goods-receipts/${receiptId}`)}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Belgeye Don
        </button>
      </div>
    );
  }

  const addItem = () => {
    const newItem: ReceiptItem = {
      key: Date.now().toString(),
      productCode: '',
      productName: '',
      unit: 'Adet',
      orderedQuantity: 0,
      receivedQuantity: 1,
      condition: 'Good' as ItemCondition,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };

  const updateItem = (key: string, field: string, value: any) => {
    setItems(items.map(item =>
      item.key === key ? { ...item, [field]: value } : item
    ));
  };

  const handleProductSelect = (key: string, productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setItems(items.map(item =>
        item.key === key ? {
          ...item,
          productId: String(productId),
          productCode: product.code,
          productName: product.name,
          unit: product.unitSymbol || product.unitName || 'Adet',
        } : item
      ));
    }
  };

  const handleSave = async (values: any) => {
    try {
      await updateReceipt.mutateAsync({
        id: receiptId,
        data: {
          deliveryNoteNumber: values.deliveryNoteNumber,
          deliveryDate: values.deliveryDate?.toISOString(),
          carrierName: values.carrierName,
          driverName: values.driverName,
          vehiclePlate: values.vehiclePlate,
          totalPackages: values.totalPackages,
          totalWeight: values.totalWeight,
          notes: values.notes,
          internalNotes: values.internalNotes,
        },
      });
      router.push(`/purchase/goods-receipts/${receiptId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/purchase/goods-receipts/${receiptId}`);
  };

  const isLoading = updateReceipt.isPending;

  const itemColumns = [
    {
      title: 'Urun',
      key: 'product',
      width: 250,
      render: (record: ReceiptItem) => (
        <Select
          placeholder="Urun secin"
          showSearch
          optionFilterProp="children"
          value={record.productId}
          onChange={(value) => handleProductSelect(record.key, Number(value))}
          style={{ width: '100%' }}
        >
          {products.map(product => (
            <Select.Option key={product.id} value={product.id}>
              {product.code} - {product.name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: 'Siparis Miktari',
      key: 'orderedQuantity',
      width: 120,
      render: (record: ReceiptItem) => (
        <InputNumber
          min={0}
          value={record.orderedQuantity}
          onChange={(value) => updateItem(record.key, 'orderedQuantity', value || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Alinan Miktar',
      key: 'receivedQuantity',
      width: 120,
      render: (record: ReceiptItem) => (
        <InputNumber
          min={0}
          value={record.receivedQuantity}
          onChange={(value) => updateItem(record.key, 'receivedQuantity', value || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Durum',
      key: 'condition',
      width: 130,
      render: (record: ReceiptItem) => (
        <Select
          value={record.condition}
          onChange={(value) => updateItem(record.key, 'condition', value)}
          style={{ width: '100%' }}
        >
          {conditionOptions.map(opt => (
            <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Lot No',
      key: 'lotNumber',
      width: 120,
      render: (record: ReceiptItem) => (
        <Input
          value={record.lotNumber}
          onChange={(e) => updateItem(record.key, 'lotNumber', e.target.value)}
          placeholder="Lot no"
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (record: ReceiptItem) => (
        <button
          onClick={() => removeItem(record.key)}
          className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center">
                  <InboxIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    Mal Alim Belgesi Duzenle
                  </h1>
                  <p className="text-sm text-slate-500">
                    {receipt.receiptNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-4 h-4" />
                Iptal
              </button>
              <button
                onClick={() => form.submit()}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={24}>
            {/* Left Column */}
            <Col xs={24} lg={16}>
              {/* Basic Info - Read Only */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-medium text-slate-900 mb-4">Temel Bilgiler</h3>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label={<span className="text-slate-600">Tedarikci</span>}>
                      <Input value={receipt.supplierName} disabled className="bg-slate-50" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label={<span className="text-slate-600">Siparis No</span>}>
                      <Input value={receipt.purchaseOrderNumber || '-'} disabled className="bg-slate-50" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label={<span className="text-slate-600">Belge Tarihi</span>}>
                      <DatePicker
                        value={dayjs(receipt.receiptDate)}
                        disabled
                        className="w-full bg-slate-50"
                        format="DD.MM.YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label={<span className="text-slate-600">Belge Tipi</span>}>
                      <Input value={receipt.type} disabled className="bg-slate-50" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label={<span className="text-slate-600">Depo</span>}>
                      <Input value={receipt.warehouseName || '-'} disabled className="bg-slate-50" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Items */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-900">Alinan Kalemler</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Kalem Ekle
                  </button>
                </div>
                <Table
                  dataSource={items}
                  columns={itemColumns}
                  rowKey="key"
                  pagination={false}
                  size="small"
                  scroll={{ x: 900 }}
                  className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
                />
              </div>

              {/* Notes */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-medium text-slate-900 mb-4">Notlar</h3>
                <Form.Item name="notes" label={<span className="text-slate-600">Genel Notlar</span>}>
                  <TextArea rows={3} placeholder="Genel notlar..." />
                </Form.Item>
                <Form.Item name="internalNotes" label={<span className="text-slate-600">Dahili Notlar</span>}>
                  <TextArea rows={2} placeholder="Dahili notlar (musteriye gosterilmez)..." />
                </Form.Item>
              </div>
            </Col>

            {/* Right Column */}
            <Col xs={24} lg={8}>
              {/* Delivery Info */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-medium text-slate-900 mb-4">Teslimat Bilgileri</h3>
                <Form.Item name="deliveryNoteNumber" label={<span className="text-slate-600">Irsaliye No</span>}>
                  <Input placeholder="Irsaliye numarasi" />
                </Form.Item>
                <Form.Item name="deliveryDate" label={<span className="text-slate-600">Teslimat Tarihi</span>}>
                  <DatePicker className="w-full" format="DD.MM.YYYY" />
                </Form.Item>
                <Divider className="my-4" />
                <Form.Item name="carrierName" label={<span className="text-slate-600">Tasiyici</span>}>
                  <Input placeholder="Kargo/tasiyici firma" />
                </Form.Item>
                <Form.Item name="driverName" label={<span className="text-slate-600">Sofor</span>}>
                  <Input placeholder="Sofor adi" />
                </Form.Item>
                <Form.Item name="vehiclePlate" label={<span className="text-slate-600">Arac Plakasi</span>}>
                  <Input placeholder="Plaka" />
                </Form.Item>
              </div>

              {/* Package Info */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-medium text-slate-900 mb-4">Paket Bilgileri</h3>
                <Form.Item name="totalPackages" label={<span className="text-slate-600">Toplam Paket</span>}>
                  <InputNumber min={0} className="w-full" placeholder="0" />
                </Form.Item>
                <Form.Item name="totalWeight" label={<span className="text-slate-600">Toplam Agirlik (kg)</span>}>
                  <InputNumber min={0} step={0.1} className="w-full" placeholder="0.00" />
                </Form.Item>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}
