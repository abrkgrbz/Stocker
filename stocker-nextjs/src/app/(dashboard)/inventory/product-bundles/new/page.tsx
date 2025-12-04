'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
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
  Alert,
  Steps,
  Tag,
  Tooltip,
  Progress,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  GiftOutlined,
  PlusOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  DollarOutlined,
  CalendarOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import {
  useProducts,
  useCreateProductBundle,
} from '@/lib/api/hooks/useInventory';
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

const bundleTypes: { value: BundleType; label: string; description: string; color: string }[] = [
  { value: BundleType.Fixed, label: 'Sabit Paket', description: 'Tüm ürünler birlikte satılır', color: 'blue' },
  { value: BundleType.Configurable, label: 'Yapılandırılabilir', description: 'Müşteri seçim yapabilir', color: 'purple' },
  { value: BundleType.Kit, label: 'Kit', description: 'Montaj veya set ürünleri', color: 'cyan' },
  { value: BundleType.Package, label: 'Paket', description: 'Promosyon paketi', color: 'green' },
  { value: BundleType.Combo, label: 'Kombo', description: 'İndirimli kombinasyon', color: 'orange' },
];

const pricingTypes: { value: BundlePricingType; label: string; description: string }[] = [
  { value: BundlePricingType.FixedPrice, label: 'Sabit Fiyat', description: 'Belirlenen sabit fiyat' },
  { value: BundlePricingType.DynamicSum, label: 'Dinamik Toplam', description: 'Ürün fiyatları toplamı' },
  { value: BundlePricingType.DiscountedSum, label: 'İndirimli Toplam', description: 'Toplam üzerinden indirim' },
  { value: BundlePricingType.PercentageDiscount, label: 'Yüzde İndirim', description: 'Yüzdelik indirim' },
];

export default function NewProductBundlePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [items, setItems] = useState<BundleItem[]>([]);
  const [pricingType, setPricingType] = useState<BundlePricingType>(BundlePricingType.FixedPrice);
  const [currentStep, setCurrentStep] = useState(0);

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
        pricingType: values.pricingType,
        fixedPrice: values.fixedPrice,
        fixedPriceCurrency: 'TRY',
        discountPercentage: values.discountPercentage,
        discountAmount: values.discountAmount,
        requireAllItems: values.requireAllItems,
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
          options={products.map((p) => ({
            value: String(p.id),
            label: (
              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="font-medium">{p.name}</span>
                  <span className="text-gray-400 ml-2">({p.code})</span>
                </div>
                <span className="text-green-600 font-medium">
                  {p.unitPrice?.toLocaleString('tr-TR')} ₺
                </span>
              </div>
            ),
          }))}
          onSelect={(value) => handleItemChange(record.key, 'productId', Number(value))}
          filterOption={(input, option) =>
            products.find(p => String(p.id) === option?.value)?.name?.toLowerCase().includes(input.toLowerCase()) ||
            products.find(p => String(p.id) === option?.value)?.code?.toLowerCase().includes(input.toLowerCase()) ||
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
          prefix="₺"
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
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
        <Tooltip title={record.isRequired ? 'Zorunlu ürün' : 'Opsiyonel ürün'}>
          <Switch
            size="small"
            checked={record.isRequired}
            onChange={(checked) => handleItemChange(record.key, 'isRequired', checked)}
          />
        </Tooltip>
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
        return (
          <Text strong className="text-green-600">
            {subtotal.toLocaleString('tr-TR')} ₺
          </Text>
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
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ];

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
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              >
                <GiftOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Ürün Paketi</h1>
                <p className="text-sm text-gray-400 m-0">Ürün paketi veya kombo oluşturun</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.back()}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={createBundle.isPending}
              disabled={items.length === 0}
              style={{
                background: items.length > 0 ? '#f59e0b' : undefined,
                borderColor: items.length > 0 ? '#f59e0b' : undefined
              }}
            >
              Paketi Kaydet
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
                title: 'Paket Bilgileri',
                icon: <GiftOutlined />,
                status: currentStep >= 0 ? 'process' : 'wait',
              },
              {
                title: 'Ürün Seçimi',
                icon: <ShoppingOutlined />,
                status: items.length > 0 ? 'finish' : (currentStep >= 1 ? 'process' : 'wait'),
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
            bundleType: BundleType.Fixed,
            pricingType: BundlePricingType.FixedPrice,
            requireAllItems: true,
            displayOrder: 0,
          }}
          onValuesChange={(_, allValues) => {
            if (allValues.pricingType) {
              setPricingType(allValues.pricingType);
            }
          }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={16}>
              {/* Bundle Info Card */}
              <Card
                className="mb-6"
                styles={{
                  header: { borderBottom: 'none', paddingBottom: 0 },
                  body: { paddingTop: 16 }
                }}
                title={
                  <div className="flex items-center gap-2">
                    <GiftOutlined className="text-amber-500" />
                    <span>Paket Bilgileri</span>
                  </div>
                }
              >
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="code"
                      label="Paket Kodu"
                      rules={[{ required: true, message: 'Kod gerekli' }]}
                    >
                      <Input placeholder="BND-001" prefix={<GiftOutlined className="text-gray-400" />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={16}>
                    <Form.Item
                      name="name"
                      label="Paket Adı"
                      rules={[{ required: true, message: 'Ad gerekli' }]}
                    >
                      <Input placeholder="Başlangıç Paketi" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="description" label="Açıklama">
                  <TextArea
                    rows={3}
                    placeholder="Paket açıklaması... Müşterilere gösterilecek bilgi"
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="bundleType"
                      label="Paket Tipi"
                      rules={[{ required: true, message: 'Tip seçin' }]}
                    >
                      <Select>
                        {bundleTypes.map((type) => (
                          <Select.Option key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Tag color={type.color} className="m-0">{type.label}</Tag>
                              <Text type="secondary" className="text-xs">{type.description}</Text>
                            </div>
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="pricingType"
                      label="Fiyatlandırma Tipi"
                      rules={[{ required: true, message: 'Fiyatlandırma tipi seçin' }]}
                    >
                      <Select>
                        {pricingTypes.map((type) => (
                          <Select.Option key={type.value} value={type.value}>
                            <div>
                              <span className="font-medium">{type.label}</span>
                              <Text type="secondary" className="text-xs ml-2">{type.description}</Text>
                            </div>
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Bundle Items Card */}
              <Card
                className="mb-6"
                styles={{
                  header: { borderBottom: 'none', paddingBottom: 0 },
                  body: { paddingTop: 16 }
                }}
                title={
                  <div className="flex items-center gap-2">
                    <ShoppingOutlined className="text-amber-500" />
                    <span>Paket Ürünleri</span>
                    {items.length > 0 && (
                      <Tag color="orange">{items.length} ürün</Tag>
                    )}
                  </div>
                }
                extra={
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={handleAddItem}
                  >
                    Ürün Ekle
                  </Button>
                }
              >
                {items.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-b from-amber-50 to-orange-50 rounded-xl border-2 border-dashed border-amber-200">
                    <GiftOutlined className="text-5xl text-amber-300 mb-3" />
                    <div className="text-gray-600 mb-2 font-medium">Henüz ürün eklenmedi</div>
                    <div className="text-gray-400 text-sm mb-4">
                      Pakete eklemek istediğiniz ürünleri seçin
                    </div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddItem}
                      style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
                    >
                      İlk Ürünü Ekle
                    </Button>
                  </div>
                ) : (
                  <>
                    <Table
                      columns={itemColumns}
                      dataSource={items}
                      rowKey="key"
                      pagination={false}
                      size="middle"
                    />

                    <Divider className="my-4" />

                    {/* Summary */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl">
                      <Row gutter={24} align="middle">
                        <Col span={8}>
                          <div className="text-gray-500 text-sm">Ürün Toplamı</div>
                          <div className="text-xl font-semibold text-gray-700">
                            {calculatedTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                          </div>
                        </Col>
                        <Col span={8}>
                          {savingsPercentage > 0 && (
                            <>
                              <div className="text-gray-500 text-sm">Tasarruf</div>
                              <div className="text-xl font-semibold text-green-600">
                                %{savingsPercentage.toFixed(1)}
                              </div>
                            </>
                          )}
                        </Col>
                        <Col span={8} className="text-right">
                          <div className="text-gray-500 text-sm">Paket Fiyatı</div>
                          <div className="text-2xl font-bold text-amber-600">
                            {discountedPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </>
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
                {pricingType === BundlePricingType.FixedPrice && (
                  <Form.Item name="fixedPrice" label="Sabit Fiyat">
                    <InputNumber
                      style={{ width: '100%' }}
                      size="large"
                      min={0}
                      precision={2}
                      prefix="₺"
                      placeholder="0.00"
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Form.Item>
                )}

                {(pricingType === BundlePricingType.PercentageDiscount || pricingType === BundlePricingType.DiscountedSum) && (
                  <Form.Item name="discountPercentage" label="İndirim Yüzdesi">
                    <InputNumber
                      style={{ width: '100%' }}
                      size="large"
                      min={0}
                      max={100}
                      precision={2}
                      addonAfter="%"
                      placeholder="0"
                    />
                  </Form.Item>
                )}

                {pricingType === BundlePricingType.DiscountedSum && (
                  <Form.Item name="discountAmount" label="İndirim Tutarı">
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      precision={2}
                      prefix="₺"
                      placeholder="0.00"
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Form.Item>
                )}

                {pricingType === BundlePricingType.DynamicSum && (
                  <Alert
                    message="Dinamik Fiyatlandırma"
                    description="Paket fiyatı, içindeki ürünlerin fiyatları toplamından otomatik hesaplanır."
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                  />
                )}
              </Card>

              {/* Options Card */}
              <Card
                className="mb-6"
                styles={{
                  header: { borderBottom: 'none', paddingBottom: 0 },
                  body: { paddingTop: 16 }
                }}
                title={
                  <div className="flex items-center gap-2">
                    <SettingOutlined className="text-gray-500" />
                    <span>Seçenekler</span>
                  </div>
                }
              >
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                  <div>
                    <div className="font-medium text-gray-700">Tüm Ürünler Zorunlu</div>
                    <div className="text-xs text-gray-400">
                      Devre dışı bırakılırsa müşteri seçim yapabilir
                    </div>
                  </div>
                  <Form.Item name="requireAllItems" valuePropName="checked" noStyle>
                    <Switch />
                  </Form.Item>
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="minSelectableItems" label="Min Seçim">
                      <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="maxSelectableItems" label="Max Seçim">
                      <InputNumber style={{ width: '100%' }} min={0} placeholder="∞" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Validity Card */}
              <Card
                styles={{
                  header: { borderBottom: 'none', paddingBottom: 0 },
                  body: { paddingTop: 16 }
                }}
                title={
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-blue-500" />
                    <span>Geçerlilik</span>
                  </div>
                }
              >
                <Form.Item name="validFrom" label="Başlangıç Tarihi">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Hemen başlasın"
                  />
                </Form.Item>

                <Form.Item name="validTo" label="Bitiş Tarihi">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Süresiz"
                    disabledDate={(current) => {
                      const validFrom = form.getFieldValue('validFrom');
                      return validFrom && current && current < validFrom;
                    }}
                  />
                </Form.Item>

                <Divider className="my-4" />

                <Form.Item name="displayOrder" label="Görüntüleme Sırası">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="0"
                    addonBefore={<InfoCircleOutlined />}
                  />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}
