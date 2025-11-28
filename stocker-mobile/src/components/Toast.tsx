import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { spacing, typography } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { hapticService } from '../services/haptic';

const { width } = Dimensions.get('window');

interface ToastProps {
    visible: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
    onHide: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
    visible,
    message,
    type = 'error',
    onHide,
    duration = 3000
}) => {
    const { colors } = useTheme();

    useEffect(() => {
        if (visible) {
            // Trigger haptic feedback based on type
            switch (type) {
                case 'success':
                    hapticService.success();
                    break;
                case 'error':
                    hapticService.error();
                    break;
                case 'info':
                    hapticService.selection();
                    break;
            }

            const timer = setTimeout(() => {
                onHide();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [visible, duration, onHide, type]);

    if (!visible) return null;

    const getBackgroundColor = () => {
        switch (type) {
            case 'success': return colors.success;
            case 'error': return colors.error;
            case 'info': return colors.primary;
            default: return colors.primary;
        }
    };

    const getIconName = () => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'alert-circle';
            case 'info': return 'information-circle';
            default: return 'information-circle';
        }
    };

    return (
        <Animated.View
            entering={FadeInUp.springify()}
            exiting={FadeOutUp}
            style={[styles.container, { backgroundColor: getBackgroundColor() }]}
        >
            <View style={styles.content}>
                <Ionicons name={getIconName()} size={24} color="#FFF" />
                <Text style={styles.message}>{message}</Text>
            </View>
            <TouchableOpacity onPress={onHide} style={styles.closeButton}>
                <Ionicons name="close" size={20} color="#FFF" />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50, // SafeArea'nın altında
        left: spacing.m,
        right: spacing.m,
        borderRadius: 12,
        padding: spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 9999,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    message: {
        ...typography.body,
        color: '#FFF',
        marginLeft: spacing.s,
        flex: 1,
        fontWeight: '600',
    },
    closeButton: {
        padding: spacing.xs,
        marginLeft: spacing.s,
    }
});
