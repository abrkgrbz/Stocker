'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
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
  Steps,
  Alert,
  ColorPicker,
  Tooltip,
  Tag,
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
  InfoCircleOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  EyeOutlined,
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

interface AttributeOption extends CreateProductAttributeOptionDto {
  key: string;
}

interface AttributeTypeConfig {
  value: AttributeType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  hasOptions: boolean;
}

const attributeTypeConfigs: AttributeTypeConfig[] = [
  {
    value: AttributeType.Text,
    label: 'Metin',
    description: 'Serbest metin girişi',
    icon: <FontSizeOutlined />,
    color: '#3b82f6',
    hasOptions: false
  },
  {
    value: AttributeType.Number,
    label: 'Sayı',
    description: 'Sayısal değerler',
    icon: <NumberOutlined />,
    color: '#10b981',
    hasOptions: false
  },
  {
    value: AttributeType.Boolean,
    label: 'Evet/Hayır',
    description: 'İkili seçim',
    icon: <CheckSquareOutlined />,
    color: '#f59e0b',
    hasOptions: false
  },
  {
    value: AttributeType.Date,
    label: 'Tarih',
    description: 'Tarih seçimi',
    icon: <CalendarOutlined />,
    color: '#ef4444',
    hasOptions: false
  },
  {
    value: AttributeType.Select,
    label: 'Seçim',
    description: 'Tekli seçim listesi',
    icon: <UnorderedListOutlined />,
    color: '#8b5cf6',
    hasOptions: true
  },
  {
    value: AttributeType.MultiSelect,
    label: 'Çoklu Seçim',
    description: 'Birden fazla seçim',
    icon: <AppstoreOutlined />,
    color: '#ec4899',
    hasOptions: true
  },
  {
    value: AttributeType.Color,
    label: 'Renk',
    description: 'Renk paleti',
    icon: <BgColorsOutlined />,
    color: '#06b6d4',
    hasOptions: true
  },
  {
    value: AttributeType.Size,
    label: 'Beden',
    description: 'Beden ölçüleri',
    icon: <ExpandOutlined />,
    color: '#84cc16',
    hasOptions: true
  },
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
  { value: 'Turuncu', colorCode: '#F97316' },
  { value: 'Mor', colorCode: '#A855F7' },
  { value: 'Pembe', colorCode: '#EC4899' },
  { value: 'Gri', colorCode: '#6B7280' },
  { value: 'Lacivert', colorCode: '#1E3A8A' },
  { value: 'Kahverengi', colorCode: '#92400E' },
];

export default function NewProductAttributePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [options, setOptions] = useState<AttributeOption[]>([]);
  const [attributeType, setAttributeType] = useState<AttributeType>(AttributeType.Text);

  const createAttribute = useCreateProductAttribute();

  const currentTypeConfig = useMemo(() =>
    attributeTypeConfigs.find((t) => t.value === attributeType),
    [attributeType]
  );

  const hasOptions = currentTypeConfig?.hasOptions || false;

  // Calculate current step
  const currentStep = useMemo(() => {
    const values = form.getFieldsValue();
    if (hasOptions && options.length > 0) return 2;
    if (values.name && values.code) return 1;
    return 0;
  }, [form, hasOptions, options.length]);

  const handleAddOption = () => {
    const newOption: AttributeOption = {
      key: `option-${Date.now()}`,
      value: '',
      displayOrder: options.length + 1,
      isDefault: options.length === 0,
    };
    setOptions([...options, newOption]);
  };

  const handleAddPresetOptions = (presets: { value: string; colorCode?: string }[]) => {
    const existingValues = options.map(o => o.value.toLowerCase());
    const newOptions = presets
      .filter(p => !existingValues.includes(p.value.toLowerCase()))
      .map((preset, index) => ({
        key: `option-${Date.now()}-${index}`,
        value: preset.value,
        colorCode: preset.colorCode,
        displayOrder: options.length + index + 1,
        isDefault: options.length === 0 && index === 0,
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
          if (field === 'isDefault' && value === true) {
            return { ...opt, isDefault: true };
          }
          return { ...opt, [field]: value };
        }
        if (field === 'isDefault' && value === true) {
          return { ...opt, isDefault: false };
        }
        return opt;
      })
    );
  };

  const handleTypeSelect = (type: AttributeType) => {
    setAttributeType(type);
    form.setFieldValue('attributeType', type);
    if (!attributeTypeConfigs.find((t) => t.value === type)?.hasOptions) {
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
        isRequired: values.isRequired || false,
        isFilterable: values.isFilterable || false,
        isVisible: values.isVisible !== false,
        displayOrder: values.displayOrder || 0,
        groupName: values.groupName,
        validationPattern: values.validationPattern,
        minValue: values.minValue,
        maxValue: values.maxValue,
        defaultValue: values.defaultValue,
        options: hasOptions
          ? options.map((opt, index) => ({
              value: opt.value,
              displayOrder: index + 1,
              colorCode: opt.colorCode,
              imageUrl: opt.imageUrl,
              isDefault: opt.isDefault,
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
      render: (_, __, index) => (
        <span className="text-gray-400 font-medium">{index + 1}</span>
      ),
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
          style={{ borderRadius: 8 }}
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
            onChange={(color: Color) => handleOptionChange(record.key, 'colorCode', color.toHexString())}
            showText
            size="small"
          />
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Varsayılan',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Switch
          size="small"
          checked={record.isDefault}
          onChange={(checked) => handleOptionChange(record.key, 'isDefault', checked)}
        />
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
    <div className="max-w-5xl mx-auto">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-10 -mx-6 px-6 py-4 mb-6"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          marginTop: '-24px',
          paddingTop: '24px',
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
              >
                <TagsOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Ürün Özelliği</h1>
                <p className="text-sm text-gray-500 m-0">Varyant veya filtreleme özelliği oluşturun</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.back()}>İptal</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={createAttribute.isPending}
              style={{ background: '#8b5cf6', borderColor: '#8b5cf6' }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="mb-6" styles={{ body: { padding: '16px 24px' } }}>
        <Steps
          current={currentStep}
          size="small"
          items={[
            { title: 'Temel Bilgiler', description: 'Ad ve tip' },
            { title: 'Yapılandırma', description: 'Ayarlar' },
            { title: 'Seçenekler', description: hasOptions ? 'Değerler' : 'Opsiyonel' },
          ]}
        />
      </Card>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          attributeType: AttributeType.Text,
          isVisible: true,
          displayOrder: 0,
        }}
      >
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            {/* Basic Info Card */}
            <Card
              className="mb-6"
              styles={{ header: { borderBottom: 'none', paddingBottom: 0 } }}
              title={
                <div className="flex items-center gap-2">
                  <InfoCircleOutlined style={{ color: '#8b5cf6' }} />
                  <span>Temel Bilgiler</span>
                </div>
              }
            >
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="code"
                    label="Özellik Kodu"
                    rules={[{ required: true, message: 'Kod gerekli' }]}
                    extra="Benzersiz tanımlayıcı (örn: color)"
                  >
                    <Input placeholder="color" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={16}>
                  <Form.Item
                    name="name"
                    label="Özellik Adı"
                    rules={[{ required: true, message: 'Ad gerekli' }]}
                  >
                    <Input placeholder="Renk" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="Açıklama">
                <TextArea
                  rows={2}
                  placeholder="Özellik açıklaması..."
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="groupName" label="Grup Adı">
                    <Input placeholder="Fiziksel Özellikler" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="displayOrder" label="Görüntüleme Sırası">
                    <InputNumber
                      style={{ width: '100%', borderRadius: 8 }}
                      min={0}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Attribute Type Selection */}
            <Card
              className="mb-6"
              styles={{ header: { borderBottom: 'none', paddingBottom: 0 } }}
              title={
                <div className="flex items-center gap-2">
                  <AppstoreOutlined style={{ color: '#8b5cf6' }} />
                  <span>Özellik Tipi</span>
                </div>
              }
            >
              <Form.Item name="attributeType" hidden>
                <Input />
              </Form.Item>

              <Alert
                message="Tip seçimine göre form alanları değişecektir"
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                className="mb-4"
                style={{ borderRadius: 8 }}
              />

              <Row gutter={[12, 12]}>
                {attributeTypeConfigs.map((config) => (
                  <Col xs={12} sm={6} key={config.value}>
                    <div
                      onClick={() => handleTypeSelect(config.value)}
                      className="cursor-pointer transition-all duration-200"
                      style={{
                        padding: '16px 12px',
                        borderRadius: 12,
                        border: attributeType === config.value
                          ? `2px solid ${config.color}`
                          : '2px solid #f0f0f0',
                        background: attributeType === config.value
                          ? `${config.color}08`
                          : '#fafafa',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
                        style={{
                          background: attributeType === config.value
                            ? config.color
                            : `${config.color}20`,
                          color: attributeType === config.value ? 'white' : config.color,
                          fontSize: 20,
                        }}
                      >
                        {config.icon}
                      </div>
                      <div className="font-medium text-gray-800 text-sm">{config.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{config.description}</div>
                      {config.hasOptions && (
                        <Tag color="purple" className="mt-2" style={{ fontSize: 10 }}>
                          Seçenekli
                        </Tag>
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>

            {/* Options Section */}
            {hasOptions && (
              <Card
                className="mb-6"
                styles={{ header: { borderBottom: 'none', paddingBottom: 0 } }}
                title={
                  <div className="flex items-center gap-2">
                    <UnorderedListOutlined style={{ color: '#8b5cf6' }} />
                    <span>Seçenekler</span>
                    {options.length > 0 && (
                      <Tag color="purple">{options.length} seçenek</Tag>
                    )}
                  </div>
                }
                extra={
                  <Button
                    type="primary"
                    ghost
                    icon={<PlusOutlined />}
                    onClick={handleAddOption}
                    style={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}
                  >
                    Seçenek Ekle
                  </Button>
                }
              >
                {/* Quick Add Presets */}
                {attributeType === AttributeType.Size && (
                  <div className="mb-4 p-4 rounded-lg" style={{ background: '#f5f3ff' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <ExpandOutlined style={{ color: '#8b5cf6' }} />
                      <Text strong style={{ color: '#5b21b6' }}>Hızlı Ekle - Standart Bedenler</Text>
                    </div>
                    <Space wrap>
                      {sizePresets.map((size) => (
                        <Tooltip key={size} title={`${size} ekle`}>
                          <Button
                            size="small"
                            onClick={() => handleAddPresetOptions([{ value: size }])}
                            disabled={options.some(o => o.value.toLowerCase() === size.toLowerCase())}
                          >
                            {size}
                          </Button>
                        </Tooltip>
                      ))}
                      <Button
                        type="dashed"
                        size="small"
                        onClick={() => handleAddPresetOptions(sizePresets.map(s => ({ value: s })))}
                      >
                        Tümünü Ekle
                      </Button>
                    </Space>
                  </div>
                )}

                {attributeType === AttributeType.Color && (
                  <div className="mb-4 p-4 rounded-lg" style={{ background: '#ecfeff' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <BgColorsOutlined style={{ color: '#06b6d4' }} />
                      <Text strong style={{ color: '#0e7490' }}>Hızlı Ekle - Temel Renkler</Text>
                    </div>
                    <Space wrap>
                      {colorPresets.map((color) => (
                        <Tooltip key={color.value} title={`${color.value} ekle`}>
                          <Button
                            size="small"
                            onClick={() => handleAddPresetOptions([color])}
                            disabled={options.some(o => o.value.toLowerCase() === color.value.toLowerCase())}
                            icon={
                              <div
                                className="w-3 h-3 rounded-full border border-gray-300"
                                style={{ backgroundColor: color.colorCode }}
                              />
                            }
                          >
                            {color.value}
                          </Button>
                        </Tooltip>
                      ))}
                    </Space>
                  </div>
                )}

                {options.length === 0 ? (
                  <div
                    className="text-center py-12 rounded-xl"
                    style={{ background: 'linear-gradient(180deg, #faf5ff 0%, #f5f3ff 100%)' }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: '#8b5cf620' }}
                    >
                      <UnorderedListOutlined style={{ fontSize: 28, color: '#8b5cf6' }} />
                    </div>
                    <Text type="secondary" className="block mb-2">
                      Henüz seçenek eklenmedi
                    </Text>
                    <Text type="secondary" className="block text-sm">
                      Yukarıdaki &quot;Seçenek Ekle&quot; butonunu kullanın
                    </Text>
                  </div>
                ) : (
                  <Table
                    columns={optionColumns}
                    dataSource={options}
                    rowKey="key"
                    pagination={false}
                    size="middle"
                  />
                )}
              </Card>
            )}

            {/* Number Validation */}
            {attributeType === AttributeType.Number && (
              <Card
                className="mb-6"
                styles={{ header: { borderBottom: 'none', paddingBottom: 0 } }}
                title={
                  <div className="flex items-center gap-2">
                    <NumberOutlined style={{ color: '#10b981' }} />
                    <span>Sayı Doğrulama</span>
                  </div>
                }
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="minValue" label="Minimum Değer">
                      <InputNumber style={{ width: '100%', borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="maxValue" label="Maximum Değer">
                      <InputNumber style={{ width: '100%', borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            )}

            {/* Text Validation */}
            {attributeType === AttributeType.Text && (
              <Card
                className="mb-6"
                styles={{ header: { borderBottom: 'none', paddingBottom: 0 } }}
                title={
                  <div className="flex items-center gap-2">
                    <FontSizeOutlined style={{ color: '#3b82f6' }} />
                    <span>Metin Doğrulama</span>
                  </div>
                }
              >
                <Form.Item
                  name="validationPattern"
                  label="Doğrulama Deseni (Regex)"
                  extra="Örn: ^[A-Za-z0-9]+$ (alfanumerik)"
                >
                  <Input
                    placeholder="^[A-Za-z0-9]+$"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Card>
            )}
          </Col>

          <Col xs={24} lg={8}>
            {/* Settings Card */}
            <Card
              className="mb-6"
              styles={{ header: { borderBottom: 'none', paddingBottom: 0 } }}
              title={
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined style={{ color: '#8b5cf6' }} />
                  <span>Ayarlar</span>
                </div>
              }
            >
              <div
                className="p-4 rounded-xl mb-4"
                style={{ background: '#fef2f2' }}
              >
                <Form.Item
                  name="isRequired"
                  valuePropName="checked"
                  className="mb-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: '#fee2e2' }}
                      >
                        <CheckCircleOutlined style={{ color: '#dc2626', fontSize: 18 }} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">Zorunlu Alan</div>
                        <div className="text-xs text-gray-500">Bu özellik doldurulmak zorunda</div>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </Form.Item>
              </div>

              <div
                className="p-4 rounded-xl mb-4"
                style={{ background: '#eff6ff' }}
              >
                <Form.Item
                  name="isFilterable"
                  valuePropName="checked"
                  className="mb-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: '#dbeafe' }}
                      >
                        <FilterOutlined style={{ color: '#2563eb', fontSize: 18 }} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">Filtrelenebilir</div>
                        <div className="text-xs text-gray-500">Ürün listesinde filtreleme</div>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </Form.Item>
              </div>

              <div
                className="p-4 rounded-xl"
                style={{ background: '#f0fdf4' }}
              >
                <Form.Item
                  name="isVisible"
                  valuePropName="checked"
                  className="mb-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: '#dcfce7' }}
                      >
                        <EyeOutlined style={{ color: '#16a34a', fontSize: 18 }} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">Görünür</div>
                        <div className="text-xs text-gray-500">Müşterilere gösterilecek</div>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </Form.Item>
              </div>
            </Card>

            {/* Default Value Card */}
            <Card
              className="mb-6"
              styles={{ header: { borderBottom: 'none', paddingBottom: 0 } }}
              title={
                <div className="flex items-center gap-2">
                  <TagsOutlined style={{ color: '#8b5cf6' }} />
                  <span>Varsayılan Değer</span>
                </div>
              }
            >
              <Form.Item name="defaultValue" className="mb-0">
                <Input
                  placeholder="Varsayılan değer"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
              <Text type="secondary" className="text-xs mt-2 block">
                Yeni ürünlerde otomatik doldurulacak
              </Text>
            </Card>

            {/* Selected Type Preview */}
            {currentTypeConfig && (
              <Card
                styles={{
                  header: { borderBottom: 'none', paddingBottom: 0 },
                  body: { background: `${currentTypeConfig.color}08` }
                }}
                title={
                  <div className="flex items-center gap-2">
                    <div style={{ color: currentTypeConfig.color }}>{currentTypeConfig.icon}</div>
                    <span>Seçili Tip</span>
                  </div>
                }
              >
                <div className="text-center">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: currentTypeConfig.color, color: 'white', fontSize: 28 }}
                  >
                    {currentTypeConfig.icon}
                  </div>
                  <div className="font-semibold text-lg text-gray-800">{currentTypeConfig.label}</div>
                  <div className="text-gray-500 text-sm">{currentTypeConfig.description}</div>
                  {currentTypeConfig.hasOptions && (
                    <Tag color="purple" className="mt-3">
                      Seçenek tanımı gerekli
                    </Tag>
                  )}
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </Form>
    </div>
  );
}
