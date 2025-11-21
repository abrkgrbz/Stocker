'use client';

import React from 'react';
import { Typography, Space, Tag, Progress, Empty, Button } from 'antd';
import {
  MailOutlined,
  EyeOutlined,
  LinkOutlined,
  DollarOutlined,
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
    .filter(c => c.status === 'InProgress') // Changed from 'Active' to 'InProgress'
    .sort((a, b) => (b.roi || 0) - (a.roi || 0))
    .slice(0, 5); // Top 5

  if (!loading && activeCampaigns.length === 0) {
    return (
      <AnimatedCard title="Kampanya Performansı" loading={loading}>
        <Empty
          image={<MailOutlined style={{ fontSize: 64, color: '#fa8c16' }} />}
          imageStyle={{ height: 80 }}
          description={
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 mb-2">
                Aktif Kampanya Bulunmuyor
              </div>
              <div className="text-sm text-gray-500 mb-4">
                İlk kampanyanızı oluşturun ve müşterilerinizle etkileşime geçin.
              </div>
              <Link href="/crm/campaigns">
                <Button type="primary" icon={<PlusOutlined />}>
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
      extra={<Link href="/crm/campaigns">Tümünü Gör</Link>}
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
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              {/* Campaign Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <Link href={`/crm/campaigns?id=${campaign.id}`} className="font-semibold text-gray-900">
                    {campaign.name}
                  </Link>
                  <div className="flex gap-2 mt-1">
                    <Tag color={campaign.type === 'Email' ? 'blue' : 'purple'}>
                      {campaign.type === 'Email' ? '📧 E-posta' : '🔔 ' + campaign.type}
                    </Tag>
                    {campaign.targetSegmentName && (
                      <Tag>{campaign.targetSegmentName}</Tag>
                    )}
                  </div>
                </div>
                <div className={`flex items-center gap-1 ${roiPositive ? 'text-green-600' : 'text-red-600'} font-bold`}>
                  {roiPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {formatPercent(roi)} ROI
                </div>
              </div>

              {/* Campaign Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Teslim</div>
                  <div className="flex items-center justify-center gap-1">
                    <MailOutlined className="text-blue-500" />
                    <Text strong>{campaign.deliveredCount}</Text>
                  </div>
                  <Progress
                    percent={deliveryRate}
                    size="small"
                    showInfo={false}
                    strokeColor="#1890ff"
                  />
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Açılma</div>
                  <div className="flex items-center justify-center gap-1">
                    <EyeOutlined className="text-green-500" />
                    <Text strong>{campaign.openedCount}</Text>
                  </div>
                  <Progress
                    percent={openRate}
                    size="small"
                    showInfo={false}
                    strokeColor="#52c41a"
                  />
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Tıklama</div>
                  <div className="flex items-center justify-center gap-1">
                    <LinkOutlined className="text-purple-500" />
                    <Text strong>{campaign.clickedCount}</Text>
                  </div>
                  <Progress
                    percent={clickRate}
                    size="small"
                    showInfo={false}
                    strokeColor="#722ed1"
                  />
                </div>
              </div>

              {/* Budget and Revenue */}
              <div className="flex justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
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
