import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../axios';
import {
    PushNotificationToken,
    NotificationPreferences,
    StoredNotification,
    NotificationType,
    DEFAULT_NOTIFICATION_PREFERENCES,
    NOTIFICATION_CATEGORY_MAP,
} from './types';

// Storage keys
const STORAGE_KEYS = {
    PUSH_TOKEN: '@stoocker/push_token',
    PREFERENCES: '@stoocker/notification_preferences',
    NOTIFICATIONS: '@stoocker/notifications',
    UNREAD_COUNT: '@stoocker/unread_count',
};

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

class NotificationService {
    private static instance: NotificationService;
    private pushToken: string | null = null;
    private preferences: NotificationPreferences = DEFAULT_NOTIFICATION_PREFERENCES;
    private notificationListener: Notifications.EventSubscription | null = null;
    private responseListener: Notifications.EventSubscription | null = null;
    private onNotificationReceived: ((notification: StoredNotification) => void) | null = null;
    private onNotificationTapped: ((notification: StoredNotification) => void) | null = null;

    private constructor() {}

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    // Initialize the notification service
    async initialize(): Promise<void> {
        console.log('🔔 Initializing notification service...');

        // Load preferences
        await this.loadPreferences();

        // Request permissions and get token
        const token = await this.registerForPushNotifications();

        if (token) {
            this.pushToken = token;
            await this.savePushToken(token);
            await this.registerTokenWithServer(token);
        }

        // Set up listeners
        this.setupListeners();

        console.log('🔔 Notification service initialized');
    }

    // Request permissions and register for push notifications
    async registerForPushNotifications(): Promise<string | null> {
        if (!Device.isDevice) {
            console.warn('⚠️ Push notifications only work on physical devices');
            return null;
        }

        try {
            // Check existing permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // Request permissions if not granted
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('⚠️ Push notification permission not granted');
                return null;
            }

            // Get Expo push token
            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
            });

            console.log('🔔 Push token:', tokenData.data);

            // Configure Android channel
            if (Platform.OS === 'android') {
                await this.setupAndroidChannel();
            }

            return tokenData.data;
        } catch (error) {
            console.error('❌ Failed to register for push notifications:', error);
            return null;
        }
    }

    // Setup Android notification channel
    private async setupAndroidChannel(): Promise<void> {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Varsayılan',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#2563eb',
            sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('orders', {
            name: 'Siparişler',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#f59e0b',
            sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('inventory', {
            name: 'Stok Uyarıları',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 500, 250, 500],
            lightColor: '#ef4444',
            sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('hr', {
            name: 'İK Bildirimleri',
            importance: Notifications.AndroidImportance.DEFAULT,
            lightColor: '#8b5cf6',
            sound: 'default',
        });
    }

    // Setup notification listeners
    private setupListeners(): void {
        // Notification received while app is foregrounded
        this.notificationListener = Notifications.addNotificationReceivedListener(
            async (notification) => {
                console.log('🔔 Notification received:', notification);

                const stored = await this.storeNotification(notification);
                this.onNotificationReceived?.(stored);
            }
        );

        // User tapped on notification
        this.responseListener = Notifications.addNotificationResponseReceivedListener(
            async (response) => {
                console.log('🔔 Notification tapped:', response);

                const notification = response.notification;
                const data = notification.request.content.data as Record<string, unknown>;

                const stored: StoredNotification = {
                    id: notification.request.identifier,
                    type: (data?.type as NotificationType) || 'general',
                    title: notification.request.content.title || '',
                    body: notification.request.content.body || '',
                    data,
                    read: true,
                    receivedAt: new Date().toISOString(),
                    route: data?.route as string,
                    routeParams: data?.routeParams as Record<string, string>,
                };

                // Mark as read
                await this.markAsRead(stored.id);

                this.onNotificationTapped?.(stored);
            }
        );
    }

    // Store notification locally
    private async storeNotification(notification: Notifications.Notification): Promise<StoredNotification> {
        const data = notification.request.content.data as Record<string, unknown>;

        const stored: StoredNotification = {
            id: notification.request.identifier,
            type: (data?.type as NotificationType) || 'general',
            title: notification.request.content.title || '',
            body: notification.request.content.body || '',
            data,
            read: false,
            receivedAt: new Date().toISOString(),
            route: data?.route as string,
            routeParams: data?.routeParams as Record<string, string>,
        };

        // Get existing notifications
        const notifications = await this.getNotifications();

        // Add new notification at the beginning
        notifications.unshift(stored);

        // Keep only last 100 notifications
        const trimmed = notifications.slice(0, 100);

        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(trimmed));

        // Update unread count
        await this.updateUnreadCount();

        return stored;
    }

    // Get all stored notifications
    async getNotifications(): Promise<StoredNotification[]> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    // Get unread notifications
    async getUnreadNotifications(): Promise<StoredNotification[]> {
        const notifications = await this.getNotifications();
        return notifications.filter((n) => !n.read);
    }

    // Get unread count
    async getUnreadCount(): Promise<number> {
        try {
            const count = await AsyncStorage.getItem(STORAGE_KEYS.UNREAD_COUNT);
            return count ? parseInt(count, 10) : 0;
        } catch {
            return 0;
        }
    }

    // Update unread count
    private async updateUnreadCount(): Promise<void> {
        const unread = await this.getUnreadNotifications();
        await AsyncStorage.setItem(STORAGE_KEYS.UNREAD_COUNT, String(unread.length));
        await Notifications.setBadgeCountAsync(unread.length);
    }

    // Mark notification as read
    async markAsRead(id: string): Promise<void> {
        const notifications = await this.getNotifications();
        const updated = notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
        );
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
        await this.updateUnreadCount();
    }

    // Mark all notifications as read
    async markAllAsRead(): Promise<void> {
        const notifications = await this.getNotifications();
        const updated = notifications.map((n) => ({ ...n, read: true }));
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
        await this.updateUnreadCount();
    }

    // Delete notification
    async deleteNotification(id: string): Promise<void> {
        const notifications = await this.getNotifications();
        const filtered = notifications.filter((n) => n.id !== id);
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(filtered));
        await this.updateUnreadCount();
    }

    // Clear all notifications
    async clearAllNotifications(): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
        await this.updateUnreadCount();
    }

    // Save push token locally
    private async savePushToken(token: string): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
    }

    // Get saved push token
    async getPushToken(): Promise<string | null> {
        if (this.pushToken) return this.pushToken;
        return AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);
    }

    // Register token with backend server
    private async registerTokenWithServer(token: string): Promise<void> {
        try {
            const tokenData: PushNotificationToken = {
                token,
                platform: Platform.OS as 'ios' | 'android',
                deviceId: Device.deviceName || undefined,
                deviceName: Device.modelName || undefined,
            };

            await api.post('/notifications/register-device', tokenData);
            console.log('✅ Push token registered with server');
        } catch (error) {
            console.error('❌ Failed to register push token with server:', error);
        }
    }

    // Unregister device from push notifications
    async unregisterDevice(): Promise<void> {
        try {
            const token = await this.getPushToken();
            if (token) {
                await api.post('/notifications/unregister-device', { token });
                await AsyncStorage.removeItem(STORAGE_KEYS.PUSH_TOKEN);
                this.pushToken = null;
                console.log('✅ Device unregistered from push notifications');
            }
        } catch (error) {
            console.error('❌ Failed to unregister device:', error);
        }
    }

    // Load preferences from storage
    private async loadPreferences(): Promise<void> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
            if (data) {
                this.preferences = { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(data) };
            }
        } catch {
            this.preferences = DEFAULT_NOTIFICATION_PREFERENCES;
        }
    }

    // Get current preferences
    async getPreferences(): Promise<NotificationPreferences> {
        return this.preferences;
    }

    // Update preferences
    async updatePreferences(updates: Partial<NotificationPreferences>): Promise<void> {
        this.preferences = { ...this.preferences, ...updates };
        await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(this.preferences));

        // Sync with server
        try {
            await api.put('/notifications/preferences', this.preferences);
        } catch (error) {
            console.error('❌ Failed to sync preferences:', error);
        }
    }

    // Check if notification should be shown based on preferences
    shouldShowNotification(type: NotificationType): boolean {
        if (!this.preferences.enabled) return false;

        const category = NOTIFICATION_CATEGORY_MAP[type];
        if (!this.preferences.categories[category]) return false;

        // Check quiet hours
        if (this.preferences.quietHours.enabled) {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const { start, end } = this.preferences.quietHours;

            if (start < end) {
                // Normal range (e.g., 22:00 - 08:00 next day)
                if (currentTime >= start || currentTime < end) return false;
            } else {
                // Overnight range
                if (currentTime >= start && currentTime < end) return false;
            }
        }

        return true;
    }

    // Schedule a local notification
    async scheduleLocalNotification(
        title: string,
        body: string,
        data?: Record<string, unknown>,
        trigger?: Notifications.NotificationTriggerInput
    ): Promise<string> {
        return Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: this.preferences.sound ? 'default' : undefined,
            },
            trigger: trigger || null,
        });
    }

    // Cancel scheduled notification
    async cancelScheduledNotification(id: string): Promise<void> {
        await Notifications.cancelScheduledNotificationAsync(id);
    }

    // Cancel all scheduled notifications
    async cancelAllScheduledNotifications(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }

    // Set callback for notification received
    setOnNotificationReceived(callback: (notification: StoredNotification) => void): void {
        this.onNotificationReceived = callback;
    }

    // Set callback for notification tapped
    setOnNotificationTapped(callback: (notification: StoredNotification) => void): void {
        this.onNotificationTapped = callback;
    }

    // Cleanup listeners
    cleanup(): void {
        this.notificationListener?.remove();
        this.responseListener?.remove();
        this.notificationListener = null;
        this.responseListener = null;
    }
}

export const notificationService = NotificationService.getInstance();
export default notificationService;
