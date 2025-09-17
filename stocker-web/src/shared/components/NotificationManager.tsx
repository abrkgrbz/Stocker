import React, { useEffect, useState } from 'react';
import { notification, Badge, Button, Drawer, List, Avatar, Space, Typography, Tag, Empty, Tooltip } from 'antd';
import {
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  DeleteOutlined,
  CheckOutlined,
  ClearOutlined,
  SyncOutlined,
  TeamOutlined,
  DollarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DatabaseOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import signalRService from '@/services/signalr.service';
import masterDashboardService from '@/services/masterDashboard.service';
import './NotificationManager.css';

const { Text, Title } = Typography;

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  icon?: React.ReactNode;
  actionUrl?: string;
  source?: string;
}

export const NotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Setup SignalR listeners
    setupSignalRListeners();
    
    // Load initial notifications from localStorage
    loadStoredNotifications();

    return () => {
      // Cleanup
    };
  }, []);

  const setupSignalRListeners = () => {
    // Listen for general notifications
    signalRService.onNotificationReceived((notification) => {
      const newNotification: NotificationItem = {
        id: notification.id || Date.now().toString(),
        title: notification.title,
        description: notification.message,
        type: notification.type.toLowerCase() as NotificationItem['type'],
        timestamp: new Date(notification.createdAt),
        read: false,
        icon: getIconForType(notification.type),
        actionUrl: notification.actionUrl,
        source: 'system',
      };
      
      addNotification(newNotification);
      showNotificationPopup(newNotification);
    });

    // Listen for dashboard-specific events
    masterDashboardService.onNewTenant((tenant) => {
      const notification: NotificationItem = {
        id: `tenant-${tenant.id}`,
        title: 'Yeni Tenant',
        description: `${tenant.name} sisteme eklendi`,
        type: 'success',
        timestamp: new Date(),
        read: false,
        icon: <TeamOutlined />,
        source: 'dashboard',
      };
      
      addNotification(notification);
      showNotificationPopup(notification);
    });

    masterDashboardService.onAlertReceived((alert) => {
      const notification: NotificationItem = {
        id: alert.id,
        title: alert.title,
        description: alert.message,
        type: alert.level as NotificationItem['type'],
        timestamp: new Date(alert.timestamp),
        read: false,
        icon: getIconForAlert(alert.level),
        source: alert.source,
      };
      
      addNotification(notification);
      if (alert.level === 'critical' || alert.level === 'error') {
        showNotificationPopup(notification);
      }
    });

    masterDashboardService.onSystemHealthChanged((health) => {
      if (health.status === 'critical') {
        const notification: NotificationItem = {
          id: `health-${Date.now()}`,
          title: 'Sistem Sağlık Uyarısı',
          description: `Sistem kritik durumda: CPU %${health.cpu}, Memory %${health.memory}`,
          type: 'error',
          timestamp: new Date(),
          read: false,
          icon: <WarningOutlined />,
          source: 'system',
        };
        
        addNotification(notification);
        showNotificationPopup(notification);
      }
    });
  };

  const getIconForType = (type: string): React.ReactNode => {
    const iconMap: Record<string, React.ReactNode> = {
      'Success': <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      'Info': <InfoCircleOutlined style={{ color: '#1890ff' }} />,
      'Warning': <WarningOutlined style={{ color: '#faad14' }} />,
      'Error': <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      'Payment': <DollarOutlined style={{ color: '#52c41a' }} />,
      'User': <UserOutlined style={{ color: '#1890ff' }} />,
      'Order': <ShoppingCartOutlined style={{ color: '#722ed1' }} />,
      'Stock': <DatabaseOutlined style={{ color: '#fa8c16' }} />,
      'System': <ApiOutlined style={{ color: '#595959' }} />,
    };
    return iconMap[type] || <InfoCircleOutlined />;
  };

  const getIconForAlert = (level: string): React.ReactNode => {
    switch (level) {
      case 'critical':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const addNotification = (notification: NotificationItem) => {
    setNotifications((prev) => {
      const updated = [notification, ...prev].slice(0, 100); // Keep last 100 notifications
      saveNotificationsToStorage(updated);
      return updated;
    });
    
    setUnreadCount((prev) => prev + 1);
  };

  const showNotificationPopup = (notification: NotificationItem) => {
    const key = `notification-${notification.id}`;
    
    notification[notification.type]({
      key,
      message: notification.title,
      description: notification.description,
      placement: 'topRight',
      duration: 4,
      icon: notification.icon,
      btn: notification.actionUrl ? (
        <Button 
          type="primary" 
          size="small"
          onClick={() => {
            window.open(notification.actionUrl, '_blank');
            notification.close(key);
          }}
        >
          Görüntüle
        </Button>
      ) : undefined,
    });
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => 
        n.id === id ? { ...n, read: true } : n
      );
      saveNotificationsToStorage(updated);
      return updated;
    });
    
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotificationsToStorage(updated);
      return updated;
    });
    
    setUnreadCount(0);
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => {
      const notification = prev.find(n => n.id === id);
      const updated = prev.filter((n) => n.id !== id);
      saveNotificationsToStorage(updated);
      
      if (notification && !notification.read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('notifications');
  };

  const saveNotificationsToStorage = (notifications: NotificationItem[]) => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      // Error handling removed for production
    }
  };

  const loadStoredNotifications = () => {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const parsed = JSON.parse(stored) as NotificationItem[];
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      }
    } catch (error) {
      // Error handling removed for production
    }
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    return new Date(date).toLocaleDateString('tr-TR');
  };

  return (
    <>
      <Tooltip title="Bildirimler">
        <Badge count={unreadCount} overflowCount={99}>
          <Button
            type="text"
            icon={<BellOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{ fontSize: 18 }}
          />
        </Badge>
      </Tooltip>

      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>
              Bildirimler
              {unreadCount > 0 && (
                <Badge 
                  count={unreadCount} 
                  style={{ marginLeft: 12 }}
                  overflowCount={99}
                />
              )}
            </Title>
            <Space>
              {notifications.length > 0 && (
                <>
                  <Tooltip title="Tümünü okundu işaretle">
                    <Button
                      type="text"
                      icon={<CheckOutlined />}
                      onClick={markAllAsRead}
                      disabled={unreadCount === 0}
                    />
                  </Tooltip>
                  <Tooltip title="Tümünü temizle">
                    <Button
                      type="text"
                      icon={<ClearOutlined />}
                      onClick={clearAll}
                      danger
                    />
                  </Tooltip>
                </>
              )}
              <Tooltip title="Yenile">
                <Button
                  type="text"
                  icon={<SyncOutlined spin={loading} />}
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => setLoading(false), 1000);
                  }}
                />
              </Tooltip>
            </Space>
          </div>
        }
        placement="right"
        width={400}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        styles={{ body: { padding: 0 } }}
      >
        {notifications.length > 0 ? (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                className={`notification-item ${!item.read ? 'unread' : ''}`}
                onClick={() => !item.read && markAsRead(item.id)}
                actions={[
                  <Tooltip title="Sil" key="delete">
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(item.id);
                      }}
                      danger
                    />
                  </Tooltip>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={item.icon}
                      style={{ 
                        backgroundColor: item.type === 'error' ? '#fff2f0' :
                                       item.type === 'warning' ? '#fffbe6' :
                                       item.type === 'success' ? '#f6ffed' : '#f0f5ff'
                      }}
                    />
                  }
                  title={
                    <Space>
                      <Text strong={!item.read}>{item.title}</Text>
                      {!item.read && <Badge status="processing" />}
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {item.description}
                      </Text>
                      <div style={{ marginTop: 8 }}>
                        <Space size="small">
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {getRelativeTime(item.timestamp)}
                          </Text>
                          {item.source && (
                            <Tag color="default" style={{ fontSize: 11 }}>
                              {item.source}
                            </Tag>
                          )}
                        </Space>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            description="Bildirim yok"
            style={{ marginTop: 100 }}
          />
        )}
      </Drawer>
    </>
  );
};

export default NotificationManager;