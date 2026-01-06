'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Descriptions, Tag, Row, Col, Progress, Checkbox } from 'antd';
import {
  PencilIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { DetailPageLayout } from '@/components/patterns';
import { Button } from '@/components/primitives';
import { useOnboarding } from '@/lib/api/hooks/useHR';

const statusColors: Record<string, string> = { 'NotStarted': 'default', 'InProgress': 'processing', 'Completed': 'success', 'OnHold': 'warning', 'Cancelled': 'error' };

export default function OnboardingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: onboarding, isLoading, isError } = useOnboarding(id);

  return (
    <DetailPageLayout
      title="Onboarding Detayi"
      subtitle={onboarding?.employeeName}
      backPath="/hr/onboardings"
      icon={<RocketLaunchIcon className="w-5 h-5 text-white" />}
      iconBgColor="bg-emerald-600"
      isLoading={isLoading}
      isError={isError || !onboarding}
      errorMessage="Onboarding Bulunamadi"
      errorDescription="Istenen onboarding kaydi bulunamadi."
      statusBadge={onboarding && <Tag color={statusColors[onboarding.status]}>{onboarding.status}</Tag>}
      actions={
        <Button
          variant="primary"
          icon={<PencilIcon className="w-4 h-4" />}
          onClick={() => router.push(`/hr/onboardings/${id}/edit`)}
        >
          Duzenle
        </Button>
      }
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', borderRadius: '16px', border: 'none' }} bodyStyle={{ padding: '40px 20px', textAlign: 'center' }}>
            <RocketLaunchIcon className="w-16 h-16 text-white/90" />
            <h3 className="mt-4 text-lg font-medium text-white/90">{onboarding?.employeeName}</h3>
            <p className="text-sm text-white/60">Onboarding</p>
            <Tag color={statusColors[onboarding?.status || '']} className="mt-4">{onboarding?.status}</Tag>
            <div className="mt-4 px-8"><Progress percent={onboarding?.completionPercentage || 0} strokeColor="#fff" trailColor="rgba(255,255,255,0.3)" /></div>
          </Card>
          <Card className="mt-4" title="Sorumlular">
            <p><strong>Buddy:</strong> {onboarding?.buddyName || '-'}</p>
            <p><strong>HR Sorumlusu:</strong> {onboarding?.hrResponsibleName || '-'}</p>
            <p><strong>IT Sorumlusu:</strong> {onboarding?.itResponsibleName || '-'}</p>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Genel Bilgiler" className="mb-4">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Calisan">{onboarding?.employeeName}</Descriptions.Item>
              <Descriptions.Item label="Durum"><Tag color={statusColors[onboarding?.status || '']}>{onboarding?.status}</Tag></Descriptions.Item>
              <Descriptions.Item label="Baslangic">{onboarding?.startDate ? new Date(onboarding.startDate).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
              <Descriptions.Item label="Beklenen Bitis">{onboarding?.plannedEndDate ? new Date(onboarding.plannedEndDate).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
              <Descriptions.Item label="Gercek Bitis">{onboarding?.actualEndDate ? new Date(onboarding.actualEndDate).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
              <Descriptions.Item label="Ilerleme">{onboarding?.completionPercentage || 0}%</Descriptions.Item>
              <Descriptions.Item label="Toplam Gorev">{onboarding?.totalTasks || 0}</Descriptions.Item>
              <Descriptions.Item label="Tamamlanan">{onboarding?.completedTasks || 0}</Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="Ekipman & IT Erisimi" className="mb-4">
            <Row gutter={[16, 16]}>
              <Col span={8}><Checkbox checked={onboarding?.deskPrepared}> Is istasyonu</Checkbox></Col>
              <Col span={8}><Checkbox checked={onboarding?.laptopProvided}> Laptop</Checkbox></Col>
              <Col span={8}><Checkbox checked={onboarding?.phoneProvided}> Telefon</Checkbox></Col>
              <Col span={8}><Checkbox checked={onboarding?.emailAccountCreated}> E-posta</Checkbox></Col>
              <Col span={8}><Checkbox checked={onboarding?.adAccountCreated}> AD Hesabi</Checkbox></Col>
              <Col span={8}><Checkbox checked={onboarding?.systemAccessGranted}> Sistem Erisimi</Checkbox></Col>
              <Col span={8}><Checkbox checked={onboarding?.vpnAccessGranted}> VPN Erisimi</Checkbox></Col>
              <Col span={8}><Checkbox checked={onboarding?.accessCardProvided}> Gec Karti</Checkbox></Col>
              <Col span={8}><Checkbox checked={onboarding?.welcomeKitSent}> Karsilama Paketi</Checkbox></Col>
            </Row>
          </Card>
          <Card title="Dokumantasyon & Egitim" className="mb-4">
            <Row gutter={[16, 16]}>
              <Col span={8}><Checkbox checked={onboarding?.contractSigned}> Sozlesme</Checkbox></Col>
              <Col span={8}><Checkbox checked={onboarding?.ndaSigned}> NDA</Checkbox></Col>
              <Col span={8}><Checkbox checked={onboarding?.policiesAcknowledged}> Politikalar</Checkbox></Col>
              <Col span={8}><Checkbox checked={onboarding?.bankDetailsReceived}> Banka Bilgileri</Checkbox></Col>
              <Col span={8}><Checkbox checked={onboarding?.emergencyContactReceived}> Acil Durum</Checkbox></Col>
              <Col span={8}><Checkbox checked={onboarding?.safetyTrainingCompleted}> Is Guvenligi</Checkbox></Col>
              <Col span={8}><Checkbox checked={onboarding?.complianceTrainingCompleted}> Uyum Egitimi</Checkbox></Col>
              <Col span={8}><Checkbox checked={onboarding?.orientationCompleted}> Oryantasyon</Checkbox></Col>
              <Col span={8}><Checkbox checked={onboarding?.teamIntroductionDone}> Takim Tanitimi</Checkbox></Col>
              <Col span={8}><Checkbox checked={onboarding?.productTrainingCompleted}> Urun Egitimi</Checkbox></Col>
            </Row>
          </Card>
          {onboarding?.notes && <Card title="Notlar"><p>{onboarding.notes}</p></Card>}
        </Col>
      </Row>
    </DetailPageLayout>
  );
}
