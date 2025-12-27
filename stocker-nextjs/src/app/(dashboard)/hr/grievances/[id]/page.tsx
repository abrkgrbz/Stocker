'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Descriptions, Tag, Spin, Row, Col } from 'antd';
import {
  ArrowLeftIcon,
  ExclamationCircleIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useGrievance } from '@/lib/api/hooks/useHR';

const statusColors: Record<string, string> = { 'Open': 'processing', 'UnderReview': 'warning', 'Investigating': 'orange', 'PendingResolution': 'gold', 'Resolved': 'success', 'Closed': 'default', 'Escalated': 'red', 'Withdrawn': 'default' };
const priorityColors: Record<string, string> = { 'Low': 'default', 'Medium': 'blue', 'High': 'orange', 'Critical': 'red' };

export default function GrievanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: grievance, isLoading } = useGrievance(id);

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;
  if (!grievance) return <div className="p-6"><Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()}>Geri</Button><div className="mt-4">Sikayet bulunamadi.</div></div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 px-8 py-4" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()} type="text" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Sikayet Detayi</h1>
              <p className="text-sm text-gray-400 m-0">{grievance.subject}</p>
            </div>
          </div>
          <Button type="primary" icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/grievances/${id}/edit`)} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Duzenle</Button>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', border: 'none' }} bodyStyle={{ padding: '40px 20px', textAlign: 'center' }}>
              <ExclamationCircleIcon className="w-16 h-16 text-white/90" />
              <h3 className="mt-4 text-lg font-medium text-white/90">{grievance.subject}</h3>
              <p className="text-sm text-white/60">{grievance.grievanceType}</p>
              <div className="mt-4 space-x-2">
                <Tag color={statusColors[grievance.status]}>{grievance.status}</Tag>
                <Tag color={priorityColors[grievance.priority]}>{grievance.priority}</Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card title="Genel Bilgiler">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Sikayet Eden">{grievance.complainantName}</Descriptions.Item>
                <Descriptions.Item label="Konu">{grievance.subject}</Descriptions.Item>
                <Descriptions.Item label="Tur">{grievance.grievanceType}</Descriptions.Item>
                <Descriptions.Item label="Durum"><Tag color={statusColors[grievance.status]}>{grievance.status}</Tag></Descriptions.Item>
                <Descriptions.Item label="Oncelik"><Tag color={priorityColors[grievance.priority]}>{grievance.priority}</Tag></Descriptions.Item>
                <Descriptions.Item label="Basvuru Tarihi">{grievance.filedDate ? new Date(grievance.filedDate).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Incelemeye Alan">{grievance.assignedToName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Cozum Tarihi">{grievance.resolutionDate ? new Date(grievance.resolutionDate).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
              </Descriptions>
            </Card>
            {grievance.description && <Card title="Aciklama" className="mt-4"><p>{grievance.description}</p></Card>}
            {grievance.investigationNotes && <Card title="Sorusturma Notlari" className="mt-4"><p>{grievance.investigationNotes}</p></Card>}
            {grievance.resolution && <Card title="Cozum" className="mt-4"><p>{grievance.resolution}</p></Card>}
          </Col>
        </Row>
      </div>
    </div>
  );
}
