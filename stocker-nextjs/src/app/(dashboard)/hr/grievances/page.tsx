'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Tag, Space, Input, Card } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useGrievances, useDeleteGrievance } from '@/lib/api/hooks/useHR';

interface Grievance {
  id: number;
  complainantId: number;
  complainantName?: string;
  grievanceType: string;
  status: string;
  priority: string;
  filedDate: string;
  subject: string;
}

const statusColors: Record<string, string> = { 'Open': 'processing', 'UnderReview': 'warning', 'Investigating': 'orange', 'PendingResolution': 'gold', 'Resolved': 'success', 'Closed': 'default', 'Escalated': 'red', 'Withdrawn': 'default' };
const priorityColors: Record<string, string> = { 'Low': 'default', 'Medium': 'blue', 'High': 'orange', 'Critical': 'red' };

export default function GrievancesPage() {
  const router = useRouter();
  const { data: grievances, isLoading } = useGrievances();
  const deleteGrievance = useDeleteGrievance();
  const [searchText, setSearchText] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!grievances) return [];
    if (!searchText) return grievances;
    const lower = searchText.toLowerCase();
    return grievances.filter((item: Grievance) => item.complainantName?.toLowerCase().includes(lower) || item.subject?.toLowerCase().includes(lower));
  }, [grievances, searchText]);

  const handleDelete = async (id: number) => { try { await deleteGrievance.mutateAsync(id); } catch (error) {} };

  const columns: ColumnsType<Grievance> = [
    { title: 'Sikayet Eden', dataIndex: 'complainantName', key: 'complainantName', sorter: (a, b) => (a.complainantName || '').localeCompare(b.complainantName || '') },
    { title: 'Konu', dataIndex: 'subject', key: 'subject' },
    { title: 'Tur', dataIndex: 'grievanceType', key: 'grievanceType' },
    { title: 'Durum', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={statusColors[status] || 'default'}>{status}</Tag> },
    { title: 'Oncelik', dataIndex: 'priority', key: 'priority', render: (priority: string) => <Tag color={priorityColors[priority] || 'default'}>{priority}</Tag> },
    { title: 'Basvuru Tarihi', dataIndex: 'filedDate', key: 'filedDate', render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-' },
    { title: 'Islemler', key: 'actions', render: (_, record) => (
      <Space>
        <Button type="text" icon={<EyeOutlined />} onClick={() => router.push(`/hr/grievances/${record.id}`)} />
        <Button type="text" icon={<EditOutlined />} onClick={() => router.push(`/hr/grievances/${record.id}/edit`)} />
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
      </Space>
    )},
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2"><ExclamationCircleOutlined /> Sikayetler</h1>
          <p className="text-gray-500 mt-1">Calisan sikayetlerini yonetin</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/grievances/new')} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Yeni Sikayet</Button>
      </div>
      <Card>
        <div className="mb-4"><Input placeholder="Ara..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} /></div>
        <Table columns={columns} dataSource={filteredData} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}
