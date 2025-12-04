'use client';

import React, { useState, useMemo } from 'react';
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
  Table,
  Alert,
  Tooltip,
  Steps,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  SkinOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ShoppingOutlined,
  TagOutlined,
  DollarOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  useProducts,
  useProductAttributes,
  useCreateProductVariant,
} from '@/lib/api/hooks/useInventory';
import type {
  CreateProductVariantDto,
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
  const [currentStep, setCurrentStep] = useState(0);
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
  const selectableAttributes = useMemo(() =>
    attributes.filter(
      (attr) =>
        ['Select', 'MultiSelect', 'Color', 'Size'].includes(attr.attributeType) &&
        attr.options &&
        attr.options.length > 0
    ),
    [attributes]
  );

  const handleProductSelect = (value: string) => {
    const productId = Number(value);
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct({ id: product.id, name: product.name, code: product.code });
      form.setFieldsValue({ productId: product.id });
      setCurrentStep(1);
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

  // Generate variant name preview from options
  const variantNamePreview = useMemo(() => {
    if (!selectedProduct) return '';
    const optionNames = variantOptions
      .filter((opt) => opt.optionValue)
      .map((opt) => opt.optionValue)
      .join(' - ');
    return optionNames ? `${selectedProduct.name} - ${optionNames}` : selectedProduct.name;
  }, [selectedProduct, variantOptions]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
              >
                <SkinOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Ürün Varyantı</h1>
                <p className="text-sm text-gray-400 m-0">SKU ve özellik bazlı varyant oluşturun</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.back()}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={createVariant.isPending}
              disabled={!selectedProduct}
              style={{
                background: selectedProduct ? '#6366f1' : undefined,
                borderColor: selectedProduct ? '#6366f1' : undefined
              }}
            >
              Varyantı Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-6xl mx-auto">
        {/* Progress Steps */}
        <Card className="mb-6" styles={{ body: { padding: '16px 24px' } }}>
          <Steps
            current={currentStep}
            size="small"
            items={[
              {
                title: 'Ürün Seçimi',
                icon: <ShoppingOutlined />,
                status: selectedProduct ? 'finish' : 'process',
              },
              {
                title: 'Varyant Bilgileri',
                icon: <TagOutlined />,
                status: currentStep >= 1 ? (currentStep > 1 ? 'finish' : 'process') : 'wait',
              },
              {
                title: 'Fiyatlandırma',
                icon: <DollarOutlined />,
                status: currentStep >= 2 ? 'process' : 'wait',
              },
            ]}
          />
        </Card>

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
            <Col xs={24} lg={16}>
              {/* Product Selection Card */}
              <Card
                className="mb-6"
                styles={{
                  header: { borderBottom: 'none', paddingBottom: 0 },
                  body: { paddingTop: 16 }
                }}
                title={
                  <div className="flex items-center gap-2">
                    <ShoppingOutlined className="text-indigo-500" />
                    <span>Ürün Seçimi</span>
                  </div>
                }
              >
                <Form.Item
                  name="productId"
                  rules={[{ required: true, message: 'Ürün seçiniz' }]}
                >
                  <AutoComplete
                    placeholder="Ürün kodu veya adı ile arayın..."
                    size="large"
                    value={selectedProduct?.name || ''}
                    options={products.map((p) => ({
                      value: String(p.id),
                      label: (
                        <div className="flex items-center justify-between py-1">
                          <div>
                            <span className="font-medium">{p.name}</span>
                            <span className="text-gray-400 ml-2">({p.code})</span>
                          </div>
                        </div>
                      ),
                    }))}
                    onSelect={handleProductSelect}
                    filterOption={(inputValue, option) =>
                      products.find(p => String(p.id) === option?.value)?.name?.toLowerCase().includes(inputValue.toLowerCase()) ||
                      products.find(p => String(p.id) === option?.value)?.code?.toLowerCase().includes(inputValue.toLowerCase()) ||
                      false
                    }
                  />
                </Form.Item>

                {selectedProduct && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center">
                        <ShoppingOutlined className="text-xl text-indigo-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{selectedProduct.name}</div>
                        <div className="text-sm text-gray-500">Kod: {selectedProduct.code}</div>
                      </div>
                      <CheckCircleOutlined className="ml-auto text-green-500 text-xl" />
                    </div>
                  </div>
                )}
              </Card>

              {/* Variant Info Card */}
              <Card
                className="mb-6"
                styles={{
                  header: { borderBottom: 'none', paddingBottom: 0 },
                  body: { paddingTop: 16 }
                }}
                title={
                  <div className="flex items-center gap-2">
                    <TagOutlined className="text-indigo-500" />
                    <span>Varyant Bilgileri</span>
                  </div>
                }
              >
                {variantNamePreview && (
                  <Alert
                    message={
                      <div className="flex items-center gap-2">
                        <Text strong>Önizleme:</Text>
                        <Text>{variantNamePreview}</Text>
                      </div>
                    }
                    type="info"
                    showIcon
                    className="mb-4"
                  />
                )}

                <Form.Item
                  name="name"
                  label="Varyant Adı"
                  rules={[{ required: true, message: 'Varyant adı gerekli' }]}
                  extra="Örn: Kırmızı - XL veya iPhone 15 Pro - 256GB - Siyah"
                >
                  <Input
                    placeholder="Varyant adını girin"
                    size="large"
                    prefix={<SkinOutlined className="text-gray-400" />}
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="sku"
                      label={
                        <span className="flex items-center gap-1">
                          SKU
                          <Tooltip title="Stok Tutma Birimi - Benzersiz ürün kodu">
                            <InfoCircleOutlined className="text-gray-400" />
                          </Tooltip>
                        </span>
                      }
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
                  <Input placeholder="https://example.com/image.jpg" />
                </Form.Item>
              </Card>

              {/* Variant Options Card */}
              <Card
                className="mb-6"
                styles={{
                  header: { borderBottom: 'none', paddingBottom: 0 },
                  body: { paddingTop: 16 }
                }}
                title={
                  <div className="flex items-center gap-2">
                    <SettingOutlined className="text-indigo-500" />
                    <span>Varyant Özellikleri</span>
                  </div>
                }
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
                  <Alert
                    message="Seçilebilir özellik bulunamadı"
                    description="Varyant oluşturmak için önce Renk, Beden, Seçim veya Çoklu Seçim tipinde ürün özellikleri tanımlamanız gerekiyor."
                    type="warning"
                    showIcon
                    action={
                      <Button
                        size="small"
                        onClick={() => router.push('/inventory/product-attributes/new')}
                      >
                        Özellik Ekle
                      </Button>
                    }
                  />
                ) : variantOptions.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <SkinOutlined className="text-4xl text-gray-300 mb-2" />
                    <div className="text-gray-500 mb-3">
                      Henüz varyant özelliği eklenmedi
                    </div>
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={handleAddOption}
                    >
                      İlk Özelliği Ekle
                    </Button>
                  </div>
                ) : (
                  <Table
                    columns={optionColumns}
                    dataSource={variantOptions}
                    rowKey="key"
                    pagination={false}
                    size="middle"
                  />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              {/* Pricing Card */}
              <Card
                className="mb-6"
                styles={{
                  header: { borderBottom: 'none', paddingBottom: 0 },
                  body: { paddingTop: 16 }
                }}
                title={
                  <div className="flex items-center gap-2">
                    <DollarOutlined className="text-green-500" />
                    <span>Fiyatlandırma</span>
                  </div>
                }
              >
                <Form.Item name="price" label="Satış Fiyatı">
                  <InputNumber
                    style={{ width: '100%' }}
                    size="large"
                    min={0}
                    precision={2}
                    placeholder="0.00"
                    prefix="₺"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>

                <Form.Item name="costPrice" label="Maliyet Fiyatı">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    placeholder="0.00"
                    prefix="₺"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>

                <Divider className="my-4" />

                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item name="priceCurrency" label="Satış P.B.">
                      <Select
                        options={[
                          { value: 'TRY', label: '₺ TRY' },
                          { value: 'USD', label: '$ USD' },
                          { value: 'EUR', label: '€ EUR' },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="costPriceCurrency" label="Maliyet P.B.">
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

              {/* Physical Properties Card */}
              <Card
                className="mb-6"
                styles={{
                  header: { borderBottom: 'none', paddingBottom: 0 },
                  body: { paddingTop: 16 }
                }}
                title={
                  <div className="flex items-center gap-2">
                    <InfoCircleOutlined className="text-blue-500" />
                    <span>Fiziksel Özellikler</span>
                  </div>
                }
              >
                <Form.Item name="weight" label="Ağırlık">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={3}
                    placeholder="0.000"
                    addonAfter="kg"
                  />
                </Form.Item>
              </Card>

              {/* Settings Card */}
              <Card
                styles={{
                  header: { borderBottom: 'none', paddingBottom: 0 },
                  body: { paddingTop: 16 }
                }}
                title={
                  <div className="flex items-center gap-2">
                    <SettingOutlined className="text-gray-500" />
                    <span>Ayarlar</span>
                  </div>
                }
              >
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-700">Varsayılan Varyant</div>
                    <div className="text-xs text-gray-400">
                      Ürün görüntülendiğinde bu varyant gösterilir
                    </div>
                  </div>
                  <Form.Item name="isDefault" valuePropName="checked" noStyle>
                    <Switch />
                  </Form.Item>
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}
