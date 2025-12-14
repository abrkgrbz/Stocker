'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Tag, Space, Input, Card, Progress } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CrownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useSuccessionPlans, useDeleteSuccessionPlan } from '@/lib/api/hooks/useHR';

interface SuccessionPlan {
  id: number;
  positionTitle?: string;
  departmentName?: string;
  currentIncumbentName?: string;
  status: string;
  priority: string;
  completionPercentage?: number;
  targetDate?: string;
}

const statusColors: Record<string, string> = { 'Draft': 'default', 'Active': 'processing', 'UnderReview': 'warning', 'Approved': 'success', 'Implemented': 'blue', 'Archived': 'default' };
const priorityColors: Record<string, string> = { 'Critical': 'red', 'High': 'orange', 'Medium': 'blue', 'Low': 'default' };

export default function SuccessionPlansPage() {
  const router = useRouter();
  const { data: plans, isLoading } = useSuccessionPlans();
  const deletePlan = useDeleteSuccessionPlan();
  const [searchText, setSearchText] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!plans) return [];
    if (!searchText) return plans;
    const lower = searchText.toLowerCase();
    return plans.filter((item: SuccessionPlan) => item.positionTitle?.toLowerCase().includes(lower) || item.currentIncumbentName?.toLowerCase().includes(lower));
  }, [plans, searchText]);

  const handleDelete = async (id: number) => { try { await deletePlan.mutateAsync(id); } catch (error) {} };

  const columns: ColumnsType<SuccessionPlan> = [
    { title: 'Pozisyon', dataIndex: 'positionTitle', key: 'positionTitle', sorter: (a, b) => (a.positionTitle || '').localeCompare(b.positionTitle || '') },
    { title: 'Departman', dataIndex: 'departmentName', key: 'departmentName' },
    { title: 'Mevcut Kisi', dataIndex: 'currentIncumbentName', key: 'currentIncumbentName' },
    { title: 'Tamamlanma', dataIndex: 'completionPercentage', key: 'completionPercentage', render: (val: number) => <Progress percent={val || 0} size="small" /> },
    { title: 'Oncelik', dataIndex: 'priority', key: 'priority', render: (p: string) => <Tag color={priorityColors[p] || 'default'}>{p}</Tag> },
    { title: 'Durum', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={statusColors[status] || 'default'}>{status}</Tag> },
    { title: 'Hedef Tarih', dataIndex: 'targetDate', key: 'targetDate', render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-' },
    { title: 'Islemler', key: 'actions', render: (_, record) => (
      <Space>
        <Button type="text" icon={<EyeOutlined />} onClick={() => router.push(`/hr/succession-plans/${record.id}`)} />
        <Button type="text" icon={<EditOutlined />} onClick={() => router.push(`/hr/succession-plans/${record.id}/edit`)} />
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
      </Space>
    )},
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2"><CrownOutlined /> Yedekleme Planlari</h1>
          <p className="text-gray-500 mt-1">Kritik pozisyonlar icin yedekleme planlarini yonetin</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/succession-plans/new')} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Yeni Plan</Button>
      </div>
      <Card>
        <div className="mb-4"><Input placeholder="Ara..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} /></div>
        <Table columns={columns} dataSource={filteredData} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}
