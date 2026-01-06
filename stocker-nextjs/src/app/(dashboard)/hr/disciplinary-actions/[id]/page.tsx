'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Descriptions, Tag, Row, Col } from 'antd';
import {
  ExclamationTriangleIcon,
  PencilIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useDisciplinaryAction } from '@/lib/api/hooks/useHR';
import { DetailPageLayout, Badge } from '@/components/patterns';
import { Button } from '@/components/primitives';

const statusColors: Record<string, string> = {
  'Draft': 'default',
  'UnderInvestigation': 'processing',
  'PendingReview': 'warning',
  'Approved': 'success',
  'Implemented': 'success',
  'Appealed': 'orange',
  'Overturned': 'error',
  'Closed': 'default',
};

const statusBadgeVariant: Record<string, 'neutral' | 'info' | 'success' | 'warning' | 'error'> = {
  'Draft': 'neutral',
  'UnderInvestigation': 'info',
  'PendingReview': 'warning',
  'Approved': 'success',
  'Implemented': 'success',
  'Appealed': 'warning',
  'Overturned': 'error',
  'Closed': 'neutral',
};

const severityColors: Record<string, string> = {
  'Minor': 'blue',
  'Moderate': 'orange',
  'Major': 'red',
  'Critical': 'magenta',
};

const severityBadgeVariant: Record<string, 'neutral' | 'info' | 'success' | 'warning' | 'error'> = {
  'Minor': 'info',
  'Moderate': 'warning',
  'Major': 'error',
  'Critical': 'error',
};

export default function DisciplinaryActionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: action, isLoading, isError } = useDisciplinaryAction(id);

  return (
    <DetailPageLayout
      title="Disiplin Islemi Detayi"
      subtitle={action?.employeeName}
      backPath="/hr/disciplinary-actions"
      icon={<ExclamationTriangleIcon className="w-5 h-5 text-white" />}
      iconBgColor="bg-red-600"
      isLoading={isLoading}
      isError={isError || !action}
      errorMessage="Disiplin Islemi Bulunamadi"
      errorDescription="Istenen disiplin islemi bulunamadi veya bir hata olustu."
      statusBadge={
        action?.status && (
          <Badge variant={statusBadgeVariant[action.status] || 'neutral'} dot>
            {action.status}
          </Badge>
        )
      }
      actions={
        <Button
          variant="secondary"
          size="sm"
          icon={<PencilIcon className="w-4 h-4" />}
          onClick={() => router.push(`/hr/disciplinary-actions/${id}/edit`)}
        >
          Duzenle
        </Button>
      }
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
              borderRadius: '16px',
              border: 'none',
            }}
            styles={{ body: { padding: '40px 20px', textAlign: 'center' } }}
          >
            <ExclamationTriangleIcon className="w-16 h-16 text-white/90 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-white/90">{action?.employeeName}</h3>
            <p className="text-sm text-white/60">{action?.actionType}</p>
            <div className="mt-4 space-x-2">
              <Tag color={statusColors[action?.status || '']}>{action?.status}</Tag>
              <Tag color={severityColors[action?.severityLevel || '']}>{action?.severityLevel}</Tag>
            </div>
          </Card>

          {action?.investigatorName && (
            <Card className="mt-4" title="Sorusturmaci">
              <p className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                {action.investigatorName}
              </p>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Genel Bilgiler">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Calisan">{action?.employeeName}</Descriptions.Item>
              <Descriptions.Item label="Islem Turu">{action?.actionType}</Descriptions.Item>
              <Descriptions.Item label="Siddet">
                <Tag color={severityColors[action?.severityLevel || '']}>{action?.severityLevel}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusColors[action?.status || '']}>{action?.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Olay Tarihi">
                {action?.incidentDate ? new Date(action.incidentDate).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Yaptirim Baslangic">
                {action?.sanctionStartDate ? new Date(action.sanctionStartDate).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Yaptirim Bitis">
                {action?.sanctionEndDate ? new Date(action.sanctionEndDate).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Ihlal Edilen Politika">{action?.violatedPolicy || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>

          {action?.incidentDescription && (
            <Card title="Olay Aciklamasi" className="mt-4">
              <p>{action.incidentDescription}</p>
            </Card>
          )}

          {action?.investigationFindings && (
            <Card title="Sorusturma Bulgulari" className="mt-4">
              <p>{action.investigationFindings}</p>
            </Card>
          )}

          {action?.defenseText && (
            <Card title="Calisan Savunmasi" className="mt-4">
              <p>{action.defenseText}</p>
            </Card>
          )}

          {action?.appliedSanction && (
            <Card title="Alinan Aksiyonlar" className="mt-4">
              <p>{action.appliedSanction}</p>
              {action.sanctionDetails && <p className="mt-2 text-gray-500">{action.sanctionDetails}</p>}
            </Card>
          )}

          {action?.internalNotes && (
            <Card title="Notlar" className="mt-4">
              <p>{action.internalNotes}</p>
            </Card>
          )}
        </Col>
      </Row>
    </DetailPageLayout>
  );
}
