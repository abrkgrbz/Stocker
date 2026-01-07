'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
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
  Divider,
  Collapse,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  Cog6ToothIcon,
  CubeIcon,
  CurrencyDollarIcon,
  PlusIcon,
  QrCodeIcon,
  SwatchIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  useProducts,
  useProductAttributes,
  useCreateProductVariant,
} from '@/lib/api/hooks/useInventory';
import type { CreateProductVariantDto } from '@/lib/api/services/inventory.types';
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

const currencyOptions = [
  { value: 'TRY', label: '₺' },
  { value: 'USD', label: '$' },
  { value: 'EUR', label: '€' },
];

const weightUnitOptions = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'lb', label: 'lb' },
];

export default function NewProductVariantPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    name: string;
    code: string;
  } | null>(null);
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  const [isDefault, setIsDefault] = useState(false);
  const [trackInventory, setTrackInventory] = useState(true);
  const [allowBackorder, setAllowBackorder] = useState(false);

  const { data: products = [] } = useProducts();
  const { data: attributes = [] } = useProductAttributes();
  const createVariant = useCreateProductVariant();

  // Filter attributes that have options (Select, MultiSelect, Color, Size)
  const selectableAttributes = useMemo(
    () =>
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
        variantName: values.variantName,
        price: values.price,
        priceCurrency: values.priceCurrency || 'TRY',
        costPrice: values.costPrice,
        costPriceCurrency: values.costPriceCurrency || 'TRY',
        compareAtPrice: values.compareAtPrice,
        compareAtPriceCurrency: values.compareAtPriceCurrency || 'TRY',
        weight: values.weight,
        weightUnit: values.weightUnit || 'kg',
        dimensions: values.dimensions,
        imageUrl: values.imageUrl,
        isDefault: isDefault,
        trackInventory: trackInventory,
        allowBackorder: allowBackorder,
        lowStockThreshold: values.lowStockThreshold ?? 0,
        displayOrder: values.displayOrder ?? 0,
        options: validOptions.map((opt, index) => ({
          productAttributeId: opt.productAttributeId,
          productAttributeOptionId: opt.productAttributeOptionId,
          value: opt.value,
          displayOrder: index,
        })),
      };

      await createVariant.mutateAsync(data);
      message.success('Varyant başarıyla oluşturuldu');
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
          variant="filled"
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
            variant="filled"
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
          icon={<TrashIcon className="w-4 h-4" />}
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
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Ürün Varyantı</h1>
              <p className="text-sm text-gray-400 m-0">SKU ve özellik bazlı varyant oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/product-variants')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createVariant.isPending}
              onClick={handleSubmit}
              disabled={!selectedProduct}
              style={{ background: '#1a1a1a', borderColor: '#1a1a1a', color: 'white' }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            priceCurrency: 'TRY',
            costPriceCurrency: 'TRY',
            compareAtPriceCurrency: 'TRY',
            weightUnit: 'kg',
          }}
        >
          <Row gutter={48}>
            {/* Left Panel - Product & Options (40%) */}
            <Col xs={24} lg={10}>
              {/* Product Selection */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <SwatchIcon className="w-4 h-4 inline mr-1" /> Ana Ürün Seçimi
                </Text>
                <Form.Item
                  name="productId"
                  rules={[{ required: true, message: 'Ürün seçiniz' }]}
                  className="mb-2"
                >
                  <AutoComplete
                    placeholder="Ürün kodu veya adı ile arayın..."
                    size="large"
                    value={selectedProduct?.name || ''}
                    options={products.map((p) => ({
                      value: String(p.id),
                      label: (
                        <div className="flex items-center justify-between py-1">
                          <span className="font-medium">{p.name}</span>
                          <span className="text-gray-400">({p.code})</span>
                        </div>
                      ),
                    }))}
                    onSelect={handleProductSelect}
                    filterOption={(inputValue, option) =>
                      products
                        .find((p) => String(p.id) === option?.value)
                        ?.name?.toLowerCase()
                        .includes(inputValue.toLowerCase()) ||
                      products
                        .find((p) => String(p.id) === option?.value)
                        ?.code?.toLowerCase()
                        .includes(inputValue.toLowerCase()) ||
                      false
                    }
                  />
                </Form.Item>
                {selectedProduct && (
                  <div className="p-4 bg-gray-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <SwatchIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{selectedProduct.name}</div>
                        <div className="text-sm text-gray-500">Kod: {selectedProduct.code}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Variant Options */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <Cog6ToothIcon className="w-4 h-4 mr-1" /> Varyant Özellikleri
                  </Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusIcon className="w-4 h-4" />}
                    onClick={handleAddOption}
                    disabled={variantOptions.length >= selectableAttributes.length}
                    className="text-blue-500"
                  >
                    Özellik Ekle
                  </Button>
                </div>

                {selectableAttributes.length === 0 ? (
                  <div className="p-6 bg-amber-50 rounded-xl text-center">
                    <Text className="text-amber-700">
                      Seçilebilir özellik bulunamadı. Önce ürün özellikleri tanımlayın.
                    </Text>
                    <Button
                      type="link"
                      onClick={() => router.push('/inventory/product-attributes/new')}
                    >
                      Özellik Ekle
                    </Button>
                  </div>
                ) : variantOptions.length === 0 ? (
                  <div className="p-8 bg-gray-50/50 rounded-xl text-center border-2 border-dashed border-gray-200">
                    <SwatchIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <div className="text-gray-500 mb-3">Henüz varyant özelliği eklenmedi</div>
                    <Button type="dashed" icon={<PlusIcon className="w-4 h-4" />} onClick={handleAddOption}>
                      İlk Özelliği Ekle
                    </Button>
                  </div>
                ) : (
                  <Table
                    columns={optionColumns}
                    dataSource={variantOptions}
                    rowKey="key"
                    pagination={false}
                    size="small"
                  />
                )}
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
                <div>
                  <Text strong className="text-gray-700">
                    Varsayılan Varyant
                  </Text>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {isDefault
                      ? 'Ürün görüntülendiğinde bu varyant gösterilir'
                      : 'Varsayılan olarak işaretlenmedi'}
                  </div>
                </div>
                <Switch
                  checked={isDefault}
                  onChange={setIsDefault}
                  checkedChildren="Evet"
                  unCheckedChildren="Hayır"
                />
              </div>
            </Col>

            {/* Right Panel - Form Content (60%) */}
            <Col xs={24} lg={14}>
              {/* Variant Name - Hero Input */}
              <div className="mb-8">
                <Form.Item
                  name="variantName"
                  rules={[{ required: true, message: 'Varyant adı zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Varyant adı"
                    variant="borderless"
                    style={{
                      fontSize: '28px',
                      fontWeight: 600,
                      padding: '0',
                      color: '#1a1a1a',
                    }}
                    className="placeholder:text-gray-300"
                  />
                </Form.Item>
                {variantNamePreview && selectedProduct && (
                  <div className="text-sm text-gray-400 mt-2">
                    Öneri: <span className="text-gray-600">{variantNamePreview}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

              {/* Inventory Codes */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <QrCodeIcon className="w-4 h-4 inline mr-1" /> Envanter Kodları
                </Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <div className="text-xs text-gray-400 mb-1">SKU *</div>
                    <Form.Item
                      name="sku"
                      rules={[{ required: true, message: 'SKU gerekli' }]}
                      className="mb-0"
                    >
                      <Input placeholder="PRD-001-RED-XL" variant="filled" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <div className="text-xs text-gray-400 mb-1">Barkod</div>
                    <Form.Item name="barcode" className="mb-0">
                      <Input placeholder="1234567890123" variant="filled" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

              {/* Pricing Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <CurrencyDollarIcon className="w-4 h-4 mr-1" /> Fiyatlandırma
                </Text>
                <Row gutter={16} className="mb-4">
                  <Col span={12}>
                    <div className="text-xs text-gray-400 mb-1">Satış Fiyatı</div>
                    <Form.Item name="price" className="mb-0">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        precision={2}
                        placeholder="0.00"
                        variant="filled"
                        size="large"
                        addonBefore={
                          <Form.Item name="priceCurrency" noStyle>
                            <Select
                              options={currencyOptions}
                              variant="borderless"
                              style={{ width: 50 }}
                            />
                          </Form.Item>
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <div className="text-xs text-gray-400 mb-1">Maliyet</div>
                    <Form.Item name="costPrice" className="mb-0">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        precision={2}
                        placeholder="0.00"
                        variant="filled"
                        size="large"
                        addonBefore={
                          <Form.Item name="costPriceCurrency" noStyle>
                            <Select
                              options={currencyOptions}
                              variant="borderless"
                              style={{ width: 50 }}
                            />
                          </Form.Item>
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <div className="text-xs text-gray-400 mb-1">Karşılaştırma Fiyatı</div>
                    <Form.Item name="compareAtPrice" className="mb-0">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        precision={2}
                        placeholder="0.00"
                        variant="filled"
                        size="large"
                        addonBefore={
                          <Form.Item name="compareAtPriceCurrency" noStyle>
                            <Select
                              options={currencyOptions}
                              variant="borderless"
                              style={{ width: 50 }}
                            />
                          </Form.Item>
                        }
                      />
                    </Form.Item>
                    <div className="text-xs text-gray-400 mt-1">İndirimli fiyat gösterimi için</div>
                  </Col>
                </Row>
              </div>

              {/* Advanced Settings - Collapsible */}
              <Collapse
                ghost
                expandIconPosition="end"
                className="bg-transparent"
                items={[
                  {
                    key: 'advanced',
                    label: (
                      <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <CubeIcon className="w-4 h-4 inline mr-1" /> Fiziksel Özellikler & Stok Ayarları
                      </Text>
                    ),
                    children: (
                      <div className="pt-2">
                        {/* Physical Properties */}
                        <div className="mb-6">
                          <div className="text-xs font-medium text-gray-500 mb-3">Fiziksel Özellikler</div>
                          <Row gutter={16}>
                            <Col span={8}>
                              <div className="text-xs text-gray-400 mb-1">Ağırlık</div>
                              <Form.Item name="weight" className="mb-4">
                                <InputNumber
                                  style={{ width: '100%' }}
                                  min={0}
                                  precision={3}
                                  placeholder="0.000"
                                  variant="filled"
                                  size="small"
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <div className="text-xs text-gray-400 mb-1">Birim</div>
                              <Form.Item name="weightUnit" className="mb-4">
                                <Select
                                  options={weightUnitOptions}
                                  variant="filled"
                                  size="small"
                                  placeholder="kg"
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <div className="text-xs text-gray-400 mb-1">Boyutlar</div>
                              <Form.Item name="dimensions" className="mb-4">
                                <Input
                                  placeholder="10x20x5 cm"
                                  variant="filled"
                                  size="small"
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Row gutter={16}>
                            <Col span={24}>
                              <div className="text-xs text-gray-400 mb-1">Görsel URL</div>
                              <Form.Item name="imageUrl" className="mb-0">
                                <Input
                                  placeholder="https://example.com/image.jpg"
                                  variant="filled"
                                  size="small"
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>

                        {/* Inventory Settings */}
                        <Divider className="my-4" />
                        <div className="mb-4">
                          <div className="text-xs font-medium text-gray-500 mb-3">Stok Ayarları</div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="text-sm text-gray-700">Stok Takibi</div>
                                <div className="text-xs text-gray-400">Stok miktarını takip et</div>
                              </div>
                              <Switch
                                checked={trackInventory}
                                onChange={setTrackInventory}
                                size="small"
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="text-sm text-gray-700">Ön Siparişe İzin Ver</div>
                                <div className="text-xs text-gray-400">Stok olmadan sipariş alınabilir</div>
                              </div>
                              <Switch
                                checked={allowBackorder}
                                onChange={setAllowBackorder}
                                size="small"
                              />
                            </div>
                          </div>
                          <Row gutter={16} className="mt-4">
                            <Col span={12}>
                              <div className="text-xs text-gray-400 mb-1">Düşük Stok Eşiği</div>
                              <Form.Item name="lowStockThreshold" className="mb-0">
                                <InputNumber
                                  style={{ width: '100%' }}
                                  min={0}
                                  placeholder="5"
                                  variant="filled"
                                  size="small"
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <div className="text-xs text-gray-400 mb-1">Görüntüleme Sırası</div>
                              <Form.Item name="displayOrder" className="mb-0">
                                <InputNumber
                                  style={{ width: '100%' }}
                                  min={0}
                                  placeholder="0"
                                  variant="filled"
                                  size="small"
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </Col>
          </Row>

          {/* Hidden submit button */}
          <Form.Item hidden>
            <Button htmlType="submit" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
