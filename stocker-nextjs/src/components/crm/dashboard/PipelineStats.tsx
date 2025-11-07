'use client';

import React from 'react';
import { Typography, Space, Progress, Tag, Empty } from 'antd';
import {
  FunnelPlotOutlined,
  DollarOutlined,
  TrophyOutlined,
  TeamOutlined,
  StarFilled,
  ArrowUpOutlined
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
          image={<FunnelPlotOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
          imageStyle={{ height: 60 }}
          description={
            <div className="text-center">
              <div className="text-base text-gray-600 mb-2">
                Aktif pipeline bulunmuyor
              </div>
              <Link href="/crm/pipelines">
                Pipeline oluştur
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
  const wonDeals = pipelineDeals.filter(d => d.stage === 'Won').length;
  const winRate = pipelineDeals.length > 0 ? (wonDeals / pipelineDeals.length) * 100 : 0;

  // Calculate stage distribution
  const stageStats = (activePipeline?.stages || []).map(stage => {
    const stageDeals = pipelineDeals.filter(d => d.stage === stage.name);
    const stageValue = stageDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const dealCount = stageDeals.length;
    const percentage = pipelineDeals.length > 0 ? (dealCount / pipelineDeals.length) * 100 : 0;

    return {
      name: stage.name,
      count: dealCount,
      value: stageValue,
      percentage,
      color: stage.color || '#1890ff',
    };
  });

  return (
    <AnimatedCard
      title={
        <div className="flex items-center gap-2">
          <FunnelPlotOutlined />
          <span>Pipeline İstatistikleri</span>
          {(activePipeline as any)?.isDefault && (
            <StarFilled className="text-yellow-500 text-sm" />
          )}
        </div>
      }
      loading={loading}
      extra={<Link href="/crm/pipelines">Detaylar</Link>}
    >
      {/* Pipeline Name */}
      <div className="mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <Text strong className="text-lg">{activePipeline?.name}</Text>
            <div className="text-xs text-gray-500 mt-1">
              {activePipeline?.stages?.length || 0} aşama • {pipelineDeals.length} fırsat
            </div>
          </div>
          <Tag color="blue">{activePipeline?.type}</Tag>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <DollarOutlined className="text-2xl text-blue-500 mb-1" />
          <div className="text-xs text-gray-600 mb-1">Toplam Değer</div>
          <div className="font-bold text-blue-700">{formatCurrency(totalValue)}</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <TrophyOutlined className="text-2xl text-green-500 mb-1" />
          <div className="text-xs text-gray-600 mb-1">Kazanma Oranı</div>
          <div className="font-bold text-green-700 flex items-center justify-center gap-1">
            {formatPercent(winRate)}
            <ArrowUpOutlined className="text-xs" />
          </div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <TeamOutlined className="text-2xl text-purple-500 mb-1" />
          <div className="text-xs text-gray-600 mb-1">Ort. Fırsat</div>
          <div className="font-bold text-purple-700">{formatCurrency(avgDealSize)}</div>
        </div>
      </div>

      {/* Stage Distribution */}
      <div className="space-y-3">
        <Text strong className="block">Aşama Dağılımı</Text>
        {stageStats.map(stage => (
          <div key={stage.name}>
            <div className="flex justify-between mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
                <Text className="text-sm">{stage.name}</Text>
              </div>
              <Space size="small">
                <Text strong className="text-sm">{stage.count}</Text>
                <Text type="secondary" className="text-xs">({formatCurrency(stage.value)})</Text>
              </Space>
            </div>
            <Progress
              percent={stage.percentage}
              strokeColor={stage.color}
              showInfo={false}
              size="small"
            />
          </div>
        ))}
      </div>

      {/* Pipeline Switch */}
      {pipelines.length > 1 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <Link href="/crm/pipelines" className="text-xs text-gray-500">
            {pipelines.length - 1} pipeline daha
          </Link>
        </div>
      )}
    </AnimatedCard>
  );
}
