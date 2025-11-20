import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/stores/authStore';

import { SignalRProvider } from './src/services/signalr/SignalRContext';

export default function App() {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <SafeAreaProvider>
            <StatusBar style="light" />
            <SignalRProvider>
                <AppNavigator />
            </SignalRProvider>
        </SafeAreaProvider>
    );
}
