'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Descriptions, Tag, Table, Card, Row, Col, Statistic } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  useMaintenanceRecord,
  useStartMaintenanceRecord,
  useCompleteMaintenanceRecord,
  useCancelMaintenanceRecord,
} from '@/lib/api/hooks/useManufacturing';
import type { MaintenanceRecordStatus, MaintenanceType } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const statusConfig: Record<MaintenanceRecordStatus, { color: string; bgColor: string; label: string }> = {
  Pending: { color: '#64748b', bgColor: '#f1f5f9', label: 'Beklemede' },
  InProgress: { color: '#334155', bgColor: '#e2e8f0', label: 'Devam Ediyor' },
  Completed: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Tamamlandı' },
  Cancelled: { color: '#94a3b8', bgColor: '#f8fafc', label: 'İptal' },
};

const typeLabels: Record<MaintenanceType, string> = {
  Preventive: 'Önleyici Bakım',
  Corrective: 'Düzeltici Bakım',
  Predictive: 'Tahminsel Bakım',
  Breakdown: 'Arıza Bakımı',
};

interface SparePartUsageDto {
  id: string;
  sparePartName: string;
  sparePartCode: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface TaskDto {
  id: string;
  taskName: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
}

export default function MaintenanceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const recordId = params.id as string;

  const { data: record, isLoading, error } = useMaintenanceRecord(recordId);
  const startRecord = useStartMaintenanceRecord();
  const completeRecord = useCompleteMaintenanceRecord();
  const cancelRecord = useCancelMaintenanceRecord();

  const handleStart = async () => {
    try {
      await startRecord.mutateAsync({ id: recordId, data: { performedBy: 'current-user' } });
    } catch {
      // Error handled by hook
    }
  };

  const handleComplete = async () => {
    try {
      await completeRecord.mutateAsync({ id: recordId, data: { laborHours: record?.laborHours || 0, laborCost: record?.laborCost || 0, findings: '', recommendations: '' } });
    } catch {
      // Error handled by hook
    }
  };

  const handleCancel = async () => {
    try {
      await cancelRecord.mutateAsync(recordId);
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

  if (error || !record) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto mt-20">
          <ExclamationTriangleIcon className="w-12 h-12 text-slate-300 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Kayıt Bulunamadı</h2>
          <p className="text-slate-500 mb-6">İstenen bakım kaydı bulunamadı veya bir hata oluştu.</p>
          <Button onClick={() => router.push('/manufacturing/maintenance')} className="!border-slate-300">
            Bakım Listesine Dön
          </Button>
        </div>
      </div>
    );
  }

  const sConfig = statusConfig[record.status] || { color: '#64748b', bgColor: '#f1f5f9', label: 'Bilinmiyor' };

  const sparePartColumns: ColumnsType<SparePartUsageDto> = [
    { title: 'Parça Kodu', dataIndex: 'sparePartCode', key: 'sparePartCode' },
    { title: 'Parça Adı', dataIndex: 'sparePartName', key: 'sparePartName' },
    { title: 'Miktar', dataIndex: 'quantity', key: 'quantity', align: 'right' },
    { title: 'Birim Fiyat', dataIndex: 'unitCost', key: 'unitCost', align: 'right', render: (v) => `₺${v.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` },
    { title: 'Toplam', dataIndex: 'totalCost', key: 'totalCost', align: 'right', render: (v) => `₺${v.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` },
  ];

  const taskColumns: ColumnsType<TaskDto> = [
    { title: 'Görev', dataIndex: 'taskName', key: 'taskName' },
    { title: 'Açıklama', dataIndex: 'description', key: 'description' },
    { title: 'Durum', dataIndex: 'isCompleted', key: 'isCompleted', align: 'center', render: (completed) => completed ? <Tag color="success">Tamamlandı</Tag> : <Tag>Bekliyor</Tag> },
    { title: 'Tamamlayan', dataIndex: 'completedBy', key: 'completedBy', render: (v) => v || '-' },
    { title: 'Tamamlanma', dataIndex: 'completedAt', key: 'completedAt', render: (v) => v ? dayjs(v).format('DD.MM.YYYY HH:mm') : '-' },
  ];

  const totalSparePartCost = record.spareParts?.reduce((sum: number, sp: SparePartUsageDto) => sum + sp.totalCost, 0) || 0;

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
                <h1 className="text-xl font-semibold text-slate-900 m-0">{record.recordNumber}</h1>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                  style={{ backgroundColor: sConfig.bgColor, color: sConfig.color }}
                >
                  {sConfig.label}
                </span>
                <Tag color="default" className="!bg-slate-100 !text-slate-700 !border-slate-200">
                  {typeLabels[record.maintenanceType]}
                </Tag>
              </div>
              <p className="text-sm text-slate-400 m-0">{record.machineName}</p>
            </div>
          </div>
          <Space size="small">
            {record.status === 'Pending' && (
              <Button
                icon={<PlayIcon className="w-4 h-4" />}
                onClick={handleStart}
                loading={startRecord.isPending}
                className="!border-slate-300"
              >
                Başlat
              </Button>
            )}
            {record.status === 'InProgress' && (
              <Button
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleComplete}
                loading={completeRecord.isPending}
                type="primary"
                className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              >
                Tamamla
              </Button>
            )}
            {record.status !== 'Completed' && record.status !== 'Cancelled' && (
              <Button
                icon={<XMarkIcon className="w-4 h-4" />}
                onClick={handleCancel}
                loading={cancelRecord.isPending}
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
                title="Bakım Tipi"
                value={typeLabels[record.maintenanceType]}
                prefix={<WrenchScrewdriverIcon className="w-5 h-5 text-slate-400" />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Planlanan Tarih"
                value={dayjs(record.scheduledDate).format('DD.MM.YYYY')}
                prefix={<ClockIcon className="w-5 h-5 text-slate-400" />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="İşçilik Saati"
                value={record.laborHours || 0}
                suffix="saat"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Yedek Parça Maliyeti"
                value={totalSparePartCost}
                precision={2}
                prefix="₺"
              />
            </Card>
          </Col>
        </Row>

        <Card title="Bakım Bilgileri" className="mb-6">
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2, md: 3, lg: 4 }}
            size="small"
            className="[&_.ant-descriptions-item-label]:!bg-slate-50 [&_.ant-descriptions-item-label]:!text-slate-500"
          >
            <Descriptions.Item label="Kayıt No">{record.recordNumber}</Descriptions.Item>
            <Descriptions.Item label="Makine">{record.machineName}</Descriptions.Item>
            <Descriptions.Item label="Bakım Tipi">{typeLabels[record.maintenanceType]}</Descriptions.Item>
            <Descriptions.Item label="Durum">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: sConfig.bgColor, color: sConfig.color }}>
                {sConfig.label}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Planlanan Tarih">{dayjs(record.scheduledDate).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>
            {record.startedAt && <Descriptions.Item label="Başlama">{dayjs(record.startedAt).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>}
            {record.completedAt && <Descriptions.Item label="Tamamlanma">{dayjs(record.completedAt).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>}
            {record.description && <Descriptions.Item label="Açıklama" span={2}>{record.description}</Descriptions.Item>}
            {record.findings && <Descriptions.Item label="Bulgular" span={2}>{record.findings}</Descriptions.Item>}
            {record.recommendations && <Descriptions.Item label="Öneriler" span={2}>{record.recommendations}</Descriptions.Item>}
          </Descriptions>
        </Card>

        {record.spareParts && record.spareParts.length > 0 && (
          <Card title={`Kullanılan Yedek Parçalar (${record.spareParts.length})`}>
            <Table
              columns={sparePartColumns}
              dataSource={record.spareParts}
              rowKey="id"
              pagination={false}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row className="bg-slate-50">
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <span className="font-bold text-slate-900">TOPLAM</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="right">
                      <span className="font-bold text-slate-900">
                        ₺{totalSparePartCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase"
            />
          </Card>
        )}
      </div>
    </div>
  );
}
