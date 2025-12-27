'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  InputNumber,
  DatePicker,
  Button,
  Table,
  Space,
  Divider,
  Card,
} from 'antd';
import {
  ShoppingCartIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { useSuppliers } from '@/lib/api/hooks/usePurchase';
import type { PurchaseOrderDto, PurchaseOrderType, PurchaseOrderItemDto } from '@/lib/api/services/purchase.types';
import { SupplierStatus } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface PurchaseOrderFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: PurchaseOrderDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const orderTypeOptions = [
  { value: 'Standard', label: 'Standart Sipariş' },
  { value: 'Blanket', label: 'Çerçeve Sipariş' },
  { value: 'Planned', label: 'Planlı Sipariş' },
  { value: 'Contract', label: 'Kontrat Sipariş' },
  { value: 'DropShip', label: 'Drop Ship' },
  { value: 'Consignment', label: 'Konsinye' },
];

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
];

interface OrderItem {
  key: string;
  productId?: string;
  productName?: string;
  productCode?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  lineTotal: number;
}

export default function PurchaseOrderForm({ form, initialValues, onFinish, loading }: PurchaseOrderFormProps) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const { data: suppliersData } = useSuppliers({ pageSize: 1000, status: SupplierStatus.Active });
  const suppliers = suppliersData?.items || [];

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        expectedDeliveryDate: initialValues.expectedDeliveryDate
          ? dayjs(initialValues.expectedDeliveryDate)
          : undefined,
        orderDate: initialValues.orderDate
          ? dayjs(initialValues.orderDate)
          : dayjs(),
      });

      // Initialize items from initial values
      if (initialValues.items && initialValues.items.length > 0) {
        setItems(initialValues.items.map((item, index) => ({
          key: `item-${index}`,
          productId: item.productId,
          productName: item.productName,
          productCode: item.productCode,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discountRate || 0,
          taxRate: item.vatRate || 18,
          lineTotal: item.totalAmount,
        })));
      }
    } else {
      form.setFieldsValue({
        orderType: 'Standard',
        currency: 'TRY',
        orderDate: dayjs(),
      });
    }
  }, [form, initialValues]);

  const handleAddItem = () => {
    const newItem: OrderItem = {
      key: `item-${Date.now()}`,
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 18,
      lineTotal: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };

  const handleItemChange = (key: string, field: keyof OrderItem, value: any) => {
    setItems(items.map(item => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate line total
        const subtotal = updatedItem.quantity * updatedItem.unitPrice;
        const discountAmount = subtotal * (updatedItem.discount / 100);
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = afterDiscount * (updatedItem.taxRate / 100);
        updatedItem.lineTotal = afterDiscount + taxAmount;
        return updatedItem;
      }
      return item;
    }));
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalDiscount = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    return sum + (itemSubtotal * (item.discount / 100));
  }, 0);
  const totalTax = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const afterDiscount = itemSubtotal - (itemSubtotal * (item.discount / 100));
    return sum + (afterDiscount * (item.taxRate / 100));
  }, 0);
  const grandTotal = subtotal - totalDiscount + totalTax;

  const handleSubmit = (values: any) => {
    onFinish({
      ...values,
      orderDate: values.orderDate?.toISOString(),
      expectedDeliveryDate: values.expectedDeliveryDate?.toISOString(),
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discount,
        taxRate: item.taxRate,
      })),
    });
  };

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
      render: (_: any, record: OrderItem) => (
        <Input
          placeholder="Ürün adı"
          value={record.productName}
          onChange={(e) => handleItemChange(record.key, 'productName', e.target.value)}
          variant="borderless"
        />
      ),
    },
    {
      title: 'Kod',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      render: (_: any, record: OrderItem) => (
        <Input
          placeholder="Ürün kodu"
          value={record.productCode}
          onChange={(e) => handleItemChange(record.key, 'productCode', e.target.value)}
          variant="borderless"
        />
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (_: any, record: OrderItem) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(val) => handleItemChange(record.key, 'quantity', val || 1)}
          variant="borderless"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 130,
      render: (_: any, record: OrderItem) => (
        <InputNumber
          min={0}
          value={record.unitPrice}
          onChange={(val) => handleItemChange(record.key, 'unitPrice', val || 0)}
          variant="borderless"
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value?.replace(/,/g, '') as unknown as number}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'İskonto %',
      dataIndex: 'discount',
      key: 'discount',
      width: 100,
      render: (_: any, record: OrderItem) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discount}
          onChange={(val) => handleItemChange(record.key, 'discount', val || 0)}
          variant="borderless"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'KDV %',
      dataIndex: 'taxRate',
      key: 'taxRate',
      width: 80,
      render: (_: any, record: OrderItem) => (
        <Select
          value={record.taxRate}
          onChange={(val) => handleItemChange(record.key, 'taxRate', val)}
          variant="borderless"
          style={{ width: '100%' }}
          options={[
            { value: 0, label: '0%' },
            { value: 1, label: '1%' },
            { value: 8, label: '8%' },
            { value: 10, label: '10%' },
            { value: 18, label: '18%' },
            { value: 20, label: '20%' },
          ]}
        />
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'lineTotal',
      key: 'lineTotal',
      width: 130,
      align: 'right' as const,
      render: (_: any, record: OrderItem) => (
        <Text strong>{record.lineTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_: any, record: OrderItem) => (
        <Button
          type="text"
          icon={<TrashIcon className="w-4 h-4" />}
          danger
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      disabled={loading}
      className="purchase-order-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Summary (40%) */}
        <Col xs={24} lg={10}>
          {/* Order Visual Representation */}
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
              <ShoppingCartIcon className="w-16 h-16 text-white/90" />
              <p className="mt-4 text-lg font-medium text-white/90">
                Satın Alma Siparişi
              </p>
              <p className="text-sm text-white/60">
                Tedarikçiye sipariş oluşturun
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <Card size="small" className="mb-4">
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Ara Toplam</span>
                <span>{subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>İskonto</span>
                <span className="text-red-500">-{totalDiscount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>KDV</span>
                <span>{totalTax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Genel Toplam</span>
                <span className="text-green-600">{grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
              </div>
            </div>
          </Card>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.items?.length || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Kalem</div>
              </div>
              <div className="p-4 bg-blue-50/50 rounded-xl text-center">
                <div className="text-sm font-semibold text-blue-600">
                  {initialValues.orderNumber}
                </div>
                <div className="text-xs text-gray-500 mt-1">Sipariş No</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Basic Info Section */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center">
              <UserIcon className="w-4 h-4 mr-1" /> Tedarikçi ve Sipariş Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Tedarikçi *</div>
                <Form.Item
                  name="supplierId"
                  rules={[{ required: true, message: 'Tedarikçi seçin' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Tedarikçi seçin"
                    variant="filled"
                    showSearch
                    optionFilterProp="label"
                    options={suppliers.map(s => ({
                      value: s.id,
                      label: `${s.name} (${s.code})`,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Sipariş Tipi</div>
                <Form.Item name="orderType" className="mb-0">
                  <Select
                    placeholder="Tip seçin"
                    variant="filled"
                    options={orderTypeOptions}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Row gutter={16} className="mb-6">
            <Col span={8}>
              <div className="text-xs text-gray-400 mb-1 flex items-center">
                <CalendarIcon className="w-3 h-3 mr-1" /> Sipariş Tarihi
              </div>
              <Form.Item name="orderDate" className="mb-0">
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD.MM.YYYY"
                  variant="filled"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <div className="text-xs text-gray-400 mb-1">Beklenen Teslim Tarihi</div>
              <Form.Item name="expectedDeliveryDate" className="mb-0">
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD.MM.YYYY"
                  variant="filled"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <div className="text-xs text-gray-400 mb-1">Para Birimi</div>
              <Form.Item name="currency" className="mb-0">
                <Select
                  variant="filled"
                  options={currencyOptions}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-6" />

          {/* Order Items */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Sipariş Kalemleri
              </Text>
              <Button
                type="dashed"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={handleAddItem}
                size="small"
              >
                Kalem Ekle
              </Button>
            </div>

            <Table
              dataSource={items}
              columns={itemColumns}
              pagination={false}
              size="small"
              scroll={{ x: 900 }}
              locale={{ emptyText: 'Henüz kalem eklenmedi' }}
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-6" />

          {/* Additional Info */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Ek Bilgiler
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Tedarikçi Referans No</div>
                <Form.Item name="supplierReference" className="mb-0">
                  <Input placeholder="Tedarikçi referans no" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Teslim Adresi</div>
                <Form.Item name="deliveryAddress" className="mb-0">
                  <Input placeholder="Teslim adresi" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Row gutter={16}>
            <Col span={24}>
              <div className="text-xs text-gray-400 mb-1">Notlar</div>
              <Form.Item name="notes" className="mb-0">
                <TextArea
                  placeholder="Sipariş hakkında notlar..."
                  variant="filled"
                  autoSize={{ minRows: 3, maxRows: 6 }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
