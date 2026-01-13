'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Descriptions, Tag, Table, Card, Row, Col, Statistic } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import {
  useQualityInspection,
  useStartQualityInspection,
  useCompleteQualityInspection,
} from '@/lib/api/hooks/useManufacturing';
import type { InspectionStatus, InspectionType, InspectionResult, Disposition, InspectionMeasurementDto, NonConformanceDto } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const statusConfig: Record<InspectionStatus, { color: string; bgColor: string; label: string }> = {
  Pending: { color: '#64748b', bgColor: '#f1f5f9', label: 'Beklemede' },
  InProgress: { color: '#334155', bgColor: '#e2e8f0', label: 'Devam Ediyor' },
  Completed: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Tamamlandı' },
  Cancelled: { color: '#94a3b8', bgColor: '#f8fafc', label: 'İptal' },
};

const typeLabels: Record<InspectionType, string> = {
  Incoming: 'Giriş Kontrolü',
  InProcess: 'Proses İçi',
  Final: 'Final Kontrol',
  Random: 'Rastgele Numune',
};

const resultConfig: Record<InspectionResult, { color: string; label: string }> = {
  Pass: { color: 'success', label: 'Geçti' },
  Fail: { color: 'error', label: 'Kaldı' },
  Conditional: { color: 'warning', label: 'Koşullu' },
};

const dispositionLabels: Record<Disposition, string> = {
  Accept: 'Kabul',
  Reject: 'Red',
  Rework: 'Yeniden İşle',
  Scrap: 'Hurda',
  Hold: 'Beklet',
};

export default function QualityInspectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const inspectionId = params.id as string;

  const { data: inspection, isLoading, error } = useQualityInspection(inspectionId);
  const startInspection = useStartQualityInspection();
  const completeInspection = useCompleteQualityInspection();

  const handleStart = async () => {
    try {
      await startInspection.mutateAsync({ id: inspectionId, data: {} });
    } catch {
      // Error handled by hook
    }
  };

  const handleComplete = async () => {
    try {
      await completeInspection.mutateAsync(inspectionId);
    } catch {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto mt-20">
          <ExclamationTriangleIcon className="w-12 h-12 text-slate-300 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Kontrol Bulunamadı</h2>
          <p className="text-slate-500 mb-6">İstenen kalite kontrolü bulunamadı veya bir hata oluştu.</p>
          <Button onClick={() => router.push('/manufacturing/quality-inspections')} className="!border-slate-300">
            Kontrollere Dön
          </Button>
        </div>
      </div>
    );
  }

  const sConfig = statusConfig[inspection.status] || { color: '#64748b', bgColor: '#f1f5f9', label: 'Bilinmiyor' };
  const rConfig = inspection.result ? resultConfig[inspection.result] : null;

  const measurementColumns: ColumnsType<InspectionMeasurementDto> = [
    { title: 'Parametre', dataIndex: 'parameterName', key: 'parameterName' },
    { title: 'Hedef', dataIndex: 'targetValue', key: 'targetValue', align: 'right', render: (v, r) => `${v} ${r.unit}` },
    { title: 'Tolerans', dataIndex: 'tolerance', key: 'tolerance', align: 'right', render: (v, r) => `±${v} ${r.unit}` },
    { title: 'Ölçülen', dataIndex: 'actualValue', key: 'actualValue', align: 'right', render: (v, r) => <span className={r.isPassing ? 'text-green-600' : 'text-red-600'}>{v} {r.unit}</span> },
    { title: 'Durum', dataIndex: 'isPassing', key: 'isPassing', align: 'center', render: (ok) => ok ? <Tag color="success">OK</Tag> : <Tag color="error">NOK</Tag> },
  ];

  const ncColumns: ColumnsType<NonConformanceDto> = [
    { title: 'Açıklama', dataIndex: 'description', key: 'description' },
    { title: 'Miktar', dataIndex: 'quantity', key: 'quantity', align: 'right' },
    { title: 'Ciddiyet', dataIndex: 'severity', key: 'severity', render: (s) => <Tag>{s}</Tag> },
    { title: 'Değerlendirme', dataIndex: 'disposition', key: 'disposition', render: (d) => d ? dispositionLabels[d as Disposition] : '-' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="!text-slate-500 hover:!text-slate-800"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-900 m-0">{inspection.inspectionNumber}</h1>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                  style={{ backgroundColor: sConfig.bgColor, color: sConfig.color }}
                >
                  {sConfig.label}
                </span>
                {rConfig && <Tag color={rConfig.color}>{rConfig.label}</Tag>}
              </div>
              <p className="text-sm text-slate-400 m-0">{inspection.productName} - {typeLabels[inspection.inspectionType]}</p>
            </div>
          </div>
          <Space size="small">
            {inspection.status === 'Pending' && (
              <Button
                icon={<PlayIcon className="w-4 h-4" />}
                onClick={handleStart}
                loading={startInspection.isPending}
                className="!border-slate-300"
              >
                Başlat
              </Button>
            )}
            {inspection.status === 'InProgress' && (
              <Button
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleComplete}
                loading={completeInspection.isPending}
                type="primary"
                className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              >
                Tamamla
              </Button>
            )}
          </Space>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <Row gutter={[24, 24]} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic title="Numune Boyutu" value={inspection.sampleSize} prefix={<BeakerIcon className="w-5 h-5 text-slate-400" />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Geçen" value={inspection.passedQuantity || 0} valueStyle={{ color: '#16a34a' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Kalan" value={inspection.failedQuantity || 0} valueStyle={{ color: '#dc2626' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Değerlendirme"
                value={inspection.disposition ? dispositionLabels[inspection.disposition] : '-'}
                prefix={<ClipboardDocumentCheckIcon className="w-5 h-5 text-slate-400" />}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Kontrol Bilgileri" className="mb-6">
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2, md: 3, lg: 4 }}
            size="small"
            className="[&_.ant-descriptions-item-label]:!bg-slate-50 [&_.ant-descriptions-item-label]:!text-slate-500"
          >
            <Descriptions.Item label="Kontrol No">{inspection.inspectionNumber}</Descriptions.Item>
            <Descriptions.Item label="Ürün">{inspection.productName}</Descriptions.Item>
            <Descriptions.Item label="Kontrol Tipi">{typeLabels[inspection.inspectionType]}</Descriptions.Item>
            <Descriptions.Item label="Durum">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: sConfig.bgColor, color: sConfig.color }}>
                {sConfig.label}
              </span>
            </Descriptions.Item>
            {inspection.productionOrderId && <Descriptions.Item label="Üretim Emri">{inspection.productionOrderId}</Descriptions.Item>}
            <Descriptions.Item label="Numune Boyutu">{inspection.sampleSize}</Descriptions.Item>
            {inspection.result && <Descriptions.Item label="Sonuç"><Tag color={rConfig?.color}>{rConfig?.label}</Tag></Descriptions.Item>}
            {inspection.disposition && <Descriptions.Item label="Değerlendirme">{dispositionLabels[inspection.disposition]}</Descriptions.Item>}
          </Descriptions>
        </Card>

        {inspection.measurements && inspection.measurements.length > 0 && (
          <Card title="Ölçüm Sonuçları" className="mb-6">
            <Table
              columns={measurementColumns}
              dataSource={inspection.measurements}
              rowKey="id"
              pagination={false}
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase"
            />
          </Card>
        )}

        {inspection.nonConformances && inspection.nonConformances.length > 0 && (
          <Card title="Uygunsuzluklar">
            <Table
              columns={ncColumns}
              dataSource={inspection.nonConformances}
              rowKey="id"
              pagination={false}
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase"
            />
          </Card>
        )}
      </div>
    </div>
  );
}
