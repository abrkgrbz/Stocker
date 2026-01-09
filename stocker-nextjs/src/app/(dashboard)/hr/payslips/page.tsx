'use client';

/**
 * Payslips List Page
 * Monochrome design system following inventory module patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Dropdown, Tooltip, Space, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowPathIcon,
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PrinterIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  CalendarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { usePayslips, useDeletePayslip } from '@/lib/api/hooks/useHR';
import type { PayslipDto } from '@/lib/api/services/hr.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';

// Format currency helper
const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '₺0';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format date helper
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('tr-TR');
};

export default function PayslipsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data: payslipsData, isLoading, refetch } = usePayslips();
  const deletePayslipMutation = useDeletePayslip();

  // Client-side filtering
  const filteredPayslips = useMemo(() => {
    const payslips = payslipsData || [];
    if (!debouncedSearch) return payslips;
    const lower = debouncedSearch.toLowerCase();
    return payslips.filter((item: PayslipDto) =>
      item.employeeName?.toLowerCase().includes(lower) ||
      item.payslipNumber?.toLowerCase().includes(lower)
    );
  }, [payslipsData, debouncedSearch]);

  // Calculate stats
  const stats = useMemo(() => {
    const payslips = payslipsData || [];
    return {
      total: payslips.length,
      totalNetAmount: payslips.reduce((sum, p) => sum + (p.netSalary || 0), 0),
      totalGrossAmount: payslips.reduce((sum, p) => sum + (p.grossSalary || 0), 0),
      uniqueEmployees: new Set(payslips.map(p => p.employeeId)).size,
    };
  }, [payslipsData]);

  const handleView = (id: number) => router.push(`/hr/payslips/${id}`);
  const handlePrint = (id: number) => window.open(`/hr/payslips/${id}/print`, '_blank');

  const handleDelete = async (payslip: PayslipDto) => {
    try {
      await deletePayslipMutation.mutateAsync(payslip.id);
      showSuccess('Bordro başarıyla silindi');
      refetch();
    } catch (err) {
      showApiError(err, 'Bordro silinemedi');
    }
  };

  // Table columns
  const columns: ColumnsType<PayslipDto> = [
    {
      title: 'Bordro No',
      dataIndex: 'payslipNumber',
      key: 'payslipNumber',
      width: 140,
      render: (value) => <span className="font-medium text-slate-900">{value}</span>,
    },
    {
      title: 'Çalışan',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 200,
      render: (value) => <span className="text-slate-700">{value}</span>,
    },
    {
      title: 'Dönem',
      key: 'period',
      width: 120,
      render: (_, record) => (
        <span className="text-slate-600">
          {record.month}/{record.year}
        </span>
      ),
    },
    {
      title: 'Brüt Maaş',
      dataIndex: 'grossSalary',
      key: 'grossSalary',
      width: 130,
      align: 'right',
      render: (value) => <span className="text-slate-600">{formatCurrency(value)}</span>,
    },
    {
      title: 'Net Maaş',
      dataIndex: 'netSalary',
      key: 'netSalary',
      width: 130,
      align: 'right',
      render: (value) => <span className="font-semibold text-slate-900">{formatCurrency(value)}</span>,
    },
    {
      title: 'Oluşturma Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (value) => <span className="text-slate-500">{formatDate(value)}</span>,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          { key: 'view', icon: <EyeIcon className="w-4 h-4" />, label: 'Görüntüle', onClick: () => handleView(record.id) },
          { key: 'print', icon: <PrinterIcon className="w-4 h-4" />, label: 'Yazdır', onClick: () => handlePrint(record.id) },
          { type: 'divider' as const },
          { key: 'delete', icon: <TrashIcon className="w-4 h-4" />, label: 'Sil', danger: true, onClick: () => handleDelete(record) },
        ];
        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="!text-slate-600 hover:!text-slate-900" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <DocumentTextIcon className="w-7 h-7" />
            Bordro Yönetimi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Çalışan maaş bordrolarını yönetin ve takip edin
          </p>
        </div>
        <Space size="middle">
          <Tooltip title="Yenile">
            <Button
              icon={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={() => refetch()}
              loading={isLoading}
              className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/hr/payslips/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Bordro
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Bordro</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.uniqueEmployees}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Calisan Sayisi</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <BanknotesIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalGrossAmount)}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Brut</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <BanknotesIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalNetAmount)}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Net</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Bordro ara... (calisan adi, bordro numarasi)"
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ maxWidth: 400 }}
            className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredPayslips}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 900 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredPayslips.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bordro`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}
