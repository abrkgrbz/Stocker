import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch,
  message,
  Row,
  Col,
  Statistic,
  Alert,
  Typography,
  Divider,
  List,
  Timeline,
  Badge,
  Tabs,
  Tooltip,
  Descriptions,
  Result,
  Progress,
  Checkbox,
  Radio,
  Empty,
  Dropdown,
  Collapse
} from 'antd';
import {
  WebhookOutlined,
  ApiOutlined,
  SendOutlined,
  LinkOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  SecurityScanOutlined,
  KeyOutlined,
  CopyOutlined,
  HistoryOutlined,
  BugOutlined,
  CodeOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  MoreOutlined,
  FilterOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'failed';
  secret?: string;
  headers?: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
  createdAt: string;
  createdBy: string;
  lastTriggered?: string;
  successRate: number;
  totalCalls: number;
  failedCalls: number;
}

interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failed' | 'pending' | 'retrying';
  statusCode?: number;
  timestamp: string;
  duration: number;
  request: {
    headers: Record<string, string>;
    body: any;
  };
  response?: {
    statusCode: number;
    body: any;
  };
  error?: string;
  retryCount: number;
}

interface WebhookEvent {
  id: string;
  name: string;
  category: string;
  description: string;
  payload: any;
}

const TenantWebhooks: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [activeTab, setActiveTab] = useState('webhooks');
  
  // Modals
  const [webhookModalVisible, setWebhookModalVisible] = useState(false);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [secretModalVisible, setSecretModalVisible] = useState(false);
  
  const [form] = Form.useForm();
  const [testForm] = Form.useForm();

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');

  const availableEvents: WebhookEvent[] = [
    {
      id: 'user.created',
      name: 'Kullanıcı Oluşturuldu',
      category: 'Kullanıcı',
      description: 'Yeni kullanıcı oluşturulduğunda tetiklenir',
      payload: { userId: 'string', email: 'string', name: 'string' }
    },
    {
      id: 'user.updated',
      name: 'Kullanıcı Güncellendi',
      category: 'Kullanıcı',
      description: 'Kullanıcı bilgileri güncellendiğinde tetiklenir',
      payload: { userId: 'string', changes: 'object' }
    },
    {
      id: 'user.deleted',
      name: 'Kullanıcı Silindi',
      category: 'Kullanıcı',
      description: 'Kullanıcı silindiğinde tetiklenir',
      payload: { userId: 'string' }
    },
    {
      id: 'payment.completed',
      name: 'Ödeme Tamamlandı',
      category: 'Ödeme',
      description: 'Ödeme başarıyla tamamlandığında tetiklenir',
      payload: { paymentId: 'string', amount: 'number', currency: 'string' }
    },
    {
      id: 'payment.failed',
      name: 'Ödeme Başarısız',
      category: 'Ödeme',
      description: 'Ödeme başarısız olduğunda tetiklenir',
      payload: { paymentId: 'string', error: 'string' }
    },
    {
      id: 'subscription.created',
      name: 'Abonelik Oluşturuldu',
      category: 'Abonelik',
      description: 'Yeni abonelik oluşturulduğunda tetiklenir',
      payload: { subscriptionId: 'string', plan: 'string' }
    },
    {
      id: 'subscription.cancelled',
      name: 'Abonelik İptal Edildi',
      category: 'Abonelik',
      description: 'Abonelik iptal edildiğinde tetiklenir',
      payload: { subscriptionId: 'string', reason: 'string' }
    }
  ];

  useEffect(() => {
    fetchWebhooks();
    fetchLogs();
  }, [id]);

  const fetchWebhooks = async () => {
    setLoading(true);
    // Simulated data
    setTimeout(() => {
      setWebhooks([
        {
          id: '1',
          name: 'Slack Notifications',
          url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX',
          events: ['user.created', 'payment.completed', 'subscription.created'],
          status: 'active',
          secret: 'whsec_1234567890abcdef',
          headers: {
            'Content-Type': 'application/json',
            'X-Custom-Header': 'CustomValue'
          },
          retryPolicy: {
            maxRetries: 3,
            retryDelay: 1000,
            backoffMultiplier: 2
          },
          createdAt: '2023-06-15T10:00:00',
          createdBy: 'admin@example.com',
          lastTriggered: '2024-01-15T14:30:00',
          successRate: 95.5,
          totalCalls: 1234,
          failedCalls: 56
        },
        {
          id: '2',
          name: 'CRM Integration',
          url: 'https://api.crm.com/webhooks/receive',
          events: ['user.created', 'user.updated', 'user.deleted'],
          status: 'active',
          secret: 'whsec_abcdef1234567890',
          retryPolicy: {
            maxRetries: 5,
            retryDelay: 2000,
            backoffMultiplier: 1.5
          },
          createdAt: '2023-07-20T11:00:00',
          createdBy: 'admin@example.com',
          lastTriggered: '2024-01-15T13:15:00',
          successRate: 98.2,
          totalCalls: 567,
          failedCalls: 10
        },
        {
          id: '3',
          name: 'Payment Processor',
          url: 'https://payments.example.com/webhook',
          events: ['payment.completed', 'payment.failed'],
          status: 'failed',
          retryPolicy: {
            maxRetries: 3,
            retryDelay: 1000,
            backoffMultiplier: 2
          },
          createdAt: '2023-08-10T12:00:00',
          createdBy: 'admin@example.com',
          lastTriggered: '2024-01-15T10:00:00',
          successRate: 0,
          totalCalls: 89,
          failedCalls: 89
        },
        {
          id: '4',
          name: 'Analytics Service',
          url: 'https://analytics.example.com/events',
          events: ['user.created', 'subscription.created', 'subscription.cancelled'],
          status: 'inactive',
          retryPolicy: {
            maxRetries: 2,
            retryDelay: 500,
            backoffMultiplier: 2
          },
          createdAt: '2023-09-05T14:00:00',
          createdBy: 'admin@example.com',
          successRate: 100,
          totalCalls: 234,
          failedCalls: 0
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const fetchLogs = async () => {
    // Simulated data
    setLogs([
      {
        id: '1',
        webhookId: '1',
        event: 'user.created',
        status: 'success',
        statusCode: 200,
        timestamp: '2024-01-15T14:30:00',
        duration: 234,
        request: {
          headers: { 'Content-Type': 'application/json' },
          body: { userId: '123', email: 'user@example.com', name: 'John Doe' }
        },
        response: {
          statusCode: 200,
          body: { success: true }
        },
        retryCount: 0
      },
      {
        id: '2',
        webhookId: '3',
        event: 'payment.completed',
        status: 'failed',
        timestamp: '2024-01-15T10:00:00',
        duration: 5000,
        request: {
          headers: { 'Content-Type': 'application/json' },
          body: { paymentId: '456', amount: 100, currency: 'USD' }
        },
        error: 'Connection timeout',
        retryCount: 3
      },
      {
        id: '3',
        webhookId: '2',
        event: 'user.updated',
        status: 'success',
        statusCode: 200,
        timestamp: '2024-01-15T13:15:00',
        duration: 456,
        request: {
          headers: { 'Content-Type': 'application/json' },
          body: { userId: '789', changes: { name: 'Jane Doe' } }
        },
        response: {
          statusCode: 200,
          body: { received: true }
        },
        retryCount: 0
      },
      {
        id: '4',
        webhookId: '1',
        event: 'subscription.created',
        status: 'retrying',
        timestamp: '2024-01-15T14:25:00',
        duration: 1000,
        request: {
          headers: { 'Content-Type': 'application/json' },
          body: { subscriptionId: 'sub_123', plan: 'premium' }
        },
        error: 'HTTP 500 Internal Server Error',
        retryCount: 1
      }
    ]);
  };

  const handleCreateWebhook = () => {
    form.resetFields();
    setSelectedWebhook(null);
    setWebhookModalVisible(true);
  };

  const handleEditWebhook = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    form.setFieldsValue({
      ...webhook,
      headers: webhook.headers ? 
        Object.entries(webhook.headers).map(([key, value]) => ({ key, value })) : 
        []
    });
    setWebhookModalVisible(true);
  };

  const handleSaveWebhook = async (values: any) => {
    setLoading(true);
    try {
      // Convert headers array to object
      const headers = values.headers?.reduce((acc: any, curr: any) => {
        if (curr.key && curr.value) {
          acc[curr.key] = curr.value;
        }
        return acc;
      }, {});

      // API call would go here
      message.success(selectedWebhook ? 'Webhook güncellendi' : 'Webhook oluşturuldu');
      setWebhookModalVisible(false);
      fetchWebhooks();
    } catch (error) {
      message.error('İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = (webhookId: string) => {
    Modal.confirm({
      title: 'Webhook Sil',
      content: 'Bu webhook\'u silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      cancelText: 'İptal',
      okType: 'danger',
      onOk: async () => {
        setLoading(true);
        try {
          // API call would go here
          message.success('Webhook silindi');
          fetchWebhooks();
        } catch (error) {
          message.error('Silme işlemi başarısız');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleToggleWebhook = async (webhookId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      // API call would go here
      message.success(`Webhook ${newStatus === 'active' ? 'aktifleştirildi' : 'devre dışı bırakıldı'}`);
      fetchWebhooks();
    } catch (error) {
      message.error('İşlem başarısız');
    }
  };

  const handleTestWebhook = async (values: any) => {
    setLoading(true);
    try {
      // API call would go here
      message.success('Test webhook\'u gönderildi');
      setTestModalVisible(false);
    } catch (error) {
      message.error('Test başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateSecret = (webhookId: string) => {
    Modal.confirm({
      title: 'Secret Yenile',
      content: 'Webhook secret\'ı yenilemek istediğinizden emin misiniz? Mevcut secret geçersiz olacaktır.',
      okText: 'Yenile',
      cancelText: 'İptal',
      okType: 'primary',
      onOk: async () => {
        try {
          // API call would go here
          const newSecret = 'whsec_' + Math.random().toString(36).substring(2, 15);
          message.success('Secret yenilendi: ' + newSecret);
        } catch (error) {
          message.error('Secret yenilenemedi');
        }
      }
    });
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      active: { color: 'success', text: 'Aktif', icon: <CheckCircleOutlined /> },
      inactive: { color: 'default', text: 'Pasif', icon: <PauseCircleOutlined /> },
      failed: { color: 'error', text: 'Başarısız', icon: <CloseCircleOutlined /> },
      success: { color: 'success', text: 'Başarılı', icon: <CheckCircleOutlined /> },
      pending: { color: 'processing', text: 'Beklemede', icon: <ClockCircleOutlined /> },
      retrying: { color: 'warning', text: 'Tekrar Deneniyor', icon: <ReloadOutlined spin /> }
    };

    const config = statusConfig[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getEventCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Kullanıcı': 'blue',
      'Ödeme': 'green',
      'Abonelik': 'orange'
    };
    return colors[category] || 'default';
  };

  const columns: ColumnsType<Webhook> = [
    {
      title: 'Webhook',
      key: 'webhook',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
            {record.url}
          </Text>
        </Space>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Olaylar',
      dataIndex: 'events',
      key: 'events',
      width: 200,
      render: (events) => (
        <Space wrap>
          {events.slice(0, 2).map((event: string) => (
            <Tag key={event} style={{ fontSize: 11 }}>
              {event}
            </Tag>
          ))}
          {events.length > 2 && (
            <Tag style={{ fontSize: 11 }}>+{events.length - 2}</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Başarı Oranı',
      key: 'successRate',
      width: 150,
      render: (_, record) => (
        <Tooltip title={`${record.totalCalls - record.failedCalls} / ${record.totalCalls} başarılı`}>
          <Progress 
            percent={record.successRate} 
            size="small"
            status={record.successRate < 80 ? 'exception' : 'normal'}
            format={(percent) => `${percent}%`}
          />
        </Tooltip>
      )
    },
    {
      title: 'Son Tetiklenme',
      dataIndex: 'lastTriggered',
      key: 'lastTriggered',
      width: 150,
      render: (date) => date ? (
        <Tooltip title={dayjs(date).format('DD.MM.YYYY HH:mm:ss')}>
          {dayjs(date).fromNow()}
        </Tooltip>
      ) : '-'
    },
    {
      title: 'Toplam Çağrı',
      dataIndex: 'totalCalls',
      key: 'totalCalls',
      width: 100,
      render: (calls) => calls.toLocaleString('tr-TR')
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title={record.status === 'active' ? 'Duraklat' : 'Aktifleştir'}>
            <Button
              icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              size="small"
              onClick={() => handleToggleWebhook(record.id, record.status)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'edit',
                  label: 'Düzenle',
                  icon: <EditOutlined />,
                  onClick: () => handleEditWebhook(record)
                },
                {
                  key: 'test',
                  label: 'Test Et',
                  icon: <ThunderboltOutlined />,
                  onClick: () => {
                    setSelectedWebhook(record);
                    setTestModalVisible(true);
                  }
                },
                {
                  key: 'secret',
                  label: 'Secret Görüntüle',
                  icon: <KeyOutlined />,
                  onClick: () => {
                    setSelectedWebhook(record);
                    setSecretModalVisible(true);
                  }
                },
                {
                  key: 'logs',
                  label: 'Logları Görüntüle',
                  icon: <HistoryOutlined />,
                  onClick: () => {
                    setSelectedWebhook(record);
                    setActiveTab('logs');
                  }
                },
                {
                  type: 'divider'
                },
                {
                  key: 'delete',
                  label: 'Sil',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => handleDeleteWebhook(record.id)
                }
              ]
            }}
          >
            <Button icon={<MoreOutlined />} size="small" />
          </Dropdown>
        </Space>
      )
    }
  ];

  const logColumns: ColumnsType<WebhookLog> = [
    {
      title: 'Zaman',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp) => dayjs(timestamp).format('DD.MM.YYYY HH:mm:ss')
    },
    {
      title: 'Webhook',
      dataIndex: 'webhookId',
      key: 'webhookId',
      render: (webhookId) => {
        const webhook = webhooks.find(w => w.id === webhookId);
        return webhook?.name || webhookId;
      }
    },
    {
      title: 'Olay',
      dataIndex: 'event',
      key: 'event',
      render: (event) => <Tag>{event}</Tag>
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status)
    },
    {
      title: 'HTTP Kodu',
      dataIndex: 'statusCode',
      key: 'statusCode',
      width: 100,
      render: (code) => code ? (
        <Tag color={code >= 200 && code < 300 ? 'success' : code >= 400 ? 'error' : 'warning'}>
          {code}
        </Tag>
      ) : '-'
    },
    {
      title: 'Süre',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      render: (duration) => `${duration}ms`
    },
    {
      title: 'Tekrar',
      dataIndex: 'retryCount',
      key: 'retryCount',
      width: 80,
      render: (count) => count > 0 ? <Badge count={count} /> : '-'
    },
    {
      title: 'İşlem',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button 
          size="small" 
          onClick={() => {
            setSelectedLog(record);
            setLogModalVisible(true);
          }}
        >
          Detay
        </Button>
      )
    }
  ];

  const filteredWebhooks = webhooks.filter(webhook => {
    const matchesStatus = statusFilter === 'all' || webhook.status === statusFilter;
    const matchesEvent = eventFilter === 'all' || webhook.events.includes(eventFilter);
    return matchesStatus && matchesEvent;
  });

  const stats = {
    total: webhooks.length,
    active: webhooks.filter(w => w.status === 'active').length,
    failed: webhooks.filter(w => w.status === 'failed').length,
    totalCalls: webhooks.reduce((acc, w) => acc + w.totalCalls, 0),
    successRate: webhooks.length > 0 ? 
      Math.round(webhooks.reduce((acc, w) => acc + w.successRate, 0) / webhooks.length) : 0
  };

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={4} style={{ margin: 0 }}>
              <ApiOutlined /> Webhook Yönetimi
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchWebhooks}>
                Yenile
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreateWebhook}
              >
                Yeni Webhook
              </Button>
            </Space>
          </Col>
        </Row>
        <Divider />
        
        {/* Statistics */}
        <Row gutter={16}>
          <Col span={4}>
            <Statistic
              title="Toplam Webhook"
              value={stats.total}
              prefix={<ApiOutlined />}
            />
          </Col>
          <Col span={5}>
            <Statistic
              title="Aktif"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
          <Col span={5}>
            <Statistic
              title="Başarısız"
              value={stats.failed}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Col>
          <Col span={5}>
            <Statistic
              title="Toplam Çağrı"
              value={stats.totalCalls}
              prefix={<SendOutlined />}
            />
          </Col>
          <Col span={5}>
            <Statistic
              title="Ortalama Başarı"
              value={stats.successRate}
              suffix="%"
              valueStyle={{ color: stats.successRate < 80 ? '#ff4d4f' : '#52c41a' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Failed Webhooks Alert */}
      {stats.failed > 0 && (
        <Alert
          message="Başarısız Webhook'lar"
          description={`${stats.failed} webhook başarısız durumda. Lütfen kontrol ediniz.`}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Webhook'lar" key="webhooks">
            {/* Filters */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Select
                  placeholder="Durum"
                  style={{ width: '100%' }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  allowClear
                >
                  <Option value="all">Tüm Durumlar</Option>
                  <Option value="active">Aktif</Option>
                  <Option value="inactive">Pasif</Option>
                  <Option value="failed">Başarısız</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Select
                  placeholder="Olay Türü"
                  style={{ width: '100%' }}
                  value={eventFilter}
                  onChange={setEventFilter}
                  allowClear
                >
                  <Option value="all">Tüm Olaylar</Option>
                  {availableEvents.map(event => (
                    <Option key={event.id} value={event.id}>
                      {event.name}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={filteredWebhooks}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1300 }}
              pagination={{
                total: filteredWebhooks.length,
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} webhook`
              }}
            />
          </TabPane>

          <TabPane tab="Loglar" key="logs">
            <Table
              columns={logColumns}
              dataSource={logs}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} log`
              }}
            />
          </TabPane>

          <TabPane tab="Olaylar" key="events">
            <Alert
              message="Webhook Olayları"
              description="Sisteminizde tetiklenebilecek webhook olaylarının listesi"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Collapse>
              {['Kullanıcı', 'Ödeme', 'Abonelik'].map(category => (
                <Panel 
                  header={
                    <Space>
                      <Text strong>{category} Olayları</Text>
                      <Tag color={getEventCategoryColor(category)}>
                        {availableEvents.filter(e => e.category === category).length} olay
                      </Tag>
                    </Space>
                  } 
                  key={category}
                >
                  <List
                    dataSource={availableEvents.filter(e => e.category === category)}
                    renderItem={event => (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <Space>
                              <Tag color="blue">{event.id}</Tag>
                              <Text strong>{event.name}</Text>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <Text type="secondary">{event.description}</Text>
                              <div style={{ marginTop: 8 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Payload:</Text>
                                <pre style={{ 
                                  background: '#f5f5f5', 
                                  padding: 8, 
                                  borderRadius: 4,
                                  fontSize: 11,
                                  margin: '4px 0'
                                }}>
                                  {JSON.stringify(event.payload, null, 2)}
                                </pre>
                              </div>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Panel>
              ))}
            </Collapse>
          </TabPane>

          <TabPane tab="Dokümantasyon" key="docs">
            <Alert
              message="Webhook Entegrasyonu"
              description="Webhook'ları sisteminize entegre etmek için aşağıdaki dokümantasyonu kullanabilirsiniz."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Collapse defaultActiveKey={['security']}>
              <Panel header="Güvenlik" key="security">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Paragraph>
                    <Text strong>Webhook Secret Doğrulama</Text>
                  </Paragraph>
                  <Paragraph>
                    Her webhook isteği, güvenlik için bir HMAC-SHA256 imzası ile gönderilir. 
                    Bu imzayı doğrulamak için webhook secret'ınızı kullanmalısınız.
                  </Paragraph>
                  <SyntaxHighlighter language="javascript" style={docco}>
{`const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return hash === signature;
}`}
                  </SyntaxHighlighter>
                </Space>
              </Panel>

              <Panel header="Retry Policy" key="retry">
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Maksimum Deneme">
                    3-5 deneme (yapılandırılabilir)
                  </Descriptions.Item>
                  <Descriptions.Item label="Bekleme Süresi">
                    İlk deneme: 1 saniye, sonraki denemeler exponential backoff
                  </Descriptions.Item>
                  <Descriptions.Item label="Timeout">
                    30 saniye
                  </Descriptions.Item>
                  <Descriptions.Item label="Başarılı Yanıt">
                    HTTP 200-299 arası status kodları
                  </Descriptions.Item>
                </Descriptions>
              </Panel>

              <Panel header="Headers" key="headers">
                <Table
                  dataSource={[
                    { header: 'X-Webhook-ID', description: 'Webhook ID' },
                    { header: 'X-Webhook-Event', description: 'Olay türü' },
                    { header: 'X-Webhook-Signature', description: 'HMAC-SHA256 imza' },
                    { header: 'X-Webhook-Timestamp', description: 'Unix timestamp' },
                    { header: 'Content-Type', description: 'application/json' }
                  ]}
                  columns={[
                    { title: 'Header', dataIndex: 'header', key: 'header' },
                    { title: 'Açıklama', dataIndex: 'description', key: 'description' }
                  ]}
                  pagination={false}
                  size="small"
                />
              </Panel>
            </Collapse>
          </TabPane>
        </Tabs>
      </Card>

      {/* Webhook Modal */}
      <Modal
        title={selectedWebhook ? 'Webhook Düzenle' : 'Yeni Webhook'}
        open={webhookModalVisible}
        onCancel={() => setWebhookModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveWebhook}
        >
          <Form.Item
            name="name"
            label="Webhook Adı"
            rules={[{ required: true, message: 'Webhook adı gerekli' }]}
          >
            <Input placeholder="Slack Notifications" />
          </Form.Item>

          <Form.Item
            name="url"
            label="Webhook URL"
            rules={[
              { required: true, message: 'URL gerekli' },
              { type: 'url', message: 'Geçerli bir URL giriniz' }
            ]}
          >
            <Input prefix={<LinkOutlined />} placeholder="https://example.com/webhook" />
          </Form.Item>

          <Form.Item
            name="events"
            label="Olaylar"
            rules={[{ required: true, message: 'En az bir olay seçmelisiniz' }]}
          >
            <Select mode="multiple" placeholder="Olay seçin">
              {availableEvents.map(event => (
                <Option key={event.id} value={event.id}>
                  <Space>
                    <Tag color={getEventCategoryColor(event.category)}>
                      {event.category}
                    </Tag>
                    {event.name}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Retry Policy">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name={['retryPolicy', 'maxRetries']}
                  initialValue={3}
                  noStyle
                >
                  <InputNumber 
                    min={0} 
                    max={10} 
                    placeholder="Max Retry"
                    style={{ width: '100%' }}
                    addonBefore="Max"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={['retryPolicy', 'retryDelay']}
                  initialValue={1000}
                  noStyle
                >
                  <InputNumber 
                    min={100} 
                    max={60000} 
                    placeholder="Delay (ms)"
                    style={{ width: '100%' }}
                    addonBefore="Delay"
                    addonAfter="ms"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={['retryPolicy', 'backoffMultiplier']}
                  initialValue={2}
                  noStyle
                >
                  <InputNumber 
                    min={1} 
                    max={10} 
                    step={0.5}
                    placeholder="Multiplier"
                    style={{ width: '100%' }}
                    addonBefore="x"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item label="Custom Headers (Opsiyonel)">
            <Form.List name="headers">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={16} style={{ marginBottom: 8 }}>
                      <Col span={10}>
                        <Form.Item
                          {...restField}
                          name={[name, 'key']}
                          noStyle
                        >
                          <Input placeholder="Header adı" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'value']}
                          noStyle
                        >
                          <Input placeholder="Header değeri" />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button 
                          icon={<DeleteOutlined />} 
                          onClick={() => remove(name)}
                          danger
                        />
                      </Col>
                    </Row>
                  ))}
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                  >
                    Header Ekle
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>

      {/* Test Modal */}
      <Modal
        title="Webhook Test"
        open={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        onOk={() => testForm.submit()}
        width={600}
      >
        <Alert
          message="Test Webhook"
          description="Seçili webhook'a test verisi gönderilecek."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form
          form={testForm}
          layout="vertical"
          onFinish={handleTestWebhook}
        >
          <Form.Item
            name="event"
            label="Olay Türü"
            rules={[{ required: true, message: 'Olay seçimi gerekli' }]}
          >
            <Select placeholder="Test olayı seçin">
              {selectedWebhook?.events.map(event => (
                <Option key={event} value={event}>
                  {availableEvents.find(e => e.id === event)?.name || event}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="payload"
            label="Test Payload (JSON)"
            initialValue={JSON.stringify({
              test: true,
              timestamp: new Date().toISOString()
            }, null, 2)}
          >
            <Input.TextArea 
              rows={10}
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Secret Modal */}
      <Modal
        title="Webhook Secret"
        open={secretModalVisible}
        onCancel={() => setSecretModalVisible(false)}
        width={600}
        footer={[
          <Button key="regenerate" onClick={() => handleRegenerateSecret(selectedWebhook?.id!)}>
            Secret Yenile
          </Button>,
          <Button key="close" type="primary" onClick={() => setSecretModalVisible(false)}>
            Kapat
          </Button>
        ]}
      >
        {selectedWebhook && (
          <>
            <Alert
              message="Güvenlik Uyarısı"
              description="Webhook secret'ı güvenli bir şekilde saklayın ve kimseyle paylaşmayın."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Webhook Adı">
                {selectedWebhook.name}
              </Descriptions.Item>
              <Descriptions.Item label="Secret">
                <Space>
                  <Text code copyable>{selectedWebhook.secret}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Oluşturulma">
                {dayjs(selectedWebhook.createdAt).format('DD.MM.YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>

      {/* Log Details Modal */}
      <Modal
        title="Log Detayları"
        open={logModalVisible}
        onCancel={() => setLogModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setLogModalVisible(false)}>
            Kapat
          </Button>
        ]}
      >
        {selectedLog && (
          <Tabs defaultActiveKey="request">
            <TabPane tab="Request" key="request">
              <Descriptions bordered column={1} style={{ marginBottom: 16 }}>
                <Descriptions.Item label="Zaman">
                  {dayjs(selectedLog.timestamp).format('DD.MM.YYYY HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="Olay">
                  {selectedLog.event}
                </Descriptions.Item>
                <Descriptions.Item label="Durum">
                  {getStatusTag(selectedLog.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Süre">
                  {selectedLog.duration}ms
                </Descriptions.Item>
              </Descriptions>

              <Title level={5}>Headers</Title>
              <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                {JSON.stringify(selectedLog.request.headers, null, 2)}
              </pre>

              <Title level={5} style={{ marginTop: 16 }}>Body</Title>
              <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                {JSON.stringify(selectedLog.request.body, null, 2)}
              </pre>
            </TabPane>

            <TabPane tab="Response" key="response">
              {selectedLog.response ? (
                <>
                  <Descriptions bordered column={1} style={{ marginBottom: 16 }}>
                    <Descriptions.Item label="HTTP Status">
                      {selectedLog.response.statusCode}
                    </Descriptions.Item>
                  </Descriptions>

                  <Title level={5}>Body</Title>
                  <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                    {JSON.stringify(selectedLog.response.body, null, 2)}
                  </pre>
                </>
              ) : selectedLog.error ? (
                <Alert
                  message="Hata"
                  description={selectedLog.error}
                  type="error"
                  showIcon
                />
              ) : (
                <Empty description="Yanıt alınamadı" />
              )}
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default TenantWebhooks;