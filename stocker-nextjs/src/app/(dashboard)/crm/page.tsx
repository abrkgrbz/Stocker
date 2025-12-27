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
  CalendarIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  PlusIcon,
  TrophyIcon,
  UserGroupIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useCustomers, useLeads, useDeals, useActivities, useCampaigns, usePipelines } from '@/lib/api/hooks/useCRM';
import {
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

  // Quick navigation items - monochrome slate colors
  const quickNavItems = [
    { label: 'Müşteriler', href: '/crm/customers', icon: <UserGroupIcon className="w-4 h-4" />, count: metrics.totalCustomers },
    { label: 'Potansiyel Müşteriler', href: '/crm/leads', icon: <UserPlusIcon className="w-4 h-4" />, count: metrics.totalLeads },
    { label: 'Fırsatlar', href: '/crm/deals', icon: <TrophyIcon className="w-4 h-4" />, count: metrics.openDeals },
    { label: 'Aktiviteler', href: '/crm/activities', icon: <CalendarIcon className="w-4 h-4" />, count: activities.length },
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
          Completed: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Tamamlandı' },
          Scheduled: { bg: 'bg-slate-900', text: 'text-white', label: 'Planlandı' },
          Cancelled: { bg: 'bg-slate-50', text: 'text-slate-400', label: 'İptal' },
        };
        const variant = variants[status] || variants.Cancelled;
        return (
          <span className={`px-2 py-0.5 text-xs rounded-full ${variant.bg} ${variant.text}`}>
            {variant.label}
          </span>
        );
      },
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Page Header - Clean & Minimal */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">CRM Dashboard</h1>
            <p className="text-sm text-slate-500">Müşteri ilişkileri ve satış performansı</p>
          </div>
          <Link href="/crm/leads/new">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors">
              <PlusIcon className="w-4 h-4" />
              Yeni Lead
            </button>
          </Link>
        </div>
      </div>

      {/* Combined Overview Cards - Navigation + KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickNavItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  {React.cloneElement(item.icon, { className: 'text-slate-500', style: { fontSize: 16 } })}
                </div>
                <ChevronRightIcon className="w-4 h-4 text-slate-300 text-xs group-hover:text-slate-500 transition-colors" />
              </div>
              <div className="text-2xl font-semibold text-slate-900 mb-1">
                {item.count?.toLocaleString('tr-TR') || '0'}
              </div>
              <div className="text-sm text-slate-500">{item.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Aktif</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">{metrics.activeCustomers.toLocaleString('tr-TR')}</div>
          <div className="text-sm text-slate-500">Aktif Müşteri</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-slate-900" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Gelir</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">₺{metrics.totalRevenue.toLocaleString('tr-TR')}</div>
          <div className="text-sm text-slate-500">Toplam Gelir</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ortalama</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">₺{metrics.avgCustomerValue.toLocaleString('tr-TR')}</div>
          <div className="text-sm text-slate-500">Müşteri Değeri</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Kazanılan</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">{metrics.wonDeals.toLocaleString('tr-TR')}</div>
          <div className="text-sm text-slate-500">Anlaşma</div>
        </div>
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
              <div className="text-center py-10">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-3">
                  <TrophyIcon className="w-4 h-4 text-slate-300" style={{ fontSize: 18 }} />
                </div>
                <h3 className="text-sm font-medium text-slate-600 mb-1">Yaklaşan fırsat yok</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Yeni fırsatlar oluşturun
                </p>
                <Link href="/crm/deals/new">
                  <button className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors">
                    Fırsat Ekle
                  </button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {metrics.upcomingDeals.map((deal) => (
                  <Link key={deal.id} href={`/crm/deals/${deal.id}`}>
                    <div className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-4 px-4 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          <TrophyIcon className="w-4 h-4 text-slate-500" style={{ fontSize: 14 }} />
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
