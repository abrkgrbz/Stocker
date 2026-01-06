'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Modal,
} from 'antd';
import { DetailPageLayout, Badge } from '@/components/patterns';
import { Button } from '@/components/primitives';
import {
  CheckCircleIcon,
  ClockIcon,
  PencilIcon,
  StopCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  useShift,
  useDeleteShift,
  useActivateShift,
  useDeactivateShift,
} from '@/lib/api/hooks/useHR';

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
      title: 'Vardiyayi Sil',
      content: `"${shift.name}" vardiyasini silmek istediginizden emin misiniz? Bu islem geri alinamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
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

  return (
    <DetailPageLayout
      title={shift?.name || 'Vardiya Detayi'}
      subtitle={shift?.code}
      backPath="/hr/shifts"
      icon={<ClockIcon className="w-6 h-6 text-white" />}
      iconBgColor="bg-blue-600"
      statusBadge={
        shift && (
          <Badge variant={shift.isActive ? 'success' : 'neutral'} dot>
            {shift.isActive ? 'Aktif' : 'Pasif'}
          </Badge>
        )
      }
      actions={
        shift && (
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={shift.isActive ? <StopCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
              onClick={handleToggleActive}
            >
              {shift.isActive ? 'Pasiflestir' : 'Aktiflestir'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/hr/shifts/${id}/edit`)}
            >
              Duzenle
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={handleDelete}
            >
              Sil
            </Button>
          </>
        )
      }
      isLoading={isLoading}
      isError={!!error || (!isLoading && !shift)}
      errorMessage="Vardiya Bulunamadi"
      errorDescription="Istenen vardiya bulunamadi veya bir hata olustu."
    >
      {shift && (
        <Row gutter={[24, 24]}>
          {/* Stats */}
          <Col xs={24}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Baslangic"
                    value={formatTime(shift.startTime)}
                    prefix={<ClockIcon className="w-4 h-4" />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Bitis"
                    value={formatTime(shift.endTime)}
                    prefix={<ClockIcon className="w-4 h-4" />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Toplam Sure"
                    value={calculateDuration()}
                    valueStyle={{ color: '#7c3aed', fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Calisma Suresi"
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
                <Descriptions.Item label="Vardiya Adi">{shift.name}</Descriptions.Item>
                <Descriptions.Item label="Vardiya Kodu">{shift.code}</Descriptions.Item>
                <Descriptions.Item label="Aciklama">{shift.description || '-'}</Descriptions.Item>
                <Descriptions.Item label="Baslangic Saati">{formatTime(shift.startTime)}</Descriptions.Item>
                <Descriptions.Item label="Bitis Saati">{formatTime(shift.endTime)}</Descriptions.Item>
                <Descriptions.Item label="Mola Suresi">
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
      )}
    </DetailPageLayout>
  );
}
