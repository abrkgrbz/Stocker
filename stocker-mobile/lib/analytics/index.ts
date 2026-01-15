/**
 * Analytics Service for Stocker Mobile
 *
 * Provides event tracking, screen analytics, and user behavior insights.
 * Supports multiple analytics providers (Mixpanel, Amplitude, custom backend).
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// ============================================
// Types
// ============================================

export type AnalyticsProvider = 'mixpanel' | 'amplitude' | 'custom' | 'console';

export interface AnalyticsConfig {
    /** Analytics provider to use */
    provider: AnalyticsProvider;
    /** API key for the provider */
    apiKey?: string;
    /** Custom endpoint for backend analytics */
    endpoint?: string;
    /** Enable debug logging */
    debug?: boolean;
    /** Batch events before sending */
    batchSize?: number;
    /** Flush interval in milliseconds */
    flushInterval?: number;
    /** Enable automatic screen tracking */
    autoTrackScreens?: boolean;
    /** Enable automatic error tracking */
    autoTrackErrors?: boolean;
}

export interface UserProperties {
    userId?: string;
    email?: string;
    tenantId?: string;
    tenantCode?: string;
    role?: string;
    plan?: string;
    [key: string]: string | number | boolean | undefined;
}

export interface EventProperties {
    [key: string]: string | number | boolean | null | undefined;
}

export interface ScreenViewEvent {
    screenName: string;
    screenClass?: string;
    previousScreen?: string;
    timestamp: number;
    duration?: number;
}

export interface AnalyticsEvent {
    name: string;
    properties?: EventProperties;
    timestamp: number;
    sessionId: string;
    userId?: string;
}

// ============================================
// Constants
// ============================================

const STORAGE_KEY_SESSION = '@analytics_session';
const STORAGE_KEY_QUEUE = '@analytics_queue';
const STORAGE_KEY_USER = '@analytics_user';
const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_FLUSH_INTERVAL = 30000; // 30 seconds

// ============================================
// Event Names - Standardized
// ============================================

export const AnalyticsEvents = {
    // Auth Events
    AUTH_LOGIN_START: 'auth_login_start',
    AUTH_LOGIN_SUCCESS: 'auth_login_success',
    AUTH_LOGIN_FAILURE: 'auth_login_failure',
    AUTH_LOGOUT: 'auth_logout',
    AUTH_SESSION_EXPIRED: 'auth_session_expired',
    AUTH_BIOMETRIC_ENABLED: 'auth_biometric_enabled',
    AUTH_BIOMETRIC_DISABLED: 'auth_biometric_disabled',

    // Navigation Events
    SCREEN_VIEW: 'screen_view',
    TAB_CHANGE: 'tab_change',
    MODAL_OPEN: 'modal_open',
    MODAL_CLOSE: 'modal_close',

    // CRM Events
    CUSTOMER_VIEW: 'customer_view',
    CUSTOMER_CREATE: 'customer_create',
    CUSTOMER_UPDATE: 'customer_update',
    CUSTOMER_DELETE: 'customer_delete',
    CUSTOMER_SEARCH: 'customer_search',
    CUSTOMER_FILTER: 'customer_filter',

    // Inventory Events
    PRODUCT_VIEW: 'product_view',
    PRODUCT_CREATE: 'product_create',
    PRODUCT_UPDATE: 'product_update',
    PRODUCT_DELETE: 'product_delete',
    PRODUCT_SEARCH: 'product_search',
    PRODUCT_SCAN: 'product_scan',
    STOCK_ADJUST: 'stock_adjust',

    // Order Events
    ORDER_VIEW: 'order_view',
    ORDER_CREATE_START: 'order_create_start',
    ORDER_CREATE_SUCCESS: 'order_create_success',
    ORDER_CREATE_FAILURE: 'order_create_failure',
    ORDER_STATUS_CHANGE: 'order_status_change',

    // Sync Events
    SYNC_START: 'sync_start',
    SYNC_SUCCESS: 'sync_success',
    SYNC_FAILURE: 'sync_failure',
    OFFLINE_ACTION: 'offline_action',
    OFFLINE_QUEUE_FLUSH: 'offline_queue_flush',

    // Error Events
    ERROR_API: 'error_api',
    ERROR_NETWORK: 'error_network',
    ERROR_VALIDATION: 'error_validation',
    ERROR_CRASH: 'error_crash',

    // Feature Usage
    FEATURE_USE: 'feature_use',
    EXPORT_DATA: 'export_data',
    IMPORT_DATA: 'import_data',
    REPORT_GENERATE: 'report_generate',

    // User Engagement
    APP_OPEN: 'app_open',
    APP_BACKGROUND: 'app_background',
    APP_FOREGROUND: 'app_foreground',
    SESSION_START: 'session_start',
    SESSION_END: 'session_end',
} as const;

// ============================================
// Analytics Service Class
// ============================================

class AnalyticsService {
    private config: AnalyticsConfig | null = null;
    private sessionId: string = '';
    private userId: string | null = null;
    private userProperties: UserProperties = {};
    private eventQueue: AnalyticsEvent[] = [];
    private flushTimer: ReturnType<typeof setInterval> | null = null;
    private isInitialized: boolean = false;
    private currentScreen: string | null = null;
    private screenStartTime: number | null = null;

    /**
     * Initialize the analytics service
     */
    async initialize(config: AnalyticsConfig): Promise<void> {
        if (this.isInitialized) {
            this.log('Analytics already initialized');
            return;
        }

        this.config = {
            batchSize: DEFAULT_BATCH_SIZE,
            flushInterval: DEFAULT_FLUSH_INTERVAL,
            autoTrackScreens: true,
            autoTrackErrors: true,
            debug: __DEV__,
            ...config,
        };

        // Generate or restore session
        await this.initSession();

        // Restore user from storage
        await this.restoreUser();

        // Restore queued events
        await this.restoreQueue();

        // Start flush timer
        this.startFlushTimer();

        this.isInitialized = true;
        this.log('Analytics initialized', { provider: this.config.provider });

        // Track app open
        this.track(AnalyticsEvents.APP_OPEN, {
            platform: Platform.OS,
            version: Constants.expoConfig?.version,
            buildNumber: Platform.OS === 'ios'
                ? Constants.expoConfig?.ios?.buildNumber
                : Constants.expoConfig?.android?.versionCode,
        });
    }

    /**
     * Identify user for analytics
     */
    async identify(userId: string, properties?: UserProperties): Promise<void> {
        this.userId = userId;
        this.userProperties = { userId, ...properties };

        // Persist user
        await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.userProperties));

        this.log('User identified', { userId, properties });
    }

    /**
     * Update user properties
     */
    async setUserProperties(properties: UserProperties): Promise<void> {
        this.userProperties = { ...this.userProperties, ...properties };
        await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.userProperties));
        this.log('User properties updated', properties);
    }

    /**
     * Track an event
     */
    track(eventName: string, properties?: EventProperties): void {
        if (!this.isInitialized) {
            this.log('Analytics not initialized, event queued', { eventName });
        }

        const event: AnalyticsEvent = {
            name: eventName,
            properties: {
                ...properties,
                platform: Platform.OS,
                app_version: Constants.expoConfig?.version,
            },
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userId: this.userId || undefined,
        };

        this.eventQueue.push(event);
        this.log('Event tracked', { eventName, properties });

        // Check if we should flush
        if (this.eventQueue.length >= (this.config?.batchSize || DEFAULT_BATCH_SIZE)) {
            this.flush();
        }
    }

    /**
     * Track screen view
     */
    trackScreen(screenName: string, screenClass?: string): void {
        const now = Date.now();

        // Calculate duration of previous screen
        const duration = this.screenStartTime ? now - this.screenStartTime : undefined;

        // Track screen view event
        this.track(AnalyticsEvents.SCREEN_VIEW, {
            screen_name: screenName,
            screen_class: screenClass,
            previous_screen: this.currentScreen,
            duration,
        });

        // Update current screen
        this.currentScreen = screenName;
        this.screenStartTime = now;
    }

    /**
     * Track error
     */
    trackError(error: Error, context?: EventProperties): void {
        this.track(AnalyticsEvents.ERROR_CRASH, {
            error_name: error.name,
            error_message: error.message,
            error_stack: error.stack?.substring(0, 500),
            ...context,
        });
    }

    /**
     * Track API error
     */
    trackApiError(endpoint: string, statusCode: number, errorMessage?: string): void {
        this.track(AnalyticsEvents.ERROR_API, {
            endpoint,
            status_code: statusCode,
            error_message: errorMessage,
        });
    }

    /**
     * Start a timed event
     */
    startTimedEvent(eventName: string): () => void {
        const startTime = Date.now();
        return () => {
            const duration = Date.now() - startTime;
            this.track(eventName, { duration });
        };
    }

    /**
     * Reset analytics (on logout)
     */
    async reset(): Promise<void> {
        // Track session end
        this.track(AnalyticsEvents.SESSION_END);

        // Flush remaining events
        await this.flush();

        // Clear user
        this.userId = null;
        this.userProperties = {};
        await AsyncStorage.removeItem(STORAGE_KEY_USER);

        // Generate new session
        await this.initSession();

        this.log('Analytics reset');
    }

    /**
     * Flush events to backend
     */
    async flush(): Promise<void> {
        if (this.eventQueue.length === 0) {
            return;
        }

        const events = [...this.eventQueue];
        this.eventQueue = [];

        try {
            await this.sendEvents(events);
            this.log(`Flushed ${events.length} events`);
        } catch (error) {
            // Re-queue events on failure
            this.eventQueue = [...events, ...this.eventQueue];
            await this.persistQueue();
            this.log('Flush failed, events re-queued', { error });
        }
    }

    /**
     * Get current session ID
     */
    getSessionId(): string {
        return this.sessionId;
    }

    /**
     * Get current user ID
     */
    getUserId(): string | null {
        return this.userId;
    }

    // ============================================
    // Private Methods
    // ============================================

    private async initSession(): Promise<void> {
        // Try to restore existing session
        const storedSession = await AsyncStorage.getItem(STORAGE_KEY_SESSION);

        if (storedSession) {
            const { id, timestamp } = JSON.parse(storedSession);
            // Session expires after 30 minutes of inactivity
            if (Date.now() - timestamp < 30 * 60 * 1000) {
                this.sessionId = id;
                // Update timestamp
                await this.saveSession();
                return;
            }
        }

        // Generate new session
        this.sessionId = this.generateId();
        await this.saveSession();

        // Track session start
        this.track(AnalyticsEvents.SESSION_START);
    }

    private async saveSession(): Promise<void> {
        await AsyncStorage.setItem(
            STORAGE_KEY_SESSION,
            JSON.stringify({ id: this.sessionId, timestamp: Date.now() })
        );
    }

    private async restoreUser(): Promise<void> {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEY_USER);
        if (storedUser) {
            this.userProperties = JSON.parse(storedUser);
            this.userId = this.userProperties.userId || null;
        }
    }

    private async restoreQueue(): Promise<void> {
        const storedQueue = await AsyncStorage.getItem(STORAGE_KEY_QUEUE);
        if (storedQueue) {
            this.eventQueue = JSON.parse(storedQueue);
            // Clear stored queue
            await AsyncStorage.removeItem(STORAGE_KEY_QUEUE);
        }
    }

    private async persistQueue(): Promise<void> {
        if (this.eventQueue.length > 0) {
            await AsyncStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(this.eventQueue));
        }
    }

    private startFlushTimer(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }

        this.flushTimer = setInterval(() => {
            this.flush();
        }, this.config?.flushInterval || DEFAULT_FLUSH_INTERVAL);
    }

    private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
        if (!this.config) return;

        switch (this.config.provider) {
            case 'console':
                // Just log to console (development)
                events.forEach(event => {
                    console.log('[Analytics]', event.name, event.properties);
                });
                break;

            case 'custom':
                // Send to custom backend
                if (this.config.endpoint) {
                    await fetch(this.config.endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-API-Key': this.config.apiKey || '',
                        },
                        body: JSON.stringify({
                            events,
                            user: this.userProperties,
                            sessionId: this.sessionId,
                        }),
                    });
                }
                break;

            case 'mixpanel':
                // Mixpanel integration would go here
                // For now, fall through to console
                this.log('Mixpanel not implemented, logging to console');
                events.forEach(event => {
                    console.log('[Mixpanel]', event.name, event.properties);
                });
                break;

            case 'amplitude':
                // Amplitude integration would go here
                this.log('Amplitude not implemented, logging to console');
                events.forEach(event => {
                    console.log('[Amplitude]', event.name, event.properties);
                });
                break;
        }
    }

    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }

    private log(message: string, data?: any): void {
        if (this.config?.debug || __DEV__) {
            console.log(`[Analytics] ${message}`, data || '');
        }
    }
}

// ============================================
// Singleton Instance
// ============================================

export const analytics = new AnalyticsService();

// ============================================
// React Hooks
// ============================================

import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Hook for tracking screen views
 */
export function useScreenTracking(screenName: string, screenClass?: string) {
    useEffect(() => {
        analytics.trackScreen(screenName, screenClass);
    }, [screenName, screenClass]);
}

/**
 * Hook for tracking events
 */
export function useAnalytics() {
    const track = useCallback((eventName: string, properties?: EventProperties) => {
        analytics.track(eventName, properties);
    }, []);

    const trackScreen = useCallback((screenName: string, screenClass?: string) => {
        analytics.trackScreen(screenName, screenClass);
    }, []);

    const trackError = useCallback((error: Error, context?: EventProperties) => {
        analytics.trackError(error, context);
    }, []);

    const startTimedEvent = useCallback((eventName: string) => {
        return analytics.startTimedEvent(eventName);
    }, []);

    return {
        track,
        trackScreen,
        trackError,
        startTimedEvent,
        identify: analytics.identify.bind(analytics),
        setUserProperties: analytics.setUserProperties.bind(analytics),
        reset: analytics.reset.bind(analytics),
    };
}

/**
 * Hook for tracking app state changes
 */
export function useAppStateTracking() {
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                analytics.track(AnalyticsEvents.APP_FOREGROUND);
            } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
                analytics.track(AnalyticsEvents.APP_BACKGROUND);
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);
}

/**
 * Hook for tracking timed operations
 */
export function useTimedEvent(eventName: string) {
    const endEventRef = useRef<(() => void) | null>(null);

    const startEvent = useCallback(() => {
        endEventRef.current = analytics.startTimedEvent(eventName);
    }, [eventName]);

    const endEvent = useCallback(() => {
        if (endEventRef.current) {
            endEventRef.current();
            endEventRef.current = null;
        }
    }, []);

    return { startEvent, endEvent };
}

export default analytics;
