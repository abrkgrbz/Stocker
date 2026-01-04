/**
 * Security Banner Component
 * Displays rate limiting warnings and session timeout alerts
 */
import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withRepeat,
    withSequence,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';
import { warningHaptic } from '@/lib/haptics';

interface SecurityBannerProps {
    type: 'rate_limit' | 'session_warning' | 'locked' | 'info';
    message: string;
    visible: boolean;
    onDismiss?: () => void;
    onAction?: () => void;
    actionLabel?: string;
    remainingTime?: number; // in seconds
    showIcon?: boolean;
}

export function SecurityBanner({
    type,
    message,
    visible,
    onDismiss,
    onAction,
    actionLabel,
    remainingTime,
    showIcon = true,
}: SecurityBannerProps) {
    const { isDark } = useTheme();
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.back(1.5)) });
            opacity.value = withTiming(1, { duration: 200 });

            // Pulse animation for urgent messages
            if (type === 'session_warning' || type === 'locked') {
                warningHaptic();
                pulseScale.value = withRepeat(
                    withSequence(
                        withTiming(1.02, { duration: 500 }),
                        withTiming(1, { duration: 500 })
                    ),
                    -1,
                    true
                );
            }
        } else {
            translateY.value = withTiming(-100, { duration: 200 });
            opacity.value = withTiming(0, { duration: 150 });
            pulseScale.value = 1;
        }
    }, [visible, type]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: pulseScale.value },
        ],
        opacity: opacity.value,
    }));

    const getConfig = () => {
        switch (type) {
            case 'rate_limit':
                return {
                    icon: 'warning' as const,
                    backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)',
                    borderColor: isDark ? 'rgba(251, 191, 36, 0.4)' : 'rgba(251, 191, 36, 0.3)',
                    iconColor: '#fbbf24',
                    textColor: isDark ? '#fcd34d' : '#b45309',
                };
            case 'session_warning':
                return {
                    icon: 'time' as const,
                    backgroundColor: isDark ? 'rgba(251, 146, 60, 0.15)' : 'rgba(251, 146, 60, 0.1)',
                    borderColor: isDark ? 'rgba(251, 146, 60, 0.4)' : 'rgba(251, 146, 60, 0.3)',
                    iconColor: '#fb923c',
                    textColor: isDark ? '#fdba74' : '#c2410c',
                };
            case 'locked':
                return {
                    icon: 'lock-closed' as const,
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                    borderColor: isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)',
                    iconColor: '#ef4444',
                    textColor: isDark ? '#fca5a5' : '#b91c1c',
                };
            case 'info':
            default:
                return {
                    icon: 'information-circle' as const,
                    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                    borderColor: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)',
                    iconColor: '#3b82f6',
                    textColor: isDark ? '#93c5fd' : '#1d4ed8',
                };
        }
    };

    const config = getConfig();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        return `${secs}s`;
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: config.backgroundColor,
                    borderColor: config.borderColor,
                },
                animatedStyle,
            ]}
        >
            <View style={styles.content}>
                {showIcon && (
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={config.icon}
                            size={22}
                            color={config.iconColor}
                        />
                    </View>
                )}

                <View style={styles.textContainer}>
                    <Text style={[styles.message, { color: config.textColor }]}>
                        {message}
                    </Text>
                    {remainingTime !== undefined && remainingTime > 0 && (
                        <Text style={[styles.timer, { color: config.iconColor }]}>
                            {formatTime(remainingTime)}
                        </Text>
                    )}
                </View>

                {onAction && actionLabel && (
                    <Pressable
                        onPress={onAction}
                        style={({ pressed }) => [
                            styles.actionButton,
                            { opacity: pressed ? 0.7 : 1 },
                        ]}
                    >
                        <Text style={[styles.actionLabel, { color: config.iconColor }]}>
                            {actionLabel}
                        </Text>
                    </Pressable>
                )}

                {onDismiss && (
                    <Pressable
                        onPress={onDismiss}
                        style={({ pressed }) => [
                            styles.dismissButton,
                            { opacity: pressed ? 0.5 : 1 },
                        ]}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Ionicons
                            name="close"
                            size={18}
                            color={config.textColor}
                        />
                    </Pressable>
                )}
            </View>
        </Animated.View>
    );
}

interface SessionTimeoutModalProps {
    visible: boolean;
    remainingSeconds: number;
    onExtend: () => void;
    onLogout: () => void;
}

export function SessionTimeoutWarning({
    visible,
    remainingSeconds,
    onExtend,
    onLogout,
}: SessionTimeoutModalProps) {
    const { isDark } = useTheme();
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.9);

    useEffect(() => {
        if (visible) {
            warningHaptic();
            opacity.value = withTiming(1, { duration: 200 });
            scale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.back(1.5)) });
        } else {
            opacity.value = withTiming(0, { duration: 150 });
            scale.value = withTiming(0.9, { duration: 150 });
        }
    }, [visible]);

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const modalStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    if (!visible) return null;

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return (
        <Animated.View style={[styles.overlay, overlayStyle]}>
            <Animated.View
                style={[
                    styles.modal,
                    {
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        borderColor: isDark ? 'rgba(251, 146, 60, 0.3)' : 'rgba(251, 146, 60, 0.2)',
                    },
                    modalStyle,
                ]}
            >
                <View style={styles.modalIcon}>
                    <Ionicons name="time" size={48} color="#fb923c" />
                </View>

                <Text
                    style={[
                        styles.modalTitle,
                        { color: isDark ? '#f8fafc' : '#0f172a' },
                    ]}
                >
                    Oturum Zaman Aşımı
                </Text>

                <Text
                    style={[
                        styles.modalMessage,
                        { color: isDark ? '#94a3b8' : '#64748b' },
                    ]}
                >
                    Güvenliğiniz için oturumunuz kapatılacak.
                </Text>

                <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>
                        {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}`}
                    </Text>
                    <Text
                        style={[
                            styles.timerLabel,
                            { color: isDark ? '#94a3b8' : '#64748b' },
                        ]}
                    >
                        {minutes > 0 ? 'dakika kaldı' : 'saniye kaldı'}
                    </Text>
                </View>

                <View style={styles.modalButtons}>
                    <Pressable
                        onPress={onLogout}
                        style={({ pressed }) => [
                            styles.modalButton,
                            styles.logoutButton,
                            {
                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                                opacity: pressed ? 0.7 : 1,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.buttonText,
                                { color: isDark ? '#94a3b8' : '#64748b' },
                            ]}
                        >
                            Çıkış Yap
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={onExtend}
                        style={({ pressed }) => [
                            styles.modalButton,
                            styles.extendButton,
                            { opacity: pressed ? 0.8 : 1 },
                        ]}
                    >
                        <Text style={styles.extendButtonText}>
                            Devam Et
                        </Text>
                    </Pressable>
                </View>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    iconContainer: {
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    message: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    timer: {
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginLeft: 8,
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    dismissButton: {
        padding: 4,
        marginLeft: 4,
    },

    // Modal styles
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        width: '85%',
        maxWidth: 340,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    modalIcon: {
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    timerText: {
        fontSize: 48,
        fontWeight: '700',
        color: '#fb923c',
    },
    timerLabel: {
        fontSize: 14,
        marginTop: 4,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    logoutButton: {},
    extendButton: {
        backgroundColor: '#3b82f6',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    extendButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
});
