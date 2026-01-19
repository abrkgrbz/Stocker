'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Upload,
  Table,
  Button,
  Empty,
} from 'antd';
import {
  SwatchIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useProducts, useProductAttributes } from '@/lib/api/hooks/useInventory';
import type {
  ProductVariantDto,
  CreateProductVariantDto,
  UpdateProductVariantDto,
  CreateProductVariantOptionDto,
} from '@/lib/api/services/inventory.types';
import {
  FormSection,
  FormInput,
  FormNumber,
  FormSelect,
  FormSwitch,
  FormStatGrid,
  useUnsavedChanges,
} from '@/components/forms';

interface ProductVariantFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ProductVariantDto;
  productId?: number;
  onFinish: (values: CreateProductVariantDto | UpdateProductVariantDto) => void;
  loading?: boolean;
}

const weightUnits = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'lb', label: 'Pound (lb)' },
  { value: 'oz', label: 'Ounce (oz)' },
];

const currencies = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

export default function ProductVariantForm({ form, initialValues, productId, onFinish, loading }: ProductVariantFormProps) {
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [trackInventory, setTrackInventory] = useState(true);
  const [allowBackorder, setAllowBackorder] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [options, setOptions] = useState<CreateProductVariantOptionDto[]>([]);

  const { data: products = [] } = useProducts();
  const { data: productAttributes = [] } = useProductAttributes();

  // Unsaved changes tracking
  const { markAsSaved } = useUnsavedChanges({
    form,
    enabled: true,
    initialValues: initialValues || {},
  });

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsDefault(initialValues.isDefault);
      setIsActive(initialValues.isActive);
      setTrackInventory(initialValues.trackInventory);
      setAllowBackorder(initialValues.allowBackorder);
      setImageUrl(initialValues.imageUrl);
      if (initialValues.options) {
        setOptions(initialValues.options.map(opt => ({
          productAttributeId: opt.productAttributeId,
          productAttributeOptionId: opt.productAttributeOptionId,
          value: opt.value,
          displayOrder: opt.displayOrder,
        })));
      }
    } else if (productId) {
      form.setFieldValue('productId', productId);
    }
  }, [form, initialValues, productId]);

  const handleAddOption = () => {
    setOptions([...options, { productAttributeId: 0, value: '', displayOrder: options.length }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: keyof CreateProductVariantOptionDto, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleFinish = (values: any) => {
    markAsSaved();
    onFinish({
      ...values,
      imageUrl,
      options,
    });
  };

  const optionColumns = [
    {
      title: 'Özellik',
      dataIndex: 'productAttributeId',
      key: 'productAttributeId',
      width: '35%',
      render: (_: any, record: CreateProductVariantOptionDto, index: number) => (
        <Select
          value={record.productAttributeId || undefined}
          onChange={(val) => handleOptionChange(index, 'productAttributeId', val)}
          placeholder="Özellik seçin"
          style={{ width: '100%' }}
          className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
          options={productAttributes.map(attr => ({
            value: attr.id,
            label: attr.name,
          }))}
        />
      ),
    },
    {
      title: 'Değer',
      dataIndex: 'value',
      key: 'value',
      width: '40%',
      render: (_: any, record: CreateProductVariantOptionDto, index: number) => (
        <Input
          value={record.value}
          onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
          placeholder="Değer girin"
          className="!bg-slate-50 !border-slate-300"
        />
      ),
    },
    {
      title: 'Sıra',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: '15%',
      render: (_: any, record: CreateProductVariantOptionDto, index: number) => (
        <InputNumber
          value={record.displayOrder}
          onChange={(val) => handleOptionChange(index, 'displayOrder', val || 0)}
          min={0}
          style={{ width: '100%' }}
          className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: '10%',
      render: (_: any, __: any, index: number) => (
        <Button
          type="text"
          danger
          icon={<TrashIcon className="w-4 h-4" />}
          onClick={() => handleRemoveOption(index)}
        />
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Image + Name + SKU
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Variant Image */}
            <div className="flex-shrink-0">
              <Upload
                showUploadList={false}
                accept="image/*"
                beforeUpload={(file) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setImageUrl(e.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                  return false;
                }}
              >
                <div className="w-20 h-20 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-slate-400 transition-colors">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Variant" className="w-full h-full object-cover" />
                  ) : (
                    <PhotoIcon className="w-6 h-6 text-slate-400" />
                  )}
                </div>
              </Upload>
            </div>

            {/* Variant Name - Title Style */}
            <div className="flex-1">
              <FormInput
                name="variantName"
                placeholder="Varyant Adı Girin..."
                variant="borderless"
                rules={[{ required: true, message: 'Varyant adı zorunludur' }]}
                className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
              />
              <FormInput
                name="sku"
                placeholder="SKU kodu..."
                variant="borderless"
                rules={[{ required: true, message: 'SKU zorunludur' }]}
                className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400 mt-1"
              />
            </div>

            {/* Status Toggles */}
            <div className="flex-shrink-0 flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <span className="text-sm text-slate-600">Varsayılan</span>
                <Form.Item name="isDefault" valuePropName="checked" noStyle>
                  <Switch
                    checked={isDefault}
                    onChange={(val) => setIsDefault(val)}
                    size="small"
                  />
                </Form.Item>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <span className="text-sm text-slate-600">Aktif</span>
                <Form.Item name="isActive" valuePropName="checked" noStyle>
                  <Switch
                    checked={isActive}
                    onChange={(val) => setIsActive(val)}
                    size="small"
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* Ana Ürün */}
          {!productId && (
            <FormSection title="Ana Ürün">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                  <FormSelect
                    name="productId"
                    label="Ürün"
                    required
                    placeholder="Ürün seçin"
                    disabled={!!initialValues}
                    options={products.map(p => ({
                      value: p.id,
                      label: `${p.code} - ${p.name}`,
                    }))}
                  />
                </div>
              </div>
            </FormSection>
          )}

          {/* Fiyat Bilgileri */}
          <FormSection title="Fiyat Bilgileri">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <FormNumber
                  name="price"
                  label="Satış Fiyatı"
                  placeholder="0.00"
                  min={0}
                  precision={2}
                />
              </div>
              <div className="col-span-3">
                <FormSelect
                  name="priceCurrency"
                  label="Para Birimi"
                  placeholder="Seçin"
                  options={currencies}
                />
              </div>
              <div className="col-span-3">
                <FormNumber
                  name="costPrice"
                  label="Maliyet Fiyatı"
                  placeholder="0.00"
                  min={0}
                  precision={2}
                />
              </div>
              <div className="col-span-3">
                <FormNumber
                  name="compareAtPrice"
                  label="Karşılaştırma Fiyatı"
                  placeholder="0.00"
                  min={0}
                  precision={2}
                />
              </div>
            </div>
          </FormSection>

          {/* Barkod & Fiziksel Özellikler */}
          <FormSection title="Barkod & Fiziksel Özellikler">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormInput
                  name="barcode"
                  label="Barkod"
                  placeholder="Barkod numarası..."
                />
              </div>
              <div className="col-span-3">
                <FormNumber
                  name="weight"
                  label="Ağırlık"
                  placeholder="0.00"
                  min={0}
                  precision={3}
                />
              </div>
              <div className="col-span-2">
                <FormSelect
                  name="weightUnit"
                  label="Birim"
                  placeholder="Seçin"
                  options={weightUnits}
                />
              </div>
              <div className="col-span-3">
                <FormInput
                  name="dimensions"
                  label="Boyutlar (GxDxY)"
                  placeholder="10x20x5 cm"
                />
              </div>
            </div>
          </FormSection>

          {/* Envanter Ayarları */}
          <FormSection title="Envanter Ayarları">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormSwitch
                  form={form}
                  name="trackInventory"
                  title="Envanter Takibi"
                  value={trackInventory}
                  onChange={setTrackInventory}
                  descriptionTrue="Stok miktarını izle"
                  descriptionFalse="Takip yapılmıyor"
                  disabled={loading}
                />
              </div>
              <div className="col-span-4">
                <FormSwitch
                  form={form}
                  name="allowBackorder"
                  title="Ön Sipariş"
                  value={allowBackorder}
                  onChange={setAllowBackorder}
                  descriptionTrue="Stok olmadan satışa izin ver"
                  descriptionFalse="Stok gerekli"
                  disabled={loading}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="lowStockThreshold"
                  label="Düşük Stok Eşiği"
                  placeholder="10"
                  min={0}
                />
              </div>
            </div>
          </FormSection>

          {/* Stok Bilgisi (Edit Mode) */}
          {initialValues && (
            <FormSection title="Stok Bilgisi">
              <FormStatGrid
                columns={3}
                stats={[
                  {
                    label: 'Toplam Stok',
                    value: initialValues.totalStock?.toLocaleString('tr-TR') || 0,
                  },
                  {
                    label: 'Görüntüleme Sırası',
                    value: initialValues.displayOrder || 0,
                  },
                  {
                    label: 'Varyant Türü',
                    value: initialValues.isDefault ? 'Varsayılan' : 'Standart',
                    valueClassName: initialValues.isDefault ? 'text-emerald-600 !text-lg' : 'text-slate-500 !text-lg',
                  },
                ]}
              />
            </FormSection>
          )}

          {/* Varyant Seçenekleri */}
          <FormSection
            title={`Varyant Seçenekleri ${options.length > 0 ? `(${options.length})` : ''}`}
            action={
              <Button
                type="dashed"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={handleAddOption}
                size="small"
                className="!border-slate-300 !text-slate-600 hover:!border-slate-400"
              >
                Seçenek Ekle
              </Button>
            }
          >
            {options.length > 0 ? (
              <Table
                dataSource={options.map((opt, index) => ({ ...opt, key: index }))}
                columns={optionColumns}
                pagination={false}
                size="small"
                className="[&_.ant-table]:!border-slate-200 [&_.ant-table-thead_.ant-table-cell]:!bg-slate-50 [&_.ant-table-thead_.ant-table-cell]:!text-slate-600 [&_.ant-table-thead_.ant-table-cell]:!font-medium [&_.ant-table-tbody_.ant-table-cell]:!border-slate-100"
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Henüz varyant seçeneği eklenmedi"
                className="py-8 bg-slate-50 rounded-lg border border-slate-200"
              >
                <Button
                  type="dashed"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={handleAddOption}
                  className="!border-slate-300 !text-slate-600 hover:!border-slate-400"
                >
                  Seçenek Ekle
                </Button>
              </Empty>
            )}
          </FormSection>

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
