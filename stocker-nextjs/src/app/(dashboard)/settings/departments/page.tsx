'use client';

/**
 * Department Management Page
 * Allows administrators to manage organizational departments
 * Uses full-page forms for consistency with CRM-style pages
 */

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Typography,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  deleteDepartment,
  type Department,
} from '@/lib/api/departments';
import { useDepartments } from '@/hooks/useDepartments';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';

const { Title, Text } = Typography;

export default function DepartmentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch departments using hook
  const { data: departments = [], isLoading } = useDepartments();

  // Delete department mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      showDeleteSuccess('departman');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Departman silinirken bir hata oluştu';
      showError(errorMessage);
    },
  });

  const handleCreate = () => {
    router.push('/settings/departments/new');
  };

  const handleEdit = (department: Department) => {
    router.push(`/settings/departments/${department.id}/edit`);
  };

  const handleDelete = async (department: Department) => {
    const additionalWarning = department.employeeCount > 0
      ? `Bu departmanda ${department.employeeCount} çalışan var. Silmeden önce çalışanları başka bir departmana atamanız gerekir.`
      : undefined;

    const confirmed = await confirmDelete('Departman', department.name, additionalWarning);

    if (confirmed && department.employeeCount === 0) {
      deleteMutation.mutate(department.id);
    }
  };

  const columns: ColumnsType<Department> = [
    {
      title: 'Departman Adı',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <ApartmentOutlined style={{ color: '#667eea' }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      render: (code?: string) => code || '-',
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      render: (description?: string) => description || '-',
    },
    {
      title: 'Çalışan Sayısı',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      align: 'center',
      render: (count: number) => (
        <Tag color={count > 0 ? 'blue' : 'default'} icon={<TeamOutlined />}>
          {count}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: '#667eea' }}
          >
            Düzenle
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Sil
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 10,
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ApartmentOutlined style={{ fontSize: 20, color: 'white' }} />
                  </div>
                  Departman Yönetimi
                </Title>
                <Text type="secondary" style={{ marginLeft: 52 }}>
                  Organizasyonunuzun departmanlarını yönetin
                </Text>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                }}
              >
                Yeni Departman
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={departments}
              loading={isLoading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} departman`,
              }}
            />
          </Card>
        </Col>
      </Row>

    </div>
  );
}
