import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react-native';
import { useSync } from '@/lib/sync';
import { useTheme } from '@/lib/theme';

interface SyncIndicatorProps {
    variant?: 'banner' | 'badge' | 'icon';
    showWhenOnline?: boolean;
}

export function SyncIndicator({ variant = 'badge', showWhenOnline = false }: SyncIndicatorProps) {
    const { isOnline, pendingCount, isSyncing, syncNow, lastSyncTime } = useSync();
    const { colors } = useTheme();

    // Don't show when online with no pending items (unless forced)
    if (isOnline && pendingCount === 0 && !isSyncing && !showWhenOnline) {
        return null;
    }

    const formatLastSync = () => {
        if (!lastSyncTime) return 'Hiç senkronize edilmedi';

        const now = new Date();
        const diff = now.getTime() - lastSyncTime.getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return 'Az önce';
        if (minutes < 60) return `${minutes} dakika önce`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} saat önce`;

        return lastSyncTime.toLocaleDateString('tr-TR');
    };

    // Banner variant - full width notification
    if (variant === 'banner') {
        if (isOnline && pendingCount === 0) return null;

        return (
            <Animated.View
                entering={SlideInDown.duration(300)}
                exiting={SlideOutDown.duration(300)}
                style={{
                    backgroundColor: isOnline
                        ? isSyncing
                            ? colors.semantic.info
                            : colors.semantic.warning
                        : colors.semantic.error,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <View className="flex-row items-center">
                    {!isOnline ? (
                        <WifiOff size={16} color="#fff" />
                    ) : isSyncing ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <CloudOff size={16} color="#fff" />
                    )}
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500', marginLeft: 8 }}>
                        {!isOnline
                            ? 'Çevrimdışı mod'
                            : isSyncing
                                ? 'Senkronize ediliyor...'
                                : `${pendingCount} bekleyen değişiklik`}
                    </Text>
                </View>
                {isOnline && !isSyncing && pendingCount > 0 && (
                    <Pressable onPress={syncNow}>
                        <RefreshCw size={16} color="#fff" />
                    </Pressable>
                )}
            </Animated.View>
        );
    }

    // Badge variant - compact indicator
    if (variant === 'badge') {
        return (
            <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isOnline
                        ? pendingCount > 0
                            ? colors.semantic.warningLight
                            : colors.semantic.successLight
                        : colors.semantic.errorLight,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 16,
                }}
            >
                {isSyncing ? (
                    <ActivityIndicator
                        size="small"
                        color={colors.semantic.info}
                        style={{ width: 14, height: 14 }}
                    />
                ) : !isOnline ? (
                    <WifiOff size={14} color={colors.semantic.error} />
                ) : pendingCount > 0 ? (
                    <AlertCircle size={14} color={colors.semantic.warning} />
                ) : (
                    <Check size={14} color={colors.semantic.success} />
                )}
                <Text
                    style={{
                        color: isOnline
                            ? pendingCount > 0
                                ? colors.semantic.warning
                                : colors.semantic.success
                            : colors.semantic.error,
                        fontSize: 12,
                        fontWeight: '600',
                        marginLeft: 6,
                    }}
                >
                    {isSyncing
                        ? 'Senkronize...'
                        : !isOnline
                            ? 'Çevrimdışı'
                            : pendingCount > 0
                                ? `${pendingCount} bekliyor`
                                : 'Senkron'}
                </Text>
            </Animated.View>
        );
    }

    // Icon variant - just an icon with optional badge
    return (
        <View style={{ position: 'relative' }}>
            {isSyncing ? (
                <ActivityIndicator size="small" color={colors.brand.primary} />
            ) : !isOnline ? (
                <WifiOff size={20} color={colors.semantic.error} />
            ) : (
                <Cloud size={20} color={colors.text.tertiary} />
            )}
            {pendingCount > 0 && (
                <View
                    style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        backgroundColor: colors.semantic.warning,
                        borderRadius: 8,
                        minWidth: 16,
                        height: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 4,
                    }}
                >
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
                        {pendingCount > 9 ? '9+' : pendingCount}
                    </Text>
                </View>
            )}
        </View>
    );
}

// Offline notice for screens
interface OfflineNoticeProps {
    message?: string;
}

export function OfflineNotice({ message = 'Çevrimdışı moddasınız. Veriler senkronize edilecek.' }: OfflineNoticeProps) {
    const { isOnline } = useSync();
    const { colors } = useTheme();

    if (isOnline) return null;

    return (
        <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            style={{
                backgroundColor: colors.semantic.warningLight,
                padding: 12,
                margin: 16,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <WifiOff size={18} color={colors.semantic.warning} />
            <Text style={{ color: colors.semantic.warning, fontSize: 13, marginLeft: 10, flex: 1 }}>
                {message}
            </Text>
        </Animated.View>
    );
}
