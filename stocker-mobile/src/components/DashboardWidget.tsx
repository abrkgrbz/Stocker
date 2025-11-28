import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface DashboardWidgetProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    trend?: {
        value: number; // percentage
        direction: 'up' | 'down' | 'neutral';
    };
    onPress?: () => void;
    delay?: number;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
    title,
    value,
    subtitle,
    icon,
    color,
    trend,
    onPress,
    delay = 0
}) => {
    const { colors, theme } = useTheme();

    return (
        <Animated.View entering={FadeInDown.delay(delay).duration(600)} style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
                        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    }
                ]}
                onPress={onPress}
                disabled={!onPress}
                activeOpacity={0.7}
            >
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                        <Ionicons name={icon} size={20} color={color} />
                    </View>
                    {trend && (
                        <View style={[
                            styles.trendContainer,
                            { backgroundColor: trend.direction === 'up' ? colors.success + '20' : (trend.direction === 'down' ? colors.error + '20' : colors.textMuted + '20') }
                        ]}>
                            <Ionicons
                                name={trend.direction === 'up' ? 'arrow-up' : (trend.direction === 'down' ? 'arrow-down' : 'remove')}
                                size={12}
                                color={trend.direction === 'up' ? colors.success : (trend.direction === 'down' ? colors.error : colors.textMuted)}
                            />
                            <Text style={[
                                styles.trendText,
                                { color: trend.direction === 'up' ? colors.success : (trend.direction === 'down' ? colors.error : colors.textMuted) }
                            ]}>
                                {Math.abs(trend.value)}%
                            </Text>
                        </View>
                    )}
                </View>

                <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
                <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
                {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '48%',
        marginBottom: spacing.m,
    } as ViewStyle,
    card: {
        borderRadius: 16,
        padding: spacing.m,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    } as ViewStyle,
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.s,
    } as ViewStyle,
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
        gap: 2,
    } as ViewStyle,
    trendText: {
        fontSize: 12,
        fontWeight: 'bold',
    } as TextStyle,
    value: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 2,
    } as TextStyle,
    title: {
        fontSize: 14,
        fontWeight: '500',
    } as TextStyle,
    subtitle: {
        fontSize: 12,
        marginTop: 2,
    } as TextStyle,
});
