import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  actionLabel?: string;
  category?: 'system' | 'tenant' | 'payment' | 'security' | 'performance';
  metadata?: Record<string, any>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  getNotificationsByCategory: (category: string) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('master_notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    }

    // Simüle edilmiş gerçek zamanlı bildirimler
    const interval = setInterval(() => {
      const random = Math.random();
      if (random < 0.1) { // %10 şans
        addMockNotification();
      }
    }, 30000); // 30 saniyede bir kontrol

    return () => clearInterval(interval);
  }, []);

  // Save to localStorage when notifications change
  useEffect(() => {
    localStorage.setItem('master_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addMockNotification = () => {
    const mockNotifications = [
      {
        type: 'info' as const,
        title: 'Yeni Kiracı Kaydı',
        message: 'ABC Şirketi sisteme kaydoldu',
        priority: 'medium' as const,
        category: 'tenant' as const
      },
      {
        type: 'warning' as const,
        title: 'Yüksek CPU Kullanımı',
        message: 'Sunucu CPU kullanımı %85 seviyesine ulaştı',
        priority: 'high' as const,
        category: 'performance' as const
      },
      {
        type: 'success' as const,
        title: 'Ödeme Alındı',
        message: 'XYZ Firması aylık ödemesini tamamladı',
        priority: 'low' as const,
        category: 'payment' as const
      },
      {
        type: 'error' as const,
        title: 'Güvenlik Uyarısı',
        message: 'Başarısız giriş denemeleri tespit edildi',
        priority: 'critical' as const,
        category: 'security' as const
      }
    ];

    const randomNotif = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
    addNotification(randomNotif);
  };

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 100)); // Max 100 bildirim

    // Kritik bildirimler için ses çal
    if (notification.priority === 'critical') {
      playNotificationSound();
    }

    // Browser notification göster (izin varsa)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: newNotification.id
      });
    }
  }, []);

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhEgYAABiAGYAYgBmAGIAZgBiAGYAYgBmAGIAZgBiA');
    audio.play().catch(e => console.log('Could not play notification sound:', e));
  };

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const getNotificationsByCategory = useCallback((category: string) => {
    return notifications.filter(n => n.category === category);
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      getNotificationsByCategory
    }}>
      {children}
    </NotificationContext.Provider>
  );
};