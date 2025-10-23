'use client';

import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button, List, Tag, Progress, Table } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  RiseOutlined,
  DollarOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useCustomers, useLeads, useDeals, useActivities } from '@/hooks/useCRM';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

export default function CRMDashboardPage() {
  // Fetch CRM data
  const { data: customersData, isLoading: customersLoading } = useCustomers({ pageSize: 10 });
  const { data: leadsData, isLoading: leadsLoading } = useLeads({ pageSize: 5 });
  const { data: dealsData, isLoading: dealsLoading } = useDeals({ pageSize: 5 });
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities({ pageSize: 5 });

  const customers = customersData?.items || [];
  const leads = leadsData?.items || [];
  const deals = dealsData?.items || [];
  const activities = activitiesData?.items || [];

  // Calculate statistics
  const totalCustomers = customersData?.totalCount || 0;
  const activeCustomers = customers.filter(c => c.status === 'Active').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalPurchases, 0);
  const avgCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  // Top customers by revenue
  const topCustomers = [...customers]
    .sort((a, b) => b.totalPurchases - a.totalPurchases)
    .slice(0, 5);

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
      render: (date) => new Date(date).toLocaleDateString('tr-TR'),
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
    <div>
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
        </Space>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Müşteri"
              value={totalCustomers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <span className="text-sm text-green-500 ml-2">
                  <ArrowUpOutlined /> 12%
                </span>
              }
            />
            <div className="mt-2 text-xs text-gray-500">Son aya göre artış</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aktif Müşteri"
              value={activeCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div className="mt-2 text-xs text-gray-500">
              %{totalCustomers > 0 ? ((activeCustomers / totalCustomers) * 100).toFixed(1) : 0} aktivasyon oranı
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Ciro"
              value={totalRevenue}
              prefix="₺"
              precision={2}
              valueStyle={{ color: '#722ed1' }}
              suffix={
                <span className="text-sm text-green-500 ml-2">
                  <ArrowUpOutlined /> 8%
                </span>
              }
            />
            <div className="mt-2 text-xs text-gray-500">Bu ayki toplam</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ort. Müşteri Değeri"
              value={avgCustomerValue}
              prefix="₺"
              precision={2}
              valueStyle={{ color: '#fa8c16' }}
            />
            <div className="mt-2 text-xs text-gray-500">Müşteri başına ortalama</div>
          </Card>
        </Col>
      </Row>

      {/* Sales Funnel */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Satış Hunisi" loading={leadsLoading}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <div className="flex justify-between mb-2">
                  <Text>Potansiyel Müşteriler</Text>
                  <Text strong>{leadsData?.totalCount || 0}</Text>
                </div>
                <Progress percent={100} strokeColor="#1890ff" showInfo={false} />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Text>Nitelikli Leads</Text>
                  <Text strong>{leads.filter(l => l.status === 'Qualified').length}</Text>
                </div>
                <Progress
                  percent={leadsData?.totalCount ? (leads.filter(l => l.status === 'Qualified').length / leadsData.totalCount) * 100 : 0}
                  strokeColor="#52c41a"
                  showInfo={false}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Text>Açık Fırsatlar</Text>
                  <Text strong>{deals.filter(d => d.status === 'Open').length}</Text>
                </div>
                <Progress
                  percent={dealsData?.totalCount ? (deals.filter(d => d.status === 'Open').length / (leadsData?.totalCount || 1)) * 100 : 0}
                  strokeColor="#fa8c16"
                  showInfo={false}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Text>Kazanılan Anlaşmalar</Text>
                  <Text strong>{deals.filter(d => d.status === 'Won').length}</Text>
                </div>
                <Progress
                  percent={dealsData?.totalCount ? (deals.filter(d => d.status === 'Won').length / (leadsData?.totalCount || 1)) * 100 : 0}
                  strokeColor="#722ed1"
                  showInfo={false}
                />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="En Değerli Müşteriler" loading={customersLoading}>
            <List
              dataSource={topCustomers}
              renderItem={(customer, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Text strong className="text-blue-600">#{index + 1}</Text>
                      </div>
                    }
                    title={
                      <Link href={`/crm/customers/${customer.id}`}>
                        {customer.companyName}
                      </Link>
                    }
                    description={customer.contactPerson}
                  />
                  <div className="text-right">
                    <div className="font-semibold text-lg">₺{customer.totalPurchases.toLocaleString('tr-TR')}</div>
                    <Tag color={customer.status === 'Active' ? 'success' : 'default'}>
                      {customer.status === 'Active' ? 'Aktif' : 'Pasif'}
                    </Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Activities & Upcoming Deals */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Son Aktiviteler"
            loading={activitiesLoading}
            extra={<Link href="/crm/activities"><Button type="link">Tümünü Gör</Button></Link>}
          >
            <Table
              columns={activityColumns}
              dataSource={activities}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Yaklaşan Fırsatlar"
            loading={dealsLoading}
            extra={<Link href="/crm/deals"><Button type="link">Tümünü Gör</Button></Link>}
          >
            <List
              dataSource={deals.filter(d => d.status === 'Open').slice(0, 5)}
              renderItem={(deal) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<TrophyOutlined style={{ fontSize: 24, color: '#fa8c16' }} />}
                    title={<Link href={`/crm/deals/${deal.id}`}>{deal.title}</Link>}
                    description={
                      deal.expectedCloseDate
                        ? `Beklenen kapanış: ${new Date(deal.expectedCloseDate).toLocaleDateString('tr-TR')}`
                        : 'Tarih belirlenmedi'
                    }
                  />
                  <div className="text-right">
                    <div className="font-semibold">₺{deal.amount.toLocaleString('tr-TR')}</div>
                    <div className="text-xs text-gray-500">{deal.probability}% olasılık</div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
