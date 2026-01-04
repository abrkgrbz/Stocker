'use client';

import React, { useState, useMemo } from 'react';
import { Table, Tag, Select, Modal, Form, Input, InputNumber, Button, Switch, Dropdown } from 'antd';
import {
  ArrowPathIcon,
  CubeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  usePackagingTypes,
  useCreatePackagingType,
  useUpdatePackagingType,
  useDeletePackagingType,
} from '@/lib/api/hooks/useInventory';
import type { PackagingTypeDto, CreatePackagingTypeDto, UpdatePackagingTypeDto, PackagingCategory } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import { PageContainer, ListPageHeader, Card } from '@/components/patterns';
import { confirmAction } from '@/lib/utils/sweetalert';

const categoryConfig: Record<number, { label: string; color: string }> = {
  1: { label: 'Kutu', color: 'blue' },
  2: { label: 'Karton', color: 'orange' },
  3: { label: 'Palet', color: 'purple' },
  4: { label: 'Kasa', color: 'cyan' },
  5: { label: 'Torba', color: 'green' },
  6: { label: 'Varil', color: 'volcano' },
  7: { label: 'Konteyner', color: 'geekblue' },
  8: { label: 'Şişe', color: 'lime' },
  9: { label: 'Kavanoz', color: 'gold' },
  10: { label: 'Tüp', color: 'magenta' },
  11: { label: 'Diğer', color: 'default' },
};

export default function PackagingTypesPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [searchText, setSearchText] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<PackagingTypeDto | null>(null);
  const [form] = Form.useForm();

  // API Hooks
  const { data: packagingTypes = [], isLoading, refetch } = usePackagingTypes();
  const createType = useCreatePackagingType();
  const updateType = useUpdatePackagingType();
  const deleteType = useDeletePackagingType();

  // Filter data
  const filteredData = useMemo(() => {
    let result = packagingTypes;

    if (selectedCategory) {
      result = result.filter(item => item.category === selectedCategory);
    }

    if (searchText) {
      const search = searchText.toLowerCase();
      result = result.filter(
        (item) =>
          item.code.toLowerCase().includes(search) ||
          item.name.toLowerCase().includes(search)
      );
    }

    return result;
  }, [packagingTypes, selectedCategory, searchText]);

  // Stats
  const stats = useMemo(() => {
    const total = packagingTypes.length;
    const active = packagingTypes.filter(p => p.isActive).length;
    const recyclable = packagingTypes.filter(p => p.isRecyclable).length;
    const returnable = packagingTypes.filter(p => p.isReturnable).length;
    return { total, active, recyclable, returnable };
  }, [packagingTypes]);

  // Handlers
  const handleCreate = () => {
    form.resetFields();
    setCreateModalOpen(true);
  };

  const handleEdit = (type: PackagingTypeDto) => {
    setSelectedType(type);
    form.setFieldsValue({
      code: type.code,
      name: type.name,
      description: type.description,
      category: type.category,
      length: type.length,
      width: type.width,
      height: type.height,
      emptyWeight: type.emptyWeight,
      maxWeightCapacity: type.maxWeightCapacity,
      defaultQuantity: type.defaultQuantity,
      maxQuantity: type.maxQuantity,
      stackableCount: type.stackableCount,
      isStackable: type.isStackable,
      unitsPerPallet: type.unitsPerPallet,
      materialType: type.materialType,
      isRecyclable: type.isRecyclable,
      isReturnable: type.isReturnable,
      depositAmount: type.depositAmount,
    });
    setEditModalOpen(true);
  };

  const handleDelete = async (type: PackagingTypeDto) => {
    const confirmed = await confirmAction(
      'Ambalaj Tipini Sil',
      `"${type.name}" ambalaj tipini silmek istediğinizden emin misiniz?`,
      'Sil'
    );

    if (confirmed) {
      try {
        await deleteType.mutateAsync(type.id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: CreatePackagingTypeDto = {
        code: values.code,
        name: values.name,
        description: values.description,
        category: values.category,
        length: values.length,
        width: values.width,
        height: values.height,
        emptyWeight: values.emptyWeight,
        maxWeightCapacity: values.maxWeightCapacity,
        defaultQuantity: values.defaultQuantity,
        maxQuantity: values.maxQuantity,
        stackableCount: values.stackableCount,
        isStackable: values.isStackable,
        unitsPerPallet: values.unitsPerPallet,
        materialType: values.materialType,
        isRecyclable: values.isRecyclable,
        isReturnable: values.isReturnable,
        depositAmount: values.depositAmount,
      };
      await createType.mutateAsync(data);
      setCreateModalOpen(false);
      form.resetFields();
    } catch (error) {
      // Validation error
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedType) return;
    try {
      const values = await form.validateFields();
      const data: UpdatePackagingTypeDto = {
        name: values.name,
        description: values.description,
        category: values.category,
        length: values.length,
        width: values.width,
        height: values.height,
        emptyWeight: values.emptyWeight,
        maxWeightCapacity: values.maxWeightCapacity,
        defaultQuantity: values.defaultQuantity,
        maxQuantity: values.maxQuantity,
        stackableCount: values.stackableCount,
        isStackable: values.isStackable,
        unitsPerPallet: values.unitsPerPallet,
        materialType: values.materialType,
        isRecyclable: values.isRecyclable,
        isReturnable: values.isReturnable,
        depositAmount: values.depositAmount,
      };
      await updateType.mutateAsync({ id: selectedType.id, dto: data });
      setEditModalOpen(false);
      setSelectedType(null);
      form.resetFields();
    } catch (error) {
      // Validation error
    }
  };

  // Table columns
  const columns: ColumnsType<PackagingTypeDto> = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text: string) => <span className="font-mono font-semibold text-slate-900">{text}</span>,
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (text: string) => <span className="font-medium text-slate-900">{text}</span>,
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: PackagingCategory) => {
        const config = categoryConfig[category] || { label: 'Bilinmiyor', color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Boyutlar (cm)',
      key: 'dimensions',
      width: 150,
      render: (_, record) => {
        if (!record.length && !record.width && !record.height) return '-';
        return (
          <span className="text-slate-600">
            {record.length || '-'} x {record.width || '-'} x {record.height || '-'}
          </span>
        );
      },
    },
    {
      title: 'Ağırlık (kg)',
      key: 'weight',
      width: 120,
      render: (_, record) => (
        <div>
          {record.emptyWeight !== undefined && (
            <div className="text-xs text-slate-500">Boş: {record.emptyWeight}</div>
          )}
          {record.maxWeightCapacity !== undefined && (
            <div className="text-xs text-slate-600">Max: {record.maxWeightCapacity}</div>
          )}
          {record.emptyWeight === undefined && record.maxWeightCapacity === undefined && '-'}
        </div>
      ),
    },
    {
      title: 'Kapasite',
      key: 'capacity',
      width: 100,
      render: (_, record) => (
        <div>
          {record.defaultQuantity && (
            <div className="text-slate-900">{record.defaultQuantity} adet</div>
          )}
          {record.maxQuantity && (
            <div className="text-xs text-slate-500">Max: {record.maxQuantity}</div>
          )}
          {!record.defaultQuantity && !record.maxQuantity && '-'}
        </div>
      ),
    },
    {
      title: 'Özellikler',
      key: 'features',
      width: 150,
      render: (_, record) => (
        <div className="flex flex-wrap gap-1">
          {record.isStackable && <Tag color="blue">İstiflenebilir</Tag>}
          {record.isRecyclable && <Tag color="green">Geri Dönüşüm</Tag>}
          {record.isReturnable && <Tag color="orange">İade Edilebilir</Tag>}
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Düzenle',
                onClick: () => handleEdit(record),
              },
              {
                key: 'delete',
                icon: <TrashIcon className="w-4 h-4" />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDelete(record),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} />
        </Dropdown>
      ),
    },
  ];

  // Form content
  const formContent = (
    <Form form={form} layout="vertical" className="mt-4">
      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          name="code"
          label="Kod"
          rules={[{ required: true, message: 'Kod gerekli' }]}
        >
          <Input placeholder="PKG-001" />
        </Form.Item>
        <Form.Item
          name="name"
          label="Ad"
          rules={[{ required: true, message: 'Ad gerekli' }]}
        >
          <Input placeholder="Standart Kutu" />
        </Form.Item>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          name="category"
          label="Kategori"
          rules={[{ required: true, message: 'Kategori gerekli' }]}
        >
          <Select placeholder="Seçin">
            {Object.entries(categoryConfig).map(([key, config]) => (
              <Select.Option key={key} value={parseInt(key)}>
                {config.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="materialType" label="Materyal">
          <Input placeholder="Karton, Plastik, Ahşap..." />
        </Form.Item>
      </div>
      <Form.Item name="description" label="Açıklama">
        <Input.TextArea rows={2} placeholder="Ambalaj tipi hakkında notlar..." />
      </Form.Item>

      <div className="text-sm font-medium text-slate-700 mb-2">Boyutlar (cm)</div>
      <div className="grid grid-cols-3 gap-4">
        <Form.Item name="length" label="Uzunluk">
          <InputNumber min={0} style={{ width: '100%' }} placeholder="30" />
        </Form.Item>
        <Form.Item name="width" label="Genişlik">
          <InputNumber min={0} style={{ width: '100%' }} placeholder="20" />
        </Form.Item>
        <Form.Item name="height" label="Yükseklik">
          <InputNumber min={0} style={{ width: '100%' }} placeholder="15" />
        </Form.Item>
      </div>

      <div className="text-sm font-medium text-slate-700 mb-2">Ağırlık (kg)</div>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="emptyWeight" label="Boş Ağırlık">
          <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="0.5" />
        </Form.Item>
        <Form.Item name="maxWeightCapacity" label="Max Taşıma Kapasitesi">
          <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="25" />
        </Form.Item>
      </div>

      <div className="text-sm font-medium text-slate-700 mb-2">Kapasite</div>
      <div className="grid grid-cols-3 gap-4">
        <Form.Item name="defaultQuantity" label="Varsayılan Miktar">
          <InputNumber min={1} style={{ width: '100%' }} placeholder="12" />
        </Form.Item>
        <Form.Item name="maxQuantity" label="Max Miktar">
          <InputNumber min={1} style={{ width: '100%' }} placeholder="24" />
        </Form.Item>
        <Form.Item name="unitsPerPallet" label="Palet Başına">
          <InputNumber min={1} style={{ width: '100%' }} placeholder="48" />
        </Form.Item>
      </div>

      <div className="text-sm font-medium text-slate-700 mb-2">İstifleme</div>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="isStackable" label="İstiflenebilir" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="stackableCount" label="İstif Sayısı">
          <InputNumber min={1} style={{ width: '100%' }} placeholder="4" />
        </Form.Item>
      </div>

      <div className="text-sm font-medium text-slate-700 mb-2">Geri Dönüşüm</div>
      <div className="grid grid-cols-3 gap-4">
        <Form.Item name="isRecyclable" label="Geri Dönüştürülebilir" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="isReturnable" label="İade Edilebilir" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="depositAmount" label="Depozito">
          <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="5.00" />
        </Form.Item>
      </div>
    </Form>
  );

  return (
    <PageContainer>
      <ListPageHeader
        icon={<CubeIcon className="w-5 h-5" />}
        iconColor="#10b981"
        title="Ambalaj Tipleri"
        description="Ürün ambalaj tiplerini tanımlayın ve yönetin"
        itemCount={stats.total}
        primaryAction={{
          label: 'Yeni Ambalaj Tipi',
          onClick: handleCreate,
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs text-slate-500">Toplam Ambalaj Tipi</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-xs text-slate-500">Aktif</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.recyclable}</div>
          <div className="text-xs text-slate-500">Geri Dönüştürülebilir</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.returnable}</div>
          <div className="text-xs text-slate-500">İade Edilebilir</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 p-4">
          <Input
            placeholder="Kod veya ad ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="w-64"
          />
          <Select
            placeholder="Kategoriye göre filtrele"
            allowClear
            style={{ width: 200 }}
            value={selectedCategory}
            onChange={setSelectedCategory}
          >
            {Object.entries(categoryConfig).map(([key, config]) => (
              <Select.Option key={key} value={parseInt(key)}>
                {config.label}
              </Select.Option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: filteredData.length,
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Yeni Ambalaj Tipi"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreateSubmit}
        okText="Oluştur"
        cancelText="İptal"
        confirmLoading={createType.isPending}
        width={700}
      >
        {formContent}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Ambalaj Tipi Düzenle"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setSelectedType(null);
          form.resetFields();
        }}
        onOk={handleEditSubmit}
        okText="Kaydet"
        cancelText="İptal"
        confirmLoading={updateType.isPending}
        width={700}
      >
        {formContent}
      </Modal>
    </PageContainer>
  );
}
