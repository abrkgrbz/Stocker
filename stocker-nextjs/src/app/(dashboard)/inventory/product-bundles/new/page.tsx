'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  InputNumber,
  Typography,
  Row,
  Col,
  message,
  Table,
  AutoComplete,
  Switch,
  Divider,
  Collapse,
  Segmented,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  GiftOutlined,
  PlusOutlined,
  DeleteOutlined,
  DollarOutlined,
  CalendarOutlined,
  SettingOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import { useProducts, useCreateProductBundle } from '@/lib/api/hooks/useInventory';
import {
  BundleType,
  BundlePricingType,
  type CreateProductBundleDto,
  type CreateProductBundleItemDto,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;
const { TextArea } = Input;

interface BundleItem extends CreateProductBundleItemDto {
  key: string;
  productCode?: string;
  productName?: string;
  productPrice?: number;
}

const mainBundleTypes = [
  { value: BundleType.Fixed, label: 'Sabit Paket' },
  { value: BundleType.Kit, label: 'Kit' },
  { value: BundleType.Combo, label: 'Kombo' },
];

const otherBundleTypes = [
  { value: BundleType.Configurable, label: 'Yapılandırılabilir' },
  { value: BundleType.Package, label: 'Paket' },
];

const pricingTypes = [
  { value: BundlePricingType.FixedPrice, label: 'Sabit Fiyat' },
  { value: BundlePricingType.DynamicSum, label: 'Dinamik Toplam' },
  { value: BundlePricingType.DiscountedSum, label: 'İndirimli Toplam' },
  { value: BundlePricingType.PercentageDiscount, label: 'Yüzde İndirim' },
];

export default function NewProductBundlePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [items, setItems] = useState<BundleItem[]>([]);
  const [pricingType, setPricingType] = useState<BundlePricingType>(BundlePricingType.FixedPrice);
  const [requireAllItems, setRequireAllItems] = useState(true);

  const { data: products = [] } = useProducts();
  const createBundle = useCreateProductBundle();

  const handleAddItem = () => {
    const newItem: BundleItem = {
      key: `item-${Date.now()}`,
      productId: 0,
      quantity: 1,
      isRequired: true,
      isDefault: true,
      displayOrder: items.length + 1,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const handleItemChange = (key: string, field: keyof BundleItem, value: unknown) => {
    setItems(
      items.map((item) => {
        if (item.key === key) {
          if (field === 'productId' && typeof value === 'number') {
            const product = products.find((p) => p.id === value);
            return {
              ...item,
              productId: value,
              productCode: product?.code,
              productName: product?.name,
              productPrice: product?.unitPrice,
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (items.length === 0) {
        message.error('En az bir ürün ekleyin');
        return;
      }

      const invalidItems = items.filter((item) => !item.productId);
      if (invalidItems.length > 0) {
        message.error('Tüm ürünleri seçin');
        return;
      }

      const data: CreateProductBundleDto = {
        code: values.code,
        name: values.name,
        description: values.description,
        bundleType: values.bundleType,
        pricingType: pricingType,
        fixedPrice: values.fixedPrice,
        fixedPriceCurrency: 'TRY',
        discountPercentage: values.discountPercentage,
        discountAmount: values.discountAmount,
        requireAllItems: requireAllItems,
        minSelectableItems: values.minSelectableItems,
        maxSelectableItems: values.maxSelectableItems,
        validFrom: values.validFrom?.toISOString(),
        validTo: values.validTo?.toISOString(),
        imageUrl: values.imageUrl,
        displayOrder: values.displayOrder || 0,
        items: items.map((item, index) => ({
          productId: item.productId,
          quantity: item.quantity,
          isRequired: item.isRequired,
          isDefault: item.isDefault,
          overridePrice: item.overridePrice,
          overridePriceCurrency: item.overridePrice ? 'TRY' : undefined,
          discountPercentage: item.discountPercentage,
          displayOrder: index + 1,
          minQuantity: item.minQuantity,
          maxQuantity: item.maxQuantity,
        })),
      };

      await createBundle.mutateAsync(data);
      message.success('Paket başarıyla oluşturuldu');
      router.push('/inventory/product-bundles');
    } catch {
      // Validation error
    }
  };

  // Calculated values
  const calculatedTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.overridePrice || item.productPrice || 0;
      return sum + price * (item.quantity || 1);
    }, 0);
  }, [items]);

  const discountedPrice = useMemo(() => {
    const fixedPrice = form.getFieldValue('fixedPrice');
    const discountPercentage = form.getFieldValue('discountPercentage');
    const discountAmount = form.getFieldValue('discountAmount');

    if (pricingType === BundlePricingType.FixedPrice && fixedPrice) {
      return fixedPrice;
    }
    if (pricingType === BundlePricingType.PercentageDiscount && discountPercentage) {
      return calculatedTotal * (1 - discountPercentage / 100);
    }
    if (pricingType === BundlePricingType.DiscountedSum && discountAmount) {
      return calculatedTotal - discountAmount;
    }
    return calculatedTotal;
  }, [calculatedTotal, pricingType, form]);

  const savingsPercentage = useMemo(() => {
    if (calculatedTotal === 0) return 0;
    return ((calculatedTotal - discountedPrice) / calculatedTotal) * 100;
  }, [calculatedTotal, discountedPrice]);

  const itemColumns: ColumnsType<BundleItem> = [
    {
      title: 'Ürün',
      dataIndex: 'productId',
      key: 'productId',
      width: 280,
      render: (_, record) => (
        <AutoComplete
          placeholder="Ürün ara..."
          value={record.productName || ''}
          variant="filled"
          options={products.map((p) => ({
            value: String(p.id),
            label: (
              <div className="flex items-center justify-between py-1">
                <span className="font-medium">{p.name}</span>
                <span className="text-green-600">{p.unitPrice?.toLocaleString('tr-TR')} ₺</span>
              </div>
            ),
          }))}
          onSelect={(value) => handleItemChange(record.key, 'productId', Number(value))}
          filterOption={(input, option) =>
            products
              .find((p) => String(p.id) === option?.value)
              ?.name?.toLowerCase()
              .includes(input.toLowerCase()) ||
            products
              .find((p) => String(p.id) === option?.value)
              ?.code?.toLowerCase()
              .includes(input.toLowerCase()) ||
            false
          }
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 90,
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleItemChange(record.key, 'quantity', value || 1)}
          style={{ width: '100%' }}
          variant="filled"
        />
      ),
    },
    {
      title: 'Fiyat',
      key: 'price',
      width: 130,
      render: (_, record) => (
        <InputNumber
          placeholder={record.productPrice?.toLocaleString('tr-TR') || '0'}
          value={record.overridePrice}
          onChange={(value) => handleItemChange(record.key, 'overridePrice', value)}
          style={{ width: '100%' }}
          variant="filled"
          prefix="₺"
        />
      ),
    },
    {
      title: 'Zorunlu',
      dataIndex: 'isRequired',
      key: 'isRequired',
      width: 70,
      align: 'center',
      render: (_, record) => (
        <Switch
          size="small"
          checked={record.isRequired}
          onChange={(checked) => handleItemChange(record.key, 'isRequired', checked)}
        />
      ),
    },
    {
      title: 'Ara Toplam',
      key: 'subtotal',
      width: 110,
      align: 'right',
      render: (_, record) => {
        const price = record.overridePrice || record.productPrice || 0;
        const subtotal = price * (record.quantity || 1);
        return <Text strong>{subtotal.toLocaleString('tr-TR')} ₺</Text>;
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
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ];

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
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Ürün Paketi</h1>
              <p className="text-sm text-gray-400 m-0">Ürün paketi veya kombo oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/product-bundles')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createBundle.isPending}
              onClick={handleSubmit}
              disabled={items.length === 0}
              style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
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
            bundleType: BundleType.Fixed,
            pricingType: BundlePricingType.FixedPrice,
            displayOrder: 0,
          }}
          onValuesChange={(_, allValues) => {
            if (allValues.pricingType) {
              setPricingType(allValues.pricingType);
            }
          }}
        >
          <Row gutter={48}>
            {/* Left Panel - Summary & Settings (40%) */}
            <Col xs={24} lg={10}>
              {/* Price Summary */}
              {items.length > 0 && (
                <div className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Ürün Toplamı
                      </div>
                      <div className="text-2xl font-semibold text-gray-700">
                        {calculatedTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Paket Fiyatı
                      </div>
                      <div className="text-2xl font-bold text-amber-600">
                        {discountedPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </div>
                    </div>
                  </div>
                  {savingsPercentage > 0 && (
                    <div className="mt-4 pt-4 border-t border-amber-200">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tasarruf</span>
                        <span className="text-lg font-semibold text-green-600">
                          %{savingsPercentage.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bundle Type Selection */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <GiftOutlined className="mr-1" /> Paket Türü
                </Text>
                <Form.Item name="bundleType" rules={[{ required: true }]} className="mb-2">
                  <Segmented
                    block
                    options={mainBundleTypes}
                    className="bg-gray-100/50"
                    style={{ padding: '4px' }}
                  />
                </Form.Item>
                <Select
                  size="small"
                  variant="borderless"
                  placeholder="+ Diğer türler"
                  className="text-gray-400 text-xs"
                  style={{ width: 140 }}
                  options={otherBundleTypes}
                  onChange={(val) => form.setFieldValue('bundleType', val)}
                />
              </div>

              {/* Pricing Type */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <DollarOutlined className="mr-1" /> Fiyatlandırma
                </Text>
                <Form.Item name="pricingType" rules={[{ required: true }]} className="mb-4">
                  <Select options={pricingTypes} variant="filled" size="large" />
                </Form.Item>

                {pricingType === BundlePricingType.FixedPrice && (
                  <Form.Item name="fixedPrice" className="mb-0">
                    <InputNumber
                      style={{ width: '100%' }}
                      size="large"
                      min={0}
                      precision={2}
                      placeholder="Sabit fiyat girin"
                      variant="filled"
                      addonBefore="₺"
                    />
                  </Form.Item>
                )}

                {(pricingType === BundlePricingType.PercentageDiscount ||
                  pricingType === BundlePricingType.DiscountedSum) && (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="discountPercentage" className="mb-0">
                        <InputNumber
                          style={{ width: '100%' }}
                          min={0}
                          max={100}
                          precision={2}
                          placeholder="İndirim %"
                          variant="filled"
                          addonAfter={<PercentageOutlined />}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="discountAmount" className="mb-0">
                        <InputNumber
                          style={{ width: '100%' }}
                          min={0}
                          precision={2}
                          placeholder="İndirim ₺"
                          variant="filled"
                          addonBefore="₺"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                {pricingType === BundlePricingType.DynamicSum && (
                  <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                    Paket fiyatı ürün toplamından otomatik hesaplanır.
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <SettingOutlined className="mr-1" /> Seçenekler
                </Text>
                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
                  <div>
                    <Text strong className="text-gray-700">
                      Tüm Ürünler Zorunlu
                    </Text>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Müşteri opsiyonel ürünleri çıkarabilir
                    </div>
                  </div>
                  <Switch checked={requireAllItems} onChange={setRequireAllItems} />
                </div>
              </div>

              {/* Validity */}
              <Collapse
                ghost
                expandIconPosition="end"
                items={[
                  {
                    key: 'validity',
                    label: (
                      <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <CalendarOutlined className="mr-1" /> Geçerlilik Tarihleri
                      </Text>
                    ),
                    children: (
                      <Row gutter={16}>
                        <Col span={12}>
                          <div className="text-xs text-gray-400 mb-1">Başlangıç</div>
                          <Form.Item name="validFrom" className="mb-0">
                            <DatePicker
                              style={{ width: '100%' }}
                              format="DD/MM/YYYY"
                              placeholder="Hemen"
                              variant="filled"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <div className="text-xs text-gray-400 mb-1">Bitiş</div>
                          <Form.Item name="validTo" className="mb-0">
                            <DatePicker
                              style={{ width: '100%' }}
                              format="DD/MM/YYYY"
                              placeholder="Süresiz"
                              variant="filled"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    ),
                  },
                ]}
              />
            </Col>

            {/* Right Panel - Form Content (60%) */}
            <Col xs={24} lg={14}>
              {/* Bundle Name - Hero Input */}
              <div className="mb-8">
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: 'Paket adı zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Paket adı"
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
                <Form.Item name="description" className="mb-0 mt-2">
                  <TextArea
                    placeholder="Paket açıklaması ekleyin..."
                    variant="borderless"
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    style={{
                      fontSize: '15px',
                      padding: '0',
                      color: '#666',
                      resize: 'none',
                    }}
                    className="placeholder:text-gray-300"
                  />
                </Form.Item>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

              {/* Bundle Code */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  Paket Kodu
                </Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="code"
                      rules={[{ required: true, message: 'Kod gerekli' }]}
                      className="mb-0"
                    >
                      <Input placeholder="BND-001" variant="filled" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

              {/* Bundle Items */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Paket Ürünleri
                    {items.length > 0 && (
                      <span className="ml-2 text-gray-400">({items.length} ürün)</span>
                    )}
                  </Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={handleAddItem}
                    className="text-blue-500"
                  >
                    Ürün Ekle
                  </Button>
                </div>

                {items.length === 0 ? (
                  <div className="p-12 bg-gray-50/50 rounded-xl text-center border-2 border-dashed border-gray-200">
                    <GiftOutlined className="text-5xl text-gray-300 mb-3" />
                    <div className="text-gray-500 mb-3 font-medium">Henüz ürün eklenmedi</div>
                    <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddItem}>
                      İlk Ürünü Ekle
                    </Button>
                  </div>
                ) : (
                  <Table
                    columns={itemColumns}
                    dataSource={items}
                    rowKey="key"
                    pagination={false}
                    size="small"
                  />
                )}
              </div>
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
