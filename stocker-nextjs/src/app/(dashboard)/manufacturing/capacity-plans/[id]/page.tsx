'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Descriptions, Tag, Table, Card, Row, Col, Statistic, Progress } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {
  useCapacityPlan,
  useCapacityRequirements,
  useCapacityExceptions,
  useExecuteCapacityPlan,
  useApproveCapacityPlan,
  useCancelCapacityPlan,
  useDeleteCapacityPlan,
} from '@/lib/api/hooks/useManufacturing';
import type { CapacityPlanStatus, CapacityRequirementDto, CapacityExceptionDto } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import { confirmDelete } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';

const statusConfig: Record<CapacityPlanStatus, { color: string; bgColor: string; label: string }> = {
  Draft: { color: '#64748b', bgColor: '#f1f5f9', label: 'Taslak' },
  Executed: { color: '#334155', bgColor: '#e2e8f0', label: 'Çalıştırıldı' },
  Approved: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Onaylı' },
  Cancelled: { color: '#94a3b8', bgColor: '#f8fafc', label: 'İptal' },
};

export default function CapacityPlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;

  const { data: plan, isLoading, error } = useCapacityPlan(planId);
  const { data: requirements = [] } = useCapacityRequirements(planId);
  const { data: exceptions = [] } = useCapacityExceptions(planId);
  const executePlan = useExecuteCapacityPlan();
  const approvePlan = useApproveCapacityPlan();
  const cancelPlan = useCancelCapacityPlan();
  const deletePlan = useDeleteCapacityPlan();

  const handleExecute = async () => {
    try {
      await executePlan.mutateAsync({ id: planId, data: {} });
    } catch {
      // Error handled by hook
    }
  };

  const handleApprove = async () => {
    try {
      await approvePlan.mutateAsync(planId);
    } catch {
      // Error handled by hook
    }
  };

  const handleCancel = async () => {
    try {
      await cancelPlan.mutateAsync(planId);
    } catch {
      // Error handled by hook
    }
  };

  const handleDelete = async () => {
    if (!plan) return;
    const confirmed = await confirmDelete('Kapasite Planı', plan.name);
    if (confirmed) {
      try {
        await deletePlan.mutateAsync(planId);
        router.push('/manufacturing/capacity-plans');
      } catch {
        // Error handled by hook
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto mt-20">
          <ExclamationTriangleIcon className="w-12 h-12 text-slate-300 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Plan Bulunamadı</h2>
          <p className="text-slate-500 mb-6">İstenen kapasite planı bulunamadı veya bir hata oluştu.</p>
          <Button onClick={() => router.push('/manufacturing/capacity-plans')} className="!border-slate-300">
            Planlara Dön
          </Button>
        </div>
      </div>
    );
  }

  const sConfig = statusConfig[plan.status] || { color: '#64748b', bgColor: '#f1f5f9', label: 'Bilinmiyor' };
  const overloadedCount = requirements.filter(r => r.isOverloaded).length;
  const unresolvedExceptions = exceptions.filter(e => !e.isResolved).length;

  const requirementColumns: ColumnsType<CapacityRequirementDto> = [
    { title: 'İş Merkezi', dataIndex: 'workCenterName', key: 'workCenterName' },
    { title: 'Dönem', key: 'period', render: (_, r) => `${dayjs(r.periodStart).format('DD.MM')} - ${dayjs(r.periodEnd).format('DD.MM.YYYY')}` },
    { title: 'Mevcut Kapasite', dataIndex: 'availableCapacity', key: 'availableCapacity', align: 'right', render: (v) => `${v} saat` },
    { title: 'Gerekli Kapasite', dataIndex: 'requiredCapacity', key: 'requiredCapacity', align: 'right', render: (v) => `${v} saat` },
    {
      title: 'Kullanım',
      dataIndex: 'utilizationPercentage',
      key: 'utilizationPercentage',
      width: 180,
      render: (v, r) => (
        <Progress
          percent={Math.min(v, 100)}
          size="small"
          strokeColor={r.isOverloaded ? '#dc2626' : '#1e293b'}
          format={() => `${v.toFixed(0)}%`}
        />
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isOverloaded',
      key: 'isOverloaded',
      align: 'center',
      render: (overloaded) => overloaded ? <Tag color="error">Aşırı Yük</Tag> : <Tag color="success">Normal</Tag>,
    },
  ];

  const exceptionColumns: ColumnsType<CapacityExceptionDto> = [
    { title: 'İş Merkezi', dataIndex: 'workCenterName', key: 'workCenterName' },
    { title: 'Tip', dataIndex: 'exceptionType', key: 'exceptionType' },
    { title: 'Açıklama', dataIndex: 'description', key: 'description' },
    { title: 'Çözüldü', dataIndex: 'isResolved', key: 'isResolved', align: 'center', render: (resolved) => resolved ? <Tag color="success">Evet</Tag> : <Tag color="warning">Hayır</Tag> },
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
                <h1 className="text-xl font-semibold text-slate-900 m-0">{plan.name}</h1>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                  style={{ backgroundColor: sConfig.bgColor, color: sConfig.color }}
                >
                  {sConfig.label}
                </span>
              </div>
              <p className="text-sm text-slate-400 m-0">
                {dayjs(plan.planningHorizonStart).format('DD.MM.YYYY')} - {dayjs(plan.planningHorizonEnd).format('DD.MM.YYYY')}
              </p>
            </div>
          </div>
          <Space size="small">
            {plan.status === 'Draft' && (
              <Button
                icon={<PlayIcon className="w-4 h-4" />}
                onClick={handleExecute}
                loading={executePlan.isPending}
                className="!border-slate-300"
              >
                Çalıştır
              </Button>
            )}
            {plan.status === 'Executed' && (
              <Button
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleApprove}
                loading={approvePlan.isPending}
                type="primary"
                className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              >
                Onayla
              </Button>
            )}
            {plan.status !== 'Cancelled' && plan.status !== 'Approved' && (
              <Button
                icon={<XMarkIcon className="w-4 h-4" />}
                onClick={handleCancel}
                loading={cancelPlan.isPending}
                danger
              >
                İptal Et
              </Button>
            )}
            {plan.status === 'Draft' && (
              <Button danger onClick={handleDelete} loading={deletePlan.isPending}>
                Sil
              </Button>
            )}
          </Space>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <Row gutter={[24, 24]} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic title="İş Merkezi Sayısı" value={requirements.length} prefix={<Cog6ToothIcon className="w-5 h-5 text-slate-400" />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Aşırı Yüklü" value={overloadedCount} valueStyle={{ color: overloadedCount > 0 ? '#dc2626' : '#16a34a' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Çözülmemiş İstisna" value={unresolvedExceptions} valueStyle={{ color: unresolvedExceptions > 0 ? '#f59e0b' : '#16a34a' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Toplam İstisna" value={exceptions.length} prefix={<ChartBarIcon className="w-5 h-5 text-slate-400" />} />
            </Card>
          </Col>
        </Row>

        <Card title="Plan Bilgileri" className="mb-6">
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2, md: 3, lg: 4 }}
            size="small"
            className="[&_.ant-descriptions-item-label]:!bg-slate-50 [&_.ant-descriptions-item-label]:!text-slate-500"
          >
            <Descriptions.Item label="Plan Adı">{plan.name}</Descriptions.Item>
            <Descriptions.Item label="Durum">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: sConfig.bgColor, color: sConfig.color }}>
                {sConfig.label}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Başlangıç">{dayjs(plan.planningHorizonStart).format('DD.MM.YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Bitiş">{dayjs(plan.planningHorizonEnd).format('DD.MM.YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Hazırlık Süreleri">{plan.includeSetupTimes ? 'Dahil' : 'Hariç'}</Descriptions.Item>
            <Descriptions.Item label="Verimlilik">{plan.includeEfficiency ? 'Dahil' : 'Hariç'}</Descriptions.Item>
            {plan.mrpPlanId && <Descriptions.Item label="MRP Planı">{plan.mrpPlanId}</Descriptions.Item>}
            {plan.description && <Descriptions.Item label="Açıklama" span={2}>{plan.description}</Descriptions.Item>}
          </Descriptions>
        </Card>

        <Card title={`Kapasite Gereksinimleri (${requirements.length})`} className="mb-6">
          <Table
            columns={requirementColumns}
            dataSource={requirements}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase"
          />
        </Card>

        {exceptions.length > 0 && (
          <Card title={`İstisnalar (${exceptions.length})`}>
            <Table
              columns={exceptionColumns}
              dataSource={exceptions}
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
