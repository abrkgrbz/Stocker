'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tag, Modal, Row, Col, Card, Statistic, Descriptions, Progress } from 'antd';
import { DetailPageLayout } from '@/components/patterns';
import { Button } from '@/components/primitives';
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CursorArrowRaysIcon,
  ExclamationCircleIcon,
  FlagIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { usePerformanceGoal, useDeletePerformanceGoal } from '@/lib/api/hooks/useHR';
import dayjs from 'dayjs';

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: goal, isLoading, error } = usePerformanceGoal(id);
  const deleteGoal = useDeletePerformanceGoal();

  const handleDelete = () => {
    if (!goal) return;
    Modal.confirm({
      title: 'Hedefi Sil',
      content: `"${goal.title}" hedefini silmek istediginizden emin misiniz? Bu islem geri alinamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
      onOk: async () => {
        try {
          await deleteGoal.mutateAsync(id);
          router.push('/hr/goals');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const getStatusConfig = (status?: string, isOverdue?: boolean) => {
    if (isOverdue && status !== 'Completed' && status !== 'Cancelled') {
      return { color: 'red', text: 'Gecikmis', icon: <ExclamationCircleIcon className="w-4 h-4" /> };
    }
    const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      NotStarted: { color: 'default', text: 'Baslamadi', icon: <ClockIcon className="w-4 h-4" /> },
      InProgress: { color: 'blue', text: 'Devam Ediyor', icon: <ClockIcon className="w-4 h-4" /> },
      Completed: { color: 'green', text: 'Tamamlandi', icon: <CheckCircleIcon className="w-4 h-4" /> },
      Cancelled: { color: 'red', text: 'Iptal', icon: <ExclamationCircleIcon className="w-4 h-4" /> },
    };
    return statusMap[status || ''] || { color: 'default', text: status || '-', icon: null };
  };

  const statusConfig = getStatusConfig(goal?.status, goal?.isOverdue);
  const daysRemaining = goal ? dayjs(goal.targetDate).diff(dayjs(), 'day') : 0;

  return (
    <DetailPageLayout
      title={goal?.title || 'Hedef'}
      subtitle={`${goal?.employeeName || ''} ${goal?.category ? `- ${goal.category}` : ''}`}
      backPath="/hr/goals"
      icon={<FlagIcon className="w-5 h-5 text-white" />}
      iconBgColor="bg-emerald-600"
      statusBadge={
        goal && (
          <Tag color={statusConfig.color} icon={statusConfig.icon}>
            {statusConfig.text}
          </Tag>
        )
      }
      actions={
        <>
          <Button
            variant="secondary"
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={() => router.push(`/hr/goals/${id}/edit`)}
            disabled={goal?.status === 'Completed'}
          >
            Duzenle
          </Button>
          <Button
            variant="danger"
            icon={<TrashIcon className="w-4 h-4" />}
            onClick={handleDelete}
          >
            Sil
          </Button>
        </>
      }
      isLoading={isLoading}
      isError={!!error || (!isLoading && !goal)}
      errorMessage="Hedef Bulunamadi"
      errorDescription="Istenen hedef bulunamadi veya bir hata olustu."
    >
      <Row gutter={[24, 24]}>
        {/* Progress Card */}
        <Col xs={24}>
          <Card>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={12}>
                <div className="text-center">
                  <Progress
                    type="circle"
                    percent={goal?.progressPercentage || 0}
                    size={150}
                    status={goal?.isOverdue ? 'exception' : undefined}
                    strokeColor={goal?.isOverdue ? '#ff4d4f' : '#7c3aed'}
                  />
                  <div className="mt-4">
                    <span className="text-slate-500">Ilerleme</span>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Baslangic"
                      value={goal?.startDate ? dayjs(goal.startDate).format('DD.MM.YYYY') : '-'}
                      prefix={<CalendarIcon className="w-4 h-4" />}
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Hedef Tarih"
                      value={goal?.targetDate ? dayjs(goal.targetDate).format('DD.MM.YYYY') : '-'}
                      prefix={<CursorArrowRaysIcon className="w-4 h-4" />}
                      valueStyle={{ fontSize: 16, color: goal?.isOverdue ? '#ff4d4f' : undefined }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Kalan Gun"
                      value={daysRemaining > 0 ? daysRemaining : 0}
                      suffix="gun"
                      valueStyle={{ color: daysRemaining < 0 ? '#ff4d4f' : daysRemaining < 7 ? '#faad14' : '#52c41a' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Agirlik"
                      value={goal?.weight || 1}
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Details */}
        <Col xs={24} lg={12}>
          <Card title="Hedef Bilgileri">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Calisan">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  {goal?.employeeName}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Kategori">{goal?.category || '-'}</Descriptions.Item>
              <Descriptions.Item label="Baslangic Tarihi">
                {goal?.startDate ? dayjs(goal.startDate).format('DD MMMM YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Hedef Tarihi">
                {goal?.targetDate ? dayjs(goal.targetDate).format('DD MMMM YYYY') : '-'}
              </Descriptions.Item>
              {goal?.completedDate && (
                <Descriptions.Item label="Tamamlanma Tarihi">
                  {dayjs(goal.completedDate).format('DD MMMM YYYY')}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Durum">
                <Tag color={statusConfig.color} icon={statusConfig.icon}>
                  {statusConfig.text}
                </Tag>
              </Descriptions.Item>
              {goal?.assignedByName && (
                <Descriptions.Item label="Atayan">{goal.assignedByName}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Metrics */}
        <Col xs={24} lg={12}>
          <Card title="Metrikler">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Olcum Kriteri">{goal?.metrics || '-'}</Descriptions.Item>
              <Descriptions.Item label="Hedef Deger">{goal?.targetValue || '-'}</Descriptions.Item>
              <Descriptions.Item label="Mevcut Deger">{goal?.currentValue || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Description */}
        {goal?.description && (
          <Col xs={24}>
            <Card title="Aciklama">
              <p className="text-slate-600">{goal.description}</p>
            </Card>
          </Col>
        )}

        {/* Notes */}
        {goal?.notes && (
          <Col xs={24}>
            <Card title="Notlar">
              <p className="text-slate-600">{goal.notes}</p>
            </Card>
          </Col>
        )}
      </Row>
    </DetailPageLayout>
  );
}
