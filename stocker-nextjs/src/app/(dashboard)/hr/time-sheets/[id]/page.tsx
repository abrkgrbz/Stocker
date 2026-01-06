'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Descriptions, Tag, Row, Col, Statistic, Divider } from 'antd';
import {
  ClockIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useTimeSheet } from '@/lib/api/hooks/useHR';
import { DetailPageLayout } from '@/components/patterns';

const statusColors: Record<string, string> = { 'Draft': 'default', 'Submitted': 'processing', 'Approved': 'success', 'Rejected': 'error', 'Paid': 'blue' };

export default function TimeSheetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: timeSheet, isLoading, isError } = useTimeSheet(id);

  const totalHours = timeSheet ? (timeSheet.regularHours || 0) + (timeSheet.overtimeHours || 0) : 0;

  return (
    <DetailPageLayout
      title="Puantaj Detayi"
      subtitle={timeSheet?.employeeName}
      backPath="/hr/time-sheets"
      icon={<ClockIcon className="w-6 h-6 text-white" />}
      iconBgColor="bg-cyan-600"
      statusBadge={timeSheet ? <Tag color={statusColors[timeSheet.status]}>{timeSheet.status}</Tag> : undefined}
      isLoading={isLoading}
      isError={isError || !timeSheet}
      errorMessage="Puantaj Bulunamadi"
      errorDescription="Istenen puantaj kaydi bulunamadi veya bir hata olustu."
      actions={
        <Button
          type="primary"
          icon={<PencilIcon className="w-4 h-4" />}
          onClick={() => router.push(`/hr/time-sheets/${id}/edit`)}
          style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
        >
          Duzenle
        </Button>
      }
    >
      {timeSheet && (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card style={{ background: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)', borderRadius: '16px', border: 'none' }} bodyStyle={{ padding: '40px 20px', textAlign: 'center' }}>
              <ClockIcon className="w-16 h-16 text-white/90" />
              <h3 className="mt-4 text-lg font-medium text-white/90">{timeSheet.employeeName}</h3>
              <p className="text-sm text-white/60">{timeSheet.status}</p>
              <Tag color={statusColors[timeSheet.status]} className="mt-4">{timeSheet.status}</Tag>
            </Card>
            <Card className="mt-4">
              <Statistic title="Toplam Calisma" value={totalHours} suffix="saat" valueStyle={{ color: '#1890ff' }} />
              <Divider />
              <Row gutter={16}>
                <Col span={12}><Statistic title="Normal" value={timeSheet.regularHours || 0} suffix="sa" /></Col>
                <Col span={12}><Statistic title="Fazla Mesai" value={timeSheet.overtimeHours || 0} suffix="sa" valueStyle={{ color: '#fa8c16' }} /></Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card title="Donem Bilgileri" className="mb-4">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Calisan">{timeSheet.employeeName}</Descriptions.Item>
                <Descriptions.Item label="Durum"><Tag color={statusColors[timeSheet.status]}>{timeSheet.status}</Tag></Descriptions.Item>
                <Descriptions.Item label="Donem Baslangic">{timeSheet.periodStart ? new Date(timeSheet.periodStart).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Donem Bitis">{timeSheet.periodEnd ? new Date(timeSheet.periodEnd).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Gonderim Tarihi">{timeSheet.submittedDate ? new Date(timeSheet.submittedDate).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Kilitli">{timeSheet.isLocked ? 'Evet' : 'Hayir'}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Calisma Saatleri" className="mb-4">
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Card size="small" className="text-center">
                    <Statistic title="Normal Saatler" value={timeSheet.regularHours || 0} suffix="saat" />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" className="text-center">
                    <Statistic title="Fazla Mesai" value={timeSheet.overtimeHours || 0} suffix="saat" valueStyle={{ color: '#fa8c16' }} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" className="text-center">
                    <Statistic title="Tatil" value={timeSheet.holidayHours || 0} suffix="saat" valueStyle={{ color: '#eb2f96' }} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" className="text-center">
                    <Statistic title="Izin" value={timeSheet.leaveHours || 0} suffix="saat" valueStyle={{ color: '#52c41a' }} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" className="text-center">
                    <Statistic title="Faturali" value={timeSheet.billableHours || 0} suffix="saat" valueStyle={{ color: '#1890ff' }} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" className="text-center">
                    <Statistic title="Faturasiz" value={timeSheet.nonBillableHours || 0} suffix="saat" valueStyle={{ color: '#13c2c2' }} />
                  </Card>
                </Col>
              </Row>
            </Card>

            {(timeSheet.approvedByName || timeSheet.rejectionReason) && (
              <Card title="Onay Bilgileri" className="mb-4">
                <Descriptions column={2} bordered size="small">
                  {timeSheet.approvedByName && <Descriptions.Item label="Onaylayan">{timeSheet.approvedByName}</Descriptions.Item>}
                  {timeSheet.approvalDate && <Descriptions.Item label="Onay Tarihi">{new Date(timeSheet.approvalDate).toLocaleDateString('tr-TR')}</Descriptions.Item>}
                  {timeSheet.rejectionReason && <Descriptions.Item label="Ret Nedeni" span={2}>{timeSheet.rejectionReason}</Descriptions.Item>}
                </Descriptions>
              </Card>
            )}

            {timeSheet.notes && <Card title="Notlar"><p>{timeSheet.notes}</p></Card>}
          </Col>
        </Row>
      )}
    </DetailPageLayout>
  );
}
