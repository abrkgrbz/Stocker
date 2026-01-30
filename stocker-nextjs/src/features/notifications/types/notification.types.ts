export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'Information'
  | 'Success'
  | 'Warning'
  | 'Error'
  | 'Alert'
  | 'Reminder'
  | 'Update'
  | 'Announcement'
  | 'Promotion'
  | 'Security'
  | 'System';

export type NotificationCategory =
  | 'system'
  | 'inventory'
  | 'order'
  | 'customer'
  | 'finance'
  | 'user'
  | 'backup'
  | 'sales'
  | 'hr'
  | 'crm'
  | 'System'
  | 'User'
  | 'Business'
  | 'Security'
  | 'Billing'
  | 'Marketing'
  | 'Support'
  | 'Activity'
  | 'Integration'
  | 'Report';

export type NotificationPriority = 'Low' | 'Normal' | 'High' | 'Urgent' | 'Critical';

export interface Notification {
  id: string;
  title: string;
  message: string;
  description?: string;
  type: NotificationType;
  category: NotificationCategory;
  priority?: NotificationPriority;
  isRead: boolean;
  readAt?: string;
  isDismissed?: boolean;
  requiresAcknowledgment?: boolean;
  isAcknowledged?: boolean;
  iconName?: string;
  iconColor?: string;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  expiresAt?: string;
  createdBy?: string;
  tags?: string[];
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

// Helper function to map backend notification to frontend format
export function mapNotification(backendNotification: any): Notification {
  return {
    id: backendNotification.id,
    title: backendNotification.title,
    message: backendNotification.message,
    description: backendNotification.description,
    type: mapNotificationType(backendNotification.type),
    category: mapNotificationCategory(backendNotification.category),
    priority: backendNotification.priority,
    isRead: backendNotification.isRead,
    readAt: backendNotification.readAt,
    isDismissed: backendNotification.isDismissed,
    requiresAcknowledgment: backendNotification.requiresAcknowledgment,
    isAcknowledged: backendNotification.isAcknowledged,
    iconName: backendNotification.iconName,
    iconColor: backendNotification.iconColor,
    actionUrl: backendNotification.actionUrl,
    actionText: backendNotification.actionText,
    createdAt: backendNotification.createdAt,
    expiresAt: backendNotification.expiresAt,
    createdBy: backendNotification.createdBy,
    tags: backendNotification.tags,
    link: backendNotification.actionUrl, // Map actionUrl to link for backwards compatibility
    metadata: backendNotification.metadata,
  };
}

function mapNotificationType(type: string): NotificationType {
  const typeMap: Record<string, NotificationType> = {
    Information: 'info',
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
    Alert: 'warning',
    Reminder: 'info',
    Update: 'info',
    Announcement: 'info',
    Promotion: 'info',
    Security: 'warning',
    System: 'info',
  };
  return typeMap[type] || (type as NotificationType);
}

function mapNotificationCategory(category: string): NotificationCategory {
  const categoryMap: Record<string, NotificationCategory> = {
    System: 'system',
    User: 'user',
    Business: 'system',
    Security: 'system',
    Billing: 'finance',
    Marketing: 'system',
    Support: 'system',
    Activity: 'system',
    Integration: 'system',
    Report: 'system',
  };
  return categoryMap[category] || (category as NotificationCategory);
}
