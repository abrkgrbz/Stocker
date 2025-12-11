import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from 'react-native';
import { Toast } from '../components/Toast';
import { apiService } from '../services/api';
import { colors, spacing } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

export default function VerifyEmailScreen({ route, navigation }: any) {
    const { email } = route.params || {};
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'error' as 'success' | 'error' | 'info' });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
        setToast({ visible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, visible: false });
    };

    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCountdown]);

    const handleVerify = async () => {
        if (code.length !== 6) {
            showToast('Lütfen 6 haneli kodu girin', 'error');
            return;
        }

        setIsLoading(true);
        try {
            // Use the tenant registration verification endpoint to trigger the creation process
            const response = await apiService.public.verifyEmailForTenantCreation({ email, code });

            if (response.data?.success && response.data?.registrationId) {
                showToast('Doğrulama başarılı, kurulum başlıyor...', 'success');
                // Navigate to TenantProgressScreen with registrationId
                navigation.replace('TenantProgress', {
                    registrationId: response.data.registrationId
                });
            } else {
                showToast(response.data?.message || 'Doğrulama başarısız', 'error');
            }
        } catch (error: any) {
            showToast(error.message || 'Doğrulama sırasında hata oluştu', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCountdown > 0) return;

        try {
            const response = await apiService.auth.resendVerificationEmail(email);
            if (response.data?.success) {
                showToast('Kod tekrar gönderildi', 'success');
                setResendCountdown(60);
            } else {
                showToast(response.data?.message || 'Kod gönderilemedi', 'error');
            }
        } catch (error: any) {
            showToast(error.message || 'Hata oluştu', 'error');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <Animated.View entering={FadeInRight} style={styles.card}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="mail-open-outline" size={60} color={colors.primary} />
                    </View>

                    <Text style={styles.title}>E-posta Doğrulama</Text>
                    <Text style={styles.subtitle}>
                        <Text style={{ fontWeight: 'bold', color: '#fff' }}>{email}</Text> adresine gönderilen 6 haneli kodu girin.
                    </Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="000000"
                            placeholderTextColor={colors.textSecondary}
                            value={code}
                            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                            keyboardType="number-pad"
                            maxLength={6}
                            textAlign="center"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, code.length !== 6 && styles.buttonDisabled]}
                        onPress={handleVerify}
                        disabled={code.length !== 6 || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Doğrula</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.resendButton}
                        onPress={handleResend}
                        disabled={resendCountdown > 0}
                    >
                        <Text style={[styles.resendText, resendCountdown > 0 && styles.resendTextDisabled]}>
                            {resendCountdown > 0 ? `Tekrar Gönder (${resendCountdown}s)` : 'Kodu Tekrar Gönder'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backText}>Geri Dön</Text>
                    </TouchableOpacity>
                </Animated.View>
            </KeyboardAvoidingView>

            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={hideToast}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0e27',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.l,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        padding: spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.l,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: spacing.s,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 24,
    },
    inputContainer: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        marginBottom: spacing.l,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        height: 64,
        justifyContent: 'center',
    },
    input: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        letterSpacing: 8,
        textAlign: 'center',
    },
    button: {
        width: '100%',
        backgroundColor: colors.primary,
        borderRadius: 12,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.l,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resendButton: {
        padding: spacing.s,
        marginBottom: spacing.m,
    },
    resendText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    resendTextDisabled: {
        color: colors.textSecondary,
    },
    backButton: {
        padding: spacing.s,
    },
    backText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
});
