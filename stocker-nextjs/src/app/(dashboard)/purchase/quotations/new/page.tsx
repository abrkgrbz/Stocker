'use client';

import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  DatePicker,
  Table,
  InputNumber,
  Space,
  Divider,
  message,
} from 'antd';
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  CheckIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { useCreateQuotation } from '@/lib/api/hooks/usePurchase';
import { useSuppliers } from '@/lib/api/hooks/usePurchase';
import { useProducts } from '@/lib/api/hooks/useInventory';
import type { CreateQuotationDto, CreateQuotationItemDto } from '@/lib/api/services/purchase.types';

const { TextArea } = Input;

interface QuotationItemRow extends CreateQuotationItemDto {
  key: string;
  productName?: string;
}

export default function NewQuotationPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [items, setItems] = useState<QuotationItemRow[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  const createMutation = useCreateQuotation();
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers();
  const { data: productsData, isLoading: productsLoading } = useProducts();

  const handleAddItem = () => {
    const newItem: QuotationItemRow = {
      key: Date.now().toString(),
      productId: '',
      quantity: 1,
      unit: 'Adet',
      specifications: '',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };

  const handleItemChange = (key: string, field: keyof QuotationItemRow, value: any) => {
    setItems(items.map(item => {
      if (item.key === key) {
        const updated = { ...item, [field]: value };
        if (field === 'productId') {
          const product = productsData?.find((p: any) => p.id === value);
          if (product) {
            updated.productName = product.name;
            updated.unit = (product as any).unit || 'Adet';
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSubmit = async (values: any) => {
    if (items.length === 0) {
      message.error('En az bir ürün eklemelisiniz');
      return;
    }

    if (selectedSuppliers.length === 0) {
      message.error('En az bir tedarikçi seçmelisiniz');
      return;
    }

    const data: CreateQuotationDto = {
      title: values.title,
      description: values.description,
      responseDeadline: values.responseDeadline?.toISOString(),
      validityPeriod: values.validityPeriod,
      currency: values.currency || 'TRY',
      deliveryLocation: values.deliveryLocation,
      paymentTerms: values.paymentTerms,
      notes: values.notes,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit,
        specifications: item.specifications,
      })),
      supplierIds: selectedSuppliers,
    };

    try {
      await createMutation.mutateAsync(data);
      router.push('/purchase/quotations');
    } catch (error) {
      // Error handled by hook
    }
  };

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productId',
      key: 'productId',
      width: 250,
      render: (_: any, record: QuotationItemRow) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Ürün seçin"
          value={record.productId || undefined}
          onChange={(value) => handleItemChange(record.key, 'productId', value)}
          showSearch
          optionFilterProp="children"
          loading={productsLoading}
        >
          {productsData?.map((product: any) => (
            <Select.Option key={product.id} value={product.id}>
              {product.name} ({product.sku})
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (_: any, record: QuotationItemRow) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleItemChange(record.key, 'quantity', value || 1)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 120,
      render: (_: any, record: QuotationItemRow) => (
        <Select
          value={record.unit}
          onChange={(value) => handleItemChange(record.key, 'unit', value)}
          style={{ width: '100%' }}
        >
          <Select.Option value="Adet">Adet</Select.Option>
          <Select.Option value="Kg">Kg</Select.Option>
          <Select.Option value="Lt">Lt</Select.Option>
          <Select.Option value="Mt">Mt</Select.Option>
          <Select.Option value="Paket">Paket</Select.Option>
          <Select.Option value="Kutu">Kutu</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Özellikler',
      dataIndex: 'specifications',
      key: 'specifications',
      render: (_: any, record: QuotationItemRow) => (
        <Input
          placeholder="Ürün özellikleri..."
          value={record.specifications}
          onChange={(e) => handleItemChange(record.key, 'specifications', e.target.value)}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_: any, record: QuotationItemRow) => (
        <button
          onClick={() => handleRemoveItem(record.key)}
          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Yeni Teklif Talebi</h1>
                <p className="text-sm text-slate-500">Tedarikçilerden teklif isteği oluşturun</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => form.submit()}
                disabled={createMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                {createMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            currency: 'TRY',
            validityPeriod: 30,
          }}
        >
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Visual Card */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                    <DocumentTextIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Teklif Talebi (RFQ)</h3>
                  <p className="text-sm text-white/70">Tedarikçilerden fiyat teklifi alın</p>
                </div>
              </div>

              {/* Supplier Selection */}
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BuildingStorefrontIcon className="w-5 h-5 text-slate-400" />
                  <h3 className="font-medium text-slate-900">Tedarikçiler</h3>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Teklif İstenen Tedarikçiler <span className="text-red-500">*</span>
                  </label>
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Tedarikçi seçin"
                    value={selectedSuppliers}
                    onChange={setSelectedSuppliers}
                    loading={suppliersLoading}
                    optionFilterProp="children"
                    showSearch
                  >
                    {suppliersData?.items?.map(supplier => (
                      <Select.Option key={supplier.id} value={supplier.id}>
                        {supplier.name} ({supplier.code})
                      </Select.Option>
                    ))}
                  </Select>
                  <p className="text-xs text-slate-500 mt-1">En az bir tedarikçi seçmelisiniz</p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-sm text-slate-600">
                    Seçilen: <span className="font-medium text-slate-900">{selectedSuppliers.length}</span> tedarikçi
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Main Form */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                {/* Title - Hero Input */}
                <Form.Item
                  name="title"
                  rules={[
                    { required: true, message: 'Başlık zorunludur' },
                    { max: 200, message: 'En fazla 200 karakter' },
                  ]}
                  className="mb-4"
                >
                  <Input
                    placeholder="Teklif talebi başlığı"
                    variant="borderless"
                    className="text-2xl font-semibold text-slate-900 px-0 placeholder:text-slate-300"
                  />
                </Form.Item>

                <Form.Item name="description" className="mb-6">
                  <TextArea
                    placeholder="Teklif talebi hakkında açıklama..."
                    variant="borderless"
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    className="text-slate-600 px-0 placeholder:text-slate-300"
                  />
                </Form.Item>

                <Divider className="my-6" />

                {/* Details */}
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="responseDeadline"
                      label={<span className="text-sm font-medium text-slate-700">Son Teklif Tarihi</span>}
                      rules={[{ required: true, message: 'Zorunlu' }]}
                    >
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD.MM.YYYY"
                        placeholder="Tarih seçin"
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="validityPeriod"
                      label={<span className="text-sm font-medium text-slate-700">Geçerlilik Süresi (Gün)</span>}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={1}
                        max={365}
                        placeholder="30"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="currency"
                      label={<span className="text-sm font-medium text-slate-700">Para Birimi</span>}
                    >
                      <Select placeholder="Seçin">
                        <Select.Option value="TRY">TRY (₺)</Select.Option>
                        <Select.Option value="USD">USD ($)</Select.Option>
                        <Select.Option value="EUR">EUR (€)</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="paymentTerms"
                      label={<span className="text-sm font-medium text-slate-700">Ödeme Koşulları</span>}
                    >
                      <Select placeholder="Seçin">
                        <Select.Option value="Prepaid">Peşin</Select.Option>
                        <Select.Option value="Net30">Net 30 Gün</Select.Option>
                        <Select.Option value="Net60">Net 60 Gün</Select.Option>
                        <Select.Option value="Net90">Net 90 Gün</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="deliveryLocation"
                  label={<span className="text-sm font-medium text-slate-700">Teslimat Yeri</span>}
                >
                  <Input placeholder="Teslimat adresi veya lokasyonu" />
                </Form.Item>

                <Form.Item
                  name="notes"
                  label={<span className="text-sm font-medium text-slate-700">Notlar</span>}
                >
                  <TextArea
                    rows={3}
                    placeholder="Ek notlar ve açıklamalar..."
                  />
                </Form.Item>
              </div>

              {/* Items */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                  <h3 className="font-medium text-slate-900">Ürünler</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 border border-dashed border-slate-300 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Ürün Ekle
                  </button>
                </div>

                <Table
                  columns={itemColumns}
                  dataSource={items}
                  pagination={false}
                  size="small"
                  locale={{ emptyText: 'Henüz ürün eklenmedi' }}
                  className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-600 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
                />

                {items.length > 0 && (
                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                    <span className="text-sm text-slate-600">
                      Toplam: <span className="font-medium text-slate-900">{items.length}</span> ürün
                    </span>
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
