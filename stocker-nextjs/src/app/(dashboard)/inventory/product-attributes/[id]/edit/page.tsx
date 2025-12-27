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
  ArrowLeftIcon,
  CheckIcon,
  Cog6ToothIcon,
  HashtagIcon,
  LanguageIcon,
  ListBulletIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  useProductAttribute,
  useUpdateProductAttribute,
} from '@/lib/api/hooks/useInventory';
import {
  AttributeType,
  type UpdateProductAttributeDto,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import { showSuccess } from '@/lib/utils/sweetalert';

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
      showSuccess('Başarılı', 'Özellik güncellendi');
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
          variant="filled"
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
                variant="filled"
                prefix={
                  record.colorCode && (
                    <div
                      className="w-4 h-4 rounded border border-slate-300"
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
          variant="filled"
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
          icon={<TrashIcon className="w-4 h-4" />}
          onClick={() => handleRemoveOption(record.key)}
        />
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
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
    <div className="min-h-screen bg-slate-50">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#8b5cf615' }}
              >
                <TagIcon className="w-4 h-4 text-violet-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-slate-800 m-0">
                    {attribute.name}
                  </h1>
                  <Tag color={attribute.isActive ? 'green' : 'default'}>
                    {attribute.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">Kod: {attribute.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/product-attributes')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateAttribute.isPending}
              onClick={handleSubmit}
              style={{ background: '#0f172a', borderColor: '#0f172a' }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TagIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Temel Bilgiler
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Özellik Kodu</div>
                    <Form.Item
                      name="code"
                      rules={[{ required: true, message: 'Kod gerekli' }]}
                      className="mb-0"
                    >
                      <Input placeholder="SIZE" disabled variant="filled" />
                    </Form.Item>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Özellik Adı *</div>
                    <Form.Item
                      name="name"
                      rules={[{ required: true, message: 'Ad gerekli' }]}
                      className="mb-0"
                    >
                      <Input placeholder="Beden" variant="filled" />
                    </Form.Item>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-slate-500 mb-1">Açıklama</div>
                  <Form.Item name="description" className="mb-0">
                    <TextArea rows={2} placeholder="Özellik açıklaması..." variant="filled" />
                  </Form.Item>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Tip</div>
                    <Form.Item
                      name="attributeType"
                      rules={[{ required: true, message: 'Tip seçin' }]}
                      className="mb-0"
                    >
                      <Select
                        options={attributeTypes.map((t) => ({ value: t.value, label: t.label }))}
                        onChange={(value) => setAttributeType(value)}
                        disabled
                      />
                    </Form.Item>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Grup</div>
                    <Form.Item name="groupName" className="mb-0">
                      <Input placeholder="Fiziksel Özellikler" variant="filled" />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Options */}
              {hasOptions && (
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <ListBulletIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Seçenekler
                        {options.length > 0 && (
                          <span className="ml-2 text-slate-400">({options.length})</span>
                        )}
                      </span>
                    </div>
                    <Button
                      type="text"
                      size="small"
                      icon={<PlusIcon className="w-4 h-4" />}
                      onClick={handleAddOption}
                      className="text-violet-600"
                    >
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
                <div className="flex items-center gap-2 mb-4">
                  <Cog6ToothIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Ayarlar
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div>
                      <div className="text-sm font-medium text-slate-700">Zorunlu</div>
                      <div className="text-xs text-slate-500">Doldurulmak zorunda</div>
                    </div>
                    <Form.Item name="isRequired" valuePropName="checked" className="mb-0">
                      <Switch size="small" />
                    </Form.Item>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div>
                      <div className="text-sm font-medium text-slate-700">Filtrelenebilir</div>
                      <div className="text-xs text-slate-500">Ürün listesinde filtre</div>
                    </div>
                    <Form.Item name="isFilterable" valuePropName="checked" className="mb-0">
                      <Switch size="small" />
                    </Form.Item>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <div>
                      <div className="text-sm font-medium text-slate-700">Görünür</div>
                      <div className="text-xs text-slate-500">Müşterilere gösterilir</div>
                    </div>
                    <Form.Item name="isVisible" valuePropName="checked" className="mb-0">
                      <Switch size="small" />
                    </Form.Item>
                  </div>
                  <div className="pt-2">
                    <div className="text-xs text-slate-500 mb-1">Görüntüleme Sırası</div>
                    <Form.Item name="displayOrder" className="mb-0">
                      <InputNumber style={{ width: '100%' }} min={0} variant="filled" />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Number Constraints */}
              {attributeType === AttributeType.Number && (
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <HashtagIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Sayısal Kısıtlamalar
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Minimum Değer</div>
                      <Form.Item name="minValue" className="mb-0">
                        <InputNumber style={{ width: '100%' }} variant="filled" />
                      </Form.Item>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Maximum Değer</div>
                      <Form.Item name="maxValue" className="mb-0">
                        <InputNumber style={{ width: '100%' }} variant="filled" />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              )}

              {/* Text Constraints */}
              {attributeType === AttributeType.Text && (
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <LanguageIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Metin Kısıtlamaları
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Regex Deseni</div>
                      <Form.Item name="validationPattern" className="mb-0">
                        <Input placeholder="^[A-Z]+$" variant="filled" />
                      </Form.Item>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Varsayılan Değer</div>
                      <Form.Item name="defaultValue" className="mb-0">
                        <Input placeholder="Varsayılan değer" variant="filled" />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
