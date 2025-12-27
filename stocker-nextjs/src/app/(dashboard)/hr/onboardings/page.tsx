'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Tag, Space, Input, Card, Progress } from 'antd';
import {
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  RocketLaunchIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import { useOnboardings, useDeleteOnboarding } from '@/lib/api/hooks/useHR';

interface Onboarding {
  id: number;
  employeeName?: string;
  startDate: string;
  status: string;
  completionPercentage?: number;
  buddyName?: string;
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
    return onboardings.filter((item: Onboarding) => item.employeeName?.toLowerCase().includes(lower) || item.buddyName?.toLowerCase().includes(lower));
  }, [onboardings, searchText]);

  const handleDelete = async (id: number) => { try { await deleteOnboarding.mutateAsync(id); } catch (error) {} };

  const columns: ColumnsType<Onboarding> = [
    { title: 'Calisan', dataIndex: 'employeeName', key: 'employeeName', sorter: (a, b) => (a.employeeName || '').localeCompare(b.employeeName || '') },
    { title: 'Buddy', dataIndex: 'buddyName', key: 'buddyName' },
    { title: 'Ilerleme', dataIndex: 'completionPercentage', key: 'completionPercentage', render: (val: number) => <Progress percent={val || 0} size="small" /> },
    { title: 'Durum', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={statusColors[status] || 'default'}>{status}</Tag> },
    { title: 'Baslangic', dataIndex: 'startDate', key: 'startDate', render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-' },
    { title: 'Islemler', key: 'actions', render: (_, record) => (
      <Space>
        <Button type="text" icon={<EyeIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/onboardings/${record.id}`)} />
        <Button type="text" icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/onboardings/${record.id}/edit`)} />
        <Button type="text" danger icon={<TrashIcon className="w-4 h-4" />} onClick={() => handleDelete(record.id)} />
      </Space>
    )},
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2"><RocketLaunchIcon className="w-4 h-4" /> Ise Alisim Surecleri</h1>
          <p className="text-gray-500 mt-1">Yeni calisan oryantasyonlarini yonetin</p>
        </div>
        <Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={() => router.push('/hr/onboardings/new')} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Yeni Onboarding</Button>
      </div>
      <Card>
        <div className="mb-4"><Input placeholder="Ara..." prefix={<MagnifyingGlassIcon className="w-4 h-4" />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} /></div>
        <Table columns={columns} dataSource={filteredData} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}
