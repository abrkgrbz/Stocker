import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const notificationService = {
    registerForPushNotificationsAsync: async () => {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (!Device.isDevice) {
            console.log('Must use physical device for Push Notifications');
            // return; // Allow running on simulator for testing logic, but token won't work for remote push
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return null;
        }

        // Get the token
        try {
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

            if (!projectId) {
                console.log('NOTICE: EAS Project ID not found. Push notifications will be disabled in development.');
                return null;
            }

            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId,
            });
            console.log('Expo Push Token:', tokenData.data);
            return tokenData.data;
        } catch (error) {
            console.error('Error fetching push token:', error);
            return null;
        }
    },

    addNotificationReceivedListener: (callback: (notification: Notifications.Notification) => void) => {
        return Notifications.addNotificationReceivedListener(callback);
    },

    addNotificationResponseReceivedListener: (callback: (response: Notifications.NotificationResponse) => void) => {
        return Notifications.addNotificationResponseReceivedListener(callback);
    },

    removeNotificationSubscription: (subscription: Notifications.Subscription) => {
        subscription.remove();
    },

    // ... (keep existing scheduleLocalNotification)

    // Helper to schedule a local notification for testing
    scheduleLocalNotification: async (title: string, body: string, seconds: number = 1) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: { data: 'goes here' },
            },
            trigger: {
                seconds: seconds,
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            },
        });
    }
};
