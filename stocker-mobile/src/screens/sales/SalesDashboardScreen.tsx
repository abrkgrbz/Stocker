import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ViewStyle,
    TextStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '../../stores/authStore';
import { apiService } from '../../services/api';

const { width } = Dimensions.get('window');

export default function SalesDashboardScreen({ navigation }: any) {
    const { colors, theme } = useTheme();
    const { user } = useAuthStore();
    const [stats, setStats] = React.useState({
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        activeQuotes: 0
    });
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await apiService.sales.getDashboardStats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load sales stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        {
            id: 'new_quote',
            title: 'Yeni Teklif',
            icon: 'document-text-outline',
            color: '#3b82f6',
            path: 'CreateQuote'
        },
        {
            id: 'new_order',
            title: 'Yeni Sipariş',
            icon: 'cart-outline',
            color: '#10b981',
            path: 'CreateOrder'
        },
        {
            id: 'new_invoice',
            title: 'Fatura Kes',
            icon: 'receipt-outline',
            color: '#f59e0b',
            path: 'CreateInvoice'
        },
        {
            id: 'customers',
            title: 'Müşteriler',
            icon: 'people-outline',
            color: '#8b5cf6',
            path: 'CustomerList'
        }
    ];

    const menuItems = [
        {
            id: 'quotes',
            title: 'Teklifler',
            subtitle: 'Bekleyen ve onaylanan teklifler',
            icon: 'document-text',
            color: '#3b82f6',
            path: 'QuoteList',
            count: stats.activeQuotes
        },
        {
            id: 'orders',
            title: 'Siparişler',
            subtitle: 'Müşteri siparişleri ve durumları',
            icon: 'cart',
            color: '#10b981',
            path: 'OrderList',
            count: stats.pendingOrders
        },
        {
            id: 'invoices',
            title: 'Faturalar',
            subtitle: 'Kesilen ve bekleyen faturalar',
            icon: 'receipt',
            color: '#f59e0b',
            path: 'InvoiceList',
            count: 0
        }
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {theme === 'dark' ? (
                <LinearGradient
                    colors={['#10b981', '#064e3b']} // Emerald gradient for Sales
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFill, { opacity: 0.15 }]}
                />
            ) : null}

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : colors.surface }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Satış Yönetimi</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Stats Cards */}
                    <Animated.View
                        entering={FadeInDown.delay(100).duration(600)}
                        style={styles.statsContainer}
                    >
                        <View style={[styles.statCard, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : colors.surface, borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : colors.surfaceLight }]}>
                            <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                                <Ionicons name="cash-outline" size={24} color="#10b981" />
                            </View>
                            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                                ₺{stats.totalRevenue.toLocaleString('tr-TR')}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Toplam Ciro</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : colors.surface, borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : colors.surfaceLight }]}>
                            <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                                <Ionicons name="cart-outline" size={24} color="#3b82f6" />
                            </View>
                            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.totalOrders}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Toplam Sipariş</Text>
                        </View>
                    </Animated.View>

                    {/* Quick Actions */}
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Hızlı İşlemler</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.quickActionsContainer}
                        contentContainerStyle={{ paddingHorizontal: spacing.l }}
                    >
                        {quickActions.map((action, index) => (
                            <Animated.View
                                key={action.id}
                                entering={FadeInDown.delay(200 + (index * 50)).duration(600)}
                            >
                                <TouchableOpacity
                                    style={[styles.actionCard, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : colors.surface, borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : colors.surfaceLight }]}
                                    onPress={() => {
                                        if (action.path === 'CustomerList') {
                                            navigation.navigate('CustomerList');
                                        } else {
                                            // navigation.navigate(action.path);
                                            alert('Yakında eklenecek');
                                        }
                                    }}
                                >
                                    <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                                        <Ionicons name={action.icon as any} size={24} color={action.color} />
                                    </View>
                                    <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>{action.title}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </ScrollView>

                    {/* Menu Items */}
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Modüller</Text>
                    <View style={styles.menuContainer}>
                        {menuItems.map((item, index) => (
                            <Animated.View
                                key={item.id}
                                entering={FadeInDown.delay(400 + (index * 50)).duration(600)}
                            >
                                <TouchableOpacity
                                    style={[styles.menuItem, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : colors.surface, borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : colors.surfaceLight }]}
                                    onPress={() => navigation.navigate(item.path)}
                                >
                                    <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                                        <Ionicons name={item.icon as any} size={24} color={item.color} />
                                    </View>
                                    <View style={styles.menuContent}>
                                        <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                                        <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                                    </View>
                                    {item.count > 0 && (
                                        <View style={[styles.badge, { backgroundColor: item.color }]}>
                                            <Text style={styles.badgeText}>{item.count}</Text>
                                        </View>
                                    )}
                                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    } as ViewStyle,
    safeArea: {
        flex: 1,
    } as ViewStyle,
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.m,
    } as ViewStyle,
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    } as TextStyle,
    content: {
        paddingBottom: spacing.xl,
    } as ViewStyle,
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.l,
        gap: spacing.m,
        marginTop: spacing.m,
        marginBottom: spacing.l,
    } as ViewStyle,
    statCard: {
        flex: 1,
        borderRadius: 16,
        padding: spacing.m,
        borderWidth: 1,
    } as ViewStyle,
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.s,
    } as ViewStyle,
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    } as TextStyle,
    statLabel: {
        fontSize: 12,
    } as TextStyle,
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: spacing.l,
        marginBottom: spacing.m,
        marginTop: spacing.s,
    } as TextStyle,
    quickActionsContainer: {
        marginBottom: spacing.l,
    } as ViewStyle,
    actionCard: {
        width: 100,
        height: 100,
        borderRadius: 16,
        padding: spacing.m,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
        borderWidth: 1,
    } as ViewStyle,
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.s,
    } as ViewStyle,
    actionTitle: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    } as TextStyle,
    menuContainer: {
        paddingHorizontal: spacing.l,
        gap: spacing.m,
    } as ViewStyle,
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: 16,
        borderWidth: 1,
    } as ViewStyle,
    menuIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    } as ViewStyle,
    menuContent: {
        flex: 1,
    } as ViewStyle,
    menuTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    } as TextStyle,
    menuSubtitle: {
        fontSize: 12,
    } as TextStyle,
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: spacing.s,
    } as ViewStyle,
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    } as TextStyle,
});
