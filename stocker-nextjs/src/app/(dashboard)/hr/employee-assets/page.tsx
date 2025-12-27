'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Tag, Space, Input, Card } from 'antd';
import {
  ComputerDesktopIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import { useEmployeeAssets, useDeleteEmployeeAsset } from '@/lib/api/hooks/useHR';

interface EmployeeAsset {
  id: number;
  employeeId: number;
  employeeName?: string;
  assetType: string;
  assetName: string;
  assetCode?: string;
  serialNumber?: string;
  status: string;
  assignmentDate: string;
  returnDate?: string;
}

const statusColors: Record<string, string> = {
  'Assigned': 'processing',
  'Available': 'success',
  'Returned': 'default',
  'UnderMaintenance': 'warning',
  'Lost': 'error',
  'Damaged': 'error',
  'Disposed': 'default',
};

const assetTypeColors: Record<string, string> = {
  'Laptop': 'blue',
  'Desktop': 'cyan',
  'Mobile': 'purple',
  'Tablet': 'magenta',
  'Monitor': 'geekblue',
  'Keyboard': 'default',
  'Mouse': 'default',
  'Headset': 'default',
  'Vehicle': 'orange',
  'AccessCard': 'green',
  'Uniform': 'lime',
  'Tools': 'volcano',
  'Other': 'default',
};

export default function EmployeeAssetsPage() {
  const router = useRouter();
  const { data: assets, isLoading } = useEmployeeAssets();
  const deleteAsset = useDeleteEmployeeAsset();
  const [searchText, setSearchText] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!assets) return [];
    if (!searchText) return assets;
    const lower = searchText.toLowerCase();
    return assets.filter((item: EmployeeAsset) =>
      item.employeeName?.toLowerCase().includes(lower) ||
      item.assetName?.toLowerCase().includes(lower) ||
      item.assetCode?.toLowerCase().includes(lower)
    );
  }, [assets, searchText]);

  const handleDelete = async (id: number) => {
    try {
      await deleteAsset.mutateAsync(id);
    } catch (error) {}
  };

  const columns: ColumnsType<EmployeeAsset> = [
    { title: 'Calisan', dataIndex: 'employeeName', key: 'employeeName', sorter: (a, b) => (a.employeeName || '').localeCompare(b.employeeName || '') },
    { title: 'Varlik Adi', dataIndex: 'assetName', key: 'assetName' },
    { title: 'Varlik Turu', dataIndex: 'assetType', key: 'assetType', render: (type: string) => <Tag color={assetTypeColors[type] || 'default'}>{type}</Tag> },
    { title: 'Kod', dataIndex: 'assetCode', key: 'assetCode' },
    { title: 'Seri No', dataIndex: 'serialNumber', key: 'serialNumber' },
    { title: 'Durum', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={statusColors[status] || 'default'}>{status}</Tag> },
    { title: 'Atama Tarihi', dataIndex: 'assignmentDate', key: 'assignmentDate', render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-' },
    {
      title: 'Islemler',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/employee-assets/${record.id}`)} />
          <Button type="text" icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/employee-assets/${record.id}/edit`)} />
          <Button type="text" danger icon={<TrashIcon className="w-4 h-4" />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2"><ComputerDesktopIcon className="w-4 h-4" /> Calisan Varliklari</h1>
          <p className="text-gray-500 mt-1">Calisanlara atanan varliklari yonetin</p>
        </div>
        <Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={() => router.push('/hr/employee-assets/new')} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Yeni Varlik Atama</Button>
      </div>
      <Card>
        <div className="mb-4"><Input placeholder="Ara..." prefix={<MagnifyingGlassIcon className="w-4 h-4" />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} /></div>
        <Table columns={columns} dataSource={filteredData} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}
