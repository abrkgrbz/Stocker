'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Table,
  Spin,
  message,
  Popconfirm,
  Tabs,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  ListBulletIcon,
  PaperAirplaneIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useCreatePurchaseRequest, useSubmitPurchaseRequest, useSuppliers } from '@/lib/api/hooks/usePurchase';
import { useProducts } from '@/lib/api/hooks/useInventory';
import type { CreatePurchaseRequestDto, CreatePurchaseRequestItemDto, PurchaseRequestPriority } from '@/lib/api/services/purchase.types';

const { TextArea } = Input;

const priorityOptions = [
  { value: 'Low', label: 'Dusuk' },
  { value: 'Normal', label: 'Normal' },
  { value: 'High', label: 'Yuksek' },
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
      title: 'Urun',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record: RequestItem) => (
        <div>
          <div className="font-medium text-slate-900">{name}</div>
          {record.productCode && (
            <div className="text-xs text-slate-500">{record.productCode}</div>
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
      render: (qty: number, record: RequestItem) => (
        <span className="text-sm text-slate-900">{qty} {record.unit}</span>
      ),
    },
    {
      title: 'Tahmini Birim Fiyat',
      dataIndex: 'estimatedUnitPrice',
      key: 'estimatedUnitPrice',
      width: 150,
      align: 'right' as const,
      render: (price: number) => (
        <span className="text-sm text-slate-900">
          {price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
        </span>
      ),
    },
    {
      title: 'Toplam',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      align: 'right' as const,
      render: (amount: number) => (
        <span className="text-sm font-semibold text-slate-900">
          {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
        </span>
      ),
    },
    {
      title: 'Tercih Edilen Tedarikci',
      dataIndex: 'preferredSupplierName',
      key: 'preferredSupplierName',
      width: 180,
      render: (name: string) => (
        <span className="text-sm text-slate-500">{name || '-'}</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_: any, record: RequestItem) => (
        <Popconfirm
          title="Bu kalemi silmek istediginizden emin misiniz?"
          onConfirm={() => handleRemoveItem(record.key)}
          okText="Sil"
          cancelText="Iptal"
        >
          <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
            <TrashIcon className="w-4 h-4" />
          </button>
        </Popconfirm>
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
                  <DocumentTextIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    Yeni Satin Alma Talebi
                  </h1>
                  <p className="text-sm text-slate-500">
                    Departman ihtiyaclariniz icin talep olusturun
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
                onClick={handleSaveDraft}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                {createRequest.isPending ? 'Kaydediliyor...' : 'Taslak Kaydet'}
              </button>
              <button
                onClick={handleSaveAndSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                {isLoading ? 'Kaydediliyor...' : 'Kaydet ve Onaya Gonder'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Spin spinning={isLoading}>
          <div className="bg-white border border-slate-200 rounded-xl p-8">
            <Row gutter={48}>
              {/* Left Panel - Visual & Summary */}
              <Col xs={24} lg={10}>
                {/* Visual Representation */}
                <div className="mb-8">
                  <div className="bg-slate-900 rounded-xl p-10 flex flex-col items-center justify-center min-h-[200px]">
                    <DocumentTextIcon className="w-16 h-16 text-white/90" />
                    <p className="mt-4 text-lg font-medium text-white/90">
                      Satin Alma Talebi
                    </p>
                    <p className="text-sm text-white/60">
                      Departman ihtiyaclarini talep edin
                    </p>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-slate-600">
                      <span className="text-sm">Kalem Sayisi</span>
                      <span className="text-sm font-medium text-slate-900">{items.length}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="text-sm">Tahmini Toplam</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                      </span>
                    </div>
                  </div>
                </div>

                {/* Priority Indicator */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <div className="text-2xl font-semibold text-slate-900">
                      {items.length}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Toplam Kalem</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 0 })} TL
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Tahmini Tutar</div>
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
                          <span className="flex items-center gap-1.5">
                            <InformationCircleIcon className="w-4 h-4" />
                            Talep Bilgileri
                          </span>
                        ),
                        children: (
                          <div className="space-y-4">
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="text-xs text-slate-400 mb-1">Oncelik *</div>
                                <Form.Item
                                  name="priority"
                                  rules={[{ required: true, message: 'Oncelik secin' }]}
                                  className="mb-0"
                                >
                                  <Select options={priorityOptions} variant="filled" />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <div className="text-xs text-slate-400 mb-1">Gerekli Tarih</div>
                                <Form.Item name="requiredDate" className="mb-0">
                                  <DatePicker
                                    className="w-full"
                                    format="DD.MM.YYYY"
                                    placeholder="Tarih secin"
                                    variant="filled"
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={24}>
                                <div className="text-xs text-slate-400 mb-1">Departman</div>
                                <Form.Item name="departmentName" className="mb-0">
                                  <Input placeholder="Departman adi" variant="filled" />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={24}>
                                <div className="text-xs text-slate-400 mb-1">Amac *</div>
                                <Form.Item
                                  name="purpose"
                                  rules={[{ required: true, message: 'Amac belirtin' }]}
                                  className="mb-0"
                                >
                                  <TextArea rows={2} placeholder="Bu talebin amacini aciklayin..." variant="filled" />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={24}>
                                <div className="text-xs text-slate-400 mb-1">Gerekce</div>
                                <Form.Item name="justification" className="mb-0">
                                  <TextArea rows={2} placeholder="Talebin gerekcesini detayli aciklayin..." variant="filled" />
                                </Form.Item>
                              </Col>
                            </Row>
                          </div>
                        ),
                      },
                      {
                        key: 'budget',
                        label: (
                          <span className="flex items-center gap-1.5">
                            <CurrencyDollarIcon className="w-4 h-4" />
                            Butce
                          </span>
                        ),
                        children: (
                          <div className="space-y-4">
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="text-xs text-slate-400 mb-1">Butce Kodu</div>
                                <Form.Item name="budgetCode" className="mb-0">
                                  <Input placeholder="or: BTC-2024-001" variant="filled" />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <div className="text-xs text-slate-400 mb-1">Butce Tutari</div>
                                <Form.Item name="budgetAmount" className="mb-0">
                                  <InputNumber
                                    className="w-full"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => (parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0) as unknown as 0}
                                    precision={2}
                                    min={0}
                                    variant="filled"
                                    addonAfter="TL"
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="text-xs text-slate-400 mb-1">Para Birimi</div>
                                <Form.Item name="currency" className="mb-0">
                                  <Select
                                    variant="filled"
                                    options={[
                                      { value: 'TRY', label: 'TL TRY' },
                                      { value: 'USD', label: '$ USD' },
                                      { value: 'EUR', label: 'EUR' },
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
                          <span className="flex items-center gap-1.5">
                            <DocumentTextIcon className="w-4 h-4" />
                            Notlar
                          </span>
                        ),
                        children: (
                          <div className="space-y-4">
                            <Row gutter={16}>
                              <Col span={24}>
                                <div className="text-xs text-slate-400 mb-1">Genel Notlar</div>
                                <Form.Item name="notes" className="mb-0">
                                  <TextArea rows={4} placeholder="Ek notlar veya aciklamalar..." variant="filled" />
                                </Form.Item>
                              </Col>
                            </Row>
                          </div>
                        ),
                      },
                    ]}
                  />

                  {/* Divider */}
                  <div className="h-px bg-slate-200 my-6" />

                  {/* Request Items Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                        <ListBulletIcon className="w-4 h-4" />
                        Talep Kalemleri
                      </span>
                      <span className="text-sm text-slate-500">
                        Toplam: <span className="font-semibold text-slate-900">
                          {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                        </span>
                      </span>
                    </div>

                    {/* Add Item Form */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-4">
                      <Form form={itemForm} layout="vertical">
                        <Row gutter={16}>
                          <Col xs={24} md={6}>
                            <div className="text-xs text-slate-400 mb-1">Urun</div>
                            <Form.Item name="productId" className="mb-2">
                              <Select
                                showSearch
                                allowClear
                                placeholder="Urun secin"
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
                            <div className="text-xs text-slate-400 mb-1">Urun Adi *</div>
                            <Form.Item
                              name="productName"
                              rules={[{ required: true, message: 'Zorunlu' }]}
                              className="mb-2"
                            >
                              <Input placeholder="Urun adi" variant="filled" />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={3}>
                            <div className="text-xs text-slate-400 mb-1">Miktar *</div>
                            <Form.Item
                              name="quantity"
                              rules={[{ required: true, message: 'Zorunlu' }]}
                              className="mb-2"
                            >
                              <InputNumber className="w-full" min={1} precision={0} variant="filled" />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={3}>
                            <div className="text-xs text-slate-400 mb-1">Birim</div>
                            <Form.Item name="unit" initialValue="Adet" className="mb-2">
                              <Input placeholder="Adet" variant="filled" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={4}>
                            <div className="text-xs text-slate-400 mb-1">Tahmini Fiyat *</div>
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
                                addonAfter="TL"
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={2} className="flex items-end pb-2">
                            <button
                              type="button"
                              onClick={handleAddItem}
                              className="flex items-center justify-center gap-1 w-full px-3 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                              <PlusIcon className="w-4 h-4" />
                              Ekle
                            </button>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col xs={24} md={8}>
                            <div className="text-xs text-slate-400 mb-1">Tercih Edilen Tedarikci</div>
                            <Form.Item name="preferredSupplierId" className="mb-0">
                              <Select
                                showSearch
                                allowClear
                                placeholder="Secin (opsiyonel)"
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
                            <div className="text-xs text-slate-400 mb-1">Teknik Ozellikler</div>
                            <Form.Item name="specifications" className="mb-0">
                              <Input placeholder="Teknik ozellikler (opsiyonel)" variant="filled" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={8}>
                            <div className="text-xs text-slate-400 mb-1">Kalem Notu</div>
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
                      locale={{ emptyText: 'Henuz kalem eklenmedi' }}
                      className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
                      summary={() => items.length > 0 ? (
                        <Table.Summary.Row className="bg-slate-900">
                          <Table.Summary.Cell index={0} colSpan={3}>
                            <span className="text-sm font-medium text-white">Toplam ({items.length} kalem)</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <span className="text-base font-semibold text-white">
                              {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                            </span>
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
