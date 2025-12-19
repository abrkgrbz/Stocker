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
import { DotBackground } from '../../components/ui/DotBackground';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Image } from 'react-native';

const { width } = Dimensions.get('window');

export default function ForgotPasswordScreen({ navigation }: any) {
    const { colors, theme } = useTheme();
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

            {/* Background Pattern */}
            <View style={StyleSheet.absoluteFill}>
                <DotBackground />
                <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', colors.background]}
                    locations={[0, 0.6, 1]}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
                    <TouchableOpacity style={styles.backButtonHeader} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>

                    <View style={styles.content}>
                        {emailSent ? renderSuccessState() : (
                            <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.formContainer}>
                                <View style={styles.header}>
                                    <View style={styles.logoContainer}>
                                        <Image
                                            source={
                                                theme === 'dark'
                                                    ? require('../../assets/images/stoocker_white.png')
                                                    : require('../../assets/images/stoocker_black.png')
                                            }
                                            style={styles.logo}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    <Text style={[styles.title, { color: colors.textPrimary }]}>Şifrenizi mi unuttunuz?</Text>
                                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                        Endişelenmeyin, size şifre sıfırlama bağlantısı göndereceğiz.
                                    </Text>
                                </View>

                                {/* User Type Selector */}
                                <View style={[styles.toggleContainer, { backgroundColor: theme === 'dark' ? '#374151' : '#E5E7EB' }]}>
                                    <TouchableOpacity
                                        style={[styles.toggleButton, !isTenantUser && { backgroundColor: theme === 'dark' ? '#4B5563' : '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }]}
                                        onPress={() => setIsTenantUser(false)}
                                    >
                                        <Text style={[styles.toggleText, { color: !isTenantUser ? (theme === 'dark' ? '#F3F4F6' : '#1F2937') : (theme === 'dark' ? '#9CA3AF' : '#6B7280') }]}>
                                            Firma Yöneticisi
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.toggleButton, isTenantUser && { backgroundColor: theme === 'dark' ? '#4B5563' : '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }]}
                                        onPress={() => setIsTenantUser(true)}
                                    >
                                        <Text style={[styles.toggleText, { color: isTenantUser ? (theme === 'dark' ? '#F3F4F6' : '#1F2937') : (theme === 'dark' ? '#9CA3AF' : '#6B7280') }]}>
                                            Çalışan
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {isTenantUser && (
                                    <Input
                                        label="Çalışma Alanı Kodu"
                                        placeholder="ABC123"
                                        value={tenantCode}
                                        onChangeText={(text) => setTenantCode(text.toUpperCase())}
                                        autoCapitalize="characters"
                                        containerStyle={{ marginBottom: 16 }}
                                    />
                                )}

                                <Input
                                    label="E-posta Adresi"
                                    placeholder="ornek@sirket.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    containerStyle={{ marginBottom: 24 }}
                                />

                                <Button
                                    title="Sıfırlama Bağlantısı Gönder"
                                    onPress={handleSubmit}
                                    loading={isLoading}
                                    variant="primary"
                                    style={{ marginTop: 8 }}
                                />

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
    header: { marginBottom: 30, alignItems: 'center' },
    logoContainer: {
        width: 180,
        height: 60,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
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
