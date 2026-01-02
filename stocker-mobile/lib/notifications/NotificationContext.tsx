import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { notificationService } from './NotificationService';
import {
    StoredNotification,
    NotificationPreferences,
    DEFAULT_NOTIFICATION_PREFERENCES,
} from './types';

interface NotificationContextType {
    // State
    notifications: StoredNotification[];
    unreadCount: number;
    preferences: NotificationPreferences;
    isInitialized: boolean;
    pushToken: string | null;

    // Actions
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
    updatePreferences: (updates: Partial<NotificationPreferences>) => Promise<void>;
    refreshNotifications: () => Promise<void>;
    scheduleReminder: (title: string, body: string, date: Date) => Promise<string>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [notifications, setNotifications] = useState<StoredNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
    const [isInitialized, setIsInitialized] = useState(false);
    const [pushToken, setPushToken] = useState<string | null>(null);

    // Initialize notification service
    useEffect(() => {
        const init = async () => {
            try {
                await notificationService.initialize();

                // Load initial data
                const [storedNotifications, count, prefs, token] = await Promise.all([
                    notificationService.getNotifications(),
                    notificationService.getUnreadCount(),
                    notificationService.getPreferences(),
                    notificationService.getPushToken(),
                ]);

                setNotifications(storedNotifications);
                setUnreadCount(count);
                setPreferences(prefs);
                setPushToken(token);

                // Set up callbacks
                notificationService.setOnNotificationReceived((notification) => {
                    setNotifications((prev) => [notification, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                });

                notificationService.setOnNotificationTapped((notification) => {
                    // Navigate to the relevant screen if route is provided
                    if (notification.route) {
                        router.push({
                            pathname: notification.route as any,
                            params: notification.routeParams,
                        });
                    }
                });

                setIsInitialized(true);
                console.log('🔔 Notification context initialized');
            } catch (error) {
                console.error('❌ Failed to initialize notifications:', error);
                setIsInitialized(true); // Still mark as initialized to prevent blocking
            }
        };

        init();

        return () => {
            notificationService.cleanup();
        };
    }, [router]);

    // Refresh notifications from storage
    const refreshNotifications = useCallback(async () => {
        const [storedNotifications, count] = await Promise.all([
            notificationService.getNotifications(),
            notificationService.getUnreadCount(),
        ]);
        setNotifications(storedNotifications);
        setUnreadCount(count);
    }, []);

    // Mark single notification as read
    const markAsRead = useCallback(async (id: string) => {
        await notificationService.markAsRead(id);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    }, []);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        await notificationService.markAllAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
    }, []);

    // Delete notification
    const deleteNotification = useCallback(async (id: string) => {
        const notification = notifications.find((n) => n.id === id);
        await notificationService.deleteNotification(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (notification && !notification.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
    }, [notifications]);

    // Clear all notifications
    const clearAll = useCallback(async () => {
        await notificationService.clearAllNotifications();
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    // Update preferences
    const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
        await notificationService.updatePreferences(updates);
        setPreferences((prev) => ({ ...prev, ...updates }));
    }, []);

    // Schedule a reminder notification
    const scheduleReminder = useCallback(async (title: string, body: string, date: Date): Promise<string> => {
        const trigger: Notifications.DateTriggerInput = {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date,
        };
        return notificationService.scheduleLocalNotification(title, body, { type: 'task_due' }, trigger);
    }, []);

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        preferences,
        isInitialized,
        pushToken,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        updatePreferences,
        refreshNotifications,
        scheduleReminder,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications(): NotificationContextType {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
