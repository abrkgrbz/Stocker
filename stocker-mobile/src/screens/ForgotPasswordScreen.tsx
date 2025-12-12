import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Alert,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Loading } from '../components/Loading';
import { Toast } from '../components/Toast';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ForgotPasswordScreen({ navigation }: any) {
    const { colors } = useTheme();
    const [email, setEmail] = useState('');
    const [isTenantUser, setIsTenantUser] = useState(false);
    const [tenantCode, setTenantCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'error' as 'success' | 'error' | 'info' });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
        setToast({ visible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, visible: false });
    };

    const handleSubmit = async () => {
        if (!email) {
            showToast('Lütfen e-posta adresinizi girin', 'error');
            return;
        }

        if (isTenantUser && !tenantCode.trim()) {
            showToast('Çalışma alanı kodu gereklidir', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiService.auth.forgotPassword(email, isTenantUser ? tenantCode.trim() : undefined);

            if (response.data.success) {
                setEmailSent(true);
            } else {
                showToast(response.data.message || 'E-posta gönderilemedi.', 'error');
            }
        } catch (error: any) {
            console.error('Forgot password error:', error);
            const message = error.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
            showToast(message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const renderSuccessState = () => (
        <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
                <Ionicons name="mail-unread-outline" size={50} color={colors.accent} />
            </View>
            <Text style={[styles.successTitle, { color: colors.textPrimary }]}>E-posta Gönderildi!</Text>
            <Text style={[styles.successText, { color: colors.textSecondary }]}>
                Şifre sıfırlama bağlantısı <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{email}</Text> adresine gönderildi.
            </Text>

            <View style={[styles.infoBox, { backgroundColor: colors.surfaceLight + '40', borderColor: colors.primary + '40' }]}>
                <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>E-posta gelmediyse</Text>
                    <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>• Spam klasörünü kontrol edin</Text>
                    <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>• E-posta adresini doğru yazdığınızdan emin olun</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.accent }]}
                onPress={() => navigation.navigate('Login')}
            >
                <Text style={styles.buttonText}>Giriş Sayfasına Dön</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.textButton}
                onPress={() => {
                    setEmailSent(false);
                    setEmail('');
                    setTenantCode('');
                }}
            >
                <Text style={[styles.textButtonText, { color: colors.textSecondary }]}>Farklı e-posta dene</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Loading visible={isLoading} text="Gönderiliyor..." />
            <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />

            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
                    <TouchableOpacity style={styles.backButtonHeader} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>

                    <View style={styles.content}>
                        {emailSent ? renderSuccessState() : (
                            <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.formContainer}>
                                <View style={styles.header}>
                                    <Text style={[styles.title, { color: colors.textPrimary }]}>Şifrenizi mi unuttunuz?</Text>
                                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                        Endişelenmeyin, size şifre sıfırlama bağlantısı göndereceğiz.
                                    </Text>
                                </View>

                                {/* User Type Selector */}
                                <View style={[styles.toggleContainer, { backgroundColor: colors.surface }]}>
                                    <TouchableOpacity
                                        style={[styles.toggleButton, !isTenantUser && { backgroundColor: colors.surfaceLight }]}
                                        onPress={() => setIsTenantUser(false)}
                                    >
                                        <Text style={[styles.toggleText, { color: !isTenantUser ? colors.textPrimary : colors.textSecondary }]}>
                                            Firma Yöneticisi
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.toggleButton, isTenantUser && { backgroundColor: colors.surfaceLight }]}
                                        onPress={() => setIsTenantUser(true)}
                                    >
                                        <Text style={[styles.toggleText, { color: isTenantUser ? colors.textPrimary : colors.textSecondary }]}>
                                            Çalışan
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {isTenantUser && (
                                    <View style={styles.inputContainer}>
                                        <Text style={[styles.label, { color: colors.textPrimary }]}>Çalışma Alanı Kodu</Text>
                                        <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.surfaceLight }]}>
                                            <Ionicons name="business-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                                            <TextInput
                                                style={[styles.input, { color: colors.textPrimary }]}
                                                placeholder="ABC123"
                                                placeholderTextColor={colors.textMuted}
                                                value={tenantCode}
                                                onChangeText={(text) => setTenantCode(text.toUpperCase())}
                                                autoCapitalize="characters"
                                            />
                                        </View>
                                    </View>
                                )}

                                <View style={styles.inputContainer}>
                                    <Text style={[styles.label, { color: colors.textPrimary }]}>E-posta Adresi</Text>
                                    <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.surfaceLight }]}>
                                        <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { color: colors.textPrimary }]}
                                            placeholder="ornek@sirket.com"
                                            placeholderTextColor={colors.textMuted}
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: colors.accent }]}
                                    onPress={handleSubmit}
                                >
                                    <Text style={styles.buttonText}>Sıfırlama Bağlantısı Gönder</Text>
                                </TouchableOpacity>

                                <View style={[styles.securityTip, { backgroundColor: colors.warning + '10', borderColor: colors.warning + '30' }]}>
                                    <Ionicons name="shield-checkmark-outline" size={20} color={colors.warning} />
                                    <Text style={[styles.securityText, { color: colors.warning }]}>
                                        Bağlantı güvenliği için link 1 saat geçerlidir.
                                    </Text>
                                </View>
                            </Animated.View>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    keyboardView: { flex: 1 },
    backButtonHeader: { padding: 20 },
    content: { flex: 1, padding: 20, justifyContent: 'center' },
    header: { marginBottom: 30 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
    subtitle: { fontSize: 16, lineHeight: 24 },
    formContainer: { width: '100%' },
    toggleContainer: { flexDirection: 'row', padding: 5, borderRadius: 12, marginBottom: 20 },
    toggleButton: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8 },
    toggleText: { fontWeight: 'bold', fontSize: 14 },
    inputContainer: { marginBottom: 20 },
    label: { marginBottom: 8, fontWeight: '500' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12 },
    inputIcon: { marginLeft: 15, marginRight: 10 },
    input: { flex: 1, padding: 15, fontSize: 16 },
    button: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    securityTip: { flexDirection: 'row', marginTop: 30, padding: 15, borderRadius: 12, borderWidth: 1, alignItems: 'center', gap: 10 },
    securityText: { flex: 1, fontSize: 12 },

    // Success State
    successContainer: { alignItems: 'center', padding: 20 },
    successIconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0,255,136,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    successTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    successText: { textAlign: 'center', fontSize: 16, lineHeight: 24, marginBottom: 30 },
    infoBox: { flexDirection: 'row', padding: 15, borderRadius: 12, borderWidth: 1, width: '100%', marginBottom: 30 },
    infoTitle: { fontWeight: 'bold', marginBottom: 5 },
    infoDesc: { fontSize: 12, marginTop: 2 },
    textButton: { marginTop: 20, padding: 10 },
    textButtonText: { fontSize: 14, fontWeight: '500' },
});
