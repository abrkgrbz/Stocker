'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Typography,
  DatePicker,
  Button,
  Card,
  Divider,
  Table,
  Space,
  Tooltip,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import { useProducts } from '@/lib/api/hooks/useInventory';
import type { Customer } from '@/lib/api/services/crm.service';
import type { ProductDto } from '@/lib/api/services/inventory.types';
import type { SalesOrder } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';

const { Text } = Typography;

interface OrderItem {
  key: string;
  productId?: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discountRate: number;
  description?: string;
}

interface SalesOrderFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: SalesOrder;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

const vatOptions = [
  { value: 0, label: '%0' },
  { value: 1, label: '%1' },
  { value: 8, label: '%8' },
  { value: 10, label: '%10' },
  { value: 18, label: '%18' },
  { value: 20, label: '%20' },
];

const unitOptions = [
  { value: 'Adet', label: 'Adet' },
  { value: 'Kg', label: 'Kg' },
  { value: 'Lt', label: 'Lt' },
  { value: 'M', label: 'M' },
  { value: 'M2', label: 'M²' },
  { value: 'Paket', label: 'Paket' },
  { value: 'Kutu', label: 'Kutu' },
];

export default function SalesOrderForm({ form, initialValues, onFinish, loading }: SalesOrderFormProps) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');

  // Fetch customers
  const { data: customersData, isLoading: customersLoading } = useCustomers({
    searchTerm: customerSearch,
    status: 'Active',
    pageSize: 50,
  });

  // Fetch products for selection
  const { data: productsData, isLoading: productsLoading } = useProducts({
    searchTerm: productSearch,
    isActive: true,
    pageSize: 50,
  });

  const customerOptions = useMemo(() =>
    customersData?.items?.map((customer: Customer) => ({
      value: customer.id.toString(),
      label: customer.companyName || customer.contactPerson,
      customer,
    })) || [], [customersData]);

  const productOptions = useMemo(() =>
    productsData?.items?.map((product: ProductDto) => ({
      value: product.id,
      label: `${product.code} - ${product.name}`,
      product,
    })) || [], [productsData]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        customerId: initialValues.customerId,
        customerEmail: initialValues.customerEmail,
        orderDate: initialValues.orderDate ? dayjs(initialValues.orderDate) : dayjs(),
        deliveryDate: initialValues.deliveryDate ? dayjs(initialValues.deliveryDate) : undefined,
        currency: initialValues.currency || 'TRY',
        salesPersonName: initialValues.salesPersonName,
        shippingAddress: initialValues.shippingAddress,
        billingAddress: initialValues.billingAddress,
        notes: initialValues.notes,
        discountRate: initialValues.discountRate || 0,
      });
      setSelectedCurrency(initialValues.currency || 'TRY');
      // Convert order items to our format
      if (initialValues.items) {
        setItems(initialValues.items.map((item, index) => ({
          key: `item-${index}`,
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          discountRate: item.discountRate || 0,
          description: item.description,
        })));
      }
    } else {
      form.setFieldsValue({
        orderDate: dayjs(),
        currency: 'TRY',
        discountRate: 0,
      });
      // Add one empty item by default
      setItems([{
        key: 'item-0',
        productCode: '',
        productName: '',
        unit: 'Adet',
        quantity: 1,
        unitPrice: 0,
        vatRate: 18,
        discountRate: 0,
      }]);
    }
  }, [form, initialValues]);

  const handleCustomerSelect = (value: string) => {
    const customer = customerOptions.find((opt: { value: string }) => opt.value === value)?.customer as Customer;
    if (customer) {
      form.setFieldsValue({
        customerEmail: customer.email,
        shippingAddress: customer.address,
        billingAddress: customer.address,
      });
    }
  };

  const handleProductSelect = (productId: string, itemKey: string) => {
    const product = productOptions.find((opt: { value: string }) => opt.value === productId)?.product as ProductDto;
    if (product) {
      setItems(prev => prev.map(item =>
        item.key === itemKey
          ? {
              ...item,
              productId: product.id,
              productCode: product.code,
              productName: product.name,
              unitPrice: product.unitPrice || 0,
              unit: 'Adet', // Default unit
            }
          : item
      ));
    }
  };

  const updateItem = (key: string, field: keyof OrderItem, value: any) => {
    setItems(prev => prev.map(item =>
      item.key === key ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    const newKey = `item-${Date.now()}`;
    setItems(prev => [...prev, {
      key: newKey,
      productCode: '',
      productName: '',
      unit: 'Adet',
      quantity: 1,
      unitPrice: 0,
      vatRate: 18,
      discountRate: 0,
    }]);
  };

  const removeItem = (key: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.key !== key));
    }
  };

  // Calculate totals
  const calculations = useMemo(() => {
    let subTotal = 0;
    let totalVat = 0;
    let totalItemDiscount = 0;

    items.forEach(item => {
      const lineTotal = item.quantity * item.unitPrice;
      const lineDiscount = lineTotal * (item.discountRate / 100);
      const lineAfterDiscount = lineTotal - lineDiscount;
      const lineVat = lineAfterDiscount * (item.vatRate / 100);

      subTotal += lineAfterDiscount;
      totalVat += lineVat;
      totalItemDiscount += lineDiscount;
    });

    const orderDiscountRate = form.getFieldValue('discountRate') || 0;
    const orderDiscount = subTotal * (orderDiscountRate / 100);
    const grandTotal = subTotal - orderDiscount + totalVat;

    return {
      subTotal,
      totalVat,
      totalItemDiscount,
      orderDiscount,
      grandTotal,
    };
  }, [items, form]);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const orderData = {
        ...values,
        orderDate: values.orderDate?.toISOString(),
        deliveryDate: values.deliveryDate?.toISOString(),
        items: items.map((item, index) => ({
          lineNumber: index + 1,
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          discountRate: item.discountRate,
          description: item.description,
        })),
      };
      onFinish(orderData);
    });
  };

  // Trigger form submit from parent via form.submit()
  useEffect(() => {
    const originalSubmit = form.submit;
    form.submit = () => {
      handleSubmit();
    };
    return () => {
      form.submit = originalSubmit;
    };
  }, [form, items]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: selectedCurrency
    }).format(amount);

  const itemColumns = [
    {
      title: 'Ürün',
      key: 'product',
      width: 280,
      render: (_: any, record: OrderItem) => (
        <div className="space-y-1">
          <Select
            showSearch
            placeholder="Ürün seçin"
            loading={productsLoading}
            filterOption={false}
            onSearch={setProductSearch}
            onChange={(value) => handleProductSelect(value, record.key)}
            value={record.productId}
            options={productOptions}
            style={{ width: '100%' }}
            size="small"
            allowClear
          />
          <Input
            placeholder="veya manuel girin"
            value={record.productCode}
            onChange={(e) => updateItem(record.key, 'productCode', e.target.value)}
            size="small"
            style={{ width: '45%', marginRight: '5%' }}
          />
          <Input
            placeholder="Ürün adı"
            value={record.productName}
            onChange={(e) => updateItem(record.key, 'productName', e.target.value)}
            size="small"
            style={{ width: '50%' }}
          />
        </div>
      ),
    },
    {
      title: 'Miktar',
      key: 'quantity',
      width: 100,
      render: (_: any, record: OrderItem) => (
        <InputNumber
          min={0.01}
          value={record.quantity}
          onChange={(value) => updateItem(record.key, 'quantity', value || 0)}
          size="small"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Birim',
      key: 'unit',
      width: 90,
      render: (_: any, record: OrderItem) => (
        <Select
          value={record.unit}
          onChange={(value) => updateItem(record.key, 'unit', value)}
          options={unitOptions}
          size="small"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Birim Fiyat',
      key: 'unitPrice',
      width: 120,
      render: (_: any, record: OrderItem) => (
        <InputNumber
          min={0}
          precision={2}
          value={record.unitPrice}
          onChange={(value) => updateItem(record.key, 'unitPrice', value || 0)}
          size="small"
          style={{ width: '100%' }}
          prefix={selectedCurrency === 'TRY' ? '₺' : selectedCurrency === 'USD' ? '$' : '€'}
        />
      ),
    },
    {
      title: 'İnd. %',
      key: 'discountRate',
      width: 80,
      render: (_: any, record: OrderItem) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discountRate}
          onChange={(value) => updateItem(record.key, 'discountRate', value || 0)}
          size="small"
          style={{ width: '100%' }}
          suffix="%"
        />
      ),
    },
    {
      title: 'KDV %',
      key: 'vatRate',
      width: 80,
      render: (_: any, record: OrderItem) => (
        <Select
          value={record.vatRate}
          onChange={(value) => updateItem(record.key, 'vatRate', value)}
          options={vatOptions}
          size="small"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Tutar',
      key: 'total',
      width: 120,
      align: 'right' as const,
      render: (_: any, record: OrderItem) => {
        const lineTotal = record.quantity * record.unitPrice;
        const discount = lineTotal * (record.discountRate / 100);
        const afterDiscount = lineTotal - discount;
        const vat = afterDiscount * (record.vatRate / 100);
        return (
          <Text strong>{formatCurrency(afterDiscount + vat)}</Text>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 40,
      render: (_: any, record: OrderItem) => (
        <Tooltip title="Sil">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeItem(record.key)}
            disabled={items.length === 1}
            size="small"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      disabled={loading}
      className="sales-order-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Order Summary (35%) */}
        <Col xs={24} lg={9}>
          {/* Order Totals Card */}
          <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <DollarOutlined className="text-gray-500" />
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Sipariş Özeti
              </Text>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Text className="text-gray-500">Ara Toplam</Text>
                <Text className="text-lg">{formatCurrency(calculations.subTotal)}</Text>
              </div>
              {calculations.totalItemDiscount > 0 && (
                <div className="flex justify-between items-center">
                  <Text className="text-gray-500">Satır İndirimi</Text>
                  <Text className="text-red-500">-{formatCurrency(calculations.totalItemDiscount)}</Text>
                </div>
              )}
              {calculations.orderDiscount > 0 && (
                <div className="flex justify-between items-center">
                  <Text className="text-gray-500">Sipariş İndirimi</Text>
                  <Text className="text-red-500">-{formatCurrency(calculations.orderDiscount)}</Text>
                </div>
              )}
              <div className="flex justify-between items-center">
                <Text className="text-gray-500">KDV Toplam</Text>
                <Text>{formatCurrency(calculations.totalVat)}</Text>
              </div>
              <Divider className="my-3" />
              <div className="flex justify-between items-center">
                <Text strong className="text-base">Genel Toplam</Text>
                <Text strong className="text-2xl text-green-600">{formatCurrency(calculations.grandTotal)}</Text>
              </div>
            </div>
          </div>

          {/* Order Discount */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <PercentageOutlined className="text-gray-500" />
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Sipariş İndirimi
              </Text>
            </div>
            <Form.Item name="discountRate" className="mb-0">
              <InputNumber
                min={0}
                max={100}
                style={{ width: '100%' }}
                placeholder="0"
                addonAfter="%"
                size="large"
              />
            </Form.Item>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FileTextOutlined className="text-gray-500" />
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Notlar
              </Text>
            </div>
            <Form.Item name="notes" className="mb-0">
              <Input.TextArea
                rows={4}
                placeholder="Sipariş notlarını buraya yazın..."
                style={{ resize: 'none' }}
              />
            </Form.Item>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-gray-50/70 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.items?.length || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Kalem Sayısı</div>
              </div>
              <div className="p-4 bg-gray-50/70 rounded-xl text-center">
                <div className="text-sm font-semibold text-gray-800">
                  {initialValues.orderNumber}
                </div>
                <div className="text-xs text-gray-500 mt-1">Sipariş No</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (65%) */}
        <Col xs={24} lg={15}>
          {/* Customer Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <UserOutlined className="text-gray-500" />
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Müşteri Bilgileri
              </Text>
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="customerId"
                  rules={[{ required: true, message: 'Müşteri seçimi zorunludur' }]}
                  className="mb-3"
                >
                  <Select
                    showSearch
                    placeholder="Müşteri seçin veya arayın"
                    loading={customersLoading}
                    filterOption={false}
                    onSearch={setCustomerSearch}
                    onChange={handleCustomerSelect}
                    options={customerOptions}
                    size="large"
                    notFoundContent={customersLoading ? 'Yükleniyor...' : 'Müşteri bulunamadı'}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="customerEmail" className="mb-3">
                  <Input
                    placeholder="E-posta adresi"
                    size="large"
                    type="email"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Dates and Currency */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <CalendarOutlined className="text-gray-500" />
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Tarih ve Para Birimi
              </Text>
            </div>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="orderDate"
                  rules={[{ required: true, message: 'Zorunlu' }]}
                  className="mb-3"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Sipariş Tarihi"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="deliveryDate" className="mb-3">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Teslim Tarihi"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="currency" className="mb-3">
                  <Select
                    options={currencyOptions}
                    size="large"
                    onChange={setSelectedCurrency}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Sales Person */}
          <div className="mb-8">
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Satış Temsilcisi</div>
                <Form.Item name="salesPersonName" className="mb-0">
                  <Input placeholder="Satış temsilcisi adı" size="large" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Addresses */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <EnvironmentOutlined className="text-gray-500" />
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Adresler
              </Text>
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Teslimat Adresi</div>
                <Form.Item name="shippingAddress" className="mb-3">
                  <Input.TextArea rows={3} placeholder="Teslimat adresi" style={{ resize: 'none' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Fatura Adresi</div>
                <Form.Item name="billingAddress" className="mb-3">
                  <Input.TextArea rows={3} placeholder="Fatura adresi" style={{ resize: 'none' }} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Order Items */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCartOutlined className="text-gray-500" />
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Sipariş Kalemleri ({items.length})
                </Text>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addItem}
                size="small"
                style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
              >
                Kalem Ekle
              </Button>
            </div>

            <Card className="shadow-sm" styles={{ body: { padding: 0 } }}>
              <Table
                columns={itemColumns}
                dataSource={items}
                rowKey="key"
                pagination={false}
                size="small"
                scroll={{ x: 900 }}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Henüz kalem eklenmedi"
                    />
                  ),
                }}
              />
            </Card>
          </div>
        </Col>
      </Row>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <Button htmlType="submit" />
      </Form.Item>
    </Form>
  );
}
