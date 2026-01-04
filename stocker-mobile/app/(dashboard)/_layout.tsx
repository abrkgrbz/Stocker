import { Tabs, useRouter } from 'expo-router';
import { Home, LayoutGrid, Users, Settings } from 'lucide-react-native';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStorage, AuthState } from '@/lib/auth-store';
import { useTheme } from '@/lib/theme';
import { SessionProvider } from '@/lib/security/SessionProvider';

export default function DashboardLayout() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(true);
    const [authState, setAuthState] = useState<AuthState | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const state = await authStorage.getAuthState();
                if (!state.isAuthenticated) {
                    // Not authenticated, redirect to login
                    router.replace('/(auth)/login');
                    return;
                }
                setAuthState(state);
            } catch (error) {
                console.error('Auth check failed:', error);
                router.replace('/(auth)/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background.primary, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={colors.brand.primary} />
                <Text style={{ color: colors.text.secondary, marginTop: 16 }}>Yükleniyor...</Text>
            </View>
        );
    }

    // Calculate tab bar height based on safe area
    const tabBarHeight = 60 + insets.bottom;

    return (
        <SessionProvider
            timeoutMs={15 * 60 * 1000} // 15 minutes
            warningMs={2 * 60 * 1000}  // 2 minutes warning
            enabled={true}
        >
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: colors.tabBar.border,
                    height: tabBarHeight,
                    paddingBottom: insets.bottom + 8,
                    paddingTop: 8,
                    backgroundColor: colors.tabBar.background,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                },
                tabBarActiveTintColor: colors.tabBar.active,
                tabBarInactiveTintColor: colors.tabBar.inactive,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Ana Sayfa',
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="modules"
                options={{
                    title: 'Modüller',
                    tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Ayarlar',
                    tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
                }}
            />
            {/* Hidden screens - accessible via navigation but not shown in tab bar */}
            <Tabs.Screen
                name="crm"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
            <Tabs.Screen
                name="inventory"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
            <Tabs.Screen
                name="sales"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
            <Tabs.Screen
                name="hr"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
            <Tabs.Screen
                name="billing"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
        </Tabs>
        </SessionProvider>
    );
}
