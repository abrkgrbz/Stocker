'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Collapse,
  Upload,
  Button,
  Divider,
  TreeSelect,
} from 'antd';
import {
  PlusOutlined,
  TagOutlined,
  ShopOutlined,
  SettingOutlined,
  DeleteOutlined,
  InboxOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { useCategoryTree, useBrands, useUnits, useWarehouses, useLocations } from '@/lib/api/hooks/useInventory';
import { ProductType } from '@/lib/api/services/inventory.types';
import type { ProductDto, CategoryTreeDto, InitialStockEntryDto } from '@/lib/api/services/inventory.types';

const { TextArea } = Input;
const { Dragger } = Upload;

interface ProductFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ProductDto;
  onFinish: (values: any) => void;
  loading?: boolean;
  onCancel?: () => void;
}

// Main product types for header selector
const mainProductTypes = [
  { value: ProductType.Finished, label: 'Mamul' },
  { value: ProductType.Raw, label: 'Hammadde' },
  { value: ProductType.Service, label: 'Hizmet' },
];

// All product types for full selection
const allProductTypes = [
  { value: ProductType.Finished, label: 'Mamul Ürün' },
  { value: ProductType.Raw, label: 'Hammadde' },
  { value: ProductType.Service, label: 'Hizmet' },
  { value: ProductType.SemiFinished, label: 'Yarı Mamul' },
  { value: ProductType.Consumable, label: 'Sarf Malzeme' },
  { value: ProductType.FixedAsset, label: 'Duran Varlık' },
];

const currencyOptions = [
  { value: 'TRY', label: '₺' },
  { value: 'USD', label: '$' },
  { value: 'EUR', label: '€' },
];

// Convert CategoryTreeDto to TreeSelect compatible format
const convertToTreeData = (categories: CategoryTreeDto[]): any[] => {
  return categories.map((cat) => ({
    value: cat.id,
    title: cat.name,
    children: cat.children?.length > 0 ? convertToTreeData(cat.children) : undefined,
  }));
};

// Initial stock entry component
interface StockEntryRowProps {
  entry: InitialStockEntryDto & { key: string };
  index: number;
  warehouses: { id: number; name: string }[];
  onWarehouseChange: (warehouseId: number) => void;
  onLocationChange: (locationId: number | undefined) => void;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function StockEntryRow({
  entry,
  index,
  warehouses,
  onWarehouseChange,
  onLocationChange,
  onQuantityChange,
  onRemove,
  canRemove
}: StockEntryRowProps) {
  const { data: locations = [] } = useLocations(entry.warehouseId || undefined);

  return (
    <div className="grid grid-cols-12 gap-3 items-center mb-2">
      <div className="col-span-5">
        <Select
          placeholder="Depo seçin"
          value={entry.warehouseId || undefined}
          onChange={onWarehouseChange}
          options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
          size="small"
          className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
        />
      </div>
      <div className="col-span-4">
        <Select
          placeholder="Lokasyon"
          value={entry.locationId || undefined}
          onChange={onLocationChange}
          options={locations.map((l) => ({ value: l.id, label: l.code }))}
          size="small"
          className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
          allowClear
          disabled={!entry.warehouseId}
        />
      </div>
      <div className="col-span-2">
        <InputNumber
          placeholder="Miktar"
          value={entry.quantity}
          onChange={(val) => onQuantityChange(val || 0)}
          min={0}
          size="small"
          className="w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
        />
      </div>
      <div className="col-span-1">
        {canRemove && (
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={onRemove}
            danger
          />
        )}
      </div>
    </div>
  );
}

export default function ProductForm({ form, initialValues, onFinish, loading }: ProductFormProps) {
  const { data: categoryTree = [], isLoading: categoriesLoading } = useCategoryTree();
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { data: units = [], isLoading: unitsLoading } = useUnits();
  const { data: warehouses = [] } = useWarehouses();
  const [isActive, setIsActive] = useState(true);
  const [productType, setProductType] = useState<ProductType>(ProductType.Finished);
  const [stockEntries, setStockEntries] = useState<(InitialStockEntryDto & { key: string })[]>([]);

  // Multi-image upload state
  interface ImageItem {
    id: string;
    file?: File;
    preview: string;
    isPrimary: boolean;
    isExisting?: boolean; // For images already saved on server
  }
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Handle adding new image
  const handleAddImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage: ImageItem = {
        id: `new-${Date.now()}`,
        file,
        preview: e.target?.result as string,
        isPrimary: images.length === 0, // First image is primary by default
      };
      setImages(prev => [...prev, newImage]);
      setSelectedImageIndex(images.length); // Select the newly added image
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // If removed image was primary, make first one primary
      if (prev[index].isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
    // Adjust selected index
    if (selectedImageIndex >= index && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  // Set image as primary
  const handleSetPrimary = (index: number) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    })));
    setSelectedImageIndex(index);
  };

  // Add new stock entry row
  const addStockEntry = () => {
    setStockEntries([
      ...stockEntries,
      { key: `stock-${Date.now()}`, warehouseId: 0, quantity: 0 }
    ]);
  };

  // Remove stock entry row
  const removeStockEntry = (index: number) => {
    setStockEntries(stockEntries.filter((_, i) => i !== index));
  };

  // Update stock entry
  const updateStockEntry = (index: number, field: keyof InitialStockEntryDto, value: any) => {
    const updated = [...stockEntries];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'warehouseId') {
      updated[index].locationId = undefined;
    }
    setStockEntries(updated);
  };

  // Wrap onFinish to include stock entries and images
  const handleFinish = (values: any) => {
    const validStockEntries = stockEntries
      .filter(e => e.warehouseId > 0 && e.quantity > 0)
      .map(({ key, ...entry }) => entry);

    // Get new image files (not existing ones from server)
    const newImageFiles = images
      .filter(img => img.file && !img.isExisting)
      .map(img => ({
        file: img.file!,
        isPrimary: img.isPrimary,
      }));

    onFinish({
      ...values,
      initialStock: validStockEntries.length > 0 ? validStockEntries : undefined,
      imageFiles: newImageFiles.length > 0 ? newImageFiles : undefined,
    });
  };

  // Convert category tree to TreeSelect format
  const categoryTreeData = convertToTreeData(categoryTree);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        unitPriceCurrency: initialValues.unitPriceCurrency || 'TRY',
        costPriceCurrency: initialValues.costPriceCurrency || 'TRY',
      });
      setIsActive(initialValues.isActive ?? true);
      setProductType(initialValues.productType || ProductType.Finished);
      // Load existing images
      if (initialValues.images && initialValues.images.length > 0) {
        const existingImages = initialValues.images.map((img, index) => ({
          id: `existing-${img.id}`,
          preview: img.imageUrl,
          isPrimary: img.isPrimary,
          isExisting: true,
        }));
        setImages(existingImages);
        // Select primary image or first one
        const primaryIndex = existingImages.findIndex(img => img.isPrimary);
        setSelectedImageIndex(primaryIndex >= 0 ? primaryIndex : 0);
      }
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
      onFinish={handleFinish}
      disabled={loading}
      className="w-full"
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Name + Type Selector
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-start gap-6">
            {/* Product Image Gallery */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              {/* Main Preview Image */}
              <div
                className="w-24 h-24 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group cursor-pointer"
                onClick={() => {
                  if (images.length > 0 && images[selectedImageIndex]) {
                    handleSetPrimary(selectedImageIndex);
                  }
                }}
              >
                {images.length > 0 && images[selectedImageIndex] ? (
                  <>
                    <img
                      src={images[selectedImageIndex].preview}
                      alt="Ana Görsel"
                      className="w-full h-full object-cover"
                    />
                    {images[selectedImageIndex].isPrimary && (
                      <div className="absolute top-1 left-1 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded">
                        Ana
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(selectedImageIndex);
                      }}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <PictureOutlined className="text-2xl text-slate-400" />
                )}
              </div>

              {/* Thumbnail Row */}
              <div className="flex items-center gap-1.5">
                {/* Existing Thumbnails */}
                {images.slice(0, 4).map((img, index) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-7 h-7 rounded border-2 overflow-hidden flex-shrink-0 transition-all ${
                      selectedImageIndex === index
                        ? 'border-slate-900 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={img.preview}
                      alt={`Görsel ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}

                {/* More indicator if > 4 images */}
                {images.length > 4 && (
                  <div className="w-7 h-7 rounded border-2 border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] text-slate-500 font-medium">
                    +{images.length - 4}
                  </div>
                )}

                {/* Add Button */}
                <Upload
                  showUploadList={false}
                  accept="image/*"
                  beforeUpload={handleAddImage}
                  multiple
                >
                  <button
                    type="button"
                    className="w-7 h-7 rounded border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-500 transition-colors"
                  >
                    <PlusOutlined className="text-xs" />
                  </button>
                </Upload>
              </div>
            </div>

            {/* Product Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: '' },
                  { max: 200, message: '' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Ürün Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Ürün açıklaması..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Type Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="productType" className="mb-0" initialValue={ProductType.Finished}>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {mainProductTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setProductType(type.value);
                        form.setFieldValue('productType', type.value);
                      }}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        productType === type.value
                          ? 'bg-white shadow-sm text-slate-900'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </Form.Item>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── ÜRÜN TÜRÜ (Full Selection) ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ürün Türü
            </h3>
            <div className="grid grid-cols-6 gap-2">
              {allProductTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setProductType(type.value);
                    form.setFieldValue('productType', type.value);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                    productType === type.value
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* ─────────────── ORGANİZASYON ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Organizasyon
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kategori <span className="text-red-500">*</span></label>
                <Form.Item
                  name="categoryId"
                  rules={[{ required: true, message: '' }]}
                  className="mb-0"
                >
                  <TreeSelect
                    placeholder="Kategori seçin"
                    loading={categoriesLoading}
                    treeData={categoryTreeData}
                    showSearch
                    treeNodeFilterProp="title"
                    suffixIcon={<TagOutlined className="text-slate-400" />}
                    treeLine={{ showLeafIcon: false }}
                    treeDefaultExpandAll
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider className="my-1" />
                        <Button type="text" icon={<PlusOutlined />} size="small" block className="text-left text-slate-600">
                          Yeni Ekle
                        </Button>
                      </>
                    )}
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Marka</label>
                <Form.Item name="brandId" className="mb-0">
                  <Select
                    placeholder="Marka seçin"
                    loading={brandsLoading}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    suffixIcon={<ShopOutlined className="text-slate-400" />}
                    options={brands.map((b) => ({ value: b.id, label: b.name }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider className="my-1" />
                        <Button type="text" icon={<PlusOutlined />} size="small" block className="text-left text-slate-600">
                          Yeni Ekle
                        </Button>
                      </>
                    )}
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Birim <span className="text-red-500">*</span></label>
                <Form.Item
                  name="unitId"
                  rules={[{ required: true, message: '' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Birim seçin"
                    loading={unitsLoading}
                    showSearch
                    optionFilterProp="label"
                    options={units.map((u) => ({
                      value: u.id,
                      label: `${u.name} (${u.symbol || u.code})`,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── ENVANTER KODLARI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Envanter Kodları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ürün Kodu <span className="text-red-500">*</span></label>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: '' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="PRD-001"
                    disabled={!!initialValues}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">SKU</label>
                <Form.Item name="sku" className="mb-0">
                  <Input
                    placeholder="SKU-12345"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Barkod</label>
                <Form.Item name="barcode" className="mb-0">
                  <Input
                    placeholder="8690000000000"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── FİYATLANDIRMA ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Fiyatlandırma
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Satış Fiyatı</label>
                <Form.Item name="unitPrice" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    placeholder="0.00"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    addonBefore={
                      <Form.Item name="unitPriceCurrency" noStyle>
                        <Select options={currencyOptions} variant="borderless" style={{ width: 50 }} />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maliyet Fiyatı</label>
                <Form.Item name="costPrice" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    placeholder="0.00"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    addonBefore={
                      <Form.Item name="costPriceCurrency" noStyle>
                        <Select options={currencyOptions} variant="borderless" style={{ width: 50 }} />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── STOK SEVİYELERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Stok Seviyeleri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Minimum</label>
                <Form.Item name="minStockLevel" rules={[{ required: true }]} className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maksimum</label>
                <Form.Item name="maxStockLevel" rules={[{ required: true }]} className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yeniden Sipariş</label>
                <Form.Item name="reorderLevel" rules={[{ required: true }]} className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sipariş Miktarı</label>
                <Form.Item name="reorderQuantity" rules={[{ required: true }]} className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── DURUM ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Durum
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm font-medium text-slate-700">Yayın Durumu</div>
                    <div className="text-xs text-slate-500 mt-0.5">
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
                    />
                  </Form.Item>
                </div>
              </div>
              {initialValues && (
                <div className="col-span-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <div className="text-xl font-semibold text-slate-800">
                        {initialValues.totalStockQuantity || 0}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Toplam Stok</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <div className="text-xl font-semibold text-slate-800">
                        ₺{(initialValues.unitPrice || 0).toLocaleString('tr-TR')}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Birim Fiyat</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─────────────── BAŞLANGIÇ STOKU (Only for new products) ─────────────── */}
          {!initialValues && (
            <div className="mb-8">
              <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Başlangıç Stoku (Opsiyonel)
                </h3>
                <Button
                  type="dashed"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={addStockEntry}
                  className="!border-slate-300 !text-slate-600 hover:!border-slate-400"
                >
                  Depo Ekle
                </Button>
              </div>
              {stockEntries.length > 0 ? (
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <div className="grid grid-cols-12 gap-3 mb-2 text-xs text-slate-500">
                    <div className="col-span-5">Depo</div>
                    <div className="col-span-4">Lokasyon</div>
                    <div className="col-span-2">Miktar</div>
                    <div className="col-span-1"></div>
                  </div>
                  {stockEntries.map((entry, index) => (
                    <StockEntryRow
                      key={entry.key}
                      entry={entry}
                      index={index}
                      warehouses={warehouses}
                      onWarehouseChange={(val) => updateStockEntry(index, 'warehouseId', val)}
                      onLocationChange={(val) => updateStockEntry(index, 'locationId', val)}
                      onQuantityChange={(val) => updateStockEntry(index, 'quantity', val)}
                      onRemove={() => removeStockEntry(index)}
                      canRemove={stockEntries.length > 1}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all"
                  onClick={addStockEntry}
                >
                  <InboxOutlined className="text-2xl text-slate-400 mb-2" />
                  <div className="text-sm text-slate-500">
                    Başlangıç stoku eklemek için tıklayın
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Ürün oluşturulduktan sonra da eklenebilir
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────── GELİŞMİŞ AYARLAR (Collapsible) ─────────────── */}
          <div>
            <Collapse
              ghost
              expandIconPosition="end"
              className="!bg-transparent [&_.ant-collapse-header]:!px-0 [&_.ant-collapse-content-box]:!px-0"
              items={[
                {
                  key: 'advanced',
                  label: (
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <SettingOutlined /> Gelişmiş Ayarlar
                    </h3>
                  ),
                  children: (
                    <div className="pt-4">
                      {/* Tracking Options */}
                      <div className="grid grid-cols-12 gap-4 mb-6">
                        <div className="col-span-4">
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                              <div className="text-sm font-medium text-slate-700">Seri No Takibi</div>
                              <div className="text-xs text-slate-500">Benzersiz seri numaraları</div>
                            </div>
                            <Form.Item name="trackSerialNumbers" valuePropName="checked" noStyle>
                              <Switch size="small" />
                            </Form.Item>
                          </div>
                        </div>
                        <div className="col-span-4">
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                              <div className="text-sm font-medium text-slate-700">Lot Takibi</div>
                              <div className="text-xs text-slate-500">Parti bazlı yönetim</div>
                            </div>
                            <Form.Item name="trackLotNumbers" valuePropName="checked" noStyle>
                              <Switch size="small" />
                            </Form.Item>
                          </div>
                        </div>
                        <div className="col-span-4">
                          <label className="block text-sm font-medium text-slate-600 mb-1.5">Tedarik Süresi (gün)</label>
                          <Form.Item name="leadTimeDays" rules={[{ required: true }]} className="mb-0">
                            <InputNumber
                              style={{ width: '100%' }}
                              min={0}
                              className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                            />
                          </Form.Item>
                        </div>
                      </div>

                      {/* Physical Properties */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-600 mb-3">Fiziksel Özellikler</label>
                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-3">
                            <Form.Item name="weight" className="mb-0">
                              <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                precision={2}
                                placeholder="Ağırlık"
                                className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
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
                          </div>
                          <div className="col-span-3">
                            <Form.Item name="length" className="mb-0">
                              <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                precision={2}
                                placeholder="Uzunluk"
                                className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                              />
                            </Form.Item>
                          </div>
                          <div className="col-span-3">
                            <Form.Item name="width" className="mb-0">
                              <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                precision={2}
                                placeholder="Genişlik"
                                className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                              />
                            </Form.Item>
                          </div>
                          <div className="col-span-3">
                            <Form.Item name="height" className="mb-0">
                              <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                precision={2}
                                placeholder="Yükseklik"
                                className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
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
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <Button htmlType="submit" />
      </Form.Item>
    </Form>
  );
}
