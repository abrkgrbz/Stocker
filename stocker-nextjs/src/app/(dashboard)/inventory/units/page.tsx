'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Input,
  Typography,
  Popconfirm,
  message,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ColumnWidthOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useUnits, useDeleteUnit } from '@/lib/api/hooks/useInventory';
import type { UnitDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

export default function UnitsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const { data: units = [], isLoading, refetch } = useUnits();
  const deleteUnit = useDeleteUnit();

  const handleDelete = async (id: number) => {
    try {
      await deleteUnit.mutateAsync(id);
      message.success('Birim silindi');
    } catch (error) {
      message.error('Silme islemi basarisiz');
    }
  };

  const filteredUnits = units.filter((unit) =>
    unit.name.toLowerCase().includes(searchText.toLowerCase()) ||
    unit.code.toLowerCase().includes(searchText.toLowerCase()) ||
    unit.symbol?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<UnitDto> = [
    {
      title: 'Birim',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: '#10b98115' }}
          >
            <ColumnWidthOutlined style={{ fontSize: 18, color: '#10b981' }} />
          </div>
          <div>
            <div className="font-medium text-gray-900">{name}</div>
            <div className="text-xs text-gray-400">
              Kod: {record.code}
              {record.symbol && ` • Sembol: ${record.symbol}`}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Temel Birim',
      dataIndex: 'baseUnitName',
      key: 'baseUnitName',
      render: (baseUnitName: string, record) => (
        baseUnitName ? (
          <div className="flex items-center gap-2">
            <LinkOutlined className="text-gray-400" />
            <div>
              <div className="text-sm text-gray-700">{baseUnitName}</div>
              <div className="text-xs text-gray-400">
                1 {record.name} = {record.conversionFactor} {baseUnitName}
              </div>
            </div>
          </div>
        ) : (
          <Tooltip title="Bu bir temel birimdir">
            <Tag color="blue">Temel Birim</Tag>
          </Tooltip>
        )
      ),
    },
    {
      title: 'Donusum Faktoru',
      dataIndex: 'conversionFactor',
      key: 'conversionFactor',
      align: 'center',
      render: (factor: number) => (
        <Text className="font-mono">{factor}</Text>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => router.push(`/inventory/units/${record.id}/edit`)}
          />
          <Popconfirm
            title="Birimi silmek istediginize emin misiniz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Evet"
            cancelText="Hayir"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">Birimler</Title>
          <Text type="secondary">Urun olcu birimlerini yonetin</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/inventory/units/new')}
            style={{ background: '#10b981', borderColor: '#10b981' }}
          >
            Yeni Birim
          </Button>
        </Space>
      </div>

      {/* Search */}
      <Card className="mb-4">
        <Input
          placeholder="Birim ara..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 300 }}
          allowClear
        />
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUnits}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} birim`,
          }}
        />
      </Card>
    </div>
  );
}
