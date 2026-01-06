'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Descriptions, Tag, Row, Col } from 'antd';
import {
  ExclamationCircleIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useGrievance } from '@/lib/api/hooks/useHR';
import { DetailPageLayout, Badge } from '@/components/patterns';
import { Button } from '@/components/primitives';

const statusColors: Record<string, string> = {
  'Open': 'processing',
  'UnderReview': 'warning',
  'Investigating': 'orange',
  'PendingResolution': 'gold',
  'Resolved': 'success',
  'Closed': 'default',
  'Escalated': 'red',
  'Withdrawn': 'default',
};

const statusBadgeVariant: Record<string, 'neutral' | 'info' | 'success' | 'warning' | 'error'> = {
  'Open': 'info',
  'UnderReview': 'warning',
  'Investigating': 'warning',
  'PendingResolution': 'warning',
  'Resolved': 'success',
  'Closed': 'neutral',
  'Escalated': 'error',
  'Withdrawn': 'neutral',
};

const priorityColors: Record<string, string> = {
  'Low': 'default',
  'Medium': 'blue',
  'High': 'orange',
  'Critical': 'red',
};

const priorityBadgeVariant: Record<string, 'neutral' | 'info' | 'success' | 'warning' | 'error'> = {
  'Low': 'neutral',
  'Medium': 'info',
  'High': 'warning',
  'Critical': 'error',
};

export default function GrievanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: grievance, isLoading, isError } = useGrievance(id);

  return (
    <DetailPageLayout
      title="Sikayet Detayi"
      subtitle={grievance?.subject}
      backPath="/hr/grievances"
      icon={<ExclamationCircleIcon className="w-5 h-5 text-white" />}
      iconBgColor="bg-purple-600"
      isLoading={isLoading}
      isError={isError || !grievance}
      errorMessage="Sikayet Bulunamadi"
      errorDescription="Istenen sikayet bulunamadi veya bir hata olustu."
      statusBadge={
        grievance?.status && (
          <Badge variant={statusBadgeVariant[grievance.status] || 'neutral'} dot>
            {grievance.status}
          </Badge>
        )
      }
      actions={
        <Button
          variant="secondary"
          size="sm"
          icon={<PencilIcon className="w-4 h-4" />}
          onClick={() => router.push(`/hr/grievances/${id}/edit`)}
        >
          Duzenle
        </Button>
      }
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              border: 'none',
            }}
            styles={{ body: { padding: '40px 20px', textAlign: 'center' } }}
          >
            <ExclamationCircleIcon className="w-16 h-16 text-white/90 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-white/90">{grievance?.subject}</h3>
            <p className="text-sm text-white/60">{grievance?.grievanceType}</p>
            <div className="mt-4 space-x-2">
              <Tag color={statusColors[grievance?.status || '']}>{grievance?.status}</Tag>
              <Tag color={priorityColors[grievance?.priority || '']}>{grievance?.priority}</Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Genel Bilgiler">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Sikayet Eden">{grievance?.complainantName}</Descriptions.Item>
              <Descriptions.Item label="Konu">{grievance?.subject}</Descriptions.Item>
              <Descriptions.Item label="Tur">{grievance?.grievanceType}</Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusColors[grievance?.status || '']}>{grievance?.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Oncelik">
                <Tag color={priorityColors[grievance?.priority || '']}>{grievance?.priority}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Basvuru Tarihi">
                {grievance?.filedDate ? new Date(grievance.filedDate).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Incelemeye Alan">{grievance?.assignedToName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Cozum Tarihi">
                {grievance?.resolutionDate ? new Date(grievance.resolutionDate).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          {grievance?.description && (
            <Card title="Aciklama" className="mt-4">
              <p>{grievance.description}</p>
            </Card>
          )}
          {grievance?.investigationNotes && (
            <Card title="Sorusturma Notlari" className="mt-4">
              <p>{grievance.investigationNotes}</p>
            </Card>
          )}
          {grievance?.resolution && (
            <Card title="Cozum" className="mt-4">
              <p>{grievance.resolution}</p>
            </Card>
          )}
        </Col>
      </Row>
    </DetailPageLayout>
  );
}
