'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Tag, Space, Input, Card, Progress } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, RocketOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useOnboardings, useDeleteOnboarding } from '@/lib/api/hooks/useHR';

interface Onboarding {
  id: number;
  employeeName?: string;
  startDate: string;
  status: string;
  completionPercentage?: number;
  mentorName?: string;
  departmentName?: string;
}

const statusColors: Record<string, string> = { 'NotStarted': 'default', 'InProgress': 'processing', 'Completed': 'success', 'OnHold': 'warning', 'Cancelled': 'error' };

export default function OnboardingsPage() {
  const router = useRouter();
  const { data: onboardings, isLoading } = useOnboardings();
  const deleteOnboarding = useDeleteOnboarding();
  const [searchText, setSearchText] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!onboardings) return [];
    if (!searchText) return onboardings;
    const lower = searchText.toLowerCase();
    return onboardings.filter((item: Onboarding) => item.employeeName?.toLowerCase().includes(lower) || item.departmentName?.toLowerCase().includes(lower));
  }, [onboardings, searchText]);

  const handleDelete = async (id: number) => { try { await deleteOnboarding.mutateAsync(id); } catch (error) {} };

  const columns: ColumnsType<Onboarding> = [
    { title: 'Calisan', dataIndex: 'employeeName', key: 'employeeName', sorter: (a, b) => (a.employeeName || '').localeCompare(b.employeeName || '') },
    { title: 'Departman', dataIndex: 'departmentName', key: 'departmentName' },
    { title: 'Mentor', dataIndex: 'mentorName', key: 'mentorName' },
    { title: 'Ilerleme', dataIndex: 'completionPercentage', key: 'completionPercentage', render: (val: number) => <Progress percent={val || 0} size="small" /> },
    { title: 'Durum', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={statusColors[status] || 'default'}>{status}</Tag> },
    { title: 'Baslangic', dataIndex: 'startDate', key: 'startDate', render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-' },
    { title: 'Islemler', key: 'actions', render: (_, record) => (
      <Space>
        <Button type="text" icon={<EyeOutlined />} onClick={() => router.push(`/hr/onboardings/${record.id}`)} />
        <Button type="text" icon={<EditOutlined />} onClick={() => router.push(`/hr/onboardings/${record.id}/edit`)} />
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
      </Space>
    )},
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2"><RocketOutlined /> Ise Alisim Surecleri</h1>
          <p className="text-gray-500 mt-1">Yeni calisan oryantasyonlarini yonetin</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/onboardings/new')} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Yeni Onboarding</Button>
      </div>
      <Card>
        <div className="mb-4"><Input placeholder="Ara..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} /></div>
        <Table columns={columns} dataSource={filteredData} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}
