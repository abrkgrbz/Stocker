'use client';

import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  DatePicker,
  Button,
  Table,
  Space,
  Empty,
} from 'antd';
import {
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { useProducts } from '@/lib/api/hooks/useInventory';
import type { BillOfMaterialDto, BomItemRequest, CreateBillOfMaterialRequest } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface BomFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: BillOfMaterialDto;
  onFinish: (values: CreateBillOfMaterialRequest) => void;
  loading?: boolean;
}

interface MaterialItem {
  key: string;
  materialId: string;
  materialName?: string;
  quantity: number;
  unitOfMeasure: string;
  scrapPercentage?: number;
  position: number;
  notes?: string;
}

export default function BomForm({ form, initialValues, onFinish, loading }: BomFormProps) {
  const { data: products = [], isLoading: productsLoading } = useProducts(false);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);

  // Initialize materials from existing BOM
  useEffect(() => {
    if (initialValues?.items) {
      setMaterials(
        initialValues.items.map((item, index) => ({
          key: item.id || `item-${index}`,
          materialId: item.materialId,
          materialName: item.materialName,
          quantity: item.quantity,
          unitOfMeasure: item.unitOfMeasure,
          scrapPercentage: item.scrapPercentage,
          position: item.position,
          notes: item.notes,
        }))
      );
      setSelectedProductId(initialValues.productId);
      form.setFieldsValue({
        productId: initialValues.productId,
        version: initialValues.version,
        description: initialValues.description,
        effectiveDate: dayjs(initialValues.effectiveDate),
        expiryDate: initialValues.expiryDate ? dayjs(initialValues.expiryDate) : undefined,
        isDefault: initialValues.isDefault,
      });
    }
  }, [initialValues, form]);

  // Add new material item
  const handleAddMaterial = () => {
    const newPosition = materials.length + 1;
    const newMaterial: MaterialItem = {
      key: `new-${Date.now()}`,
      materialId: '',
      quantity: 1,
      unitOfMeasure: 'adet',
      position: newPosition,
    };
    setMaterials([...materials, newMaterial]);
  };

  // Remove material item
  const handleRemoveMaterial = (key: string) => {
    const updatedMaterials = materials.filter(m => m.key !== key);
    // Reorder positions
    setMaterials(updatedMaterials.map((m, idx) => ({ ...m, position: idx + 1 })));
  };

  // Update material item
  const handleUpdateMaterial = (key: string, field: keyof MaterialItem, value: any) => {
    setMaterials(materials.map(m => {
      if (m.key === key) {
        const updated = { ...m, [field]: value };
        // If materialId changes, get the product name
        if (field === 'materialId') {
          const product = products.find(p => p.id.toString() === value);
          if (product) {
            updated.materialName = product.name;
            updated.unitOfMeasure = product.unitName || 'adet';
          }
        }
        return updated;
      }
      return m;
    }));
  };

  // Move material up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newMaterials = [...materials];
    [newMaterials[index - 1], newMaterials[index]] = [newMaterials[index], newMaterials[index - 1]];
    setMaterials(newMaterials.map((m, idx) => ({ ...m, position: idx + 1 })));
  };

  // Move material down
  const handleMoveDown = (index: number) => {
    if (index >= materials.length - 1) return;
    const newMaterials = [...materials];
    [newMaterials[index], newMaterials[index + 1]] = [newMaterials[index + 1], newMaterials[index]];
    setMaterials(newMaterials.map((m, idx) => ({ ...m, position: idx + 1 })));
  };

  // Handle form submission
  const handleFinish = (values: any) => {
    const bomData: CreateBillOfMaterialRequest = {
      productId: values.productId,
      version: values.version,
      description: values.description,
      effectiveDate: values.effectiveDate.format('YYYY-MM-DD'),
      expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
      isDefault: values.isDefault || false,
      items: materials.map(m => ({
        materialId: m.materialId,
        quantity: m.quantity,
        unitOfMeasure: m.unitOfMeasure,
        scrapPercentage: m.scrapPercentage,
        position: m.position,
        notes: m.notes,
      })),
    };
    onFinish(bomData);
  };

  // Filter out selected product from material list
  const availableMaterials = products.filter(p => p.id.toString() !== selectedProductId);

  // Material table columns
  const materialColumns: ColumnsType<MaterialItem> = [
    {
      title: 'Sıra',
      dataIndex: 'position',
      key: 'position',
      width: 80,
      render: (_, __, index) => (
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
            {index + 1}
          </span>
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => handleMoveUp(index)}
              disabled={index === 0}
              className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
            >
              <ArrowUpIcon className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handleMoveDown(index)}
              disabled={index === materials.length - 1}
              className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
            >
              <ArrowDownIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      ),
    },
    {
      title: 'Malzeme',
      key: 'material',
      width: 280,
      render: (_, record) => (
        <Select
          placeholder="Malzeme seçin"
          value={record.materialId || undefined}
          onChange={(v) => handleUpdateMaterial(record.key, 'materialId', v)}
          options={availableMaterials.map(p => ({
            value: p.id.toString(),
            label: `${p.name} (${p.code})`,
          }))}
          showSearch
          optionFilterProp="label"
          loading={productsLoading}
          className="w-full [&_.ant-select-selector]:!border-slate-300"
        />
      ),
    },
    {
      title: 'Miktar',
      key: 'quantity',
      width: 120,
      render: (_, record) => (
        <InputNumber
          value={record.quantity}
          onChange={(v) => handleUpdateMaterial(record.key, 'quantity', v || 1)}
          min={0.001}
          step={0.1}
          className="w-full [&.ant-input-number]:!border-slate-300"
        />
      ),
    },
    {
      title: 'Birim',
      key: 'unitOfMeasure',
      width: 100,
      render: (_, record) => (
        <Input
          value={record.unitOfMeasure}
          onChange={(e) => handleUpdateMaterial(record.key, 'unitOfMeasure', e.target.value)}
          className="!border-slate-300"
        />
      ),
    },
    {
      title: 'Fire %',
      key: 'scrapPercentage',
      width: 100,
      render: (_, record) => (
        <InputNumber
          value={record.scrapPercentage}
          onChange={(v) => handleUpdateMaterial(record.key, 'scrapPercentage', v)}
          min={0}
          max={100}
          className="w-full [&.ant-input-number]:!border-slate-300"
          placeholder="0"
        />
      ),
    },
    {
      title: 'Notlar',
      key: 'notes',
      render: (_, record) => (
        <Input
          value={record.notes}
          onChange={(e) => handleUpdateMaterial(record.key, 'notes', e.target.value)}
          className="!border-slate-300"
          placeholder="Opsiyonel"
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
          onClick={() => handleRemoveMaterial(record.key)}
        />
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        isDefault: false,
        effectiveDate: dayjs(),
      }}
    >
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">

        {/* Basic Information */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Temel Bilgiler</h3>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="productId"
                label={<span className="text-slate-700 font-medium">Ürün</span>}
                rules={[{ required: true, message: 'Lütfen ürün seçin' }]}
                className="col-span-2 lg:col-span-1"
              >
                <Select
                  placeholder="Ürün seçin"
                  options={products.map(p => ({
                    value: p.id.toString(),
                    label: `${p.name} (${p.code})`,
                  }))}
                  showSearch
                  optionFilterProp="label"
                  loading={productsLoading}
                  onChange={(v) => setSelectedProductId(v)}
                  disabled={!!initialValues}
                  className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
                />
              </Form.Item>
              <Form.Item
                name="version"
                label={<span className="text-slate-700 font-medium">Versiyon</span>}
                rules={[{ required: true, message: 'Lütfen versiyon girin' }]}
                className="col-span-2 lg:col-span-1"
              >
                <Input
                  placeholder="Örn: 1.0, A, v2.1"
                  className="!border-slate-300 !rounded-lg"
                />
              </Form.Item>
              <Form.Item
                name="description"
                label={<span className="text-slate-700 font-medium">Açıklama</span>}
                className="col-span-2"
              >
                <TextArea
                  rows={3}
                  placeholder="Reçete açıklaması (opsiyonel)"
                  className="!border-slate-300 !rounded-lg"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Validity & Settings */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Geçerlilik & Ayarlar</h3>
            <Form.Item
              name="effectiveDate"
              label={<span className="text-slate-700 font-medium">Geçerlilik Başlangıcı</span>}
              rules={[{ required: true, message: 'Lütfen tarih seçin' }]}
            >
              <DatePicker
                className="w-full !border-slate-300 !rounded-lg"
                format="DD.MM.YYYY"
                placeholder="Tarih seçin"
              />
            </Form.Item>
            <Form.Item
              name="expiryDate"
              label={<span className="text-slate-700 font-medium">Geçerlilik Bitişi</span>}
            >
              <DatePicker
                className="w-full !border-slate-300 !rounded-lg"
                format="DD.MM.YYYY"
                placeholder="Opsiyonel"
              />
            </Form.Item>
            <Form.Item
              name="isDefault"
              valuePropName="checked"
              className="mb-0"
            >
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700 font-medium">Varsayılan Reçete</span>
                <Switch size="small" />
              </div>
            </Form.Item>
          </div>
        </div>

        {/* Material Items */}
        <div className="col-span-12">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Malzeme Listesi</h3>
                <p className="text-xs text-slate-500 mt-1">Ürünün üretimi için gerekli malzemeleri ekleyin</p>
              </div>
              <Button
                type="primary"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={handleAddMaterial}
                className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              >
                Malzeme Ekle
              </Button>
            </div>

            {materials.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Henüz malzeme eklenmedi"
                className="py-8"
              >
                <Button
                  type="primary"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={handleAddMaterial}
                  className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
                >
                  İlk Malzemeyi Ekle
                </Button>
              </Empty>
            ) : (
              <Table
                columns={materialColumns}
                dataSource={materials}
                rowKey="key"
                pagination={false}
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
              />
            )}
          </div>
        </div>

      </div>
    </Form>
  );
}
