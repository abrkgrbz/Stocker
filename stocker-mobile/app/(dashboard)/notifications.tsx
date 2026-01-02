import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInRight, SlideOutRight } from 'react-native-reanimated';
import {
    ArrowLeft,
    Bell,
    BellOff,
    Check,
    CheckCheck,
    Trash2,
    Package,
    ShoppingCart,
    FileText,
    Users,
    Briefcase,
    AlertTriangle,
    Info,
    X,
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useNotifications, StoredNotification, NotificationType } from '@/lib/notifications';

// Notification type config
const NOTIFICATION_ICONS: Record<NotificationType, { icon: typeof Bell; color: string; bgColor: string }> = {
    order_new: { icon: ShoppingCart, color: '#f59e0b', bgColor: '#fef3c7' },
    order_status: { icon: ShoppingCart, color: '#f59e0b', bgColor: '#fef3c7' },
    invoice_due: { icon: FileText, color: '#ef4444', bgColor: '#fee2e2' },
    invoice_paid: { icon: FileText, color: '#10b981', bgColor: '#d1fae5' },
    stock_low: { icon: Package, color: '#f59e0b', bgColor: '#fef3c7' },
    stock_critical: { icon: Package, color: '#ef4444', bgColor: '#fee2e2' },
    leave_request: { icon: Briefcase, color: '#8b5cf6', bgColor: '#ede9fe' },
    leave_approved: { icon: Briefcase, color: '#10b981', bgColor: '#d1fae5' },
    leave_rejected: { icon: Briefcase, color: '#ef4444', bgColor: '#fee2e2' },
    deal_won: { icon: Users, color: '#10b981', bgColor: '#d1fae5' },
    deal_lost: { icon: Users, color: '#ef4444', bgColor: '#fee2e2' },
    customer_new: { icon: Users, color: '#2563eb', bgColor: '#dbeafe' },
    task_assigned: { icon: Bell, color: '#2563eb', bgColor: '#dbeafe' },
    task_due: { icon: AlertTriangle, color: '#f59e0b', bgColor: '#fef3c7' },
    system_alert: { icon: AlertTriangle, color: '#ef4444', bgColor: '#fee2e2' },
    general: { icon: Info, color: '#64748b', bgColor: '#f1f5f9' },
};

export default function NotificationsScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        refreshNotifications,
    } = useNotifications();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshNotifications();
        setRefreshing(false);
    }, [refreshNotifications]);

    const handleNotificationPress = async (notification: StoredNotification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }

        // Navigate to relevant screen if route is provided
        if (notification.route) {
            router.push({
                pathname: notification.route as any,
                params: notification.routeParams,
            });
        }
    };

    const handleDeleteNotification = (id: string) => {
        Alert.alert(
            'Bildirimi Sil',
            'Bu bildirimi silmek istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: () => deleteNotification(id) },
            ]
        );
    };

    const handleClearAll = () => {
        Alert.alert(
            'Tüm Bildirimleri Sil',
            'Tüm bildirimleri silmek istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                { text: 'Tümünü Sil', style: 'destructive', onPress: clearAll },
            ]
        );
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Şimdi';
        if (diffMins < 60) return `${diffMins} dk önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;
        return date.toLocaleDateString('tr-TR');
    };

    const getIcon = (type: NotificationType) => {
        return NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.general;
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            {/* Header */}
            <Animated.View
                entering={FadeIn.duration(300)}
                style={{
                    backgroundColor: colors.surface.primary,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.primary,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Pressable
                            onPress={() => router.back()}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: colors.background.tertiary,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <ArrowLeft size={20} color={colors.text.primary} />
                        </Pressable>
                        <View>
                            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary }}>
                                Bildirimler
                            </Text>
                            {unreadCount > 0 && (
                                <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                                    {unreadCount} okunmamış
                                </Text>
                            )}
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        {unreadCount > 0 && (
                            <Pressable
                                onPress={markAllAsRead}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: colors.background.tertiary,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <CheckCheck size={20} color={colors.brand.primary} />
                            </Pressable>
                        )}
                        {notifications.length > 0 && (
                            <Pressable
                                onPress={handleClearAll}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: colors.background.tertiary,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Trash2 size={20} color={colors.semantic.error} />
                            </Pressable>
                        )}
                    </View>
                </View>
            </Animated.View>

            {notifications.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <Animated.View entering={FadeIn.duration(500)} style={{ alignItems: 'center' }}>
                        <View
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 40,
                                backgroundColor: colors.background.tertiary,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16,
                            }}
                        >
                            <BellOff size={40} color={colors.text.tertiary} />
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text.primary, marginBottom: 8 }}>
                            Bildirim Yok
                        </Text>
                        <Text style={{ fontSize: 14, color: colors.text.tertiary, textAlign: 'center' }}>
                            Yeni bildirimleriniz burada görünecek
                        </Text>
                    </Animated.View>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {notifications.map((notification, index) => {
                        const iconConfig = getIcon(notification.type);
                        const IconComponent = iconConfig.icon;

                        return (
                            <Animated.View
                                key={notification.id}
                                entering={FadeInRight.duration(300).delay(index * 50)}
                                exiting={SlideOutRight.duration(200)}
                            >
                                <Pressable
                                    onPress={() => handleNotificationPress(notification)}
                                    onLongPress={() => handleDeleteNotification(notification.id)}
                                    style={{
                                        backgroundColor: notification.read
                                            ? colors.surface.primary
                                            : colors.brand.primary + '10',
                                        borderRadius: 12,
                                        padding: 16,
                                        marginBottom: 12,
                                        borderWidth: 1,
                                        borderColor: notification.read
                                            ? colors.border.primary
                                            : colors.brand.primary + '30',
                                        flexDirection: 'row',
                                        gap: 12,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 22,
                                            backgroundColor: iconConfig.bgColor,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <IconComponent size={22} color={iconConfig.color} />
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                            <Text
                                                style={{
                                                    fontSize: 15,
                                                    fontWeight: notification.read ? '500' : '600',
                                                    color: colors.text.primary,
                                                    flex: 1,
                                                    marginRight: 8,
                                                }}
                                                numberOfLines={2}
                                            >
                                                {notification.title}
                                            </Text>
                                            {!notification.read && (
                                                <View
                                                    style={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: 4,
                                                        backgroundColor: colors.brand.primary,
                                                        marginTop: 4,
                                                    }}
                                                />
                                            )}
                                        </View>

                                        <Text
                                            style={{
                                                fontSize: 13,
                                                color: colors.text.secondary,
                                                marginTop: 4,
                                                lineHeight: 18,
                                            }}
                                            numberOfLines={2}
                                        >
                                            {notification.body}
                                        </Text>

                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                                            <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                                                {formatTime(notification.receivedAt)}
                                            </Text>

                                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                                {!notification.read && (
                                                    <Pressable
                                                        onPress={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(notification.id);
                                                        }}
                                                        style={{
                                                            padding: 4,
                                                            borderRadius: 4,
                                                        }}
                                                    >
                                                        <Check size={16} color={colors.brand.primary} />
                                                    </Pressable>
                                                )}
                                                <Pressable
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteNotification(notification.id);
                                                    }}
                                                    style={{
                                                        padding: 4,
                                                        borderRadius: 4,
                                                    }}
                                                >
                                                    <X size={16} color={colors.text.tertiary} />
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>
                                </Pressable>
                            </Animated.View>
                        );
                    })}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
