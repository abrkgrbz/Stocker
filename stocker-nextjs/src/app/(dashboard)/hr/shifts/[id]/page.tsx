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
  Empty,
  Modal,
  Spin,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilIcon,
  StopCircleIcon,
  StopIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  useShift,
  useDeleteShift,
  useActivateShift,
  useDeactivateShift,
} from '@/lib/api/hooks/useHR';

const { Title, Text } = Typography;

export default function ShiftDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: shift, isLoading, error } = useShift(id);
  const deleteShift = useDeleteShift();
  const activateShift = useActivateShift();
  const deactivateShift = useDeactivateShift();

  const handleDelete = () => {
    if (!shift) return;
    Modal.confirm({
      title: 'Vardiyayı Sil',
      content: `"${shift.name}" vardiyasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteShift.mutateAsync(id);
          router.push('/hr/shifts');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async () => {
    if (!shift) return;
    try {
      if (shift.isActive) {
        await deactivateShift.mutateAsync(id);
      } else {
        await activateShift.mutateAsync(id);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '-';
    return time.substring(0, 5);
  };

  // Calculate shift duration
  const calculateDuration = () => {
    if (!shift?.startTime || !shift?.endTime) return '-';
    const [startH, startM] = shift.startTime.split(':').map(Number);
    const [endH, endM] = shift.endTime.split(':').map(Number);
    let duration = (endH * 60 + endM) - (startH * 60 + startM);
    if (duration < 0) duration += 24 * 60; // Handle overnight shifts
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours} saat ${minutes > 0 ? `${minutes} dk` : ''}`;
  };

  // Calculate working hours (excluding break)
  const calculateWorkingHours = () => {
    if (!shift?.startTime || !shift?.endTime) return '-';
    const [startH, startM] = shift.startTime.split(':').map(Number);
    const [endH, endM] = shift.endTime.split(':').map(Number);
    let duration = (endH * 60 + endM) - (startH * 60 + startM);
    if (duration < 0) duration += 24 * 60;
    duration -= shift.breakDurationMinutes || 0;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours} saat ${minutes > 0 ? `${minutes} dk` : ''}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !shift) {
    return (
      <div className="p-6">
        <Empty description="Vardiya bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/shifts')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Space>
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push('/hr/shifts')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              {shift.name}
            </Title>
            <Space>
              <Text type="secondary">{shift.code}</Text>
              <Tag color={shift.isActive ? 'green' : 'default'}>
                {shift.isActive ? 'Aktif' : 'Pasif'}
              </Tag>
            </Space>
          </div>
        </Space>
        <Space>
          <Button
            icon={shift.isActive ? <StopCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
            onClick={handleToggleActive}
          >
            {shift.isActive ? 'Pasifleştir' : 'Aktifleştir'}
          </Button>
          <Button icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/shifts/${id}/edit`)}>
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
                  title="Başlangıç"
                  value={formatTime(shift.startTime)}
                  prefix={<ClockIcon className="w-4 h-4" />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Bitiş"
                  value={formatTime(shift.endTime)}
                  prefix={<ClockIcon className="w-4 h-4" />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Toplam Süre"
                  value={calculateDuration()}
                  valueStyle={{ color: '#7c3aed', fontSize: 20 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Çalışma Süresi"
                  value={calculateWorkingHours()}
                  valueStyle={{ color: '#faad14', fontSize: 20 }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Details */}
        <Col xs={24} lg={16}>
          <Card title="Vardiya Bilgileri">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Vardiya Adı">{shift.name}</Descriptions.Item>
              <Descriptions.Item label="Vardiya Kodu">{shift.code}</Descriptions.Item>
              <Descriptions.Item label="Açıklama">{shift.description || '-'}</Descriptions.Item>
              <Descriptions.Item label="Başlangıç Saati">{formatTime(shift.startTime)}</Descriptions.Item>
              <Descriptions.Item label="Bitiş Saati">{formatTime(shift.endTime)}</Descriptions.Item>
              <Descriptions.Item label="Mola Süresi">
                {shift.breakDurationMinutes ? `${shift.breakDurationMinutes} dakika` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={shift.isActive ? 'green' : 'default'}>
                  {shift.isActive ? 'Aktif' : 'Pasif'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
