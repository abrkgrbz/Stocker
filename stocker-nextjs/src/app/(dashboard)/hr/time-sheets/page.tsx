'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Tag, Space, Input, Card } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTimeSheets, useDeleteTimeSheet } from '@/lib/api/hooks/useHR';

interface TimeSheet {
  id: number;
  employeeName?: string;
  periodStart: string;
  periodEnd: string;
  totalRegularHours?: number;
  totalOvertimeHours?: number;
  status: string;
}

const statusColors: Record<string, string> = { 'Draft': 'default', 'Submitted': 'processing', 'Approved': 'success', 'Rejected': 'error', 'Paid': 'blue' };

export default function TimeSheetsPage() {
  const router = useRouter();
  const { data: timeSheets, isLoading } = useTimeSheets();
  const deleteTimeSheet = useDeleteTimeSheet();
  const [searchText, setSearchText] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!timeSheets) return [];
    if (!searchText) return timeSheets;
    const lower = searchText.toLowerCase();
    return timeSheets.filter((item: TimeSheet) => item.employeeName?.toLowerCase().includes(lower));
  }, [timeSheets, searchText]);

  const handleDelete = async (id: number) => { try { await deleteTimeSheet.mutateAsync(id); } catch (error) {} };

  const columns: ColumnsType<TimeSheet> = [
    { title: 'Calisan', dataIndex: 'employeeName', key: 'employeeName', sorter: (a, b) => (a.employeeName || '').localeCompare(b.employeeName || '') },
    { title: 'Donem Baslangic', dataIndex: 'periodStart', key: 'periodStart', render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-' },
    { title: 'Donem Bitis', dataIndex: 'periodEnd', key: 'periodEnd', render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-' },
    { title: 'Normal Saat', dataIndex: 'totalRegularHours', key: 'totalRegularHours', render: (val: number) => val ? `${val} saat` : '-', align: 'right' },
    { title: 'Fazla Mesai', dataIndex: 'totalOvertimeHours', key: 'totalOvertimeHours', render: (val: number) => val ? `${val} saat` : '-', align: 'right' },
    { title: 'Durum', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={statusColors[status] || 'default'}>{status}</Tag> },
    { title: 'Islemler', key: 'actions', render: (_, record) => (
      <Space>
        <Button type="text" icon={<EyeOutlined />} onClick={() => router.push(`/hr/time-sheets/${record.id}`)} />
        <Button type="text" icon={<EditOutlined />} onClick={() => router.push(`/hr/time-sheets/${record.id}/edit`)} />
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
      </Space>
    )},
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2"><ClockCircleOutlined /> Puantaj</h1>
          <p className="text-gray-500 mt-1">Calisan calisma saatlerini yonetin</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/time-sheets/new')} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Yeni Puantaj</Button>
      </div>
      <Card>
        <div className="mb-4"><Input placeholder="Calisan ara..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} /></div>
        <Table columns={columns} dataSource={filteredData} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}
