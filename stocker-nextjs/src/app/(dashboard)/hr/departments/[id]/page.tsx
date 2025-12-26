'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Card,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Table,
  Empty,
  Modal,
} from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  PencilIcon,
  BuildingOfficeIcon,
  UsersIcon,
  TrashIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  useDepartment,
  useEmployees,
  useDeleteDepartment,
  useActivateDepartment,
  useDeactivateDepartment,
} from '@/lib/api/hooks/useHR';
import { EmployeeStatus } from '@/lib/api/services/hr.types';

const { Title, Text } = Typography;

export default function DepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: department, isLoading, error } = useDepartment(id);
  const { data: allEmployees = [] } = useEmployees({ departmentId: id });
  const deleteDepartment = useDeleteDepartment();
  const activateDepartment = useActivateDepartment();
  const deactivateDepartment = useDeactivateDepartment();

  // Employees for this department (already filtered by API)
  const departmentEmployees = allEmployees;

  const handleDelete = () => {
    if (!department) return;
    Modal.confirm({
      title: 'Departmanı Sil',
      content: `"${department.name}" departmanını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteDepartment.mutateAsync(id);
          router.push('/hr/departments');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async () => {
    if (!department) return;
    try {
      if (department.isActive) {
        await deactivateDepartment.mutateAsync(id);
      } else {
        await activateDepartment.mutateAsync(id);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="p-6">
        <Empty description="Departman bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/departments')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  const employeeColumns = [
    {
      title: 'Ad Soyad',
      key: 'name',
      render: (_: any, record: any) => record.fullName,
    },
    { title: 'Pozisyon', dataIndex: 'positionName', key: 'position' },
    { title: 'E-posta', dataIndex: 'email', key: 'email' },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'default'}>{status === 'Active' ? 'Aktif' : status}</Tag>
      ),
    },
    {
      title: 'İşlem',
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => router.push(`/hr/employees/${record.id}`)}>
          Görüntüle
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Space>
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push('/hr/departments')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              {department.name}
            </Title>
            <Space>
              <Text type="secondary">{department.code}</Text>
              <Tag color={department.isActive ? 'green' : 'default'}>
                {department.isActive ? 'Aktif' : 'Pasif'}
              </Tag>
            </Space>
          </div>
        </Space>
        <Space>
          <Button
            icon={department.isActive ? <NoSymbolIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
            onClick={handleToggleActive}
          >
            {department.isActive ? 'Pasifleştir' : 'Aktifleştir'}
          </Button>
          <Button icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/departments/${id}/edit`)}>
            Düzenle
          </Button>
          <Button danger icon={<TrashIcon className="w-4 h-4" />} onClick={handleDelete}>
            Sil
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Stats */}
        <Col xs={24}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Çalışan Sayısı"
                  value={department.employeeCount || 0}
                  prefix={<UsersIcon className="w-5 h-5" />}
                  valueStyle={{ color: '#7c3aed' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Aktif Çalışan"
                  value={departmentEmployees.filter((e) => e.status === EmployeeStatus.Active).length}
                  prefix={<CheckCircleIcon className="w-5 h-5" />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Details */}
        <Col xs={24} lg={12}>
          <Card title="Departman Bilgileri">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Departman Adı">{department.name}</Descriptions.Item>
              <Descriptions.Item label="Departman Kodu">{department.code}</Descriptions.Item>
              <Descriptions.Item label="Açıklama">{department.description || '-'}</Descriptions.Item>
              <Descriptions.Item label="Üst Departman">
                {department.parentDepartmentName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Yönetici">{department.managerName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={department.isActive ? 'green' : 'default'}>
                  {department.isActive ? 'Aktif' : 'Pasif'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Employees */}
        <Col xs={24}>
          <Card
            title={
              <Space>
                <UserIcon className="w-5 h-5" />
                Departman Çalışanları
              </Space>
            }
          >
            {departmentEmployees.length > 0 ? (
              <Table
                columns={employeeColumns}
                dataSource={departmentEmployees}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="small"
              />
            ) : (
              <Empty description="Bu departmanda çalışan bulunamadı" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
