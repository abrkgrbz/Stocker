'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  InputNumber,
  Spin,
  Alert,
  Switch,
  Table,
  Tag,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
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

  const { data: attribute, isLoading, error } = useProductAttribute(attributeId);
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
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !attribute) {
    return (
      <div className="p-8">
        <Alert
          message="Özellik Bulunamadı"
          description="İstenen ürün özelliği bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/product-attributes')}>
              Özelliklere Dön
            </Button>
          }
        />
      </div>
    );
  }

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
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {attribute.name}
                  </h1>
                  <Tag
                    icon={attribute.isVisible ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    color={attribute.isVisible ? 'success' : 'default'}
                  >
                    {attribute.isVisible ? 'Görünür' : 'Gizli'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-400 m-0">{attribute.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/product-attributes')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updateAttribute.isPending}
              onClick={handleSubmit}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Temel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="code"
                    label="Özellik Kodu"
                    rules={[{ required: true, message: 'Kod gerekli' }]}
                  >
                    <Input placeholder="SIZE" disabled />
                  </Form.Item>
                  <Form.Item
                    name="name"
                    label="Özellik Adı"
                    rules={[{ required: true, message: 'Ad gerekli' }]}
                  >
                    <Input placeholder="Beden" />
                  </Form.Item>
                </div>

                <Form.Item name="description" label="Açıklama">
                  <TextArea rows={2} placeholder="Özellik açıklaması..." />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Form.Item name="groupName" label="Grup">
                    <Input placeholder="Fiziksel Özellikler" />
                  </Form.Item>
                </div>
              </div>

              {/* Options */}
              {hasOptions && (
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold text-gray-900 m-0">Seçenekler</h3>
                    <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddOption}>
                      Seçenek Ekle
                    </Button>
                  </div>
                  <Table
                    columns={optionColumns}
                    dataSource={options}
                    rowKey="key"
                    pagination={false}
                    size="small"
                    locale={{ emptyText: 'Henüz seçenek eklenmedi' }}
                  />
                </div>
              )}
            </div>

            {/* Right Column - Settings */}
            <div className="space-y-6">
              {/* Settings */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Ayarlar</h3>
                <div className="space-y-4">
                  <Form.Item name="isRequired" label="Zorunlu" valuePropName="checked" className="mb-2">
                    <Switch />
                  </Form.Item>
                  <Form.Item name="isFilterable" label="Filtrelenebilir" valuePropName="checked" className="mb-2">
                    <Switch />
                  </Form.Item>
                  <Form.Item name="isVisible" label="Görünür" valuePropName="checked" className="mb-2">
                    <Switch />
                  </Form.Item>
                  <Form.Item name="displayOrder" label="Sıralama" className="mb-0">
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </div>
              </div>

              {/* Number Constraints */}
              {attributeType === AttributeType.Number && (
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Sayısal Kısıtlamalar</h3>
                  <Form.Item name="minValue" label="Minimum Değer">
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item name="maxValue" label="Maximum Değer" className="mb-0">
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </div>
              )}

              {/* Text Constraints */}
              {attributeType === AttributeType.Text && (
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Metin Kısıtlamaları</h3>
                  <Form.Item name="validationPattern" label="Regex Deseni">
                    <Input placeholder="^[A-Z]+$" />
                  </Form.Item>
                  <Form.Item name="defaultValue" label="Varsayılan Değer" className="mb-0">
                    <Input placeholder="Varsayılan değer" />
                  </Form.Item>
                </div>
              )}
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
