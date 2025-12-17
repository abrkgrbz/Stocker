'use client';

import React from 'react';
import { Typography, Space, Empty, Button } from 'antd';
import {
  FunnelPlotOutlined,
  DollarOutlined,
  TrophyOutlined,
  TeamOutlined,
  StarFilled,
  PlusOutlined
} from '@ant-design/icons';
import { AnimatedCard } from '../shared/AnimatedCard';
import { formatCurrency, formatPercent } from '@/lib/crm';
import type { Pipeline, Deal } from '@/lib/api/services/crm.service';

const { Text, Link } = Typography;

interface PipelineStatsProps {
  pipelines: Pipeline[];
  deals: Deal[];
  loading?: boolean;
}

export function PipelineStats({
  pipelines,
  deals,
  loading = false,
}: PipelineStatsProps) {
  // Find default or first active pipeline
  const activePipeline = pipelines.find((p: any) => p.isDefault && p.isActive)
    || pipelines.find((p: any) => p.isActive)
    || pipelines[0];

  if (!loading && !activePipeline) {
    return (
      <AnimatedCard title="Pipeline İstatistikleri" loading={loading}>
        <Empty
          image={
            <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mx-auto">
              <FunnelPlotOutlined className="text-slate-300" style={{ fontSize: 20 }} />
            </div>
          }
          imageStyle={{ height: 60 }}
          description={
            <div className="text-center">
              <div className="text-sm font-medium text-slate-600 mb-1">
                Aktif pipeline yok
              </div>
              <div className="text-xs text-slate-400 mb-4">
                Satış sürecinizi yönetmek için pipeline oluşturun
              </div>
              <Link href="/crm/pipelines">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="!bg-slate-900 !border-slate-900 hover:!bg-slate-800"
                >
                  Pipeline Oluştur
                </Button>
              </Link>
            </div>
          }
        />
      </AnimatedCard>
    );
  }

  // Filter deals for this pipeline
  const pipelineDeals = deals.filter(d => d.pipelineId === activePipeline?.id);

  // Calculate statistics
  const totalValue = pipelineDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const avgDealSize = pipelineDeals.length > 0 ? totalValue / pipelineDeals.length : 0;
  const wonDeals = pipelineDeals.filter(d => d.stageId === 'Won').length;
  const winRate = pipelineDeals.length > 0 ? (wonDeals / pipelineDeals.length) * 100 : 0;

  // Calculate stage distribution
  const stageStats = (activePipeline?.stages || []).map((stage, index) => {
    const stageDeals = pipelineDeals.filter(d => d.stageId === stage.id);
    const stageValue = stageDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const dealCount = stageDeals.length;
    const percentage = pipelineDeals.length > 0 ? (dealCount / pipelineDeals.length) * 100 : 0;

    // Monochrome slate shades based on index
    const shades = ['bg-slate-900', 'bg-slate-700', 'bg-slate-500', 'bg-slate-400', 'bg-slate-300'];
    const shade = shades[index % shades.length];

    return {
      name: stage.name,
      count: dealCount,
      value: stageValue,
      percentage,
      shade,
    };
  });

  return (
    <AnimatedCard
      title={
        <div className="flex items-center gap-2">
          <FunnelPlotOutlined className="text-slate-500" />
          <span>Pipeline İstatistikleri</span>
          {(activePipeline as any)?.isDefault && (
            <StarFilled className="text-slate-400 text-sm" />
          )}
        </div>
      }
      loading={loading}
      extra={<Link href="/crm/pipelines" className="!text-slate-500 hover:!text-slate-700">Detaylar</Link>}
    >
      {/* Pipeline Name */}
      <div className="mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <Text strong className="text-lg text-slate-900">{activePipeline?.name}</Text>
            <div className="text-xs text-slate-400 mt-1">
              {activePipeline?.stages?.length || 0} aşama • {pipelineDeals.length} fırsat
            </div>
          </div>
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
            {activePipeline?.type}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <DollarOutlined className="text-xl text-slate-500 mb-1" />
          <div className="text-xs text-slate-400 mb-1">Toplam Değer</div>
          <div className="font-bold text-slate-900 text-sm">{formatCurrency(totalValue)}</div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <TrophyOutlined className="text-xl text-slate-500 mb-1" />
          <div className="text-xs text-slate-400 mb-1">Kazanma Oranı</div>
          <div className="font-bold text-slate-900 text-sm">
            {formatPercent(winRate)}
          </div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <TeamOutlined className="text-xl text-slate-500 mb-1" />
          <div className="text-xs text-slate-400 mb-1">Ort. Fırsat</div>
          <div className="font-bold text-slate-900 text-sm">{formatCurrency(avgDealSize)}</div>
        </div>
      </div>

      {/* Stage Distribution */}
      <div className="space-y-3">
        <Text strong className="block text-sm text-slate-700">Aşama Dağılımı</Text>
        {stageStats.map(stage => (
          <div key={stage.name}>
            <div className="flex justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${stage.shade}`} />
                <Text className="text-sm text-slate-600">{stage.name}</Text>
              </div>
              <Space size="small">
                <Text strong className="text-sm text-slate-900">{stage.count}</Text>
                <Text type="secondary" className="text-xs text-slate-400">({formatCurrency(stage.value)})</Text>
              </Space>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${stage.shade} rounded-full transition-all duration-500`}
                style={{ width: `${stage.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Switch */}
      {pipelines.length > 1 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <Link href="/crm/pipelines" className="text-xs text-slate-400 hover:text-slate-600">
            {pipelines.length - 1} pipeline daha
          </Link>
        </div>
      )}
    </AnimatedCard>
  );
}
