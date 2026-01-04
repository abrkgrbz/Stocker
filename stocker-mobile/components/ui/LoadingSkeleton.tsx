import React, { useEffect } from 'react';
import { View, ViewStyle, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withDelay,
    interpolate,
    Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
    delay?: number;
    variant?: 'default' | 'pulse' | 'wave';
}

export function Skeleton({
    width = '100%',
    height = 16,
    borderRadius = 8,
    style,
    delay = 0,
    variant = 'wave',
}: SkeletonProps) {
    const { colors } = useTheme();
    const shimmerPosition = useSharedValue(-1);
    const pulseOpacity = useSharedValue(0.3);

    useEffect(() => {
        if (variant === 'wave') {
            shimmerPosition.value = withDelay(
                delay,
                withRepeat(
                    withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
                    -1,
                    false
                )
            );
        } else if (variant === 'pulse') {
            pulseOpacity.value = withDelay(
                delay,
                withRepeat(
                    withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                    -1,
                    true
                )
            );
        }
    }, [variant, delay]);

    const shimmerStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: interpolate(shimmerPosition.value, [-1, 1], [-SCREEN_WIDTH, SCREEN_WIDTH]) }
        ],
    }));

    const pulseStyle = useAnimatedStyle(() => ({
        opacity: pulseOpacity.value,
    }));

    const containerStyle = variant === 'pulse' ? pulseStyle : undefined;

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor: colors.border.primary,
                    overflow: 'hidden',
                },
                containerStyle,
                style,
            ]}
        >
            {variant === 'wave' && (
                <Animated.View style={[{ width: '100%', height: '100%' }, shimmerStyle]}>
                    <LinearGradient
                        colors={[
                            'transparent',
                            'rgba(255, 255, 255, 0.4)',
                            'rgba(255, 255, 255, 0.6)',
                            'rgba(255, 255, 255, 0.4)',
                            'transparent',
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={{ width: SCREEN_WIDTH * 0.6, height: '100%' }}
                        locations={[0, 0.3, 0.5, 0.7, 1]}
                    />
                </Animated.View>
            )}
        </Animated.View>
    );
}

// Shimmer overlay for existing content
interface ShimmerOverlayProps {
    children: React.ReactNode;
    loading: boolean;
    style?: ViewStyle;
}

export function ShimmerOverlay({ children, loading, style }: ShimmerOverlayProps) {
    const shimmerPosition = useSharedValue(-1);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (loading) {
            opacity.value = withTiming(1, { duration: 200 });
            shimmerPosition.value = withRepeat(
                withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
                -1,
                false
            );
        } else {
            opacity.value = withTiming(0, { duration: 200 });
        }
    }, [loading]);

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const shimmerStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: interpolate(shimmerPosition.value, [-1, 1], [-SCREEN_WIDTH, SCREEN_WIDTH]) }
        ],
    }));

    return (
        <View style={[{ position: 'relative' }, style]}>
            {children}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: 8,
                        overflow: 'hidden',
                    },
                    overlayStyle,
                ]}
                pointerEvents={loading ? 'auto' : 'none'}
            >
                <Animated.View style={[{ width: '100%', height: '100%' }, shimmerStyle]}>
                    <LinearGradient
                        colors={[
                            'transparent',
                            'rgba(255, 255, 255, 0.5)',
                            'rgba(255, 255, 255, 0.8)',
                            'rgba(255, 255, 255, 0.5)',
                            'transparent',
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={{ width: SCREEN_WIDTH * 0.6, height: '100%' }}
                        locations={[0, 0.3, 0.5, 0.7, 1]}
                    />
                </Animated.View>
            </Animated.View>
        </View>
    );
}

// Card skeleton for list items
interface CardSkeletonProps {
    lines?: number;
    showAvatar?: boolean;
    showAction?: boolean;
    style?: ViewStyle;
}

export function CardSkeleton({ lines = 2, showAvatar = true, showAction = false, style }: CardSkeletonProps) {
    const { colors } = useTheme();

    return (
        <View
            style={[
                {
                    backgroundColor: colors.surface.primary,
                    borderRadius: 14,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 12,
                },
                style,
            ]}
        >
            {showAvatar && (
                <Skeleton width={48} height={48} borderRadius={12} />
            )}
            <View style={{ flex: 1, gap: 8 }}>
                <Skeleton width="70%" height={16} />
                {lines >= 2 && <Skeleton width="50%" height={14} />}
                {lines >= 3 && <Skeleton width="80%" height={14} />}
            </View>
            {showAction && (
                <Skeleton width={24} height={24} borderRadius={12} />
            )}
        </View>
    );
}

// List skeleton
interface ListSkeletonProps {
    count?: number;
    showAvatar?: boolean;
    showAction?: boolean;
    gap?: number;
    style?: ViewStyle;
}

export function ListSkeleton({ count = 5, showAvatar = true, showAction = false, gap = 12, style }: ListSkeletonProps) {
    return (
        <View style={[{ gap }, style]}>
            {Array.from({ length: count }).map((_, index) => (
                <CardSkeleton key={index} showAvatar={showAvatar} showAction={showAction} />
            ))}
        </View>
    );
}

// Stats skeleton
interface StatSkeletonProps {
    style?: ViewStyle;
}

export function StatSkeleton({ style }: StatSkeletonProps) {
    const { colors } = useTheme();

    return (
        <View
            style={[
                {
                    backgroundColor: colors.surface.primary,
                    borderRadius: 14,
                    padding: 16,
                    alignItems: 'center',
                    gap: 8,
                },
                style,
            ]}
        >
            <Skeleton width={24} height={24} borderRadius={12} />
            <Skeleton width={60} height={24} />
            <Skeleton width={40} height={12} />
        </View>
    );
}

// Stats row skeleton
interface StatsRowSkeletonProps {
    count?: number;
    style?: ViewStyle;
}

export function StatsRowSkeleton({ count = 3, style }: StatsRowSkeletonProps) {
    return (
        <View style={[{ flexDirection: 'row', gap: 12 }, style]}>
            {Array.from({ length: count }).map((_, index) => (
                <StatSkeleton key={index} style={{ flex: 1 }} />
            ))}
        </View>
    );
}

// Chart skeleton
interface ChartSkeletonProps {
    height?: number;
    style?: ViewStyle;
}

export function ChartSkeleton({ height = 200, style }: ChartSkeletonProps) {
    const { colors } = useTheme();

    return (
        <View
            style={[
                {
                    backgroundColor: colors.surface.primary,
                    borderRadius: 14,
                    padding: 16,
                    height,
                    justifyContent: 'flex-end',
                },
                style,
            ]}
        >
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, flex: 1 }}>
                {Array.from({ length: 7 }).map((_, index) => (
                    <Skeleton
                        key={index}
                        width={undefined}
                        height={Math.random() * 80 + 40}
                        borderRadius={4}
                        style={{ flex: 1 }}
                    />
                ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                {Array.from({ length: 7 }).map((_, index) => (
                    <Skeleton key={index} width={20} height={10} />
                ))}
            </View>
        </View>
    );
}

// Form skeleton
interface FormSkeletonProps {
    fields?: number;
    style?: ViewStyle;
}

export function FormSkeleton({ fields = 4, style }: FormSkeletonProps) {
    const { colors } = useTheme();

    return (
        <View style={[{ gap: 16 }, style]}>
            {Array.from({ length: fields }).map((_, index) => (
                <View key={index} style={{ gap: 8 }}>
                    <Skeleton width={80} height={14} />
                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 12,
                            padding: 16,
                        }}
                    >
                        <Skeleton width="60%" height={16} />
                    </View>
                </View>
            ))}
        </View>
    );
}

// Table skeleton
interface TableSkeletonProps {
    rows?: number;
    columns?: number;
    style?: ViewStyle;
}

export function TableSkeleton({ rows = 5, columns = 4, style }: TableSkeletonProps) {
    const { colors } = useTheme();

    return (
        <View
            style={[
                {
                    backgroundColor: colors.surface.primary,
                    borderRadius: 14,
                    overflow: 'hidden',
                },
                style,
            ]}
        >
            {/* Header */}
            <View
                style={{
                    flexDirection: 'row',
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.primary,
                    gap: 12,
                }}
            >
                {Array.from({ length: columns }).map((_, index) => (
                    <Skeleton key={index} width={undefined} height={14} style={{ flex: 1 }} />
                ))}
            </View>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <View
                    key={rowIndex}
                    style={{
                        flexDirection: 'row',
                        padding: 16,
                        borderBottomWidth: rowIndex < rows - 1 ? 1 : 0,
                        borderBottomColor: colors.border.secondary,
                        gap: 12,
                    }}
                >
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={colIndex} width={undefined} height={16} style={{ flex: 1 }} />
                    ))}
                </View>
            ))}
        </View>
    );
}

// Page loading skeleton with header, stats, and list
interface PageSkeletonProps {
    showStats?: boolean;
    statsCount?: number;
    listCount?: number;
    style?: ViewStyle;
}

export function PageSkeleton({ showStats = true, statsCount = 3, listCount = 5, style }: PageSkeletonProps) {
    return (
        <View style={[{ padding: 16, gap: 16 }, style]}>
            {showStats && <StatsRowSkeleton count={statsCount} />}
            <ListSkeleton count={listCount} />
        </View>
    );
}
