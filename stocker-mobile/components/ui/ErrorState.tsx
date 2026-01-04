import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, BounceIn } from 'react-native-reanimated';
import { AlertTriangle, WifiOff, ServerOff, RefreshCw, AlertCircle, XCircle } from 'lucide-react-native';
import { AnimatedButton } from './AnimatedButton';
import { useTheme } from '@/lib/theme';

type ErrorType = 'generic' | 'network' | 'server' | 'notFound' | 'permission' | 'validation';

interface ErrorStateProps {
    type?: ErrorType;
    title?: string;
    message?: string;
    onRetry?: () => void;
    retryLabel?: string;
    showIcon?: boolean;
    style?: ViewStyle;
}

const ERROR_CONFIG: Record<ErrorType, { icon: typeof AlertTriangle; title: string; message: string; color: string }> = {
    generic: {
        icon: AlertTriangle,
        title: 'Bir Hata Oluştu',
        message: 'İşlem sırasında beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
        color: '#f59e0b',
    },
    network: {
        icon: WifiOff,
        title: 'Bağlantı Hatası',
        message: 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
        color: '#3b82f6',
    },
    server: {
        icon: ServerOff,
        title: 'Sunucu Hatası',
        message: 'Sunucuya ulaşılamıyor. Lütfen daha sonra tekrar deneyin.',
        color: '#ef4444',
    },
    notFound: {
        icon: AlertCircle,
        title: 'Bulunamadı',
        message: 'Aradığınız içerik bulunamadı veya kaldırılmış olabilir.',
        color: '#8b5cf6',
    },
    permission: {
        icon: XCircle,
        title: 'Erişim Reddedildi',
        message: 'Bu içeriği görüntüleme yetkiniz bulunmuyor.',
        color: '#dc2626',
    },
    validation: {
        icon: AlertTriangle,
        title: 'Doğrulama Hatası',
        message: 'Girdiğiniz bilgilerde hatalar bulunuyor. Lütfen kontrol edin.',
        color: '#f59e0b',
    },
};

export function ErrorState({
    type = 'generic',
    title,
    message,
    onRetry,
    retryLabel = 'Tekrar Dene',
    showIcon = true,
    style,
}: ErrorStateProps) {
    const { colors } = useTheme();
    const config = ERROR_CONFIG[type];
    const IconComponent = config.icon;

    return (
        <Animated.View
            entering={FadeIn.duration(400)}
            style={[
                {
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 48,
                    paddingHorizontal: 24,
                },
                style,
            ]}
        >
            {showIcon && (
                <Animated.View entering={BounceIn.duration(500).delay(100)}>
                    <View
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            backgroundColor: `${config.color}20`,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 24,
                        }}
                    >
                        <IconComponent size={36} color={config.color} />
                    </View>
                </Animated.View>
            )}

            <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                <Text
                    style={{
                        color: colors.text.primary,
                        fontSize: 18,
                        fontWeight: '600',
                        textAlign: 'center',
                        marginBottom: 8,
                    }}
                >
                    {title || config.title}
                </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(400).delay(300)}>
                <Text
                    style={{
                        color: colors.text.secondary,
                        fontSize: 14,
                        textAlign: 'center',
                        lineHeight: 20,
                        maxWidth: 300,
                    }}
                >
                    {message || config.message}
                </Text>
            </Animated.View>

            {onRetry && (
                <Animated.View
                    entering={FadeInDown.duration(400).delay(400)}
                    style={{ marginTop: 24, width: '100%', maxWidth: 200 }}
                >
                    <AnimatedButton
                        title={retryLabel}
                        onPress={onRetry}
                        variant="primary"
                        icon={<RefreshCw size={18} color="#fff" />}
                    />
                </Animated.View>
            )}
        </Animated.View>
    );
}

// Inline error for forms and small areas
interface InlineErrorProps {
    message: string;
    style?: ViewStyle;
}

export function InlineError({ message, style }: InlineErrorProps) {
    const { colors } = useTheme();

    return (
        <View
            style={[
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    padding: 12,
                    backgroundColor: colors.semantic.errorLight,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.semantic.error,
                },
                style,
            ]}
        >
            <AlertCircle size={18} color={colors.semantic.error} />
            <Text
                style={{
                    flex: 1,
                    color: colors.semantic.error,
                    fontSize: 13,
                    fontWeight: '500',
                }}
            >
                {message}
            </Text>
        </View>
    );
}

// Banner error for top of pages
interface ErrorBannerProps {
    message: string;
    onDismiss?: () => void;
    onRetry?: () => void;
    style?: ViewStyle;
}

export function ErrorBanner({ message, onDismiss, onRetry, style }: ErrorBannerProps) {
    const { colors } = useTheme();

    return (
        <Animated.View
            entering={FadeIn.duration(300)}
            style={[
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    backgroundColor: colors.semantic.errorLight,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.semantic.error,
                    gap: 12,
                },
                style,
            ]}
        >
            <AlertTriangle size={20} color={colors.semantic.error} />
            <Text
                style={{
                    flex: 1,
                    color: colors.semantic.error,
                    fontSize: 13,
                    fontWeight: '500',
                }}
                numberOfLines={2}
            >
                {message}
            </Text>
            {onRetry && (
                <AnimatedButton
                    title="Dene"
                    onPress={onRetry}
                    variant="secondary"
                    size="sm"
                />
            )}
            {onDismiss && (
                <AnimatedButton
                    title="Kapat"
                    onPress={onDismiss}
                    variant="outline"
                    size="sm"
                />
            )}
        </Animated.View>
    );
}

// Network offline state
interface OfflineStateProps {
    onRetry?: () => void;
    style?: ViewStyle;
}

export function OfflineState({ onRetry, style }: OfflineStateProps) {
    return (
        <ErrorState
            type="network"
            onRetry={onRetry}
            style={style}
        />
    );
}

// Permission denied state
interface PermissionDeniedStateProps {
    feature?: string;
    style?: ViewStyle;
}

export function PermissionDeniedState({ feature, style }: PermissionDeniedStateProps) {
    return (
        <ErrorState
            type="permission"
            message={feature ? `"${feature}" özelliğine erişim yetkiniz bulunmuyor.` : undefined}
            style={style}
        />
    );
}
