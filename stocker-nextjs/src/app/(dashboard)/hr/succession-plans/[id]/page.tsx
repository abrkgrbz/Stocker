'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Descriptions, Tag, Spin, Row, Col, Progress, List, Avatar } from 'antd';
import { ArrowLeftOutlined, EditOutlined, CrownOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import { useSuccessionPlan } from '@/lib/api/hooks/useHR';

const statusColors: Record<string, string> = { 'Draft': 'default', 'Active': 'processing', 'UnderReview': 'warning', 'Approved': 'success', 'Implemented': 'blue', 'Archived': 'default' };
const priorityColors: Record<string, string> = { 'Critical': 'red', 'High': 'orange', 'Medium': 'blue', 'Low': 'default' };

export default function SuccessionPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: plan, isLoading } = useSuccessionPlan(id);

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;
  if (!plan) return <div className="p-6"><Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>Geri</Button><div className="mt-4">Plan bulunamadi.</div></div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 px-8 py-4" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} type="text" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Yedekleme Plani Detayi</h1>
              <p className="text-sm text-gray-400 m-0">{plan.positionTitle}</p>
            </div>
          </div>
          <Button type="primary" icon={<EditOutlined />} onClick={() => router.push(`/hr/succession-plans/${id}/edit`)} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Duzenle</Button>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card style={{ background: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)', borderRadius: '16px', border: 'none' }} bodyStyle={{ padding: '40px 20px', textAlign: 'center' }}>
              <CrownOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <h3 className="mt-4 text-lg font-medium text-white/90">{plan.positionTitle}</h3>
              <p className="text-sm text-white/60">{plan.departmentName}</p>
              <div className="mt-4 flex gap-2 justify-center">
                <Tag color={statusColors[plan.status]}>{plan.status}</Tag>
                <Tag color={priorityColors[plan.priority]}>{plan.priority}</Tag>
              </div>
              <div className="mt-4 px-8"><Progress percent={plan.readinessScore || 0} strokeColor="#fff" trailColor="rgba(255,255,255,0.3)" /></div>
            </Card>
            <Card className="mt-4" title="Mevcut Pozisyon Sahibi">
              <div className="flex items-center gap-3">
                <Avatar size={48} icon={<UserOutlined />} />
                <div>
                  <p className="font-medium m-0">{plan.incumbentName || 'Belirlenmemis'}</p>
                  <p className="text-sm text-gray-400 m-0">{plan.positionTitle}</p>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card title="Genel Bilgiler" className="mb-4">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Pozisyon">{plan.positionTitle}</Descriptions.Item>
                <Descriptions.Item label="Departman">{plan.departmentName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Mevcut Kisi">{plan.incumbentName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Durum"><Tag color={statusColors[plan.status]}>{plan.status}</Tag></Descriptions.Item>
                <Descriptions.Item label="Oncelik"><Tag color={priorityColors[plan.priority]}>{plan.priority}</Tag></Descriptions.Item>
                <Descriptions.Item label="Hazirlik Skoru">{plan.readinessScore || 0}%</Descriptions.Item>
                <Descriptions.Item label="Hedef Tarih">{plan.targetDate ? new Date(plan.targetDate).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Son Guncelleme">{plan.lastReviewDate ? new Date(plan.lastReviewDate).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title={<><TeamOutlined className="mr-2" />Aday Havuzu</>} className="mb-4">
              {plan.primaryCandidateName && (
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 font-medium uppercase mb-2">Birincil Aday</p>
                  <div className="flex items-center gap-3">
                    <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />
                    <div>
                      <p className="font-medium m-0">{plan.primaryCandidateName}</p>
                      <p className="text-sm text-gray-400 m-0">Hazirlik: {plan.primaryCandidateReadiness || 0}%</p>
                    </div>
                  </div>
                </div>
              )}
              {plan.secondaryCandidateName && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium uppercase mb-2">Ikincil Aday</p>
                  <div className="flex items-center gap-3">
                    <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                    <div>
                      <p className="font-medium m-0">{plan.secondaryCandidateName}</p>
                      <p className="text-sm text-gray-400 m-0">Hazirlik: {plan.secondaryCandidateReadiness || 0}%</p>
                    </div>
                  </div>
                </div>
              )}
              {plan.tertiaryCandidateName && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-600 font-medium uppercase mb-2">Ucuncul Aday</p>
                  <div className="flex items-center gap-3">
                    <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#fa8c16' }} />
                    <div>
                      <p className="font-medium m-0">{plan.tertiaryCandidateName}</p>
                      <p className="text-sm text-gray-400 m-0">Hazirlik: {plan.tertiaryCandidateReadiness || 0}%</p>
                    </div>
                  </div>
                </div>
              )}
              {!plan.primaryCandidateName && !plan.secondaryCandidateName && !plan.tertiaryCandidateName && (
                <p className="text-gray-400">Henuz aday belirlenmemis.</p>
              )}
            </Card>

            {(plan.keyCompetencies || plan.developmentNeeds) && (
              <Card title="Yetkinlik & Gelisim" className="mb-4">
                {plan.keyCompetencies && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 font-medium uppercase mb-2">Kritik Yetkinlikler</p>
                    <p>{plan.keyCompetencies}</p>
                  </div>
                )}
                {plan.developmentNeeds && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase mb-2">Gelisim Ihtiyaclari</p>
                    <p>{plan.developmentNeeds}</p>
                  </div>
                )}
              </Card>
            )}

            {plan.notes && <Card title="Notlar"><p>{plan.notes}</p></Card>}
          </Col>
        </Row>
      </div>
    </div>
  );
}
