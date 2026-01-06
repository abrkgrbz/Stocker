'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Descriptions, Tag, Progress, Row, Col, Statistic } from 'antd';
import {
  BookOpenIcon,
  CalendarIcon,
  PencilIcon,
  RocketLaunchIcon,
  TrashIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { useCareerPath } from '@/lib/api/hooks/useHR';
import { DetailPageLayout, Badge } from '@/components/patterns';
import { Button } from '@/components/primitives';

const statusColors: Record<string, string> = {
  'Draft': 'default',
  'Active': 'processing',
  'OnTrack': 'success',
  'AtRisk': 'warning',
  'Completed': 'success',
  'Cancelled': 'error',
  'OnHold': 'default',
};

const statusBadgeVariant: Record<string, 'neutral' | 'info' | 'success' | 'warning' | 'error'> = {
  'Draft': 'neutral',
  'Active': 'info',
  'OnTrack': 'success',
  'AtRisk': 'warning',
  'Completed': 'success',
  'Cancelled': 'error',
  'OnHold': 'neutral',
};

export default function CareerPathDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: careerPath, isLoading, isError } = useCareerPath(id);

  return (
    <DetailPageLayout
      title="Kariyer Plani Detayi"
      subtitle={careerPath?.employeeName}
      backPath="/hr/career-paths"
      icon={<RocketLaunchIcon className="w-5 h-5 text-white" />}
      iconBgColor="bg-pink-600"
      isLoading={isLoading}
      isError={isError || !careerPath}
      errorMessage="Kariyer Plani Bulunamadi"
      errorDescription="Istenen kariyer plani bulunamadi veya bir hata olustu."
      statusBadge={
        careerPath?.status && (
          <Badge variant={statusBadgeVariant[careerPath.status] || 'neutral'} dot>
            {careerPath.status}
          </Badge>
        )
      }
      actions={
        <>
          <Button
            variant="secondary"
            size="sm"
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={() => router.push(`/hr/career-paths/${id}/edit`)}
          >
            Duzenle
          </Button>
        </>
      }
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          {/* Visual Card */}
          <Card
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '16px',
              border: 'none',
            }}
            styles={{ body: { padding: '40px 20px', textAlign: 'center' } }}
          >
            <RocketLaunchIcon className="w-16 h-16 text-white/90 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-white/90">
              {careerPath?.employeeName}
            </h3>
            <p className="text-sm text-white/60">
              {careerPath?.currentPositionName} &rarr; {careerPath?.targetPositionName}
            </p>
            <Tag color={statusColors[careerPath?.status || '']} className="mt-4">
              {careerPath?.status}
            </Tag>
          </Card>

          {/* Progress Card */}
          <Card className="mt-4">
            <Statistic
              title="Ilerleme"
              value={careerPath?.progressPercentage || 0}
              suffix="%"
              prefix={<TrophyIcon className="w-4 h-4" />}
            />
            <Progress
              percent={careerPath?.progressPercentage || 0}
              status={(careerPath?.progressPercentage || 0) >= 100 ? 'success' : 'active'}
              className="mt-4"
            />
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Hazirlik Puani"
                  value={careerPath?.readinessScore || 0}
                  prefix={<BookOpenIcon className="w-4 h-4" />}
                  suffix="%"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Seviye"
                  value={`${careerPath?.currentLevel || 0} → ${careerPath?.targetLevel || 0}`}
                  prefix={<CalendarIcon className="w-4 h-4" />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          {/* Details */}
          <Card title="Genel Bilgiler">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Calisan">{careerPath?.employeeName}</Descriptions.Item>
              <Descriptions.Item label="Mevcut Pozisyon">{careerPath?.currentPositionName}</Descriptions.Item>
              <Descriptions.Item label="Hedef Pozisyon">{careerPath?.targetPositionName}</Descriptions.Item>
              <Descriptions.Item label="Mentor">{careerPath?.mentorName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Baslangic Tarihi">
                {careerPath?.startDate ? new Date(careerPath.startDate).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Hedef Tarih">
                {careerPath?.expectedTargetDate ? new Date(careerPath.expectedTargetDate).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Kariyer Yolu">{careerPath?.careerTrack || '-'}</Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusColors[careerPath?.status || '']}>{careerPath?.status}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Development Areas */}
          {careerPath?.developmentAreas && (
            <Card title="Gelisim Alanlari" className="mt-4">
              <p>{careerPath.developmentAreas}</p>
            </Card>
          )}

          {/* Notes */}
          {careerPath?.notes && (
            <Card title="Notlar" className="mt-4">
              <p>{careerPath.notes}</p>
            </Card>
          )}
        </Col>
      </Row>
    </DetailPageLayout>
  );
}
