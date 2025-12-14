'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Tag, Space, Input, Card } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, GiftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useEmployeeBenefits, useDeleteEmployeeBenefit } from '@/lib/api/hooks/useHR';

interface EmployeeBenefit {
  id: number;
  employeeId: number;
  employeeName?: string;
  benefitType: string;
  benefitName: string;
  status: string;
  startDate: string;
  endDate?: string;
  amount?: number;
  currency?: string;
}

const statusColors: Record<string, string> = {
  'Active': 'success',
  'Pending': 'processing',
  'Expired': 'default',
  'Cancelled': 'error',
  'Suspended': 'warning',
};

const benefitTypeColors: Record<string, string> = {
  'HealthInsurance': 'red',
  'LifeInsurance': 'magenta',
  'DentalInsurance': 'pink',
  'VisionInsurance': 'purple',
  'RetirementPlan': 'blue',
  'MealCard': 'orange',
  'TransportAllowance': 'cyan',
  'CompanyCar': 'geekblue',
  'FuelCard': 'lime',
  'GymMembership': 'green',
  'EducationSupport': 'gold',
  'ChildcareSupport': 'volcano',
  'HousingAllowance': 'blue',
  'PhoneAllowance': 'purple',
  'Other': 'default',
};

export default function EmployeeBenefitsPage() {
  const router = useRouter();
  const { data: benefits, isLoading } = useEmployeeBenefits();
  const deleteBenefit = useDeleteEmployeeBenefit();
  const [searchText, setSearchText] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!benefits) return [];
    if (!searchText) return benefits;
    const lower = searchText.toLowerCase();
    return benefits.filter((item: EmployeeBenefit) =>
      item.employeeName?.toLowerCase().includes(lower) ||
      item.benefitName?.toLowerCase().includes(lower)
    );
  }, [benefits, searchText]);

  const handleDelete = async (id: number) => {
    try { await deleteBenefit.mutateAsync(id); } catch (error) {}
  };

  const columns: ColumnsType<EmployeeBenefit> = [
    { title: 'Calisan', dataIndex: 'employeeName', key: 'employeeName', sorter: (a, b) => (a.employeeName || '').localeCompare(b.employeeName || '') },
    { title: 'Yan Hakki', dataIndex: 'benefitName', key: 'benefitName' },
    { title: 'Tur', dataIndex: 'benefitType', key: 'benefitType', render: (type: string) => <Tag color={benefitTypeColors[type] || 'default'}>{type}</Tag> },
    { title: 'Durum', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={statusColors[status] || 'default'}>{status}</Tag> },
    { title: 'Deger', key: 'value', render: (_, record) => record.amount ? `${record.amount} ${record.currency || 'TRY'}` : '-' },
    { title: 'Baslangic', dataIndex: 'startDate', key: 'startDate', render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-' },
    {
      title: 'Islemler', key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => router.push(`/hr/employee-benefits/${record.id}`)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => router.push(`/hr/employee-benefits/${record.id}/edit`)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2"><GiftOutlined /> Calisan Yan Haklari</h1>
          <p className="text-gray-500 mt-1">Calisan yan haklarini yonetin</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/employee-benefits/new')} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Yeni Yan Hak</Button>
      </div>
      <Card>
        <div className="mb-4"><Input placeholder="Ara..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} /></div>
        <Table columns={columns} dataSource={filteredData} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}
