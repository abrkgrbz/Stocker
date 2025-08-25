import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Table,
  Tag,
  Avatar,
  Space,
  Button,
  Dropdown,
  Select,
  DatePicker,
  Typography,
  List,
  Timeline,
  Badge,
  Tooltip,
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  FallOutlined,
  MoreOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ExportOutlined,
  FilterOutlined,
  FileTextOutlined,
  CrownOutlined,
  FireOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  StarOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Line, Area, Column, Pie, Tiny } from '@ant-design/charts';
import CountUp from 'react-countup';
import './metronic-dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const MetronicDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(false);

  // Stats Data
  const statsData = [
    {
      title: 'Total Revenue',
      value: 524350,
      prefix: '$',
      change: 12.5,
      changeType: 'increase',
      icon: <DollarOutlined />,
      color: '#667eea',
      bgColor: 'rgba(102, 126, 234, 0.1)',
      description: 'vs last month',
    },
    {
      title: 'Active Tenants',
      value: 386,
      change: 8.3,
      changeType: 'increase',
      icon: <TeamOutlined />,
      color: '#50cd89',
      bgColor: 'rgba(80, 205, 137, 0.1)',
      description: 'new this month',
    },
    {
      title: 'Total Users',
      value: 4823,
      change: 15.7,
      changeType: 'increase',
      icon: <UserOutlined />,
      color: '#ffc700',
      bgColor: 'rgba(255, 199, 0, 0.1)',
      description: 'active users',
    },
    {
      title: 'Conversion Rate',
      value: 68.3,
      suffix: '%',
      change: 3.2,
      changeType: 'decrease',
      icon: <RiseOutlined />,
      color: '#f1416c',
      bgColor: 'rgba(241, 65, 108, 0.1)',
      description: 'from trials',
    },
  ];

  // Revenue Chart Data
  const revenueData = [
    { month: 'Jan', revenue: 320000, profit: 120000 },
    { month: 'Feb', revenue: 385000, profit: 145000 },
    { month: 'Mar', revenue: 412000, profit: 168000 },
    { month: 'Apr', revenue: 445000, profit: 178000 },
    { month: 'May', revenue: 478000, profit: 195000 },
    { month: 'Jun', revenue: 524350, profit: 210000 },
  ];

  const revenueConfig = {
    data: revenueData,
    xField: 'month',
    yField: 'revenue',
    height: 300,
    smooth: true,
    color: 'l(0) 0:#667eea 1:#764ba2',
    areaStyle: {
      fillOpacity: 0.6,
    },
    xAxis: {
      grid: null,
    },
    yAxis: {
      label: {
        formatter: (v: string) => `$${parseInt(v) / 1000}k`,
      },
      grid: {
        line: {
          style: {
            stroke: '#f0f0f0',
            lineWidth: 1,
            lineDash: [4, 4],
          },
        },
      },
    },
    tooltip: {
      customContent: (title: string, items: any[]) => {
        return `<div style="padding: 8px;">
          <div style="margin-bottom: 4px; font-weight: 600;">${title}</div>
          ${items.map(item => 
            `<div style="color: ${item.color};">Revenue: $${item.data.revenue.toLocaleString()}</div>
             <div style="color: ${item.color};">Profit: $${item.data.profit.toLocaleString()}</div>`
          ).join('')}
        </div>`;
      },
    },
  };

  // Tenant Distribution
  const tenantData = [
    { type: 'Enterprise', value: 45, percentage: 11.6 },
    { type: 'Professional', value: 125, percentage: 32.4 },
    { type: 'Starter', value: 186, percentage: 48.2 },
    { type: 'Free Trial', value: 30, percentage: 7.8 },
  ];

  const pieConfig = {
    data: tenantData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    height: 300,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 14,
        fill: '#fff',
      },
    },
    color: ['#667eea', '#50cd89', '#ffc700', '#f1416c'],
    interactions: [{ type: 'element-active' }],
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '24px',
          fontWeight: 'bold',
        },
        content: '386\nTenants',
      },
    },
    legend: {
      position: 'bottom',
      flipPage: false,
    },
  };

  // Recent Activities
  const activities = [
    {
      type: 'success',
      title: 'New tenant registered',
      description: 'TechCorp Solutions joined the platform',
      time: '2 min ago',
      user: 'John Doe',
      avatar: null,
    },
    {
      type: 'info',
      title: 'Payment received',
      description: 'Invoice #1234 has been paid',
      time: '1 hour ago',
      user: 'Jane Smith',
      avatar: null,
    },
    {
      type: 'warning',
      title: 'Subscription expiring',
      description: 'CloudFirst Inc subscription expires in 3 days',
      time: '3 hours ago',
      user: 'System',
      avatar: null,
    },
    {
      type: 'error',
      title: 'Payment failed',
      description: 'Failed to process payment for StartupHub',
      time: '5 hours ago',
      user: 'System',
      avatar: null,
    },
  ];

  // Top Tenants
  const topTenants = [
    {
      key: '1',
      rank: 1,
      name: 'TechCorp Solutions',
      plan: 'Enterprise',
      users: 245,
      revenue: 45000,
      growth: 15.3,
      status: 'active',
    },
    {
      key: '2',
      rank: 2,
      name: 'Digital Dynamics',
      plan: 'Professional',
      users: 189,
      revenue: 32000,
      growth: 12.1,
      status: 'active',
    },
    {
      key: '3',
      rank: 3,
      name: 'CloudFirst Inc',
      plan: 'Enterprise',
      users: 156,
      revenue: 28500,
      growth: -3.2,
      status: 'suspended',
    },
    {
      key: '4',
      rank: 4,
      name: 'StartupHub',
      plan: 'Starter',
      users: 98,
      revenue: 18000,
      growth: 22.5,
      status: 'active',
    },
    {
      key: '5',
      rank: 5,
      name: 'InnovateTech',
      plan: 'Professional',
      users: 134,
      revenue: 24000,
      growth: 8.7,
      status: 'active',
    },
  ];

  const columns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => {
        const medals = {
          1: <TrophyOutlined style={{ color: '#ffd700', fontSize: 18 }} />,
          2: <TrophyOutlined style={{ color: '#c0c0c0', fontSize: 18 }} />,
          3: <TrophyOutlined style={{ color: '#cd7f32', fontSize: 18 }} />,
        };
        return (
          <Space>
            {medals[rank as keyof typeof medals]}
            <Text strong>#{rank}</Text>
          </Space>
        );
      },
    },
    {
      title: 'Tenant',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Space>
          <Avatar style={{ backgroundColor: '#667eea' }}>
            {name.substring(0, 2).toUpperCase()}
          </Avatar>
          <div>
            <Text strong>{name}</Text>
            <br />
            <Tag color={record.plan === 'Enterprise' ? 'purple' : record.plan === 'Professional' ? 'blue' : 'green'}>
              {record.plan}
            </Tag>
          </div>
        </Space>
      ),
    },
    {
      title: 'Users',
      dataIndex: 'users',
      key: 'users',
      render: (users: number) => (
        <Badge count={users} showZero style={{ backgroundColor: '#667eea' }} />
      ),
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => (
        <Text strong style={{ color: '#50cd89' }}>
          ${revenue.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Growth',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth: number) => (
        <Space>
          {growth > 0 ? (
            <ArrowUpOutlined style={{ color: '#50cd89' }} />
          ) : (
            <ArrowDownOutlined style={{ color: '#f1416c' }} />
          )}
          <Text style={{ color: growth > 0 ? '#50cd89' : '#f1416c' }}>
            {Math.abs(growth)}%
          </Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'View Details' },
              { key: 'edit', label: 'Edit' },
              { key: 'delete', label: 'Delete', danger: true },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="metronic-dashboard">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <Title level={3} className="page-title">Dashboard</Title>
          <Paragraph className="page-description">
            Welcome back! Here's what's happening with your platform today.
          </Paragraph>
        </div>
        <div className="header-actions">
          <Space>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 120 }}
            >
              <Select.Option value="today">Today</Select.Option>
              <Select.Option value="week">This Week</Select.Option>
              <Select.Option value="month">This Month</Select.Option>
              <Select.Option value="year">This Year</Select.Option>
            </Select>
            <RangePicker />
            <Button icon={<ExportOutlined />}>Export</Button>
            <Button type="primary" icon={<SyncOutlined />} onClick={() => setLoading(!loading)}>
              Refresh
            </Button>
          </Space>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[24, 24]} className="stats-row">
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="stat-card" loading={loading}>
              <div className="stat-card-content">
                <div className="stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-details">
                  <Text className="stat-title">{stat.title}</Text>
                  <div className="stat-value">
                    {stat.prefix}
                    <CountUp
                      end={stat.value}
                      duration={2}
                      separator=","
                      decimals={stat.suffix === '%' ? 1 : 0}
                    />
                    {stat.suffix}
                  </div>
                  <div className="stat-change">
                    {stat.changeType === 'increase' ? (
                      <ArrowUpOutlined style={{ color: '#50cd89' }} />
                    ) : (
                      <ArrowDownOutlined style={{ color: '#f1416c' }} />
                    )}
                    <span className={`change-value ${stat.changeType}`}>
                      {stat.change}%
                    </span>
                    <span className="change-description">{stat.description}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={[24, 24]} className="charts-row">
        <Col xs={24} lg={16}>
          <Card
            title="Revenue Overview"
            extra={
              <Space>
                <Button type="text" icon={<FilterOutlined />}>Filter</Button>
                <Button type="text" icon={<MoreOutlined />} />
              </Space>
            }
            className="chart-card"
            loading={loading}
          >
            <Area {...revenueConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Tenant Distribution"
            extra={<Button type="text" icon={<MoreOutlined />} />}
            className="chart-card"
            loading={loading}
          >
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>

      {/* Tables Row */}
      <Row gutter={[24, 24]} className="tables-row">
        <Col xs={24} lg={16}>
          <Card
            title="Top Performing Tenants"
            extra={
              <Space>
                <Button type="text">View All</Button>
                <Button type="text" icon={<MoreOutlined />} />
              </Space>
            }
            className="table-card"
          >
            <Table
              columns={columns}
              dataSource={topTenants}
              pagination={false}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Recent Activities"
            extra={<Button type="text">View All</Button>}
            className="activity-card"
            loading={loading}
          >
            <Timeline>
              {activities.map((activity, index) => (
                <Timeline.Item
                  key={index}
                  color={
                    activity.type === 'success' ? 'green' :
                    activity.type === 'info' ? 'blue' :
                    activity.type === 'warning' ? 'orange' : 'red'
                  }
                >
                  <div className="activity-item">
                    <Text strong>{activity.title}</Text>
                    <br />
                    <Text type="secondary">{activity.description}</Text>
                    <br />
                    <Space className="activity-meta">
                      <ClockCircleOutlined />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {activity.time}
                      </Text>
                      {activity.user && (
                        <>
                          <span>•</span>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            by {activity.user}
                          </Text>
                        </>
                      )}
                    </Space>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row gutter={[24, 24]} className="quick-stats-row">
        <Col xs={24}>
          <Card title="Platform Performance" className="performance-card">
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={6}>
                <div className="performance-metric">
                  <div className="metric-header">
                    <Text type="secondary">Server Uptime</Text>
                    <CheckCircleOutlined style={{ color: '#50cd89' }} />
                  </div>
                  <Progress percent={99.9} strokeColor="#50cd89" />
                  <Text strong>99.9% Uptime</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="performance-metric">
                  <div className="metric-header">
                    <Text type="secondary">Response Time</Text>
                    <ThunderboltOutlined style={{ color: '#ffc700' }} />
                  </div>
                  <Progress percent={85} strokeColor="#ffc700" />
                  <Text strong>245ms Average</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="performance-metric">
                  <div className="metric-header">
                    <Text type="secondary">API Calls</Text>
                    <ApiOutlined style={{ color: '#667eea' }} />
                  </div>
                  <Progress percent={68} strokeColor="#667eea" />
                  <Text strong>1.2M Today</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="performance-metric">
                  <div className="metric-header">
                    <Text type="secondary">Error Rate</Text>
                    <WarningOutlined style={{ color: '#f1416c' }} />
                  </div>
                  <Progress percent={2} strokeColor="#f1416c" />
                  <Text strong>0.02% Errors</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MetronicDashboard;

// Add missing import
import { ApiOutlined, WarningOutlined } from '@ant-design/icons';