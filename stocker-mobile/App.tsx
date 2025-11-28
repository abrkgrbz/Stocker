import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/stores/authStore';

import { SignalRProvider } from './src/services/signalr/SignalRContext';

import { ThemeProvider } from './src/context/ThemeContext';

import { databaseService } from './src/services/db/database';
import { syncService } from './src/services/sync/SyncService';
import { OfflineIndicator } from './src/components/OfflineIndicator';
import { notificationService } from './src/services/notification/NotificationService';
import * as Notifications from 'expo-notifications';
import { useRef, useState } from 'react';
import { AlertProvider } from './src/context/AlertContext';

export default function App() {
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
    const notificationListener = useRef<Notifications.Subscription>(undefined);
    const responseListener = useRef<Notifications.Subscription>(undefined);

    useEffect(() => {
        const init = async () => {
            await databaseService.init();
            await checkAuth();

            // Register for push notifications
            const token = await notificationService.registerForPushNotificationsAsync();
            setExpoPushToken(token ?? undefined);
        };
        init();

        // Listeners
        notificationListener.current = notificationService.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = notificationService.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });

        return () => {
            if (notificationListener.current) notificationService.removeNotificationSubscription(notificationListener.current);
            if (responseListener.current) notificationService.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AlertProvider>
                    <StatusBar style="auto" />
                    <OfflineIndicator />
                    <SignalRProvider>
                        <AppNavigator />
                    </SignalRProvider>
                </AlertProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
