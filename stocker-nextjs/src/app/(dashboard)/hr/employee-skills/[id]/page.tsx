'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Descriptions, Tag, Spin, Row, Col, Progress } from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  PencilIcon,
  ShieldCheckIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline';
import { useEmployeeSkill } from '@/lib/api/hooks/useHR';

const proficiencyColors: Record<string, string> = { 'Beginner': 'default', 'Elementary': 'blue', 'Intermediate': 'cyan', 'Advanced': 'green', 'Expert': 'gold', 'Master': 'red' };
const proficiencyPercent: Record<string, number> = { 'Beginner': 16, 'Elementary': 33, 'Intermediate': 50, 'Advanced': 66, 'Expert': 83, 'Master': 100 };

export default function EmployeeSkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: skill, isLoading } = useEmployeeSkill(id);

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;
  if (!skill) return <div className="p-6"><Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()}>Geri</Button><div className="mt-4">Yetkinlik bulunamadi.</div></div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 px-8 py-4" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()} type="text" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Yetkinlik Detayi</h1>
              <p className="text-sm text-gray-400 m-0">{skill.skillName}</p>
            </div>
          </div>
          <Button type="primary" icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/employee-skills/${id}/edit`)} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Duzenle</Button>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', borderRadius: '16px', border: 'none' }} bodyStyle={{ padding: '40px 20px', textAlign: 'center' }}>
              <WrenchIcon className="w-4 h-4" style={{ fontSize: '64px', color: 'rgba(0,0,0,0.6)' }} />
              <h3 className="mt-4 text-lg font-medium text-gray-800">{skill.skillName}</h3>
              <p className="text-sm text-gray-600">{skill.category}</p>
              <Tag color={proficiencyColors[skill.proficiencyLevel]} className="mt-4">{skill.proficiencyLevel}</Tag>
              <Progress percent={proficiencyPercent[skill.proficiencyLevel] || 0} className="mt-4" />
            </Card>
            <Card className="mt-4">
              <div className="flex justify-around">
                <div className="text-center">
                  <ShieldCheckIcon className="w-4 h-4" style={{ fontSize: 24, color: skill.isCertified ? '#52c41a' : '#d9d9d9' }} />
                  <p className="text-xs mt-1">{skill.isCertified ? 'Sertifikali' : 'Sertifikasiz'}</p>
                </div>
                <div className="text-center">
                  <CheckCircleIcon className="w-4 h-4" style={{ fontSize: 24, color: skill.isVerified ? '#52c41a' : '#d9d9d9' }} />
                  <p className="text-xs mt-1">{skill.isVerified ? 'Dogrulanmis' : 'Dogrulanmamis'}</p>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card title="Genel Bilgiler">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Calisan">Calisan #{skill.employeeId}</Descriptions.Item>
                <Descriptions.Item label="Yetkinlik">{skill.skillName}</Descriptions.Item>
                <Descriptions.Item label="Kategori">{skill.category || '-'}</Descriptions.Item>
                <Descriptions.Item label="Seviye"><Tag color={proficiencyColors[skill.proficiencyLevel]}>{skill.proficiencyLevel}</Tag></Descriptions.Item>
                <Descriptions.Item label="Deneyim">{skill.yearsOfExperience ? `${skill.yearsOfExperience} yil` : '-'}</Descriptions.Item>
                <Descriptions.Item label="Son Kullanim">{skill.lastUsedDate ? new Date(skill.lastUsedDate).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Sertifika Adi">{skill.certificationName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Sertifika Tarihi">{skill.certificationDate ? new Date(skill.certificationDate).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Sertifika Bitis">{skill.certificationExpiryDate ? new Date(skill.certificationExpiryDate).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Veren Kurum">{skill.certifyingAuthority || '-'}</Descriptions.Item>
              </Descriptions>
            </Card>
            {skill.notes && <Card title="Notlar" className="mt-4"><p>{skill.notes}</p></Card>}
          </Col>
        </Row>
      </div>
    </div>
  );
}
