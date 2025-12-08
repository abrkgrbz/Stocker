'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Button,
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
  Tabs,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
  SendOutlined,
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  DollarOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useCreatePurchaseRequest, useSubmitPurchaseRequest, useSuppliers } from '@/lib/api/hooks/usePurchase';
import { useProducts } from '@/lib/api/hooks/useInventory';
import type { CreatePurchaseRequestDto, CreatePurchaseRequestItemDto, PurchaseRequestPriority } from '@/lib/api/services/purchase.types';

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
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' }}
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <Row gutter={48}>
              {/* Left Panel - Visual & Summary */}
              <Col xs={24} lg={10}>
                {/* Visual Representation */}
                <div className="mb-8">
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                      borderRadius: '16px',
                      padding: '40px 20px',
                      minHeight: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileTextOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
                    <p className="mt-4 text-lg font-medium text-white/90">
                      Satın Alma Talebi
                    </p>
                    <p className="text-sm text-white/60">
                      Departman ihtiyaçlarını talep edin
                    </p>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="bg-gray-50/50 rounded-xl p-4 mb-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Kalem Sayısı</span>
                      <span className="font-medium">{items.length}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tahmini Toplam</span>
                      <span className="font-semibold text-purple-600">
                        {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </span>
                    </div>
                  </div>
                </div>

                {/* Priority Indicator */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-purple-50/50 rounded-xl text-center">
                    <div className="text-2xl font-semibold text-purple-600">
                      {items.length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Toplam Kalem</div>
                  </div>
                  <div className="p-4 bg-green-50/50 rounded-xl text-center">
                    <div className="text-sm font-semibold text-green-600 truncate">
                      {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 0 })} ₺
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Tahmini Tutar</div>
                  </div>
                </div>
              </Col>

              {/* Right Panel - Form Content */}
              <Col xs={24} lg={14}>
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    priority: 'Normal',
                    currency: 'TRY',
                  }}
                >
                  <Tabs
                    defaultActiveKey="basic"
                    items={[
                      {
                        key: 'basic',
                        label: (
                          <span>
                            <InfoCircleOutlined className="mr-1" />
                            Talep Bilgileri
                          </span>
                        ),
                        children: (
                          <div className="space-y-4">
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="text-xs text-gray-400 mb-1">Öncelik *</div>
                                <Form.Item
                                  name="priority"
                                  rules={[{ required: true, message: 'Öncelik seçin' }]}
                                  className="mb-0"
                                >
                                  <Select options={priorityOptions} variant="filled" />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <div className="text-xs text-gray-400 mb-1">Gerekli Tarih</div>
                                <Form.Item name="requiredDate" className="mb-0">
                                  <DatePicker
                                    className="w-full"
                                    format="DD.MM.YYYY"
                                    placeholder="Tarih seçin"
                                    variant="filled"
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={24}>
                                <div className="text-xs text-gray-400 mb-1">Departman</div>
                                <Form.Item name="departmentName" className="mb-0">
                                  <Input placeholder="Departman adı" variant="filled" />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={24}>
                                <div className="text-xs text-gray-400 mb-1">Amaç *</div>
                                <Form.Item
                                  name="purpose"
                                  rules={[{ required: true, message: 'Amaç belirtin' }]}
                                  className="mb-0"
                                >
                                  <TextArea rows={2} placeholder="Bu talebin amacını açıklayın..." variant="filled" />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={24}>
                                <div className="text-xs text-gray-400 mb-1">Gerekçe</div>
                                <Form.Item name="justification" className="mb-0">
                                  <TextArea rows={2} placeholder="Talebin gerekçesini detaylı açıklayın..." variant="filled" />
                                </Form.Item>
                              </Col>
                            </Row>
                          </div>
                        ),
                      },
                      {
                        key: 'budget',
                        label: (
                          <span>
                            <DollarOutlined className="mr-1" />
                            Bütçe
                          </span>
                        ),
                        children: (
                          <div className="space-y-4">
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="text-xs text-gray-400 mb-1">Bütçe Kodu</div>
                                <Form.Item name="budgetCode" className="mb-0">
                                  <Input placeholder="ör: BTC-2024-001" variant="filled" />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <div className="text-xs text-gray-400 mb-1">Bütçe Tutarı</div>
                                <Form.Item name="budgetAmount" className="mb-0">
                                  <InputNumber
                                    className="w-full"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => (parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0) as unknown as 0}
                                    precision={2}
                                    min={0}
                                    variant="filled"
                                    addonAfter="₺"
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="text-xs text-gray-400 mb-1">Para Birimi</div>
                                <Form.Item name="currency" className="mb-0">
                                  <Select
                                    variant="filled"
                                    options={[
                                      { value: 'TRY', label: '₺ TRY' },
                                      { value: 'USD', label: '$ USD' },
                                      { value: 'EUR', label: '€ EUR' },
                                    ]}
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          </div>
                        ),
                      },
                      {
                        key: 'notes',
                        label: (
                          <span>
                            <FileTextOutlined className="mr-1" />
                            Notlar
                          </span>
                        ),
                        children: (
                          <div className="space-y-4">
                            <Row gutter={16}>
                              <Col span={24}>
                                <div className="text-xs text-gray-400 mb-1">Genel Notlar</div>
                                <Form.Item name="notes" className="mb-0">
                                  <TextArea rows={4} placeholder="Ek notlar veya açıklamalar..." variant="filled" />
                                </Form.Item>
                              </Col>
                            </Row>
                          </div>
                        ),
                      },
                    ]}
                  />

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent my-6" />

                  {/* Request Items Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <UnorderedListOutlined className="mr-1" />
                        Talep Kalemleri
                      </Text>
                      <Text type="secondary" className="text-sm">
                        Toplam: <Text strong style={{ color: '#a855f7' }}>
                          {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </Text>
                      </Text>
                    </div>

                    {/* Add Item Form */}
                    <div className="bg-gray-50/50 rounded-xl p-4 mb-4">
                      <Form form={itemForm} layout="vertical">
                        <Row gutter={16}>
                          <Col xs={24} md={6}>
                            <div className="text-xs text-gray-400 mb-1">Ürün</div>
                            <Form.Item name="productId" className="mb-2">
                              <Select
                                showSearch
                                allowClear
                                placeholder="Ürün seçin"
                                optionFilterProp="label"
                                onChange={handleProductSelect}
                                variant="filled"
                                options={products.map((product) => ({
                                  value: product.id,
                                  label: `${product.name} (${product.code})`,
                                }))}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={6}>
                            <div className="text-xs text-gray-400 mb-1">Ürün Adı *</div>
                            <Form.Item
                              name="productName"
                              rules={[{ required: true, message: 'Zorunlu' }]}
                              className="mb-2"
                            >
                              <Input placeholder="Ürün adı" variant="filled" />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={3}>
                            <div className="text-xs text-gray-400 mb-1">Miktar *</div>
                            <Form.Item
                              name="quantity"
                              rules={[{ required: true, message: 'Zorunlu' }]}
                              className="mb-2"
                            >
                              <InputNumber className="w-full" min={1} precision={0} variant="filled" />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={3}>
                            <div className="text-xs text-gray-400 mb-1">Birim</div>
                            <Form.Item name="unit" initialValue="Adet" className="mb-2">
                              <Input placeholder="Adet" variant="filled" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={4}>
                            <div className="text-xs text-gray-400 mb-1">Tahmini Fiyat *</div>
                            <Form.Item
                              name="estimatedUnitPrice"
                              rules={[{ required: true, message: 'Zorunlu' }]}
                              className="mb-2"
                            >
                              <InputNumber
                                className="w-full"
                                min={0}
                                precision={2}
                                variant="filled"
                                addonAfter="₺"
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={2} className="flex items-end pb-2">
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={handleAddItem}
                              block
                              style={{ background: '#a855f7' }}
                            >
                              Ekle
                            </Button>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col xs={24} md={8}>
                            <div className="text-xs text-gray-400 mb-1">Tercih Edilen Tedarikçi</div>
                            <Form.Item name="preferredSupplierId" className="mb-0">
                              <Select
                                showSearch
                                allowClear
                                placeholder="Seçin (opsiyonel)"
                                optionFilterProp="label"
                                variant="filled"
                                options={suppliers.map((supplier) => ({
                                  value: supplier.id,
                                  label: supplier.name,
                                }))}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={8}>
                            <div className="text-xs text-gray-400 mb-1">Teknik Özellikler</div>
                            <Form.Item name="specifications" className="mb-0">
                              <Input placeholder="Teknik özellikler (opsiyonel)" variant="filled" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={8}>
                            <div className="text-xs text-gray-400 mb-1">Kalem Notu</div>
                            <Form.Item name="notes" className="mb-0">
                              <Input placeholder="Kalem notu (opsiyonel)" variant="filled" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Form>
                    </div>

                    {/* Items Table */}
                    <Table
                      columns={itemColumns}
                      dataSource={items}
                      rowKey="key"
                      pagination={false}
                      size="small"
                      locale={{ emptyText: 'Henüz kalem eklenmedi' }}
                      summary={() => items.length > 0 ? (
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={3}>
                            <Text strong>Toplam ({items.length} kalem)</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <Text strong style={{ fontSize: 16, color: '#a855f7' }}>
                              {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                            </Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2} colSpan={2} />
                        </Table.Summary.Row>
                      ) : null}
                    />
                  </div>
                </Form>
              </Col>
            </Row>
          </div>
        </Spin>
      </div>
    </div>
  );
}
