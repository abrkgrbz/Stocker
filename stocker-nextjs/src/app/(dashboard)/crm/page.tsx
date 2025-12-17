'use client';

/**
 * CRM Dashboard Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * - Clean white cards with subtle borders
 * - Minimal accent colors (only on icons)
 */

import React, { useState, useEffect } from 'react';
import { Table, List, Tag, Empty, Spin } from 'antd';
import {
  TrophyOutlined,
  PlusOutlined,
  TeamOutlined,
  UserAddOutlined,
  DollarOutlined,
  CalendarOutlined,
  RightOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useCustomers, useLeads, useDeals, useActivities, useCampaigns, usePipelines } from '@/lib/api/hooks/useCRM';
import {
  MetricsOverview,
  SalesFunnel,
  TopCustomers,
  CampaignPerformance,
  TodaysActivities,
  OverdueTasks,
  PipelineStats
} from '@/components/crm/dashboard';
import { calculateDashboardMetrics } from '@/lib/crm';
import { formatDate } from '@/lib/crm';
import type { ColumnsType } from 'antd/es/table';
import SetupWizardModal from '@/components/setup/SetupWizardModal';
import { PageContainer } from '@/components/ui/enterprise-page';

export default function CRMDashboardPage() {
  // Setup modal state
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  // Check if setup is required on mount
  useEffect(() => {
    const checkSetupRequired = () => {
      const requiresSetup = localStorage.getItem('requiresSetup') === 'true';
      if (requiresSetup) {
        setSetupModalOpen(true);
      }
    };
    checkSetupRequired();
  }, []);

  const handleSetupComplete = () => {
    localStorage.removeItem('requiresSetup');
    setSetupModalOpen(false);
    window.location.reload();
  };

  // Fetch CRM data
  const { data: customersData, isLoading: customersLoading } = useCustomers({ pageSize: 10 });
  const { data: leadsData, isLoading: leadsLoading } = useLeads({ pageSize: 5 });
  const { data: dealsData, isLoading: dealsLoading } = useDeals({ pageSize: 50 });
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities({ pageSize: 50 });
  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns();
  const { data: pipelinesData, isLoading: pipelinesLoading } = usePipelines();

  const customers = customersData?.items || [];
  const leads = leadsData?.items || [];
  const deals = dealsData?.items || [];
  const activities = activitiesData?.items || [];
  const campaigns = campaignsData || [];
  const pipelines = pipelinesData || [];

  // Calculate all metrics using utility function
  const metrics = calculateDashboardMetrics({ customers, leads, deals });

  // Quick navigation items
  const quickNavItems = [
    { label: 'Müşteriler', href: '/crm/customers', icon: <TeamOutlined />, color: '#3b82f6' },
    { label: 'Potansiyel Müşteriler', href: '/crm/leads', icon: <UserAddOutlined />, color: '#8b5cf6' },
    { label: 'Fırsatlar', href: '/crm/deals', icon: <TrophyOutlined />, color: '#f59e0b' },
    { label: 'Aktiviteler', href: '/crm/activities', icon: <CalendarOutlined />, color: '#10b981' },
  ];

  // Recent activities columns
  const activityColumns: ColumnsType<any> = [
    {
      title: 'Aktivite',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{text}</div>
          <div className="text-xs text-slate-500">{record.type}</div>
        </div>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (date) => <span className="text-sm text-slate-600">{formatDate(date)}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const variants: Record<string, { bg: string; text: string; label: string }> = {
          Completed: { bg: '#10b98115', text: '#10b981', label: 'Tamamlandı' },
          Scheduled: { bg: '#3b82f615', text: '#3b82f6', label: 'Planlandı' },
          Cancelled: { bg: '#64748b15', text: '#64748b', label: 'İptal' },
        };
        const variant = variants[status] || variants.Cancelled;
        return (
          <span
            className="px-2 py-0.5 text-xs rounded-full"
            style={{ backgroundColor: variant.bg, color: variant.text }}
          >
            {variant.label}
          </span>
        );
      },
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#3b82f615' }}
            >
              <TeamOutlined style={{ color: '#3b82f6', fontSize: 24 }} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">CRM Dashboard</h1>
              <p className="text-sm text-slate-500">Müşteri ilişkileri ve satış performansı</p>
            </div>
          </div>
          <Link href="/crm/leads/new">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors">
              <PlusOutlined />
              Yeni Lead
            </button>
          </Link>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickNavItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    {React.cloneElement(item.icon, { style: { color: item.color, fontSize: 18 } })}
                  </div>
                  <span className="text-sm font-medium text-slate-900">{item.label}</span>
                </div>
                <RightOutlined className="text-slate-300 text-xs group-hover:text-slate-400 transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Metrics Overview */}
      <div className="mb-8">
        <MetricsOverview
          totalCustomers={metrics.totalCustomers}
          activeCustomers={metrics.activeCustomers}
          totalRevenue={metrics.totalRevenue}
          avgCustomerValue={metrics.avgCustomerValue}
          loading={customersLoading}
        />
      </div>

      {/* Today's Activities & Overdue Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TodaysActivities activities={activities} loading={activitiesLoading} />
        <OverdueTasks activities={activities} loading={activitiesLoading} />
      </div>

      {/* Sales Funnel & Pipeline Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SalesFunnel
          totalLeads={metrics.totalLeads}
          qualifiedLeads={metrics.qualifiedLeads}
          openDeals={metrics.openDeals}
          wonDeals={metrics.wonDeals}
          loading={leadsLoading}
        />
        <PipelineStats pipelines={pipelines} deals={deals} loading={pipelinesLoading || dealsLoading} />
      </div>

      {/* Campaign Performance & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CampaignPerformance campaigns={campaigns} loading={campaignsLoading} />
        <TopCustomers customers={metrics.topCustomers} loading={customersLoading} />
      </div>

      {/* Recent Activities & Upcoming Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-900">Son Aktiviteler</h2>
            <Link href="/crm/activities" className="text-xs text-slate-500 hover:text-slate-700">
              Tümünü gör →
            </Link>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg">
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spin />
              </div>
            ) : (
              <Table
                columns={activityColumns}
                dataSource={activities.slice(0, 5)}
                rowKey="id"
                pagination={false}
                size="small"
                className="enterprise-table"
              />
            )}
          </div>
        </div>

        {/* Upcoming Deals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-900">Yaklaşan Fırsatlar</h2>
            <Link href="/crm/deals" className="text-xs text-slate-500 hover:text-slate-700">
              Tümünü gör →
            </Link>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            {dealsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spin />
              </div>
            ) : metrics.upcomingDeals.length === 0 ? (
              <div className="text-center py-8">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#f59e0b15' }}
                >
                  <TrophyOutlined style={{ color: '#f59e0b', fontSize: 24 }} />
                </div>
                <h3 className="text-sm font-medium text-slate-900 mb-1">Yaklaşan Fırsat Bulunmuyor</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Yeni fırsatlar oluşturun ve satış hedeflerinize ulaşın.
                </p>
                <Link href="/crm/deals/new">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors">
                    <PlusOutlined className="mr-2" />
                    Yeni Fırsat
                  </button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {metrics.upcomingDeals.map((deal) => (
                  <Link key={deal.id} href={`/crm/deals/${deal.id}`}>
                    <div className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-4 px-4 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: '#f59e0b15' }}
                        >
                          <TrophyOutlined style={{ color: '#f59e0b', fontSize: 14 }} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{deal.title}</div>
                          <div className="text-xs text-slate-500">
                            {deal.expectedCloseDate
                              ? `Beklenen kapanış: ${formatDate(deal.expectedCloseDate)}`
                              : 'Tarih belirlenmedi'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-900">
                          ₺{(deal.amount || 0).toLocaleString('tr-TR')}
                        </div>
                        <div className="text-xs text-slate-500">{deal.probability || 0}% olasılık</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Setup Modal */}
      <SetupWizardModal open={setupModalOpen} onComplete={handleSetupComplete} />
    </PageContainer>
  );
}
