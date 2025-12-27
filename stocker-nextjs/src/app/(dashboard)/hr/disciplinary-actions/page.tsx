'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Tag, Space, Input, Card } from 'antd';
import {
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import { useDisciplinaryActions, useDeleteDisciplinaryAction } from '@/lib/api/hooks/useHR';

interface DisciplinaryAction {
  id: number;
  employeeId: number;
  employeeName?: string;
  actionType: string;
  severityLevel: string;
  status: string;
  incidentDate: string;
  sanctionStartDate?: string;
  incidentDescription?: string;
}

const statusColors: Record<string, string> = {
  'Draft': 'default',
  'UnderInvestigation': 'processing',
  'PendingReview': 'warning',
  'Approved': 'success',
  'Implemented': 'success',
  'Appealed': 'orange',
  'Overturned': 'error',
  'Closed': 'default',
};

const severityColors: Record<string, string> = {
  'Minor': 'blue',
  'Moderate': 'orange',
  'Major': 'red',
  'Critical': 'magenta',
};

export default function DisciplinaryActionsPage() {
  const router = useRouter();
  const { data: actions, isLoading } = useDisciplinaryActions();
  const deleteAction = useDeleteDisciplinaryAction();
  const [searchText, setSearchText] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!actions) return [];
    if (!searchText) return actions;
    const lower = searchText.toLowerCase();
    return actions.filter((item: DisciplinaryAction) =>
      item.employeeName?.toLowerCase().includes(lower) ||
      item.actionType?.toLowerCase().includes(lower)
    );
  }, [actions, searchText]);

  const handleDelete = async (id: number) => {
    try {
      await deleteAction.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const columns: ColumnsType<DisciplinaryAction> = [
    {
      title: 'Calisan',
      dataIndex: 'employeeName',
      key: 'employeeName',
      sorter: (a, b) => (a.employeeName || '').localeCompare(b.employeeName || ''),
    },
    {
      title: 'Islem Turu',
      dataIndex: 'actionType',
      key: 'actionType',
    },
    {
      title: 'Siddet',
      dataIndex: 'severityLevel',
      key: 'severityLevel',
      render: (severityLevel: string) => (
        <Tag color={severityColors[severityLevel] || 'default'}>{severityLevel}</Tag>
      ),
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
      title: 'Olay Tarihi',
      dataIndex: 'incidentDate',
      key: 'incidentDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-',
    },
    {
      title: 'Islemler',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeIcon className="w-4 h-4" />}
            onClick={() => router.push(`/hr/disciplinary-actions/${record.id}`)}
          />
          <Button
            type="text"
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={() => router.push(`/hr/disciplinary-actions/${record.id}/edit`)}
          />
          <Button
            type="text"
            danger
            icon={<TrashIcon className="w-4 h-4" />}
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
            <ExclamationTriangleIcon className="w-4 h-4" /> Disiplin Islemleri
          </h1>
          <p className="text-gray-500 mt-1">Calisan disiplin islemlerini yonetin</p>
        </div>
        <Button
          type="primary"
          icon={<PlusIcon className="w-4 h-4" />}
          onClick={() => router.push('/hr/disciplinary-actions/new')}
          style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
        >
          Yeni Disiplin Islemi
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4" />}
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
