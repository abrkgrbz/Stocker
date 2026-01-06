'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Descriptions, Tag, Row, Col } from 'antd';
import {
  GiftIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useEmployeeBenefit } from '@/lib/api/hooks/useHR';
import { DetailPageLayout, Badge } from '@/components/patterns';
import { Button } from '@/components/primitives';

const statusColors: Record<string, string> = {
  'Active': 'success',
  'Pending': 'processing',
  'Expired': 'default',
  'Cancelled': 'error',
  'Suspended': 'warning',
};

const statusBadgeVariant: Record<string, 'neutral' | 'info' | 'success' | 'warning' | 'error'> = {
  'Active': 'success',
  'Pending': 'info',
  'Expired': 'neutral',
  'Cancelled': 'error',
  'Suspended': 'warning',
};

export default function EmployeeBenefitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: benefit, isLoading, isError } = useEmployeeBenefit(id);

  return (
    <DetailPageLayout
      title="Yan Hak Detayi"
      subtitle={benefit?.benefitName}
      backPath="/hr/employee-benefits"
      icon={<GiftIcon className="w-5 h-5 text-white" />}
      iconBgColor="bg-orange-600"
      isLoading={isLoading}
      isError={isError || !benefit}
      errorMessage="Yan Hak Bulunamadi"
      errorDescription="Istenen yan hak bulunamadi veya bir hata olustu."
      statusBadge={
        benefit?.status && (
          <Badge variant={statusBadgeVariant[benefit.status] || 'neutral'} dot>
            {benefit.status}
          </Badge>
        )
      }
      actions={
        <Button
          variant="secondary"
          size="sm"
          icon={<PencilIcon className="w-4 h-4" />}
          onClick={() => router.push(`/hr/employee-benefits/${id}/edit`)}
        >
          Duzenle
        </Button>
      }
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              borderRadius: '16px',
              border: 'none',
            }}
            styles={{ body: { padding: '40px 20px', textAlign: 'center' } }}
          >
            <GiftIcon className="w-16 h-16 text-white/90 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-white/90">{benefit?.benefitName}</h3>
            <p className="text-sm text-white/60">{benefit?.benefitType}</p>
            <Tag color={statusColors[benefit?.status || '']} className="mt-4">
              {benefit?.status}
            </Tag>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Genel Bilgiler">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Calisan">{benefit?.employeeName}</Descriptions.Item>
              <Descriptions.Item label="Yan Hak Adi">{benefit?.benefitName}</Descriptions.Item>
              <Descriptions.Item label="Tur">{benefit?.benefitType}</Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusColors[benefit?.status || '']}>{benefit?.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Baslangic">
                {benefit?.startDate ? new Date(benefit.startDate).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Bitis">
                {benefit?.endDate ? new Date(benefit.endDate).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Deger">
                {benefit?.amount ? `${benefit.amount} ${benefit.currency || 'TRY'}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Saglayici">{benefit?.insuranceProvider || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
          {benefit?.notes && (
            <Card title="Notlar" className="mt-4">
              <p>{benefit.notes}</p>
            </Card>
          )}
        </Col>
      </Row>
    </DetailPageLayout>
  );
}
