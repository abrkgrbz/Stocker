'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tag, Modal, Row, Col, Card, Statistic, Descriptions, Rate } from 'antd';
import { DetailPageLayout } from '@/components/patterns';
import { Button } from '@/components/primitives';
import {
  PencilIcon,
  StarIcon,
  TrashIcon,
  ChartBarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { usePerformanceReview, useDeletePerformanceReview } from '@/lib/api/hooks/useHR';
import dayjs from 'dayjs';

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
      title: 'Performans Degerlendirmesini Sil',
      content: 'Bu degerlendirmeyi silmek istediginizden emin misiniz? Bu islem geri alinamaz.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
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
      Completed: { color: 'green', text: 'Tamamlandi' },
      Cancelled: { color: 'red', text: 'Iptal' },
    };
    return statusMap[status || ''] || { color: 'default', text: status || '-' };
  };

  const statusConfig = getStatusConfig(review?.status);

  return (
    <DetailPageLayout
      title="Performans Degerlendirme Detayi"
      subtitle={`${review?.employeeName || `Calisan #${review?.employeeId}`} - ${review?.reviewPeriod || ''}`}
      backPath="/hr/performance"
      icon={<ChartBarIcon className="w-5 h-5 text-white" />}
      iconBgColor="bg-amber-600"
      statusBadge={
        review && (
          <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
        )
      }
      actions={
        <>
          <Button
            variant="secondary"
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={() => router.push(`/hr/performance/${id}/edit`)}
            disabled={review?.status === 'Completed'}
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
      isError={!!error || (!isLoading && !review)}
      errorMessage="Degerlendirme Bulunamadi"
      errorDescription="Istenen degerlendirme bulunamadi veya bir hata olustu."
    >
      <Row gutter={[24, 24]}>
        {/* Stats */}
        <Col xs={24}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Genel Puan"
                  value={review?.overallScore || 0}
                  prefix={<StarIcon className="w-4 h-4" />}
                  suffix="/ 10"
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <div className="text-center">
                  <span className="text-slate-500 block mb-2">Yildiz Puani</span>
                  <Rate disabled value={(review?.overallScore || 0) / 2} allowHalf />
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Donem"
                  value={review?.reviewPeriod || '-'}
                  valueStyle={{ color: '#7c3aed', fontSize: 16 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Tarih"
                  value={review?.reviewDate ? dayjs(review.reviewDate).format('DD.MM.YYYY') : '-'}
                  valueStyle={{ color: '#1890ff', fontSize: 16 }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Details */}
        <Col xs={24} lg={12}>
          <Card title="Degerlendirme Bilgileri">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Calisan">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  {review?.employeeName || `Calisan #${review?.employeeId}`}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Degerlendiren">
                {review?.reviewerName || `Kullanici #${review?.reviewerId}`}
              </Descriptions.Item>
              <Descriptions.Item label="Tarih">
                {review?.reviewDate ? dayjs(review.reviewDate).format('DD MMMM YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Donem">{review?.reviewPeriod}</Descriptions.Item>
              <Descriptions.Item label="Genel Puan">
                <div className="flex items-center gap-2">
                  <Rate disabled value={(review?.overallScore || 0) / 2} allowHalf style={{ fontSize: 14 }} />
                  <span>({review?.overallScore?.toFixed(1) || '-'}/10)</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Strengths */}
        {review?.strengths && (
          <Col xs={24} lg={12}>
            <Card title="Guclu Yonler">
              <p className="text-slate-600">{review.strengths}</p>
            </Card>
          </Col>
        )}

        {/* Areas for Improvement */}
        {review?.areasForImprovement && (
          <Col xs={24} lg={12}>
            <Card title="Gelisim Alanlari">
              <p className="text-slate-600">{review.areasForImprovement}</p>
            </Card>
          </Col>
        )}

        {/* Development Plan */}
        {review?.developmentPlan && (
          <Col xs={24} lg={12}>
            <Card title="Gelisim Plani">
              <p className="text-slate-600">{review.developmentPlan}</p>
            </Card>
          </Col>
        )}

        {/* Manager Comments */}
        {review?.managerComments && (
          <Col xs={24}>
            <Card title="Yonetici Yorumlari">
              <p className="text-slate-600">{review.managerComments}</p>
            </Card>
          </Col>
        )}
      </Row>
    </DetailPageLayout>
  );
}
