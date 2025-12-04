'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Spin,
  Empty,
  Switch,
  Table,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  TagsOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  useProductAttribute,
  useUpdateProductAttribute,
} from '@/lib/api/hooks/useInventory';
import {
  AttributeType,
  type UpdateProductAttributeDto,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;
const { TextArea } = Input;

interface AttributeOption {
  key: string;
  value: string;
  colorCode?: string;
  displayOrder: number;
  isDefault: boolean;
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

export default function EditProductAttributePage() {
  const router = useRouter();
  const params = useParams();
  const attributeId = Number(params.id);
  const [form] = Form.useForm();
  const [options, setOptions] = useState<AttributeOption[]>([]);
  const [attributeType, setAttributeType] = useState<AttributeType>(AttributeType.Text);

  const { data: attribute, isLoading } = useProductAttribute(attributeId);
  const updateAttribute = useUpdateProductAttribute();

  const hasOptions = attributeTypes.find((t) => t.value === attributeType)?.hasOptions || false;

  useEffect(() => {
    if (attribute) {
      form.setFieldsValue({
        name: attribute.name,
        code: attribute.code,
        description: attribute.description,
        attributeType: attribute.attributeType,
        groupName: attribute.groupName,
        isRequired: attribute.isRequired,
        isFilterable: attribute.isFilterable,
        isVisible: attribute.isVisible,
        displayOrder: attribute.displayOrder,
        defaultValue: attribute.defaultValue,
        validationPattern: attribute.validationPattern,
        minValue: attribute.minValue,
        maxValue: attribute.maxValue,
      });
      setAttributeType(attribute.attributeType);
      if (attribute.options) {
        setOptions(
          attribute.options.map((opt, index) => ({
            key: `option-${opt.id || index}`,
            value: opt.value,
            colorCode: opt.colorCode,
            displayOrder: opt.displayOrder,
            isDefault: opt.isDefault,
          }))
        );
      }
    }
  }, [attribute, form]);

  const handleAddOption = () => {
    const newOption: AttributeOption = {
      key: `option-${Date.now()}`,
      value: '',
      displayOrder: options.length + 1,
      isDefault: false,
    };
    setOptions([...options, newOption]);
  };

  const handleRemoveOption = (key: string) => {
    setOptions(options.filter((opt) => opt.key !== key));
  };

  const handleOptionChange = (key: string, field: keyof AttributeOption, value: unknown) => {
    setOptions(
      options.map((opt) => (opt.key === key ? { ...opt, [field]: value } : opt))
    );
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data: UpdateProductAttributeDto = {
        name: values.name,
        description: values.description,
        groupName: values.groupName,
        isRequired: values.isRequired || false,
        isFilterable: values.isFilterable || false,
        isVisible: values.isVisible ?? true,
        displayOrder: values.displayOrder || 0,
        defaultValue: values.defaultValue,
        validationPattern: values.validationPattern,
        minValue: values.minValue,
        maxValue: values.maxValue,
      };

      await updateAttribute.mutateAsync({ id: attributeId, data });
      router.push(`/inventory/product-attributes/${attributeId}`);
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
          value={record.value}
          onChange={(e) => handleOptionChange(record.key, 'value', e.target.value)}
          placeholder="Seçenek değeri"
        />
      ),
    },
    ...(attributeType === AttributeType.Color
      ? [
          {
            title: 'Renk Kodu',
            dataIndex: 'colorCode',
            key: 'colorCode',
            width: 150,
            render: (_: unknown, record: AttributeOption) => (
              <Input
                value={record.colorCode}
                onChange={(e) => handleOptionChange(record.key, 'colorCode', e.target.value)}
                placeholder="#FFFFFF"
                prefix={
                  record.colorCode && (
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: record.colorCode }}
                    />
                  )
                }
              />
            ),
          },
        ]
      : []),
    {
      title: 'Sıra',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 80,
      render: (_, record) => (
        <InputNumber
          value={record.displayOrder}
          onChange={(value) => handleOptionChange(record.key, 'displayOrder', value || 0)}
          min={0}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Varsayılan',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 80,
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!attribute) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Özellik bulunamadı" />
      </div>
    );
  }

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
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              >
                <TagsOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">Özellik Düzenle</h1>
                <p className="text-sm text-gray-500 m-0">{attribute.name}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.back()}>İptal</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={updateAttribute.isPending}
              style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Form */}
      <Form form={form} layout="vertical">
        <Row gutter={24}>
          <Col xs={24} md={16}>
            <Card title="Temel Bilgiler" className="mb-6">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="code"
                    label="Özellik Kodu"
                    rules={[{ required: true, message: 'Kod gerekli' }]}
                  >
                    <Input placeholder="SIZE" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="Özellik Adı"
                    rules={[{ required: true, message: 'Ad gerekli' }]}
                  >
                    <Input placeholder="Beden" />
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
                    label="Tip"
                    rules={[{ required: true, message: 'Tip seçin' }]}
                  >
                    <Select
                      options={attributeTypes.map((t) => ({ value: t.value, label: t.label }))}
                      onChange={(value) => setAttributeType(value)}
                      disabled
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="groupName" label="Grup">
                    <Input placeholder="Fiziksel Özellikler" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Options */}
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
          </Col>

          <Col xs={24} md={8}>
            <Card title="Ayarlar" className="mb-6">
              <Form.Item name="isRequired" label="Zorunlu" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="isFilterable" label="Filtrelenebilir" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="isVisible" label="Görünür" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="displayOrder" label="Sıralama">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Card>

            {attributeType === AttributeType.Number && (
              <Card title="Sayısal Kısıtlamalar" className="mb-6">
                <Form.Item name="minValue" label="Minimum Değer">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="maxValue" label="Maximum Değer">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </Card>
            )}

            {attributeType === AttributeType.Text && (
              <Card title="Metin Kısıtlamaları" className="mb-6">
                <Form.Item name="validationPattern" label="Regex Deseni">
                  <Input placeholder="^[A-Z]+$" />
                </Form.Item>
                <Form.Item name="defaultValue" label="Varsayılan Değer">
                  <Input placeholder="Varsayılan değer" />
                </Form.Item>
              </Card>
            )}
          </Col>
        </Row>
      </Form>
    </div>
  );
}
