'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Card,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Modal,
  message,
  Dropdown,
  Tooltip,
  Avatar,
  Popconfirm,
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
} from '@ant-design/icons';
import {
  useEmployees,
  useDepartments,
  usePositions,
  useDeleteEmployee,
  useActivateEmployee,
  useDeactivateEmployee,
} from '@/lib/api/hooks/useHR';
import type { EmployeeSummaryDto, EmployeeStatus } from '@/lib/api/services/hr.types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search } = Input;

// Employee status configuration
const employeeStatusConfig: Record<EmployeeStatus, { color: string; label: string }> = {
  Active: { color: 'green', label: 'Aktif' },
  OnLeave: { color: 'blue', label: 'İzinde' },
  Suspended: { color: 'orange', label: 'Askıda' },
  Terminated: { color: 'red', label: 'İşten Ayrıldı' },
  Retired: { color: 'gray', label: 'Emekli' },
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
  const activeEmployees = employees.filter((e) => e.status === 'Active').length;
  const onLeaveEmployees = employees.filter((e) => e.status === 'OnLeave').length;
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
      if (employee.status === 'Active') {
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
        <Space>
          <Avatar
            size={40}
            src={record.photoUrl}
            icon={<UserOutlined />}
            style={{ backgroundColor: record.photoUrl ? undefined : '#7c3aed' }}
          />
          <div>
            <div className="font-medium">{record.fullName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.employeeCode}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Departman',
      dataIndex: 'departmentName',
      key: 'department',
      width: 150,
      render: (name) => name || <Text type="secondary">-</Text>,
    },
    {
      title: 'Pozisyon',
      dataIndex: 'positionTitle',
      key: 'position',
      width: 150,
      render: (title) => title || <Text type="secondary">-</Text>,
    },
    {
      title: 'E-posta',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (email) =>
        email ? (
          <Space size={4}>
            <MailOutlined style={{ color: '#8c8c8c' }} />
            <Text style={{ fontSize: 12 }}>{email}</Text>
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'İşe Giriş',
      dataIndex: 'hireDate',
      key: 'hireDate',
      width: 110,
      render: (date) =>
        date ? new Date(date).toLocaleDateString('tr-TR') : <Text type="secondary">-</Text>,
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
      title: 'İşlemler',
      key: 'actions',
      width: 100,
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
            icon: record.status === 'Active' ? <StopOutlined /> : <CheckCircleOutlined />,
            label: record.status === 'Active' ? 'Pasifleştir' : 'Aktifleştir',
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
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <TeamOutlined className="mr-2" />
            Çalışanlar
          </Title>
          <Text type="secondary">Tüm çalışanları görüntüle ve yönet</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/employees/new')}>
            Yeni Çalışan
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Toplam Çalışan"
              value={totalEmployees}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Aktif Çalışan"
              value={activeEmployees}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="İzinde"
              value={onLeaveEmployees}
              prefix={<IdcardOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Departman Sayısı"
              value={departmentCount}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Search
              placeholder="Ad, kod, e-posta veya telefon ara..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Departman"
              allowClear
              style={{ width: '100%' }}
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Pozisyon"
              allowClear
              style={{ width: '100%' }}
              value={selectedPosition}
              onChange={setSelectedPosition}
              options={positions.map((p) => ({ value: p.id, label: p.title }))}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Durum"
              allowClear
              style={{ width: '100%' }}
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={Object.entries(employeeStatusConfig).map(([value, config]) => ({
                value,
                label: config.label,
              }))}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              value={includeInactive}
              onChange={setIncludeInactive}
              options={[
                { value: false, label: 'Sadece Aktifler' },
                { value: true, label: 'Tümü' },
              ]}
            />
          </Col>
          <Col xs={24} md={2}>
            <Button block onClick={clearFilters}>
              Temizle
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
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
      </Card>
    </div>
  );
}
