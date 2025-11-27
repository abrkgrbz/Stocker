import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface StandardCardProps {
    title: string;
    subtitle?: string;
    status?: string;
    statusColor?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    onPress?: () => void;
    rightText?: string;
    footer?: React.ReactNode;
}

export const StandardCard: React.FC<StandardCardProps> = ({
    title,
    subtitle,
    status,
    statusColor,
    icon,
    iconColor,
    onPress,
    rightText,
    footer
}) => {
    const { colors, theme } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : colors.surface,
                    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : colors.surfaceLight,
                    shadowColor: theme === 'dark' ? '#000' : '#ccc',
                    shadowOpacity: theme === 'dark' ? 0 : 0.1,
                    shadowRadius: 4,
                    elevation: theme === 'dark' ? 0 : 2
                }
            ]}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.header}>
                <View style={styles.leftContent}>
                    {icon && (
                        <View style={[styles.iconContainer, { backgroundColor: (iconColor || colors.primary) + '20' }]}>
                            <Ionicons name={icon} size={20} color={iconColor || colors.primary} />
                        </View>
                    )}
                    <View>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                        {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
                    </View>
                </View>
                <View style={styles.rightContent}>
                    {rightText && <Text style={[styles.rightText, { color: colors.textPrimary }]}>{rightText}</Text>}
                    {status && (
                        <View style={[styles.statusBadge, { backgroundColor: (statusColor || colors.primary) + '20' }]}>
                            <Text style={[styles.statusText, { color: statusColor || colors.primary }]}>{status}</Text>
                        </View>
                    )}
                </View>
            </View>
            {footer && (
                <View style={[styles.footer, { borderTopColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : colors.surfaceLight }]}>
                    {footer}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: spacing.m,
        marginBottom: spacing.m,
        borderWidth: 1,
    } as ViewStyle,
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    } as ViewStyle,
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    } as ViewStyle,
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    } as ViewStyle,
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    } as TextStyle,
    subtitle: {
        fontSize: 12,
    } as TextStyle,
    rightContent: {
        alignItems: 'flex-end',
    } as ViewStyle,
    rightText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    } as TextStyle,
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    } as ViewStyle,
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    } as TextStyle,
    footer: {
        marginTop: spacing.m,
        paddingTop: spacing.m,
        borderTopWidth: 1,
    } as ViewStyle,
});
