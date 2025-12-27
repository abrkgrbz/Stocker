'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Tag, Space, Input, Card } from 'antd';
import {
  DocumentTextIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import { useJobApplications, useDeleteJobApplication } from '@/lib/api/hooks/useHR';

interface JobApplication {
  id: number;
  fullName: string;
  email?: string;
  jobTitle?: string;
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
    return applications.filter((item: JobApplication) => item.fullName?.toLowerCase().includes(lower) || item.jobTitle?.toLowerCase().includes(lower));
  }, [applications, searchText]);

  const handleDelete = async (id: number) => { try { await deleteApplication.mutateAsync(id); } catch (error) {} };

  const columns: ColumnsType<JobApplication> = [
    { title: 'Aday', dataIndex: 'fullName', key: 'fullName', sorter: (a, b) => (a.fullName || '').localeCompare(b.fullName || '') },
    { title: 'E-posta', dataIndex: 'email', key: 'email' },
    { title: 'Pozisyon', dataIndex: 'jobTitle', key: 'jobTitle' },
    { title: 'Durum', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={statusColors[status] || 'default'}>{status}</Tag> },
    { title: 'Kaynak', dataIndex: 'source', key: 'source' },
    { title: 'Basvuru Tarihi', dataIndex: 'applicationDate', key: 'applicationDate', render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-' },
    { title: 'Islemler', key: 'actions', render: (_, record) => (
      <Space>
        <Button type="text" icon={<EyeIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/job-applications/${record.id}`)} />
        <Button type="text" icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/job-applications/${record.id}/edit`)} />
        <Button type="text" danger icon={<TrashIcon className="w-4 h-4" />} onClick={() => handleDelete(record.id)} />
      </Space>
    )},
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2"><DocumentTextIcon className="w-4 h-4" /> Is Basvurulari</h1>
          <p className="text-gray-500 mt-1">Is basvurularini yonetin</p>
        </div>
        <Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={() => router.push('/hr/job-applications/new')} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Yeni Basvuru</Button>
      </div>
      <Card>
        <div className="mb-4"><Input placeholder="Ara..." prefix={<MagnifyingGlassIcon className="w-4 h-4" />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} /></div>
        <Table columns={columns} dataSource={filteredData} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}
