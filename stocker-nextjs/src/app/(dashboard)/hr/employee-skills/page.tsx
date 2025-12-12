'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Tag, Space, Input, Card, Progress } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ToolOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useEmployeeSkills, useDeleteEmployeeSkill } from '@/lib/api/hooks/useHR';

interface EmployeeSkill {
  id: number;
  employeeId: number;
  employeeName?: string;
  skillName: string;
  skillCategory?: string;
  proficiencyLevel: string;
  yearsOfExperience?: number;
  isCertified: boolean;
  isVerified: boolean;
}

const proficiencyColors: Record<string, string> = {
  'Beginner': 'default',
  'Elementary': 'blue',
  'Intermediate': 'cyan',
  'Advanced': 'green',
  'Expert': 'gold',
  'Master': 'red',
};

const proficiencyPercent: Record<string, number> = {
  'Beginner': 16,
  'Elementary': 33,
  'Intermediate': 50,
  'Advanced': 66,
  'Expert': 83,
  'Master': 100,
};

export default function EmployeeSkillsPage() {
  const router = useRouter();
  const { data: skills, isLoading } = useEmployeeSkills();
  const deleteSkill = useDeleteEmployeeSkill();
  const [searchText, setSearchText] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!skills) return [];
    if (!searchText) return skills;
    const lower = searchText.toLowerCase();
    return skills.filter((item: EmployeeSkill) =>
      item.employeeName?.toLowerCase().includes(lower) ||
      item.skillName?.toLowerCase().includes(lower)
    );
  }, [skills, searchText]);

  const handleDelete = async (id: number) => {
    try { await deleteSkill.mutateAsync(id); } catch (error) {}
  };

  const columns: ColumnsType<EmployeeSkill> = [
    { title: 'Calisan', dataIndex: 'employeeName', key: 'employeeName', sorter: (a, b) => (a.employeeName || '').localeCompare(b.employeeName || '') },
    { title: 'Yetkinlik', dataIndex: 'skillName', key: 'skillName' },
    { title: 'Kategori', dataIndex: 'skillCategory', key: 'skillCategory' },
    { title: 'Seviye', dataIndex: 'proficiencyLevel', key: 'proficiencyLevel', render: (level: string) => (
      <div style={{ minWidth: 120 }}>
        <Tag color={proficiencyColors[level] || 'default'}>{level}</Tag>
        <Progress percent={proficiencyPercent[level] || 0} size="small" showInfo={false} className="mt-1" />
      </div>
    )},
    { title: 'Deneyim', dataIndex: 'yearsOfExperience', key: 'yearsOfExperience', render: (years: number) => years ? `${years} yil` : '-' },
    { title: 'Sertifikali', dataIndex: 'isCertified', key: 'isCertified', render: (val: boolean) => val ? <Tag color="success">Evet</Tag> : <Tag>Hayir</Tag> },
    { title: 'Dogrulanmis', dataIndex: 'isVerified', key: 'isVerified', render: (val: boolean) => val ? <Tag color="success">Evet</Tag> : <Tag>Hayir</Tag> },
    {
      title: 'Islemler', key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => router.push(`/hr/employee-skills/${record.id}`)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => router.push(`/hr/employee-skills/${record.id}/edit`)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2"><ToolOutlined /> Calisan Yetkinlikleri</h1>
          <p className="text-gray-500 mt-1">Calisan yetkinlik ve becerilerini yonetin</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/employee-skills/new')} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Yeni Yetkinlik</Button>
      </div>
      <Card>
        <div className="mb-4"><Input placeholder="Ara..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} /></div>
        <Table columns={columns} dataSource={filteredData} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}
