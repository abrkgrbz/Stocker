'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Space, Button, Row, Col, Card, Table, List, Tag, Empty } from 'antd';
import { TrophyOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useCustomers, useLeads, useDeals, useActivities, useCampaigns, usePipelines } from '@/hooks/useCRM';
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
import { AnimatedCard } from '@/components/crm/shared';
import { formatDate } from '@/lib/crm';
import type { ColumnsType } from 'antd/es/table';
import SetupWizardModal from '@/components/setup/SetupWizardModal';

const { Title, Text } = Typography;

export default function CRMDashboardPage() {
  // Setup modal state
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  // Check if setup is required on mount
  useEffect(() => {
    const checkSetupRequired = () => {
      // Get requiresSetup from localStorage (set during login)
      const requiresSetup = localStorage.getItem('requiresSetup') === 'true';

      if (requiresSetup) {
        setSetupModalOpen(true);
      }
    };

    checkSetupRequired();
  }, []);

  const handleSetupComplete = () => {
    // Remove requiresSetup flag from localStorage
    localStorage.removeItem('requiresSetup');
    setSetupModalOpen(false);

    // Reload the page to refresh dashboard with new data
    window.location.reload();
  };
  // Fetch CRM data
  const { data: customersData, isLoading: customersLoading } = useCustomers({ pageSize: 10 });
  const { data: leadsData, isLoading: leadsLoading } = useLeads({ pageSize: 5 });
  const { data: dealsData, isLoading: dealsLoading } = useDeals({ pageSize: 50 }); // Increased for pipeline stats
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities({ pageSize: 50 }); // Increased for today/overdue
  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns();
  const { data: pipelinesData, isLoading: pipelinesLoading } = usePipelines();

  const customers = customersData?.items || [];
  const leads = leadsData?.items || [];
  const deals = dealsData?.items || [];
  const activities = activitiesData?.items || [];
  const campaigns = campaignsData?.items || [];
  const pipelines = pipelinesData || [];

  // Calculate all metrics using utility function
  const metrics = calculateDashboardMetrics({ customers, leads, deals });

  // Recent activities columns
  const activityColumns: ColumnsType<any> = [
    {
      title: 'Aktivite',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <Text type="secondary" className="text-xs">
            {record.type}
          </Text>
        </div>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (date) => formatDate(date),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'Completed' ? 'success' : status === 'Scheduled' ? 'processing' : 'default';
        const text = status === 'Completed' ? 'Tamamlandı' : status === 'Scheduled' ? 'Planlandı' : 'İptal';
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <Title level={2} style={{ margin: 0 }}>
          CRM Dashboard
        </Title>
        <Space>
          <Link href="/crm/customers">
            <Button type="primary">Müşteriler</Button>
          </Link>
          <Link href="/crm/leads">
            <Button>Potansiyel Müşteriler</Button>
          </Link>
          <Link href="/crm/deals">
            <Button>Fırsatlar</Button>
          </Link>
          <Link href="/crm/documents">
            <Button>Dökümanlar</Button>
          </Link>
        </Space>
      </div>

      {/* Metrics Overview - Modern Component */}
      <div className="mb-6">
        <MetricsOverview
          totalCustomers={metrics.totalCustomers}
          activeCustomers={metrics.activeCustomers}
          totalRevenue={metrics.totalRevenue}
          avgCustomerValue={metrics.avgCustomerValue}
          loading={customersLoading}
        />
      </div>

      {/* Today's Activities & Overdue Tasks */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <TodaysActivities activities={activities} loading={activitiesLoading} />
        </Col>

        <Col xs={24} lg={12}>
          <OverdueTasks activities={activities} loading={activitiesLoading} />
        </Col>
      </Row>

      {/* Sales Funnel & Pipeline Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <SalesFunnel
            totalLeads={metrics.totalLeads}
            qualifiedLeads={metrics.qualifiedLeads}
            openDeals={metrics.openDeals}
            wonDeals={metrics.wonDeals}
            loading={leadsLoading}
          />
        </Col>

        <Col xs={24} lg={12}>
          <PipelineStats pipelines={pipelines} deals={deals} loading={pipelinesLoading || dealsLoading} />
        </Col>
      </Row>

      {/* Campaign Performance & Top Customers */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <CampaignPerformance campaigns={campaigns} loading={campaignsLoading} />
        </Col>

        <Col xs={24} lg={12}>
          <TopCustomers customers={metrics.topCustomers} loading={customersLoading} />
        </Col>
      </Row>

      {/* Recent Activities & Upcoming Deals */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <AnimatedCard
            title="Son Aktiviteler"
            loading={activitiesLoading}
            extra={
              <Link href="/crm/activities">
                <Button type="link">Tümünü Gör</Button>
              </Link>
            }
          >
            <Table
              columns={activityColumns}
              dataSource={activities.slice(0, 5)}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </AnimatedCard>
        </Col>

        <Col xs={24} lg={12}>
          <AnimatedCard
            title="Yaklaşan Fırsatlar"
            loading={dealsLoading}
            extra={
              <Link href="/crm/deals">
                <Button type="link">Tümünü Gör</Button>
              </Link>
            }
          >
            {!dealsLoading && metrics.upcomingDeals.length === 0 ? (
              <Empty
                image={<TrophyOutlined style={{ fontSize: 64, color: '#fa8c16' }} />}
                imageStyle={{ height: 80 }}
                description={
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 mb-2">
                      Yaklaşan Fırsat Bulunmuyor
                    </div>
                    <div className="text-sm text-gray-500 mb-4">
                      Yeni fırsatlar oluşturun ve satış hedeflerinize ulaşın.
                    </div>
                    <Link href="/crm/deals">
                      <Button type="primary" icon={<PlusOutlined />}>
                        Yeni Fırsat
                      </Button>
                    </Link>
                  </div>
                }
              />
            ) : (
              <List
                dataSource={metrics.upcomingDeals}
                renderItem={(deal) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<TrophyOutlined style={{ fontSize: 24, color: '#fa8c16' }} />}
                      title={<Link href={`/crm/deals/${deal.id}`}>{deal.title}</Link>}
                      description={
                        deal.expectedCloseDate
                          ? `Beklenen kapanış: ${formatDate(deal.expectedCloseDate)}`
                          : 'Tarih belirlenmedi'
                      }
                    />
                    <div className="text-right">
                      <div className="font-semibold">₺{(deal.amount || 0).toLocaleString('tr-TR')}</div>
                      <div className="text-xs text-gray-500">{deal.probability || 0}% olasılık</div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </AnimatedCard>
        </Col>
      </Row>

      {/* Setup Modal */}
      <SetupWizardModal open={setupModalOpen} onComplete={handleSetupComplete} />
    </div>
  );
}
