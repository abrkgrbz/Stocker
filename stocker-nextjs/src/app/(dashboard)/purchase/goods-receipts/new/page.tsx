'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Table,
  Switch,
  Tabs,
  message,
  Spin,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  DocumentTextIcon,
  InboxIcon,
  InformationCircleIcon,
  PlusIcon,
  TrashIcon,
  TruckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useCreateGoodsReceipt, useSuppliers, usePurchaseOrders } from '@/lib/api/hooks/usePurchase';
import { useProducts, useWarehouses } from '@/lib/api/hooks/useInventory';
import type { ItemCondition } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface ReceiptItem {
  key: string;
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

const typeOptions = [
  { value: 'Standard', label: 'Standart' },
  { value: 'PartialDelivery', label: 'Kismi Teslimat' },
  { value: 'ReturnReceipt', label: 'Iade Alimi' },
  { value: 'DirectDelivery', label: 'Dogrudan Teslimat' },
  { value: 'Consignment', label: 'Konsinye' },
];

const conditionOptions = [
  { value: 'Good', label: 'Iyi' },
  { value: 'Damaged', label: 'Hasarli' },
  { value: 'Defective', label: 'Kusurlu' },
  { value: 'Expired', label: 'Vadesi Gecmis' },
  { value: 'Other', label: 'Diger' },
];

export default function NewGoodsReceiptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [form] = Form.useForm();

  const createReceipt = useCreateGoodsReceipt();
  const { data: suppliersData, isLoading: loadingSuppliers } = useSuppliers({ pageSize: 1000 });
  const { data: ordersData, isLoading: loadingOrders } = usePurchaseOrders({ pageSize: 1000 });
  const { data: productsData, isLoading: loadingProducts } = useProducts();
  const { data: warehousesData, isLoading: loadingWarehouses } = useWarehouses();

  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(orderId || undefined);

  const suppliers = suppliersData?.items || [];
  const orders = (ordersData?.items || []).filter(o => o.status === 'Sent' || o.status === 'PartiallyReceived');
  const products = productsData || [];
  const warehouses = warehousesData || [];

  const isDataLoading = loadingSuppliers || loadingOrders || loadingProducts || loadingWarehouses;

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
    const order = orders.find(o => o.id === orderId);
    if (order) {
      form.setFieldsValue({
        supplierId: order.supplierName ? order.id : undefined,
        purchaseOrderId: orderId,
      });
    }
  };

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

  const getTotalReceivedQuantity = () => {
    return items.reduce((sum, item) => sum + item.receivedQuantity, 0);
  };

  const handleSave = async (values: any) => {
    if (items.length === 0) {
      message.error('En az bir kalem eklemelisiniz');
      return;
    }

    try {
      await createReceipt.mutateAsync({
        ...values,
        receiptDate: values.receiptDate?.toISOString(),
        deliveryDate: values.deliveryDate?.toISOString(),
        items: items.map(item => ({
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          unit: item.unit,
          orderedQuantity: item.orderedQuantity,
          receivedQuantity: item.receivedQuantity,
          unitPrice: 0,
          condition: item.condition,
          lotNumber: item.lotNumber,
          serialNumber: item.serialNumber,
          expiryDate: item.expiryDate,
          storageLocation: item.storageLocation,
          notes: item.notes,
        })),
      });
      message.success('Mal alim belgesi basariyla olusturuldu');
      router.push('/purchase/goods-receipts');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push('/purchase/goods-receipts');
  };

  const isLoading = createReceipt.isPending;

  const itemColumns = [
    {
      title: 'Urun',
      key: 'product',
      width: 220,
      render: (record: ReceiptItem) => (
        <Select
          placeholder="Urun secin"
          showSearch
          optionFilterProp="children"
          value={record.productId}
          onChange={(value) => handleProductSelect(record.key, Number(value))}
          style={{ width: '100%' }}
          variant="filled"
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
      width: 70,
    },
    {
      title: 'Siparis Mik.',
      key: 'orderedQuantity',
      width: 100,
      render: (record: ReceiptItem) => (
        <InputNumber
          min={0}
          value={record.orderedQuantity}
          onChange={(value) => updateItem(record.key, 'orderedQuantity', value || 0)}
          style={{ width: '100%' }}
          variant="filled"
        />
      ),
    },
    {
      title: 'Alinan Mik.',
      key: 'receivedQuantity',
      width: 100,
      render: (record: ReceiptItem) => (
        <InputNumber
          min={0}
          value={record.receivedQuantity}
          onChange={(value) => updateItem(record.key, 'receivedQuantity', value || 0)}
          style={{ width: '100%' }}
          variant="filled"
        />
      ),
    },
    {
      title: 'Durum',
      key: 'condition',
      width: 110,
      render: (record: ReceiptItem) => (
        <Select
          value={record.condition}
          onChange={(value) => updateItem(record.key, 'condition', value)}
          style={{ width: '100%' }}
          variant="filled"
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
      width: 110,
      render: (record: ReceiptItem) => (
        <Input
          value={record.lotNumber}
          onChange={(e) => updateItem(record.key, 'lotNumber', e.target.value)}
          placeholder="Lot no"
          variant="filled"
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

  const tabItems = [
    {
      key: 'info',
      label: (
        <span className="flex items-center gap-1.5">
          <InformationCircleIcon className="w-4 h-4" />
          Temel Bilgiler
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Basic Info Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-slate-900 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">Belge Bilgileri</span>
            </div>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <div className="text-xs text-slate-400 mb-1">Satin Alma Siparisi</div>
                <Form.Item name="purchaseOrderId" className="mb-4">
                  <Select
                    placeholder="Siparis secin (opsiyonel)"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    variant="filled"
                    loading={loadingOrders}
                    onChange={handleOrderSelect}
                  >
                    {orders.map(order => (
                      <Select.Option key={order.id} value={order.id}>
                        {order.orderNumber} - {order.supplierName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <div className="text-xs text-slate-400 mb-1">Tedarikci *</div>
                <Form.Item
                  name="supplierId"
                  className="mb-4"
                  rules={[{ required: true, message: 'Tedarikci secin' }]}
                >
                  <Select
                    placeholder="Tedarikci secin"
                    showSearch
                    optionFilterProp="children"
                    variant="filled"
                    loading={loadingSuppliers}
                  >
                    {suppliers.map(supplier => (
                      <Select.Option key={supplier.id} value={supplier.id}>
                        {supplier.code} - {supplier.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <div className="text-xs text-slate-400 mb-1">Belge Tarihi *</div>
                <Form.Item
                  name="receiptDate"
                  className="mb-4"
                  rules={[{ required: true, message: 'Tarih secin' }]}
                >
                  <DatePicker className="w-full" format="DD.MM.YYYY" variant="filled" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <div className="text-xs text-slate-400 mb-1">Belge Tipi</div>
                <Form.Item name="type" className="mb-4">
                  <Select options={typeOptions} variant="filled" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <div className="text-xs text-slate-400 mb-1">Depo *</div>
                <Form.Item
                  name="warehouseId"
                  className="mb-4"
                  rules={[{ required: true, message: 'Depo secin' }]}
                >
                  <Select
                    placeholder="Depo secin"
                    showSearch
                    optionFilterProp="children"
                    variant="filled"
                    loading={loadingWarehouses}
                  >
                    {warehouses.map(warehouse => (
                      <Select.Option key={warehouse.id} value={warehouse.id.toString()}>
                        {warehouse.code} - {warehouse.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-200"></div>

          {/* Quality Check */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-slate-900 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">Kalite Kontrol</span>
            </div>
            <Form.Item
              name="requiresQualityCheck"
              valuePropName="checked"
              className="mb-0"
            >
              <div className="flex items-center gap-3">
                <Switch />
                <span className="text-sm text-slate-600">Kalite kontrolu gerekli</span>
              </div>
            </Form.Item>
          </div>
        </div>
      ),
    },
    {
      key: 'delivery',
      label: (
        <span className="flex items-center gap-1.5">
          <TruckIcon className="w-4 h-4" />
          Teslimat
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Delivery Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-slate-900 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">Teslimat Bilgileri</span>
            </div>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <div className="text-xs text-slate-400 mb-1">Irsaliye No</div>
                <Form.Item name="deliveryNoteNumber" className="mb-4">
                  <Input placeholder="Irsaliye numarasi" variant="filled" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <div className="text-xs text-slate-400 mb-1">Teslimat Tarihi</div>
                <Form.Item name="deliveryDate" className="mb-4">
                  <DatePicker className="w-full" format="DD.MM.YYYY" variant="filled" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <div className="text-xs text-slate-400 mb-1">Tasiyici</div>
                <Form.Item name="carrierName" className="mb-4">
                  <Input placeholder="Kargo/tasiyici firma" variant="filled" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <div className="text-xs text-slate-400 mb-1">Sofor</div>
                <Form.Item name="driverName" className="mb-4">
                  <Input placeholder="Sofor adi" variant="filled" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <div className="text-xs text-slate-400 mb-1">Arac Plakasi</div>
                <Form.Item name="vehiclePlate" className="mb-4">
                  <Input placeholder="Plaka" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-200"></div>

          {/* Package Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-slate-900 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">Paket Bilgileri</span>
            </div>
            <Row gutter={16}>
              <Col xs={12} md={8}>
                <div className="text-xs text-slate-400 mb-1">Toplam Paket</div>
                <Form.Item name="totalPackages" className="mb-0">
                  <InputNumber min={0} className="w-full" placeholder="0" variant="filled" />
                </Form.Item>
              </Col>
              <Col xs={12} md={8}>
                <div className="text-xs text-slate-400 mb-1">Toplam Agirlik (kg)</div>
                <Form.Item name="totalWeight" className="mb-0">
                  <InputNumber min={0} step={0.1} className="w-full" placeholder="0.00" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>
      ),
    },
    {
      key: 'notes',
      label: (
        <span className="flex items-center gap-1.5">
          <DocumentTextIcon className="w-4 h-4" />
          Notlar
        </span>
      ),
      children: (
        <div>
          <div className="text-xs text-slate-400 mb-1">Genel Not</div>
          <Form.Item name="notes" className="mb-0">
            <TextArea rows={4} placeholder="Genel notlar..." variant="filled" />
          </Form.Item>
        </div>
      ),
    },
  ];

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
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
                    Yeni Mal Alim Belgesi
                  </h1>
                  <p className="text-sm text-slate-500">
                    Tedarikçiden mal alimi kaydedin
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            receiptDate: dayjs(),
            type: 'Standard',
            requiresQualityCheck: false,
          }}
        >
          <Row gutter={32}>
            {/* Left Panel - Visual & Summary */}
            <Col xs={24} lg={9}>
              <div className="sticky top-28 space-y-6">
                {/* Visual Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-8">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 mx-auto rounded-xl bg-slate-900 flex items-center justify-center mb-4">
                      <InboxIcon className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      Mal Alim Belgesi
                    </h3>
                    <p className="text-sm text-slate-500">
                      Tedarikçiden alinan urunler
                    </p>
                  </div>

                  {/* Summary Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Kalem Sayisi</span>
                      <span className="font-medium text-slate-900">{items.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Toplam Alinan Miktar</span>
                      <span className="font-medium text-slate-900">{getTotalReceivedQuantity()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-slate-50 rounded-lg px-3 -mx-3">
                      <span className="text-sm font-medium text-slate-700">Durum</span>
                      <span className="text-sm font-semibold text-slate-600">
                        {items.length > 0 ? 'Kalem eklendi' : 'Kalem bekleniyor'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Mal Alim Islem Akisi</h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-700 shrink-0 mt-0.5">1</span>
                      <span>Siparis ile iliskilendirme (opsiyonel)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-700 shrink-0 mt-0.5">2</span>
                      <span>Alinan urunlerin kaydedilmesi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-700 shrink-0 mt-0.5">3</span>
                      <span>Stok miktarlarinin otomatik guncellenmesi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-700 shrink-0 mt-0.5">4</span>
                      <span>Kalite kontrolu (gerekirse)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Col>

            {/* Right Panel - Form Content */}
            <Col xs={24} lg={15}>
              <div className="bg-white border border-slate-200 rounded-xl p-8">
                <Tabs items={tabItems} className="supplier-form-tabs" />

                {/* Divider */}
                <div className="h-px bg-slate-200 my-6"></div>

                {/* Items Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-slate-900 rounded-full"></div>
                      <span className="text-sm font-medium text-slate-700">Alinan Kalemler</span>
                    </div>
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
                    scroll={{ x: 800 }}
                    className="border border-slate-200 rounded-lg overflow-hidden"
                    locale={{ emptyText: 'Henuz kalem eklenmedi. "Kalem Ekle" butonuna tiklayin.' }}
                    summary={() => items.length > 0 ? (
                      <Table.Summary>
                        <Table.Summary.Row className="bg-slate-50">
                          <Table.Summary.Cell index={0} colSpan={3} align="right">
                            <span className="font-semibold text-slate-700">Toplam Alinan</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="center">
                            <span className="font-bold text-slate-900">{getTotalReceivedQuantity()}</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2} colSpan={3} />
                        </Table.Summary.Row>
                      </Table.Summary>
                    ) : null}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}
