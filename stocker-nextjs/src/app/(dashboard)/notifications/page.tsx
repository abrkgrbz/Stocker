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
} from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Mock data - Bu gerçek API'den gelecek
const mockNotifications = [
  {
    id: 1,
    type: 'Deal',
    title: '🎉 Yeni Fırsat Kazanıldı!',
    message: 'Acme Corp ile 50.000 TL değerindeki anlaşma kazanıldı.',
    channel: 'InApp',
    status: 'Sent',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 dakika önce
    relatedEntityType: 'Deal',
    relatedEntityId: 123,
  },
  {
    id: 2,
    type: 'Task',
    title: '⏰ Hatırlatıcı: Müşteri Görüşmesi',
    message: 'Beta Inc ile toplantı 1 saat sonra başlayacak.',
    channel: 'InApp',
    status: 'Sent',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 dakika önce
    relatedEntityType: 'Activity',
    relatedEntityId: 456,
  },
  {
    id: 3,
    type: 'Customer',
    title: '👤 Yeni Müşteri Eklendi',
    message: 'Gamma Ltd müşteri olarak sisteme eklendi.',
    channel: 'InApp',
    status: 'Sent',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 saat önce
    relatedEntityType: 'Customer',
    relatedEntityId: 789,
  },
  {
    id: 4,
    type: 'Workflow',
    title: '⚙️ Workflow Tamamlandı',
    message: 'Deal approval workflow başarıyla tamamlandı.',
    channel: 'InApp',
    status: 'Sent',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 gün önce
    relatedEntityType: 'Workflow',
    relatedEntityId: 321,
  },
  {
    id: 5,
    type: 'Alert',
    title: '⚠️ Düşük Stok Uyarısı',
    message: 'Product X için stok seviyesi kritik seviyede.',
    channel: 'InApp',
    status: 'Sent',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 gün önce
    relatedEntityType: 'Product',
    relatedEntityId: 654,
  },
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Deal':
        return <TrophyOutlined style={{ color: '#52c41a' }} />;
      case 'Task':
        return <CheckCircleOutlined style={{ color: '#1890ff' }} />;
      case 'Alert':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'Workflow':
        return <InfoCircleOutlined style={{ color: '#722ed1' }} />;
      default:
        return <BellOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'Deal':
        return 'success';
      case 'Task':
        return 'processing';
      case 'Alert':
        return 'error';
      case 'Workflow':
        return 'purple';
      case 'Customer':
        return 'blue';
      default:
        return 'default';
    }
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
  };

  const handleDelete = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter((n) => !n.isRead);
      case 'read':
        return notifications.filter((n) => n.isRead);
      default:
        return notifications;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = getFilteredNotifications();

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          <BellOutlined /> Bildirimler
          {unreadCount > 0 && (
            <Badge count={unreadCount} style={{ marginLeft: 12 }} />
          )}
        </Title>
        {unreadCount > 0 && (
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleMarkAllAsRead}
          >
            Tümünü Okundu İşaretle
          </Button>
        )}
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                Tümü
                <Badge
                  count={notifications.length}
                  style={{ marginLeft: 8, backgroundColor: '#d9d9d9' }}
                  showZero
                />
              </span>
            }
            key="all"
          />
          <TabPane
            tab={
              <span>
                Okunmamış
                <Badge count={unreadCount} style={{ marginLeft: 8 }} showZero />
              </span>
            }
            key="unread"
          />
          <TabPane
            tab={
              <span>
                Okunmuş
                <Badge
                  count={notifications.length - unreadCount}
                  style={{ marginLeft: 8, backgroundColor: '#52c41a' }}
                  showZero
                />
              </span>
            }
            key="read"
          />
        </Tabs>

        {filteredNotifications.length === 0 ? (
          <Empty
            description={
              activeTab === 'unread'
                ? 'Okunmamış bildirim yok'
                : activeTab === 'read'
                ? 'Okunmuş bildirim yok'
                : 'Henüz bildirim yok'
            }
            style={{ padding: '60px 0' }}
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={filteredNotifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  backgroundColor: item.isRead ? 'transparent' : '#f0f5ff',
                  padding: '16px',
                  borderRadius: 8,
                  marginBottom: 8,
                }}
                actions={[
                  <Dropdown
                    key="actions"
                    overlay={
                      <Menu>
                        {!item.isRead && (
                          <Menu.Item
                            key="read"
                            icon={<CheckOutlined />}
                            onClick={() => handleMarkAsRead(item.id)}
                          >
                            Okundu İşaretle
                          </Menu.Item>
                        )}
                        <Menu.Item
                          key="delete"
                          icon={<DeleteOutlined />}
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
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ fontSize: 24 }}>{getNotificationIcon(item.type)}</div>
                  }
                  title={
                    <Space>
                      <Text strong={!item.isRead}>{item.title}</Text>
                      <Tag color={getNotificationColor(item.type)}>{item.type}</Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={4}>
                      <Text>{item.message}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(item.createdAt).fromNow()}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;
