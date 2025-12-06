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
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  StopOutlined,
  TeamOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import {
  usePositions,
  useDepartments,
  useDeletePosition,
  useActivatePosition,
  useDeactivatePosition,
} from '@/lib/api/hooks/useHR';
import type { PositionDto } from '@/lib/api/services/hr.types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search } = Input;

export default function PositionsPage() {
  const router = useRouter();

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>();
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
  const { data: positions = [], isLoading, refetch } = usePositions(selectedDepartment, includeInactive);
  const { data: departments = [] } = useDepartments();
  const deletePosition = useDeletePosition();
  const activatePosition = useActivatePosition();
  const deactivatePosition = useDeactivatePosition();

  // Filter positions
  const filteredPositions = useMemo(() => {
    return positions.filter((pos) => {
      const matchesSearch =
        !debouncedSearch ||
        pos.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (pos.code && pos.code.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (pos.description && pos.description.toLowerCase().includes(debouncedSearch.toLowerCase()));

      return matchesSearch;
    });
  }, [positions, debouncedSearch]);

  // Calculate stats
  const totalPositions = positions.length;
  const activePositions = positions.filter((p) => p.isActive).length;
  const totalEmployees = positions.reduce((sum, p) => sum + (p.employeeCount || 0), 0);

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/positions/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/positions/${id}/edit`);
  };

  const handleDelete = (pos: PositionDto) => {
    Modal.confirm({
      title: 'Pozisyonu Sil',
      content: `"${pos.title}" pozisyonunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deletePosition.mutateAsync(pos.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async (pos: PositionDto) => {
    try {
      if (pos.isActive) {
        await deactivatePosition.mutateAsync(pos.id);
      } else {
        await activatePosition.mutateAsync(pos.id);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
    setSelectedDepartment(undefined);
    setIncludeInactive(false);
  };

  // Format currency
  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  // Table columns
  const columns: ColumnsType<PositionDto> = [
    {
      title: 'Pozisyon Kodu',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code) => <Text strong>{code}</Text>,
    },
    {
      title: 'Pozisyon Adı',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Departman',
      dataIndex: 'departmentName',
      key: 'department',
      width: 150,
      render: (name) => name || <Text type="secondary">-</Text>,
    },
    {
      title: 'Maaş Aralığı',
      key: 'salary',
      width: 200,
      render: (_, record) => {
        if (!record.minSalary && !record.maxSalary) return <Text type="secondary">-</Text>;
        return (
          <Text>
            {formatCurrency(record.minSalary)} - {formatCurrency(record.maxSalary)}
          </Text>
        );
      },
    },
    {
      title: 'Çalışan',
      dataIndex: 'employeeCount',
      key: 'employees',
      width: 100,
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
            <SafetyCertificateOutlined className="mr-2" />
            Pozisyonlar
          </Title>
          <Text type="secondary">Tüm pozisyonları görüntüle ve yönet</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/positions/new')}>
            Yeni Pozisyon
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Toplam Pozisyon"
              value={totalPositions}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Aktif Pozisyon"
              value={activePositions}
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
          <Col xs={24} md={8}>
            <Search
              placeholder="Pozisyon adı, kod veya açıklama ara..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              placeholder="Departman"
              allowClear
              style={{ width: '100%' }}
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
            />
          </Col>
          <Col xs={12} md={5}>
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
          <Col xs={24} md={6}>
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
          dataSource={filteredPositions}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1000 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredPositions.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} pozisyon`,
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
