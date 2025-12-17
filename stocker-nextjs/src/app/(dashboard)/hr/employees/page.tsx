'use client';

/**
 * Employees List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Input,
  Select,
  Dropdown,
  Avatar,
  Modal,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined,
  MailOutlined,
  IdcardOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
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
import type { ColumnsType } from 'antd/es/table';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';

// Employee status configuration
const employeeStatusConfig: Record<number, { color: string; label: string }> = {
  [EmployeeStatus.Active]: { color: 'green', label: 'Aktif' },
  [EmployeeStatus.Inactive]: { color: 'default', label: 'Pasif' },
  [EmployeeStatus.OnLeave]: { color: 'blue', label: 'İzinde' },
  [EmployeeStatus.Terminated]: { color: 'red', label: 'İşten Çıkarıldı' },
  [EmployeeStatus.Resigned]: { color: 'orange', label: 'İstifa' },
  [EmployeeStatus.Retired]: { color: 'gray', label: 'Emekli' },
  [EmployeeStatus.Probation]: { color: 'purple', label: 'Deneme Süresinde' },
  [EmployeeStatus.MilitaryService]: { color: 'cyan', label: 'Askerde' },
  [EmployeeStatus.MaternityLeave]: { color: 'magenta', label: 'Doğum İzni' },
  [EmployeeStatus.SickLeave]: { color: 'volcano', label: 'Hastalık İzni' },
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
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === EmployeeStatus.Active).length;
  const onLeaveEmployees = employees.filter((e) => e.status === EmployeeStatus.OnLeave).length;
  const departmentCount = new Set(employees.map((e) => e.departmentName).filter(Boolean)).size;

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/employees/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/employees/${id}/edit`);
  };

  const handleDelete = (employee: EmployeeSummaryDto) => {
    Modal.confirm({
      title: 'Çalışanı Sil',
      content: `"${employee.fullName}" çalışanını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteEmployee.mutateAsync(employee.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async (employee: EmployeeSummaryDto) => {
    try {
      if (employee.status === EmployeeStatus.Active) {
        await deactivateEmployee.mutateAsync(employee.id);
      } else {
        await activateEmployee.mutateAsync(employee.id);
      }
    } catch (error) {
      // Error handled by hook
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
      title: 'Çalışan',
      key: 'employee',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            src={record.photoUrl}
            icon={<UserOutlined />}
            style={{ backgroundColor: record.photoUrl ? undefined : '#7c3aed' }}
          />
          <div>
            <div className="text-sm font-medium text-slate-900">{record.fullName}</div>
            <div className="text-xs text-slate-500">{record.employeeCode}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Departman',
      dataIndex: 'departmentName',
      key: 'department',
      width: 150,
      render: (name) => name || <span className="text-slate-400">-</span>,
    },
    {
      title: 'Pozisyon',
      dataIndex: 'positionTitle',
      key: 'position',
      width: 150,
      render: (title) => title || <span className="text-slate-400">-</span>,
    },
    {
      title: 'E-posta',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (email) =>
        email ? (
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <MailOutlined className="text-slate-400" />
            <span>{email}</span>
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      title: 'İşe Giriş',
      dataIndex: 'hireDate',
      key: 'hireDate',
      width: 110,
      render: (date) =>
        date ? (
          <span className="text-xs text-slate-600">
            {new Date(date).toLocaleDateString('tr-TR')}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: EmployeeStatus) => {
        const config = employeeStatusConfig[status];
        return config ? <Tag color={config.color}>{config.label}</Tag> : <Tag>{status}</Tag>;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'Görüntüle',
            onClick: () => handleView(record.id),
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Düzenle',
            onClick: () => handleEdit(record.id),
          },
          { type: 'divider' as const },
          {
            key: 'toggle',
            icon: record.status === EmployeeStatus.Active ? <StopOutlined /> : <CheckCircleOutlined />,
            label: record.status === EmployeeStatus.Active ? 'Pasifleştir' : 'Aktifleştir',
            onClick: () => handleToggleActive(record),
          },
          { type: 'divider' as const },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDelete(record),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              <MoreOutlined className="text-sm" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Çalışan</span>
              <div className="text-2xl font-semibold text-slate-900">{totalEmployees}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#7c3aed15' }}>
              <TeamOutlined style={{ color: '#7c3aed' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Aktif Çalışan</span>
              <div className="text-2xl font-semibold text-slate-900">{activeEmployees}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <CheckCircleOutlined style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">İzinde</span>
              <div className="text-2xl font-semibold text-slate-900">{onLeaveEmployees}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <CalendarOutlined style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Departman</span>
              <div className="text-2xl font-semibold text-slate-900">{departmentCount}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf615' }}>
              <IdcardOutlined style={{ color: '#8b5cf6' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<TeamOutlined />}
        iconColor="#7c3aed"
        title="Çalışanlar"
        description="Tüm çalışanları görüntüle ve yönet"
        itemCount={filteredEmployees.length}
        primaryAction={{
          label: 'Yeni Çalışan',
          onClick: () => router.push('/hr/employees/new'),
          icon: <PlusOutlined />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ReloadOutlined className={isLoading ? 'animate-spin' : ''} />
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Ad, kod, e-posta ara..."
              prefix={<SearchOutlined className="text-slate-400" />}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="h-10"
            />
          </div>
          <Select
            placeholder="Departman"
            allowClear
            className="h-10"
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
          />
          <Select
            placeholder="Pozisyon"
            allowClear
            className="h-10"
            value={selectedPosition}
            onChange={setSelectedPosition}
            options={positions.map((p) => ({ value: p.id, label: p.title }))}
          />
          <Select
            placeholder="Durum"
            allowClear
            className="h-10"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={Object.entries(employeeStatusConfig).map(([value, config]) => ({
              value: Number(value),
              label: config.label,
            }))}
          />
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
          >
            Temizle
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
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
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} çalışan`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
