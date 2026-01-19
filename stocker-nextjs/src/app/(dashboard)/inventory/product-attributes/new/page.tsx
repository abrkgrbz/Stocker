'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Form,
  Input,
  InputNumber,
  Table,
  Switch,
  ColorPicker,
} from 'antd';
import {
  ArrowLeftIcon,
  ArrowsPointingOutIcon,
  CheckIcon,
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
  ChevronDownIcon,
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

// Tüm özellik tipleri
const attributeTypeOptions = [
  { value: AttributeType.Text, label: 'Metin', icon: DocumentTextIcon, description: 'Kısa metin girişi' },
  { value: AttributeType.TextArea, label: 'Uzun Metin', icon: Bars3BottomLeftIcon, description: 'Çok satırlı metin' },
  { value: AttributeType.Integer, label: 'Tam Sayı', icon: HashtagIcon, description: 'Sayı değeri' },
  { value: AttributeType.Decimal, label: 'Ondalık', icon: CalculatorIcon, description: 'Kesirli sayı' },
  { value: AttributeType.Boolean, label: 'Evet/Hayır', icon: CheckBadgeIcon, description: 'Açık/Kapalı' },
  { value: AttributeType.Date, label: 'Tarih', icon: CalendarIcon, description: 'Tarih seçimi' },
  { value: AttributeType.DateTime, label: 'Tarih/Saat', icon: ClockIcon, description: 'Tarih ve saat' },
  { value: AttributeType.Select, label: 'Tekli Seçim', icon: ListBulletIcon, description: 'Listeden tek seçenek' },
  { value: AttributeType.MultiSelect, label: 'Çoklu Seçim', icon: Squares2X2Icon, description: 'Birden fazla seçenek' },
  { value: AttributeType.Color, label: 'Renk', icon: SwatchIcon, description: 'Renk paleti' },
  { value: AttributeType.Size, label: 'Beden', icon: ArrowsPointingOutIcon, description: 'S, M, L, XL...' },
  { value: AttributeType.Url, label: 'URL', icon: LinkIcon, description: 'Web adresi' },
  { value: AttributeType.File, label: 'Dosya', icon: DocumentIcon, description: 'Dosya yükleme' },
];

const hasOptionsTypes = [AttributeType.Select, AttributeType.MultiSelect, AttributeType.Color, AttributeType.Size];
const numericTypes = [AttributeType.Integer, AttributeType.Decimal];

// Presets
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
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const createAttribute = useCreateProductAttribute();

  const hasOptions = hasOptionsTypes.includes(attributeType);
  const isNumeric = numericTypes.includes(attributeType);
  const isText = attributeType === AttributeType.Text;
  const isColor = attributeType === AttributeType.Color;
  const isSize = attributeType === AttributeType.Size;

  const selectedTypeInfo = attributeTypeOptions.find((t) => t.value === attributeType);

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
    setIsTypeDropdownOpen(false);
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
      render: (_, __, index) => <span className="text-slate-400 text-sm">{index + 1}</span>,
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
    ...(isColor
      ? [
          {
            title: 'Renk',
            dataIndex: 'colorCode',
            key: 'colorCode',
            width: 120,
            render: (_: unknown, record: AttributeOption) => (
              <ColorPicker
                value={record.colorCode || '#000000'}
                onChange={(color: Color) =>
                  handleOptionChange(record.key, 'colorCode', color.toHexString())
                }
                showText
                size="small"
              />
            ),
          },
        ]
      : []),
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <button
          type="button"
          onClick={() => handleRemoveOption(record.key)}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <PageContainer maxWidth="3xl">
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

      {/* Single Column Form */}
      <Form form={form} layout="vertical" initialValues={{ displayOrder: 0 }}>
        <div className="bg-white border border-slate-200 rounded-xl">
          {/* STEP 1: Temel Tanım */}
          <div className="p-6 space-y-6">
            {/* Özellik Adı - Hero Input */}
            <div>
              <Form.Item
                name="name"
                rules={[{ required: true, message: 'Özellik adı zorunludur' }]}
                className="mb-0"
              >
                <Input
                  placeholder="Özellik adı girin (örn: Renk, Beden, Materyal)"
                  className="!text-lg !py-3 rounded-lg"
                  size="large"
                />
              </Form.Item>
            </div>

            {/* Özellik Tipi - Custom Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Özellik Tipi
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-300 rounded-lg hover:border-slate-400 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {selectedTypeInfo && (
                      <>
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          <selectedTypeInfo.icon className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {selectedTypeInfo.label}
                          </div>
                          <div className="text-xs text-slate-500">{selectedTypeInfo.description}</div>
                        </div>
                      </>
                    )}
                  </div>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      isTypeDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isTypeDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsTypeDropdownOpen(false)}
                    />
                    <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                      <div className="p-2">
                        {attributeTypeOptions.map((type) => {
                          const Icon = type.icon;
                          const isSelected = attributeType === type.value;
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => handleTypeChange(type.value)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                isSelected
                                  ? 'bg-slate-900 text-white'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  isSelected ? 'bg-slate-700' : 'bg-slate-100'
                                }`}
                              >
                                <Icon
                                  className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`}
                                />
                              </div>
                              <div>
                                <div className={`text-sm font-medium ${isSelected ? 'text-white' : ''}`}>
                                  {type.label}
                                </div>
                                <div
                                  className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}
                                >
                                  {type.description}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* STEP 2: Tipe Göre Değişen Konfigürasyon */}
          {(hasOptions || isNumeric || isText) && (
            <>
              <div className="p-6 space-y-6">
                {/* Sayısal Tipler: Min/Max */}
                {isNumeric && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 mb-4">Sayı Ayarları</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Form.Item
                        name="minValue"
                        label={<span className="text-sm text-slate-600">Minimum Değer</span>}
                        className="mb-0"
                      >
                        <InputNumber
                          placeholder="Boş bırakılabilir"
                          className="w-full rounded-md"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                      <Form.Item
                        name="maxValue"
                        label={<span className="text-sm text-slate-600">Maximum Değer</span>}
                        className="mb-0"
                      >
                        <InputNumber
                          placeholder="Boş bırakılabilir"
                          className="w-full rounded-md"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </div>
                  </div>
                )}

                {/* Metin Tipi: Regex */}
                {isText && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 mb-4">Metin Ayarları</h3>
                    <Form.Item
                      name="validationPattern"
                      label={<span className="text-sm text-slate-600">Doğrulama Deseni (Regex)</span>}
                      extra={<span className="text-xs text-slate-400">Örn: ^[A-Za-z0-9]+$ (alfanumerik)</span>}
                      className="mb-0"
                    >
                      <Input placeholder="İsteğe bağlı regex deseni" className="rounded-md" />
                    </Form.Item>
                  </div>
                )}

                {/* Seçim Tipleri: Seçenek Listesi */}
                {hasOptions && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-slate-900">
                        Seçenekler
                        {options.length > 0 && (
                          <span className="ml-2 text-slate-400 font-normal">({options.length})</span>
                        )}
                      </h3>
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Seçenek Ekle
                      </button>
                    </div>

                    {/* Quick Add Presets - Only show for Color/Size */}
                    {(isColor || isSize) && (
                      <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                          Hızlı Ekle
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {isSize &&
                            sizePresets.map((size) => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => handleAddPresetOptions([{ value: size }])}
                                disabled={options.some((o) => o.value.toLowerCase() === size.toLowerCase())}
                                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 hover:border-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {size}
                              </button>
                            ))}
                          {isSize && (
                            <button
                              type="button"
                              onClick={() => handleAddPresetOptions(sizePresets.map((s) => ({ value: s })))}
                              className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-dashed border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
                            >
                              Tümünü Ekle
                            </button>
                          )}
                          {isColor &&
                            colorPresets.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => handleAddPresetOptions([color])}
                                disabled={options.some(
                                  (o) => o.value.toLowerCase() === color.value.toLowerCase()
                                )}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 hover:border-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

                    {/* Options Table or Empty State */}
                    {options.length === 0 ? (
                      <div
                        className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-all"
                        onClick={handleAddOption}
                      >
                        <ListBulletIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <div className="text-sm text-slate-500">Henüz seçenek eklenmedi</div>
                        <div className="text-xs text-slate-400 mt-1">Eklemek için tıklayın</div>
                      </div>
                    ) : (
                      <Table
                        columns={optionColumns}
                        dataSource={options}
                        rowKey="key"
                        pagination={false}
                        size="small"
                        className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
                      />
                    )}
                  </div>
                )}
              </div>
              <div className="border-t border-slate-100" />
            </>
          )}

          {/* STEP 3: Detaylar ve Ayarlar */}
          <div className="p-6 space-y-6">
            {/* Tanımlayıcılar */}
            <div>
              <h3 className="text-sm font-medium text-slate-900 mb-4">Tanımlayıcılar</h3>
              <div className="grid grid-cols-3 gap-4">
                <Form.Item
                  name="code"
                  label={<span className="text-sm text-slate-600">Kod</span>}
                  rules={[{ required: true, message: 'Kod gerekli' }]}
                  className="mb-0"
                >
                  <Input placeholder="color" className="rounded-md" />
                </Form.Item>
                <Form.Item
                  name="groupName"
                  label={<span className="text-sm text-slate-600">Grup</span>}
                  className="mb-0"
                >
                  <Input placeholder="Fiziksel Özellikler" className="rounded-md" />
                </Form.Item>
                <Form.Item
                  name="displayOrder"
                  label={<span className="text-sm text-slate-600">Sıra</span>}
                  className="mb-0"
                >
                  <InputNumber style={{ width: '100%' }} min={0} className="rounded-md" />
                </Form.Item>
              </div>
            </div>

            {/* Açıklama */}
            <div>
              <Form.Item
                name="description"
                label={<span className="text-sm text-slate-600">Açıklama</span>}
                className="mb-0"
              >
                <TextArea
                  placeholder="Özellik hakkında kısa açıklama (isteğe bağlı)"
                  rows={2}
                  className="rounded-md"
                />
              </Form.Item>
            </div>

            {/* Varsayılan Değer */}
            <div>
              <Form.Item
                name="defaultValue"
                label={<span className="text-sm text-slate-600">Varsayılan Değer</span>}
                className="mb-0"
              >
                <Input
                  placeholder="Yeni ürünlerde otomatik doldurulacak değer"
                  className="rounded-md"
                />
              </Form.Item>
            </div>

            {/* Ayar Switchleri - Yan Yana */}
            <div>
              <h3 className="text-sm font-medium text-slate-900 mb-4">Ayarlar</h3>
              <div className="flex items-center gap-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Switch size="small" checked={isRequired} onChange={setIsRequired} />
                  <span className="text-sm text-slate-700">Zorunlu</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Switch size="small" checked={isFilterable} onChange={setIsFilterable} />
                  <span className="text-sm text-slate-700">Filtrelenebilir</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Switch size="small" checked={isVisible} onChange={setIsVisible} />
                  <span className="text-sm text-slate-700">Müşteriye Görünür</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </PageContainer>
  );
}
