import React, { useState, useEffect, useRef } from 'react';
import { Badge, Button, Dropdown, Tabs, Empty, List, Avatar, Tag, Space, Tooltip, Spin } from 'antd';
import {
  BellOutlined,
  BellFilled,
  CheckOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  MessageOutlined,
  UserOutlined,
  SettingOutlined,
  GiftOutlined,
  HeartOutlined,
  StarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './notification-styles.css';

const { TabPane } = Tabs;

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'message' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  avatar?: string;
  icon?: React.ReactNode;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  sender?: string;
  category?: string;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Yeni Kullanıcı Kaydı',
    description: 'Ahmet Yılmaz sisteme başarıyla kaydedildi.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 dakika önce
    read: false,
    priority: 'high',
    sender: 'Sistem',
    category: 'user',
  },
  {
    id: '2',
    type: 'warning',
    title: 'Disk Alanı Uyarısı',
    description: 'Sunucu disk alanı %85 doluluk oranına ulaştı.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 dakika önce
    read: false,
    priority: 'urgent',
    sender: 'Sistem Monitörü',
    category: 'system',
  },
  {
    id: '3',
    type: 'message',
    title: 'Yeni Mesaj',
    description: 'Mehmet Öz: Toplantı notlarını paylaşabilir misiniz?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 saat önce
    read: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet',
    sender: 'Mehmet Öz',
    category: 'message',
  },
  {
    id: '4',
    type: 'info',
    title: 'Sistem Güncellemesi',
    description: 'v2.5.0 sürümü başarıyla yüklendi.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 saat önce
    read: true,
    priority: 'low',
    sender: 'DevOps',
    category: 'system',
  },
  {
    id: '5',
    type: 'error',
    title: 'Ödeme Hatası',
    description: 'Kredi kartı işlemi başarısız oldu.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 saat önce
    read: false,
    priority: 'urgent',
    sender: 'Ödeme Sistemi',
    category: 'payment',
  },
];

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [animateBell, setAnimateBell] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;
  const unreadUrgent = notifications.filter(n => !n.read && n.priority === 'urgent').length;

  // Animate bell on new notification
  useEffect(() => {
    if (unreadCount > 0) {
      const interval = setInterval(() => {
        setAnimateBell(true);
        setTimeout(() => setAnimateBell(false), 1000);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [unreadCount]);

  // Filter notifications by tab
  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'messages':
        return notifications.filter(n => n.category === 'message');
      case 'system':
        return notifications.filter(n => n.category === 'system');
      default:
        return notifications;
    }
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Delete notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setVisible(false);
  };

  // Get icon by type
  const getNotificationIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon;
    
    switch (notification.type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: 'var(--color-success)' }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: 'var(--color-warning)' }} />;
      case 'error':
        return <CloseOutlined style={{ color: 'var(--color-error)' }} />;
      case 'message':
        return <MessageOutlined style={{ color: 'var(--color-primary)' }} />;
      case 'system':
        return <SettingOutlined style={{ color: 'var(--color-info)' }} />;
      default:
        return <InfoCircleOutlined style={{ color: 'var(--color-info)' }} />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'blue';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  // Notification list item
  const renderNotification = (notification: Notification) => (
    <List.Item
      key={notification.id}
      className={`notification-item ${!notification.read ? 'unread' : ''}`}
      onClick={() => {
        markAsRead(notification.id);
        if (notification.actionUrl) {
          navigate(notification.actionUrl);
          setVisible(false);
        }
      }}
      actions={[
        <Tooltip title={notification.read ? 'Okunmadı olarak işaretle' : 'Okundu olarak işaretle'}>
          <Button
            type="text"
            size="small"
            icon={notification.read ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              markAsRead(notification.id);
            }}
          />
        </Tooltip>,
        <Tooltip title="Sil">
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              deleteNotification(notification.id);
            }}
          />
        </Tooltip>,
      ]}
    >
      <List.Item.Meta
        avatar={
          notification.avatar ? (
            <Avatar src={notification.avatar} />
          ) : (
            <Avatar icon={getNotificationIcon(notification)} className="notification-avatar" />
          )
        }
        title={
          <Space>
            <span className="notification-title">{notification.title}</span>
            {notification.priority && (
              <Tag color={getPriorityColor(notification.priority)} className="priority-tag">
                {notification.priority === 'urgent' ? 'Acil' : 
                 notification.priority === 'high' ? 'Yüksek' :
                 notification.priority === 'medium' ? 'Orta' : 'Düşük'}
              </Tag>
            )}
          </Space>
        }
        description={
          <div className="notification-content">
            <p className="notification-description">{notification.description}</p>
            <div className="notification-meta">
              <span className="notification-time">
                <ClockCircleOutlined /> {formatTime(notification.timestamp)}
              </span>
              {notification.sender && (
                <span className="notification-sender">• {notification.sender}</span>
              )}
            </div>
          </div>
        }
      />
    </List.Item>
  );

  // Dropdown content
  const dropdownContent = (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notification-header">
        <h3>Bildirimler</h3>
        <Space>
          {unreadCount > 0 && (
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined />}
              onClick={markAllAsRead}
            >
              Tümünü Okundu İşaretle
            </Button>
          )}
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={clearAll}
          >
            Tümünü Temizle
          </Button>
        </Space>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="notification-tabs"
        size="small"
      >
        <TabPane 
          tab={
            <span>
              Tümü
              {notifications.length > 0 && (
                <Badge count={notifications.length} className="tab-badge" />
              )}
            </span>
          } 
          key="all" 
        />
        <TabPane 
          tab={
            <span>
              Okunmamış
              {unreadCount > 0 && (
                <Badge count={unreadCount} className="tab-badge" status="error" />
              )}
            </span>
          } 
          key="unread" 
        />
        <TabPane tab="Mesajlar" key="messages" />
        <TabPane tab="Sistem" key="system" />
      </Tabs>

      <div className="notification-list">
        {loading ? (
          <div className="notification-loading">
            <Spin tip="Yükleniyor..." />
          </div>
        ) : getFilteredNotifications().length > 0 ? (
          <List
            dataSource={getFilteredNotifications()}
            renderItem={renderNotification}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              activeTab === 'unread' 
                ? 'Okunmamış bildirim yok' 
                : 'Bildirim yok'
            }
            className="notification-empty"
          />
        )}
      </div>

      <div className="notification-footer">
        <Button 
          type="link" 
          block
          onClick={() => {
            navigate('/master/notifications');
            setVisible(false);
          }}
        >
          Tüm Bildirimleri Görüntüle
        </Button>
      </div>
    </div>
  );

  return (
    <Dropdown
      trigger={['click']}
      open={visible}
      onOpenChange={setVisible}
      dropdownRender={() => dropdownContent}
      placement="bottomRight"
      overlayClassName="notification-dropdown-overlay"
      getPopupContainer={() => document.body}
    >
      <Badge 
        count={unreadCount} 
        dot={unreadUrgent > 0}
        offset={[-2, 2]}
      >
        <Button
          type="text"
          icon={
            visible ? (
              <BellFilled className={`bell-icon ${animateBell ? 'bell-animate' : ''}`} />
            ) : (
              <BellOutlined className={`bell-icon ${animateBell ? 'bell-animate' : ''}`} />
            )
          }
          className="notification-bell-btn"
        />
      </Badge>
    </Dropdown>
  );
};