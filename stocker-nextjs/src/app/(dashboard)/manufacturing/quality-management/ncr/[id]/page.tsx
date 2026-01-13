'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Descriptions, Tag, Table, Card, Row, Col, Statistic, Timeline } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useNcr,
  useStartNcrInvestigation,
  useSetNcrRootCause,
  useCloseNcr,
  useCancelNcr,
} from '@/lib/api/hooks/useManufacturing';
import type { NcrStatus, NcrSource, NcrSeverity, NcrContainmentActionDto } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const statusConfig: Record<NcrStatus, { color: string; bgColor: string; label: string }> = {
  Open: { color: '#64748b', bgColor: '#f1f5f9', label: 'Açık' },
  UnderInvestigation: { color: '#334155', bgColor: '#e2e8f0', label: 'Araştırılıyor' },
  PendingDisposition: { color: '#475569', bgColor: '#cbd5e1', label: 'Karar Bekliyor' },
  Closed: { color: '#1e293b', bgColor: '#94a3b8', label: 'Kapatıldı' },
  Cancelled: { color: '#ef4444', bgColor: '#fee2e2', label: 'İptal' },
};

const sourceLabels: Record<NcrSource, string> = {
  Internal: 'Dahili',
  Customer: 'Müşteri',
  Supplier: 'Tedarikçi',
  Production: 'Üretim',
  Inspection: 'Kontrol',
};

const severityConfig: Record<NcrSeverity, { color: string; label: string }> = {
  Minor: { color: 'default', label: 'Küçük' },
  Major: { color: 'warning', label: 'Büyük' },
  Critical: { color: 'error', label: 'Kritik' },
};

export default function NcrDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ncrId = params.id as string;

  const { data: ncr, isLoading, error } = useNcr(ncrId);
  const startInvestigation = useStartNcrInvestigation();
  const setRootCause = useSetNcrRootCause();
  const closeNcr = useCloseNcr();
  const cancelNcr = useCancelNcr();

  const handleStartInvestigation = async () => {
    try {
      await startInvestigation.mutateAsync({ id: ncrId, data: { investigator: 'current-user' } });
    } catch {
      // Error handled by hook
    }
  };

  const handleCompleteInvestigation = async () => {
    try {
      await setRootCause.mutateAsync({ id: ncrId, data: { rootCause: 'Araştırma tamamlandı' } });
    } catch {
      // Error handled by hook
    }
  };

  const handleClose = async () => {
    try {
      await closeNcr.mutateAsync({ id: ncrId, data: { closureNotes: 'Kapatıldı' } });
    } catch {
      // Error handled by hook
    }
  };

  const handleCancel = async () => {
    try {
      await cancelNcr.mutateAsync(ncrId);
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

  if (error || !ncr) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto mt-20">
          <ExclamationTriangleIcon className="w-12 h-12 text-slate-300 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">NCR Bulunamadı</h2>
          <p className="text-slate-500 mb-6">İstenen uygunsuzluk raporu bulunamadı veya bir hata oluştu.</p>
          <Button onClick={() => router.push('/manufacturing/quality-management')} className="!border-slate-300">
            Kalite Yönetimine Dön
          </Button>
        </div>
      </div>
    );
  }

  const sConfig = statusConfig[ncr.status] || { color: '#64748b', bgColor: '#f1f5f9', label: 'Bilinmiyor' };
  const sevConfig = severityConfig[ncr.severity] || { color: 'default', label: ncr.severity };

  const actionColumns: ColumnsType<NcrContainmentActionDto> = [
    { title: 'Aksiyon', dataIndex: 'actionDescription', key: 'actionDescription' },
    { title: 'Sorumlu', dataIndex: 'responsibleUser', key: 'responsibleUser' },
    { title: 'Hedef Tarih', dataIndex: 'targetDate', key: 'targetDate', render: (d) => dayjs(d).format('DD.MM.YYYY') },
    { title: 'Tamamlanma', dataIndex: 'completedAt', key: 'completedAt', render: (d) => d ? dayjs(d).format('DD.MM.YYYY') : '-' },
    {
      title: 'Durum',
      dataIndex: 'isCompleted',
      key: 'isCompleted',
      align: 'center',
      render: (completed) => completed ? <Tag color="success">Tamamlandı</Tag> : <Tag>Bekliyor</Tag>,
    },
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
                <h1 className="text-xl font-semibold text-slate-900 m-0">{ncr.ncrNumber}</h1>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                  style={{ backgroundColor: sConfig.bgColor, color: sConfig.color }}
                >
                  {sConfig.label}
                </span>
                <Tag color={sevConfig.color}>{sevConfig.label}</Tag>
              </div>
              <p className="text-sm text-slate-400 m-0">{ncr.title}</p>
            </div>
          </div>
          <Space size="small">
            {ncr.status === 'Open' && (
              <Button
                icon={<MagnifyingGlassIcon className="w-4 h-4" />}
                onClick={handleStartInvestigation}
                loading={startInvestigation.isPending}
                className="!border-slate-300"
              >
                Araştırma Başlat
              </Button>
            )}
            {ncr.status === 'UnderInvestigation' && (
              <Button
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleCompleteInvestigation}
                loading={setRootCause.isPending}
                className="!border-slate-300"
              >
                Araştırmayı Tamamla
              </Button>
            )}
            {ncr.status === 'PendingDisposition' && (
              <Button
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleClose}
                loading={closeNcr.isPending}
                type="primary"
                className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              >
                Kapat
              </Button>
            )}
            {ncr.status !== 'Closed' && ncr.status !== 'Cancelled' && (
              <Button
                icon={<XMarkIcon className="w-4 h-4" />}
                onClick={handleCancel}
                loading={cancelNcr.isPending}
                danger
              >
                İptal Et
              </Button>
            )}
          </Space>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <Row gutter={[24, 24]} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="Kaynak"
                value={sourceLabels[ncr.source]}
                prefix={<DocumentTextIcon className="w-5 h-5 text-slate-400" />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Ciddiyet"
                value={sevConfig.label}
                valueStyle={{ color: ncr.severity === 'Critical' ? '#dc2626' : ncr.severity === 'Major' ? '#f59e0b' : '#64748b' }}
                prefix={<ExclamationCircleIcon className="w-5 h-5" />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Etkilenen Miktar"
                value={ncr.affectedQuantity}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Aksiyonlar"
                value={ncr.containmentActions?.length || 0}
                suffix={`/ ${ncr.containmentActions?.filter((a: NcrContainmentActionDto) => a.isCompleted).length || 0} tamamlandı`}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={16}>
            <Card title="NCR Bilgileri" className="mb-6">
              <Descriptions
                bordered
                column={{ xs: 1, sm: 2 }}
                size="small"
                className="[&_.ant-descriptions-item-label]:!bg-slate-50 [&_.ant-descriptions-item-label]:!text-slate-500"
              >
                <Descriptions.Item label="NCR No">{ncr.ncrNumber}</Descriptions.Item>
                <Descriptions.Item label="Başlık">{ncr.title}</Descriptions.Item>
                <Descriptions.Item label="Kaynak">{sourceLabels[ncr.source]}</Descriptions.Item>
                <Descriptions.Item label="Ciddiyet"><Tag color={sevConfig.color}>{sevConfig.label}</Tag></Descriptions.Item>
                <Descriptions.Item label="Durum">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: sConfig.bgColor, color: sConfig.color }}>
                    {sConfig.label}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Etkilenen Miktar">{ncr.affectedQuantity}</Descriptions.Item>
                {ncr.defectType && <Descriptions.Item label="Hata Tipi">{ncr.defectType}</Descriptions.Item>}
                {ncr.productName && <Descriptions.Item label="Ürün">{ncr.productName}</Descriptions.Item>}
                {ncr.customerName && <Descriptions.Item label="Müşteri">{ncr.customerName}</Descriptions.Item>}
                {ncr.supplierName && <Descriptions.Item label="Tedarikçi">{ncr.supplierName}</Descriptions.Item>}
                <Descriptions.Item label="Oluşturulma">{dayjs(ncr.createdAt).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>
                <Descriptions.Item label="Oluşturan">{ncr.createdBy}</Descriptions.Item>
                <Descriptions.Item label="Açıklama" span={2}>{ncr.description}</Descriptions.Item>
                {ncr.rootCause && <Descriptions.Item label="Kök Neden" span={2}>{ncr.rootCause}</Descriptions.Item>}
                {ncr.disposition && <Descriptions.Item label="Karar">{ncr.disposition}</Descriptions.Item>}
              </Descriptions>
            </Card>

            {ncr.containmentActions && ncr.containmentActions.length > 0 && (
              <Card title={`Önleme Aksiyonları (${ncr.containmentActions.length})`}>
                <Table
                  columns={actionColumns}
                  dataSource={ncr.containmentActions}
                  rowKey="id"
                  pagination={false}
                  className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase"
                />
              </Card>
            )}
          </Col>

          <Col span={8}>
            <Card title="Durum Geçmişi">
              <Timeline
                items={[
                  {
                    color: 'green',
                    children: (
                      <div>
                        <p className="font-medium text-slate-900 m-0">Oluşturuldu</p>
                        <p className="text-xs text-slate-500 m-0">{dayjs(ncr.createdAt).format('DD.MM.YYYY HH:mm')}</p>
                      </div>
                    ),
                  },
                  ...(ncr.investigationStartedAt ? [{
                    color: 'blue' as const,
                    children: (
                      <div>
                        <p className="font-medium text-slate-900 m-0">Araştırma Başladı</p>
                        <p className="text-xs text-slate-500 m-0">{dayjs(ncr.investigationStartedAt).format('DD.MM.YYYY HH:mm')}</p>
                      </div>
                    ),
                  }] : []),
                  ...(ncr.investigationCompletedAt ? [{
                    color: 'blue' as const,
                    children: (
                      <div>
                        <p className="font-medium text-slate-900 m-0">Araştırma Tamamlandı</p>
                        <p className="text-xs text-slate-500 m-0">{dayjs(ncr.investigationCompletedAt).format('DD.MM.YYYY HH:mm')}</p>
                      </div>
                    ),
                  }] : []),
                  ...(ncr.closedAt ? [{
                    color: 'gray' as const,
                    children: (
                      <div>
                        <p className="font-medium text-slate-900 m-0">Kapatıldı</p>
                        <p className="text-xs text-slate-500 m-0">{dayjs(ncr.closedAt).format('DD.MM.YYYY HH:mm')}</p>
                      </div>
                    ),
                  }] : []),
                ]}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
