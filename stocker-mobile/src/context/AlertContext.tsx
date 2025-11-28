import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme/colors';
import { useTheme } from './ThemeContext';

interface AlertButton {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
}

interface AlertOptions {
    title: string;
    message: string;
    buttons?: AlertButton[];
    type?: 'success' | 'error' | 'warning' | 'info';
}

interface AlertContextType {
    showAlert: (options: AlertOptions) => void;
    hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState<AlertOptions | null>(null);
    const { theme } = useTheme();

    const showAlert = useCallback((options: AlertOptions) => {
        setConfig(options);
        setVisible(true);
    }, []);

    const hideAlert = useCallback(() => {
        setVisible(false);
        // Clear config after animation
        setTimeout(() => setConfig(null), 300);
    }, []);

    const getIcon = () => {
        switch (config?.type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'alert-circle';
            case 'warning': return 'warning';
            default: return 'information-circle';
        }
    };

    const getIconColor = () => {
        switch (config?.type) {
            case 'success': return colors.success;
            case 'error': return colors.error;
            case 'warning': return colors.warning;
            default: return colors.primary;
        }
    };

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <Modal
                transparent
                visible={visible}
                animationType="none"
                onRequestClose={hideAlert}
            >
                <View style={styles.overlay}>
                    <View style={[styles.backdrop]} />
                    {config && (
                        <Animated.View
                            entering={ZoomIn.duration(300)}
                            exiting={ZoomOut.duration(200)}
                            style={[
                                styles.alertContainer,
                                { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }
                            ]}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name={getIcon()} size={48} color={getIconColor()} />
                            </View>

                            <Text style={[
                                styles.title,
                                { color: theme === 'dark' ? '#fff' : colors.textPrimary }
                            ]}>
                                {config.title}
                            </Text>

                            <Text style={[
                                styles.message,
                                { color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : colors.textSecondary }
                            ]}>
                                {config.message}
                            </Text>

                            <View style={styles.buttonContainer}>
                                {(config.buttons || [{ text: 'Tamam', onPress: hideAlert }]).map((btn, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.button,
                                            btn.style === 'destructive' && styles.destructiveButton,
                                            btn.style === 'cancel' && styles.cancelButton,
                                            // Add margin if multiple buttons
                                            (config.buttons?.length || 0) > 1 && { flex: 1, marginHorizontal: 4 }
                                        ]}
                                        onPress={() => {
                                            hideAlert();
                                            if (btn.onPress) btn.onPress();
                                        }}
                                    >
                                        <Text style={[
                                            styles.buttonText,
                                            btn.style === 'destructive' && styles.destructiveButtonText,
                                            btn.style === 'cancel' && { color: theme === 'dark' ? '#fff' : colors.textSecondary }
                                        ]}>
                                            {btn.text}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Animated.View>
                    )}
                </View>
            </Modal>
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) throw new Error('useAlert must be used within an AlertProvider');
    return context;
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    alertContainer: {
        width: Dimensions.get('window').width * 0.85,
        borderRadius: 24,
        padding: spacing.l,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    iconContainer: {
        marginBottom: spacing.m,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: spacing.s,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: spacing.l,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(150,150,150,0.5)',
    },
    destructiveButton: {
        backgroundColor: colors.error,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    destructiveButtonText: {
        color: '#fff',
    }
});
