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
  ShieldCheckIcon,
  UsersIcon,
  TrashIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import {
  usePosition,
  useEmployees,
  useDeletePosition,
  useActivatePosition,
  useDeactivatePosition,
} from '@/lib/api/hooks/useHR';

const { Title, Text, Paragraph } = Typography;

export default function PositionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: position, isLoading, error } = usePosition(id);
  const { data: allEmployees = [] } = useEmployees({ positionId: id });
  const deletePosition = useDeletePosition();
  const activatePosition = useActivatePosition();
  const deactivatePosition = useDeactivatePosition();

  // Employees are already filtered by positionId in the API call
  const positionEmployees = allEmployees;

  const handleDelete = () => {
    if (!position) return;
    Modal.confirm({
      title: 'Pozisyonu Sil',
      content: `"${position.title}" pozisyonunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deletePosition.mutateAsync(id);
          router.push('/hr/positions');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async () => {
    if (!position) return;
    try {
      if (position.isActive) {
        await deactivatePosition.mutateAsync(id);
      } else {
        await activatePosition.mutateAsync(id);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  // Format currency
  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !position) {
    return (
      <div className="p-6">
        <Empty description="Pozisyon bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/positions')}>Listeye Dön</Button>
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
    { title: 'Departman', dataIndex: 'departmentName', key: 'department' },
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
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push('/hr/positions')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              {position.title}
            </Title>
            <Space>
              <Text type="secondary">{position.code}</Text>
              <Tag color={position.isActive ? 'green' : 'default'}>
                {position.isActive ? 'Aktif' : 'Pasif'}
              </Tag>
            </Space>
          </div>
        </Space>
        <Space>
          <Button
            icon={position.isActive ? <NoSymbolIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
            onClick={handleToggleActive}
          >
            {position.isActive ? 'Pasifleştir' : 'Aktifleştir'}
          </Button>
          <Button icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/positions/${id}/edit`)}>
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
                  value={position.filledPositions || 0}
                  prefix={<UsersIcon className="w-5 h-5" />}
                  valueStyle={{ color: '#7c3aed' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Min. Maaş"
                  value={position.minSalary || 0}
                  prefix={<CurrencyDollarIcon className="w-5 h-5" />}
                  valueStyle={{ color: '#52c41a', fontSize: 16 }}
                  formatter={(val) => formatCurrency(Number(val))}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Max. Maaş"
                  value={position.maxSalary || 0}
                  prefix={<CurrencyDollarIcon className="w-5 h-5" />}
                  valueStyle={{ color: '#1890ff', fontSize: 16 }}
                  formatter={(val) => formatCurrency(Number(val))}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Details */}
        <Col xs={24} lg={12}>
          <Card title="Pozisyon Bilgileri">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Pozisyon Adı">{position.title}</Descriptions.Item>
              <Descriptions.Item label="Pozisyon Kodu">{position.code}</Descriptions.Item>
              <Descriptions.Item label="Departman">{position.departmentName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Açıklama">{position.description || '-'}</Descriptions.Item>
              <Descriptions.Item label="Maaş Aralığı">
                {formatCurrency(position.minSalary)} - {formatCurrency(position.maxSalary)}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={position.isActive ? 'green' : 'default'}>
                  {position.isActive ? 'Aktif' : 'Pasif'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          {(position.requirements || position.responsibilities) && (
            <Card title="Detaylar">
              {position.requirements && (
                <>
                  <Text strong>Gereksinimler:</Text>
                  <Paragraph className="mt-2">{position.requirements}</Paragraph>
                </>
              )}
              {position.responsibilities && (
                <>
                  <Text strong>Sorumluluklar:</Text>
                  <Paragraph className="mt-2">{position.responsibilities}</Paragraph>
                </>
              )}
            </Card>
          )}
        </Col>

        {/* Employees */}
        <Col xs={24}>
          <Card
            title={
              <Space>
                <UsersIcon className="w-5 h-5" />
                Bu Pozisyondaki Çalışanlar
              </Space>
            }
          >
            {positionEmployees.length > 0 ? (
              <Table
                columns={employeeColumns}
                dataSource={positionEmployees}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="small"
              />
            ) : (
              <Empty description="Bu pozisyonda çalışan bulunamadı" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
