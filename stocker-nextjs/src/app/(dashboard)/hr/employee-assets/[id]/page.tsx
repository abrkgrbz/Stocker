'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Descriptions, Tag, Spin, Row, Col } from 'antd';
import { ArrowLeftOutlined, EditOutlined, LaptopOutlined } from '@ant-design/icons';
import { useEmployeeAsset } from '@/lib/api/hooks/useHR';

const statusColors: Record<string, string> = {
  'Assigned': 'processing',
  'Available': 'success',
  'Returned': 'default',
  'UnderMaintenance': 'warning',
  'Lost': 'error',
  'Damaged': 'error',
  'Disposed': 'default',
};

export default function EmployeeAssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: asset, isLoading } = useEmployeeAsset(id);

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;
  if (!asset) return <div className="p-6"><Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>Geri</Button><div className="mt-4">Varlik bulunamadi.</div></div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 px-8 py-4" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} type="text" className="text-gray-500 hover:text-gray-800" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Varlik Detayi</h1>
              <p className="text-sm text-gray-400 m-0">{asset.assetName}</p>
            </div>
          </div>
          <Button type="primary" icon={<EditOutlined />} onClick={() => router.push(`/hr/employee-assets/${id}/edit`)} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Duzenle</Button>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '16px', border: 'none' }} bodyStyle={{ padding: '40px 20px', textAlign: 'center' }}>
              <LaptopOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <h3 className="mt-4 text-lg font-medium text-white/90">{asset.assetName}</h3>
              <p className="text-sm text-white/60">{asset.assetType}</p>
              <Tag color={statusColors[asset.status]} className="mt-4">{asset.status}</Tag>
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card title="Genel Bilgiler">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Calisan">{asset.employeeName}</Descriptions.Item>
                <Descriptions.Item label="Varlik Adi">{asset.assetName}</Descriptions.Item>
                <Descriptions.Item label="Varlik Turu">{asset.assetType}</Descriptions.Item>
                <Descriptions.Item label="Durum"><Tag color={statusColors[asset.status]}>{asset.status}</Tag></Descriptions.Item>
                <Descriptions.Item label="Varlik Etiketi">{asset.assetTag || '-'}</Descriptions.Item>
                <Descriptions.Item label="Seri Numarasi">{asset.serialNumber || '-'}</Descriptions.Item>
                <Descriptions.Item label="Marka">{asset.brand || '-'}</Descriptions.Item>
                <Descriptions.Item label="Model">{asset.model || '-'}</Descriptions.Item>
                <Descriptions.Item label="Atama Tarihi">{asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Iade Tarihi">{asset.returnDate ? new Date(asset.returnDate).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Garanti Bitis">{asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Deger">{asset.value ? `${asset.value} ${asset.currency || 'TRY'}` : '-'}</Descriptions.Item>
              </Descriptions>
            </Card>
            {asset.notes && <Card title="Notlar" className="mt-4"><p>{asset.notes}</p></Card>}
          </Col>
        </Row>
      </div>
    </div>
  );
}
