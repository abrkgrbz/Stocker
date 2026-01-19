'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Form,
  Input,
  Button,
  InputNumber,
  Table,
  Switch,
  ColorPicker,
  Collapse,
} from 'antd';
import {
  ArrowLeftIcon,
  ArrowsPointingOutIcon,
  CheckCircleIcon,
  CheckIcon,
  Cog6ToothIcon,
  EyeIcon,
  FunnelIcon,
  HashtagIcon,
  LanguageIcon,
  ListBulletIcon,
  PlusIcon,
  SwatchIcon,
  TrashIcon,
  DocumentTextIcon,
  CalendarIcon,
  LinkIcon,
  DocumentIcon,
  CalculatorIcon,
  CheckBadgeIcon,
  Bars3BottomLeftIcon,
  ClockIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { PageContainer } from '@/components/patterns';
import { useCreateProductAttribute } from '@/lib/api/hooks/useInventory';
import {
  AttributeType,
  type CreateProductAttributeDto,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import type { Color } from 'antd/es/color-picker';
import { showSuccess, showError } from '@/lib/utils/sweetalert';

const { TextArea } = Input;

interface AttributeOption {
  key: string;
  value: string;
  label: string;
  colorCode?: string;
  imageUrl?: string;
  displayOrder?: number;
}

// Tüm özellik tipleri - iconlu ve açıklamalı
const attributeTypeOptions = [
  {
    value: AttributeType.Text,
    label: 'Metin',
    icon: DocumentTextIcon,
    description: 'Kısa metin girişi',
    category: 'basic',
  },
  {
    value: AttributeType.TextArea,
    label: 'Uzun Metin',
    icon: Bars3BottomLeftIcon,
    description: 'Çok satırlı metin',
    category: 'basic',
  },
  {
    value: AttributeType.Integer,
    label: 'Tam Sayı',
    icon: HashtagIcon,
    description: 'Sayı değeri (1, 2, 3...)',
    category: 'basic',
  },
  {
    value: AttributeType.Decimal,
    label: 'Ondalık',
    icon: CalculatorIcon,
    description: 'Kesirli sayı (1.5, 2.75...)',
    category: 'basic',
  },
  {
    value: AttributeType.Boolean,
    label: 'Evet/Hayır',
    icon: CheckBadgeIcon,
    description: 'Açık/Kapalı seçeneği',
    category: 'basic',
  },
  {
    value: AttributeType.Date,
    label: 'Tarih',
    icon: CalendarIcon,
    description: 'Tarih seçimi',
    category: 'basic',
  },
  {
    value: AttributeType.DateTime,
    label: 'Tarih/Saat',
    icon: ClockIcon,
    description: 'Tarih ve saat seçimi',
    category: 'basic',
  },
  {
    value: AttributeType.Select,
    label: 'Tekli Seçim',
    icon: ListBulletIcon,
    description: 'Listeden tek seçenek',
    category: 'selection',
  },
  {
    value: AttributeType.MultiSelect,
    label: 'Çoklu Seçim',
    icon: Squares2X2Icon,
    description: 'Listeden birden fazla seçenek',
    category: 'selection',
  },
  {
    value: AttributeType.Color,
    label: 'Renk',
    icon: SwatchIcon,
    description: 'Renk paleti ile seçim',
    category: 'selection',
  },
  {
    value: AttributeType.Size,
    label: 'Beden',
    icon: ArrowsPointingOutIcon,
    description: 'S, M, L, XL gibi bedenler',
    category: 'selection',
  },
  {
    value: AttributeType.Url,
    label: 'URL',
    icon: LinkIcon,
    description: 'Web adresi',
    category: 'other',
  },
  {
    value: AttributeType.File,
    label: 'Dosya',
    icon: DocumentIcon,
    description: 'Dosya yükleme',
    category: 'other',
  },
];

const hasOptionsTypes = [
  AttributeType.Select,
  AttributeType.MultiSelect,
  AttributeType.Color,
  AttributeType.Size,
];

// Preset options for quick add
const sizePresets = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];
const colorPresets = [
  { value: 'Siyah', colorCode: '#000000' },
  { value: 'Beyaz', colorCode: '#FFFFFF' },
  { value: 'Kırmızı', colorCode: '#EF4444' },
  { value: 'Mavi', colorCode: '#3B82F6' },
  { value: 'Yeşil', colorCode: '#22C55E' },
  { value: 'Sarı', colorCode: '#EAB308' },
  { value: 'Mor', colorCode: '#A855F7' },
  { value: 'Pembe', colorCode: '#EC4899' },
  { value: 'Gri', colorCode: '#6B7280' },
  { value: 'Kahve', colorCode: '#92400E' },
];

export default function NewProductAttributePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [options, setOptions] = useState<AttributeOption[]>([]);
  const [attributeType, setAttributeType] = useState<AttributeType>(AttributeType.Text);
  const [isRequired, setIsRequired] = useState(false);
  const [isFilterable, setIsFilterable] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const createAttribute = useCreateProductAttribute();

  const hasOptions = hasOptionsTypes.includes(attributeType);

  const handleAddOption = () => {
    const newOption: AttributeOption = {
      key: `option-${Date.now()}`,
      value: '',
      label: '',
      displayOrder: options.length + 1,
    };
    setOptions([...options, newOption]);
  };

  const handleAddPresetOptions = (presets: { value: string; colorCode?: string }[]) => {
    const existingValues = options.map((o) => o.value.toLowerCase());
    const newOptions: AttributeOption[] = presets
      .filter((p) => !existingValues.includes(p.value.toLowerCase()))
      .map((preset, index) => ({
        key: `option-${Date.now()}-${index}`,
        value: preset.value,
        label: preset.value,
        colorCode: preset.colorCode,
        displayOrder: options.length + index + 1,
      }));
    setOptions([...options, ...newOptions]);
  };

  const handleRemoveOption = (key: string) => {
    setOptions(options.filter((opt) => opt.key !== key));
  };

  const handleOptionChange = (key: string, field: keyof AttributeOption, value: unknown) => {
    setOptions(
      options.map((opt) => {
        if (opt.key === key) {
          if (field === 'value') {
            return { ...opt, value: value as string, label: value as string };
          }
          return { ...opt, [field]: value };
        }
        return opt;
      })
    );
  };

  const handleTypeChange = (type: AttributeType) => {
    setAttributeType(type);
    if (!hasOptionsTypes.includes(type)) {
      setOptions([]);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (hasOptions && options.length === 0) {
        showError('En az bir seçenek ekleyin');
        return;
      }

      if (hasOptions) {
        const emptyOptions = options.filter((opt) => !opt.value.trim());
        if (emptyOptions.length > 0) {
          showError('Tüm seçenek değerlerini doldurun');
          return;
        }
      }

      const data: CreateProductAttributeDto = {
        code: values.code,
        name: values.name,
        description: values.description,
        attributeType: attributeType,
        isRequired: isRequired,
        isFilterable: isFilterable,
        isSearchable: false,
        showInList: isVisible,
        displayOrder: values.displayOrder || 0,
        validationPattern: values.validationPattern,
        defaultValue: values.defaultValue,
        options: hasOptions
          ? options.map((opt, index) => ({
              value: opt.value,
              label: opt.value,
              displayOrder: index + 1,
              colorCode: opt.colorCode,
              imageUrl: opt.imageUrl,
            }))
          : undefined,
      };

      await createAttribute.mutateAsync(data);
      showSuccess('Başarılı', 'Özellik başarıyla oluşturuldu');
      router.push('/inventory/product-attributes');
    } catch {
      // Validation error
    }
  };

  const optionColumns: ColumnsType<AttributeOption> = [
    {
      title: '#',
      key: 'order',
      width: 50,
      render: (_, __, index) => <span className="text-slate-400">{index + 1}</span>,
    },
    {
      title: 'Değer',
      dataIndex: 'value',
      key: 'value',
      render: (_, record) => (
        <Input
          placeholder="Seçenek değeri"
          value={record.value}
          onChange={(e) => handleOptionChange(record.key, 'value', e.target.value)}
          className="rounded-md"
        />
      ),
    },
    {
      title: 'Renk',
      dataIndex: 'colorCode',
      key: 'colorCode',
      width: 100,
      render: (_, record) =>
        attributeType === AttributeType.Color ? (
          <ColorPicker
            value={record.colorCode || '#000000'}
            onChange={(color: Color) =>
              handleOptionChange(record.key, 'colorCode', color.toHexString())
            }
            showText
            size="small"
          />
        ) : (
          <span className="text-slate-400">-</span>
        ),
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

  // Grupla kategorilere göre
  const basicTypes = attributeTypeOptions.filter((t) => t.category === 'basic');
  const selectionTypes = attributeTypeOptions.filter((t) => t.category === 'selection');
  const otherTypes = attributeTypeOptions.filter((t) => t.category === 'other');

  const selectedTypeInfo = attributeTypeOptions.find((t) => t.value === attributeType);

  return (
    <PageContainer maxWidth="7xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/inventory/product-attributes"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Listeye Dön
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Yeni Ürün Özelliği</h1>
            <p className="text-sm text-slate-500 mt-1">
              Ürünlere eklenecek yeni bir özellik tanımlayın
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/inventory/product-attributes')}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createAttribute.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckIcon className="w-4 h-4" />
              {createAttribute.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          displayOrder: 0,
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Type Selection (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Özellik Tipi Selection - Visual Cards */}
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-medium text-slate-900">Özellik Tipi Seçin</h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Temel Tipler */}
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                    Temel Veri Tipleri
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {basicTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = attributeType === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleTypeChange(type.value)}
                          className={`p-3 rounded-lg text-left transition-all border ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                            <span className="text-sm font-medium">{type.label}</span>
                          </div>
                          <div className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                            {type.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Seçim Tipleri */}
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                    Seçim Tipleri
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectionTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = attributeType === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleTypeChange(type.value)}
                          className={`p-3 rounded-lg text-left transition-all border ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                            <span className="text-sm font-medium">{type.label}</span>
                          </div>
                          <div className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                            {type.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Diğer Tipler */}
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                    Diğer
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {otherTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = attributeType === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleTypeChange(type.value)}
                          className={`p-3 rounded-lg text-left transition-all border ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                            <span className="text-sm font-medium">{type.label}</span>
                          </div>
                          <div className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                            {type.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Seçili Tip Özeti */}
              {selectedTypeInfo && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                      <selectedTypeInfo.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {selectedTypeInfo.label}
                      </div>
                      <div className="text-xs text-slate-500">{selectedTypeInfo.description}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Settings Toggles */}
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <Cog6ToothIcon className="w-4 h-4 text-slate-400" />
                  Davranış Ayarları
                </h2>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-4 px-4 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">Zorunlu Alan</div>
                      <div className="text-xs text-slate-500">Bu alan doldurulmak zorunda</div>
                    </div>
                  </div>
                  <Switch size="small" checked={isRequired} onChange={setIsRequired} />
                </div>

                <div className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-4 px-4 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FunnelIcon className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">Filtrelenebilir</div>
                      <div className="text-xs text-slate-500">Ürün listesinde filtre olarak kullan</div>
                    </div>
                  </div>
                  <Switch size="small" checked={isFilterable} onChange={setIsFilterable} />
                </div>

                <div className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-4 px-4 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <EyeIcon className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">Görünür</div>
                      <div className="text-xs text-slate-500">Müşterilere gösterilir</div>
                    </div>
                  </div>
                  <Switch size="small" checked={isVisible} onChange={setIsVisible} />
                </div>
              </div>
            </div>

            {/* Quick Add Presets */}
            {attributeType === AttributeType.Size && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <ArrowsPointingOutIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">Hızlı Ekle - Bedenler</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizePresets.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleAddPresetOptions([{ value: size }])}
                      disabled={options.some((o) => o.value.toLowerCase() === size.toLowerCase())}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {size}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddPresetOptions(sizePresets.map((s) => ({ value: s })))}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-dashed border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    Tümü
                  </button>
                </div>
              </div>
            )}

            {attributeType === AttributeType.Color && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <SwatchIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">Hızlı Ekle - Renkler</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleAddPresetOptions([color])}
                      disabled={options.some((o) => o.value.toLowerCase() === color.value.toLowerCase())}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div
                        className="w-3 h-3 rounded-full border border-slate-300"
                        style={{ backgroundColor: color.colorCode }}
                      />
                      {color.value}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Form Content (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Form Card */}
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-medium text-slate-900">Temel Bilgiler</h2>
              </div>

              <div className="p-6">
                {/* Name & Description */}
                <div className="mb-6">
                  <Form.Item
                    name="name"
                    label={<span className="text-sm text-slate-700">Özellik Adı</span>}
                    rules={[{ required: true, message: 'Özellik adı zorunludur' }]}
                  >
                    <Input
                      placeholder="Örn: Renk, Beden, Materyal"
                      className="rounded-md"
                    />
                  </Form.Item>
                  <Form.Item
                    name="description"
                    label={<span className="text-sm text-slate-700">Açıklama</span>}
                  >
                    <TextArea
                      placeholder="Özellik hakkında açıklama..."
                      rows={3}
                      className="rounded-md"
                    />
                  </Form.Item>
                </div>

                {/* Tanımlayıcılar Section */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
                    Tanımlayıcılar
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Form.Item
                      name="code"
                      label={<span className="text-sm text-slate-700">Kod</span>}
                      rules={[{ required: true, message: 'Kod gerekli' }]}
                    >
                      <Input placeholder="color" className="rounded-md" />
                    </Form.Item>
                    <Form.Item
                      name="groupName"
                      label={<span className="text-sm text-slate-700">Grup</span>}
                    >
                      <Input placeholder="Fiziksel Özellikler" className="rounded-md" />
                    </Form.Item>
                    <Form.Item
                      name="displayOrder"
                      label={<span className="text-sm text-slate-700">Sıra</span>}
                    >
                      <InputNumber style={{ width: '100%' }} min={0} className="rounded-md" />
                    </Form.Item>
                  </div>
                </div>

                {/* Validation Section - Conditional */}
                {(attributeType === AttributeType.Integer ||
                  attributeType === AttributeType.Decimal) && (
                  <div className="mb-6">
                    <Collapse
                      ghost
                      expandIconPosition="end"
                      className="!bg-transparent [&_.ant-collapse-header]:!px-0 [&_.ant-collapse-content-box]:!px-0"
                      items={[
                        {
                          key: 'validation',
                          label: (
                            <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                              <HashtagIcon className="w-4 h-4 text-slate-400" />
                              Sayı Doğrulama
                            </h3>
                          ),
                          children: (
                            <div className="pt-4 grid grid-cols-2 gap-4">
                              <Form.Item
                                name="minValue"
                                label={<span className="text-sm text-slate-700">Minimum</span>}
                              >
                                <InputNumber style={{ width: '100%' }} className="rounded-md" />
                              </Form.Item>
                              <Form.Item
                                name="maxValue"
                                label={<span className="text-sm text-slate-700">Maximum</span>}
                              >
                                <InputNumber style={{ width: '100%' }} className="rounded-md" />
                              </Form.Item>
                            </div>
                          ),
                        },
                      ]}
                    />
                  </div>
                )}

                {attributeType === AttributeType.Text && (
                  <div className="mb-6">
                    <Collapse
                      ghost
                      expandIconPosition="end"
                      className="!bg-transparent [&_.ant-collapse-header]:!px-0 [&_.ant-collapse-content-box]:!px-0"
                      items={[
                        {
                          key: 'validation',
                          label: (
                            <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                              <LanguageIcon className="w-4 h-4 text-slate-400" />
                              Metin Doğrulama
                            </h3>
                          ),
                          children: (
                            <div className="pt-4">
                              <Form.Item
                                name="validationPattern"
                                label={<span className="text-sm text-slate-700">Regex Deseni</span>}
                                extra="Örn: ^[A-Za-z0-9]+$ (alfanumerik)"
                              >
                                <Input placeholder="Regex deseni" className="rounded-md" />
                              </Form.Item>
                            </div>
                          ),
                        },
                      ]}
                    />
                  </div>
                )}

                {/* Varsayılan Değer */}
                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
                    Varsayılan Değer
                  </h3>
                  <Form.Item name="defaultValue">
                    <Input
                      placeholder="Yeni ürünlerde otomatik doldurulacak değer"
                      className="rounded-md"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* Options Section */}
            {hasOptions && (
              <div className="bg-white border border-slate-200 rounded-xl">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <ListBulletIcon className="w-4 h-4 text-slate-400" />
                    Seçenekler
                    {options.length > 0 && (
                      <span className="text-xs text-slate-500 font-normal">({options.length})</span>
                    )}
                  </h2>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-dashed border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    Seçenek Ekle
                  </button>
                </div>

                <div className="p-6">
                  {options.length === 0 ? (
                    <div
                      className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-all"
                      onClick={handleAddOption}
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-3">
                        <ListBulletIcon className="w-5 h-5 text-slate-300" />
                      </div>
                      <div className="text-sm font-medium text-slate-600 mb-1">
                        Henüz seçenek eklenmedi
                      </div>
                      <div className="text-xs text-slate-400">Eklemek için tıklayın</div>
                    </div>
                  ) : (
                    <Table
                      columns={optionColumns}
                      dataSource={options}
                      rowKey="key"
                      pagination={false}
                      size="small"
                      className="enterprise-table"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden submit button */}
        <Form.Item hidden>
          <Button htmlType="submit" />
        </Form.Item>
      </Form>
    </PageContainer>
  );
}
