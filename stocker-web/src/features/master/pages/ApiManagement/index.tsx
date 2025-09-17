import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Table,
  Space,
  Tag,
  Tooltip,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Tabs,
  Row,
  Col,
  Statistic,
  Progress,
  Timeline,
  Alert,
  Popconfirm,
  message,
  Dropdown,
  Menu,
  Badge,
  Divider,
  InputNumber,
  Checkbox,
  List,
  Avatar,
  notification,
  Descriptions,
  Collapse
} from 'antd';
import {
  ApiOutlined,
  PlusOutlined,
  KeyOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  ReloadOutlined,
  SettingOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  CloudServerOutlined,
  BarChartOutlined,
  ApiOutlined as WebhookOutlined, // WebhookOutlined yok, ApiOutlined kullan
  LockOutlined,
  UnlockOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  MoreOutlined,
  FilterOutlined,
  ExportOutlined,
  InfoCircleOutlined,
  GlobalOutlined,
  CodeOutlined,
  FileTextOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Line, Bar, Pie } from '@/components/LazyChart';
// Chart components are imported from @/components/LazyChart above
import './api-management.css';
import './api-management-enhanced.css';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface ApiKey {
  id: string;
  name: string;
  key: string;
  secret?: string;
  tenantId: string;
  tenantName: string;
  environment: 'development' | 'staging' | 'production';
  status: 'active' | 'inactive' | 'revoked' | 'expired';
  permissions: string[];
  rateLimit: {
    requests: number;
    period: 'second' | 'minute' | 'hour' | 'day';
    burst?: number;
  };
  usage: {
    requests: number;
    errors: number;
    lastUsed: string;
    bandwidth: number;
  };
  ipWhitelist?: string[];
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
  lastModified: string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'failed';
  secret: string;
  headers?: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    retryInterval: number;
    backoffMultiplier: number;
  };
  lastTriggered?: string;
  successRate: number;
  totalCalls: number;
  failedCalls: number;
  createdAt: string;
}

interface ApiEndpoint {
  id: string;
  path: string;
  method: string;
  description: string;
  category: string;
  authentication: boolean;
  rateLimit?: {
    requests: number;
    period: string;
  };
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  responses: Array<{
    status: number;
    description: string;
  }>;
  deprecated: boolean;
  version: string;
}

const ApiManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('keys');
  const [keyModalVisible, setKeyModalVisible] = useState(false);
  const [webhookModalVisible, setWebhookModalVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [form] = Form.useForm();
  const [webhookForm] = Form.useForm();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  // Mock data
  useEffect(() => {
    const mockApiKeys: ApiKey[] = [
      {
        id: '1',
        name: 'Production API',
        key: 'pk_live_51234567890abcdef',
        secret: 'sk_live_51234567890abcdef_secret123',
        tenantId: 'tenant_001',
        tenantName: 'Acme Corporation',
        environment: 'production',
        status: 'active',
        permissions: ['read', 'write', 'delete'],
        rateLimit: {
          requests: 10000,
          period: 'hour',
          burst: 100
        },
        usage: {
          requests: 45678,
          errors: 23,
          lastUsed: dayjs().subtract(5, 'minutes').toISOString(),
          bandwidth: 1024000000
        },
        ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
        expiresAt: dayjs().add(90, 'days').toISOString(),
        createdAt: dayjs().subtract(30, 'days').toISOString(),
        createdBy: 'admin@example.com',
        lastModified: dayjs().subtract(2, 'days').toISOString()
      },
      {
        id: '2',
        name: 'Development API',
        key: 'pk_test_98765432109876',
        secret: 'sk_test_98765432109876_secret456',
        tenantId: 'tenant_002',
        tenantName: 'Beta Tech Inc',
        environment: 'development',
        status: 'active',
        permissions: ['read'],
        rateLimit: {
          requests: 1000,
          period: 'hour'
        },
        usage: {
          requests: 1234,
          errors: 5,
          lastUsed: dayjs().subtract(1, 'hour').toISOString(),
          bandwidth: 50000000
        },
        createdAt: dayjs().subtract(15, 'days').toISOString(),
        createdBy: 'developer@example.com',
        lastModified: dayjs().subtract(5, 'days').toISOString()
      },
      {
        id: '3',
        name: 'Mobile App Key',
        key: 'pk_mobile_abc123def456',
        tenantId: 'tenant_001',
        tenantName: 'Acme Corporation',
        environment: 'production',
        status: 'revoked',
        permissions: ['read'],
        rateLimit: {
          requests: 5000,
          period: 'hour'
        },
        usage: {
          requests: 98765,
          errors: 145,
          lastUsed: dayjs().subtract(7, 'days').toISOString(),
          bandwidth: 250000000
        },
        createdAt: dayjs().subtract(60, 'days').toISOString(),
        createdBy: 'mobile@example.com',
        lastModified: dayjs().subtract(7, 'days').toISOString()
      }
    ];

    const mockWebhooks: Webhook[] = [
      {
        id: '1',
        name: 'Order Events',
        url: 'https://api.example.com/webhooks/orders',
        events: ['order.created', 'order.updated', 'order.cancelled'],
        status: 'active',
        secret: 'whsec_test_secret123',
        headers: {
          'X-Custom-Header': 'CustomValue'
        },
        retryPolicy: {
          maxRetries: 3,
          retryInterval: 60,
          backoffMultiplier: 2
        },
        lastTriggered: dayjs().subtract(30, 'minutes').toISOString(),
        successRate: 98.5,
        totalCalls: 1523,
        failedCalls: 23,
        createdAt: dayjs().subtract(20, 'days').toISOString()
      },
      {
        id: '2',
        name: 'Payment Notifications',
        url: 'https://payment.example.com/webhook',
        events: ['payment.success', 'payment.failed', 'refund.processed'],
        status: 'active',
        secret: 'whsec_live_secret456',
        retryPolicy: {
          maxRetries: 5,
          retryInterval: 30,
          backoffMultiplier: 1.5
        },
        lastTriggered: dayjs().subtract(2, 'hours').toISOString(),
        successRate: 99.8,
        totalCalls: 4567,
        failedCalls: 9,
        createdAt: dayjs().subtract(45, 'days').toISOString()
      },
      {
        id: '3',
        name: 'Inventory Updates',
        url: 'https://inventory.example.com/hooks',
        events: ['product.updated', 'stock.low', 'stock.out'],
        status: 'failed',
        secret: 'whsec_inv_secret789',
        retryPolicy: {
          maxRetries: 3,
          retryInterval: 120,
          backoffMultiplier: 2
        },
        lastTriggered: dayjs().subtract(1, 'day').toISOString(),
        successRate: 85.2,
        totalCalls: 892,
        failedCalls: 132,
        createdAt: dayjs().subtract(10, 'days').toISOString()
      }
    ];

    const mockEndpoints: ApiEndpoint[] = [
      {
        id: '1',
        path: '/api/v1/products',
        method: 'GET',
        description: 'List all products',
        category: 'Products',
        authentication: true,
        rateLimit: {
          requests: 100,
          period: 'minute'
        },
        parameters: [
          {
            name: 'page',
            type: 'integer',
            required: false,
            description: 'Page number'
          },
          {
            name: 'limit',
            type: 'integer',
            required: false,
            description: 'Items per page'
          }
        ],
        responses: [
          {
            status: 200,
            description: 'Success'
          },
          {
            status: 401,
            description: 'Unauthorized'
          }
        ],
        deprecated: false,
        version: 'v1'
      },
      {
        id: '2',
        path: '/api/v1/orders',
        method: 'POST',
        description: 'Create a new order',
        category: 'Orders',
        authentication: true,
        rateLimit: {
          requests: 10,
          period: 'minute'
        },
        parameters: [
          {
            name: 'customer_id',
            type: 'string',
            required: true,
            description: 'Customer ID'
          },
          {
            name: 'items',
            type: 'array',
            required: true,
            description: 'Order items'
          }
        ],
        responses: [
          {
            status: 201,
            description: 'Created'
          },
          {
            status: 400,
            description: 'Bad Request'
          }
        ],
        deprecated: false,
        version: 'v1'
      }
    ];

    setApiKeys(mockApiKeys);
    setWebhooks(mockWebhooks);
    setEndpoints(mockEndpoints);
  }, []);

  const handleCreateApiKey = () => {
    setSelectedKey(null);
    form.resetFields();
    setKeyModalVisible(true);
  };

  const handleEditApiKey = (key: ApiKey) => {
    setSelectedKey(key);
    form.setFieldsValue({
      name: key.name,
      environment: key.environment,
      permissions: key.permissions,
      rateLimit: key.rateLimit.requests,
      ratePeriod: key.rateLimit.period,
      expiresAt: key.expiresAt ? dayjs(key.expiresAt) : undefined,
      ipWhitelist: key.ipWhitelist?.join('\n')
    });
    setKeyModalVisible(true);
  };

  const handleRevokeKey = (keyId: string) => {
    Modal.confirm({
      title: 'Revoke API Key',
      icon: <WarningOutlined />,
      content: 'Are you sure you want to revoke this API key? This action cannot be undone.',
      okText: 'Revoke',
      okType: 'danger',
      onOk: () => {
        setApiKeys(prev => prev.map(k => 
          k.id === keyId ? { ...k, status: 'revoked' as const } : k
        ));
        message.success('API key revoked successfully');
      }
    });
  };

  const handleRegenerateKey = (keyId: string) => {
    Modal.confirm({
      title: 'Regenerate API Key',
      icon: <ReloadOutlined />,
      content: 'This will generate a new key and invalidate the current one. Continue?',
      onOk: () => {
        const newKey = `pk_${Math.random().toString(36).substr(2, 20)}`;
        const newSecret = `sk_${Math.random().toString(36).substr(2, 30)}`;
        setApiKeys(prev => prev.map(k => 
          k.id === keyId ? { ...k, key: newKey, secret: newSecret } : k
        ));
        notification.success({
          message: 'API Key Regenerated',
          description: 'The new key has been copied to your clipboard.',
          duration: 5
        });
        navigator.clipboard.writeText(newKey);
      }
    });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    message.success('API key copied to clipboard');
  };

  const handleCreateWebhook = () => {
    setSelectedWebhook(null);
    webhookForm.resetFields();
    setWebhookModalVisible(true);
  };

  const handleEditWebhook = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    webhookForm.setFieldsValue({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      maxRetries: webhook.retryPolicy.maxRetries,
      retryInterval: webhook.retryPolicy.retryInterval
    });
    setWebhookModalVisible(true);
  };

  const handleTestWebhook = (webhook: Webhook) => {
    message.loading('Testing webhook...', 2).then(() => {
      message.success('Webhook test successful!');
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'success',
      inactive: 'default',
      revoked: 'error',
      expired: 'warning',
      failed: 'error'
    };
    return colors[status] || 'default';
  };

  const apiKeyColumns: ColumnType<ApiKey>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <KeyOutlined />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.tenantName} • {record.environment}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'API Key',
      dataIndex: 'key',
      key: 'key',
      render: (text, record) => (
        <Space>
          <Text code copyable={{ text }}>
            {text.substring(0, 20)}...
          </Text>
          {record.secret && (
            <Tooltip title={showSecret[record.id] ? 'Hide secret' : 'Show secret'}>
              <Button
                size="small"
                icon={showSecret[record.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => setShowSecret(prev => ({ ...prev, [record.id]: !prev[record.id] }))}
              />
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={
          status === 'active' ? <CheckCircleOutlined /> :
          status === 'revoked' ? <LockOutlined /> :
          status === 'expired' ? <ClockCircleOutlined /> :
          <WarningOutlined />
        }>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Rate Limit',
      key: 'rateLimit',
      render: (_, record) => (
        <Text type="secondary">
          {record.rateLimit.requests.toLocaleString()}/{record.rateLimit.period}
        </Text>
      )
    },
    {
      title: 'Usage',
      key: 'usage',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.usage.requests.toLocaleString()} requests</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Last used {dayjs(record.usage.lastUsed).fromNow()}
          </Text>
        </Space>
      )
    },
    {
      title: 'Expires',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date) => date ? (
        <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm')}>
          <Text>{dayjs(date).fromNow()}</Text>
        </Tooltip>
      ) : <Text type="secondary">Never</Text>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditApiKey(record)}
            />
          </Tooltip>
          <Tooltip title="Regenerate">
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => handleRegenerateKey(record.id)}
              disabled={record.status === 'revoked'}
            />
          </Tooltip>
          <Tooltip title="Revoke">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRevokeKey(record.id)}
              disabled={record.status === 'revoked'}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const webhookColumns: ColumnType<Webhook>[] = [
    {
      title: 'Webhook',
      key: 'webhook',
      render: (_, record) => (
        <Space>
          <WebhookOutlined />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.url}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Events',
      dataIndex: 'events',
      key: 'events',
      render: (events) => (
        <Space wrap>
          {events.slice(0, 2).map((event: string) => (
            <Tag key={event}>{event}</Tag>
          ))}
          {events.length > 2 && (
            <Tag>+{events.length - 2} more</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === 'active' ? 'success' : status === 'failed' ? 'error' : 'default'}
          text={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      )
    },
    {
      title: 'Success Rate',
      key: 'successRate',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Progress
            percent={record.successRate}
            size="small"
            status={record.successRate > 95 ? 'success' : record.successRate > 80 ? 'normal' : 'exception'}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.totalCalls.toLocaleString()} calls
          </Text>
        </Space>
      )
    },
    {
      title: 'Last Triggered',
      dataIndex: 'lastTriggered',
      key: 'lastTriggered',
      render: (date) => date ? (
        <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
          <Text>{dayjs(date).fromNow()}</Text>
        </Tooltip>
      ) : <Text type="secondary">Never</Text>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditWebhook(record)}
            />
          </Tooltip>
          <Tooltip title="Test">
            <Button
              size="small"
              icon={<ThunderboltOutlined />}
              onClick={() => handleTestWebhook(record)}
            />
          </Tooltip>
          <Tooltip title="View Logs">
            <Button
              size="small"
              icon={<HistoryOutlined />}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const usageData = [
    { date: '01', requests: 4500, errors: 45 },
    { date: '02', requests: 5200, errors: 23 },
    { date: '03', requests: 4800, errors: 67 },
    { date: '04', requests: 6100, errors: 34 },
    { date: '05', requests: 5500, errors: 28 },
    { date: '06', requests: 5900, errors: 41 },
    { date: '07', requests: 6500, errors: 52 }
  ];

  const methodDistribution = [
    { name: 'GET', value: 65, color: '#52c41a' },
    { name: 'POST', value: 20, color: '#1890ff' },
    { name: 'PUT', value: 10, color: '#faad14' },
    { name: 'DELETE', value: 5, color: '#ff4d4f' }
  ];

  return (
    <div className="api-management-container">
      <div className="api-header">
        <Title level={2}>
          <ApiOutlined /> API Management
        </Title>
        <Space>
          <Button icon={<ExportOutlined />}>Export</Button>
          <Button icon={<SettingOutlined />}>Settings</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Total API Keys"
              value={apiKeys.filter(k => k.status === 'active').length}
              prefix={<KeyOutlined />}
              suffix={`/ ${apiKeys.length}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Active Webhooks"
              value={webhooks.filter(w => w.status === 'active').length}
              prefix={<WebhookOutlined />}
              suffix={`/ ${webhooks.length}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Requests (24h)"
              value={156789}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Error Rate"
              value={0.52}
              suffix="%"
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><KeyOutlined /> API Keys</span>} key="keys">
          <Card>
            <Space style={{ marginBottom: 16 }} wrap>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateApiKey}
              >
                Generate New Key
              </Button>
              <Select
                style={{ width: 150 }}
                placeholder="Filter by status"
                value={filterStatus}
                onChange={setFilterStatus}
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="revoked">Revoked</Option>
              </Select>
              <Input.Search
                placeholder="Search keys..."
                style={{ width: 250 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Space>

            <Table
              columns={apiKeyColumns}
              dataSource={apiKeys.filter(key => {
                if (filterStatus !== 'all' && key.status !== filterStatus) return false;
                if (searchText && !key.name.toLowerCase().includes(searchText.toLowerCase())) return false;
                return true;
              })}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} keys`
              }}
              expandable={{
                expandedRowRender: (record) => (
                  <div className="expanded-row">
                    {showSecret[record.id] && record.secret && (
                      <Alert
                        message="Secret Key"
                        description={
                          <Text code copyable={{ text: record.secret }}>
                            {record.secret}
                          </Text>
                        }
                        type="warning"
                        icon={<LockOutlined />}
                        style={{ marginBottom: 16 }}
                      />
                    )}
                    <Descriptions size="small" column={2}>
                      <Descriptions.Item label="Created By">{record.createdBy}</Descriptions.Item>
                      <Descriptions.Item label="Created At">
                        {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm')}
                      </Descriptions.Item>
                      <Descriptions.Item label="Permissions">
                        {record.permissions.map(p => <Tag key={p}>{p}</Tag>)}
                      </Descriptions.Item>
                      <Descriptions.Item label="IP Whitelist">
                        {record.ipWhitelist?.join(', ') || 'None'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Total Requests">
                        {record.usage.requests.toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Error Count">
                        {record.usage.errors.toLocaleString()}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                )
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><WebhookOutlined /> Webhooks</span>} key="webhooks">
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateWebhook}
              >
                Add Webhook
              </Button>
              <Button icon={<ReloadOutlined />}>Refresh</Button>
            </Space>

            <Table
              columns={webhookColumns}
              dataSource={webhooks}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><BarChartOutlined /> Usage Analytics</span>} key="usage">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="API Usage Trend">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="requests"
                      stroke="#1890ff"
                      name="Requests"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="errors"
                      stroke="#ff4d4f"
                      name="Errors"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Method Distribution">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={methodDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {methodDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Card title="Top Endpoints" style={{ marginTop: 16 }}>
            <List
              dataSource={endpoints}
              renderItem={(endpoint) => (
                <List.Item
                  actions={[
                    <Tag color={endpoint.method === 'GET' ? 'green' : endpoint.method === 'POST' ? 'blue' : 'orange'}>
                      {endpoint.method}
                    </Tag>,
                    <Text type="secondary">
                      {endpoint.rateLimit?.requests}/{endpoint.rateLimit?.period}
                    </Text>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<CodeOutlined />} />}
                    title={endpoint.path}
                    description={endpoint.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><FileTextOutlined /> Documentation</span>} key="docs">
          <Card>
            <Alert
              message="API Documentation"
              description="Interactive API documentation with request/response examples and testing capabilities."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Collapse>
              {endpoints.map(endpoint => (
                <Collapse.Panel
                  key={endpoint.id}
                  header={
                    <Space>
                      <Tag color={endpoint.method === 'GET' ? 'green' : endpoint.method === 'POST' ? 'blue' : 'orange'}>
                        {endpoint.method}
                      </Tag>
                      <Text strong>{endpoint.path}</Text>
                      <Text type="secondary">- {endpoint.description}</Text>
                      {endpoint.deprecated && <Tag color="error">Deprecated</Tag>}
                    </Space>
                  }
                >
                  <Descriptions column={1}>
                    <Descriptions.Item label="Authentication">
                      {endpoint.authentication ? 'Required' : 'Not required'}
                    </Descriptions.Item>
                    {endpoint.rateLimit && (
                      <Descriptions.Item label="Rate Limit">
                        {endpoint.rateLimit.requests} requests per {endpoint.rateLimit.period}
                      </Descriptions.Item>
                    )}
                  </Descriptions>

                  <Divider orientation="left">Parameters</Divider>
                  <Table
                    dataSource={endpoint.parameters}
                    columns={[
                      { title: 'Name', dataIndex: 'name', key: 'name' },
                      { title: 'Type', dataIndex: 'type', key: 'type' },
                      {
                        title: 'Required',
                        dataIndex: 'required',
                        key: 'required',
                        render: (required) => required ? <Tag color="red">Required</Tag> : <Tag>Optional</Tag>
                      },
                      { title: 'Description', dataIndex: 'description', key: 'description' }
                    ]}
                    pagination={false}
                    size="small"
                  />

                  <Divider orientation="left">Responses</Divider>
                  <List
                    dataSource={endpoint.responses}
                    renderItem={(response) => (
                      <List.Item>
                        <Tag color={response.status >= 200 && response.status < 300 ? 'success' : 'error'}>
                          {response.status}
                        </Tag>
                        <Text>{response.description}</Text>
                      </List.Item>
                    )}
                  />
                </Collapse.Panel>
              ))}
            </Collapse>
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={selectedKey ? 'Edit API Key' : 'Generate New API Key'}
        visible={keyModalVisible}
        onCancel={() => setKeyModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setKeyModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              form.validateFields().then(values => {
                if (selectedKey) {
                  message.success('API key updated successfully');
                } else {
                  message.success('New API key generated successfully');
                }
                setKeyModalVisible(false);
              });
            }}
          >
            {selectedKey ? 'Update' : 'Generate'}
          </Button>
        ]}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Key Name"
            rules={[{ required: true, message: 'Please enter a key name' }]}
          >
            <Input placeholder="e.g., Production API Key" />
          </Form.Item>

          <Form.Item
            name="environment"
            label="Environment"
            rules={[{ required: true, message: 'Please select an environment' }]}
          >
            <Select placeholder="Select environment">
              <Option value="development">Development</Option>
              <Option value="staging">Staging</Option>
              <Option value="production">Production</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="permissions"
            label="Permissions"
            rules={[{ required: true, message: 'Please select permissions' }]}
          >
            <Checkbox.Group>
              <Row>
                <Col span={8}>
                  <Checkbox value="read">Read</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="write">Write</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="delete">Delete</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="rateLimit"
                label="Rate Limit"
                rules={[{ required: true, message: 'Please enter rate limit' }]}
              >
                <InputNumber
                  min={1}
                  max={100000}
                  style={{ width: '100%' }}
                  placeholder="Requests"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ratePeriod"
                label="Period"
                rules={[{ required: true, message: 'Please select period' }]}
              >
                <Select placeholder="Select period">
                  <Option value="second">Per Second</Option>
                  <Option value="minute">Per Minute</Option>
                  <Option value="hour">Per Hour</Option>
                  <Option value="day">Per Day</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="expiresAt"
            label="Expiration Date (Optional)"
          >
            <DatePicker
              style={{ width: '100%' }}
              showTime
              disabledDate={(current) => current && current < dayjs().endOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="ipWhitelist"
            label="IP Whitelist (Optional)"
            extra="Enter one IP address or CIDR block per line"
          >
            <TextArea
              rows={3}
              placeholder="192.168.1.0/24&#10;10.0.0.1"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={selectedWebhook ? 'Edit Webhook' : 'Add Webhook'}
        visible={webhookModalVisible}
        onCancel={() => setWebhookModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setWebhookModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              webhookForm.validateFields().then(values => {
                if (selectedWebhook) {
                  message.success('Webhook updated successfully');
                } else {
                  message.success('Webhook added successfully');
                }
                setWebhookModalVisible(false);
              });
            }}
          >
            {selectedWebhook ? 'Update' : 'Add'}
          </Button>
        ]}
        width={600}
      >
        <Form form={webhookForm} layout="vertical">
          <Form.Item
            name="name"
            label="Webhook Name"
            rules={[{ required: true, message: 'Please enter webhook name' }]}
          >
            <Input placeholder="e.g., Order Notifications" />
          </Form.Item>

          <Form.Item
            name="url"
            label="Webhook URL"
            rules={[
              { required: true, message: 'Please enter webhook URL' },
              { type: 'url', message: 'Please enter a valid URL' }
            ]}
          >
            <Input placeholder="https://api.example.com/webhook" />
          </Form.Item>

          <Form.Item
            name="events"
            label="Events"
            rules={[{ required: true, message: 'Please select at least one event' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select events to trigger webhook"
            >
              <Option value="order.created">Order Created</Option>
              <Option value="order.updated">Order Updated</Option>
              <Option value="order.cancelled">Order Cancelled</Option>
              <Option value="payment.success">Payment Success</Option>
              <Option value="payment.failed">Payment Failed</Option>
              <Option value="refund.processed">Refund Processed</Option>
              <Option value="product.updated">Product Updated</Option>
              <Option value="stock.low">Stock Low</Option>
              <Option value="stock.out">Stock Out</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxRetries"
                label="Max Retries"
                initialValue={3}
              >
                <InputNumber
                  min={0}
                  max={10}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="retryInterval"
                label="Retry Interval (seconds)"
                initialValue={60}
              >
                <InputNumber
                  min={10}
                  max={600}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ApiManagement;