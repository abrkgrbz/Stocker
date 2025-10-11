export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type NotificationCategory =
  | 'system'
  | 'inventory'
  | 'order'
  | 'customer'
  | 'finance'
  | 'user';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  isRead: boolean;
  createdAt: Date;
  link?: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilter {
  type?: NotificationType;
  category?: NotificationCategory;
  isRead?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byCategory: Record<NotificationCategory, number>;
}
