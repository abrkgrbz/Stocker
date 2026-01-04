'use client';

import React, { useState, useMemo } from 'react';
import { Table, Tag, Select, Modal, Form, Input, InputNumber, Button, Space, Dropdown } from 'antd';
import {
  ArrowPathIcon,
  HomeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import {
  useWarehouseZones,
  useWarehouses,
  useCreateWarehouseZone,
  useUpdateWarehouseZone,
  useDeleteWarehouseZone,
} from '@/lib/api/hooks/useInventory';
import type { WarehouseZoneDto, CreateWarehouseZoneDto, UpdateWarehouseZoneDto } from '@/lib/api/services/inventory.types';
import { ZoneType } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import { PageContainer, ListPageHeader, Card } from '@/components/patterns';
import { showError, confirmAction } from '@/lib/utils/sweetalert';

export default function WarehouseZonesPage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<WarehouseZoneDto | null>(null);
  const [form] = Form.useForm();

  // API Hooks
  const { data: warehouses = [] } = useWarehouses();
  const { data: zones = [], isLoading, refetch } = useWarehouseZones(selectedWarehouse);
  const createZone = useCreateWarehouseZone();
  const updateZone = useUpdateWarehouseZone();
  const deleteZone = useDeleteWarehouseZone();

  // Handlers
  const handleCreate = () => {
    form.resetFields();
    setCreateModalOpen(true);
  };

  const handleEdit = (zone: WarehouseZoneDto) => {
    setSelectedZone(zone);
    form.setFieldsValue({
      warehouseId: zone.warehouseId,
      code: zone.code,
      name: zone.name,
      description: zone.description,
      zoneType: zone.zoneType,
      totalArea: zone.totalArea,
      minTemperature: zone.minTemperature,
      maxTemperature: zone.maxTemperature,
      minHumidity: zone.minHumidity,
      maxHumidity: zone.maxHumidity,
    });
    setEditModalOpen(true);
  };

  const handleDelete = async (zone: WarehouseZoneDto) => {
    const confirmed = await confirmAction(
      'Bölgeyi Sil',
      `"${zone.name}" bölgesini silmek istediğinizden emin misiniz?`,
      'Sil'
    );

    if (confirmed) {
      try {
        await deleteZone.mutateAsync(zone.id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: CreateWarehouseZoneDto = {
        warehouseId: values.warehouseId,
        code: values.code,
        name: values.name,
        description: values.description,
        zoneType: values.zoneType || ZoneType.General,
        totalArea: values.totalArea,
        minTemperature: values.minTemperature,
        maxTemperature: values.maxTemperature,
        minHumidity: values.minHumidity,
        maxHumidity: values.maxHumidity,
      };
      await createZone.mutateAsync(data);
      setCreateModalOpen(false);
      form.resetFields();
    } catch (error) {
      // Validation error
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedZone) return;
    try {
      const values = await form.validateFields();
      const data: UpdateWarehouseZoneDto = {
        name: values.name,
        description: values.description,
        zoneType: values.zoneType || ZoneType.General,
        minTemperature: values.minTemperature,
        maxTemperature: values.maxTemperature,
        minHumidity: values.minHumidity,
        maxHumidity: values.maxHumidity,
      };
      await updateZone.mutateAsync({ id: selectedZone.id, dto: data });
      setEditModalOpen(false);
      setSelectedZone(null);
      form.resetFields();
    } catch (error) {
      // Validation error
    }
  };

  // Table columns
  const columns: ColumnsType<WarehouseZoneDto> = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text: string) => <span className="font-mono font-semibold text-slate-900">{text}</span>,
    },
    {
      title: 'Bölge Adı',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string) => <span className="font-medium text-slate-900">{text}</span>,
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
      render: (text: string) => (
        <Tag icon={<HomeIcon className="w-3 h-3" />} color="blue">
          {text}
        </Tag>
      ),
    },
    {
      title: 'Kapasite',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 120,
      render: (value: number | undefined) =>
        value !== undefined ? `${value.toLocaleString('tr-TR')} birim` : '-',
    },
    {
      title: 'Sıcaklık',
      dataIndex: 'temperature',
      key: 'temperature',
      width: 100,
      render: (value: number | undefined) =>
        value !== undefined ? `${value}°C` : '-',
    },
    {
      title: 'Nem',
      dataIndex: 'humidity',
      key: 'humidity',
      width: 100,
      render: (value: number | undefined) =>
        value !== undefined ? `%${value}` : '-',
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => <span className="text-slate-500">{text || '-'}</span>,
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

  // Form content (shared between create and edit)
  const formContent = (
    <Form form={form} layout="vertical" className="mt-4">
      <Form.Item
        name="warehouseId"
        label="Depo"
        rules={[{ required: true, message: 'Depo seçimi gerekli' }]}
      >
        <Select placeholder="Depo seçin" showSearch optionFilterProp="children">
          {warehouses.map((w) => (
            <Select.Option key={w.id} value={w.id}>
              {w.code} - {w.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          name="code"
          label="Bölge Kodu"
          rules={[{ required: true, message: 'Bölge kodu gerekli' }]}
        >
          <Input placeholder="ZONE-A1" />
        </Form.Item>
        <Form.Item
          name="name"
          label="Bölge Adı"
          rules={[{ required: true, message: 'Bölge adı gerekli' }]}
        >
          <Input placeholder="A Bloğu Zemin Kat" />
        </Form.Item>
      </div>
      <Form.Item name="description" label="Açıklama">
        <Input.TextArea rows={2} placeholder="Bölge hakkında açıklama..." />
      </Form.Item>
      <div className="grid grid-cols-3 gap-4">
        <Form.Item name="capacity" label="Kapasite (birim)">
          <InputNumber min={0} style={{ width: '100%' }} placeholder="1000" />
        </Form.Item>
        <Form.Item name="temperature" label="Sıcaklık (°C)">
          <InputNumber min={-50} max={100} style={{ width: '100%' }} placeholder="20" />
        </Form.Item>
        <Form.Item name="humidity" label="Nem (%)">
          <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="50" />
        </Form.Item>
      </div>
    </Form>
  );

  return (
    <PageContainer>
      <ListPageHeader
        icon={<MapPinIcon className="w-5 h-5" />}
        iconColor="#10b981"
        title="Depo Bölgeleri"
        description="Depolarınızdaki bölgeleri tanımlayın ve yönetin"
        itemCount={zones.length}
        primaryAction={{
          label: 'Yeni Bölge',
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

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 p-4">
          <Select
            placeholder="Depoya göre filtrele"
            allowClear
            style={{ width: 250 }}
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
            showSearch
            optionFilterProp="children"
          >
            {warehouses.map((w) => (
              <Select.Option key={w.id} value={w.id}>
                {w.code} - {w.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={zones}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: zones.length,
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Yeni Depo Bölgesi"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreateSubmit}
        okText="Oluştur"
        cancelText="İptal"
        confirmLoading={createZone.isPending}
        width={600}
      >
        {formContent}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Depo Bölgesi Düzenle"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setSelectedZone(null);
          form.resetFields();
        }}
        onOk={handleEditSubmit}
        okText="Kaydet"
        cancelText="İptal"
        confirmLoading={updateZone.isPending}
        width={600}
      >
        {formContent}
      </Modal>
    </PageContainer>
  );
}
