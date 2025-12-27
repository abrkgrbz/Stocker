'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Tag, Space, Input, Card, Select } from 'antd';
import {
  CurrencyDollarIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PrinterIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import { usePayslips, useDeletePayslip } from '@/lib/api/hooks/useHR';

interface Payslip {
  id: number;
  employeeName?: string;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  grossSalary: number;
  netSalary: number;
  status: string;
}

const statusColors: Record<string, string> = { 'Draft': 'default', 'Pending': 'processing', 'Approved': 'success', 'Paid': 'blue', 'Cancelled': 'error' };

export default function PayslipsPage() {
  const router = useRouter();
  const { data: payslips, isLoading } = usePayslips();
  const deletePayslip = useDeletePayslip();
  const [searchText, setSearchText] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!payslips) return [];
    if (!searchText) return payslips;
    const lower = searchText.toLowerCase();
    return payslips.filter((item: Payslip) => item.employeeName?.toLowerCase().includes(lower));
  }, [payslips, searchText]);

  const handleDelete = async (id: number) => { try { await deletePayslip.mutateAsync(id); } catch (error) {} };

  const formatCurrency = (value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value || 0);

  const columns: ColumnsType<Payslip> = [
    { title: 'Calisan', dataIndex: 'employeeName', key: 'employeeName', sorter: (a, b) => (a.employeeName || '').localeCompare(b.employeeName || '') },
    { title: 'Donem Baslangic', dataIndex: 'periodStart', key: 'periodStart', render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-' },
    { title: 'Donem Bitis', dataIndex: 'periodEnd', key: 'periodEnd', render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-' },
    { title: 'Brut Maas', dataIndex: 'grossSalary', key: 'grossSalary', render: (val: number) => formatCurrency(val), align: 'right' },
    { title: 'Net Maas', dataIndex: 'netSalary', key: 'netSalary', render: (val: number) => formatCurrency(val), align: 'right' },
    { title: 'Durum', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={statusColors[status] || 'default'}>{status}</Tag> },
    { title: 'Odeme Tarihi', dataIndex: 'paymentDate', key: 'paymentDate', render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-' },
    { title: 'Islemler', key: 'actions', render: (_, record) => (
      <Space>
        <Button type="text" icon={<EyeIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/payslips/${record.id}`)} />
        <Button type="text" icon={<PrinterIcon className="w-4 h-4" />} onClick={() => window.print()} />
        <Button type="text" danger icon={<TrashIcon className="w-4 h-4" />} onClick={() => handleDelete(record.id)} />
      </Space>
    )},
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2"><CurrencyDollarIcon className="w-4 h-4" /> Bordro Yonetimi</h1>
          <p className="text-gray-500 mt-1">Calisan maaş bordrolarini yonetin</p>
        </div>
        <Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={() => router.push('/hr/payslips/new')} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Yeni Bordro</Button>
      </div>
      <Card>
        <div className="mb-4"><Input placeholder="Calisan ara..." prefix={<MagnifyingGlassIcon className="w-4 h-4" />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} /></div>
        <Table columns={columns} dataSource={filteredData} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}
