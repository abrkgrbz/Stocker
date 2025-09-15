import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Switch, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Checkbox, 
  Radio, 
  TimePicker, 
  Badge, 
  Alert, 
  Tabs, 
  List, 
  Avatar, 
  Divider, 
  Tooltip, 
  Popconfirm, 
  Dropdown, 
  Menu, 
  Empty, 
  Statistic, 
  Progress, 
  message, 
  notification as antNotification 
} from 'antd';
import {
  BellOutlined,
  MailOutlined,
  MobileOutlined,
  ChromeOutlined,
  WechatOutlined,
  SlackOutlined,
  TeamOutlined,
  UserOutlined,
  SendOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
  FilterOutlined,
  ExportOutlined,
  ReloadOutlined,
  ApiOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SoundOutlined,
  MoreOutlined,
  CopyOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  GlobalOutlined,
  NotificationOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import TextArea from 'antd/es/input/TextArea';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'webhook' | 'slack' | 'teams';
  enabled: boolean;
  config: any;
  createdAt: string;
  lastUsed?: string;
  successRate: number;
}

interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  channels: string[];
  subject?: string;
  content: string;
  variables: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  conditions: any[];
  channels: string[];
  template: string;
  enabled: boolean;
  schedule?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  lastTriggered?: string;
  triggerCount: number;
}

interface NotificationHistory {
  id: string;
  type: string;
  channel: string;
  recipient: string;
  subject: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  sentAt: string;
  deliveredAt?: string;
  error?: string;
  template: string;
  priority: string;
}

interface NotificationPreference {
  userId: string;
  userName: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  categories: {
    security: boolean;
    billing: boolean;
    system: boolean;
    marketing: boolean;
    updates: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const TenantNotifications: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('channels');
  const [channelModalVisible, setChannelModalVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [channelForm] = Form.useForm();
  const [templateForm] = Form.useForm();
  const [ruleForm] = Form.useForm();
  const [testForm] = Form.useForm();

  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: '1',
      name: 'Ana E-posta Kanalı',
      type: 'email',
      enabled: true,
      config: {
        smtp: 'smtp.gmail.com',
        port: 587,
        from: 'noreply@example.com'
      },
      createdAt: '2024-01-01',
      lastUsed: '2024-01-15',
      successRate: 98.5
    },
    {
      id: '2',
      name: 'SMS Servisi',
      type: 'sms',
      enabled: true,
      config: {
        provider: 'Twilio',
        from: '+901234567890'
      },
      createdAt: '2024-01-05',
      lastUsed: '2024-01-14',
      successRate: 95.2
    },
    {
      id: '3',
      name: 'Push Bildirimleri',
      type: 'push',
      enabled: true,
      config: {
        fcmKey: '***',
        apnsKey: '***'
      },
      createdAt: '2024-01-10',
      lastUsed: '2024-01-15',
      successRate: 92.8
    },
    {
      id: '4',
      name: 'Slack Entegrasyonu',
      type: 'slack',
      enabled: false,
      config: {
        webhookUrl: 'https://hooks.slack.com/***',
        channel: '#notifications'
      },
      createdAt: '2024-01-12',
      successRate: 100
    }
  ]);

  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Hoş Geldiniz E-postası',
      description: 'Yeni kullanıcılar için hoş geldiniz mesajı',
      category: 'Onboarding',
      channels: ['email'],
      subject: 'Stocker\'a Hoş Geldiniz {{userName}}!',
      content: 'Merhaba {{userName}},\n\nStocker ailesine hoş geldiniz...',
      variables: ['userName', 'companyName', 'activationLink'],
      active: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-10',
      usageCount: 234
    },
    {
      id: '2',
      name: 'Şifre Sıfırlama',
      description: 'Şifre sıfırlama talebi bildirimi',
      category: 'Güvenlik',
      channels: ['email', 'sms'],
      subject: 'Şifre Sıfırlama Talebi',
      content: 'Şifrenizi sıfırlamak için: {{resetLink}}',
      variables: ['userName', 'resetLink', 'expiryTime'],
      active: true,
      createdAt: '2024-01-02',
      updatedAt: '2024-01-12',
      usageCount: 156
    },
    {
      id: '3',
      name: 'Fatura Hatırlatması',
      description: 'Aylık fatura hatırlatma bildirimi',
      category: 'Faturalama',
      channels: ['email', 'push'],
      subject: 'Faturanız Hazır',
      content: '{{month}} ayı faturanız hazır. Tutar: {{amount}}',
      variables: ['month', 'amount', 'dueDate', 'invoiceLink'],
      active: true,
      createdAt: '2024-01-03',
      updatedAt: '2024-01-14',
      usageCount: 412
    }
  ]);

  const [rules, setRules] = useState<NotificationRule[]>([
    {
      id: '1',
      name: 'Yeni Kullanıcı Kaydı',
      description: 'Yeni kullanıcı kaydolduğunda bildirim gönder',
      trigger: 'user.created',
      conditions: [],
      channels: ['email'],
      template: '1',
      enabled: true,
      priority: 'normal',
      lastTriggered: '2024-01-15 14:30',
      triggerCount: 234
    },
    {
      id: '2',
      name: 'Başarısız Giriş Denemesi',
      description: '3 başarısız giriş denemesinde güvenlik uyarısı',
      trigger: 'auth.failed',
      conditions: [{ field: 'attempts', operator: '>=', value: 3 }],
      channels: ['email', 'sms'],
      template: '2',
      enabled: true,
      priority: 'high',
      lastTriggered: '2024-01-15 10:15',
      triggerCount: 45
    },
    {
      id: '3',
      name: 'Aylık Fatura',
      description: 'Her ayın 1\'inde fatura bildirimi',
      trigger: 'schedule',
      conditions: [],
      channels: ['email', 'push'],
      template: '3',
      enabled: true,
      schedule: '0 9 1 * *',
      priority: 'normal',
      lastTriggered: '2024-01-01 09:00',
      triggerCount: 412
    }
  ]);

  const [history, setHistory] = useState<NotificationHistory[]>([
    {
      id: '1',
      type: 'email',
      channel: 'Ana E-posta Kanalı',
      recipient: 'user@example.com',
      subject: 'Stocker\'a Hoş Geldiniz!',
      status: 'delivered',
      sentAt: '2024-01-15 14:30:00',
      deliveredAt: '2024-01-15 14:30:15',
      template: 'Hoş Geldiniz E-postası',
      priority: 'normal'
    },
    {
      id: '2',
      type: 'sms',
      channel: 'SMS Servisi',
      recipient: '+901234567890',
      subject: 'Güvenlik Uyarısı',
      status: 'sent',
      sentAt: '2024-01-15 13:45:00',
      template: 'Şifre Sıfırlama',
      priority: 'high'
    },
    {
      id: '3',
      type: 'push',
      channel: 'Push Bildirimleri',
      recipient: 'device_token_123',
      subject: 'Yeni Mesaj',
      status: 'failed',
      sentAt: '2024-01-15 12:00:00',
      error: 'Invalid device token',
      template: 'Genel Bildirim',
      priority: 'low'
    }
  ]);

  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      userId: '1',
      userName: 'Ahmet Yılmaz',
      email: true,
      sms: true,
      push: false,
      inApp: true,
      categories: {
        security: true,
        billing: true,
        system: true,
        marketing: false,
        updates: true
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      }
    },
    {
      userId: '2',
      userName: 'Ayşe Demir',
      email: true,
      sms: false,
      push: true,
      inApp: true,
      categories: {
        security: true,
        billing: true,
        system: true,
        marketing: true,
        updates: true
      }
    }
  ]);

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return <MailOutlined />;
      case 'sms': return <MobileOutlined />;
      case 'push': return <BellOutlined />;
      case 'webhook': return <ApiOutlined />;
      case 'slack': return <SlackOutlined />;
      case 'teams': return <TeamOutlined />;
      default: return <NotificationOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'blue';
      case 'delivered': return 'green';
      case 'failed': return 'red';
      case 'pending': return 'orange';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'normal': return 'blue';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const handleChannelToggle = (channelId: string, enabled: boolean) => {
    setChannels(prev => prev.map(ch => 
      ch.id === channelId ? { ...ch, enabled } : ch
    ));
    message.success(`Kanal ${enabled ? 'aktif edildi' : 'devre dışı bırakıldı'}`);
  };

  const handleTestNotification = () => {
    testForm.validateFields().then(values => {
      message.success('Test bildirimi gönderildi');
      setTestModalVisible(false);
      testForm.resetFields();
    });
  };

  const handleCreateChannel = () => {
    channelForm.validateFields().then(values => {
      const newChannel: NotificationChannel = {
        id: Date.now().toString(),
        ...values,
        enabled: true,
        createdAt: dayjs().format('YYYY-MM-DD'),
        successRate: 0
      };
      setChannels([...channels, newChannel]);
      message.success('Kanal başarıyla eklendi');
      setChannelModalVisible(false);
      channelForm.resetFields();
    });
  };

  const handleCreateTemplate = () => {
    templateForm.validateFields().then(values => {
      const newTemplate: NotificationTemplate = {
        id: Date.now().toString(),
        ...values,
        active: true,
        createdAt: dayjs().format('YYYY-MM-DD'),
        updatedAt: dayjs().format('YYYY-MM-DD'),
        usageCount: 0
      };
      setTemplates([...templates, newTemplate]);
      message.success('Şablon başarıyla oluşturuldu');
      setTemplateModalVisible(false);
      templateForm.resetFields();
    });
  };

  const handleCreateRule = () => {
    ruleForm.validateFields().then(values => {
      const newRule: NotificationRule = {
        id: Date.now().toString(),
        ...values,
        enabled: true,
        triggerCount: 0
      };
      setRules([...rules, newRule]);
      message.success('Kural başarıyla oluşturuldu');
      setRuleModalVisible(false);
      ruleForm.resetFields();
    });
  };

  const channelColumns = [
    {
      title: 'Kanal',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: NotificationChannel) => (
        <Space>
          {getChannelIcon(record.type)}
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue">{type.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: NotificationChannel) => (
        <Switch
          checked={enabled}
          onChange={(checked) => handleChannelToggle(record.id, checked)}
          checkedChildren="Aktif"
          unCheckedChildren="Pasif"
        />
      )
    },
    {
      title: 'Başarı Oranı',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate: number) => (
        <Progress 
          percent={rate} 
          size="small" 
          status={rate < 90 ? 'exception' : 'success'}
        />
      )
    },
    {
      title: 'Son Kullanım',
      dataIndex: 'lastUsed',
      key: 'lastUsed',
      render: (date?: string) => date ? dayjs(date).fromNow() : '-'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record: NotificationChannel) => (
        <Space>
          <Button size="small" icon={<EditOutlined />}>Düzenle</Button>
          <Button size="small" icon={<SendOutlined />} onClick={() => setTestModalVisible(true)}>
            Test
          </Button>
          <Popconfirm
            title="Bu kanalı silmek istediğinize emin misiniz?"
            onConfirm={() => {
              setChannels(channels.filter(ch => ch.id !== record.id));
              message.success('Kanal silindi');
            }}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>Sil</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const templateColumns = [
    {
      title: 'Şablon',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: NotificationTemplate) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
        </Space>
      )
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag>{category}</Tag>
    },
    {
      title: 'Kanallar',
      dataIndex: 'channels',
      key: 'channels',
      render: (channels: string[]) => (
        <Space>
          {channels.map(ch => (
            <Tag key={ch} icon={getChannelIcon(ch)}>
              {ch}
            </Tag>
          ))}
        </Space>
      )
    },
    {
      title: 'Kullanım',
      dataIndex: 'usageCount',
      key: 'usageCount',
      render: (count: number) => count.toLocaleString('tr-TR')
    },
    {
      title: 'Durum',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Badge status={active ? 'success' : 'default'} text={active ? 'Aktif' : 'Pasif'} />
      )
    },
    {
      title: 'Güncelleme',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY')
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record: NotificationTemplate) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="edit" icon={<EditOutlined />}>
                Düzenle
              </Menu.Item>
              <Menu.Item key="duplicate" icon={<CopyOutlined />}>
                Kopyala
              </Menu.Item>
              <Menu.Item key="preview" icon={<FileTextOutlined />}>
                Önizle
              </Menu.Item>
              <Menu.Item key="test" icon={<SendOutlined />}>
                Test Gönder
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                Sil
              </Menu.Item>
            </Menu>
          }
        >
          <Button size="small" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  const ruleColumns = [
    {
      title: 'Kural',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: NotificationRule) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
        </Space>
      )
    },
    {
      title: 'Tetikleyici',
      dataIndex: 'trigger',
      key: 'trigger',
      render: (trigger: string) => (
        <Tag icon={<ThunderboltOutlined />} color="purple">
          {trigger}
        </Tag>
      )
    },
    {
      title: 'Öncelik',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Switch
          checked={enabled}
          checkedChildren="Aktif"
          unCheckedChildren="Pasif"
        />
      )
    },
    {
      title: 'Tetiklenme',
      dataIndex: 'triggerCount',
      key: 'triggerCount',
      render: (count: number, record: NotificationRule) => (
        <Space direction="vertical" size={0}>
          <Text>{count} kez</Text>
          {record.lastTriggered && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Son: {dayjs(record.lastTriggered).fromNow()}
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record: NotificationRule) => (
        <Space>
          <Button size="small" icon={<EditOutlined />}>Düzenle</Button>
          <Button size="small" icon={<PlayCircleOutlined />}>Çalıştır</Button>
          <Popconfirm
            title="Bu kuralı silmek istediğinize emin misiniz?"
            onConfirm={() => {
              setRules(rules.filter(r => r.id !== record.id));
              message.success('Kural silindi');
            }}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>Sil</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const historyColumns = [
    {
      title: 'Zaman',
      dataIndex: 'sentAt',
      key: 'sentAt',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm:ss')
    },
    {
      title: 'Kanal',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag icon={getChannelIcon(type)}>{type.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Alıcı',
      dataIndex: 'recipient',
      key: 'recipient'
    },
    {
      title: 'Konu',
      dataIndex: 'subject',
      key: 'subject'
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'sent' ? 'Gönderildi' :
           status === 'delivered' ? 'İletildi' :
           status === 'failed' ? 'Başarısız' : 'Bekliyor'}
        </Tag>
      )
    },
    {
      title: 'Şablon',
      dataIndex: 'template',
      key: 'template'
    },
    {
      title: 'Öncelik',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record: NotificationHistory) => (
        <Space>
          <Tooltip title="Detaylar">
            <Button size="small" icon={<InfoCircleOutlined />} />
          </Tooltip>
          {record.status === 'failed' && (
            <Tooltip title="Yeniden Gönder">
              <Button size="small" icon={<ReloadOutlined />} />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={4} style={{ margin: 0 }}>
              <BellOutlined /> Bildirim Yönetimi
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />}>Yenile</Button>
              <Button icon={<ExportOutlined />}>Dışa Aktar</Button>
              <Button type="primary" icon={<SendOutlined />} onClick={() => setTestModalVisible(true)}>
                Test Bildirimi
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Bugün Gönderilen"
              value={1234}
              prefix={<SendOutlined />}
              suffix={<Tag color="green">+12%</Tag>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Başarı Oranı"
              value={96.5}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Aktif Kural"
              value={rules.filter(r => r.enabled).length}
              suffix={`/ ${rules.length}`}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Bekleyen"
              value={23}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Kanallar" key="channels">
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setChannelModalVisible(true)}>
                Yeni Kanal
              </Button>
              <Button icon={<SettingOutlined />}>Varsayılan Ayarlar</Button>
            </Space>

            <Table
              columns={channelColumns}
              dataSource={channels}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab="Şablonlar" key="templates">
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setTemplateModalVisible(true)}>
                Yeni Şablon
              </Button>
              <Select placeholder="Kategori" style={{ width: 150 }}>
                <Option value="all">Tümü</Option>
                <Option value="onboarding">Onboarding</Option>
                <Option value="security">Güvenlik</Option>
                <Option value="billing">Faturalama</Option>
                <Option value="system">Sistem</Option>
              </Select>
              <Input.Search placeholder="Şablon ara..." style={{ width: 250 }} />
            </Space>

            <Table
              columns={templateColumns}
              dataSource={templates}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Kurallar" key="rules">
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setRuleModalVisible(true)}>
                Yeni Kural
              </Button>
              <Button icon={<CalendarOutlined />}>Zamanlama</Button>
            </Space>

            <Table
              columns={ruleColumns}
              dataSource={rules}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab="Geçmiş" key="history">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Select placeholder="Durum" style={{ width: '100%' }}>
                  <Option value="all">Tümü</Option>
                  <Option value="sent">Gönderildi</Option>
                  <Option value="delivered">İletildi</Option>
                  <Option value="failed">Başarısız</Option>
                  <Option value="pending">Bekliyor</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Select placeholder="Kanal" style={{ width: '100%' }}>
                  <Option value="all">Tümü</Option>
                  <Option value="email">E-posta</Option>
                  <Option value="sms">SMS</Option>
                  <Option value="push">Push</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Input.Search placeholder="Alıcı ara..." />
              </Col>
              <Col span={6}>
                <Button icon={<FilterOutlined />}>Gelişmiş Filtreler</Button>
              </Col>
            </Row>

            <Table
              columns={historyColumns}
              dataSource={history}
              rowKey="id"
              pagination={{ pageSize: 20 }}
            />
          </TabPane>

          <TabPane tab="Tercihler" key="preferences">
            <Alert
              message="Kullanıcı Bildirimi Tercihleri"
              description="Kullanıcıların bildirim tercihlerini yönetin ve toplu güncelleme yapın."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <List
              dataSource={preferences}
              renderItem={pref => (
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16} align="middle">
                    <Col span={4}>
                      <Space>
                        <Avatar icon={<UserOutlined />} />
                        <Text strong>{pref.userName}</Text>
                      </Space>
                    </Col>
                    <Col span={8}>
                      <Space>
                        <Text>Kanallar:</Text>
                        <Checkbox checked={pref.email}>E-posta</Checkbox>
                        <Checkbox checked={pref.sms}>SMS</Checkbox>
                        <Checkbox checked={pref.push}>Push</Checkbox>
                        <Checkbox checked={pref.inApp}>Uygulama İçi</Checkbox>
                      </Space>
                    </Col>
                    <Col span={8}>
                      <Space>
                        <Text>Kategoriler:</Text>
                        <Tag color={pref.categories.security ? 'green' : 'default'}>Güvenlik</Tag>
                        <Tag color={pref.categories.billing ? 'green' : 'default'}>Faturalama</Tag>
                        <Tag color={pref.categories.system ? 'green' : 'default'}>Sistem</Tag>
                        <Tag color={pref.categories.marketing ? 'green' : 'default'}>Pazarlama</Tag>
                      </Space>
                    </Col>
                    <Col span={4}>
                      {pref.quietHours?.enabled && (
                        <Space>
                          <ClockCircleOutlined />
                          <Text type="secondary">
                            Sessiz: {pref.quietHours.start} - {pref.quietHours.end}
                          </Text>
                        </Space>
                      )}
                    </Col>
                  </Row>
                </Card>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Channel Modal */}
      <Modal
        title="Yeni Bildirim Kanalı"
        visible={channelModalVisible}
        onOk={handleCreateChannel}
        onCancel={() => setChannelModalVisible(false)}
        width={600}
      >
        <Form form={channelForm} layout="vertical">
          <Form.Item
            name="name"
            label="Kanal Adı"
            rules={[{ required: true, message: 'Kanal adı gereklidir' }]}
          >
            <Input placeholder="Örn: Ana E-posta Kanalı" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Kanal Tipi"
            rules={[{ required: true, message: 'Kanal tipi seçiniz' }]}
          >
            <Select placeholder="Tip seçiniz">
              <Option value="email">E-posta</Option>
              <Option value="sms">SMS</Option>
              <Option value="push">Push Bildirimi</Option>
              <Option value="webhook">Webhook</Option>
              <Option value="slack">Slack</Option>
              <Option value="teams">Microsoft Teams</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="config"
            label="Konfigürasyon"
          >
            <TextArea 
              rows={4} 
              placeholder="JSON formatında konfigürasyon bilgileri"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Template Modal */}
      <Modal
        title="Yeni Bildirim Şablonu"
        visible={templateModalVisible}
        onOk={handleCreateTemplate}
        onCancel={() => setTemplateModalVisible(false)}
        width={700}
      >
        <Form form={templateForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Şablon Adı"
                rules={[{ required: true, message: 'Şablon adı gereklidir' }]}
              >
                <Input placeholder="Örn: Hoş Geldiniz E-postası" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Kategori"
                rules={[{ required: true, message: 'Kategori seçiniz' }]}
              >
                <Select placeholder="Kategori seçiniz">
                  <Option value="onboarding">Onboarding</Option>
                  <Option value="security">Güvenlik</Option>
                  <Option value="billing">Faturalama</Option>
                  <Option value="system">Sistem</Option>
                  <Option value="marketing">Pazarlama</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="Açıklama"
          >
            <Input placeholder="Şablon açıklaması" />
          </Form.Item>
          <Form.Item
            name="channels"
            label="Kanallar"
            rules={[{ required: true, message: 'En az bir kanal seçiniz' }]}
          >
            <Checkbox.Group>
              <Checkbox value="email">E-posta</Checkbox>
              <Checkbox value="sms">SMS</Checkbox>
              <Checkbox value="push">Push</Checkbox>
              <Checkbox value="slack">Slack</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item
            name="subject"
            label="Konu"
          >
            <Input placeholder="Örn: {{companyName}} - Hoş Geldiniz!" />
          </Form.Item>
          <Form.Item
            name="content"
            label="İçerik"
            rules={[{ required: true, message: 'İçerik gereklidir' }]}
          >
            <TextArea 
              rows={6} 
              placeholder="Merhaba {{userName}}, ..."
            />
          </Form.Item>
          <Form.Item
            name="variables"
            label="Değişkenler"
          >
            <Select mode="tags" placeholder="Değişken ekleyin (örn: userName, companyName)">
              <Option value="userName">userName</Option>
              <Option value="companyName">companyName</Option>
              <Option value="email">email</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Rule Modal */}
      <Modal
        title="Yeni Bildirim Kuralı"
        visible={ruleModalVisible}
        onOk={handleCreateRule}
        onCancel={() => setRuleModalVisible(false)}
        width={600}
      >
        <Form form={ruleForm} layout="vertical">
          <Form.Item
            name="name"
            label="Kural Adı"
            rules={[{ required: true, message: 'Kural adı gereklidir' }]}
          >
            <Input placeholder="Örn: Yeni Kullanıcı Bildirimi" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Açıklama"
          >
            <Input placeholder="Kural açıklaması" />
          </Form.Item>
          <Form.Item
            name="trigger"
            label="Tetikleyici"
            rules={[{ required: true, message: 'Tetikleyici seçiniz' }]}
          >
            <Select placeholder="Tetikleyici seçiniz">
              <Option value="user.created">Kullanıcı Oluşturuldu</Option>
              <Option value="user.updated">Kullanıcı Güncellendi</Option>
              <Option value="auth.failed">Başarısız Giriş</Option>
              <Option value="invoice.created">Fatura Oluşturuldu</Option>
              <Option value="schedule">Zamanlanmış</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="channels"
            label="Bildirim Kanalları"
            rules={[{ required: true, message: 'En az bir kanal seçiniz' }]}
          >
            <Select mode="multiple" placeholder="Kanal seçiniz">
              {channels.map(ch => (
                <Option key={ch.id} value={ch.id}>{ch.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="template"
            label="Şablon"
            rules={[{ required: true, message: 'Şablon seçiniz' }]}
          >
            <Select placeholder="Şablon seçiniz">
              {templates.map(t => (
                <Option key={t.id} value={t.id}>{t.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="priority"
            label="Öncelik"
            rules={[{ required: true, message: 'Öncelik seçiniz' }]}
          >
            <Radio.Group>
              <Radio value="low">Düşük</Radio>
              <Radio value="normal">Normal</Radio>
              <Radio value="high">Yüksek</Radio>
              <Radio value="urgent">Acil</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* Test Modal */}
      <Modal
        title="Test Bildirimi Gönder"
        visible={testModalVisible}
        onOk={handleTestNotification}
        onCancel={() => setTestModalVisible(false)}
        width={500}
      >
        <Form form={testForm} layout="vertical">
          <Form.Item
            name="channel"
            label="Kanal"
            rules={[{ required: true, message: 'Kanal seçiniz' }]}
          >
            <Select placeholder="Kanal seçiniz">
              {channels.filter(ch => ch.enabled).map(ch => (
                <Option key={ch.id} value={ch.id}>{ch.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="recipient"
            label="Alıcı"
            rules={[{ required: true, message: 'Alıcı gereklidir' }]}
          >
            <Input placeholder="E-posta adresi veya telefon numarası" />
          </Form.Item>
          <Form.Item
            name="template"
            label="Şablon (Opsiyonel)"
          >
            <Select placeholder="Şablon seçiniz" allowClear>
              {templates.map(t => (
                <Option key={t.id} value={t.id}>{t.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="message"
            label="Mesaj"
            rules={[{ required: true, message: 'Mesaj gereklidir' }]}
          >
            <TextArea rows={4} placeholder="Test mesajı içeriği" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TenantNotifications;