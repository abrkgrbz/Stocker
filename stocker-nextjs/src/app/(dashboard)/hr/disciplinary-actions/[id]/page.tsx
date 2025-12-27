'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Descriptions, Tag, Spin, Row, Col, Timeline } from 'antd';
import {
  ArrowLeftIcon,
  CalendarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useDisciplinaryAction } from '@/lib/api/hooks/useHR';

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

const severityColors: Record<string, string> = {
  'Minor': 'blue',
  'Moderate': 'orange',
  'Major': 'red',
  'Critical': 'magenta',
};

export default function DisciplinaryActionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: action, isLoading } = useDisciplinaryAction(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!action) {
    return (
      <div className="p-6">
        <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()}>Geri</Button>
        <div className="mt-4">Disiplin islemi bulunamadi.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
              <h1 className="text-xl font-semibold text-gray-900 m-0">Disiplin Islemi Detayi</h1>
              <p className="text-sm text-gray-400 m-0">{action.employeeName}</p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={() => router.push(`/hr/disciplinary-actions/${id}/edit`)}
            style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
          >
            Duzenle
          </Button>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                borderRadius: '16px',
                border: 'none',
              }}
              bodyStyle={{ padding: '40px 20px', textAlign: 'center' }}
            >
              <ExclamationTriangleIcon className="w-16 h-16 text-white/90" />
              <h3 className="mt-4 text-lg font-medium text-white/90">{action.employeeName}</h3>
              <p className="text-sm text-white/60">{action.actionType}</p>
              <div className="mt-4 space-x-2">
                <Tag color={statusColors[action.status]}>{action.status}</Tag>
                <Tag color={severityColors[action.severityLevel]}>{action.severityLevel}</Tag>
              </div>
            </Card>

            {action.investigatorName && (
              <Card className="mt-4" title="Sorusturmaci">
                <p><UserIcon className="w-4 h-4 mr-2" />{action.investigatorName}</p>
              </Card>
            )}
          </Col>

          <Col xs={24} lg={16}>
            <Card title="Genel Bilgiler">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Calisan">{action.employeeName}</Descriptions.Item>
                <Descriptions.Item label="Islem Turu">{action.actionType}</Descriptions.Item>
                <Descriptions.Item label="Siddet">
                  <Tag color={severityColors[action.severityLevel]}>{action.severityLevel}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Durum">
                  <Tag color={statusColors[action.status]}>{action.status}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Olay Tarihi">
                  {action.incidentDate ? new Date(action.incidentDate).toLocaleDateString('tr-TR') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Yaptirim Baslangic">
                  {action.sanctionStartDate ? new Date(action.sanctionStartDate).toLocaleDateString('tr-TR') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Yaptirim Bitis">
                  {action.sanctionEndDate ? new Date(action.sanctionEndDate).toLocaleDateString('tr-TR') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Ihlal Edilen Politika">{action.violatedPolicy || '-'}</Descriptions.Item>
              </Descriptions>
            </Card>

            {action.incidentDescription && (
              <Card title="Olay Aciklamasi" className="mt-4">
                <p>{action.incidentDescription}</p>
              </Card>
            )}

            {action.investigationFindings && (
              <Card title="Sorusturma Bulgulari" className="mt-4">
                <p>{action.investigationFindings}</p>
              </Card>
            )}

            {action.defenseText && (
              <Card title="Calisan Savunmasi" className="mt-4">
                <p>{action.defenseText}</p>
              </Card>
            )}

            {action.appliedSanction && (
              <Card title="Alinan Aksiyonlar" className="mt-4">
                <p>{action.appliedSanction}</p>
                {action.sanctionDetails && <p className="mt-2 text-gray-500">{action.sanctionDetails}</p>}
              </Card>
            )}

            {action.internalNotes && (
              <Card title="Notlar" className="mt-4">
                <p>{action.internalNotes}</p>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
