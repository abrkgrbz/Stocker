import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Badge,
  Tooltip,
  Alert,
  List,
  Descriptions,
  Drawer,
  Tabs,
  Timeline,
  Progress,
  Statistic,
  Divider,
  Radio,
  Checkbox,
  DatePicker,
  Popconfirm,
  Avatar,
  Empty,
} from 'antd';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  LinkOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  SendOutlined,
  HistoryOutlined,
  EyeOutlined,
  CopyOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  BugOutlined,
  FileTextOutlined,
  CodeOutlined,
  GlobalOutlined,
  SafetyOutlined,
  ApiOutlined,
  DatabaseOutlined,
  MailOutlined,
  ShoppingOutlined,
  UserOutlined,
  BellOutlined,
  WarningOutlined,
  SyncOutlined,
  FilterOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface Webhook {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive' | 'failed';
  events: string[];
  httpMethod: 'POST' | 'PUT' | 'PATCH';
  contentType: 'application/json' | 'application/xml' | 'application/x-www-form-urlencoded';
  secretKey?: string;
  timeout: number;
  retries: number;
  createdAt: string;
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
  description?: string;
  headers: Record<string, string>;
  isVerified: boolean;
}

interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failed' | 'pending' | 'retry';
  responseCode?: number;
  responseTime?: number;
  payload: Record<string, any>;
  response?: string;
  error?: string;
  timestamp: string;
  retryCount: number;
  nextRetry?: string;
}

const TenantWebhooks: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('webhooks');
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isLogDrawerVisible, setIsLogDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Mock data
  const mockWebhooks: Webhook[] = [
    {
      id: '1',
      name: 'Order Created',
      url: 'https://api.example.com/webhooks/order-created',
      status: 'active',
      events: ['order.created', 'order.updated', 'order.cancelled'],
      httpMethod: 'POST',
      contentType: 'application/json',
      secretKey: 'whsec_1234567890abcdef',
      timeout: 30,
      retries: 3,
      createdAt: '2024-01-15T10:00:00Z',
      lastTriggered: '2024-12-07T14:30:00Z',
      successCount: 1245,
      failureCount: 23,
      description: 'Sipariş olayları için webhook',
      headers: {
        'Authorization': 'Bearer token123',
        'X-Custom-Header': 'value',
      },
      isVerified: true,
    },
    {
      id: '2',
      name: 'Payment Notification',
      url: 'https://payments.example.com/notify',
      status: 'active',
      events: ['payment.completed', 'payment.failed', 'payment.refunded'],
      httpMethod: 'POST',
      contentType: 'application/json',
      timeout: 15,
      retries: 2,
      createdAt: '2024-02-20T15:30:00Z',
      lastTriggered: '2024-12-07T13:45:00Z',
      successCount: 892,
      failureCount: 8,
      description: 'Ödeme bildirimler için webhook',
      headers: {},
      isVerified: true,
    },
    {
      id: '3',
      name: 'User Registration',
      url: 'https://crm.example.com/webhooks/user',
      status: 'failed',
      events: ['user.created', 'user.updated', 'user.deleted'],
      httpMethod: 'POST',
      contentType: 'application/json',
      timeout: 20,
      retries: 1,
      createdAt: '2024-03-10T09:15:00Z',
      lastTriggered: '2024-12-06T18:20:00Z',
      successCount: 456,
      failureCount: 78,
      description: 'Kullanıcı olayları için webhook',
      headers: {},
      isVerified: false,
    },
    {
      id: '4',
      name: 'Inventory Update',
      url: 'https://inventory.example.com/sync',
      status: 'inactive',
      events: ['inventory.updated', 'product.out_of_stock'],
      httpMethod: 'PUT',
      contentType: 'application/json',
      timeout: 25,
      retries: 2,
      createdAt: '2024-04-05T11:45:00Z',
      successCount: 234,
      failureCount: 12,
      description: 'Envanter güncellemeleri için webhook',
      headers: {},
      isVerified: true,
    },
  ];

  const mockLogs: WebhookLog[] = [
    {
      id: '1',
      webhookId: '1',
      event: 'order.created',
      status: 'success',
      responseCode: 200,
      responseTime: 245,
      payload: { orderId: 'ORD-12345', amount: 99.99, currency: 'TRY' },
      response: '{"status":"ok","id":"webhook-12345"}',
      timestamp: '2024-12-07T14:30:00Z',
      retryCount: 0,
    },
    {
      id: '2',
      webhookId: '1',
      event: 'order.updated',
      status: 'failed',
      responseCode: 500,
      responseTime: 5000,
      payload: { orderId: 'ORD-12346', status: 'shipped' },
      error: 'Internal Server Error: Database connection failed',
      timestamp: '2024-12-07T14:15:00Z',
      retryCount: 2,
      nextRetry: '2024-12-07T15:15:00Z',
    },
    {
      id: '3',
      webhookId: '2',
      event: 'payment.completed',
      status: 'success',
      responseCode: 201,
      responseTime: 180,
      payload: { paymentId: 'PAY-7890', amount: 149.50, method: 'credit_card' },
      response: '{"received":true,"processed_at":"2024-12-07T13:45:02Z"}',
      timestamp: '2024-12-07T13:45:00Z',
      retryCount: 0,
    },
    {
      id: '4',
      webhookId: '3',
      event: 'user.created',
      status: 'pending',
      payload: { userId: 'USR-999', email: 'john@example.com', plan: 'premium' },
      timestamp: '2024-12-07T12:30:00Z',
      retryCount: 1,
      nextRetry: '2024-12-07T12:35:00Z',
    },
  ];

  const availableEvents = [
    { group: 'Siparişler', events: ['order.created', 'order.updated', 'order.cancelled', 'order.shipped', 'order.delivered'] },
    { group: 'Ödemeler', events: ['payment.completed', 'payment.failed', 'payment.refunded', 'payment.pending'] },
    { group: 'Kullanıcılar', events: ['user.created', 'user.updated', 'user.deleted', 'user.login', 'user.logout'] },
    { group: 'Ürünler', events: ['product.created', 'product.updated', 'product.deleted', 'inventory.updated'] },
    { group: 'Sistem', events: ['system.maintenance', 'system.backup', 'system.error'] },
  ];

  const statusColors = {
    active: 'success',
    inactive: 'default',
    failed: 'error',
  };

  const statusTexts = {
    active: 'Aktif',
    inactive: 'Pasif',
    failed: 'Hatalı',
  };

  const logStatusColors = {
    success: 'success',
    failed: 'error',
    pending: 'processing',
    retry: 'warning',
  };

  const logStatusTexts = {
    success: 'Başarılı',
    failed: 'Başarısız',
    pending: 'Bekliyor',
    retry: 'Yeniden Deniyor',
  };

  const webhookColumns: ProColumns<Webhook>[] = [
    {
      title: 'Webhook',
      key: 'webhook',
      width: 250,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <LinkOutlined style={{ color: '#1890ff' }} />
            <Text strong>{record.name}</Text>
            {record.isVerified && (
              <Tooltip title="Doğrulanmış">
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              </Tooltip>
            )}
          </Space>
          <Text code style={{ fontSize: 11 }}>
            {record.url.length > 35 ? record.url.substring(0, 35) + '...' : record.url}
          </Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: keyof typeof statusColors, record) => (
        <Space direction="vertical" size={0}>
          <Badge
            status={statusColors[status]}
            text={statusTexts[status]}
          />
          {record.lastTriggered && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Son: {dayjs(record.lastTriggered).fromNow()}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Olaylar',
      dataIndex: 'events',
      key: 'events',
      width: 200,
      render: (events: string[]) => (
        <Space direction="vertical" size={0}>
          {events.slice(0, 2).map(event => (
            <Tag key={event} size="small" color="blue">
              {event}
            </Tag>
          ))}
          {events.length > 2 && (
            <Text type="secondary">+{events.length - 2} more</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'İstatistikler',
      key: 'stats',
      width: 120,
      render: (_, record) => {
        const total = record.successCount + record.failureCount;
        const successRate = total > 0 ? (record.successCount / total) * 100 : 0;
        
        return (
          <Space direction="vertical" size={0}>
            <Text strong>
              {record.successCount.toLocaleString()} / {total.toLocaleString()}
            </Text>
            <Progress
              percent={successRate}
              size="small"
              format={() => `${successRate.toFixed(1)}%`}
              strokeColor={successRate > 95 ? '#52c41a' : successRate > 80 ? '#faad14' : '#ff4d4f'}
            />
          </Space>
        );
      },
    },
    {
      title: 'Konfigürasyon',
      key: 'config',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.httpMethod}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.timeout}s timeout
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.retries} retry
          </Text>
        </Space>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Detaylar">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => {
                setSelectedWebhook(record);
                setIsDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Test Et">
            <Button
              type="text"
              icon={<SendOutlined />}
              onClick={() => handleTestWebhook(record)}
            />
          </Tooltip>
          <Tooltip title="Düzenle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? 'Devre Dışı Bırak' : 'Aktifleştir'}>
            <Button
              type="text"
              icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bu webhook'u silmek istediğinize emin misiniz?"
            onConfirm={() => handleDelete(record)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Tooltip title="Sil">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const logColumns: ProColumns<WebhookLog>[] = [
    {
      title: 'Olay',
      dataIndex: 'event',
      key: 'event',
      width: 150,
      render: (event: string) => (
        <Tag color="blue">{event}</Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: keyof typeof logStatusColors) => (
        <Badge
          status={logStatusColors[status]}
          text={logStatusTexts[status]}
        />
      ),
    },
    {
      title: 'Yanıt',
      key: 'response',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.responseCode && (
            <Tag color={record.responseCode < 300 ? 'green' : 'red'}>
              {record.responseCode}
            </Tag>
          )}
          {record.responseTime && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.responseTime}ms
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Zaman',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp: string) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(timestamp).format('DD.MM.YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(timestamp).format('HH:mm:ss')}
          </Text>
        </Space>
      ),
      sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
    },
    {
      title: 'Retry',
      dataIndex: 'retryCount',
      key: 'retryCount',
      width: 80,
      render: (retryCount: number, record) => (
        <Space direction="vertical" size={0}>
          <Badge count={retryCount} style={{ backgroundColor: retryCount > 0 ? '#faad14' : '#52c41a' }} />
          {record.nextRetry && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              Sonraki: {dayjs(record.nextRetry).format('HH:mm')}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Space>
          <Tooltip title="Detaylar">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedLog(record);
                setIsLogDrawerVisible(true);
              }}
            />
          </Tooltip>
          {record.status === 'failed' && (
            <Tooltip title="Yeniden Gönder">
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => handleRetryWebhook(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const handleCreate = () => {
    setSelectedWebhook(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    form.setFieldsValue({
      ...webhook,
      headers: Object.entries(webhook.headers).map(([key, value]) => ({ key, value })),
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (webhook: Webhook) => {
    await Swal.fire({
      icon: 'success',
      title: 'Webhook Silindi',
      text: `${webhook.name} başarıyla silindi.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleToggleStatus = async (webhook: Webhook) => {
    const newStatus = webhook.status === 'active' ? 'inactive' : 'active';
    await Swal.fire({
      icon: 'success',
      title: 'Durum Güncellendi',
      text: `${webhook.name} ${newStatus === 'active' ? 'aktifleştirildi' : 'devre dışı bırakıldı'}.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleTestWebhook = async (webhook: Webhook) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await Swal.fire({
      icon: 'success',
      title: 'Test Başarılı',
      text: `${webhook.name} webhook'u başarıyla test edildi.`,
      timer: 2000,
      showConfirmButton: false,
    });
    
    setLoading(false);
  };

  const handleRetryWebhook = async (log: WebhookLog) => {
    message.success('Webhook yeniden gönderildi');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await new Promise(resolve => setTimeout(resolve, 1500));

      await Swal.fire({
        icon: 'success',
        title: selectedWebhook ? 'Webhook Güncellendi' : 'Webhook Oluşturuldu',
        text: selectedWebhook ? 
          'Webhook başarıyla güncellendi.' : 
          'Yeni webhook oluşturuldu ve aktifleştirildi.',
        timer: 2000,
        showConfirmButton: false,
      });

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Lütfen gerekli alanları doldurun');
    } finally {
      setLoading(false);
    }
  };

  const WebhookModal = () => (
    <Modal
      title={selectedWebhook ? 'Webhook Düzenle' : 'Yeni Webhook Oluştur'}
      open={isModalVisible}
      onOk={handleModalOk}
      onCancel={() => setIsModalVisible(false)}
      confirmLoading={loading}
      width={700}
      okText={selectedWebhook ? 'Güncelle' : 'Oluştur'}
      cancelText="İptal"
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Webhook Adı"
              rules={[{ required: true, message: 'Ad zorunludur' }]}
            >
              <Input placeholder="Order Created" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Durum"
              initialValue="active"
            >
              <Select>
                <Option value="active">Aktif</Option>
                <Option value="inactive">Pasif</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="url"
          label="Webhook URL"
          rules={[
            { required: true, message: 'URL zorunludur' },
            { type: 'url', message: 'Geçerli bir URL girin' }
          ]}
        >
          <Input placeholder="https://api.example.com/webhooks/orders" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Açıklama"
        >
          <TextArea rows={2} placeholder="Webhook açıklaması..." />
        </Form.Item>

        <Form.Item
          name="events"
          label="Olaylar"
          rules={[{ required: true, message: 'En az bir olay seçmelisiniz' }]}
        >
          <Checkbox.Group>
            {availableEvents.map(group => (
              <div key={group.group}>
                <Divider orientation="left" style={{ fontSize: 12, margin: '8px 0' }}>
                  {group.group}
                </Divider>
                <Row>
                  {group.events.map(event => (
                    <Col span={12} key={event}>
                      <Checkbox value={event} style={{ fontSize: 12 }}>
                        {event}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </div>
            ))}
          </Checkbox.Group>
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="httpMethod"
              label="HTTP Method"
              initialValue="POST"
            >
              <Select>
                <Option value="POST">POST</Option>
                <Option value="PUT">PUT</Option>
                <Option value="PATCH">PATCH</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="timeout"
              label="Timeout (saniye)"
              initialValue={30}
            >
              <Select>
                <Option value={15}>15 saniye</Option>
                <Option value={30}>30 saniye</Option>
                <Option value={60}>60 saniye</Option>
                <Option value={120}>2 dakika</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="retries"
              label="Yeniden Deneme"
              initialValue={3}
            >
              <Select>
                <Option value={0}>0</Option>
                <Option value={1}>1</Option>
                <Option value={2}>2</Option>
                <Option value={3}>3</Option>
                <Option value={5}>5</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contentType"
              label="Content Type"
              initialValue="application/json"
            >
              <Select>
                <Option value="application/json">application/json</Option>
                <Option value="application/xml">application/xml</Option>
                <Option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="secretKey"
              label="Secret Key (Opsiyonel)"
            >
              <Input.Password placeholder="whsec_..." />
            </Form.Item>
          </Col>
        </Row>

        <Alert
          message="Webhook Güvenliği"
          description="Secret key kullanarak webhook'larınızı güvence altına alabilirsiniz. Bu anahtar her istek ile birlikte gönderilir."
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Form>
    </Modal>
  );

  const WebhookDrawer = () => (
    <Drawer
      title={`Webhook: ${selectedWebhook?.name}`}
      width={800}
      open={isDrawerVisible}
      onClose={() => setIsDrawerVisible(false)}
      extra={
        <Space>
          <Button icon={<EditOutlined />}>Düzenle</Button>
          <Button icon={<SendOutlined />}>Test Et</Button>
        </Space>
      }
    >
      {selectedWebhook && (
        <Tabs defaultActiveKey="details">
          <TabPane tab="Detaylar" key="details">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Ad">
                {selectedWebhook.name}
              </Descriptions.Item>
              <Descriptions.Item label="URL">
                <Space>
                  <Text code>{selectedWebhook.url}</Text>
                  <Button 
                    size="small" 
                    icon={<CopyOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(selectedWebhook.url);
                      message.success('URL kopyalandı');
                    }}
                  />
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Badge
                  status={statusColors[selectedWebhook.status]}
                  text={statusTexts[selectedWebhook.status]}
                />
              </Descriptions.Item>
              <Descriptions.Item label="HTTP Method">
                {selectedWebhook.httpMethod}
              </Descriptions.Item>
              <Descriptions.Item label="Content Type">
                {selectedWebhook.contentType}
              </Descriptions.Item>
              <Descriptions.Item label="Timeout">
                {selectedWebhook.timeout} saniye
              </Descriptions.Item>
              <Descriptions.Item label="Yeniden Deneme">
                {selectedWebhook.retries} kez
              </Descriptions.Item>
              <Descriptions.Item label="Doğrulanmış">
                {selectedWebhook.isVerified ? (
                  <Tag color="green" icon={<CheckCircleOutlined />}>Evet</Tag>
                ) : (
                  <Tag color="red" icon={<CloseCircleOutlined />}>Hayır</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Oluşturulma">
                {dayjs(selectedWebhook.createdAt).format('DD.MM.YYYY HH:mm')}
              </Descriptions.Item>
              {selectedWebhook.lastTriggered && (
                <Descriptions.Item label="Son Tetikleme">
                  {dayjs(selectedWebhook.lastTriggered).format('DD.MM.YYYY HH:mm')}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Açıklama">
                {selectedWebhook.description || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />
            <Title level={5}>Olaylar</Title>
            <Space wrap>
              {selectedWebhook.events.map(event => (
                <Tag key={event} color="blue">{event}</Tag>
              ))}
            </Space>

            {Object.keys(selectedWebhook.headers).length > 0 && (
              <>
                <Divider />
                <Title level={5}>Özel Header'lar</Title>
                <List
                  size="small"
                  dataSource={Object.entries(selectedWebhook.headers)}
                  renderItem={([key, value]) => (
                    <List.Item>
                      <Text code>{key}: {value}</Text>
                    </List.Item>
                  )}
                />
              </>
            )}
          </TabPane>

          <TabPane tab="İstatistikler" key="stats">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Başarılı"
                    value={selectedWebhook.successCount}
                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Başarısız"
                    value={selectedWebhook.failureCount}
                    prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Başarı Oranı"
                    value={
                      selectedWebhook.successCount + selectedWebhook.failureCount > 0 ?
                      (selectedWebhook.successCount / (selectedWebhook.successCount + selectedWebhook.failureCount)) * 100 :
                      0
                    }
                    precision={1}
                    suffix="%"
                    valueStyle={{ 
                      color: selectedWebhook.successCount / (selectedWebhook.successCount + selectedWebhook.failureCount) > 0.95 ? '#52c41a' : '#faad14' 
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      )}
    </Drawer>
  );

  const LogDrawer = () => (
    <Drawer
      title="Webhook Log Detayı"
      width={600}
      open={isLogDrawerVisible}
      onClose={() => setIsLogDrawerVisible(false)}
    >
      {selectedLog && (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Card size="small" title="Genel Bilgiler">
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="Olay">
                <Tag color="blue">{selectedLog.event}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Badge
                  status={logStatusColors[selectedLog.status]}
                  text={logStatusTexts[selectedLog.status]}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Zaman">
                {dayjs(selectedLog.timestamp).format('DD.MM.YYYY HH:mm:ss')}
              </Descriptions.Item>
              {selectedLog.responseCode && (
                <Descriptions.Item label="HTTP Status">
                  <Tag color={selectedLog.responseCode < 300 ? 'green' : 'red'}>
                    {selectedLog.responseCode}
                  </Tag>
                </Descriptions.Item>
              )}
              {selectedLog.responseTime && (
                <Descriptions.Item label="Yanıt Süresi">
                  {selectedLog.responseTime}ms
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Deneme Sayısı">
                <Badge count={selectedLog.retryCount} style={{ backgroundColor: '#1890ff' }} />
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card size="small" title="Payload">
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12 }}>
              {JSON.stringify(selectedLog.payload, null, 2)}
            </pre>
          </Card>

          {selectedLog.response && (
            <Card size="small" title="Yanıt">
              <pre style={{ background: '#f6ffed', padding: 12, borderRadius: 4, fontSize: 12 }}>
                {selectedLog.response}
              </pre>
            </Card>
          )}

          {selectedLog.error && (
            <Card size="small" title="Hata">
              <Alert
                message={selectedLog.error}
                type="error"
                style={{ fontSize: 12 }}
              />
            </Card>
          )}

          {selectedLog.nextRetry && (
            <Alert
              message={`Sonraki deneme: ${dayjs(selectedLog.nextRetry).format('DD.MM.YYYY HH:mm:ss')}`}
              type="warning"
              showIcon
            />
          )}
        </Space>
      )}
    </Drawer>
  );

  return (
    <PageContainer
      header={{
        title: 'Webhook\'lar',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa', path: '/' },
            { title: 'Tenants', path: '/tenants' },
            { title: 'ABC Corporation', path: `/tenants/${id}` },
            { title: 'Webhook\'lar' },
          ],
        },
        onBack: () => navigate(`/tenants/${id}`),
      }}
    >
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Webhook"
              value={mockWebhooks.length}
              prefix={<LinkOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aktif Webhook"
              value={mockWebhooks.filter(w => w.status === 'active').length}
              prefix={<PlayCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bu Ay Gönderilen"
              value={15847}
              prefix={<SendOutlined style={{ color: '#722ed1' }} />}
              suffix={
                <Text type="success" style={{ fontSize: 14 }}>
                  +18%
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ortalama Başarı"
              value={96.8}
              precision={1}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><LinkOutlined /> Webhook'lar</span>} key="webhooks">
          <Card>
            <Alert
              message="Webhook Yönetimi"
              description="Webhook'lar sistem olaylarını otomatik olarak dış servislere bildirir. Güvenlik için secret key kullanmayı unutmayın."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <ProTable<Webhook>
              columns={webhookColumns}
              dataSource={mockWebhooks}
              rowKey="id"
              search={false}
              pagination={{ pageSize: 10 }}
              toolBarRender={() => [
                <Button key="refresh" icon={<ReloadOutlined />}>
                  Yenile
                </Button>,
                <Button
                  key="create"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  Yeni Webhook
                </Button>,
              ]}
              scroll={{ x: 1200 }}
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><HistoryOutlined /> Loglar</span>} key="logs">
          <Card>
            <ProTable<WebhookLog>
              columns={logColumns}
              dataSource={mockLogs}
              rowKey="id"
              search={false}
              pagination={{ pageSize: 15 }}
              toolBarRender={() => [
                <Select
                  key="filter"
                  placeholder="Duruma göre filtrele"
                  style={{ width: 150 }}
                  allowClear
                >
                  <Option value="success">Başarılı</Option>
                  <Option value="failed">Başarısız</Option>
                  <Option value="pending">Bekliyor</Option>
                  <Option value="retry">Yeniden Deniyor</Option>
                </Select>,
                <Button key="export" icon={<DownloadOutlined />}>
                  Dışa Aktar
                </Button>,
              ]}
              scroll={{ x: 800 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <WebhookModal />
      <WebhookDrawer />
      <LogDrawer />
    </PageContainer>
  );
};

export default TenantWebhooks;