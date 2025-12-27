'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Descriptions, Tag, Spin, Row, Col, Steps } from 'antd';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PencilIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { useJobApplication } from '@/lib/api/hooks/useHR';

const statusColors: Record<string, string> = { 'New': 'default', 'Screening': 'processing', 'Interview': 'blue', 'Assessment': 'cyan', 'Reference': 'gold', 'Offer': 'orange', 'Hired': 'success', 'Rejected': 'error', 'Withdrawn': 'default', 'OnHold': 'warning' };
const statusSteps = ['New', 'Screening', 'Interview', 'Assessment', 'Reference', 'Offer', 'Hired'];

export default function JobApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: application, isLoading } = useJobApplication(id);

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;
  if (!application) return <div className="p-6"><Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()}>Geri</Button><div className="mt-4">Basvuru bulunamadi.</div></div>;

  const currentStep = statusSteps.indexOf(application.status);

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 px-8 py-4" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()} type="text" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Basvuru Detayi</h1>
              <p className="text-sm text-gray-400 m-0">{application.fullName}</p>
            </div>
          </div>
          <Button type="primary" icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/job-applications/${id}/edit`)} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Duzenle</Button>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card style={{ background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', borderRadius: '16px', border: 'none' }} bodyStyle={{ padding: '40px 20px', textAlign: 'center' }}>
              <DocumentTextIcon className="w-16 h-16 text-white/90" />
              <h3 className="mt-4 text-lg font-medium text-white/90">{application.fullName}</h3>
              <p className="text-sm text-white/60">{application.jobTitle}</p>
              <Tag color={statusColors[application.status]} className="mt-4">{application.status}</Tag>
            </Card>
            <Card className="mt-4" title="Iletisim">
              <p><EnvelopeIcon className="w-4 h-4 mr-2" />{application.email || '-'}</p>
              <p><PhoneIcon className="w-4 h-4 mr-2" />{application.phone || '-'}</p>
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            {currentStep >= 0 && (
              <Card className="mb-4">
                <Steps current={currentStep} size="small" items={statusSteps.map(s => ({ title: s }))} />
              </Card>
            )}
            <Card title="Genel Bilgiler">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Aday">{application.fullName}</Descriptions.Item>
                <Descriptions.Item label="E-posta">{application.email || '-'}</Descriptions.Item>
                <Descriptions.Item label="Telefon">{application.phone || '-'}</Descriptions.Item>
                <Descriptions.Item label="Pozisyon">{application.jobTitle || '-'}</Descriptions.Item>
                <Descriptions.Item label="Durum"><Tag color={statusColors[application.status]}>{application.status}</Tag></Descriptions.Item>
                <Descriptions.Item label="Kaynak">{application.source || '-'}</Descriptions.Item>
                <Descriptions.Item label="Basvuru Tarihi">{application.applicationDate ? new Date(application.applicationDate).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Deneyim (Yil)">{application.totalExperienceYears || '-'}</Descriptions.Item>
                <Descriptions.Item label="Mevcut Sirket">{application.currentCompany || '-'}</Descriptions.Item>
                <Descriptions.Item label="Beklenen Maas">{application.expectedSalary || '-'}</Descriptions.Item>
              </Descriptions>
            </Card>
            {application.coverLetter && <Card title="On Yazi" className="mt-4"><p>{application.coverLetter}</p></Card>}
            {application.notes && <Card title="Notlar" className="mt-4"><p>{application.notes}</p></Card>}
          </Col>
        </Row>
      </div>
    </div>
  );
}
