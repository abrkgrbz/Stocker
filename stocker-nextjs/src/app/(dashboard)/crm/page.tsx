'use client';

import React, { useState, useEffect } from 'react';
import { Table, Spin } from 'antd';
import {
  ArrowTrendingUpIcon,
  BoltIcon,
  CalendarIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  GiftIcon,
  GlobeAltIcon,
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
  PipelineStats,
  WinLossChart,
  PipelineFunnel,
  MonthlyTrend,
} from '@/components/crm/dashboard';
import { calculateDashboardMetrics } from '@/lib/crm';
import { formatDate } from '@/lib/crm';
import type { ColumnsType } from 'antd/es/table';
import SetupWizardModal from '@/components/setup/SetupWizardModal';

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
    { label: 'Musteriler', href: '/crm/customers', icon: <UserGroupIcon className="w-5 h-5" />, count: metrics.totalCustomers },
    { label: 'Potansiyel Musteriler', href: '/crm/leads', icon: <UserPlusIcon className="w-5 h-5" />, count: metrics.totalLeads },
    { label: 'Firsatlar', href: '/crm/deals', icon: <TrophyIcon className="w-5 h-5" />, count: metrics.openDeals },
    { label: 'Aktiviteler', href: '/crm/activities', icon: <CalendarIcon className="w-5 h-5" />, count: activities.length },
  ];

  // CRM modules quick links
  const crmModules = [
    { label: 'Segmentler', href: '/crm/segments', icon: <UserGroupIcon className="w-5 h-5" />, description: 'Musteri segmentleri' },
    { label: 'Bolgeler', href: '/crm/territories', icon: <GlobeAltIcon className="w-5 h-5" />, description: 'Satis bolgeleri' },
    { label: 'Is Akislari', href: '/crm/workflows', icon: <BoltIcon className="w-5 h-5" />, description: 'Otomasyon kurallari' },
    { label: 'Sadakat Programlari', href: '/crm/loyalty-programs', icon: <GiftIcon className="w-5 h-5" />, description: 'Odul programlari' },
    { label: 'Belgeler', href: '/crm/documents', icon: <DocumentIcon className="w-5 h-5" />, description: 'Dosya yonetimi' },
    { label: 'Kampanyalar', href: '/crm/campaigns', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, description: 'Pazarlama kampanyalari' },
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
          Completed: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Tamamlandi' },
          Scheduled: { bg: 'bg-slate-900', text: 'text-white', label: 'Planlandi' },
          Cancelled: { bg: 'bg-slate-50', text: 'text-slate-400', label: 'Iptal' },
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
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-slate-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">CRM Dashboard</h1>
          </div>
          <p className="text-sm text-slate-500 ml-13">
            Musteri iliskileri ve satis performansi
          </p>
        </div>
        <Link href="/crm/leads/new">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
            <PlusIcon className="w-4 h-4" />
            Yeni Lead
          </button>
        </Link>
      </div>

      {/* Combined Overview Cards - Navigation + KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickNavItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  {React.cloneElement(item.icon, { className: 'w-5 h-5 text-slate-600' })}
                </div>
                <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
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
            <div className="w-2 h-2 rounded-full bg-slate-900" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Aktif</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.activeCustomers.toLocaleString('tr-TR')}</div>
          <div className="text-sm text-slate-500">Aktif Musteri</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-slate-700" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Gelir</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalRevenue.toLocaleString('tr-TR')} TL</div>
          <div className="text-sm text-slate-500">Toplam Gelir</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-slate-500" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ortalama</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.avgCustomerValue.toLocaleString('tr-TR')} TL</div>
          <div className="text-sm text-slate-500">Musteri Degeri</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Kazanilan</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.wonDeals.toLocaleString('tr-TR')}</div>
          <div className="text-sm text-slate-500">Anlasma</div>
        </div>
      </div>

      {/* CRM Modules Quick Links */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-slate-900 mb-4">CRM Modulleri</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {crmModules.map((module) => (
            <Link key={module.href} href={module.href}>
              <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-slate-200 transition-colors">
                  {React.cloneElement(module.icon, { className: 'w-5 h-5 text-slate-600' })}
                </div>
                <div className="text-sm font-medium text-slate-900 mb-0.5">{module.label}</div>
                <div className="text-xs text-slate-500">{module.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Today's Activities & Overdue Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TodaysActivities activities={activities} loading={activitiesLoading} />
        <OverdueTasks activities={activities} loading={activitiesLoading} />
      </div>

      {/* Win/Loss & Monthly Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <WinLossChart deals={deals} loading={dealsLoading} />
        <PipelineFunnel pipelines={pipelines} deals={deals} loading={pipelinesLoading || dealsLoading} />
        <MonthlyTrend deals={deals} loading={dealsLoading} />
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
              Tumunu gor
            </Link>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
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
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
              />
            )}
          </div>
        </div>

        {/* Upcoming Deals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-900">Yaklasan Firsatlar</h2>
            <Link href="/crm/deals" className="text-xs text-slate-500 hover:text-slate-700">
              Tumunu gor
            </Link>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            {dealsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spin />
              </div>
            ) : metrics.upcomingDeals.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <TrophyIcon className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-600 mb-1">Yaklasan firsat yok</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Yeni firsatlar olusturun
                </p>
                <Link href="/crm/deals/new">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
                    Firsat Ekle
                  </button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {metrics.upcomingDeals.map((deal) => (
                  <Link key={deal.id} href={`/crm/deals/${deal.id}`}>
                    <div className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-6 px-6 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <TrophyIcon className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{deal.title}</div>
                          <div className="text-xs text-slate-500">
                            {deal.expectedCloseDate
                              ? `Beklenen kapanis: ${formatDate(deal.expectedCloseDate)}`
                              : 'Tarih belirlenmedi'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-900">
                          {(deal.amount || 0).toLocaleString('tr-TR')} TL
                        </div>
                        <div className="text-xs text-slate-500">{deal.probability || 0}% olasilik</div>
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
    </div>
  );
}
