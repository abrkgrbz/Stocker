'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  InputNumber,
  Typography,
  Row,
  Col,
  message,
  AutoComplete,
  Switch,
  Divider,
  Table,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  AppstoreOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  useProducts,
  useProductAttributes,
  useCreateProductVariant,
} from '@/lib/api/hooks/useInventory';
import type {
  CreateProductVariantDto,
  CreateProductVariantOptionDto,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

interface VariantOption {
  key: string;
  productAttributeId: number;
  productAttributeOptionId?: number;
  value: string;
  attributeName?: string;
  optionValue?: string;
}

export default function NewProductVariantPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    name: string;
    code: string;
  } | null>(null);
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);

  const { data: products = [] } = useProducts();
  const { data: attributes = [] } = useProductAttributes();
  const createVariant = useCreateProductVariant();

  // Filter attributes that have options (Select, MultiSelect, Color, Size)
  const selectableAttributes = attributes.filter(
    (attr) =>
      ['Select', 'MultiSelect', 'Color', 'Size'].includes(attr.attributeType) &&
      attr.options &&
      attr.options.length > 0
  );

  const handleProductSelect = (value: string) => {
    const productId = Number(value);
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct({ id: product.id, name: product.name, code: product.code });
      form.setFieldsValue({ productId: product.id });
    }
  };

  const handleAddOption = () => {
    const newOption: VariantOption = {
      key: `option-${Date.now()}`,
      productAttributeId: 0,
      value: '',
    };
    setVariantOptions([...variantOptions, newOption]);
  };

  const handleRemoveOption = (key: string) => {
    setVariantOptions(variantOptions.filter((opt) => opt.key !== key));
  };

  const handleOptionChange = (
    key: string,
    field: 'productAttributeId' | 'productAttributeOptionId',
    value: number
  ) => {
    setVariantOptions(
      variantOptions.map((opt) => {
        if (opt.key === key) {
          if (field === 'productAttributeId') {
            const attr = selectableAttributes.find((a) => a.id === value);
            return {
              ...opt,
              productAttributeId: value,
              productAttributeOptionId: undefined,
              value: '',
              attributeName: attr?.name,
              optionValue: undefined,
            };
          }
          if (field === 'productAttributeOptionId') {
            const attr = selectableAttributes.find((a) => a.id === opt.productAttributeId);
            const option = attr?.options?.find((o) => o.id === value);
            return {
              ...opt,
              productAttributeOptionId: value,
              value: option?.value || '',
              optionValue: option?.value,
            };
          }
        }
        return opt;
      })
    );
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedProduct) {
        message.error('Lütfen bir ürün seçin');
        return;
      }

      // Validate options
      const validOptions = variantOptions.filter(
        (opt) => opt.productAttributeId && opt.productAttributeOptionId
      );

      const data: CreateProductVariantDto = {
        productId: selectedProduct.id,
        sku: values.sku,
        barcode: values.barcode,
        name: values.name,
        price: values.price,
        priceCurrency: values.priceCurrency || 'TRY',
        costPrice: values.costPrice,
        costPriceCurrency: values.costPriceCurrency || 'TRY',
        weight: values.weight,
        imageUrl: values.imageUrl,
        isDefault: values.isDefault || false,
        options: validOptions.map((opt) => ({
          productAttributeId: opt.productAttributeId,
          productAttributeOptionId: opt.productAttributeOptionId,
          value: opt.value,
        })),
      };

      await createVariant.mutateAsync(data);
      router.push('/inventory/product-variants');
    } catch {
      // Validation error
    }
  };

  const optionColumns: ColumnsType<VariantOption> = [
    {
      title: 'Özellik',
      key: 'attribute',
      render: (_, record) => (
        <Select
          placeholder="Özellik seçin"
          style={{ width: '100%' }}
          value={record.productAttributeId || undefined}
          onChange={(value) => handleOptionChange(record.key, 'productAttributeId', value)}
          options={selectableAttributes.map((attr) => ({
            value: attr.id,
            label: attr.name,
            disabled: variantOptions.some(
              (opt) => opt.key !== record.key && opt.productAttributeId === attr.id
            ),
          }))}
        />
      ),
    },
    {
      title: 'Değer',
      key: 'value',
      render: (_, record) => {
        const attr = selectableAttributes.find((a) => a.id === record.productAttributeId);
        return (
          <Select
            placeholder="Değer seçin"
            style={{ width: '100%' }}
            value={record.productAttributeOptionId || undefined}
            onChange={(value) => handleOptionChange(record.key, 'productAttributeOptionId', value)}
            disabled={!record.productAttributeId}
            options={
              attr?.options?.map((opt) => ({
                value: opt.id,
                label: (
                  <div className="flex items-center gap-2">
                    {attr.attributeType === 'Color' && opt.colorCode && (
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: opt.colorCode }}
                      />
                    )}
                    <span>{opt.value}</span>
                  </div>
                ),
              })) || []
            }
          />
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveOption(record.key)}
        />
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
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
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
              >
                <AppstoreOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Ürün Varyantı</h1>
                <p className="text-sm text-gray-500 m-0">SKU ve özellik bazlı varyant oluşturun</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.back()}>İptal</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={createVariant.isPending}
              style={{ background: '#6366f1', borderColor: '#6366f1' }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priceCurrency: 'TRY',
          costPriceCurrency: 'TRY',
          isDefault: false,
        }}
      >
        <Row gutter={24}>
          <Col xs={24} md={16}>
            {/* Product Selection */}
            <Card title="Ürün Seçimi" className="mb-6">
              <Form.Item
                name="productId"
                label="Ürün"
                rules={[{ required: true, message: 'Ürün seçiniz' }]}
              >
                <AutoComplete
                  placeholder="Ürün ara..."
                  value={selectedProduct?.name || ''}
                  options={products.map((p) => ({
                    value: String(p.id),
                    label: `${p.code} - ${p.name}`,
                  }))}
                  onSelect={handleProductSelect}
                  filterOption={(inputValue, option) =>
                    option?.label?.toLowerCase().includes(inputValue.toLowerCase()) ?? false
                  }
                />
              </Form.Item>

              {selectedProduct && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Text type="secondary" className="text-xs">
                    Seçilen Ürün
                  </Text>
                  <div className="font-medium">{selectedProduct.name}</div>
                  <Text type="secondary" className="text-xs">
                    {selectedProduct.code}
                  </Text>
                </div>
              )}
            </Card>

            {/* Variant Info */}
            <Card title="Varyant Bilgileri" className="mb-6">
              <Form.Item
                name="name"
                label="Varyant Adı"
                rules={[{ required: true, message: 'Varyant adı gerekli' }]}
              >
                <Input placeholder="Kırmızı - XL" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="sku"
                    label="SKU"
                    rules={[{ required: true, message: 'SKU gerekli' }]}
                  >
                    <Input placeholder="PRD-001-RED-XL" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="barcode" label="Barkod">
                    <Input placeholder="1234567890123" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="imageUrl" label="Görsel URL">
                <Input placeholder="https://..." />
              </Form.Item>
            </Card>

            {/* Variant Options */}
            <Card
              title="Varyant Özellikleri"
              className="mb-6"
              extra={
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={handleAddOption}
                  disabled={variantOptions.length >= selectableAttributes.length}
                >
                  Özellik Ekle
                </Button>
              }
            >
              {selectableAttributes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Text type="secondary">
                    Henüz seçilebilir özellik tanımlanmamış. Önce ürün özellikleri oluşturun.
                  </Text>
                </div>
              ) : (
                <Table
                  columns={optionColumns}
                  dataSource={variantOptions}
                  rowKey="key"
                  pagination={false}
                  size="small"
                  locale={{ emptyText: 'Henüz özellik eklenmedi' }}
                />
              )}
            </Card>
          </Col>

          <Col xs={24} md={8}>
            {/* Pricing */}
            <Card title="Fiyatlandırma" className="mb-6">
              <Row gutter={8}>
                <Col span={16}>
                  <Form.Item name="price" label="Satış Fiyatı">
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      precision={2}
                      placeholder="0.00"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="priceCurrency" label="Para Birimi">
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

              <Row gutter={8}>
                <Col span={16}>
                  <Form.Item name="costPrice" label="Maliyet">
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      precision={2}
                      placeholder="0.00"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="costPriceCurrency" label="Para Birimi">
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

            {/* Physical */}
            <Card title="Fiziksel Özellikler" className="mb-6">
              <Form.Item name="weight" label="Ağırlık (kg)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={3}
                  placeholder="0.000"
                />
              </Form.Item>
            </Card>

            {/* Settings */}
            <Card title="Ayarlar">
              <Form.Item name="isDefault" label="Varsayılan Varyant" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Text type="secondary" className="text-xs">
                Bu varyant, ürünün varsayılan gösterimi olarak kullanılır.
              </Text>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
