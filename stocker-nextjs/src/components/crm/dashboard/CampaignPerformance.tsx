'use client';

import React from 'react';
import { Typography, Space, Empty, Button } from 'antd';
import {
  MailOutlined,
  EyeOutlined,
  LinkOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { AnimatedCard } from '../shared/AnimatedCard';
import { formatCurrency, formatPercent } from '@/lib/crm';
import type { Campaign } from '@/lib/api/services/crm.service';

const { Text, Link } = Typography;

interface CampaignPerformanceProps {
  campaigns: Campaign[];
  loading?: boolean;
}

export function CampaignPerformance({
  campaigns,
  loading = false,
}: CampaignPerformanceProps) {
  // Filter active campaigns and sort by ROI
  const activeCampaigns = campaigns
    .filter(c => c.status === 'InProgress')
    .sort((a, b) => (b.roi || 0) - (a.roi || 0))
    .slice(0, 5);

  if (!loading && activeCampaigns.length === 0) {
    return (
      <AnimatedCard title="Kampanya Performansı" loading={loading}>
        <Empty
          image={
            <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mx-auto">
              <MailOutlined className="text-slate-300" style={{ fontSize: 20 }} />
            </div>
          }
          imageStyle={{ height: 60 }}
          description={
            <div className="text-center">
              <div className="text-sm font-medium text-slate-600 mb-1">
                Aktif kampanya yok
              </div>
              <div className="text-xs text-slate-400 mb-4">
                Yeni kampanya oluşturarak müşterilerinizle etkileşime geçin
              </div>
              <Link href="/crm/campaigns">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="!bg-slate-900 !border-slate-900 hover:!bg-slate-800"
                >
                  Yeni Kampanya
                </Button>
              </Link>
            </div>
          }
        />
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard
      title="Kampanya Performansı"
      loading={loading}
      extra={<Link href="/crm/campaigns" className="!text-slate-500 hover:!text-slate-700">Tümünü Gör</Link>}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {activeCampaigns.map((campaign) => {
          const deliveryRate = (campaign.totalRecipients || 0) > 0
            ? ((campaign.deliveredCount || 0) / (campaign.totalRecipients || 0)) * 100
            : 0;
          const openRate = (campaign.deliveredCount || 0) > 0
            ? ((campaign.openedCount || 0) / (campaign.deliveredCount || 0)) * 100
            : 0;
          const clickRate = (campaign.deliveredCount || 0) > 0
            ? ((campaign.clickedCount || 0) / (campaign.deliveredCount || 0)) * 100
            : 0;
          const roi = campaign.roi || 0;
          const roiPositive = roi >= 0;

          return (
            <div
              key={campaign.id}
              className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              {/* Campaign Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <Link href={`/crm/campaigns?id=${campaign.id}`} className="font-semibold text-slate-900 hover:text-slate-700">
                    {campaign.name}
                  </Link>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
                      {campaign.type === 'Email' ? '📧 E-posta' : '🔔 ' + campaign.type}
                    </span>
                    {campaign.targetSegmentName && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-slate-50 text-slate-500">
                        {campaign.targetSegmentName}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`flex items-center gap-1 ${roiPositive ? 'text-slate-900' : 'text-slate-400'} font-bold text-sm`}>
                  {roiPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {formatPercent(roi)} ROI
                </div>
              </div>

              {/* Campaign Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-1">Teslim</div>
                  <div className="flex items-center justify-center gap-1">
                    <MailOutlined className="text-slate-500" />
                    <Text strong className="text-slate-900">{campaign.deliveredCount}</Text>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-slate-900 rounded-full"
                      style={{ width: `${deliveryRate}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-1">Açılma</div>
                  <div className="flex items-center justify-center gap-1">
                    <EyeOutlined className="text-slate-500" />
                    <Text strong className="text-slate-900">{campaign.openedCount}</Text>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-slate-700 rounded-full"
                      style={{ width: `${openRate}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-1">Tıklama</div>
                  <div className="flex items-center justify-center gap-1">
                    <LinkOutlined className="text-slate-500" />
                    <Text strong className="text-slate-900">{campaign.clickedCount}</Text>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-slate-500 rounded-full"
                      style={{ width: `${clickRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Budget and Revenue */}
              <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Bütçe: {formatCurrency(campaign.budget || 0)}</span>
                <span>Gelir: {formatCurrency(campaign.revenue || 0)}</span>
              </div>
            </div>
          );
        })}
      </Space>
    </AnimatedCard>
  );
}
