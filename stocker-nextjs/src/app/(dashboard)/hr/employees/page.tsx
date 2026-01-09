'use client';

/**
 * Employees List Page
 * Monochrome design system following inventory patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Select, Button, Dropdown, Space } from 'antd';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UsersIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  StopIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  useEmployees,
  useDepartments,
  usePositions,
  useDeleteEmployee,
  useActivateEmployee,
  useDeactivateEmployee,
} from '@/lib/api/hooks/useHR';
import type { EmployeeSummaryDto } from '@/lib/api/services/hr.types';
import { EmployeeStatus } from '@/lib/api/services/hr.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { ColumnsType } from 'antd/es/table';

// Monochrome employee status configuration
const employeeStatusConfig: Record<number, { color: string; bgColor: string; label: string }> = {
  [EmployeeStatus.Active]: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Aktif' },
  [EmployeeStatus.Inactive]: { color: '#64748b', bgColor: '#f1f5f9', label: 'Pasif' },
  [EmployeeStatus.OnLeave]: { color: '#334155', bgColor: '#e2e8f0', label: 'Izinde' },
  [EmployeeStatus.Terminated]: { color: '#475569', bgColor: '#cbd5e1', label: 'Isten Cikarildi' },
  [EmployeeStatus.Resigned]: { color: '#64748b', bgColor: '#f1f5f9', label: 'Istifa' },
  [EmployeeStatus.Retired]: { color: '#94a3b8', bgColor: '#f8fafc', label: 'Emekli' },
  [EmployeeStatus.Probation]: { color: '#334155', bgColor: '#e2e8f0', label: 'Deneme Suresinde' },
  [EmployeeStatus.MilitaryService]: { color: '#475569', bgColor: '#e2e8f0', label: 'Askerde' },
  [EmployeeStatus.MaternityLeave]: { color: '#334155', bgColor: '#f1f5f9', label: 'Dogum Izni' },
  [EmployeeStatus.SickLeave]: { color: '#475569', bgColor: '#f1f5f9', label: 'Hastalik Izni' },
};

export default function EmployeesPage() {
  const router = useRouter();

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>();
  const [selectedPosition, setSelectedPosition] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<EmployeeStatus | undefined>();
  const [includeInactive, setIncludeInactive] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // API Hooks
  const { data: employees = [], isLoading, refetch } = useEmployees({
    departmentId: selectedDepartment,
    positionId: selectedPosition,
    status: selectedStatus,
    includeInactive,
  });
  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions(selectedDepartment);
  const deleteEmployee = useDeleteEmployee();
  const activateEmployee = useActivateEmployee();
  const deactivateEmployee = useDeactivateEmployee();

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        !debouncedSearch ||
        employee.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        employee.employeeCode.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (employee.email && employee.email.toLowerCase().includes(debouncedSearch.toLowerCase()));

      return matchesSearch;
    });
  }, [employees, debouncedSearch]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.status === EmployeeStatus.Active).length;
    const onLeave = employees.filter((e) =>
      e.status === EmployeeStatus.OnLeave ||
      e.status === EmployeeStatus.SickLeave ||
      e.status === EmployeeStatus.MaternityLeave
    ).length;
    const probation = employees.filter((e) => e.status === EmployeeStatus.Probation).length;
    return { total, active, onLeave, probation };
  }, [employees]);

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/employees/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/employees/${id}/edit`);
  };

  const handleDelete = async (employee: EmployeeSummaryDto) => {
    try {
      await deleteEmployee.mutateAsync(employee.id);
      showSuccess('Calisan basariyla silindi!');
    } catch (err) {
      showApiError(err, 'Calisan silinirken bir hata olustu');
    }
  };

  const handleToggleActive = async (employee: EmployeeSummaryDto) => {
    try {
      if (employee.status === EmployeeStatus.Active) {
        await deactivateEmployee.mutateAsync(employee.id);
        showSuccess('Calisan pasiflestrildi!');
      } else {
        await activateEmployee.mutateAsync(employee.id);
        showSuccess('Calisan aktiflestrildi!');
      }
    } catch (err) {
      showApiError(err, 'Islem sirasinda bir hata olustu');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
    setSelectedDepartment(undefined);
    setSelectedPosition(undefined);
    setSelectedStatus(undefined);
    setIncludeInactive(false);
  };

  // Table columns
  const columns: ColumnsType<EmployeeSummaryDto> = [
    {
      title: 'Calisan',
      key: 'employee',
      width: 280,
      render: (_, record) => (
        <div className="space-y-1">
          <span
            className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600"
            onClick={() => handleView(record.id)}
          >
            {record.fullName}
          </span>
          <div className="text-xs text-slate-500">
            {record.employeeCode}
            {record.email && ` - ${record.email}`}
          </div>
        </div>
      ),
    },
    {
      title: 'Departman / Pozisyon',
      key: 'department',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.departmentName || '-'}</div>
          <div className="text-xs text-slate-500">{record.positionTitle || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (phone) => (
        <span className="text-slate-600">{phone || '-'}</span>
      ),
    },
    {
      title: 'Ise Giris',
      dataIndex: 'hireDate',
      key: 'hireDate',
      width: 120,
      render: (date) => (
        <span className="text-slate-600">
          {date ? new Date(date).toLocaleDateString('tr-TR') : '-'}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: EmployeeStatus) => {
        const config = employeeStatusConfig[status] || { color: '#64748b', bgColor: '#f1f5f9', label: 'Bilinmiyor' };
        return (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Goruntule',
            onClick: () => handleView(record.id),
          },
          {
            key: 'edit',
            icon: <PencilSquareIcon className="w-4 h-4" />,
            label: 'Duzenle',
            onClick: () => handleEdit(record.id),
          },
          { type: 'divider' as const },
          {
            key: 'toggle',
            icon: record.status === EmployeeStatus.Active ? <StopIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />,
            label: record.status === EmployeeStatus.Active ? 'Pasiflestir' : 'Aktiflestir',
            onClick: () => handleToggleActive(record),
          },
          {
            key: 'delete',
            icon: <TrashIcon className="w-4 h-4" />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDelete(record),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="text-slate-600 hover:text-slate-900" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <UsersIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Calisanlar</h1>
            <p className="text-slate-500 mt-1">Tum calisanlari goruntule ve yonet</p>
          </div>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            onClick={() => refetch()}
            loading={isLoading}
            className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/hr/employees/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Calisan
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Calisan</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.active}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif Calisan</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.onLeave}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Izinde</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-600">{stats.probation}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Deneme Suresinde</div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Calisan ara... (ad, sicil no, e-posta)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          <Select
            placeholder="Departman"
            allowClear
            style={{ width: 160 }}
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Pozisyon"
            allowClear
            style={{ width: 160 }}
            value={selectedPosition}
            onChange={setSelectedPosition}
            options={positions.map((p) => ({ value: p.id, label: p.title }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Durum"
            allowClear
            style={{ width: 160 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={Object.entries(employeeStatusConfig).map(([value, config]) => ({
              value: Number(value),
              label: config.label,
            }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            value={includeInactive}
            onChange={setIncludeInactive}
            style={{ width: 130 }}
            options={[
              { value: false, label: 'Sadece Aktif' },
              { value: true, label: 'Tumu' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Button onClick={clearFilters} className="!border-slate-300 !text-slate-600">
            Temizle
          </Button>
        </div>

        {/* Results count */}
        <div className="text-sm text-slate-500 mb-4">
          {filteredEmployees.length} calisan listeleniyor
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredEmployees}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1100 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredEmployees.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} calisan`,
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
