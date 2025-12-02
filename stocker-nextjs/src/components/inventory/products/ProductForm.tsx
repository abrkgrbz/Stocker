'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Row,
  Col,
  Card,
  Collapse,
  Upload,
  Button,
  Divider,
  Typography,
  Space,
  Segmented,
} from 'antd';
import {
  InboxOutlined,
  PlusOutlined,
  TagOutlined,
  AppstoreOutlined,
  ShopOutlined,
  SettingOutlined,
  BoxPlotOutlined,
  DollarOutlined,
  BarcodeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useCategories, useBrands, useUnits } from '@/lib/api/hooks/useInventory';
import { ProductType } from '@/lib/api/services/inventory.types';
import type { CreateProductDto, UpdateProductDto, ProductDto } from '@/lib/api/services/inventory.types';

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Dragger } = Upload;

interface ProductFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ProductDto;
  onFinish: (values: any) => void;
  loading?: boolean;
  onCancel?: () => void;
}

// Main product types for segmented control (most common)
const mainProductTypes = [
  { value: ProductType.Finished, label: 'Mamul' },
  { value: ProductType.Raw, label: 'Hammadde' },
  { value: ProductType.Service, label: 'Hizmet' },
];

// All product types for dropdown (including less common)
const allProductTypeOptions: { value: ProductType; label: string }[] = [
  { value: ProductType.Raw, label: 'Hammadde' },
  { value: ProductType.SemiFinished, label: 'Yarı Mamul' },
  { value: ProductType.Finished, label: 'Mamul' },
  { value: ProductType.Service, label: 'Hizmet' },
  { value: ProductType.Consumable, label: 'Sarf Malzeme' },
  { value: ProductType.FixedAsset, label: 'Duran Varlık' },
];

// Status options for the status selector
const statusOptions = [
  { value: 'active', label: '🟢 Aktif', icon: <CheckCircleOutlined style={{ color: '#52c41a' }} /> },
  { value: 'draft', label: '⚪ Taslak', icon: <ClockCircleOutlined style={{ color: '#8c8c8c' }} /> },
  { value: 'archived', label: '🔴 Arşiv', icon: <StopOutlined style={{ color: '#ff4d4f' }} /> },
];

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

export default function ProductForm({ form, initialValues, onFinish, loading, onCancel }: ProductFormProps) {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { data: units = [], isLoading: unitsLoading } = useUnits();
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        unitPriceCurrency: initialValues.unitPriceCurrency || 'TRY',
        costPriceCurrency: initialValues.costPriceCurrency || 'TRY',
      });
      setIsActive(initialValues.isActive ?? true);
    } else {
      form.setFieldsValue({
        productType: ProductType.Finished,
        unitPriceCurrency: 'TRY',
        costPriceCurrency: 'TRY',
        minStockLevel: 0,
        maxStockLevel: 0,
        reorderLevel: 0,
        reorderQuantity: 0,
        leadTimeDays: 0,
        trackSerialNumbers: false,
        trackLotNumbers: false,
      });
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="product-form"
    >
      <Row gutter={24}>
        {/* Left Panel - Main Content (2/3) */}
        <Col xs={24} lg={16}>
          {/* Product Identity */}
          <Card className="mb-4 shadow-sm">
            <Form.Item
              name="name"
              label={<Text strong style={{ fontSize: '15px' }}>Ürün Adı</Text>}
              rules={[
                { required: true, message: 'Ürün adı zorunludur' },
                { max: 200, message: 'En fazla 200 karakter' },
              ]}
            >
              <Input
                placeholder="Örn: iPhone 15 Pro Max 256GB"
                size="large"
                style={{ fontSize: '18px', fontWeight: 500 }}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={<Text strong>Açıklama</Text>}
            >
              <TextArea
                rows={4}
                placeholder="Ürün açıklamasını girin. Bu metin ürün detay sayfasında görüntülenecektir."
                showCount
                maxLength={2000}
              />
            </Form.Item>
          </Card>

          {/* Media Upload */}
          <Card
            title={
              <Space>
                <InboxOutlined />
                <span>Medya</span>
              </Space>
            }
            className="mb-4 shadow-sm"
          >
            <Dragger
              multiple
              listType="picture-card"
              accept="image/*"
              beforeUpload={() => false}
              className="bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined className="text-4xl text-blue-400" />
              </p>
              <p className="ant-upload-text font-medium">
                Görselleri buraya sürükleyin veya tıklayın
              </p>
              <p className="ant-upload-hint text-gray-500">
                PNG, JPG, WEBP formatları desteklenir. Maksimum 5MB.
              </p>
            </Dragger>
          </Card>

          {/* Pricing */}
          <Card
            title={
              <Space>
                <DollarOutlined />
                <span>Fiyatlandırma</span>
              </Space>
            }
            className="mb-4 shadow-sm"
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="unitPrice"
                  label={<Text strong>Satış Fiyatı</Text>}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    size="large"
                    min={0}
                    precision={2}
                    placeholder="0.00"
                    prefix="₺"
                    addonAfter={
                      <Form.Item name="unitPriceCurrency" noStyle>
                        <Select
                          style={{ width: 90 }}
                          options={currencyOptions}
                          bordered={false}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="costPrice"
                  label={<Text strong>Maliyet Fiyatı</Text>}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    size="large"
                    min={0}
                    precision={2}
                    placeholder="0.00"
                    prefix="₺"
                    addonAfter={
                      <Form.Item name="costPriceCurrency" noStyle>
                        <Select
                          style={{ width: 90 }}
                          options={currencyOptions}
                          bordered={false}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Stock & Inventory */}
          <Card
            title={
              <Space>
                <BoxPlotOutlined />
                <span>Stok ve Envanter</span>
              </Space>
            }
            className="mb-4 shadow-sm"
          >
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="code"
                  label={<Text strong>Ürün Kodu</Text>}
                  rules={[
                    { required: true, message: 'Ürün kodu zorunludur' },
                    { max: 50, message: 'En fazla 50 karakter' },
                  ]}
                >
                  <Input
                    placeholder="PRD-001"
                    disabled={!!initialValues}
                    prefix={<BarcodeOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="sku" label={<Text strong>SKU</Text>}>
                  <Input placeholder="SKU-12345" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="barcode" label={<Text strong>Barkod</Text>}>
                  <Input
                    placeholder="8690000000000"
                    prefix={<BarcodeOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider className="my-4" />

            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Form.Item
                  name="minStockLevel"
                  label="Min. Stok"
                  rules={[{ required: true, message: 'Zorunlu' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item
                  name="maxStockLevel"
                  label="Maks. Stok"
                  rules={[{ required: true, message: 'Zorunlu' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item
                  name="reorderLevel"
                  label="Yeniden Sipariş"
                  rules={[{ required: true, message: 'Zorunlu' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item
                  name="reorderQuantity"
                  label="Sipariş Miktarı"
                  rules={[{ required: true, message: 'Zorunlu' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Advanced Settings - Collapsible */}
          <Collapse
            ghost
            className="mb-4 bg-white rounded-lg shadow-sm"
            items={[
              {
                key: 'tracking',
                label: (
                  <Space>
                    <SettingOutlined />
                    <Text strong>Takip Ayarları</Text>
                  </Space>
                ),
                children: (
                  <div className="p-4">
                    <Row gutter={[24, 16]}>
                      <Col xs={24} md={8}>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <Text strong className="block">Seri Numarası Takibi</Text>
                            <Text type="secondary" className="text-xs">
                              Her ürünü benzersiz seri ile izle
                            </Text>
                          </div>
                          <Form.Item name="trackSerialNumbers" valuePropName="checked" noStyle>
                            <Switch
                              checkedChildren="Açık"
                              unCheckedChildren="Kapalı"
                              className="bg-gray-300"
                            />
                          </Form.Item>
                        </div>
                      </Col>
                      <Col xs={24} md={8}>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <Text strong className="block">Lot/Parti Takibi</Text>
                            <Text type="secondary" className="text-xs">
                              Parti bazlı stok yönetimi
                            </Text>
                          </div>
                          <Form.Item name="trackLotNumbers" valuePropName="checked" noStyle>
                            <Switch
                              checkedChildren="Açık"
                              unCheckedChildren="Kapalı"
                              className="bg-gray-300"
                            />
                          </Form.Item>
                        </div>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="leadTimeDays"
                          label="Tedarik Süresi (gün)"
                          rules={[{ required: true, message: 'Zorunlu' }]}
                        >
                          <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: 'physical',
                label: (
                  <Space>
                    <BoxPlotOutlined />
                    <Text strong>Fiziksel Özellikler</Text>
                  </Space>
                ),
                children: (
                  <div className="p-4">
                    <Row gutter={16}>
                      <Col xs={24} md={6}>
                        <Form.Item name="weight" label="Ağırlık">
                          <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            precision={2}
                            placeholder="0.00"
                            addonAfter={
                              <Form.Item name="weightUnit" noStyle initialValue="kg">
                                <Select style={{ width: 65 }} bordered={false}>
                                  <Select.Option value="kg">kg</Select.Option>
                                  <Select.Option value="g">g</Select.Option>
                                  <Select.Option value="lb">lb</Select.Option>
                                </Select>
                              </Form.Item>
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item name="length" label="Uzunluk">
                          <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            precision={2}
                            placeholder="0.00"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item name="width" label="Genişlik">
                          <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            precision={2}
                            placeholder="0.00"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item name="height" label="Yükseklik">
                          <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            precision={2}
                            placeholder="0.00"
                            addonAfter={
                              <Form.Item name="dimensionUnit" noStyle initialValue="cm">
                                <Select style={{ width: 60 }} bordered={false}>
                                  <Select.Option value="cm">cm</Select.Option>
                                  <Select.Option value="m">m</Select.Option>
                                  <Select.Option value="in">in</Select.Option>
                                </Select>
                              </Form.Item>
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ),
              },
            ]}
          />
        </Col>

        {/* Right Panel - Sidebar (1/3) */}
        <Col xs={24} lg={8}>
          {/* Status Card */}
          <Card className="mb-4 shadow-sm">
            <div className="mb-3">
              <Text strong className="block mb-1">Durum</Text>
              <Text type="secondary" className="text-xs">
                Ürünün yayın durumunu belirle
              </Text>
            </div>
            <Form.Item name="isActive" noStyle>
              <Select
                size="large"
                value={isActive ? 'active' : 'draft'}
                onChange={(val) => {
                  setIsActive(val === 'active');
                  form.setFieldValue('isActive', val === 'active');
                }}
                style={{ width: '100%' }}
                options={[
                  {
                    value: 'active',
                    label: (
                      <Space>
                        <span style={{ color: '#52c41a', fontSize: '16px' }}>●</span>
                        <span>Aktif</span>
                      </Space>
                    )
                  },
                  {
                    value: 'draft',
                    label: (
                      <Space>
                        <span style={{ color: '#8c8c8c', fontSize: '16px' }}>●</span>
                        <span>Taslak</span>
                      </Space>
                    )
                  },
                  {
                    value: 'archived',
                    label: (
                      <Space>
                        <span style={{ color: '#ff4d4f', fontSize: '16px' }}>●</span>
                        <span>Arşiv</span>
                      </Space>
                    )
                  },
                ]}
              />
            </Form.Item>
          </Card>

          {/* Product Organization */}
          <Card
            title={
              <Space>
                <AppstoreOutlined />
                <span>Ürün Organizasyonu</span>
              </Space>
            }
            className="mb-4 shadow-sm"
          >
            <Form.Item
              name="productType"
              label={<Text strong>Ürün Türü</Text>}
              rules={[{ required: true, message: 'Ürün türü seçin' }]}
            >
              <Segmented
                block
                options={mainProductTypes}
                className="mb-2"
              />
            </Form.Item>
            <div className="text-right">
              <Select
                size="small"
                variant="borderless"
                placeholder="Diğer türler..."
                style={{ width: 140 }}
                options={allProductTypeOptions.filter(
                  opt => !mainProductTypes.find(m => m.value === opt.value)
                )}
                onChange={(val) => form.setFieldValue('productType', val)}
              />
            </div>

            <Form.Item
              name="categoryId"
              label={<Text strong>Kategori</Text>}
              rules={[{ required: true, message: 'Kategori seçin' }]}
            >
              <Select
                placeholder="Kategori ara veya seç"
                loading={categoriesLoading}
                showSearch
                optionFilterProp="label"
                size="large"
                suffixIcon={<TagOutlined />}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider className="my-2" />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      className="w-full text-left text-blue-500"
                    >
                      Yeni Kategori Ekle
                    </Button>
                  </>
                )}
              />
            </Form.Item>

            <Form.Item
              name="brandId"
              label={<Text strong>Marka</Text>}
            >
              <Select
                placeholder="Marka ara veya seç"
                loading={brandsLoading}
                allowClear
                showSearch
                optionFilterProp="label"
                size="large"
                suffixIcon={<ShopOutlined />}
                options={brands.map((b) => ({ value: b.id, label: b.name }))}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider className="my-2" />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      className="w-full text-left text-blue-500"
                    >
                      Yeni Marka Ekle
                    </Button>
                  </>
                )}
              />
            </Form.Item>

            <Form.Item
              name="unitId"
              label={<Text strong>Birim</Text>}
              rules={[{ required: true, message: 'Birim seçin' }]}
            >
              <Select
                placeholder="Birim seçin"
                loading={unitsLoading}
                showSearch
                optionFilterProp="label"
                size="large"
                options={units.map((u) => ({
                  value: u.id,
                  label: `${u.name} (${u.symbol || u.code})`,
                }))}
              />
            </Form.Item>
          </Card>

          {/* Quick Actions (for edit mode) */}
          {initialValues && (
            <Card
              title="Hızlı İşlemler"
              className="mb-4 shadow-sm"
            >
              <Space direction="vertical" className="w-full">
                <Button block icon={<BarcodeOutlined />}>
                  Barkod Yazdır
                </Button>
                <Button block>
                  Ürünü Kopyala
                </Button>
                <Button block danger>
                  Ürünü Sil
                </Button>
              </Space>
            </Card>
          )}
        </Col>
      </Row>

      {/* Sticky Footer - Hidden submit button (triggered by parent) */}
      <Form.Item hidden>
        <Button htmlType="submit" />
      </Form.Item>
    </Form>
  );
}
