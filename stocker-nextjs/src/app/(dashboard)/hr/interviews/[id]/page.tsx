'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Descriptions, Tag, Spin, Row, Col, Rate } from 'antd';
import { ArrowLeftOutlined, EditOutlined, TeamOutlined } from '@ant-design/icons';
import { useInterview } from '@/lib/api/hooks/useHR';

const statusColors: Record<string, string> = { 'Scheduled': 'processing', 'Confirmed': 'cyan', 'InProgress': 'blue', 'Completed': 'success', 'Cancelled': 'error', 'NoShow': 'default', 'Rescheduled': 'warning' };

export default function InterviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: interview, isLoading } = useInterview(id);

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;
  if (!interview) return <div className="p-6"><Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>Geri</Button><div className="mt-4">Mulakat bulunamadi.</div></div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 px-8 py-4" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} type="text" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Mulakat Detayi</h1>
              <p className="text-sm text-gray-400 m-0">{interview.candidateName}</p>
            </div>
          </div>
          <Button type="primary" icon={<EditOutlined />} onClick={() => router.push(`/hr/interviews/${id}/edit`)} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Duzenle</Button>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card style={{ background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', borderRadius: '16px', border: 'none' }} bodyStyle={{ padding: '40px 20px', textAlign: 'center' }}>
              <TeamOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <h3 className="mt-4 text-lg font-medium text-white/90">{interview.candidateName}</h3>
              <p className="text-sm text-white/60">{interview.interviewType}</p>
              <Tag color={statusColors[interview.status]} className="mt-4">{interview.status}</Tag>
            </Card>
            {interview.overallRating && (
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
                <Descriptions.Item label="Aday">{interview.candidateName}</Descriptions.Item>
                <Descriptions.Item label="Gorusmeci">{interview.interviewerName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Mulakat Turu">{interview.interviewType}</Descriptions.Item>
                <Descriptions.Item label="Durum"><Tag color={statusColors[interview.status]}>{interview.status}</Tag></Descriptions.Item>
                <Descriptions.Item label="Planlanan Tarih">{interview.scheduledDateTime ? new Date(interview.scheduledDateTime).toLocaleString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Sure (dk)">{interview.durationMinutes || '-'}</Descriptions.Item>
                <Descriptions.Item label="Konum">{interview.location || '-'}</Descriptions.Item>
                <Descriptions.Item label="Video Link">{interview.videoConferenceLink || '-'}</Descriptions.Item>
              </Descriptions>
            </Card>
            {interview.evaluationSummary && <Card title="Degerlendirme" className="mt-4"><p>{interview.evaluationSummary}</p></Card>}
            {interview.interviewerNotes && <Card title="Gorusmeci Notlari" className="mt-4"><p>{interview.interviewerNotes}</p></Card>}
          </Col>
        </Row>
      </div>
    </div>
  );
}
