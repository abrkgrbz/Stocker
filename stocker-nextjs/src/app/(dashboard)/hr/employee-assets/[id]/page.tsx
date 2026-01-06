'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Descriptions, Tag, Row, Col } from 'antd';
import {
  ComputerDesktopIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useEmployeeAsset } from '@/lib/api/hooks/useHR';
import { DetailPageLayout, Badge } from '@/components/patterns';
import { Button } from '@/components/primitives';

const statusColors: Record<string, string> = {
  'Assigned': 'processing',
  'Available': 'success',
  'Returned': 'default',
  'UnderMaintenance': 'warning',
  'Lost': 'error',
  'Damaged': 'error',
  'Disposed': 'default',
};

const statusBadgeVariant: Record<string, 'neutral' | 'info' | 'success' | 'warning' | 'error'> = {
  'Assigned': 'info',
  'Available': 'success',
  'Returned': 'neutral',
  'UnderMaintenance': 'warning',
  'Lost': 'error',
  'Damaged': 'error',
  'Disposed': 'neutral',
};

export default function EmployeeAssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: asset, isLoading, isError } = useEmployeeAsset(id);

  return (
    <DetailPageLayout
      title="Varlik Detayi"
      subtitle={asset?.assetName}
      backPath="/hr/employee-assets"
      icon={<ComputerDesktopIcon className="w-5 h-5 text-white" />}
      iconBgColor="bg-cyan-600"
      isLoading={isLoading}
      isError={isError || !asset}
      errorMessage="Varlik Bulunamadi"
      errorDescription="Istenen varlik bulunamadi veya bir hata olustu."
      statusBadge={
        asset?.status && (
          <Badge variant={statusBadgeVariant[asset.status] || 'neutral'} dot>
            {asset.status}
          </Badge>
        )
      }
      actions={
        <Button
          variant="secondary"
          size="sm"
          icon={<PencilIcon className="w-4 h-4" />}
          onClick={() => router.push(`/hr/employee-assets/${id}/edit`)}
        >
          Duzenle
        </Button>
      }
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '16px',
              border: 'none',
            }}
            styles={{ body: { padding: '40px 20px', textAlign: 'center' } }}
          >
            <ComputerDesktopIcon className="w-16 h-16 text-white/90 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-white/90">{asset?.assetName}</h3>
            <p className="text-sm text-white/60">{asset?.assetType}</p>
            <Tag color={statusColors[asset?.status || '']} className="mt-4">
              {asset?.status}
            </Tag>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Genel Bilgiler">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Calisan">{asset?.employeeName}</Descriptions.Item>
              <Descriptions.Item label="Varlik Adi">{asset?.assetName}</Descriptions.Item>
              <Descriptions.Item label="Varlik Turu">{asset?.assetType}</Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusColors[asset?.status || '']}>{asset?.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Varlik Kodu">{asset?.assetCode || '-'}</Descriptions.Item>
              <Descriptions.Item label="Seri Numarasi">{asset?.serialNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="Marka">{asset?.brand || '-'}</Descriptions.Item>
              <Descriptions.Item label="Model">{asset?.model || '-'}</Descriptions.Item>
              <Descriptions.Item label="Atama Tarihi">
                {asset?.assignmentDate ? new Date(asset.assignmentDate).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Iade Tarihi">
                {asset?.returnDate ? new Date(asset.returnDate).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Garanti Bitis">
                {asset?.warrantyEndDate ? new Date(asset.warrantyEndDate).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Deger">
                {asset?.purchaseValue ? `${asset.purchaseValue} ${asset.currency || 'TRY'}` : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          {asset?.notes && (
            <Card title="Notlar" className="mt-4">
              <p>{asset.notes}</p>
            </Card>
          )}
        </Col>
      </Row>
    </DetailPageLayout>
  );
}
