import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { ThemeProvider, useTheme } from '@/lib/theme';
import { SyncProvider } from '@/lib/sync';
import { NotificationProvider } from '@/lib/notifications';
import { ToastProvider } from '@/components/ui';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data freshness - 5 minutes before considered stale
            staleTime: 5 * 60 * 1000,
            // Keep unused data in cache for 30 minutes
            gcTime: 30 * 60 * 1000,
            // Retry failed requests up to 2 times
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Don't refetch on window focus for mobile (reduces API calls)
            refetchOnWindowFocus: false,
            // Don't refetch on reconnect automatically
            refetchOnReconnect: 'always',
            // Keep previous data while loading new data
            placeholderData: (prev: unknown) => prev,
        },
        mutations: {
            // Retry mutations once
            retry: 1,
        },
    },
});

function AppContent() {
    const { colors, isDark } = useTheme();

    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background.primary },
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(dashboard)" />
                <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style={isDark ? 'light' : 'dark'} />
        </>
    );
}

export default function RootLayout() {
    const [loaded] = useFonts({
        // Add your fonts here if needed
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <ToastProvider>
                        <SyncProvider>
                            <NotificationProvider>
                                <AppContent />
                            </NotificationProvider>
                        </SyncProvider>
                    </ToastProvider>
                </ThemeProvider>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}
