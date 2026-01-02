// Push Notification Types

export interface PushNotificationToken {
    token: string;
    platform: 'ios' | 'android' | 'web';
    deviceId?: string;
    deviceName?: string;
}

export interface NotificationData {
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    route?: string;
    routeParams?: Record<string, string>;
}

export type NotificationType =
    | 'order_new'
    | 'order_status'
    | 'invoice_due'
    | 'invoice_paid'
    | 'stock_low'
    | 'stock_critical'
    | 'leave_request'
    | 'leave_approved'
    | 'leave_rejected'
    | 'deal_won'
    | 'deal_lost'
    | 'customer_new'
    | 'task_assigned'
    | 'task_due'
    | 'system_alert'
    | 'general';

export interface NotificationPreferences {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    badge: boolean;
    categories: {
        orders: boolean;
        invoices: boolean;
        inventory: boolean;
        hr: boolean;
        crm: boolean;
        system: boolean;
    };
    quietHours: {
        enabled: boolean;
        start: string; // HH:mm format
        end: string;
    };
}

export interface StoredNotification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    read: boolean;
    receivedAt: string;
    route?: string;
    routeParams?: Record<string, string>;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
    enabled: true,
    sound: true,
    vibration: true,
    badge: true,
    categories: {
        orders: true,
        invoices: true,
        inventory: true,
        hr: true,
        crm: true,
        system: true,
    },
    quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
    },
};

// Notification type to category mapping
export const NOTIFICATION_CATEGORY_MAP: Record<NotificationType, keyof NotificationPreferences['categories']> = {
    order_new: 'orders',
    order_status: 'orders',
    invoice_due: 'invoices',
    invoice_paid: 'invoices',
    stock_low: 'inventory',
    stock_critical: 'inventory',
    leave_request: 'hr',
    leave_approved: 'hr',
    leave_rejected: 'hr',
    deal_won: 'crm',
    deal_lost: 'crm',
    customer_new: 'crm',
    task_assigned: 'crm',
    task_due: 'crm',
    system_alert: 'system',
    general: 'system',
};
