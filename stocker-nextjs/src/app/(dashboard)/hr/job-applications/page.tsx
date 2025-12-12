'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Tag, Space, Input, Card } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useJobApplications, useDeleteJobApplication } from '@/lib/api/hooks/useHR';

interface JobApplication {
  id: number;
  candidateName: string;
  candidateEmail?: string;
  positionTitle?: string;
  status: string;
  applicationDate: string;
  source?: string;
}

const statusColors: Record<string, string> = { 'New': 'default', 'Screening': 'processing', 'Interview': 'blue', 'Assessment': 'cyan', 'Reference': 'gold', 'Offer': 'orange', 'Hired': 'success', 'Rejected': 'error', 'Withdrawn': 'default', 'OnHold': 'warning' };

export default function JobApplicationsPage() {
  const router = useRouter();
  const { data: applications, isLoading } = useJobApplications();
  const deleteApplication = useDeleteJobApplication();
  const [searchText, setSearchText] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!applications) return [];
    if (!searchText) return applications;
    const lower = searchText.toLowerCase();
    return applications.filter((item: JobApplication) => item.candidateName?.toLowerCase().includes(lower) || item.positionTitle?.toLowerCase().includes(lower));
  }, [applications, searchText]);

  const handleDelete = async (id: number) => { try { await deleteApplication.mutateAsync(id); } catch (error) {} };

  const columns: ColumnsType<JobApplication> = [
    { title: 'Aday', dataIndex: 'candidateName', key: 'candidateName', sorter: (a, b) => (a.candidateName || '').localeCompare(b.candidateName || '') },
    { title: 'E-posta', dataIndex: 'candidateEmail', key: 'candidateEmail' },
    { title: 'Pozisyon', dataIndex: 'positionTitle', key: 'positionTitle' },
    { title: 'Durum', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={statusColors[status] || 'default'}>{status}</Tag> },
    { title: 'Kaynak', dataIndex: 'source', key: 'source' },
    { title: 'Basvuru Tarihi', dataIndex: 'applicationDate', key: 'applicationDate', render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-' },
    { title: 'Islemler', key: 'actions', render: (_, record) => (
      <Space>
        <Button type="text" icon={<EyeOutlined />} onClick={() => router.push(`/hr/job-applications/${record.id}`)} />
        <Button type="text" icon={<EditOutlined />} onClick={() => router.push(`/hr/job-applications/${record.id}/edit`)} />
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
      </Space>
    )},
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2"><FileTextOutlined /> Is Basvurulari</h1>
          <p className="text-gray-500 mt-1">Is basvurularini yonetin</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/job-applications/new')} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Yeni Basvuru</Button>
      </div>
      <Card>
        <div className="mb-4"><Input placeholder="Ara..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} /></div>
        <Table columns={columns} dataSource={filteredData} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}
