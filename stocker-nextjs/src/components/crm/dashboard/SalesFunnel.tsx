'use client';

import React from 'react';
import { AnimatedCard } from '../shared/AnimatedCard';

interface SalesFunnelProps {
  totalLeads: number;
  qualifiedLeads: number;
  openDeals: number;
  wonDeals: number;
  loading?: boolean;
}

export function SalesFunnel({
  totalLeads,
  qualifiedLeads,
  openDeals,
  wonDeals,
  loading = false,
}: SalesFunnelProps) {
  const qualifiedPercent = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
  const dealsPercent = totalLeads > 0 ? (openDeals / totalLeads) * 100 : 0;
  const wonPercent = totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;

  const stages = [
    { label: 'Potansiyel Müşteriler', value: totalLeads, percent: 100, shade: 'bg-slate-900' },
    { label: 'Nitelikli Leads', value: qualifiedLeads, percent: qualifiedPercent, shade: 'bg-slate-700' },
    { label: 'Açık Fırsatlar', value: openDeals, percent: dealsPercent, shade: 'bg-slate-500' },
    { label: 'Kazanılan Anlaşmalar', value: wonDeals, percent: wonPercent, shade: 'bg-slate-400' },
  ];

  return (
    <AnimatedCard title="Satış Hunisi" loading={loading}>
      <div className="space-y-5">
        {stages.map((stage, index) => (
          <div key={stage.label}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">{stage.label}</span>
              <span className="text-sm font-semibold text-slate-900">{stage.value}</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${stage.shade} rounded-full transition-all duration-500`}
                style={{ width: `${stage.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </AnimatedCard>
  );
}
