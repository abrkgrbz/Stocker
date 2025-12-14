'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Tag, Space, Progress, Input, Card } from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useCareerPaths, useDeleteCareerPath } from '@/lib/api/hooks/useHR';

interface CareerPath {
  id: number;
  employeeId: number;
  employeeName: string;
  currentPositionName: string;
  targetPositionName?: string;
  status: string;
  progressPercentage: number;
  startDate: string;
  expectedTargetDate?: string;
  mentorName?: string;
}

const statusColors: Record<string, string> = {
  'Draft': 'default',
  'Active': 'processing',
  'OnTrack': 'success',
  'AtRisk': 'warning',
  'Completed': 'success',
  'Cancelled': 'error',
  'OnHold': 'default',
};

export default function CareerPathsPage() {
  const router = useRouter();
  const { data: careerPaths, isLoading } = useCareerPaths();
  const deleteCareerPath = useDeleteCareerPath();
  const [searchText, setSearchText] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!careerPaths) return [];
    if (!searchText) return careerPaths;
    const lower = searchText.toLowerCase();
    return careerPaths.filter((item: CareerPath) =>
      item.employeeName?.toLowerCase().includes(lower) ||
      item.currentPositionName?.toLowerCase().includes(lower) ||
      item.targetPositionName?.toLowerCase().includes(lower)
    );
  }, [careerPaths, searchText]);

  const handleDelete = async (id: number) => {
    try {
      await deleteCareerPath.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const columns: ColumnsType<CareerPath> = [
    {
      title: 'Calisan',
      dataIndex: 'employeeName',
      key: 'employeeName',
      sorter: (a, b) => (a.employeeName || '').localeCompare(b.employeeName || ''),
    },
    {
      title: 'Mevcut Pozisyon',
      dataIndex: 'currentPositionName',
      key: 'currentPositionName',
    },
    {
      title: 'Hedef Pozisyon',
      dataIndex: 'targetPositionName',
      key: 'targetPositionName',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>{status}</Tag>
      ),
    },
    {
      title: 'Ilerleme',
      dataIndex: 'progressPercentage',
      key: 'progressPercentage',
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: 'Mentor',
      dataIndex: 'mentorName',
      key: 'mentorName',
    },
    {
      title: 'Baslangic',
      dataIndex: 'currentPositionStartDate',
      key: 'currentPositionStartDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-',
    },
    {
      title: 'Islemler',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/hr/career-paths/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => router.push(`/hr/career-paths/${record.id}/edit`)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <RocketOutlined /> Kariyer Planlari
          </h1>
          <p className="text-gray-500 mt-1">Calisan kariyer gelisim planlarini yonetin</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/hr/career-paths/new')}
          style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
        >
          Yeni Kariyer Plani
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Ara..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
