'use client';

import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Select, Switch, Row, Col, Card, Divider } from 'antd';
import { useCategories, useBrands, useUnits } from '@/lib/api/hooks/useInventory';
import { ProductType } from '@/lib/api/services/inventory.types';
import type { CreateProductDto, UpdateProductDto, ProductDto } from '@/lib/api/services/inventory.types';

const { TextArea } = Input;

interface ProductFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ProductDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const productTypeOptions: { value: ProductType; label: string }[] = [
  { value: ProductType.Raw, label: 'Hammadde' },
  { value: ProductType.SemiFinished, label: 'Yarı Mamul' },
  { value: ProductType.Finished, label: 'Mamul' },
  { value: ProductType.Service, label: 'Hizmet' },
  { value: ProductType.Consumable, label: 'Sarf Malzeme' },
  { value: ProductType.FixedAsset, label: 'Duran Varlık' },
];

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

export default function ProductForm({ form, initialValues, onFinish, loading }: ProductFormProps) {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { data: units = [], isLoading: unitsLoading } = useUnits();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        unitPriceCurrency: initialValues.unitPriceCurrency || 'TRY',
        costPriceCurrency: initialValues.costPriceCurrency || 'TRY',
      });
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
    >
      {/* Basic Information */}
      <Card title="Temel Bilgiler" className="mb-4">
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="code"
              label="Ürün Kodu"
              rules={[
                { required: true, message: 'Ürün kodu zorunludur' },
                { max: 50, message: 'En fazla 50 karakter' },
              ]}
            >
              <Input placeholder="PRD-001" disabled={!!initialValues} />
            </Form.Item>
          </Col>
          <Col xs={24} md={16}>
            <Form.Item
              name="name"
              label="Ürün Adı"
              rules={[
                { required: true, message: 'Ürün adı zorunludur' },
                { max: 200, message: 'En fazla 200 karakter' },
              ]}
            >
              <Input placeholder="Ürün adını girin" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item name="barcode" label="Barkod">
              <Input placeholder="8690000000000" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="sku" label="SKU">
              <Input placeholder="SKU kodu" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="productType"
              label="Ürün Türü"
              rules={[{ required: true, message: 'Ürün türü seçin' }]}
            >
              <Select options={productTypeOptions} placeholder="Tür seçin" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Açıklama">
          <TextArea rows={3} placeholder="Ürün açıklaması" />
        </Form.Item>
      </Card>

      {/* Category & Brand */}
      <Card title="Kategori ve Marka" className="mb-4">
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="categoryId"
              label="Kategori"
              rules={[{ required: true, message: 'Kategori seçin' }]}
            >
              <Select
                placeholder="Kategori seçin"
                loading={categoriesLoading}
                showSearch
                optionFilterProp="label"
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="brandId" label="Marka">
              <Select
                placeholder="Marka seçin"
                loading={brandsLoading}
                allowClear
                showSearch
                optionFilterProp="label"
                options={brands.map((b) => ({ value: b.id, label: b.name }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="unitId"
              label="Birim"
              rules={[{ required: true, message: 'Birim seçin' }]}
            >
              <Select
                placeholder="Birim seçin"
                loading={unitsLoading}
                showSearch
                optionFilterProp="label"
                options={units.map((u) => ({ value: u.id, label: `${u.name} (${u.symbol || u.code})` }))}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Pricing */}
      <Card title="Fiyatlandırma" className="mb-4">
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item name="unitPrice" label="Birim Fiyat">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="0.00"
                addonAfter={
                  <Form.Item name="unitPriceCurrency" noStyle>
                    <Select style={{ width: 80 }} options={currencyOptions} />
                  </Form.Item>
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="costPrice" label="Maliyet Fiyatı">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="0.00"
                addonAfter={
                  <Form.Item name="costPriceCurrency" noStyle>
                    <Select style={{ width: 80 }} options={currencyOptions} />
                  </Form.Item>
                }
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Stock Settings */}
      <Card title="Stok Ayarları" className="mb-4">
        <Row gutter={16}>
          <Col xs={24} md={6}>
            <Form.Item
              name="minStockLevel"
              label="Minimum Stok"
              rules={[{ required: true, message: 'Zorunlu' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="maxStockLevel"
              label="Maksimum Stok"
              rules={[{ required: true, message: 'Zorunlu' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="reorderLevel"
              label="Yeniden Sipariş Seviyesi"
              rules={[{ required: true, message: 'Zorunlu' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="reorderQuantity"
              label="Yeniden Sipariş Miktarı"
              rules={[{ required: true, message: 'Zorunlu' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={6}>
            <Form.Item
              name="leadTimeDays"
              label="Tedarik Süresi (gün)"
              rules={[{ required: true, message: 'Zorunlu' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="trackSerialNumbers"
              label="Seri Numarası Takibi"
              valuePropName="checked"
            >
              <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="trackLotNumbers"
              label="Lot/Parti Takibi"
              valuePropName="checked"
            >
              <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Physical Properties */}
      <Card title="Fiziksel Özellikler" className="mb-4">
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
                    <Select style={{ width: 70 }}>
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
              <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="width" label="Genişlik">
              <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="0.00" />
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
                    <Select style={{ width: 70 }}>
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
      </Card>
    </Form>
  );
}
