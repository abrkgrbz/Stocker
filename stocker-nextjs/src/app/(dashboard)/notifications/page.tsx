'use client';

import React, { useState, useEffect } from 'react';
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
  Spin,
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
import { CRMService } from '@/lib/api/services/crm.service';
import type { NotificationDto } from '@/lib/api/services/crm.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Removed mock data - now using real API
const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const unreadOnly = activeTab === 'unread' ? true : activeTab === 'read' ? false : undefined;

      const response = await CRMService.getNotifications({
        unreadOnly,
        skip: 0,
        take: 50,
      });

      setNotifications(response.notifications);
      setTotalCount(response.totalCount);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      showApiError(error, 'Bildirimler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [activeTab]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await CRMService.markNotificationAsRead(id);
      showSuccess('Bildirim okundu olarak işaretlendi');
      loadNotifications();
    } catch (error) {
      showApiError(error, 'Bildirim güncellenemedi');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await CRMService.markAllNotificationsAsRead();
      showSuccess('Tüm bildirimler okundu olarak işaretlendi');
      loadNotifications();
    } catch (error) {
      showApiError(error, 'Bildirimler güncellenemedi');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await CRMService.deleteNotification(id);
      showSuccess('Bildirim silindi');
      loadNotifications();
    } catch (error) {
      showApiError(error, 'Bildirim silinemedi');
    }
  };


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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
          </div>
        ) : filteredNotifications.length === 0 ? (
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
