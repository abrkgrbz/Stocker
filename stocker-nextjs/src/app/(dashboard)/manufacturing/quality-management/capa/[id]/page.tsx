'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Descriptions, Tag, Table, Card, Row, Col, Statistic, Progress, Timeline } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  PlayIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  useCapa,
  useUpdateCapaProgress,
  useVerifyCapa,
  useEvaluateCapaEffectiveness,
  useCloseCapa,
  useCancelCapa,
} from '@/lib/api/hooks/useManufacturing';
import type { CapaStatus, CapaType, CapaTaskDto } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const statusConfig: Record<CapaStatus, { color: string; bgColor: string; label: string; step: number }> = {
  Draft: { color: '#94a3b8', bgColor: '#f8fafc', label: 'Taslak', step: 0 },
  Open: { color: '#64748b', bgColor: '#f1f5f9', label: 'Açık', step: 1 },
  Planning: { color: '#475569', bgColor: '#e2e8f0', label: 'Planlama', step: 2 },
  Implementation: { color: '#334155', bgColor: '#cbd5e1', label: 'Uygulama', step: 3 },
  Verification: { color: '#1e293b', bgColor: '#94a3b8', label: 'Doğrulama', step: 4 },
  EffectivenessReview: { color: '#475569', bgColor: '#cbd5e1', label: 'Etkinlik Değ.', step: 5 },
  Closed: { color: '#16a34a', bgColor: '#dcfce7', label: 'Kapatıldı', step: 6 },
  Cancelled: { color: '#ef4444', bgColor: '#fee2e2', label: 'İptal', step: -1 },
};

const typeConfig: Record<CapaType, { color: string; label: string }> = {
  Corrective: { color: 'orange', label: 'Düzeltici' },
  Preventive: { color: 'blue', label: 'Önleyici' },
};

export default function CapaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const capaId = params.id as string;

  const { data: capa, isLoading, error } = useCapa(capaId);
  const updateProgress = useUpdateCapaProgress();
  const verifyCapa = useVerifyCapa();
  const evaluateEffectiveness = useEvaluateCapaEffectiveness();
  const closeCapa = useCloseCapa();
  const cancelCapa = useCancelCapa();

  const handleUpdateProgress = async (progress: number) => {
    try { await updateProgress.mutateAsync({ id: capaId, data: { progress } }); } catch { /* */ }
  };
  const handleVerify = async () => {
    try { await verifyCapa.mutateAsync({ id: capaId, data: { verificationMethod: 'Doğrulama yapıldı', verificationResult: 'Başarılı' } }); } catch { /* */ }
  };
  const handleEvaluate = async () => {
    try { await evaluateEffectiveness.mutateAsync({ id: capaId, data: { effectivenessEvaluation: 'Etkin', effectivenessScore: 100 } }); } catch { /* */ }
  };
  const handleClose = async () => {
    try { await closeCapa.mutateAsync({ id: capaId, data: { closureNotes: 'Kapatıldı' } }); } catch { /* */ }
  };
  const handleCancel = async () => {
    try { await cancelCapa.mutateAsync(capaId); } catch { /* */ }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !capa) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto mt-20">
          <ExclamationTriangleIcon className="w-12 h-12 text-slate-300 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">CAPA Bulunamadı</h2>
          <p className="text-slate-500 mb-6">İstenen CAPA bulunamadı veya bir hata oluştu.</p>
          <Button onClick={() => router.push('/manufacturing/quality-management/capa')} className="!border-slate-300">
            CAPA Listesine Dön
          </Button>
        </div>
      </div>
    );
  }

  const sConfig = statusConfig[capa.status] || { color: '#64748b', bgColor: '#f1f5f9', label: 'Bilinmiyor', step: 0 };
  const tConfig = typeConfig[capa.type] || { color: 'default', label: capa.type };
  const isOverdue = capa.dueDate && dayjs(capa.dueDate).isBefore(dayjs()) && capa.status !== 'Closed' && capa.status !== 'Cancelled';
  const completedTasks = capa.tasks?.filter((t: CapaTaskDto) => t.isCompleted).length || 0;
  const totalTasks = capa.tasks?.length || 0;
  const progressPercent = sConfig.step >= 0 ? Math.round((sConfig.step / 6) * 100) : 0;

  const taskColumns: ColumnsType<CapaTaskDto> = [
    { title: 'Görev', dataIndex: 'taskDescription', key: 'taskDescription' },
    { title: 'Sorumlu', dataIndex: 'assignedUserName', key: 'assignedUserName' },
    { title: 'Hedef Tarih', dataIndex: 'targetDate', key: 'targetDate', render: (d) => dayjs(d).format('DD.MM.YYYY') },
    { title: 'Tamamlanma', dataIndex: 'completedAt', key: 'completedAt', render: (d) => d ? dayjs(d).format('DD.MM.YYYY') : '-' },
    { title: 'Durum', dataIndex: 'isCompleted', key: 'isCompleted', align: 'center', render: (c) => c ? <Tag color="success">Tamamlandı</Tag> : <Tag>Bekliyor</Tag> },
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
            <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()} type="text" className="!text-slate-500 hover:!text-slate-800" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-900 m-0">{capa.capaNumber}</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: sConfig.bgColor, color: sConfig.color }}>{sConfig.label}</span>
                <Tag color={tConfig.color}>{tConfig.label}</Tag>
                {isOverdue && <Tag color="error">Gecikmiş</Tag>}
              </div>
              <p className="text-sm text-slate-400 m-0">{capa.title}</p>
            </div>
          </div>
          <Space size="small">
            {capa.status === 'Draft' && <Button icon={<PlayIcon className="w-4 h-4" />} onClick={() => handleUpdateProgress(10)} loading={updateProgress.isPending}>Aç</Button>}
            {capa.status === 'Open' && <Button icon={<PlayIcon className="w-4 h-4" />} onClick={() => handleUpdateProgress(25)} loading={updateProgress.isPending}>Planlamaya Başla</Button>}
            {capa.status === 'Planning' && <Button icon={<PlayIcon className="w-4 h-4" />} onClick={() => handleUpdateProgress(50)} loading={updateProgress.isPending}>Uygulamaya Geç</Button>}
            {capa.status === 'Implementation' && <Button icon={<CheckCircleIcon className="w-4 h-4" />} onClick={() => handleUpdateProgress(75)} loading={updateProgress.isPending}>Uygulamayı Tamamla</Button>}
            {capa.status === 'Verification' && <Button icon={<CheckCircleIcon className="w-4 h-4" />} onClick={handleVerify} loading={verifyCapa.isPending}>Doğrula</Button>}
            {capa.status === 'EffectivenessReview' && <Button icon={<CheckCircleIcon className="w-4 h-4" />} onClick={handleEvaluate} loading={evaluateEffectiveness.isPending}>Etkinliği Değerlendir</Button>}
            {capa.status === 'EffectivenessReview' && <Button type="primary" icon={<CheckCircleIcon className="w-4 h-4" />} onClick={handleClose} loading={closeCapa.isPending} className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900">Kapat</Button>}
            {capa.status !== 'Closed' && capa.status !== 'Cancelled' && <Button danger icon={<XMarkIcon className="w-4 h-4" />} onClick={handleCancel} loading={cancelCapa.isPending}>İptal</Button>}
          </Space>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <Row gutter={[24, 24]} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic title="Tip" value={tConfig.label} prefix={<ClipboardDocumentCheckIcon className="w-5 h-5 text-slate-400" />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Hedef Tarih" value={dayjs(capa.dueDate).format('DD.MM.YYYY')} valueStyle={{ color: isOverdue ? '#dc2626' : '#334155' }} prefix={<ClockIcon className="w-5 h-5" />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Görevler" value={`${completedTasks}/${totalTasks}`} suffix="tamamlandı" />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <div className="mb-2"><span className="text-slate-500 text-sm">İlerleme</span></div>
              <Progress percent={capa.progress || progressPercent} strokeColor="#1e293b" trailColor="#e2e8f0" />
            </Card>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={16}>
            <Card title="CAPA Bilgileri" className="mb-6">
              <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" className="[&_.ant-descriptions-item-label]:!bg-slate-50 [&_.ant-descriptions-item-label]:!text-slate-500">
                <Descriptions.Item label="CAPA No">{capa.capaNumber}</Descriptions.Item>
                <Descriptions.Item label="Başlık">{capa.title}</Descriptions.Item>
                <Descriptions.Item label="Tip"><Tag color={tConfig.color}>{tConfig.label}</Tag></Descriptions.Item>
                <Descriptions.Item label="Durum"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: sConfig.bgColor, color: sConfig.color }}>{sConfig.label}</span></Descriptions.Item>
                {capa.responsibleUserName && <Descriptions.Item label="Sorumlu">{capa.responsibleUserName}</Descriptions.Item>}
                <Descriptions.Item label="Hedef Tarih"><span className={isOverdue ? 'text-red-600' : ''}>{dayjs(capa.dueDate).format('DD.MM.YYYY')}</span></Descriptions.Item>
                {capa.ncrNumber && <Descriptions.Item label="İlişkili NCR">{capa.ncrNumber}</Descriptions.Item>}
                <Descriptions.Item label="Oluşturulma">{dayjs(capa.createdAt).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>
                <Descriptions.Item label="Açıklama" span={2}>{capa.description}</Descriptions.Item>
                {capa.rootCauseAnalysis && <Descriptions.Item label="Kök Neden Analizi" span={2}>{capa.rootCauseAnalysis}</Descriptions.Item>}
                {capa.proposedActions && <Descriptions.Item label="Önerilen Aksiyonlar" span={2}>{capa.proposedActions}</Descriptions.Item>}
                {capa.verificationResult && <Descriptions.Item label="Doğrulama Sonucu" span={2}>{capa.verificationResult}</Descriptions.Item>}
                {capa.effectivenessEvaluation && <Descriptions.Item label="Etkinlik Değerlendirmesi" span={2}>{capa.effectivenessEvaluation}</Descriptions.Item>}
              </Descriptions>
            </Card>

            {capa.tasks && capa.tasks.length > 0 && (
              <Card title={`Görevler (${completedTasks}/${totalTasks})`}>
                <Table columns={taskColumns} dataSource={capa.tasks} rowKey="id" pagination={false} className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase" />
              </Card>
            )}
          </Col>

          <Col span={8}>
            <Card title="Süreç Durumu">
              <Timeline
                items={[
                  { color: sConfig.step >= 1 ? 'green' : 'gray', children: <div><p className="font-medium m-0">Açık</p><p className="text-xs text-slate-500 m-0">CAPA açıldı</p></div> },
                  { color: sConfig.step >= 2 ? 'green' : 'gray', children: <div><p className="font-medium m-0">Planlama</p><p className="text-xs text-slate-500 m-0">Aksiyon planlanıyor</p></div> },
                  { color: sConfig.step >= 3 ? 'green' : 'gray', children: <div><p className="font-medium m-0">Uygulama</p><p className="text-xs text-slate-500 m-0">Aksiyonlar uygulanıyor</p></div> },
                  { color: sConfig.step >= 4 ? 'green' : 'gray', children: <div><p className="font-medium m-0">Doğrulama</p><p className="text-xs text-slate-500 m-0">Sonuçlar doğrulanıyor</p></div> },
                  { color: sConfig.step >= 5 ? 'green' : 'gray', children: <div><p className="font-medium m-0">Etkinlik Değerlendirme</p><p className="text-xs text-slate-500 m-0">Etkinlik değerlendiriliyor</p></div> },
                  { color: sConfig.step >= 6 ? 'green' : 'gray', children: <div><p className="font-medium m-0">Kapatıldı</p><p className="text-xs text-slate-500 m-0">CAPA tamamlandı</p></div> },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
