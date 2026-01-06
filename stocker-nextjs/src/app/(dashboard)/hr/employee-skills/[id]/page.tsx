'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Descriptions, Tag, Row, Col, Progress } from 'antd';
import {
  CheckCircleIcon,
  PencilIcon,
  ShieldCheckIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline';
import { useEmployeeSkill } from '@/lib/api/hooks/useHR';
import { DetailPageLayout, Badge } from '@/components/patterns';
import { Button } from '@/components/primitives';

const proficiencyColors: Record<string, string> = {
  'Beginner': 'default',
  'Elementary': 'blue',
  'Intermediate': 'cyan',
  'Advanced': 'green',
  'Expert': 'gold',
  'Master': 'red',
};

const proficiencyBadgeVariant: Record<string, 'neutral' | 'info' | 'success' | 'warning' | 'error'> = {
  'Beginner': 'neutral',
  'Elementary': 'info',
  'Intermediate': 'info',
  'Advanced': 'success',
  'Expert': 'warning',
  'Master': 'error',
};

const proficiencyPercent: Record<string, number> = {
  'Beginner': 16,
  'Elementary': 33,
  'Intermediate': 50,
  'Advanced': 66,
  'Expert': 83,
  'Master': 100,
};

export default function EmployeeSkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: skill, isLoading, isError } = useEmployeeSkill(id);

  return (
    <DetailPageLayout
      title="Yetkinlik Detayi"
      subtitle={skill?.skillName}
      backPath="/hr/employee-skills"
      icon={<WrenchIcon className="w-5 h-5 text-white" />}
      iconBgColor="bg-teal-600"
      isLoading={isLoading}
      isError={isError || !skill}
      errorMessage="Yetkinlik Bulunamadi"
      errorDescription="Istenen yetkinlik bulunamadi veya bir hata olustu."
      statusBadge={
        skill?.proficiencyLevel && (
          <Badge variant={proficiencyBadgeVariant[skill.proficiencyLevel] || 'neutral'} dot>
            {skill.proficiencyLevel}
          </Badge>
        )
      }
      actions={
        <Button
          variant="secondary"
          size="sm"
          icon={<PencilIcon className="w-4 h-4" />}
          onClick={() => router.push(`/hr/employee-skills/${id}/edit`)}
        >
          Duzenle
        </Button>
      }
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              borderRadius: '16px',
              border: 'none',
            }}
            styles={{ body: { padding: '40px 20px', textAlign: 'center' } }}
          >
            <WrenchIcon className="w-16 h-16 text-white/90 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-800">{skill?.skillName}</h3>
            <p className="text-sm text-gray-600">{skill?.category}</p>
            <Tag color={proficiencyColors[skill?.proficiencyLevel || '']} className="mt-4">
              {skill?.proficiencyLevel}
            </Tag>
            <Progress percent={proficiencyPercent[skill?.proficiencyLevel || ''] || 0} className="mt-4" />
          </Card>
          <Card className="mt-4">
            <div className="flex justify-around">
              <div className="text-center">
                <ShieldCheckIcon
                  className="w-6 h-6 mx-auto"
                  style={{ color: skill?.isCertified ? '#52c41a' : '#d9d9d9' }}
                />
                <p className="text-xs mt-1">{skill?.isCertified ? 'Sertifikali' : 'Sertifikasiz'}</p>
              </div>
              <div className="text-center">
                <CheckCircleIcon
                  className="w-6 h-6 mx-auto"
                  style={{ color: skill?.isVerified ? '#52c41a' : '#d9d9d9' }}
                />
                <p className="text-xs mt-1">{skill?.isVerified ? 'Dogrulanmis' : 'Dogrulanmamis'}</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Genel Bilgiler">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Calisan">Calisan #{skill?.employeeId}</Descriptions.Item>
              <Descriptions.Item label="Yetkinlik">{skill?.skillName}</Descriptions.Item>
              <Descriptions.Item label="Kategori">{skill?.category || '-'}</Descriptions.Item>
              <Descriptions.Item label="Seviye">
                <Tag color={proficiencyColors[skill?.proficiencyLevel || '']}>{skill?.proficiencyLevel}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Deneyim">
                {skill?.yearsOfExperience ? `${skill.yearsOfExperience} yil` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Son Kullanim">
                {skill?.lastUsedDate ? new Date(skill.lastUsedDate).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Sertifika Adi">{skill?.certificationName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Sertifika Tarihi">
                {skill?.certificationDate ? new Date(skill.certificationDate).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Sertifika Bitis">
                {skill?.certificationExpiryDate ? new Date(skill.certificationExpiryDate).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Veren Kurum">{skill?.certifyingAuthority || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
          {skill?.notes && (
            <Card title="Notlar" className="mt-4">
              <p>{skill.notes}</p>
            </Card>
          )}
        </Col>
      </Row>
    </DetailPageLayout>
  );
}
