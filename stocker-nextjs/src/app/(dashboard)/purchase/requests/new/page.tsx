'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Button,
  Card,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Typography,
  Divider,
  Table,
  Spin,
  message,
  Popconfirm,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
  SendOutlined,
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useCreatePurchaseRequest, useSubmitPurchaseRequest, useSuppliers } from '@/lib/api/hooks/usePurchase';
import { useProducts } from '@/lib/api/hooks/useInventory';
import type { CreatePurchaseRequestDto, CreatePurchaseRequestItemDto, PurchaseRequestPriority } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const priorityOptions = [
  { value: 'Low', label: 'Düşük' },
  { value: 'Normal', label: 'Normal' },
  { value: 'High', label: 'Yüksek' },
  { value: 'Urgent', label: 'Acil' },
];

interface RequestItem extends CreatePurchaseRequestItemDto {
  key: string;
  totalAmount: number;
}

export default function NewPurchaseRequestPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [items, setItems] = useState<RequestItem[]>([]);
  const [itemForm] = Form.useForm();

  const createRequest = useCreatePurchaseRequest();
  const submitRequest = useSubmitPurchaseRequest();
  const { data: productsData } = useProducts();
  const { data: suppliersData } = useSuppliers({ pageSize: 1000 });

  const products = productsData || [];
  const suppliers = suppliersData?.items || [];

  const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0);

  const handleAddItem = () => {
    itemForm.validateFields().then((values) => {
      const selectedProduct = products.find(p => p.id === values.productId);
      const selectedSupplier = suppliers.find(s => s.id === values.preferredSupplierId);

      const newItem: RequestItem = {
        key: Date.now().toString(),
        productId: values.productId ? String(values.productId) : undefined,
        productCode: selectedProduct?.code || values.productCode || '',
        productName: selectedProduct?.name || values.productName || '',
        description: values.description,
        unit: selectedProduct?.unitSymbol || selectedProduct?.unitName || values.unit || 'Adet',
        quantity: values.quantity,
        estimatedUnitPrice: values.estimatedUnitPrice,
        preferredSupplierId: values.preferredSupplierId,
        preferredSupplierName: selectedSupplier?.name,
        specifications: values.specifications,
        notes: values.notes,
        totalAmount: values.quantity * values.estimatedUnitPrice,
      };

      setItems([...items, newItem]);
      itemForm.resetFields();
    });
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };

  const handleProductSelect = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      itemForm.setFieldsValue({
        productCode: product.code,
        productName: product.name,
        unit: product.unitSymbol || product.unitName || 'Adet',
        estimatedUnitPrice: product.costPrice || 0,
      });
    }
  };

  const prepareRequestData = (values: any): CreatePurchaseRequestDto => {
    return {
      requiredDate: values.requiredDate?.toISOString(),
      departmentId: values.departmentId,
      departmentName: values.departmentName,
      priority: values.priority || 'Normal',
      purpose: values.purpose,
      justification: values.justification,
      currency: values.currency || 'TRY',
      budgetAmount: values.budgetAmount,
      budgetCode: values.budgetCode,
      notes: values.notes,
      items: items.map(item => ({
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        estimatedUnitPrice: item.estimatedUnitPrice,
        preferredSupplierId: item.preferredSupplierId,
        preferredSupplierName: item.preferredSupplierName,
        specifications: item.specifications,
        notes: item.notes,
      })),
    };
  };

  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields();
      if (items.length === 0) {
        message.error('En az bir kalem eklemelisiniz');
        return;
      }
      await createRequest.mutateAsync(prepareRequestData(values));
      router.push('/purchase/requests');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleSaveAndSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (items.length === 0) {
        message.error('En az bir kalem eklemelisiniz');
        return;
      }
      const result = await createRequest.mutateAsync(prepareRequestData(values));
      if (result && result.id) {
        await submitRequest.mutateAsync(result.id);
      }
      router.push('/purchase/requests');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push('/purchase/requests');
  };

  const isLoading = createRequest.isPending || submitRequest.isPending;

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record: RequestItem) => (
        <div>
          <div className="font-medium">{name}</div>
          {record.productCode && (
            <div className="text-xs text-gray-500">{record.productCode}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center' as const,
      render: (qty: number, record: RequestItem) => `${qty} ${record.unit}`,
    },
    {
      title: 'Tahmini Birim Fiyat',
      dataIndex: 'estimatedUnitPrice',
      key: 'estimatedUnitPrice',
      width: 150,
      align: 'right' as const,
      render: (price: number) => `${price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`,
    },
    {
      title: 'Toplam',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      align: 'right' as const,
      render: (amount: number) => (
        <span className="font-medium">
          {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
        </span>
      ),
    },
    {
      title: 'Tercih Edilen Tedarikçi',
      dataIndex: 'preferredSupplierName',
      key: 'preferredSupplierName',
      width: 180,
      render: (name: string) => name || '-',
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_: any, record: RequestItem) => (
        <Popconfirm
          title="Bu kalemi silmek istediğinizden emin misiniz?"
          onConfirm={() => handleRemoveItem(record.key)}
          okText="Sil"
          cancelText="İptal"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
              >
                <FileTextOutlined style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">
                  Yeni Satın Alma Talebi
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  Departman ihtiyaçlarınız için talep oluşturun
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button
              icon={<SaveOutlined />}
              onClick={handleSaveDraft}
              loading={createRequest.isPending}
            >
              Taslak Kaydet
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSaveAndSubmit}
              loading={isLoading}
              className="px-6"
            >
              Kaydet ve Onaya Gönder
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <Spin spinning={isLoading}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              priority: 'Normal',
              currency: 'TRY',
            }}
          >
            {/* Basic Info */}
            <Card title="Talep Bilgileri" className="mb-6">
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="priority"
                    label="Öncelik"
                    rules={[{ required: true, message: 'Öncelik seçin' }]}
                  >
                    <Select options={priorityOptions} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="requiredDate"
                    label="Gerekli Tarih"
                  >
                    <DatePicker
                      className="w-full"
                      format="DD.MM.YYYY"
                      placeholder="Tarih seçin"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="departmentName" label="Departman">
                    <Input placeholder="Departman adı" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="purpose"
                    label="Amaç"
                    rules={[{ required: true, message: 'Amaç belirtin' }]}
                  >
                    <TextArea rows={2} placeholder="Bu talebin amacını açıklayın..." />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="justification" label="Gerekçe">
                    <TextArea rows={2} placeholder="Talebin gerekçesini detaylı açıklayın..." />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Budget Info */}
            <Card title="Bütçe Bilgileri" className="mb-6">
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item name="budgetCode" label="Bütçe Kodu">
                    <Input placeholder="ör: BTC-2024-001" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="budgetAmount" label="Bütçe Tutarı">
                    <InputNumber
                      className="w-full"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => (parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0) as unknown as 0}
                      precision={2}
                      min={0}
                      addonAfter="₺"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="currency" label="Para Birimi">
                    <Select
                      options={[
                        { value: 'TRY', label: '₺ TRY' },
                        { value: 'USD', label: '$ USD' },
                        { value: 'EUR', label: '€ EUR' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Request Items */}
            <Card
              title="Talep Kalemleri"
              className="mb-6"
              extra={
                <Text type="secondary">
                  Toplam: <Text strong style={{ color: '#8b5cf6' }}>
                    {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </Text>
                </Text>
              }
            >
              {/* Add Item Form */}
              <Card size="small" className="mb-4 bg-gray-50">
                <Form form={itemForm} layout="vertical">
                  <Row gutter={16}>
                    <Col xs={24} md={6}>
                      <Form.Item name="productId" label="Ürün">
                        <Select
                          showSearch
                          allowClear
                          placeholder="Ürün seçin veya aşağıya yazın"
                          optionFilterProp="label"
                          onChange={handleProductSelect}
                          options={products.map((product) => ({
                            value: product.id,
                            label: `${product.name} (${product.code})`,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                      <Form.Item
                        name="productName"
                        label="Ürün Adı"
                        rules={[{ required: true, message: 'Zorunlu' }]}
                      >
                        <Input placeholder="Ürün adı" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Item
                        name="quantity"
                        label="Miktar"
                        rules={[{ required: true, message: 'Zorunlu' }]}
                      >
                        <InputNumber className="w-full" min={1} precision={0} />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Item name="unit" label="Birim" initialValue="Adet">
                        <Input placeholder="Adet" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                      <Form.Item
                        name="estimatedUnitPrice"
                        label="Tahmini Fiyat"
                        rules={[{ required: true, message: 'Zorunlu' }]}
                      >
                        <InputNumber
                          className="w-full"
                          min={0}
                          precision={2}
                          addonAfter="₺"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={2} className="flex items-end pb-6">
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddItem}
                        block
                      >
                        Ekle
                      </Button>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item name="preferredSupplierId" label="Tercih Edilen Tedarikçi">
                        <Select
                          showSearch
                          allowClear
                          placeholder="Seçin (opsiyonel)"
                          optionFilterProp="label"
                          options={suppliers.map((supplier) => ({
                            value: supplier.id,
                            label: supplier.name,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="specifications" label="Teknik Özellikler">
                        <Input placeholder="Teknik özellikler (opsiyonel)" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="notes" label="Not">
                        <Input placeholder="Kalem notu (opsiyonel)" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>

              {/* Items Table */}
              <Table
                columns={itemColumns}
                dataSource={items}
                rowKey="key"
                pagination={false}
                locale={{ emptyText: 'Henüz kalem eklenmedi' }}
                summary={() => items.length > 0 ? (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>Toplam ({items.length} kalem)</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Text strong style={{ fontSize: 16, color: '#8b5cf6' }}>
                        {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} colSpan={2} />
                  </Table.Summary.Row>
                ) : null}
              />
            </Card>

            {/* Notes */}
            <Card title="Notlar" className="mb-6">
              <Form.Item name="notes" label="Genel Notlar">
                <TextArea rows={3} placeholder="Ek notlar veya açıklamalar..." />
              </Form.Item>
            </Card>
          </Form>
        </Spin>
      </div>
    </div>
  );
}
