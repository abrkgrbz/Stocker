'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Input,
  Button,
  Space,
  InputNumber,
  Typography,
  Row,
  Col,
  message,
  Table,
  Switch,
  Segmented,
  Select,
  ColorPicker,
  Collapse,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  TagsOutlined,
  PlusOutlined,
  DeleteOutlined,
  FontSizeOutlined,
  NumberOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  BgColorsOutlined,
  ExpandOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useCreateProductAttribute } from '@/lib/api/hooks/useInventory';
import {
  AttributeType,
  type CreateProductAttributeDto,
  type CreateProductAttributeOptionDto,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import type { Color } from 'antd/es/color-picker';

const { Text } = Typography;
const { TextArea } = Input;

interface AttributeOption {
  key: string;
  value: string;
  label: string;
  colorCode?: string;
  imageUrl?: string;
  displayOrder?: number;
}

const mainAttributeTypes = [
  { value: AttributeType.Text, label: 'Metin' },
  { value: AttributeType.Select, label: 'Seçim' },
  { value: AttributeType.Color, label: 'Renk' },
  { value: AttributeType.Size, label: 'Beden' },
];

const otherAttributeTypes = [
  { value: AttributeType.Number, label: 'Sayı' },
  { value: AttributeType.Boolean, label: 'Evet/Hayır' },
  { value: AttributeType.Date, label: 'Tarih' },
  { value: AttributeType.MultiSelect, label: 'Çoklu Seçim' },
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
          // If value changes, also update label to match
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
        message.error('En az bir seçenek ekleyin');
        return;
      }

      if (hasOptions) {
        const emptyOptions = options.filter((opt) => !opt.value.trim());
        if (emptyOptions.length > 0) {
          message.error('Tüm seçenek değerlerini doldurun');
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
              label: opt.value, // Use value as label if not specified
              displayOrder: index + 1,
              colorCode: opt.colorCode,
              imageUrl: opt.imageUrl,
            }))
          : undefined,
      };

      await createAttribute.mutateAsync(data);
      message.success('Özellik başarıyla oluşturuldu');
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
      render: (_, __, index) => <span className="text-gray-400">{index + 1}</span>,
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
          variant="filled"
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
          <Text type="secondary">-</Text>
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
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveOption(record.key)}
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
              <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Ürün Özelliği</h1>
              <p className="text-sm text-gray-400 m-0">Varyant veya filtreleme özelliği oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/product-attributes')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createAttribute.isPending}
              onClick={handleSubmit}
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
            displayOrder: 0,
          }}
        >
          <Row gutter={48}>
            {/* Left Panel - Type & Settings (40%) */}
            <Col xs={24} lg={10}>
              {/* Attribute Type Selection */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <TagsOutlined className="mr-1" /> Özellik Tipi
                </Text>
                <Segmented
                  block
                  options={mainAttributeTypes}
                  value={attributeType}
                  onChange={(val) => handleTypeChange(val as AttributeType)}
                  className="bg-gray-100/50 mb-2"
                  style={{ padding: '4px' }}
                />
                <Select
                  size="small"
                  variant="borderless"
                  placeholder="+ Diğer tipler"
                  className="text-gray-400 text-xs"
                  style={{ width: 140 }}
                  options={otherAttributeTypes}
                  onChange={(val) => handleTypeChange(val)}
                />
              </div>

              {/* Settings Toggles */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <SettingOutlined className="mr-1" /> Ayarlar
                </Text>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <CheckSquareOutlined className="text-red-500" />
                      </div>
                      <div>
                        <Text strong className="text-gray-700 text-sm">
                          Zorunlu Alan
                        </Text>
                        <div className="text-xs text-gray-400">Doldurulmak zorunda</div>
                      </div>
                    </div>
                    <Switch size="small" checked={isRequired} onChange={setIsRequired} />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <UnorderedListOutlined className="text-blue-500" />
                      </div>
                      <div>
                        <Text strong className="text-gray-700 text-sm">
                          Filtrelenebilir
                        </Text>
                        <div className="text-xs text-gray-400">Ürün listesinde filtre</div>
                      </div>
                    </div>
                    <Switch size="small" checked={isFilterable} onChange={setIsFilterable} />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <AppstoreOutlined className="text-green-500" />
                      </div>
                      <div>
                        <Text strong className="text-gray-700 text-sm">
                          Görünür
                        </Text>
                        <div className="text-xs text-gray-400">Müşterilere gösterilir</div>
                      </div>
                    </div>
                    <Switch size="small" checked={isVisible} onChange={setIsVisible} />
                  </div>
                </div>
              </div>

              {/* Quick Add Presets */}
              {attributeType === AttributeType.Size && (
                <div className="mb-8 p-4 bg-purple-50/50 rounded-xl">
                  <Text className="text-xs font-medium text-purple-700 uppercase tracking-wide mb-2 block">
                    <ExpandOutlined className="mr-1" /> Hızlı Ekle - Bedenler
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    {sizePresets.map((size) => (
                      <Button
                        key={size}
                        size="small"
                        onClick={() => handleAddPresetOptions([{ value: size }])}
                        disabled={options.some((o) => o.value.toLowerCase() === size.toLowerCase())}
                      >
                        {size}
                      </Button>
                    ))}
                    <Button
                      type="dashed"
                      size="small"
                      onClick={() => handleAddPresetOptions(sizePresets.map((s) => ({ value: s })))}
                    >
                      Tümü
                    </Button>
                  </div>
                </div>
              )}

              {attributeType === AttributeType.Color && (
                <div className="mb-8 p-4 bg-cyan-50/50 rounded-xl">
                  <Text className="text-xs font-medium text-cyan-700 uppercase tracking-wide mb-2 block">
                    <BgColorsOutlined className="mr-1" /> Hızlı Ekle - Renkler
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    {colorPresets.map((color) => (
                      <Button
                        key={color.value}
                        size="small"
                        onClick={() => handleAddPresetOptions([color])}
                        disabled={options.some(
                          (o) => o.value.toLowerCase() === color.value.toLowerCase()
                        )}
                        icon={
                          <div
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: color.colorCode }}
                          />
                        }
                      >
                        {color.value}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation for Number/Text */}
              {attributeType === AttributeType.Number && (
                <Collapse
                  ghost
                  expandIconPosition="end"
                  items={[
                    {
                      key: 'validation',
                      label: (
                        <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          <NumberOutlined className="mr-1" /> Sayı Doğrulama
                        </Text>
                      ),
                      children: (
                        <Row gutter={16}>
                          <Col span={12}>
                            <div className="text-xs text-gray-400 mb-1">Minimum</div>
                            <Form.Item name="minValue" className="mb-0">
                              <InputNumber style={{ width: '100%' }} variant="filled" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <div className="text-xs text-gray-400 mb-1">Maximum</div>
                            <Form.Item name="maxValue" className="mb-0">
                              <InputNumber style={{ width: '100%' }} variant="filled" />
                            </Form.Item>
                          </Col>
                        </Row>
                      ),
                    },
                  ]}
                />
              )}

              {attributeType === AttributeType.Text && (
                <Collapse
                  ghost
                  expandIconPosition="end"
                  items={[
                    {
                      key: 'validation',
                      label: (
                        <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          <FontSizeOutlined className="mr-1" /> Metin Doğrulama
                        </Text>
                      ),
                      children: (
                        <Form.Item
                          name="validationPattern"
                          extra="Örn: ^[A-Za-z0-9]+$ (alfanumerik)"
                          className="mb-0"
                        >
                          <Input placeholder="Regex deseni" variant="filled" />
                        </Form.Item>
                      ),
                    },
                  ]}
                />
              )}
            </Col>

            {/* Right Panel - Form Content (60%) */}
            <Col xs={24} lg={14}>
              {/* Attribute Name - Hero Input */}
              <div className="mb-8">
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: 'Özellik adı zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Özellik adı"
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
                    placeholder="Özellik açıklaması ekleyin..."
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

              {/* Codes */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  Tanımlayıcılar
                </Text>
                <Row gutter={16}>
                  <Col span={8}>
                    <div className="text-xs text-gray-400 mb-1">Kod *</div>
                    <Form.Item
                      name="code"
                      rules={[{ required: true, message: 'Kod gerekli' }]}
                      className="mb-0"
                    >
                      <Input placeholder="color" variant="filled" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <div className="text-xs text-gray-400 mb-1">Grup</div>
                    <Form.Item name="groupName" className="mb-0">
                      <Input placeholder="Fiziksel Özellikler" variant="filled" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <div className="text-xs text-gray-400 mb-1">Sıra</div>
                    <Form.Item name="displayOrder" className="mb-0">
                      <InputNumber style={{ width: '100%' }} min={0} variant="filled" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

              {/* Options Section */}
              {hasOptions && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Seçenekler
                      {options.length > 0 && (
                        <span className="ml-2 text-gray-400">({options.length})</span>
                      )}
                    </Text>
                    <Button
                      type="text"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={handleAddOption}
                      className="text-blue-500"
                    >
                      Seçenek Ekle
                    </Button>
                  </div>

                  {options.length === 0 ? (
                    <div className="p-12 bg-gray-50/50 rounded-xl text-center border-2 border-dashed border-gray-200">
                      <UnorderedListOutlined className="text-5xl text-gray-300 mb-3" />
                      <div className="text-gray-500 mb-3 font-medium">Henüz seçenek eklenmedi</div>
                      <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddOption}>
                        İlk Seçeneği Ekle
                      </Button>
                    </div>
                  ) : (
                    <Table
                      columns={optionColumns}
                      dataSource={options}
                      rowKey="key"
                      pagination={false}
                      size="small"
                    />
                  )}
                </div>
              )}

              {/* Default Value */}
              <div>
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  Varsayılan Değer
                </Text>
                <Form.Item name="defaultValue" className="mb-0">
                  <Input placeholder="Yeni ürünlerde otomatik doldurulacak" variant="filled" />
                </Form.Item>
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
