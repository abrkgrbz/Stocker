'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Descriptions, Tag, Spin, Space, Progress, Timeline, Row, Col, Statistic } from 'antd';
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarIcon,
  PencilIcon,
  RocketLaunchIcon,
  TrophyIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useCareerPath } from '@/lib/api/hooks/useHR';

const statusColors: Record<string, string> = {
  'Draft': 'default',
  'Active': 'processing',
  'OnTrack': 'success',
  'AtRisk': 'warning',
  'Completed': 'success',
  'Cancelled': 'error',
  'OnHold': 'default',
};

export default function CareerPathDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: careerPath, isLoading } = useCareerPath(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!careerPath) {
    return (
      <div className="p-6">
        <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()}>
          Geri
        </Button>
        <div className="mt-4">Kariyer plani bulunamadi.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Kariyer Plani Detayi
              </h1>
              <p className="text-sm text-gray-400 m-0">{careerPath.employeeName}</p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={() => router.push(`/hr/career-paths/${id}/edit`)}
            style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
          >
            Duzenle
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            {/* Visual Card */}
            <Card
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '16px',
                border: 'none',
              }}
              bodyStyle={{ padding: '40px 20px', textAlign: 'center' }}
            >
              <RocketLaunchIcon className="w-16 h-16 text-white/90" />
              <h3 className="mt-4 text-lg font-medium text-white/90">
                {careerPath.employeeName}
              </h3>
              <p className="text-sm text-white/60">
                {careerPath.currentPositionName} &rarr; {careerPath.targetPositionName}
              </p>
              <Tag color={statusColors[careerPath.status]} className="mt-4">
                {careerPath.status}
              </Tag>
            </Card>

            {/* Progress Card */}
            <Card className="mt-4">
              <Statistic
                title="Ilerleme"
                value={careerPath.progressPercentage}
                suffix="%"
                prefix={<TrophyIcon className="w-4 h-4" />}
              />
              <Progress
                percent={careerPath.progressPercentage}
                status={careerPath.progressPercentage >= 100 ? 'success' : 'active'}
                className="mt-4"
              />
            </Card>

            {/* Quick Stats */}
            <Card className="mt-4">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Hazirlik Puani"
                    value={careerPath.readinessScore || 0}
                    prefix={<BookOpenIcon className="w-4 h-4" />}
                    suffix="%"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Seviye"
                    value={`${careerPath.currentLevel || 0} → ${careerPath.targetLevel || 0}`}
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
                <Descriptions.Item label="Calisan">{careerPath.employeeName}</Descriptions.Item>
                <Descriptions.Item label="Mevcut Pozisyon">{careerPath.currentPositionName}</Descriptions.Item>
                <Descriptions.Item label="Hedef Pozisyon">{careerPath.targetPositionName}</Descriptions.Item>
                <Descriptions.Item label="Mentor">{careerPath.mentorName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Baslangic Tarihi">
                  {careerPath.startDate ? new Date(careerPath.startDate).toLocaleDateString('tr-TR') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Hedef Tarih">
                  {careerPath.expectedTargetDate ? new Date(careerPath.expectedTargetDate).toLocaleDateString('tr-TR') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Kariyer Yolu">{careerPath.careerTrack || '-'}</Descriptions.Item>
                <Descriptions.Item label="Durum">
                  <Tag color={statusColors[careerPath.status]}>{careerPath.status}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Development Areas */}
            {careerPath.developmentAreas && (
              <Card title="Gelisim Alanlari" className="mt-4">
                <p>{careerPath.developmentAreas}</p>
              </Card>
            )}

            {/* Notes */}
            {careerPath.notes && (
              <Card title="Notlar" className="mt-4">
                <p>{careerPath.notes}</p>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
