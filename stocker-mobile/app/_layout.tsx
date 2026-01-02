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

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
                    <SyncProvider>
                        <NotificationProvider>
                            <AppContent />
                        </NotificationProvider>
                    </SyncProvider>
                </ThemeProvider>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}
