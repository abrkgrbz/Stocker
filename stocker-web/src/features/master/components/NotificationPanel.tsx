import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import './notification-panel-modern.css';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type NotificationFilter = 'all' | 'unread' | 'system' | 'user' | 'alert';

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications();

  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // Reset selections when panel closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedNotifications([]);
      setSearchTerm('');
    }
  }, [isOpen]);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Apply filter
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'system' && notification.type !== 'system') return false;
    if (filter === 'user' && notification.type !== 'user') return false;
    if (filter === 'alert' && notification.type !== 'alert') return false;
    
    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return notification.title.toLowerCase().includes(search) ||
             notification.message.toLowerCase().includes(search);
    }
    
    return true;
  });

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const handleSelectNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    selectedNotifications.forEach(id => deleteNotification(id));
    setSelectedNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📌';
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    const colors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545'
    };
    return (
      <span 
        className="priority-badge" 
        style={{ backgroundColor: colors[priority as keyof typeof colors] }}
      >
        {priority}
      </span>
    );
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days === 1) return 'Dün';
    if (days < 7) return `${days} gün önce`;
    return new Date(date).toLocaleDateString('tr-TR');
  };

  return (
    <div className={`notification-panel ${isOpen ? 'open' : ''}`}>
      <div className="notification-header">
        <div className="header-top">
          <h3>
            Bildirimler 
            {unreadCount > 0 && (
              <span className="unread-count">{unreadCount}</span>
            )}
          </h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="header-actions">
          <input
            type="text"
            placeholder="Bildirimlerde ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="action-buttons">
            <button onClick={markAllAsRead} className="mark-all-btn">
              Tümünü okundu işaretle
            </button>
            <button onClick={clearAll} className="clear-all-btn">
              Tümünü temizle
            </button>
          </div>
        </div>

        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            Tümü ({notifications.length})
          </button>
          <button 
            className={filter === 'unread' ? 'active' : ''} 
            onClick={() => setFilter('unread')}
          >
            Okunmamış ({unreadCount})
          </button>
          <button 
            className={filter === 'system' ? 'active' : ''} 
            onClick={() => setFilter('system')}
          >
            Sistem
          </button>
          <button 
            className={filter === 'tenant' ? 'active' : ''} 
            onClick={() => setFilter('tenant')}
          >
            Kiracılar
          </button>
          <button 
            className={filter === 'payment' ? 'active' : ''} 
            onClick={() => setFilter('payment')}
          >
            Ödemeler
          </button>
          <button 
            className={filter === 'security' ? 'active' : ''} 
            onClick={() => setFilter('security')}
          >
            Güvenlik
          </button>
          <button 
            className={filter === 'performance' ? 'active' : ''} 
            onClick={() => setFilter('performance')}
          >
            Performans
          </button>
        </div>
      </div>

      <div className="notification-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <p>📭 Bildirim bulunmuyor</p>
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <div 
              key={notif.id} 
              className={`notification-item ${!notif.read ? 'unread' : ''} ${notif.priority === 'critical' ? 'critical' : ''}`}
              onClick={() => markAsRead(notif.id)}
            >
              <div className="notif-icon">{getNotificationIcon(notif.type)}</div>
              <div className="notif-content">
                <div className="notif-header">
                  <h4>{notif.title}</h4>
                  {getPriorityBadge(notif.priority)}
                </div>
                <p>{notif.message}</p>
                <div className="notif-meta">
                  <span className="notif-time">{formatTime(notif.timestamp)}</span>
                  {notif.category && (
                    <span className="notif-category">{notif.category}</span>
                  )}
                </div>
                {notif.actionUrl && (
                  <a href={notif.actionUrl} className="notif-action">
                    {notif.actionLabel || 'Detayları Gör'} →
                  </a>
                )}
              </div>
              <button 
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notif.id);
                }}
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};