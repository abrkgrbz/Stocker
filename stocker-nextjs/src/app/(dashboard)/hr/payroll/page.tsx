'use client';

/**
 * Payroll List Page
 * Monochrome design system following inventory module patterns
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select, DatePicker, Table, Button, Dropdown, Tooltip, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowPathIcon,
  CurrencyDollarIcon,
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  ClockIcon,
  BanknotesIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  usePayrolls,
  useCancelPayroll,
  useApprovePayroll,
  useMarkPayrollPaid,
  useEmployees,
} from '@/lib/api/hooks/useHR';
import type { PayrollDto, PayrollFilterDto } from '@/lib/api/services/hr.types';
import { PayrollStatus } from '@/lib/api/services/hr.types';
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

// Status configuration with monochrome colors
const statusConfig: Record<PayrollStatus, { label: string; bgColor: string; textColor: string }> = {
  [PayrollStatus.Draft]: { label: 'Taslak', bgColor: 'bg-slate-100', textColor: 'text-slate-600' },
  [PayrollStatus.Calculated]: { label: 'Hesaplandı', bgColor: 'bg-slate-200', textColor: 'text-slate-700' },
  [PayrollStatus.PendingApproval]: { label: 'Onay Bekliyor', bgColor: 'bg-slate-300', textColor: 'text-slate-800' },
  [PayrollStatus.Approved]: { label: 'Onaylandı', bgColor: 'bg-slate-700', textColor: 'text-white' },
  [PayrollStatus.Paid]: { label: 'Ödendi', bgColor: 'bg-slate-900', textColor: 'text-white' },
  [PayrollStatus.Cancelled]: { label: 'İptal', bgColor: 'bg-slate-200', textColor: 'text-slate-500' },
  [PayrollStatus.Rejected]: { label: 'Reddedildi', bgColor: 'bg-slate-300', textColor: 'text-slate-600' },
};

export default function PayrollPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<PayrollFilterDto>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // API Hooks
  const { data: payrolls = [], isLoading, refetch } = usePayrolls(filters);
  const { data: employees = [] } = useEmployees();
  const cancelPayroll = useCancelPayroll();
  const approvePayroll = useApprovePayroll();
  const markPaid = useMarkPayrollPaid();

  // Calculate stats
  const stats = {
    total: payrolls.length,
    draft: payrolls.filter((p) => p.status === PayrollStatus.Draft).length,
    pending: payrolls.filter((p) => p.status === PayrollStatus.PendingApproval).length,
    approved: payrolls.filter((p) => p.status === PayrollStatus.Approved).length,
    paid: payrolls.filter((p) => p.status === PayrollStatus.Paid).length,
    totalAmount: payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0),
  };

  // CRUD Handlers
  const handleView = (id: number) => router.push(`/hr/payroll/${id}`);
  const handleEdit = (id: number) => router.push(`/hr/payroll/${id}/edit`);

  const handleApprove = async (payroll: PayrollDto) => {
    try {
      await approvePayroll.mutateAsync({ id: payroll.id });
      showSuccess('Bordro onaylandı!');
    } catch (err) {
      showApiError(err, 'Bordro onaylanırken bir hata oluştu');
    }
  };

  const handleMarkPaid = async (payroll: PayrollDto) => {
    try {
      await markPaid.mutateAsync({ id: payroll.id });
      showSuccess('Bordro ödendi olarak işaretlendi!');
    } catch (err) {
      showApiError(err, 'İşlem sırasında bir hata oluştu');
    }
  };

  const handleCancel = async (payroll: PayrollDto) => {
    try {
      await cancelPayroll.mutateAsync({ id: payroll.id, reason: 'İptal edildi' });
      showSuccess('Bordro iptal edildi!');
    } catch (err) {
      showApiError(err, 'Bordro iptal edilirken bir hata oluştu');
    }
  };

  const clearFilters = () => setFilters({});

  // Table columns
  const columns: ColumnsType<PayrollDto> = [
    {
      title: 'Çalışan',
      key: 'employee',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.employeeName}</div>
          <div className="text-xs text-slate-500">
            {record.month}/{record.year}
          </div>
        </div>
      ),
    },
    {
      title: 'Brüt Maaş',
      dataIndex: 'grossSalary',
      key: 'grossSalary',
      width: 120,
      align: 'right',
      render: (value) => <span className="text-slate-700">{formatCurrency(value)}</span>,
    },
    {
      title: 'Kesintiler',
      dataIndex: 'totalDeductions',
      key: 'totalDeductions',
      width: 120,
      align: 'right',
      render: (value) => <span className="text-slate-500">{formatCurrency(value)}</span>,
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
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: PayrollStatus) => {
        const config = statusConfig[status] || statusConfig[PayrollStatus.Draft];
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          { key: 'view', icon: <EyeIcon className="w-4 h-4" />, label: 'Görüntüle', onClick: () => handleView(record.id) },
          { key: 'edit', icon: <PencilSquareIcon className="w-4 h-4" />, label: 'Düzenle', onClick: () => handleEdit(record.id) },
          { type: 'divider' as const },
          ...(record.status === PayrollStatus.PendingApproval ? [
            { key: 'approve', icon: <CheckCircleIcon className="w-4 h-4" />, label: 'Onayla', onClick: () => handleApprove(record) },
          ] : []),
          ...(record.status === PayrollStatus.Approved ? [
            { key: 'paid', icon: <BanknotesIcon className="w-4 h-4" />, label: 'Ödendi İşaretle', onClick: () => handleMarkPaid(record) },
          ] : []),
          ...(record.status !== PayrollStatus.Paid && record.status !== PayrollStatus.Cancelled ? [
            { key: 'cancel', icon: <XMarkIcon className="w-4 h-4" />, label: 'İptal Et', danger: true, onClick: () => handleCancel(record) },
          ] : []),
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
            <CurrencyDollarIcon className="w-7 h-7" />
            Bordro Yönetimi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tüm bordroları görüntüle ve yönet
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
            onClick={() => router.push('/hr/payroll/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Bordro
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 sm:col-span-6 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Bordro</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.pending}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Onay Bekleyen</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <DocumentCheckIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.approved}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Onaylanan</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.paid}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Ödenen</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <BanknotesIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalAmount)}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Net Maaş</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            placeholder="Çalışan seçin"
            allowClear
            showSearch
            optionFilterProp="children"
            style={{ width: '100%' }}
            value={filters.employeeId}
            onChange={(value) => setFilters((prev) => ({ ...prev, employeeId: value }))}
            options={employees.map((e) => ({ value: e.id, label: e.fullName }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <DatePicker
            picker="month"
            format="MM/YYYY"
            placeholder="Dönem seçin"
            style={{ width: '100%' }}
            className="[&_.ant-picker]:!border-slate-300 [&_.ant-picker]:!rounded-lg"
            onChange={(date) => {
              if (date) {
                setFilters((prev) => ({ ...prev, month: date.month() + 1, year: date.year() }));
              } else {
                setFilters((prev) => ({ ...prev, month: undefined, year: undefined }));
              }
            }}
          />
          <Select
            placeholder="Durum"
            allowClear
            style={{ width: '100%' }}
            value={filters.status}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            options={[
              { value: PayrollStatus.Draft, label: 'Taslak' },
              { value: PayrollStatus.Calculated, label: 'Hesaplandı' },
              { value: PayrollStatus.PendingApproval, label: 'Onay Bekliyor' },
              { value: PayrollStatus.Approved, label: 'Onaylanan' },
              { value: PayrollStatus.Paid, label: 'Ödenen' },
              { value: PayrollStatus.Cancelled, label: 'İptal' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Button
            onClick={clearFilters}
            className="h-10 !border-slate-300 hover:!border-slate-400 !text-slate-600"
          >
            Temizle
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Table
          columns={columns}
          dataSource={payrolls}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 900 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: payrolls.length,
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
