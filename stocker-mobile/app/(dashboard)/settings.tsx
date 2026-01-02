import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    User,
    Building2,
    Bell,
    Shield,
    Palette,
    Globe,
    HelpCircle,
    LogOut,
    ChevronRight,
    Mail,
    Phone,
    Lock,
    Fingerprint,
    Moon
} from 'lucide-react-native';
import { authStorage, User as UserType, Tenant } from '@/lib/auth-store';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { useTheme } from '@/lib/theme';
import { useNotifications } from '@/lib/notifications';

export default function SettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDark, toggleTheme } = useTheme();
    const { preferences, updatePreferences } = useNotifications();
    const [user, setUser] = useState<UserType | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(false);

    // Tab bar height for scroll padding
    const tabBarHeight = 60 + insets.bottom;

    // Settings states
    const [biometricAuth, setBiometricAuth] = useState(false);

    const handleNotificationToggle = async (value: boolean) => {
        await updatePreferences({ enabled: value });
    };

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const state = await authStorage.getAuthState();
            setUser(state.user);
            setTenant(state.tenant);
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Çıkış Yap',
            'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            console.log('🚪 Çıkış yapılıyor...');
                            await authStorage.clearAll();
                            console.log('✅ Auth state temizlendi');
                            // Navigate to login screen and reset stack
                            router.replace('/(auth)/login');
                        } catch (error) {
                            console.error('❌ Logout error:', error);
                            Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const getInitials = (name: string | undefined) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const SettingItem = ({
        icon: Icon,
        iconColor,
        iconBgColor,
        title,
        subtitle,
        onPress,
        rightElement,
        isLast = false
    }: {
        icon: any;
        iconColor: string;
        iconBgColor: string;
        title: string;
        subtitle?: string;
        onPress?: () => void;
        rightElement?: React.ReactNode;
        isLast?: boolean;
    }) => (
        <Pressable
            onPress={onPress}
            className="flex-row items-center py-4"
            style={!isLast ? { borderBottomWidth: 1, borderBottomColor: colors.border.primary } : undefined}
            disabled={!onPress && !rightElement}
        >
            <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: iconBgColor }}
            >
                <Icon size={20} color={iconColor} />
            </View>
            <View className="flex-1">
                <Text style={{ color: colors.text.primary }} className="font-medium">{title}</Text>
                {subtitle && <Text style={{ color: colors.text.secondary }} className="text-xs mt-0.5">{subtitle}</Text>}
            </View>
            {rightElement || (onPress && <ChevronRight size={20} color={colors.text.tertiary} />)}
        </Pressable>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            {/* Header */}
            <Animated.View
                entering={FadeIn.duration(400)}
                className="px-6 py-4"
                style={{ backgroundColor: colors.surface.primary, borderBottomWidth: 1, borderBottomColor: colors.border.primary }}
            >
                <Text style={{ color: colors.text.primary }} className="text-2xl font-bold">Ayarlar</Text>
            </Animated.View>

            <ScrollView
                contentContainerStyle={{ padding: 24, paddingBottom: tabBarHeight + 24 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <Animated.View entering={FadeInDown.duration(500).delay(100)}>
                    <Pressable
                        onPress={() => router.push('/(dashboard)/profile' as any)}
                        className="rounded-2xl p-5 mb-6"
                        style={{ backgroundColor: colors.surface.primary, borderWidth: 1, borderColor: colors.border.primary }}
                    >
                        <View className="flex-row items-center">
                            <View
                                className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                                style={{ backgroundColor: colors.brand.primary }}
                            >
                                <Text style={{ color: colors.text.inverse }} className="text-xl font-bold">{getInitials(user?.name)}</Text>
                            </View>
                            <View className="flex-1">
                                <Text style={{ color: colors.text.primary }} className="text-lg font-bold">{user?.name || 'Kullanıcı'}</Text>
                                <Text style={{ color: colors.text.secondary }} className="text-sm">{user?.email}</Text>
                                {user?.role && (
                                    <View className="mt-1 px-2 py-0.5 rounded self-start" style={{ backgroundColor: colors.background.tertiary }}>
                                        <Text style={{ color: colors.text.secondary }} className="text-xs font-medium">{user.role}</Text>
                                    </View>
                                )}
                            </View>
                            <ChevronRight size={20} color={colors.text.tertiary} />
                        </View>
                    </Pressable>
                </Animated.View>

                {/* Tenant Card */}
                {tenant && (
                    <Animated.View entering={FadeInDown.duration(500).delay(150)}>
                        <Pressable
                            className="rounded-2xl p-5 mb-6"
                            style={{ backgroundColor: colors.brand.primary }}
                        >
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                    <Building2 size={24} color={colors.text.inverse} />
                                </View>
                                <View className="flex-1">
                                    <Text style={{ color: colors.text.tertiary }} className="text-xs font-medium">Çalışma Alanı</Text>
                                    <Text style={{ color: colors.text.inverse }} className="text-lg font-bold">{tenant.name}</Text>
                                    <Text style={{ color: colors.text.tertiary }} className="text-sm">{tenant.code}.stoocker.app</Text>
                                </View>
                            </View>
                        </Pressable>
                    </Animated.View>
                )}

                {/* Account Settings */}
                <Animated.View entering={FadeInDown.duration(500).delay(200)}>
                    <Text style={{ color: colors.text.tertiary }} className="text-xs font-bold uppercase mb-3 tracking-wider">Hesap</Text>
                    <View className="rounded-xl px-4 mb-6" style={{ backgroundColor: colors.surface.primary, borderWidth: 1, borderColor: colors.border.primary }}>
                        <SettingItem
                            icon={User}
                            iconColor="#2563eb"
                            iconBgColor="#dbeafe"
                            title="Profil Bilgileri"
                            subtitle="Ad, soyad, telefon"
                            onPress={() => router.push('/(dashboard)/profile' as any)}
                        />
                        <SettingItem
                            icon={Mail}
                            iconColor="#059669"
                            iconBgColor="#d1fae5"
                            title="E-posta Adresi"
                            subtitle={user?.email}
                            onPress={() => { }}
                        />
                        <SettingItem
                            icon={Lock}
                            iconColor="#d97706"
                            iconBgColor="#fef3c7"
                            title="Şifre Değiştir"
                            subtitle="Son değişiklik: 30 gün önce"
                            onPress={() => { }}
                            isLast
                        />
                    </View>
                </Animated.View>

                {/* Preferences */}
                <Animated.View entering={FadeInDown.duration(500).delay(250)}>
                    <Text style={{ color: colors.text.tertiary }} className="text-xs font-bold uppercase mb-3 tracking-wider">Tercihler</Text>
                    <View className="rounded-xl px-4 mb-6" style={{ backgroundColor: colors.surface.primary, borderWidth: 1, borderColor: colors.border.primary }}>
                        <SettingItem
                            icon={Bell}
                            iconColor={colors.modules.purchase}
                            iconBgColor={colors.modules.purchaseLight}
                            title="Bildirimler"
                            subtitle={preferences.enabled ? 'Açık' : 'Kapalı'}
                            rightElement={
                                <Switch
                                    value={preferences.enabled}
                                    onValueChange={handleNotificationToggle}
                                    trackColor={{ false: colors.border.primary, true: colors.brand.primary }}
                                    thumbColor="#ffffff"
                                />
                            }
                        />
                        <SettingItem
                            icon={Moon}
                            iconColor={colors.text.secondary}
                            iconBgColor={colors.background.tertiary}
                            title="Karanlık Mod"
                            subtitle={isDark ? 'Açık' : 'Kapalı'}
                            rightElement={
                                <Switch
                                    value={isDark}
                                    onValueChange={toggleTheme}
                                    trackColor={{ false: colors.border.primary, true: colors.brand.primary }}
                                    thumbColor="#ffffff"
                                />
                            }
                        />
                        <SettingItem
                            icon={Globe}
                            iconColor={colors.modules.reports}
                            iconBgColor={colors.modules.reportsLight}
                            title="Dil"
                            subtitle="Türkçe"
                            onPress={() => { }}
                            isLast
                        />
                    </View>
                </Animated.View>

                {/* Security */}
                <Animated.View entering={FadeInDown.duration(500).delay(300)}>
                    <Text style={{ color: colors.text.tertiary }} className="text-xs font-bold uppercase mb-3 tracking-wider">Güvenlik</Text>
                    <View className="rounded-xl px-4 mb-6" style={{ backgroundColor: colors.surface.primary, borderWidth: 1, borderColor: colors.border.primary }}>
                        <SettingItem
                            icon={Fingerprint}
                            iconColor={colors.modules.hr}
                            iconBgColor={colors.modules.hrLight}
                            title="Biyometrik Giriş"
                            subtitle={biometricAuth ? 'Açık' : 'Kapalı'}
                            rightElement={
                                <Switch
                                    value={biometricAuth}
                                    onValueChange={setBiometricAuth}
                                    trackColor={{ false: colors.border.primary, true: colors.brand.primary }}
                                    thumbColor="#ffffff"
                                />
                            }
                        />
                        <SettingItem
                            icon={Shield}
                            iconColor={colors.semantic.success}
                            iconBgColor={colors.semantic.successLight}
                            title="İki Faktörlü Doğrulama"
                            subtitle="Ayarla"
                            onPress={() => { }}
                            isLast
                        />
                    </View>
                </Animated.View>

                {/* Support */}
                <Animated.View entering={FadeInDown.duration(500).delay(350)}>
                    <Text style={{ color: colors.text.tertiary }} className="text-xs font-bold uppercase mb-3 tracking-wider">Destek</Text>
                    <View className="rounded-xl px-4 mb-6" style={{ backgroundColor: colors.surface.primary, borderWidth: 1, borderColor: colors.border.primary }}>
                        <SettingItem
                            icon={HelpCircle}
                            iconColor={colors.text.secondary}
                            iconBgColor={colors.background.tertiary}
                            title="Yardım Merkezi"
                            onPress={() => { }}
                        />
                        <SettingItem
                            icon={Phone}
                            iconColor={colors.text.secondary}
                            iconBgColor={colors.background.tertiary}
                            title="Bize Ulaşın"
                            subtitle="destek@stoocker.app"
                            onPress={() => { }}
                            isLast
                        />
                    </View>
                </Animated.View>

                {/* Logout Button */}
                <Animated.View entering={FadeInDown.duration(500).delay(400)}>
                    <AnimatedButton
                        title="Çıkış Yap"
                        variant="danger"
                        loading={loading}
                        onPress={handleLogout}
                        icon={<LogOut size={20} color="#dc2626" />}
                    />
                </Animated.View>

                {/* App Version */}
                <Animated.View
                    entering={FadeInDown.duration(500).delay(450)}
                    className="mt-8 items-center"
                >
                    <Text style={{ color: colors.text.tertiary }} className="text-sm">Stoocker Mobile</Text>
                    <Text style={{ color: colors.text.tertiary, opacity: 0.7 }} className="text-xs">Versiyon 1.0.0</Text>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
