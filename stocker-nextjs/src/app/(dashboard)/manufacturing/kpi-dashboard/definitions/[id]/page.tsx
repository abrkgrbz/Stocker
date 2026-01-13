'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Descriptions, Tag, Card, Row, Col, Statistic, Table, Empty, Progress } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  PencilIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useKpiDefinition, useKpiValues } from '@/lib/api/hooks/useManufacturing';
import type { KpiValueListDto } from '@/lib/api/services/manufacturing.types';
import { KpiCategory } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const categoryConfig: Record<KpiCategory, { color: string; bgColor: string; label: string }> = {
  [KpiCategory.Efficiency]: { color: '#3b82f6', bgColor: '#dbeafe', label: 'Verimlilik' },
  [KpiCategory.Quality]: { color: '#22c55e', bgColor: '#dcfce7', label: 'Kalite' },
  [KpiCategory.Delivery]: { color: '#f97316', bgColor: '#fed7aa', label: 'Teslimat' },
  [KpiCategory.Cost]: { color: '#8b5cf6', bgColor: '#ede9fe', label: 'Maliyet' },
  [KpiCategory.Safety]: { color: '#ef4444', bgColor: '#fee2e2', label: 'Güvenlik' },
};

export default function KpiDefinitionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const definitionId = params.id as string;

  const { data: definition, isLoading: defLoading, error: defError } = useKpiDefinition(definitionId);
  const { data: allValues = [], isLoading: valuesLoading } = useKpiValues({ kpiDefinitionId: definitionId });

  const isLoading = defLoading || valuesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (defError || !definition) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto mt-20">
          <ExclamationTriangleIcon className="w-12 h-12 text-slate-300 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">KPI Bulunamadı</h2>
          <p className="text-slate-500 mb-6">İstenen KPI tanımı bulunamadı veya bir hata oluştu.</p>
          <Button onClick={() => router.push('/manufacturing/kpi-dashboard/definitions')} className="!border-slate-300">
            KPI Listesine Dön
          </Button>
        </div>
      </div>
    );
  }

  const cfg = categoryConfig[definition.category] || { color: '#64748b', bgColor: '#f1f5f9', label: definition.category };

  // Sort values by date descending
  const sortedValues = [...allValues].sort((a, b) =>
    new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
  );
  const latestValue = sortedValues[0]?.value || 0;
  const previousValue = sortedValues[1]?.value || 0;
  const valueCount = sortedValues.length;

  // Calculate trend
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (sortedValues.length >= 2) {
    if (latestValue > previousValue) trend = 'up';
    else if (latestValue < previousValue) trend = 'down';
  }

  // Calculate status
  let status: 'good' | 'warning' | 'critical' = 'good';
  if (definition.criticalThreshold !== undefined && latestValue <= definition.criticalThreshold) {
    status = 'critical';
  } else if (definition.warningThreshold !== undefined && latestValue <= definition.warningThreshold) {
    status = 'warning';
  }

  const progressPct = definition.targetValue ? Math.min(Math.round((latestValue / definition.targetValue) * 100), 100) : 0;
  const progressColor = status === 'good' ? '#22c55e' : status === 'warning' ? '#f97316' : '#ef4444';

  const valueColumns: ColumnsType<KpiValueListDto> = [
    {
      title: 'Tarih',
      dataIndex: 'recordDate',
      key: 'recordDate',
      render: (date) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Değer',
      dataIndex: 'value',
      key: 'value',
      align: 'right',
      render: (val) => (
        <span className="font-medium text-slate-900">
          {val.toLocaleString('tr-TR')} {definition.unit}
        </span>
      ),
    },
    {
      title: 'Hedef',
      key: 'target',
      align: 'right',
      render: () => definition.targetValue ? (
        <span className="text-slate-500">
          {definition.targetValue.toLocaleString('tr-TR')} {definition.unit}
        </span>
      ) : '-',
    },
    {
      title: 'Başarı',
      key: 'achievement',
      align: 'right',
      width: 120,
      render: (_, record) => {
        if (!definition.targetValue) return '-';
        const pct = Math.round((record.value / definition.targetValue) * 100);
        return <span className={pct >= 100 ? 'text-green-600 font-medium' : 'text-slate-600'}>%{pct}</span>;
      },
    },
    {
      title: 'Notlar',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => notes || '-',
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
            <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()} type="text" className="!text-slate-500 hover:!text-slate-800" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-900 m-0">{definition.name}</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>{cfg.label}</span>
              </div>
              <p className="text-sm text-slate-400 m-0">{definition.code}</p>
            </div>
          </div>
          <Space>
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/manufacturing/kpi-dashboard/definitions/${definitionId}/edit`)}
            >
              Düzenle
            </Button>
            <Button
              type="primary"
              onClick={() => router.push('/manufacturing/kpi-dashboard/values/new')}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
            >
              Değer Ekle
            </Button>
          </Space>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <Row gutter={[24, 24]} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="Mevcut Değer"
                value={latestValue}
                precision={2}
                suffix={definition.unit}
                valueStyle={{ color: '#1e293b', fontWeight: 600 }}
                prefix={
                  status === 'good' ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> :
                  status === 'warning' ? <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" /> :
                  <XCircleIcon className="w-5 h-5 text-red-500" />
                }
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Hedef Değer"
                value={definition.targetValue || 0}
                precision={2}
                suffix={definition.unit}
                valueStyle={{ color: '#64748b' }}
              />
              {definition.targetValue && (
                <div className="mt-2">
                  <Progress percent={progressPct} size="small" strokeColor={progressColor} showInfo={false} />
                </div>
              )}
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Trend"
                value={trend === 'up' ? 'Yükseliyor' : trend === 'down' ? 'Düşüyor' : 'Sabit'}
                prefix={
                  trend === 'up' ? <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" /> :
                  trend === 'down' ? <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" /> :
                  <ChartBarIcon className="w-5 h-5 text-slate-400" />
                }
                valueStyle={{ color: trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#64748b' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Kayıt Sayısı"
                value={valueCount}
                suffix="değer"
                valueStyle={{ color: '#64748b' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={16}>
            <Card title="KPI Bilgileri" className="mb-6">
              <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" className="[&_.ant-descriptions-item-label]:!bg-slate-50 [&_.ant-descriptions-item-label]:!text-slate-500">
                <Descriptions.Item label="KPI Kodu">{definition.code}</Descriptions.Item>
                <Descriptions.Item label="KPI Adı">{definition.name}</Descriptions.Item>
                <Descriptions.Item label="Kategori">
                  <Tag color={cfg.color}>{cfg.label}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Birim">{definition.unit}</Descriptions.Item>
                <Descriptions.Item label="Hedef Değer">
                  {definition.targetValue !== undefined ? `${definition.targetValue} ${definition.unit}` : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Uyarı Eşiği">
                  {definition.warningThreshold !== undefined ? (
                    <span className="text-orange-600">{definition.warningThreshold} {definition.unit}</span>
                  ) : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Kritik Eşik">
                  {definition.criticalThreshold !== undefined ? (
                    <span className="text-red-600">{definition.criticalThreshold} {definition.unit}</span>
                  ) : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Aktif">
                  {definition.isActive ? <Tag color="success">Aktif</Tag> : <Tag>Pasif</Tag>}
                </Descriptions.Item>
                {definition.formula && (
                  <Descriptions.Item label="Formül" span={2}>
                    <code className="bg-slate-100 px-2 py-1 rounded text-sm">{definition.formula}</code>
                  </Descriptions.Item>
                )}
                {definition.description && (
                  <Descriptions.Item label="Açıklama" span={2}>{definition.description}</Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            <Card title={`Değer Geçmişi (${valueCount})`}>
              <Table
                columns={valueColumns}
                dataSource={sortedValues}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Henüz değer kaydı yok" /> }}
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase"
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card title="Performans Özeti">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-600">Hedef Başarısı</span>
                    <span className="text-sm font-medium text-slate-900">%{progressPct}</span>
                  </div>
                  <Progress percent={progressPct} strokeColor={progressColor} />
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="text-sm font-medium text-slate-700 mb-3">Durum</div>
                  <div className="flex items-center gap-2">
                    {status === 'good' && (
                      <>
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-green-600 font-medium">Hedefte</span>
                      </>
                    )}
                    {status === 'warning' && (
                      <>
                        <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
                        <span className="text-orange-600 font-medium">Uyarı</span>
                      </>
                    )}
                    {status === 'critical' && (
                      <>
                        <XCircleIcon className="w-5 h-5 text-red-500" />
                        <span className="text-red-600 font-medium">Kritik</span>
                      </>
                    )}
                  </div>
                </div>

                {sortedValues.length > 0 && (
                  <div className="pt-4 border-t border-slate-200">
                    <div className="text-sm font-medium text-slate-700 mb-3">Son Kayıtlar</div>
                    <div className="space-y-2">
                      {sortedValues.slice(0, 5).map((v) => (
                        <div key={v.id} className="flex justify-between text-sm">
                          <span className="text-slate-500">{dayjs(v.recordDate).format('DD.MM.YYYY')}</span>
                          <span className="font-medium text-slate-900">{v.value} {definition.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
