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
  Rate,
} from 'antd';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  TrophyIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { usePerformanceReview, useDeletePerformanceReview } from '@/lib/api/hooks/useHR';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export default function PerformanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: review, isLoading, error } = usePerformanceReview(id);
  const deleteReview = useDeletePerformanceReview();

  const handleDelete = () => {
    if (!review) return;
    Modal.confirm({
      title: 'Performans Değerlendirmesini Sil',
      content: 'Bu değerlendirmeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteReview.mutateAsync(id);
          router.push('/hr/performance');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const getStatusConfig = (status?: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      Draft: { color: 'default', text: 'Taslak' },
      InProgress: { color: 'blue', text: 'Devam Ediyor' },
      Completed: { color: 'green', text: 'Tamamlandı' },
      Cancelled: { color: 'red', text: 'İptal' },
    };
    return statusMap[status || ''] || { color: 'default', text: status || '-' };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="p-6">
        <Empty description="Değerlendirme bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/performance')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(review.status);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Space>
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push('/hr/performance')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Performans Değerlendirme Detayı
            </Title>
            <Space>
              <Text type="secondary">
                {review.employeeName || `Çalışan #${review.employeeId}`}
              </Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">{review.reviewPeriod}</Text>
              <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
            </Space>
          </div>
        </Space>
        <Space>
          <Button
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={() => router.push(`/hr/performance/${id}/edit`)}
            disabled={review.status === 'Completed'}
          >
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
                  title="Genel Puan"
                  value={review.overallScore || 0}
                  prefix={<StarOutlined />}
                  suffix="/ 10"
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <div className="text-center">
                  <Text type="secondary" className="block mb-2">Yıldız Puanı</Text>
                  <Rate disabled value={(review.overallScore || 0) / 2} allowHalf />
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Dönem"
                  value={review.reviewPeriod || '-'}
                  valueStyle={{ color: '#7c3aed', fontSize: 16 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Tarih"
                  value={dayjs(review.reviewDate).format('DD.MM.YYYY')}
                  valueStyle={{ color: '#1890ff', fontSize: 16 }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Details */}
        <Col xs={24} lg={12}>
          <Card title="Değerlendirme Bilgileri">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Çalışan">
                <Space>
                  <UserIcon className="w-4 h-4" />
                  {review.employeeName || `Çalışan #${review.employeeId}`}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Değerlendiren">
                {review.reviewerName || `Kullanıcı #${review.reviewerId}`}
              </Descriptions.Item>
              <Descriptions.Item label="Tarih">
                {dayjs(review.reviewDate).format('DD MMMM YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Dönem">{review.reviewPeriod}</Descriptions.Item>
              <Descriptions.Item label="Genel Puan">
                <Space>
                  <Rate disabled value={(review.overallScore || 0) / 2} allowHalf style={{ fontSize: 14 }} />
                  <span>({review.overallScore?.toFixed(1) || '-'}/10)</span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Strengths */}
        {review.strengths && (
          <Col xs={24} lg={12}>
            <Card title="Güçlü Yönler">
              <Paragraph>{review.strengths}</Paragraph>
            </Card>
          </Col>
        )}

        {/* Areas for Improvement */}
        {review.areasForImprovement && (
          <Col xs={24} lg={12}>
            <Card title="Gelişim Alanları">
              <Paragraph>{review.areasForImprovement}</Paragraph>
            </Card>
          </Col>
        )}

        {/* Development Plan */}
        {review.developmentPlan && (
          <Col xs={24} lg={12}>
            <Card title="Gelişim Planı">
              <Paragraph>{review.developmentPlan}</Paragraph>
            </Card>
          </Col>
        )}

        {/* Manager Comments */}
        {review.managerComments && (
          <Col xs={24}>
            <Card title="Yönetici Yorumları">
              <Paragraph>{review.managerComments}</Paragraph>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}
