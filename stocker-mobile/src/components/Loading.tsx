import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, Text, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';

interface LoadingProps {
    visible: boolean;
    text?: string;
}

export const Loading = ({ visible, text = 'Yükleniyor...' }: LoadingProps) => {
    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            statusBarTranslucent
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    {text && <Text style={styles.text}>{text}</Text>}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    content: {
        backgroundColor: colors.surface,
        padding: spacing.xl,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        minWidth: 150,
    } as ViewStyle,
    text: {
        ...typography.body,
        color: colors.textPrimary,
        marginTop: spacing.m,
        textAlign: 'center',
    } as TextStyle,
});
