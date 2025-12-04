'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  InputNumber,
  Typography,
  Row,
  Col,
  message,
  Table,
  Switch,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  TagsOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useCreateProductAttribute } from '@/lib/api/hooks/useInventory';
import {
  AttributeType,
  type CreateProductAttributeDto,
  type CreateProductAttributeOptionDto,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;
const { TextArea } = Input;

interface AttributeOption extends CreateProductAttributeOptionDto {
  key: string;
}

const attributeTypes: { value: AttributeType; label: string; hasOptions: boolean }[] = [
  { value: AttributeType.Text, label: 'Metin', hasOptions: false },
  { value: AttributeType.Number, label: 'Sayı', hasOptions: false },
  { value: AttributeType.Boolean, label: 'Evet/Hayır', hasOptions: false },
  { value: AttributeType.Date, label: 'Tarih', hasOptions: false },
  { value: AttributeType.Select, label: 'Seçim', hasOptions: true },
  { value: AttributeType.MultiSelect, label: 'Çoklu Seçim', hasOptions: true },
  { value: AttributeType.Color, label: 'Renk', hasOptions: true },
  { value: AttributeType.Size, label: 'Beden', hasOptions: true },
];

export default function NewProductAttributePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [options, setOptions] = useState<AttributeOption[]>([]);
  const [attributeType, setAttributeType] = useState<AttributeType>(AttributeType.Text);

  const createAttribute = useCreateProductAttribute();

  const hasOptions = attributeTypes.find((t) => t.value === attributeType)?.hasOptions || false;

  const handleAddOption = () => {
    const newOption: AttributeOption = {
      key: `option-${Date.now()}`,
      value: '',
      displayOrder: options.length + 1,
      isDefault: options.length === 0,
    };
    setOptions([...options, newOption]);
  };

  const handleRemoveOption = (key: string) => {
    setOptions(options.filter((opt) => opt.key !== key));
  };

  const handleOptionChange = (key: string, field: keyof AttributeOption, value: unknown) => {
    setOptions(
      options.map((opt) => {
        if (opt.key === key) {
          if (field === 'isDefault' && value === true) {
            // Only one default option
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
        attributeType: values.attributeType,
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
      router.push('/inventory/product-attributes');
    } catch {
      // Validation error
    }
  };

  const optionColumns: ColumnsType<AttributeOption> = [
    {
      title: 'Değer',
      dataIndex: 'value',
      key: 'value',
      render: (_, record) => (
        <Input
          placeholder="Seçenek değeri"
          value={record.value}
          onChange={(e) => handleOptionChange(record.key, 'value', e.target.value)}
        />
      ),
    },
    {
      title: 'Renk Kodu',
      dataIndex: 'colorCode',
      key: 'colorCode',
      width: 150,
      render: (_, record) =>
        attributeType === 'Color' ? (
          <Input
            placeholder="#FFFFFF"
            value={record.colorCode}
            onChange={(e) => handleOptionChange(record.key, 'colorCode', e.target.value)}
            prefix={
              record.colorCode && (
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: record.colorCode }}
                />
              )
            }
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
    <div className="max-w-4xl mx-auto">
      {/* Sticky Header */}
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

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          attributeType: 'Text',
          isVisible: true,
          displayOrder: 0,
        }}
      >
        <Row gutter={24}>
          <Col xs={24} md={16}>
            <Card title="Özellik Bilgileri" className="mb-6">
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="code"
                    label="Özellik Kodu"
                    rules={[{ required: true, message: 'Kod gerekli' }]}
                  >
                    <Input placeholder="color" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={16}>
                  <Form.Item
                    name="name"
                    label="Özellik Adı"
                    rules={[{ required: true, message: 'Ad gerekli' }]}
                  >
                    <Input placeholder="Renk" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="Açıklama">
                <TextArea rows={2} placeholder="Özellik açıklaması..." />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="attributeType"
                    label="Özellik Tipi"
                    rules={[{ required: true, message: 'Tip seçin' }]}
                  >
                    <Select
                      options={attributeTypes.map((t) => ({ value: t.value, label: t.label }))}
                      onChange={(value) => {
                        setAttributeType(value);
                        if (!attributeTypes.find((t) => t.value === value)?.hasOptions) {
                          setOptions([]);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="groupName" label="Grup Adı">
                    <Input placeholder="Fiziksel Özellikler" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {hasOptions && (
              <Card
                title="Seçenekler"
                className="mb-6"
                extra={
                  <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddOption}>
                    Seçenek Ekle
                  </Button>
                }
              >
                <Table
                  columns={optionColumns}
                  dataSource={options}
                  rowKey="key"
                  pagination={false}
                  size="small"
                  locale={{ emptyText: 'Henüz seçenek eklenmedi' }}
                />
              </Card>
            )}

            {attributeType === 'Number' && (
              <Card title="Sayı Doğrulama" className="mb-6">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="minValue" label="Minimum Değer">
                      <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="maxValue" label="Maximum Değer">
                      <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            )}

            {attributeType === 'Text' && (
              <Card title="Metin Doğrulama" className="mb-6">
                <Form.Item
                  name="validationPattern"
                  label="Doğrulama Deseni (Regex)"
                  extra="Örn: ^[A-Za-z0-9]+$ (alfanumerik)"
                >
                  <Input placeholder="^[A-Za-z0-9]+$" />
                </Form.Item>
              </Card>
            )}
          </Col>

          <Col xs={24} md={8}>
            <Card title="Ayarlar" className="mb-6">
              <Form.Item name="isRequired" label="Zorunlu Alan" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="isFilterable" label="Filtrelenebilir" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="isVisible" label="Görünür" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Divider />

              <Form.Item name="displayOrder" label="Görüntüleme Sırası">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>

              <Form.Item name="defaultValue" label="Varsayılan Değer">
                <Input placeholder="Varsayılan değer" />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
