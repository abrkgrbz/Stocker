import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Tag, 
  Space, 
  Button, 
  Badge, 
  Typography, 
  Input, 
  Select, 
  Tabs, 
  List, 
  Avatar, 
  Timeline, 
  Modal, 
  Form, 
  Upload, 
  Rate, 
  Progress, 
  Statistic, 
  Alert, 
  Divider, 
  Tooltip, 
  Dropdown, 
  Menu, 
  Drawer, 
 
  Empty,
  Result,
  message, 
  notification 
} from 'antd';
import {
  QuestionCircleOutlined,
  CustomerServiceOutlined,
  MessageOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  SendOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  StarOutlined,
  StarFilled,
  LikeOutlined,
  DislikeOutlined,
  CommentOutlined,
  ShareAltOutlined,
  TagOutlined,
  FolderOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  BugOutlined,
  RocketOutlined,
  BulbOutlined,
  BookOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  DesktopOutlined,
  MobileOutlined,
  GlobalOutlined,
  SafetyOutlined,
  SettingOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  PrinterOutlined,
  MoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  RightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text, Paragraph, Link } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

interface Ticket {
  id: string;
  number: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'in-progress' | 'resolved' | 'closed';
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  tags: string[];
  attachments?: number;
  messages: number;
  satisfaction?: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  views: number;
  helpful: number;
  notHelpful: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string;
  type: 'article' | 'video' | 'guide' | 'tutorial';
  author: string;
  views: number;
  likes: number;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
}

interface SupportAgent {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  department: string;
  activeTickets: number;
  resolvedToday: number;
  avgResponseTime: string;
  satisfaction: number;
}

interface TicketMessage {
  id: string;
  ticketId: string;
  sender: string;
  senderType: 'customer' | 'agent' | 'system';
  message: string;
  attachments?: string[];
  timestamp: string;
}

const SupportPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tickets');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketModalVisible, setTicketModalVisible] = useState(false);
  const [ticketDetailVisible, setTicketDetailVisible] = useState(false);
  const [faqModalVisible, setFaqModalVisible] = useState(false);
  const [knowledgeModalVisible, setKnowledgeModalVisible] = useState(false);
  const [ticketForm] = Form.useForm();
  const [faqForm] = Form.useForm();
  const [knowledgeForm] = Form.useForm();
  const [replyForm] = Form.useForm();

  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: '1',
      number: 'TKT-2024-001',
      subject: 'Giriş yapamıyorum',
      description: 'Şifremi sıfırladım ama hala giriş yapamıyorum.',
      category: 'Teknik Destek',
      priority: 'high',
      status: 'open',
      createdBy: 'Ahmet Yılmaz',
      assignedTo: 'Destek Ekibi',
      createdAt: '2024-01-15 10:30',
      updatedAt: '2024-01-15 14:20',
      tags: ['login', 'authentication'],
      attachments: 2,
      messages: 3
    },
    {
      id: '2',
      number: 'TKT-2024-002',
      subject: 'Fatura hatası',
      description: 'Son faturamda yanlış tutar var.',
      category: 'Muhasebe',
      priority: 'medium',
      status: 'in-progress',
      createdBy: 'Ayşe Demir',
      assignedTo: 'Muhasebe Ekibi',
      createdAt: '2024-01-14 15:45',
      updatedAt: '2024-01-15 09:00',
      tags: ['billing', 'invoice'],
      messages: 5
    },
    {
      id: '3',
      number: 'TKT-2024-003',
      subject: 'Yeni özellik isteği',
      description: 'Raporlama modülüne Excel export özelliği eklenebilir mi?',
      category: 'Özellik İsteği',
      priority: 'low',
      status: 'pending',
      createdBy: 'Mehmet Öz',
      createdAt: '2024-01-13 11:00',
      updatedAt: '2024-01-13 11:00',
      tags: ['feature', 'export'],
      messages: 1
    },
    {
      id: '4',
      number: 'TKT-2024-004',
      subject: 'Sistem yavaşlığı',
      description: 'Son günlerde sistem çok yavaş çalışıyor.',
      category: 'Performans',
      priority: 'urgent',
      status: 'resolved',
      createdBy: 'Zeynep Kaya',
      assignedTo: 'DevOps Ekibi',
      createdAt: '2024-01-12 08:15',
      updatedAt: '2024-01-14 16:30',
      resolvedAt: '2024-01-14 16:30',
      tags: ['performance', 'slow'],
      messages: 8,
      satisfaction: 5
    }
  ]);

  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: '1',
      question: 'Şifremi nasıl sıfırlarım?',
      answer: 'Giriş sayfasındaki "Şifremi Unuttum" linkine tıklayarak e-posta adresinizi girin. Size gönderilen link ile şifrenizi sıfırlayabilirsiniz.',
      category: 'Hesap Yönetimi',
      views: 1234,
      helpful: 456,
      notHelpful: 12,
      tags: ['password', 'reset', 'account'],
      createdAt: '2023-12-01',
      updatedAt: '2024-01-10'
    },
    {
      id: '2',
      question: 'Fatura dönemim nasıl değiştirilir?',
      answer: 'Ayarlar > Faturalama bölümünden fatura dönem tercihlerinizi değiştirebilirsiniz.',
      category: 'Faturalama',
      views: 789,
      helpful: 234,
      notHelpful: 8,
      tags: ['billing', 'invoice', 'period'],
      createdAt: '2023-11-15',
      updatedAt: '2023-12-20'
    },
    {
      id: '3',
      question: 'API limitleri nelerdir?',
      answer: 'Standart planlarda dakikada 60, saatte 1000 istek limiti vardır. Enterprise planlarda özel limitler belirlenebilir.',
      category: 'API',
      views: 567,
      helpful: 189,
      notHelpful: 5,
      tags: ['api', 'limits', 'rate-limiting'],
      createdAt: '2023-10-20',
      updatedAt: '2024-01-05'
    }
  ]);

  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([
    {
      id: '1',
      title: 'Başlangıç Kılavuzu',
      content: 'Stocker platformunu kullanmaya başlamak için adım adım kılavuz...',
      category: 'Başlangıç',
      type: 'guide',
      author: 'Destek Ekibi',
      views: 5678,
      likes: 234,
      tags: ['getting-started', 'guide', 'tutorial'],
      publishedAt: '2023-09-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      title: 'API Entegrasyonu',
      content: 'REST API kullanarak sisteme entegrasyon nasıl yapılır...',
      category: 'Geliştirici',
      type: 'article',
      author: 'Teknik Ekip',
      views: 3456,
      likes: 156,
      tags: ['api', 'integration', 'development'],
      publishedAt: '2023-10-15',
      updatedAt: '2023-12-10'
    },
    {
      id: '3',
      title: 'Güvenlik En İyi Uygulamaları',
      content: 'Hesabınızı güvende tutmak için öneriler...',
      category: 'Güvenlik',
      type: 'article',
      author: 'Güvenlik Ekibi',
      views: 2345,
      likes: 189,
      tags: ['security', 'best-practices', '2fa'],
      publishedAt: '2023-11-20',
      updatedAt: '2024-01-08'
    }
  ]);

  const [agents, setAgents] = useState<SupportAgent[]>([
    {
      id: '1',
      name: 'Ali Veli',
      status: 'online',
      department: 'Teknik Destek',
      activeTickets: 5,
      resolvedToday: 12,
      avgResponseTime: '15 dk',
      satisfaction: 4.8
    },
    {
      id: '2',
      name: 'Fatma Yıldız',
      status: 'busy',
      department: 'Muhasebe',
      activeTickets: 3,
      resolvedToday: 8,
      avgResponseTime: '20 dk',
      satisfaction: 4.6
    },
    {
      id: '3',
      name: 'Mehmet Demir',
      status: 'online',
      department: 'Genel Destek',
      activeTickets: 7,
      resolvedToday: 15,
      avgResponseTime: '12 dk',
      satisfaction: 4.9
    },
    {
      id: '4',
      name: 'Zeynep Ak',
      status: 'away',
      department: 'Satış',
      activeTickets: 2,
      resolvedToday: 6,
      avgResponseTime: '25 dk',
      satisfaction: 4.5
    }
  ]);

  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([
    {
      id: '1',
      ticketId: '1',
      sender: 'Ahmet Yılmaz',
      senderType: 'customer',
      message: 'Şifremi sıfırladım ama hala giriş yapamıyorum. Sürekli hata veriyor.',
      timestamp: '2024-01-15 10:30'
    },
    {
      id: '2',
      ticketId: '1',
      sender: 'Destek Ekibi',
      senderType: 'agent',
      message: 'Merhaba, hesabınızı kontrol ediyorum. Lütfen kullandığınız e-posta adresini doğrulayın.',
      timestamp: '2024-01-15 10:45'
    },
    {
      id: '3',
      ticketId: '1',
      sender: 'Ahmet Yılmaz',
      senderType: 'customer',
      message: 'E-posta adresim: ahmet@example.com',
      timestamp: '2024-01-15 11:00'
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'blue';
      case 'pending': return 'orange';
      case 'in-progress': return 'processing';
      case 'resolved': return 'green';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#52c41a';
      case 'busy': return '#faad14';
      case 'away': return '#1890ff';
      case 'offline': return '#d9d9d9';
      default: return '#d9d9d9';
    }
  };

  const handleCreateTicket = () => {
    ticketForm.validateFields().then(values => {
      const newTicket: Ticket = {
        id: Date.now().toString(),
        number: `TKT-2024-${String(tickets.length + 1).padStart(3, '0')}`,
        ...values,
        status: 'open',
        createdBy: 'Current User',
        createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
        tags: values.tags || [],
        messages: 0
      };
      setTickets([newTicket, ...tickets]);
      message.success('Destek talebi oluşturuldu');
      setTicketModalVisible(false);
      ticketForm.resetFields();
    });
  };

  const handleReplyTicket = () => {
    replyForm.validateFields().then(values => {
      const newMessage: TicketMessage = {
        id: Date.now().toString(),
        ticketId: selectedTicket!.id,
        sender: 'Destek Ekibi',
        senderType: 'agent',
        message: values.message,
        timestamp: dayjs().format('YYYY-MM-DD HH:mm')
      };
      setTicketMessages([...ticketMessages, newMessage]);
      message.success('Yanıt gönderildi');
      replyForm.resetFields();
    });
  };

  const ticketColumns = [
    {
      title: 'Numara',
      dataIndex: 'number',
      key: 'number',
      render: (text: string) => <Link>{text}</Link>
    },
    {
      title: 'Konu',
      dataIndex: 'subject',
      key: 'subject',
      render: (text: string, record: Ticket) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.attachments && (
            <Space>
              <PaperClipOutlined />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.attachments} dosya
              </Text>
            </Space>
          )}
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
      title: 'Öncelik',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority === 'urgent' ? 'Acil' :
           priority === 'high' ? 'Yüksek' :
           priority === 'medium' ? 'Orta' : 'Düşük'}
        </Tag>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={getStatusColor(status) as any}
          text={status === 'open' ? 'Açık' :
               status === 'pending' ? 'Beklemede' :
               status === 'in-progress' ? 'İşlemde' :
               status === 'resolved' ? 'Çözüldü' : 'Kapalı'}
        />
      )
    },
    {
      title: 'Oluşturan',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (name: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{name}</Text>
        </Space>
      )
    },
    {
      title: 'Güncelleme',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => dayjs(date).fromNow()
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: Ticket) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedTicket(record);
              setTicketDetailVisible(true);
            }}
          >
            Detay
          </Button>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="assign" icon={<UserOutlined />}>
                  Ata
                </Menu.Item>
                <Menu.Item key="close" icon={<CloseCircleOutlined />}>
                  Kapat
                </Menu.Item>
                <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                  Sil
                </Menu.Item>
              </Menu>
            }
          >
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
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
              <CustomerServiceOutlined /> Destek Merkezi
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />}>Yenile</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setTicketModalVisible(true)}>
                Yeni Destek Talebi
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
              title="Açık Talepler"
              value={tickets.filter(t => t.status === 'open').length}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Bugün Çözülen"
              value={12}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Ort. Yanıt Süresi"
              value="18"
              suffix="dk"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Memnuniyet"
              value={4.7}
              suffix="/ 5"
              prefix={<StarFilled style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Destek Talepleri" key="tickets">
            <Space style={{ marginBottom: 16 }}>
              <Select placeholder="Durum" style={{ width: 120 }}>
                <Option value="all">Tümü</Option>
                <Option value="open">Açık</Option>
                <Option value="pending">Beklemede</Option>
                <Option value="in-progress">İşlemde</Option>
                <Option value="resolved">Çözüldü</Option>
                <Option value="closed">Kapalı</Option>
              </Select>
              <Select placeholder="Öncelik" style={{ width: 120 }}>
                <Option value="all">Tümü</Option>
                <Option value="urgent">Acil</Option>
                <Option value="high">Yüksek</Option>
                <Option value="medium">Orta</Option>
                <Option value="low">Düşük</Option>
              </Select>
              <Select placeholder="Kategori" style={{ width: 150 }}>
                <Option value="all">Tümü</Option>
                <Option value="technical">Teknik Destek</Option>
                <Option value="billing">Muhasebe</Option>
                <Option value="feature">Özellik İsteği</Option>
                <Option value="other">Diğer</Option>
              </Select>
              <Input.Search placeholder="Talep ara..." style={{ width: 250 }} />
            </Space>

            <Table
              columns={ticketColumns}
              dataSource={tickets}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Sık Sorulan Sorular" key="faq">
            <Space style={{ marginBottom: 16 }}>
              <Button icon={<PlusOutlined />} onClick={() => setFaqModalVisible(true)}>
                Yeni SSS Ekle
              </Button>
              <Input.Search placeholder="SSS ara..." style={{ width: 300 }} />
            </Space>

            <List
              dataSource={faqs}
              renderItem={faq => (
                <Card style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={20}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong style={{ fontSize: 16 }}>{faq.question}</Text>
                        <Paragraph>{faq.answer}</Paragraph>
                        <Space>
                          {faq.tags.map(tag => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </Space>
                        <Space>
                          <Text type="secondary">
                            <EyeOutlined /> {faq.views} görüntüleme
                          </Text>
                          <Button size="small" icon={<LikeOutlined />}>
                            Faydalı ({faq.helpful})
                          </Button>
                          <Button size="small" icon={<DislikeOutlined />}>
                            Faydasız ({faq.notHelpful})
                          </Button>
                        </Space>
                      </Space>
                    </Col>
                    <Col span={4} style={{ textAlign: 'right' }}>
                      <Space direction="vertical">
                        <Tag color="blue">{faq.category}</Tag>
                        <Button size="small" icon={<EditOutlined />}>Düzenle</Button>
                        <Button size="small" icon={<DeleteOutlined />} danger>Sil</Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              )}
            />
          </TabPane>

          <TabPane tab="Bilgi Bankası" key="knowledge">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={18}>
                <Input.Search
                  placeholder="Bilgi bankasında ara..."
                  size="large"
                  enterButton="Ara"
                />
              </Col>
              <Col span={6}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setKnowledgeModalVisible(true)} block>
                  Yeni Makale
                </Button>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              {knowledgeBase.map(article => (
                <Col span={8} key={article.id}>
                  <Card
                    hoverable
                    actions={[
                      <Space>
                        <EyeOutlined />
                        <Text>{article.views}</Text>
                      </Space>,
                      <Space>
                        <LikeOutlined />
                        <Text>{article.likes}</Text>
                      </Space>,
                      <ShareAltOutlined />
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Space>
                          {article.type === 'video' && <VideoCameraOutlined />}
                          {article.type === 'guide' && <BookOutlined />}
                          {article.type === 'article' && <FileTextOutlined />}
                          {article.type === 'tutorial' && <BulbOutlined />}
                          {article.title}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Paragraph ellipsis={{ rows: 2 }}>
                            {article.content}
                          </Paragraph>
                          <Space>
                            <Tag>{article.category}</Tag>
                            {article.tags.slice(0, 2).map(tag => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                          </Space>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {article.author} • {dayjs(article.publishedAt).format('DD.MM.YYYY')}
                          </Text>
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane tab="Destek Ekibi" key="agents">
            <Row gutter={[16, 16]}>
              {agents.map(agent => (
                <Col span={6} key={agent.id}>
                  <Card>
                    <Space direction="vertical" style={{ width: '100%' }} align="center">
                      <Badge
                        dot
                        offset={[-10, 10]}
                        style={{ backgroundColor: getAgentStatusColor(agent.status) }}
                      >
                        <Avatar size={64} icon={<UserOutlined />} />
                      </Badge>
                      <Text strong>{agent.name}</Text>
                      <Tag>{agent.department}</Tag>
                      <Text type="secondary">
                        {agent.status === 'online' ? 'Çevrimiçi' :
                         agent.status === 'busy' ? 'Meşgul' :
                         agent.status === 'away' ? 'Uzakta' : 'Çevrimdışı'}
                      </Text>
                      <Divider style={{ margin: '12px 0' }} />
                      <Row gutter={16} style={{ width: '100%' }}>
                        <Col span={12}>
                          <Statistic
                            title="Aktif"
                            value={agent.activeTickets}
                            valueStyle={{ fontSize: 16 }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Bugün"
                            value={agent.resolvedToday}
                            valueStyle={{ fontSize: 16 }}
                          />
                        </Col>
                      </Row>
                      <Text type="secondary">Ort. Yanıt: {agent.avgResponseTime}</Text>
                      <Rate disabled defaultValue={agent.satisfaction} />
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>

            <Divider />

            <Card title="Ekip Performansı" size="small">
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="Toplam Aktif Talep"
                    value={agents.reduce((sum, a) => sum + a.activeTickets, 0)}
                    prefix={<MessageOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Bugün Çözülen"
                    value={agents.reduce((sum, a) => sum + a.resolvedToday, 0)}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Ort. Yanıt Süresi"
                    value="17"
                    suffix="dk"
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Ort. Memnuniyet"
                    value={4.7}
                    suffix="/ 5"
                    prefix={<StarFilled />}
                  />
                </Col>
              </Row>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* Create Ticket Modal */}
      <Modal
        title="Yeni Destek Talebi"
        visible={ticketModalVisible}
        onOk={handleCreateTicket}
        onCancel={() => setTicketModalVisible(false)}
        width={700}
      >
        <Form form={ticketForm} layout="vertical">
          <Form.Item
            name="subject"
            label="Konu"
            rules={[{ required: true, message: 'Konu gereklidir' }]}
          >
            <Input placeholder="Sorununuzu kısaca özetleyin" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Açıklama"
            rules={[{ required: true, message: 'Açıklama gereklidir' }]}
          >
            <TextArea rows={4} placeholder="Sorununuzu detaylı olarak açıklayın" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Kategori"
                rules={[{ required: true, message: 'Kategori seçiniz' }]}
              >
                <Select placeholder="Kategori seçiniz">
                  <Option value="Teknik Destek">Teknik Destek</Option>
                  <Option value="Muhasebe">Muhasebe</Option>
                  <Option value="Özellik İsteği">Özellik İsteği</Option>
                  <Option value="Performans">Performans</Option>
                  <Option value="Diğer">Diğer</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Öncelik"
                rules={[{ required: true, message: 'Öncelik seçiniz' }]}
              >
                <Select placeholder="Öncelik seçiniz">
                  <Option value="low">Düşük</Option>
                  <Option value="medium">Orta</Option>
                  <Option value="high">Yüksek</Option>
                  <Option value="urgent">Acil</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="tags"
            label="Etiketler"
          >
            <Select mode="tags" placeholder="Etiket ekleyin" />
          </Form.Item>
          <Form.Item
            name="attachments"
            label="Ekler"
          >
            <Dragger>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Dosyaları buraya sürükleyin veya tıklayın</p>
              <p className="ant-upload-hint">Tek veya toplu dosya yükleme desteklenir</p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>

      {/* Ticket Detail Drawer */}
      <Drawer
        title={selectedTicket?.number}
        placement="right"
        width={720}
        visible={ticketDetailVisible}
        onClose={() => setTicketDetailVisible(false)}
      >
        {selectedTicket && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Konu:</Text>
                  <Title level={5}>{selectedTicket.subject}</Title>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      <Text type="secondary">Durum:</Text>
                      <Badge
                        status={getStatusColor(selectedTicket.status) as any}
                        text={selectedTicket.status}
                      />
                    </Space>
                    <Space>
                      <Text type="secondary">Öncelik:</Text>
                      <Tag color={getPriorityColor(selectedTicket.priority)}>
                        {selectedTicket.priority}
                      </Tag>
                    </Space>
                  </Space>
                </Col>
              </Row>
            </Card>

            <Card title="Mesajlar" size="small">
              <List
                dataSource={ticketMessages.filter(m => m.ticketId === selectedTicket.id)}
                renderItem={message => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={
                        <Space>
                          <Text strong>{message.sender}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs(message.timestamp).fromNow()}
                          </Text>
                        </Space>
                      }
                      description={<p>{message.message}</p>}
                    />
                  </List.Item>
                )}
              />
              <Divider />
              <Form form={replyForm} onFinish={handleReplyTicket}>
                <Form.Item
                  name="message"
                  rules={[{ required: true, message: 'Mesaj gereklidir' }]}
                >
                  <TextArea rows={4} placeholder="Yanıtınızı yazın..." />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                    Yanıt Gönder
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default SupportPage;