'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Tag, Space, Input, Card } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useInterviews, useDeleteInterview } from '@/lib/api/hooks/useHR';

interface Interview {
  id: number;
  jobApplicationId: number;
  candidateName?: string;
  interviewerName?: string;
  interviewType: string;
  status: string;
  scheduledDateTime: string;
  overallRating?: number;
}

const statusColors: Record<string, string> = { 'Scheduled': 'processing', 'Confirmed': 'cyan', 'InProgress': 'blue', 'Completed': 'success', 'Cancelled': 'error', 'NoShow': 'default', 'Rescheduled': 'warning' };

export default function InterviewsPage() {
  const router = useRouter();
  const { data: interviews, isLoading } = useInterviews();
  const deleteInterview = useDeleteInterview();
  const [searchText, setSearchText] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!interviews) return [];
    if (!searchText) return interviews;
    const lower = searchText.toLowerCase();
    return interviews.filter((item: Interview) => item.candidateName?.toLowerCase().includes(lower) || item.interviewerName?.toLowerCase().includes(lower));
  }, [interviews, searchText]);

  const handleDelete = async (id: number) => { try { await deleteInterview.mutateAsync(id); } catch (error) {} };

  const columns: ColumnsType<Interview> = [
    { title: 'Aday', dataIndex: 'candidateName', key: 'candidateName', sorter: (a, b) => (a.candidateName || '').localeCompare(b.candidateName || '') },
    { title: 'Gorusmeci', dataIndex: 'interviewerName', key: 'interviewerName' },
    { title: 'Tur', dataIndex: 'interviewType', key: 'interviewType' },
    { title: 'Durum', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={statusColors[status] || 'default'}>{status}</Tag> },
    { title: 'Tarih', dataIndex: 'scheduledDateTime', key: 'scheduledDateTime', render: (date: string) => date ? new Date(date).toLocaleString('tr-TR') : '-' },
    { title: 'Puan', dataIndex: 'overallRating', key: 'overallRating', render: (rating: number) => rating ? `${rating}/10` : '-' },
    { title: 'Islemler', key: 'actions', render: (_, record) => (
      <Space>
        <Button type="text" icon={<EyeOutlined />} onClick={() => router.push(`/hr/interviews/${record.id}`)} />
        <Button type="text" icon={<EditOutlined />} onClick={() => router.push(`/hr/interviews/${record.id}/edit`)} />
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
      </Space>
    )},
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2"><TeamOutlined /> Mulakatlar</h1>
          <p className="text-gray-500 mt-1">Is gorusmelerini yonetin</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/interviews/new')} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Yeni Mulakat</Button>
      </div>
      <Card>
        <div className="mb-4"><Input placeholder="Ara..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} /></div>
        <Table columns={columns} dataSource={filteredData} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}
