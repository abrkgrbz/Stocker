import React from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    Users,
    Package,
    ShoppingCart,
    Truck,
    UserCircle,
    BarChart3,
    Settings,
    MessageSquare,
    FileText,
    Calendar,
    Bell,
    Scan,
    TrendingUp,
    Wallet,
    Building2,
    ClipboardList
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CONTAINER_PADDING = 24;
const CARD_WIDTH = (width - CONTAINER_PADDING * 2 - CARD_MARGIN * 2) / 2;

interface Module {
    id: string;
    name: string;
    description: string;
    icon: any;
    color: string;
    bgColor: string;
    route?: string;
    badge?: number;
    comingSoon?: boolean;
}

export default function ModulesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const tabBarHeight = 60 + insets.bottom;

    const modules: Module[] = [
        {
            id: 'crm',
            name: 'CRM',
            description: 'Müşteri ilişkileri yönetimi',
            icon: Users,
            color: colors.modules.crm,
            bgColor: colors.modules.crmLight,
            route: '/(dashboard)/crm',
            badge: 5
        },
        {
            id: 'inventory',
            name: 'Stok',
            description: 'Ürün ve envanter yönetimi',
            icon: Package,
            color: colors.modules.inventory,
            bgColor: colors.modules.inventoryLight,
            route: '/(dashboard)/inventory',
            badge: 3
        },
        {
            id: 'sales',
            name: 'Satış',
            description: 'Sipariş ve fatura yönetimi',
            icon: ShoppingCart,
            color: colors.modules.sales,
            bgColor: colors.modules.salesLight,
            route: '/(dashboard)/sales',
            comingSoon: true
        },
        {
            id: 'purchase',
            name: 'Satın Alma',
            description: 'Tedarikçi ve sipariş yönetimi',
            icon: Truck,
            color: colors.modules.purchase,
            bgColor: colors.modules.purchaseLight,
            route: '/(dashboard)/purchase',
            comingSoon: true
        },
        {
            id: 'hr',
            name: 'İnsan Kaynakları',
            description: 'Personel ve bordro yönetimi',
            icon: UserCircle,
            color: colors.modules.hr,
            bgColor: colors.modules.hrLight,
            route: '/(dashboard)/hr',
            comingSoon: true
        },
        {
            id: 'reports',
            name: 'Raporlar',
            description: 'Analitik ve raporlama',
            icon: BarChart3,
            color: colors.modules.reports,
            bgColor: colors.modules.reportsLight,
            route: '/(dashboard)/reports',
            comingSoon: true
        },
        {
            id: 'scanner',
            name: 'Barkod Tarama',
            description: 'Hızlı ürün tarama',
            icon: Scan,
            color: colors.semantic.success,
            bgColor: colors.semantic.successLight,
            route: '/(dashboard)/inventory/scanner'
        },
        {
            id: 'calendar',
            name: 'Takvim',
            description: 'Etkinlik ve hatırlatıcılar',
            icon: Calendar,
            color: colors.semantic.info,
            bgColor: colors.semantic.infoLight,
            route: '/(dashboard)/calendar',
            comingSoon: true
        }
    ];

    const quickActions = [
        {
            id: 'new-customer',
            name: 'Yeni Müşteri',
            icon: Users,
            color: colors.modules.crm,
            route: '/(dashboard)/crm/add'
        },
        {
            id: 'new-order',
            name: 'Yeni Sipariş',
            icon: ClipboardList,
            color: colors.modules.sales,
            route: '/(dashboard)/sales/create'
        },
        {
            id: 'stock-count',
            name: 'Stok Sayım',
            icon: Package,
            color: colors.modules.inventory,
            route: '/(dashboard)/inventory/stock-count'
        },
        {
            id: 'scanner',
            name: 'Barkod Tara',
            icon: Scan,
            color: colors.semantic.success,
            route: '/(dashboard)/inventory/scanner'
        }
    ];

    const handleModulePress = (module: Module) => {
        if (module.comingSoon) {
            // Show coming soon message - for now just log
            console.log(`${module.name} modülü yakında aktif olacak`);
            return;
        }
        if (module.route) {
            router.push(module.route as any);
        }
    };

    const ModuleCard = ({ module, index }: { module: Module; index: number }) => (
        <Animated.View
            entering={FadeInDown.duration(400).delay(100 + index * 50)}
            style={{ width: CARD_WIDTH, margin: CARD_MARGIN }}
        >
            <Pressable
                onPress={() => handleModulePress(module)}
                style={{
                    backgroundColor: colors.surface.primary,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.border.primary,
                    opacity: module.comingSoon ? 0.6 : 1
                }}
                className="active:scale-95"
            >
                {/* Badge */}
                {module.badge && !module.comingSoon && (
                    <View
                        style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            backgroundColor: colors.semantic.error,
                            borderRadius: 10,
                            minWidth: 20,
                            height: 20,
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingHorizontal: 6
                        }}
                    >
                        <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '600' }}>{module.badge}</Text>
                    </View>
                )}

                {/* Coming Soon Badge */}
                {module.comingSoon && (
                    <View
                        style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            backgroundColor: colors.semantic.warning,
                            borderRadius: 6,
                            paddingHorizontal: 6,
                            paddingVertical: 2
                        }}
                    >
                        <Text style={{ color: '#ffffff', fontSize: 9, fontWeight: '600' }}>YAKINDA</Text>
                    </View>
                )}

                {/* Icon */}
                <View
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: module.bgColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12
                    }}
                >
                    <module.icon size={24} color={module.color} />
                </View>

                {/* Title */}
                <Text
                    style={{
                        color: colors.text.primary,
                        fontSize: 15,
                        fontWeight: '600',
                        marginBottom: 4
                    }}
                >
                    {module.name}
                </Text>

                {/* Description */}
                <Text
                    style={{
                        color: colors.text.tertiary,
                        fontSize: 12
                    }}
                    numberOfLines={2}
                >
                    {module.description}
                </Text>
            </Pressable>
        </Animated.View>
    );

    const QuickActionButton = ({ action, index }: { action: typeof quickActions[0]; index: number }) => (
        <Animated.View
            entering={FadeInDown.duration(400).delay(50 + index * 30)}
        >
            <Pressable
                onPress={() => router.push(action.route as any)}
                style={{
                    alignItems: 'center',
                    marginRight: 20
                }}
            >
                <View
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        backgroundColor: colors.surface.primary,
                        borderWidth: 1,
                        borderColor: colors.border.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 8
                    }}
                >
                    <action.icon size={24} color={action.color} />
                </View>
                <Text
                    style={{
                        color: colors.text.secondary,
                        fontSize: 11,
                        fontWeight: '500',
                        textAlign: 'center',
                        maxWidth: 64
                    }}
                    numberOfLines={2}
                >
                    {action.name}
                </Text>
            </Pressable>
        </Animated.View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            {/* Header */}
            <Animated.View
                entering={FadeIn.duration(400)}
                className="px-6 py-4"
                style={{
                    backgroundColor: colors.surface.primary,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.primary
                }}
            >
                <Text style={{ color: colors.text.primary }} className="text-2xl font-bold">Modüller</Text>
                <Text style={{ color: colors.text.secondary }} className="text-sm mt-1">
                    Tüm uygulamalar ve araçlar
                </Text>
            </Animated.View>

            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: CONTAINER_PADDING - CARD_MARGIN,
                    paddingTop: 20,
                    paddingBottom: tabBarHeight + 24
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Quick Actions */}
                <Animated.View entering={FadeIn.duration(400).delay(50)}>
                    <Text
                        style={{ color: colors.text.tertiary, marginLeft: CARD_MARGIN }}
                        className="text-xs font-bold uppercase mb-4 tracking-wider"
                    >
                        Hızlı Erişim
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingLeft: CARD_MARGIN, paddingRight: 8 }}
                        className="mb-6"
                    >
                        {quickActions.map((action, index) => (
                            <QuickActionButton key={action.id} action={action} index={index} />
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* All Modules */}
                <Text
                    style={{ color: colors.text.tertiary, marginLeft: CARD_MARGIN }}
                    className="text-xs font-bold uppercase mb-3 tracking-wider"
                >
                    Tüm Modüller
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {modules.map((module, index) => (
                        <ModuleCard key={module.id} module={module} index={index} />
                    ))}
                </View>

                {/* Info Card */}
                <Animated.View
                    entering={FadeInDown.duration(400).delay(500)}
                    style={{ margin: CARD_MARGIN, marginTop: 16 }}
                >
                    <View
                        style={{
                            backgroundColor: colors.semantic.infoLight,
                            borderRadius: 12,
                            padding: 16,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}
                    >
                        <View
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 10,
                                backgroundColor: colors.semantic.info,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12
                            }}
                        >
                            <Bell size={20} color="#ffffff" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text.primary, fontWeight: '600', fontSize: 14 }}>
                                Yeni modüller geliyor!
                            </Text>
                            <Text style={{ color: colors.text.secondary, fontSize: 12, marginTop: 2 }}>
                                Satış, Satın Alma ve İK modülleri yakında aktif olacak.
                            </Text>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
