'use client';

import React, { useState } from 'react';
import {
  Card,
  List,
  Tag,
  Button,
  Space,
  Typography,
  Badge,
  Tabs,
  Empty,
  Dropdown,
  Menu,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Switch,
  Row,
  Col,
} from 'antd';
import {
  ClockCircleOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
  BellOutlined,
  MailOutlined,
  MobileOutlined,
  SnippetsOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// Mock data - Bu gerçek API'den gelecek
const mockReminders = [
  {
    id: 1,
    title: 'Müşteri Görüşmesi',
    description: 'Acme Corp ile aylık değerlendirme toplantısı',
    remindAt: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 saat sonra
    type: 'Meeting',
    status: 'Pending',
    sendEmail: true,
    sendInApp: true,
    sendPush: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 2,
    title: 'Teklif Gönder',
    description: 'Beta Inc için revize teklifi hazırla ve gönder',
    remindAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 gün sonra
    type: 'Task',
    status: 'Pending',
    sendEmail: true,
    sendInApp: true,
    sendPush: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: 3,
    title: 'Sözleşme Yenileme',
    description: 'Gamma Ltd sözleşmesi yenileme tarihi yaklaşıyor',
    remindAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 hafta sonra
    type: 'ContractRenewal',
    status: 'Pending',
    sendEmail: true,
    sendInApp: true,
    sendPush: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: 4,
    title: 'Ödeme Takibi',
    description: 'Delta Corp fatura ödemesi vade tarihi',
    remindAt: new Date(Date.now() - 1000 * 60 * 60), // 1 saat önce (geçmiş)
    type: 'PaymentDue',
    status: 'Snoozed',
    snoozedUntil: new Date(Date.now() + 1000 * 60 * 30), // 30 dakika sonra
    sendEmail: true,
    sendInApp: true,
    sendPush: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
  {
    id: 5,
    title: 'Müşteri Takip',
    description: 'Epsilon Inc ile takip görüşmesi yap',
    remindAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 gün önce (geçmiş)
    type: 'FollowUp',
    status: 'Completed',
    completedAt: new Date(Date.now() - 1000 * 60 * 30),
    sendEmail: false,
    sendInApp: true,
    sendPush: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
  },
];

const RemindersPage = () => {
  const [reminders, setReminders] = useState(mockReminders);
  const [activeTab, setActiveTab] = useState('pending');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'Meeting':
        return '📅';
      case 'Task':
        return '✅';
      case 'ContractRenewal':
        return '📄';
      case 'PaymentDue':
        return '💰';
      case 'FollowUp':
        return '📞';
      case 'Birthday':
        return '🎂';
      default:
        return '⏰';
    }
  };

  const getReminderColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'blue';
      case 'Snoozed':
        return 'orange';
      case 'Triggered':
        return 'purple';
      case 'Completed':
        return 'green';
      case 'Dismissed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getReminderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      General: 'Genel',
      Task: 'Görev',
      Meeting: 'Toplantı',
      FollowUp: 'Takip',
      Birthday: 'Doğum Günü',
      ContractRenewal: 'Sözleşme Yenileme',
      PaymentDue: 'Ödeme Vadesi',
    };
    return labels[type] || type;
  };

  const handleSnooze = (id: number, minutes: number) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id
          ? {
              ...reminder,
              status: 'Snoozed',
              snoozedUntil: new Date(Date.now() + minutes * 60 * 1000),
            }
          : reminder
      )
    );
  };

  const handleComplete = (id: number) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id
          ? { ...reminder, status: 'Completed', completedAt: new Date() }
          : reminder
      )
    );
  };

  const handleDismiss = (id: number) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id ? { ...reminder, status: 'Dismissed' } : reminder
      )
    );
  };

  const handleDelete = (id: number) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
  };

  const handleCreateReminder = async (values: any) => {
    console.log('Creating reminder:', values);
    // API call yapılacak
    setIsModalVisible(false);
    form.resetFields();
  };

  const getFilteredReminders = () => {
    switch (activeTab) {
      case 'pending':
        return reminders.filter((r) => r.status === 'Pending');
      case 'snoozed':
        return reminders.filter((r) => r.status === 'Snoozed');
      case 'completed':
        return reminders.filter((r) => r.status === 'Completed');
      default:
        return reminders;
    }
  };

  const pendingCount = reminders.filter((r) => r.status === 'Pending').length;
  const snoozedCount = reminders.filter((r) => r.status === 'Snoozed').length;
  const completedCount = reminders.filter((r) => r.status === 'Completed').length;

  const filteredReminders = getFilteredReminders();

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          <ClockCircleOutlined /> Hatırlatıcılar
          {pendingCount > 0 && (
            <Badge count={pendingCount} style={{ marginLeft: 12 }} />
          )}
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Yeni Hatırlatıcı
        </Button>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                Bekleyen
                <Badge count={pendingCount} style={{ marginLeft: 8 }} showZero />
              </span>
            }
            key="pending"
          />
          <TabPane
            tab={
              <span>
                Ertelenen
                <Badge count={snoozedCount} style={{ marginLeft: 8, backgroundColor: '#fa8c16' }} showZero />
              </span>
            }
            key="snoozed"
          />
          <TabPane
            tab={
              <span>
                Tamamlanan
                <Badge count={completedCount} style={{ marginLeft: 8, backgroundColor: '#52c41a' }} showZero />
              </span>
            }
            key="completed"
          />
        </Tabs>

        {filteredReminders.length === 0 ? (
          <Empty
            description={
              activeTab === 'pending'
                ? 'Bekleyen hatırlatıcı yok'
                : activeTab === 'snoozed'
                ? 'Ertelenen hatırlatıcı yok'
                : 'Tamamlanan hatırlatıcı yok'
            }
            style={{ padding: '60px 0' }}
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={filteredReminders}
            renderItem={(item) => {
              const isOverdue = item.status === 'Pending' && new Date(item.remindAt) < new Date();

              return (
                <List.Item
                  style={{
                    backgroundColor: isOverdue ? '#fff2e8' : 'transparent',
                    padding: '16px',
                    borderRadius: 8,
                    marginBottom: 8,
                    borderLeft: isOverdue ? '4px solid #ff7a45' : 'none',
                  }}
                  actions={[
                    item.status === 'Pending' && (
                      <Button
                        key="complete"
                        type="primary"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={() => handleComplete(item.id)}
                      >
                        Tamamla
                      </Button>
                    ),
                    item.status === 'Pending' && (
                      <Dropdown
                        key="snooze"
                        overlay={
                          <Menu>
                            <Menu.Item onClick={() => handleSnooze(item.id, 5)}>5 dakika ertele</Menu.Item>
                            <Menu.Item onClick={() => handleSnooze(item.id, 15)}>15 dakika ertele</Menu.Item>
                            <Menu.Item onClick={() => handleSnooze(item.id, 30)}>30 dakika ertele</Menu.Item>
                            <Menu.Item onClick={() => handleSnooze(item.id, 60)}>1 saat ertele</Menu.Item>
                          </Menu>
                        }
                        trigger={['click']}
                      >
                        <Button size="small">Ertele</Button>
                      </Dropdown>
                    ),
                    <Dropdown
                      key="actions"
                      overlay={
                        <Menu>
                          {item.status === 'Pending' && (
                            <Menu.Item
                              key="dismiss"
                              icon={<CloseOutlined />}
                              onClick={() => handleDismiss(item.id)}
                            >
                              Kapat
                            </Menu.Item>
                          )}
                          <Menu.Item
                            key="delete"
                            icon={<CloseOutlined />}
                            danger
                            onClick={() => handleDelete(item.id)}
                          >
                            Sil
                          </Menu.Item>
                        </Menu>
                      }
                      trigger={['click']}
                    >
                      <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>,
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ fontSize: 32 }}>{getReminderIcon(item.type)}</div>
                    }
                    title={
                      <Space>
                        <Text strong>{item.title}</Text>
                        <Tag color={getReminderColor(item.status)}>{item.status}</Tag>
                        <Tag>{getReminderTypeLabel(item.type)}</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        {item.description && <Text>{item.description}</Text>}
                        <Space size={16}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <ClockCircleOutlined /> {dayjs(item.remindAt).format('DD.MM.YYYY HH:mm')}
                            {isOverdue && <Text type="danger"> (Geçti!)</Text>}
                          </Text>
                          {item.status === 'Snoozed' && item.snoozedUntil && (
                            <Text type="warning" style={{ fontSize: 12 }}>
                              Ertelendi: {dayjs(item.snoozedUntil).fromNow()}
                            </Text>
                          )}
                          {item.status === 'Completed' && item.completedAt && (
                            <Text type="success" style={{ fontSize: 12 }}>
                              Tamamlandı: {dayjs(item.completedAt).fromNow()}
                            </Text>
                          )}
                        </Space>
                        <Space size={8}>
                          {item.sendInApp && (
                            <Tag icon={<BellOutlined />} color="blue">
                              Uygulama İçi
                            </Tag>
                          )}
                          {item.sendEmail && (
                            <Tag icon={<MailOutlined />} color="green">
                              Email
                            </Tag>
                          )}
                          {item.sendPush && (
                            <Tag icon={<MobileOutlined />} color="purple">
                              Push
                            </Tag>
                          )}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>

      <Modal
        title={
          <span>
            <PlusOutlined /> Yeni Hatırlatıcı Oluştur
          </span>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Oluştur"
        cancelText="İptal"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateReminder}
          initialValues={{
            type: 'General',
            sendInApp: true,
            sendEmail: false,
            sendPush: false,
          }}
        >
          <Form.Item
            name="title"
            label="Başlık"
            rules={[{ required: true, message: 'Lütfen bir başlık girin' }]}
          >
            <Input placeholder="Hatırlatıcı başlığı" />
          </Form.Item>

          <Form.Item name="description" label="Açıklama">
            <TextArea rows={3} placeholder="Hatırlatıcı detayları (opsiyonel)" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="remindAt"
                label="Hatırlatma Zamanı"
                rules={[{ required: true, message: 'Lütfen bir tarih seçin' }]}
              >
                <DatePicker
                  showTime
                  format="DD.MM.YYYY HH:mm"
                  style={{ width: '100%' }}
                  placeholder="Tarih ve saat seçin"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Hatırlatıcı Tipi"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="General">⏰ Genel</Option>
                  <Option value="Task">✅ Görev</Option>
                  <Option value="Meeting">📅 Toplantı</Option>
                  <Option value="FollowUp">📞 Takip</Option>
                  <Option value="Birthday">🎂 Doğum Günü</Option>
                  <Option value="ContractRenewal">📄 Sözleşme Yenileme</Option>
                  <Option value="PaymentDue">💰 Ödeme Vadesi</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Bildirim Kanalları">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item name="sendInApp" valuePropName="checked" style={{ margin: 0 }}>
                <Space>
                  <Switch />
                  <BellOutlined /> Uygulama İçi Bildirim
                </Space>
              </Form.Item>
              <Form.Item name="sendEmail" valuePropName="checked" style={{ margin: 0 }}>
                <Space>
                  <Switch />
                  <MailOutlined /> Email Bildirimi
                </Space>
              </Form.Item>
              <Form.Item name="sendPush" valuePropName="checked" style={{ margin: 0 }}>
                <Space>
                  <Switch />
                  <MobileOutlined /> Push Bildirimi
                </Space>
              </Form.Item>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RemindersPage;
