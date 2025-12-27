'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Descriptions, Tag, Spin, Row, Col } from 'antd';
import {
  ArrowLeftIcon,
  GiftIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useEmployeeBenefit } from '@/lib/api/hooks/useHR';

const statusColors: Record<string, string> = { 'Active': 'success', 'Pending': 'processing', 'Expired': 'default', 'Cancelled': 'error', 'Suspended': 'warning' };

export default function EmployeeBenefitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: benefit, isLoading } = useEmployeeBenefit(id);

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;
  if (!benefit) return <div className="p-6"><Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()}>Geri</Button><div className="mt-4">Yan hak bulunamadi.</div></div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 px-8 py-4" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()} type="text" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Yan Hak Detayi</h1>
              <p className="text-sm text-gray-400 m-0">{benefit.benefitName}</p>
            </div>
          </div>
          <Button type="primary" icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/employee-benefits/${id}/edit`)} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Duzenle</Button>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '16px', border: 'none' }} bodyStyle={{ padding: '40px 20px', textAlign: 'center' }}>
              <GiftIcon className="w-4 h-4" style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <h3 className="mt-4 text-lg font-medium text-white/90">{benefit.benefitName}</h3>
              <p className="text-sm text-white/60">{benefit.benefitType}</p>
              <Tag color={statusColors[benefit.status]} className="mt-4">{benefit.status}</Tag>
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card title="Genel Bilgiler">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Calisan">{benefit.employeeName}</Descriptions.Item>
                <Descriptions.Item label="Yan Hak Adi">{benefit.benefitName}</Descriptions.Item>
                <Descriptions.Item label="Tur">{benefit.benefitType}</Descriptions.Item>
                <Descriptions.Item label="Durum"><Tag color={statusColors[benefit.status]}>{benefit.status}</Tag></Descriptions.Item>
                <Descriptions.Item label="Baslangic">{benefit.startDate ? new Date(benefit.startDate).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Bitis">{benefit.endDate ? new Date(benefit.endDate).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Deger">{benefit.amount ? `${benefit.amount} ${benefit.currency || 'TRY'}` : '-'}</Descriptions.Item>
                <Descriptions.Item label="Saglayici">{benefit.insuranceProvider || '-'}</Descriptions.Item>
              </Descriptions>
            </Card>
            {benefit.notes && <Card title="Notlar" className="mt-4"><p>{benefit.notes}</p></Card>}
          </Col>
        </Row>
      </div>
    </div>
  );
}
