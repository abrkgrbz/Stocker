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
  ShopOutlined,
  SettingOutlined,
  BoxPlotOutlined,
  DollarOutlined,
  BarcodeOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { useCategories, useBrands, useUnits } from '@/lib/api/hooks/useInventory';
import { ProductType } from '@/lib/api/services/inventory.types';
import type { ProductDto } from '@/lib/api/services/inventory.types';

const { TextArea } = Input;
const { Text } = Typography;
const { Dragger } = Upload;

interface ProductFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ProductDto;
  onFinish: (values: any) => void;
  loading?: boolean;
  onCancel?: () => void;
}

// Main product types for segmented control
const mainProductTypes = [
  { value: ProductType.Finished, label: 'Mamul' },
  { value: ProductType.Raw, label: 'Hammadde' },
  { value: ProductType.Service, label: 'Hizmet' },
];

// Additional product types
const otherProductTypes = [
  { value: ProductType.SemiFinished, label: 'Yarı Mamul' },
  { value: ProductType.Consumable, label: 'Sarf Malzeme' },
  { value: ProductType.FixedAsset, label: 'Duran Varlık' },
];

const currencyOptions = [
  { value: 'TRY', label: '₺' },
  { value: 'USD', label: '$' },
  { value: 'EUR', label: '€' },
];

export default function ProductForm({ form, initialValues, onFinish, loading }: ProductFormProps) {
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
        isActive: true,
      });
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="product-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Media Focus (40%) */}
        <Col xs={24} lg={10}>
          {/* Large Media Upload Area */}
          <div className="mb-8">
            <Dragger
              multiple
              listType="picture-card"
              accept="image/*"
              beforeUpload={() => false}
              style={{
                background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                border: '2px dashed #e0e0e0',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '320px',
                transition: 'all 0.3s ease',
              }}
              className="hover:border-blue-400 hover:bg-blue-50/30"
            >
              <div className="py-8">
                <PictureOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
                <p className="mt-4 text-base font-medium text-gray-600">
                  Görselleri sürükleyin
                </p>
                <p className="text-sm text-gray-400">
                  veya <span className="text-blue-500 cursor-pointer">dosya seçin</span>
                </p>
                <p className="mt-4 text-xs text-gray-400">
                  PNG, JPG, WEBP • Maks. 5MB
                </p>
              </div>
            </Dragger>
          </div>

          {/* Status Toggle - Minimal */}
          <div className="mb-8 flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
            <div>
              <Text strong className="text-gray-700">Yayın Durumu</Text>
              <div className="text-xs text-gray-400 mt-0.5">
                {isActive ? 'Ürün aktif ve görünür' : 'Ürün taslak olarak kaydedilecek'}
              </div>
            </div>
            <Form.Item name="isActive" valuePropName="checked" noStyle>
              <Switch
                checked={isActive}
                onChange={(val) => {
                  setIsActive(val);
                  form.setFieldValue('isActive', val);
                }}
                checkedChildren="Aktif"
                unCheckedChildren="Taslak"
                style={{
                  backgroundColor: isActive ? '#52c41a' : '#d9d9d9',
                  minWidth: '80px'
                }}
              />
            </Form.Item>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.totalStockQuantity || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Toplam Stok</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  ₺{(initialValues.unitPrice || 0).toLocaleString('tr-TR')}
                </div>
                <div className="text-xs text-gray-500 mt-1">Birim Fiyat</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Product Title - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'Ürün adı zorunludur' },
                { max: 200, message: 'En fazla 200 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Ürün adı"
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
                placeholder="Ürün açıklaması ekleyin..."
                variant="borderless"
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{
                  fontSize: '15px',
                  padding: '0',
                  color: '#666',
                  resize: 'none'
                }}
                className="placeholder:text-gray-300"
              />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Product Type - Segmented */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Ürün Türü
            </Text>
            <Form.Item name="productType" rules={[{ required: true }]} className="mb-2">
              <Segmented
                block
                options={mainProductTypes}
                className="bg-gray-100/50"
                style={{ padding: '4px' }}
              />
            </Form.Item>
            <Select
              size="small"
              variant="borderless"
              placeholder="+ Diğer türler"
              className="text-gray-400 text-xs"
              style={{ width: 120 }}
              options={otherProductTypes}
              onChange={(val) => form.setFieldValue('productType', val)}
            />
          </div>

          {/* Organization Row */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Organizasyon
            </Text>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="categoryId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Kategori"
                    loading={categoriesLoading}
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    suffixIcon={<TagOutlined className="text-gray-400" />}
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider className="my-1" />
                        <Button type="text" icon={<PlusOutlined />} size="small" block className="text-left text-blue-500">
                          Yeni Ekle
                        </Button>
                      </>
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="brandId" className="mb-0">
                  <Select
                    placeholder="Marka"
                    loading={brandsLoading}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    suffixIcon={<ShopOutlined className="text-gray-400" />}
                    options={brands.map((b) => ({ value: b.id, label: b.name }))}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider className="my-1" />
                        <Button type="text" icon={<PlusOutlined />} size="small" block className="text-left text-blue-500">
                          Yeni Ekle
                        </Button>
                      </>
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="unitId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Birim"
                    loading={unitsLoading}
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    options={units.map((u) => ({
                      value: u.id,
                      label: `${u.name} (${u.symbol || u.code})`,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Pricing Section */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <DollarOutlined className="mr-1" /> Fiyatlandırma
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="relative">
                  <div className="text-xs text-gray-400 mb-1">Satış Fiyatı</div>
                  <Form.Item name="unitPrice" className="mb-0">
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      precision={2}
                      placeholder="0.00"
                      variant="filled"
                      size="large"
                      addonBefore={
                        <Form.Item name="unitPriceCurrency" noStyle>
                          <Select options={currencyOptions} variant="borderless" style={{ width: 50 }} />
                        </Form.Item>
                      }
                    />
                  </Form.Item>
                </div>
              </Col>
              <Col span={12}>
                <div className="relative">
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
                          <Select options={currencyOptions} variant="borderless" style={{ width: 50 }} />
                        </Form.Item>
                      }
                    />
                  </Form.Item>
                </div>
              </Col>
            </Row>
          </div>

          {/* Inventory Codes */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <BarcodeOutlined className="mr-1" /> Envanter Kodları
            </Text>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Ürün Kodu *</div>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="PRD-001"
                    variant="filled"
                    disabled={!!initialValues}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">SKU</div>
                <Form.Item name="sku" className="mb-0">
                  <Input placeholder="SKU-12345" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Barkod</div>
                <Form.Item name="barcode" className="mb-0">
                  <Input placeholder="8690000000000" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Stock Levels - Compact */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <BoxPlotOutlined className="mr-1" /> Stok Seviyeleri
            </Text>
            <Row gutter={12}>
              <Col span={6}>
                <div className="text-xs text-gray-400 mb-1">Min</div>
                <Form.Item name="minStockLevel" rules={[{ required: true }]} className="mb-0">
                  <InputNumber style={{ width: '100%' }} min={0} variant="filled" size="small" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <div className="text-xs text-gray-400 mb-1">Maks</div>
                <Form.Item name="maxStockLevel" rules={[{ required: true }]} className="mb-0">
                  <InputNumber style={{ width: '100%' }} min={0} variant="filled" size="small" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <div className="text-xs text-gray-400 mb-1">Yeniden Sip.</div>
                <Form.Item name="reorderLevel" rules={[{ required: true }]} className="mb-0">
                  <InputNumber style={{ width: '100%' }} min={0} variant="filled" size="small" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <div className="text-xs text-gray-400 mb-1">Sip. Miktarı</div>
                <Form.Item name="reorderQuantity" rules={[{ required: true }]} className="mb-0">
                  <InputNumber style={{ width: '100%' }} min={0} variant="filled" size="small" />
                </Form.Item>
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
                key: 'tracking',
                label: (
                  <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <SettingOutlined className="mr-1" /> Gelişmiş Ayarlar
                  </Text>
                ),
                children: (
                  <div className="pt-2">
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-gray-700">Seri No Takibi</div>
                            <div className="text-xs text-gray-400">Benzersiz seri numaraları</div>
                          </div>
                          <Form.Item name="trackSerialNumbers" valuePropName="checked" noStyle>
                            <Switch size="small" />
                          </Form.Item>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-gray-700">Lot Takibi</div>
                            <div className="text-xs text-gray-400">Parti bazlı yönetim</div>
                          </div>
                          <Form.Item name="trackLotNumbers" valuePropName="checked" noStyle>
                            <Switch size="small" />
                          </Form.Item>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="text-xs text-gray-400 mb-1">Tedarik Süresi (gün)</div>
                        <Form.Item name="leadTimeDays" rules={[{ required: true }]} className="mb-0">
                          <InputNumber style={{ width: '100%' }} min={0} variant="filled" size="small" />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Physical Properties */}
                    <div className="mt-6">
                      <Text className="text-xs text-gray-400 mb-3 block">Fiziksel Özellikler</Text>
                      <Row gutter={12}>
                        <Col span={6}>
                          <Form.Item name="weight" className="mb-0">
                            <InputNumber
                              style={{ width: '100%' }}
                              min={0}
                              precision={2}
                              placeholder="Ağırlık"
                              variant="filled"
                              size="small"
                              addonAfter={
                                <Form.Item name="weightUnit" noStyle initialValue="kg">
                                  <Select variant="borderless" size="small" style={{ width: 50 }}>
                                    <Select.Option value="kg">kg</Select.Option>
                                    <Select.Option value="g">g</Select.Option>
                                  </Select>
                                </Form.Item>
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item name="length" className="mb-0">
                            <InputNumber
                              style={{ width: '100%' }}
                              min={0}
                              precision={2}
                              placeholder="U"
                              variant="filled"
                              size="small"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item name="width" className="mb-0">
                            <InputNumber
                              style={{ width: '100%' }}
                              min={0}
                              precision={2}
                              placeholder="G"
                              variant="filled"
                              size="small"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item name="height" className="mb-0">
                            <InputNumber
                              style={{ width: '100%' }}
                              min={0}
                              precision={2}
                              placeholder="Y"
                              variant="filled"
                              size="small"
                              addonAfter={
                                <Form.Item name="dimensionUnit" noStyle initialValue="cm">
                                  <Select variant="borderless" size="small" style={{ width: 45 }}>
                                    <Select.Option value="cm">cm</Select.Option>
                                    <Select.Option value="m">m</Select.Option>
                                  </Select>
                                </Form.Item>
                              }
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
  );
}
