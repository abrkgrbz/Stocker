/**
 * Analytics Provider Component
 *
 * Initializes analytics and provides context for tracking throughout the app.
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { analytics, useAppStateTracking, AnalyticsConfig } from './index';

interface AnalyticsContextValue {
    isInitialized: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextValue>({ isInitialized: false });

interface AnalyticsProviderProps {
    children: ReactNode;
    config?: Partial<AnalyticsConfig>;
}

/**
 * Analytics Provider
 *
 * Wrap your app root with this provider to enable analytics tracking.
 */
export function AnalyticsProvider({ children, config }: AnalyticsProviderProps) {
    const [isInitialized, setIsInitialized] = React.useState(false);

    // Initialize analytics on mount
    useEffect(() => {
        const initAnalytics = async () => {
            try {
                await analytics.initialize({
                    provider: __DEV__ ? 'console' : 'custom',
                    endpoint: process.env.EXPO_PUBLIC_ANALYTICS_ENDPOINT,
                    apiKey: process.env.EXPO_PUBLIC_ANALYTICS_API_KEY,
                    debug: __DEV__,
                    autoTrackScreens: true,
                    autoTrackErrors: true,
                    ...config,
                });
                setIsInitialized(true);
            } catch (error) {
                console.error('Failed to initialize analytics:', error);
            }
        };

        initAnalytics();

        // Flush events on unmount
        return () => {
            analytics.flush();
        };
    }, [config]);

    // Track app state changes (foreground/background)
    useAppStateTracking();

    return (
        <AnalyticsContext.Provider value={{ isInitialized }}>
            {children}
        </AnalyticsContext.Provider>
    );
}

/**
 * Hook to access analytics context
 */
export function useAnalyticsContext() {
    return useContext(AnalyticsContext);
}

export default AnalyticsProvider;
