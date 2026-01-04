import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withSequence,
    runOnJS,
    FadeIn,
    FadeOut,
    SlideInUp,
    SlideOutUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    X,
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    action?: {
        label: string;
        onPress: () => void;
    };
}

interface ToastContextValue {
    show: (config: Omit<ToastConfig, 'id'>) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    hide: (id: string) => void;
    hideAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Hook to use toast
export function useToast(): ToastContextValue {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Individual toast component
interface ToastItemProps {
    toast: ToastConfig;
    onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
    const { colors } = useTheme();
    const timeoutRef = useRef<NodeJS.Timeout>();

    const config = {
        success: {
            icon: CheckCircle,
            color: '#10b981',
            bgColor: '#d1fae5',
            borderColor: '#34d399',
        },
        error: {
            icon: XCircle,
            color: '#ef4444',
            bgColor: '#fee2e2',
            borderColor: '#f87171',
        },
        warning: {
            icon: AlertTriangle,
            color: '#f59e0b',
            bgColor: '#fef3c7',
            borderColor: '#fbbf24',
        },
        info: {
            icon: Info,
            color: '#3b82f6',
            bgColor: '#dbeafe',
            borderColor: '#60a5fa',
        },
    };

    const { icon: Icon, color, bgColor, borderColor } = config[toast.type];

    useEffect(() => {
        const duration = toast.duration ?? 4000;
        if (duration > 0) {
            timeoutRef.current = setTimeout(() => {
                onDismiss(toast.id);
            }, duration);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [toast.id, toast.duration, onDismiss]);

    return (
        <Animated.View
            entering={SlideInUp.duration(300).springify()}
            exiting={SlideOutUp.duration(200)}
            style={[
                styles.toastContainer,
                {
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                    shadowColor: color,
                },
            ]}
        >
            <View style={styles.iconContainer}>
                <Icon size={22} color={color} />
            </View>

            <View style={styles.contentContainer}>
                <Text
                    style={[styles.title, { color: colors.text.primary }]}
                    numberOfLines={1}
                >
                    {toast.title}
                </Text>
                {toast.message && (
                    <Text
                        style={[styles.message, { color: colors.text.secondary }]}
                        numberOfLines={2}
                    >
                        {toast.message}
                    </Text>
                )}
            </View>

            {toast.action && (
                <Pressable
                    onPress={() => {
                        toast.action?.onPress();
                        onDismiss(toast.id);
                    }}
                    style={[styles.actionButton, { backgroundColor: color }]}
                >
                    <Text style={styles.actionText}>{toast.action.label}</Text>
                </Pressable>
            )}

            <Pressable
                onPress={() => onDismiss(toast.id)}
                style={styles.dismissButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <X size={18} color={colors.text.tertiary} />
            </Pressable>
        </Animated.View>
    );
}

// Toast Provider
interface ToastProviderProps {
    children: React.ReactNode;
    maxVisible?: number;
}

export function ToastProvider({ children, maxVisible = 3 }: ToastProviderProps) {
    const insets = useSafeAreaInsets();
    const [toasts, setToasts] = useState<ToastConfig[]>([]);
    const idCounter = useRef(0);

    const generateId = useCallback(() => {
        idCounter.current += 1;
        return `toast-${Date.now()}-${idCounter.current}`;
    }, []);

    const show = useCallback((config: Omit<ToastConfig, 'id'>) => {
        const id = generateId();
        setToasts(prev => {
            const newToasts = [{ ...config, id }, ...prev];
            // Limit visible toasts
            return newToasts.slice(0, maxVisible);
        });
    }, [generateId, maxVisible]);

    const success = useCallback((title: string, message?: string) => {
        show({ type: 'success', title, message });
    }, [show]);

    const error = useCallback((title: string, message?: string) => {
        show({ type: 'error', title, message, duration: 6000 });
    }, [show]);

    const warning = useCallback((title: string, message?: string) => {
        show({ type: 'warning', title, message, duration: 5000 });
    }, [show]);

    const info = useCallback((title: string, message?: string) => {
        show({ type: 'info', title, message });
    }, [show]);

    const hide = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const hideAll = useCallback(() => {
        setToasts([]);
    }, []);

    const value: ToastContextValue = {
        show,
        success,
        error,
        warning,
        info,
        hide,
        hideAll,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <View
                style={[
                    styles.toastWrapper,
                    { top: insets.top + 8 },
                ]}
                pointerEvents="box-none"
            >
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onDismiss={hide}
                    />
                ))}
            </View>
        </ToastContext.Provider>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    toastWrapper: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 9999,
        gap: 8,
    },
    toastContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        gap: 10,
    },
    iconContainer: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
    },
    message: {
        fontSize: 13,
        marginTop: 2,
        lineHeight: 18,
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    actionText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    dismissButton: {
        padding: 4,
    },
});
