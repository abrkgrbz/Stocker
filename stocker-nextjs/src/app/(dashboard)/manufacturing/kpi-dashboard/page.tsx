'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Row, Col, Progress, Tag, Table, Empty, Button, Space, Select, DatePicker } from 'antd';
import {
  ArrowPathIcon,
  PlusIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useKpiDefinitions, useKpiValues } from '@/lib/api/hooks/useManufacturing';
import type { KpiDefinitionListDto, KpiValueListDto } from '@/lib/api/services/manufacturing.types';
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

interface KpiCardData {
  id: string;
  name: string;
  code: string;
  category: KpiCategory;
  currentValue: number;
  targetValue?: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

export default function KpiDashboardPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<KpiCategory | 'all'>('all');

  const { data: definitions = [], isLoading: definitionsLoading, refetch: refetchDefinitions } = useKpiDefinitions();
  const { data: values = [], isLoading: valuesLoading, refetch: refetchValues } = useKpiValues();

  const isLoading = definitionsLoading || valuesLoading;
  const refetch = () => { refetchDefinitions(); refetchValues(); };

  // Combine definitions with their latest values
  const kpiCards: KpiCardData[] = useMemo(() => {
    return definitions.map((def) => {
      const latestValue = values
        .filter((v) => v.kpiDefinitionId === def.id)
        .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())[0];

      const currentValue = latestValue?.value || 0;
      const targetValue = def.targetValue;
      const warningThreshold = def.warningThreshold;
      const criticalThreshold = def.criticalThreshold;

      let status: 'good' | 'warning' | 'critical' = 'good';
      if (criticalThreshold !== undefined && currentValue <= criticalThreshold) {
        status = 'critical';
      } else if (warningThreshold !== undefined && currentValue <= warningThreshold) {
        status = 'warning';
      }

      // Determine trend based on recent values
      const recentValues = values
        .filter((v) => v.kpiDefinitionId === def.id)
        .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())
        .slice(0, 2);

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentValues.length >= 2) {
        if (recentValues[0].value > recentValues[1].value) trend = 'up';
        else if (recentValues[0].value < recentValues[1].value) trend = 'down';
      }

      return {
        id: def.id,
        name: def.name,
        code: def.code,
        category: def.category,
        currentValue,
        targetValue,
        unit: def.unit,
        trend,
        status,
      };
    });
  }, [definitions, values]);

  const filteredKpis = useMemo(() => {
    if (selectedCategory === 'all') return kpiCards;
    return kpiCards.filter((kpi) => kpi.category === selectedCategory);
  }, [kpiCards, selectedCategory]);

  const stats = useMemo(() => ({
    total: definitions.length,
    good: kpiCards.filter((k) => k.status === 'good').length,
    warning: kpiCards.filter((k) => k.status === 'warning').length,
    critical: kpiCards.filter((k) => k.status === 'critical').length,
  }), [definitions, kpiCards]);

  const getStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
      case 'critical': return <XCircleIcon className="w-5 h-5 text-red-500" />;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
      case 'stable': return <span className="text-slate-400">—</span>;
    }
  };

  const columns: ColumnsType<KpiCardData> = [
    {
      title: 'KPI',
      key: 'name',
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.name}</div>
          <div className="text-xs text-slate-500">{record.code}</div>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (cat: KpiCategory) => {
        const cfg = categoryConfig[cat];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Mevcut Değer',
      key: 'currentValue',
      align: 'right',
      render: (_, record) => (
        <span className="font-semibold text-slate-900">
          {record.currentValue.toLocaleString('tr-TR')} {record.unit}
        </span>
      ),
    },
    {
      title: 'Hedef',
      key: 'target',
      align: 'right',
      render: (_, record) => record.targetValue ? (
        <span className="text-slate-600">
          {record.targetValue.toLocaleString('tr-TR')} {record.unit}
        </span>
      ) : '-',
    },
    {
      title: 'İlerleme',
      key: 'progress',
      width: 150,
      render: (_, record) => {
        if (!record.targetValue) return '-';
        const pct = Math.min(Math.round((record.currentValue / record.targetValue) * 100), 100);
        const color = record.status === 'good' ? '#22c55e' : record.status === 'warning' ? '#f97316' : '#ef4444';
        return <Progress percent={pct} size="small" strokeColor={color} />;
      },
    },
    {
      title: 'Trend',
      key: 'trend',
      align: 'center',
      width: 80,
      render: (_, record) => getTrendIcon(record.trend),
    },
    {
      title: 'Durum',
      key: 'status',
      align: 'center',
      width: 80,
      render: (_, record) => getStatusIcon(record.status),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">KPI Dashboard</h1>
          <p className="text-slate-500 mt-1">Anahtar performans göstergelerini izleyin</p>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            onClick={refetch}
            loading={isLoading}
            className="!border-slate-300 !text-slate-700"
          >
            Yenile
          </Button>
          <Button
            icon={<Cog6ToothIcon className="w-4 h-4" />}
            onClick={() => router.push('/manufacturing/kpi-dashboard/definitions')}
            className="!border-slate-300 !text-slate-700"
          >
            KPI Tanımları
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/manufacturing/kpi-dashboard/values/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Değer Ekle
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {[
          { label: 'Toplam KPI', value: stats.total, icon: ChartBarIcon, color: '#64748b' },
          { label: 'Hedefte', value: stats.good, icon: CheckCircleIcon, color: '#22c55e' },
          { label: 'Uyarı', value: stats.warning, icon: ExclamationTriangleIcon, color: '#f97316' },
          { label: 'Kritik', value: stats.critical, icon: XCircleIcon, color: '#ef4444' },
        ].map((s, i) => (
          <div key={i} className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${s.color}15` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div className="text-2xl font-bold text-slate-900">{s.value}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* KPI Cards Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">KPI Genel Görünüm</h2>
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            style={{ width: 180 }}
            options={[
              { value: 'all', label: 'Tüm Kategoriler' },
              { value: KpiCategory.Efficiency, label: 'Verimlilik' },
              { value: KpiCategory.Quality, label: 'Kalite' },
              { value: KpiCategory.Delivery, label: 'Teslimat' },
              { value: KpiCategory.Cost, label: 'Maliyet' },
              { value: KpiCategory.Safety, label: 'Güvenlik' },
            ]}
          />
        </div>

        {filteredKpis.length > 0 ? (
          <Row gutter={[16, 16]}>
            {filteredKpis.map((kpi) => {
              const cfg = categoryConfig[kpi.category];
              const pct = kpi.targetValue ? Math.min(Math.round((kpi.currentValue / kpi.targetValue) * 100), 100) : 0;
              const progressColor = kpi.status === 'good' ? '#22c55e' : kpi.status === 'warning' ? '#f97316' : '#ef4444';

              return (
                <Col key={kpi.id} span={6}>
                  <Card
                    size="small"
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/manufacturing/kpi-dashboard/definitions/${kpi.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{kpi.name}</div>
                        <Tag color={cfg.color} className="mt-1">{cfg.label}</Tag>
                      </div>
                      {getStatusIcon(kpi.status)}
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-2xl font-bold text-slate-900">
                          {kpi.currentValue.toLocaleString('tr-TR')}
                        </div>
                        <div className="text-xs text-slate-500">{kpi.unit}</div>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        {getTrendIcon(kpi.trend)}
                      </div>
                    </div>
                    {kpi.targetValue && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Hedefe ilerleme</span>
                          <span>%{pct}</span>
                        </div>
                        <Progress percent={pct} size="small" strokeColor={progressColor} showInfo={false} />
                      </div>
                    )}
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <Card>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Henüz KPI tanımlanmamış"
            >
              <Button type="primary" onClick={() => router.push('/manufacturing/kpi-dashboard/definitions/new')}>
                KPI Tanımla
              </Button>
            </Empty>
          </Card>
        )}
      </div>

      {/* KPI Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">KPI Detay Tablosu</h2>
        <Table
          columns={columns}
          dataSource={filteredKpis}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="KPI bulunamadı" /> }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100"
        />
      </div>
    </div>
  );
}
