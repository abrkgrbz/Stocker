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
  Row,
  Col,
  Statistic,
  Modal,
  Dropdown,
  Select,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  StopOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  useDepartments,
  useDeleteDepartment,
  useActivateDepartment,
  useDeactivateDepartment,
} from '@/lib/api/hooks/useHR';
import type { DepartmentDto } from '@/lib/api/services/hr.types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search } = Input;

export default function DepartmentsPage() {
  const router = useRouter();

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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
  const { data: departments = [], isLoading, refetch } = useDepartments(includeInactive);
  const deleteDepartment = useDeleteDepartment();
  const activateDepartment = useActivateDepartment();
  const deactivateDepartment = useDeactivateDepartment();

  // Filter departments
  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        !debouncedSearch ||
        dept.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (dept.code && dept.code.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (dept.description && dept.description.toLowerCase().includes(debouncedSearch.toLowerCase()));

      return matchesSearch;
    });
  }, [departments, debouncedSearch]);

  // Calculate stats
  const totalDepartments = departments.length;
  const activeDepartments = departments.filter((d) => d.isActive).length;
  const totalEmployees = departments.reduce((sum, d) => sum + (d.employeeCount || 0), 0);

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/departments/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/departments/${id}/edit`);
  };

  const handleDelete = (dept: DepartmentDto) => {
    Modal.confirm({
      title: 'Departmanı Sil',
      content: `"${dept.name}" departmanını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteDepartment.mutateAsync(dept.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async (dept: DepartmentDto) => {
    try {
      if (dept.isActive) {
        await deactivateDepartment.mutateAsync(dept.id);
      } else {
        await activateDepartment.mutateAsync(dept.id);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
    setIncludeInactive(false);
  };

  // Table columns
  const columns: ColumnsType<DepartmentDto> = [
    {
      title: 'Departman Kodu',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code) => <Text strong>{code}</Text>,
    },
    {
      title: 'Departman Adı',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc) => desc || <Text type="secondary">-</Text>,
    },
    {
      title: 'Yönetici',
      dataIndex: 'managerName',
      key: 'manager',
      width: 150,
      render: (name) => name || <Text type="secondary">-</Text>,
    },
    {
      title: 'Çalışan Sayısı',
      dataIndex: 'employeeCount',
      key: 'employees',
      width: 120,
      align: 'center',
      render: (count) => <Tag color="blue">{count || 0}</Tag>,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'status',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>{isActive ? 'Aktif' : 'Pasif'}</Tag>
      ),
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
            icon: record.isActive ? <StopOutlined /> : <CheckCircleOutlined />,
            label: record.isActive ? 'Pasifleştir' : 'Aktifleştir',
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
            <ApartmentOutlined className="mr-2" />
            Departmanlar
          </Title>
          <Text type="secondary">Tüm departmanları görüntüle ve yönet</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/departments/new')}>
            Yeni Departman
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Toplam Departman"
              value={totalDepartments}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Aktif Departman"
              value={activeDepartments}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Toplam Çalışan"
              value={totalEmployees}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Search
              placeholder="Departman adı, kod veya açıklama ara..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={12} md={6}>
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
          <Col xs={12} md={6}>
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
          dataSource={filteredDepartments}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 900 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredDepartments.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} departman`,
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
