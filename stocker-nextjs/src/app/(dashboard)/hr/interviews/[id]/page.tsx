'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Descriptions, Tag, Row, Col, Rate } from 'antd';
import {
  PencilIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { DetailPageLayout } from '@/components/patterns';
import { Button } from '@/components/primitives';
import { useInterview } from '@/lib/api/hooks/useHR';

const statusColors: Record<string, string> = { 'Scheduled': 'processing', 'Confirmed': 'cyan', 'InProgress': 'blue', 'Completed': 'success', 'Cancelled': 'error', 'NoShow': 'default', 'Rescheduled': 'warning' };

export default function InterviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: interview, isLoading, isError } = useInterview(id);

  return (
    <DetailPageLayout
      title="Mulakat Detayi"
      subtitle={interview?.candidateName}
      backPath="/hr/interviews"
      icon={<UserGroupIcon className="w-5 h-5 text-white" />}
      iconBgColor="bg-cyan-600"
      isLoading={isLoading}
      isError={isError || !interview}
      errorMessage="Mulakat Bulunamadi"
      errorDescription="Istenen mulakat kaydi bulunamadi."
      statusBadge={interview && <Tag color={statusColors[interview.status]}>{interview.status}</Tag>}
      actions={
        <Button
          variant="primary"
          icon={<PencilIcon className="w-4 h-4" />}
          onClick={() => router.push(`/hr/interviews/${id}/edit`)}
        >
          Duzenle
        </Button>
      }
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card style={{ background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', borderRadius: '16px', border: 'none' }} bodyStyle={{ padding: '40px 20px', textAlign: 'center' }}>
            <UserGroupIcon className="w-16 h-16 text-white/90" />
            <h3 className="mt-4 text-lg font-medium text-white/90">{interview?.candidateName}</h3>
            <p className="text-sm text-white/60">{interview?.interviewType}</p>
            <Tag color={statusColors[interview?.status || '']} className="mt-4">{interview?.status}</Tag>
          </Card>
          {interview?.overallRating && (
            <Card className="mt-4" title="Genel Puan">
              <div className="text-center">
                <Rate disabled value={interview.overallRating / 2} />
                <p className="mt-2 text-2xl font-bold">{interview.overallRating}/10</p>
              </div>
            </Card>
          )}
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Genel Bilgiler">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Aday">{interview?.candidateName}</Descriptions.Item>
              <Descriptions.Item label="Gorusmeci">{interview?.interviewerName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Mulakat Turu">{interview?.interviewType}</Descriptions.Item>
              <Descriptions.Item label="Durum"><Tag color={statusColors[interview?.status || '']}>{interview?.status}</Tag></Descriptions.Item>
              <Descriptions.Item label="Planlanan Tarih">{interview?.scheduledDateTime ? new Date(interview.scheduledDateTime).toLocaleString('tr-TR') : '-'}</Descriptions.Item>
              <Descriptions.Item label="Sure (dk)">{interview?.durationMinutes || '-'}</Descriptions.Item>
              <Descriptions.Item label="Konum">{interview?.location || '-'}</Descriptions.Item>
              <Descriptions.Item label="Video Link">{interview?.videoConferenceLink || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
          {interview?.evaluationSummary && <Card title="Degerlendirme" className="mt-4"><p>{interview.evaluationSummary}</p></Card>}
          {interview?.interviewerNotes && <Card title="Gorusmeci Notlari" className="mt-4"><p>{interview.interviewerNotes}</p></Card>}
        </Col>
      </Row>
    </DetailPageLayout>
  );
}
