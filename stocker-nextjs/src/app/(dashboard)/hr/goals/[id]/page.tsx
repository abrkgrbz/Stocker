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
  Progress,
} from 'antd';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CursorArrowRaysIcon,
  ExclamationCircleIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { usePerformanceGoal, useDeletePerformanceGoal } from '@/lib/api/hooks/useHR';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

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
      content: `"${goal.title}" hedefini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
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
      return { color: 'red', text: 'Gecikmiş', icon: <ExclamationCircleIcon className="w-4 h-4" /> };
    }
    const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      NotStarted: { color: 'default', text: 'Başlamadı', icon: <ClockIcon className="w-4 h-4" /> },
      InProgress: { color: 'blue', text: 'Devam Ediyor', icon: <ClockIcon className="w-4 h-4" /> },
      Completed: { color: 'green', text: 'Tamamlandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
      Cancelled: { color: 'red', text: 'İptal', icon: <ExclamationCircleIcon className="w-4 h-4" /> },
    };
    return statusMap[status || ''] || { color: 'default', text: status || '-', icon: null };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="p-6">
        <Empty description="Hedef bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/goals')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(goal.status, goal.isOverdue);
  const daysRemaining = dayjs(goal.targetDate).diff(dayjs(), 'day');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Space>
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push('/hr/goals')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              {goal.title}
            </Title>
            <Space>
              <Text type="secondary">{goal.employeeName}</Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">{goal.category || 'Genel'}</Text>
              <Tag color={statusConfig.color} icon={statusConfig.icon}>
                {statusConfig.text}
              </Tag>
            </Space>
          </div>
        </Space>
        <Space>
          <Button
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={() => router.push(`/hr/goals/${id}/edit`)}
            disabled={goal.status === 'Completed'}
          >
            Düzenle
          </Button>
          <Button danger icon={<TrashIcon className="w-4 h-4" />} onClick={handleDelete}>
            Sil
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Progress Card */}
        <Col xs={24}>
          <Card>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={12}>
                <div className="text-center">
                  <Progress
                    type="circle"
                    percent={goal.progressPercentage || 0}
                    size={150}
                    status={goal.isOverdue ? 'exception' : undefined}
                    strokeColor={goal.isOverdue ? '#ff4d4f' : '#7c3aed'}
                  />
                  <div className="mt-4">
                    <Text type="secondary">İlerleme</Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Başlangıç"
                      value={dayjs(goal.startDate).format('DD.MM.YYYY')}
                      prefix={<CalendarIcon className="w-4 h-4" />}
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Hedef Tarih"
                      value={dayjs(goal.targetDate).format('DD.MM.YYYY')}
                      prefix={<CursorArrowRaysIcon className="w-4 h-4" />}
                      valueStyle={{ fontSize: 16, color: goal.isOverdue ? '#ff4d4f' : undefined }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Kalan Gün"
                      value={daysRemaining > 0 ? daysRemaining : 0}
                      suffix="gün"
                      valueStyle={{ color: daysRemaining < 0 ? '#ff4d4f' : daysRemaining < 7 ? '#faad14' : '#52c41a' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Ağırlık"
                      value={goal.weight || 1}
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
              <Descriptions.Item label="Çalışan">
                <Space>
                  <UserIcon className="w-4 h-4" />
                  {goal.employeeName}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Kategori">{goal.category || '-'}</Descriptions.Item>
              <Descriptions.Item label="Başlangıç Tarihi">
                {dayjs(goal.startDate).format('DD MMMM YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Hedef Tarihi">
                {dayjs(goal.targetDate).format('DD MMMM YYYY')}
              </Descriptions.Item>
              {goal.completedDate && (
                <Descriptions.Item label="Tamamlanma Tarihi">
                  {dayjs(goal.completedDate).format('DD MMMM YYYY')}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Durum">
                <Tag color={statusConfig.color} icon={statusConfig.icon}>
                  {statusConfig.text}
                </Tag>
              </Descriptions.Item>
              {goal.assignedByName && (
                <Descriptions.Item label="Atayan">{goal.assignedByName}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Metrics */}
        <Col xs={24} lg={12}>
          <Card title="Metrikler">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Ölçüm Kriteri">{goal.metrics || '-'}</Descriptions.Item>
              <Descriptions.Item label="Hedef Değer">{goal.targetValue || '-'}</Descriptions.Item>
              <Descriptions.Item label="Mevcut Değer">{goal.currentValue || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Description */}
        {goal.description && (
          <Col xs={24}>
            <Card title="Açıklama">
              <Paragraph>{goal.description}</Paragraph>
            </Card>
          </Col>
        )}

        {/* Notes */}
        {goal.notes && (
          <Col xs={24}>
            <Card title="Notlar">
              <Paragraph>{goal.notes}</Paragraph>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}
