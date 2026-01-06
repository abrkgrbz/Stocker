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
      title: 'Izin Turunu Sil',
      content: `"${leaveType.name}" izin turunu silmek istediginizden emin misiniz? Bu islem geri alinamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
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

  return (
    <DetailPageLayout
      title={leaveType?.name || 'Izin Turu Detayi'}
      subtitle={leaveType?.code}
      backPath="/hr/leave-types"
      icon={<DocumentTextIcon className="w-6 h-6 text-white" />}
      iconBgColor="bg-emerald-600"
      statusBadge={
        leaveType && (
          <div className="flex items-center gap-2">
            <Badge variant={leaveType.isActive ? 'success' : 'neutral'} dot>
              {leaveType.isActive ? 'Aktif' : 'Pasif'}
            </Badge>
            {leaveType.isPaid && (
              <Badge variant="info" dot>Ucretli</Badge>
            )}
          </div>
        )
      }
      actions={
        leaveType && (
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={leaveType.isActive ? <StopCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
              onClick={handleToggleActive}
            >
              {leaveType.isActive ? 'Pasiflestir' : 'Aktiflestir'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/hr/leave-types/${id}/edit`)}
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
      isError={!!error || (!isLoading && !leaveType)}
      errorMessage="Izin Turu Bulunamadi"
      errorDescription="Istenen izin turu bulunamadi veya bir hata olustu."
    >
      {leaveType && (
        <Row gutter={[24, 24]}>
          {/* Stats */}
          <Col xs={24}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Varsayilan Gun"
                    value={leaveType.defaultDays || 0}
                    suffix="gun"
                    prefix={<CalendarIcon className="w-4 h-4" />}
                    valueStyle={{ color: '#7c3aed' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Ucret Durumu"
                    value={leaveType.isPaid ? 'Ucretli' : 'Ucretsiz'}
                    valueStyle={{ color: leaveType.isPaid ? '#52c41a' : '#faad14', fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Onay Gerekli"
                    value={leaveType.requiresApproval ? 'Evet' : 'Hayir'}
                    valueStyle={{ color: leaveType.requiresApproval ? '#1890ff' : '#8c8c8c', fontSize: 20 }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>

          {/* Details */}
          <Col xs={24} lg={16}>
            <Card title="Izin Turu Bilgileri">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Izin Turu Adi">{leaveType.name}</Descriptions.Item>
                <Descriptions.Item label="Izin Turu Kodu">{leaveType.code}</Descriptions.Item>
                <Descriptions.Item label="Aciklama">{leaveType.description || '-'}</Descriptions.Item>
                <Descriptions.Item label="Varsayilan Gun Sayisi">
                  {leaveType.defaultDays || 0} gun
                </Descriptions.Item>
                <Descriptions.Item label="Ucretli Izin">
                  <Tag color={leaveType.isPaid ? 'green' : 'default'}>
                    {leaveType.isPaid ? 'Evet' : 'Hayir'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Onay Gerekli">
                  <Tag color={leaveType.requiresApproval ? 'blue' : 'default'}>
                    {leaveType.requiresApproval ? 'Evet' : 'Hayir'}
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
      )}
    </DetailPageLayout>
  );
}
