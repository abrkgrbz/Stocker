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
  Spin,
  Row,
  Col,
  Statistic,
  Empty,
  Modal,
} from 'antd';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  PencilIcon,
  StopCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  useLeaveType,
  useDeleteLeaveType,
  useActivateLeaveType,
  useDeactivateLeaveType,
} from '@/lib/api/hooks/useHR';

const { Title, Text, Paragraph } = Typography;

export default function LeaveTypeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: leaveType, isLoading, error } = useLeaveType(id);
  const deleteLeaveType = useDeleteLeaveType();
  const activateLeaveType = useActivateLeaveType();
  const deactivateLeaveType = useDeactivateLeaveType();

  const handleDelete = () => {
    if (!leaveType) return;
    Modal.confirm({
      title: 'İzin Türünü Sil',
      content: `"${leaveType.name}" izin türünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteLeaveType.mutateAsync(id);
          router.push('/hr/leave-types');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async () => {
    if (!leaveType) return;
    try {
      if (leaveType.isActive) {
        await deactivateLeaveType.mutateAsync(id);
      } else {
        await activateLeaveType.mutateAsync(id);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !leaveType) {
    return (
      <div className="p-6">
        <Empty description="İzin türü bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/leave-types')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Space>
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push('/hr/leave-types')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              {leaveType.name}
            </Title>
            <Space>
              <Text type="secondary">{leaveType.code}</Text>
              <Tag color={leaveType.isActive ? 'green' : 'default'}>
                {leaveType.isActive ? 'Aktif' : 'Pasif'}
              </Tag>
              {leaveType.isPaid && <Tag color="blue">Ücretli</Tag>}
            </Space>
          </div>
        </Space>
        <Space>
          <Button
            icon={leaveType.isActive ? <StopCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
            onClick={handleToggleActive}
          >
            {leaveType.isActive ? 'Pasifleştir' : 'Aktifleştir'}
          </Button>
          <Button icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/leave-types/${id}/edit`)}>
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
                  title="Varsayılan Gün"
                  value={leaveType.defaultDays || 0}
                  suffix="gün"
                  prefix={<CalendarIcon className="w-4 h-4" />}
                  valueStyle={{ color: '#7c3aed' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Ücret Durumu"
                  value={leaveType.isPaid ? 'Ücretli' : 'Ücretsiz'}
                  valueStyle={{ color: leaveType.isPaid ? '#52c41a' : '#faad14', fontSize: 20 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Onay Gerekli"
                  value={leaveType.requiresApproval ? 'Evet' : 'Hayır'}
                  valueStyle={{ color: leaveType.requiresApproval ? '#1890ff' : '#8c8c8c', fontSize: 20 }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Details */}
        <Col xs={24} lg={16}>
          <Card title="İzin Türü Bilgileri">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="İzin Türü Adı">{leaveType.name}</Descriptions.Item>
              <Descriptions.Item label="İzin Türü Kodu">{leaveType.code}</Descriptions.Item>
              <Descriptions.Item label="Açıklama">{leaveType.description || '-'}</Descriptions.Item>
              <Descriptions.Item label="Varsayılan Gün Sayısı">
                {leaveType.defaultDays || 0} gün
              </Descriptions.Item>
              <Descriptions.Item label="Ücretli İzin">
                <Tag color={leaveType.isPaid ? 'green' : 'default'}>
                  {leaveType.isPaid ? 'Evet' : 'Hayır'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Onay Gerekli">
                <Tag color={leaveType.requiresApproval ? 'blue' : 'default'}>
                  {leaveType.requiresApproval ? 'Evet' : 'Hayır'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={leaveType.isActive ? 'green' : 'default'}>
                  {leaveType.isActive ? 'Aktif' : 'Pasif'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
