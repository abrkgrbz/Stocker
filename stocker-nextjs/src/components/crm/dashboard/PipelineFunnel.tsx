'use client';

import React, { useMemo } from 'react';
import { Spin, Tooltip } from 'antd';
import { FunnelIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface Stage {
  id: string;
  name: string;
  color: string;
  order: number;
  probability: number;
  isWon?: boolean;
  isLost?: boolean;
}

interface Pipeline {
  id: string;
  name: string;
  isDefault?: boolean;
  stages: Stage[];
}

interface Deal {
  id: string;
  stageId: string | null;
  status: 'Open' | 'Won' | 'Lost';
  amount: number;
}

interface PipelineFunnelProps {
  pipelines: Pipeline[];
  deals: Deal[];
  loading?: boolean;
}

export function PipelineFunnel({ pipelines, deals, loading }: PipelineFunnelProps) {
  const funnelData = useMemo(() => {
    // Get default pipeline or first one
    const pipeline = pipelines.find((p) => p.isDefault) || pipelines[0];
    if (!pipeline) return null;

    // Sort stages by order
    const sortedStages = [...pipeline.stages]
      .filter((s) => !s.isLost)
      .sort((a, b) => a.order - b.order);

    // Calculate deals per stage
    const stageData = sortedStages.map((stage) => {
      const stageDeals = deals.filter((d) => {
        if (stage.isWon) {
          return d.status === 'Won';
        }
        return d.stageId === stage.id && d.status === 'Open';
      });

      return {
        ...stage,
        dealCount: stageDeals.length,
        dealAmount: stageDeals.reduce((sum, d) => sum + d.amount, 0),
      };
    });

    // Find max for scaling
    const maxDeals = Math.max(...stageData.map((s) => s.dealCount), 1);

    return {
      pipeline,
      stages: stageData,
      maxDeals,
    };
  }, [pipelines, deals]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <Spin />
        </div>
      </div>
    );
  }

  if (!funnelData) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="text-center py-8">
          <FunnelIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Pipeline bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-slate-900">Satış Hunisi</h3>
          <p className="text-xs text-slate-500 mt-0.5">{funnelData.pipeline.name}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <FunnelIcon className="w-4 h-4" />
          <span>{funnelData.stages.length} aşama</span>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="space-y-3">
        {funnelData.stages.map((stage, index) => {
          const widthPercentage = Math.max(
            20,
            100 - (index * (80 / Math.max(funnelData.stages.length - 1, 1)))
          );
          const barWidth = Math.max(
            5,
            (stage.dealCount / funnelData.maxDeals) * 100
          );

          return (
            <Tooltip
              key={stage.id}
              title={
                <div className="text-center">
                  <div className="font-medium">{stage.name}</div>
                  <div className="text-xs opacity-80">{stage.dealCount} fırsat</div>
                  <div className="text-xs opacity-80">₺{stage.dealAmount.toLocaleString('tr-TR')}</div>
                  <div className="text-xs opacity-80">{stage.probability}% olasılık</div>
                </div>
              }
            >
              <div
                className="mx-auto transition-all duration-300 hover:scale-[1.02]"
                style={{ width: `${widthPercentage}%` }}
              >
                <div
                  className="relative h-12 rounded-lg overflow-hidden cursor-pointer"
                  style={{ backgroundColor: `${stage.color}15` }}
                >
                  {/* Progress bar */}
                  <div
                    className="absolute inset-y-0 left-0 transition-all duration-500"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: stage.color,
                      opacity: 0.8,
                    }}
                  />

                  {/* Content */}
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
                        {stage.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">
                        {stage.dealCount}
                      </span>
                      <span className="text-xs text-slate-500">
                        ₺{(stage.dealAmount / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                </div>

                {/* Arrow connector */}
                {index < funnelData.stages.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowRightIcon className="w-3 h-3 text-slate-300 rotate-90" />
                  </div>
                )}
              </div>
            </Tooltip>
          );
        })}
      </div>

      {/* Conversion Summary */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-slate-900">
              {deals.filter((d) => d.status === 'Open').length}
            </div>
            <div className="text-xs text-slate-500">Açık</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-600">
              {deals.filter((d) => d.status === 'Won').length}
            </div>
            <div className="text-xs text-slate-500">Kazanılan</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-500">
              {deals.filter((d) => d.status === 'Lost').length}
            </div>
            <div className="text-xs text-slate-500">Kaybedilen</div>
          </div>
        </div>
      </div>
    </div>
  );
}
