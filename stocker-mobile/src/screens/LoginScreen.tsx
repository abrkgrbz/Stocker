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
    Image,
    ViewStyle,
    TextStyle,
    ImageStyle,
    Alert,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { apiService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInDown,
    FadeInUp,
    FadeInRight,
    FadeOutLeft,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing
} from 'react-native-reanimated';
import { Loading } from '../components/Loading';
import { Toast } from '../components/Toast';
import { biometricService } from '../services/biometric';
import { hapticService } from '../services/haptic';

const { width } = Dimensions.get('window');

type Step = 'email' | 'tenant-selection' | 'password';

interface TenantInfo {
    code: string;
    name: string;
    signature: string;
    timestamp: number;
    domain?: string;
}

export default function LoginScreen({ navigation }: any) {
    const { colors } = useTheme();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tenants, setTenants] = useState<TenantInfo[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<TenantInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'error' as 'success' | 'error' | 'info' });
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
        setToast({ visible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, visible: false });
    };

    // Animation values for background blobs
    const blob1TranslateY = useSharedValue(0);
    const blob2TranslateY = useSharedValue(0);
    const blob3TranslateY = useSharedValue(0);

    React.useEffect(() => {
        blob1TranslateY.value = withRepeat(
            withSequence(
                withTiming(-20, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
        blob2TranslateY.value = withRepeat(
            withSequence(
                withTiming(30, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
        blob3TranslateY.value = withRepeat(
            withSequence(
                withTiming(-25, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 3500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const blob1Style = useAnimatedStyle(() => ({
        transform: [{ translateY: blob1TranslateY.value }],
    }));

    const blob2Style = useAnimatedStyle(() => ({
        transform: [{ translateY: blob2TranslateY.value }],
    }));

    const blob3Style = useAnimatedStyle(() => ({
        transform: [{ translateY: blob3TranslateY.value }],
    }));

    const { login, biometricEnabled } = useAuthStore();

    React.useEffect(() => {
        checkBiometric();
    }, []);

    const checkBiometric = async () => {
        const status = await biometricService.checkAvailability();
        setIsBiometricAvailable(status.available && biometricEnabled);
    };

    const handleBiometricLogin = async () => {
        hapticService.light();
        const success = await biometricService.authenticate();
        if (success) {
            showToast('Biyometrik doğrulama başarılı! (Credential storage not implemented yet)', 'success');
        }
    };

    const handleCheckEmail = async () => {
        hapticService.light();
        if (!email) {
            showToast('Lütfen e-posta adresinizi girin', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiService.auth.checkEmail(email);

            if (response.data.success) {
                const data = response.data.data;
                const tenantsList = data.tenants || (data.tenant ? [data.tenant] : []);

                if (tenantsList.length === 0) {
                    showToast('Bu e-posta adresi ile ilişkili bir çalışma alanı bulunamadı.', 'error');
                    return;
                }

                setTenants(tenantsList);
                setStep('tenant-selection');
            } else {
                showToast(response.data.message || 'E-posta kontrolü başarısız', 'error');
            }
        } catch (error: any) {
            showToast(error.message || 'Bir hata oluştu', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTenantSelect = (tenant: TenantInfo) => {
        hapticService.selection();
        setSelectedTenant(tenant);
        setStep('password');
    };

    const handleLogin = async () => {
        hapticService.light();
        if (!password || !selectedTenant) return;

        setIsLoading(true);
        try {
            await login({
                email,
                password,
                tenantCode: selectedTenant.code,
                tenantSignature: selectedTenant.signature,
                tenantTimestamp: selectedTenant.timestamp,
            });
            // Login success is handled in authStore (sets user, etc.)
            // Navigation is handled by AppNavigator based on auth state
        } catch (error: any) {
            // Error alert is already shown in authStore (removed now)
            console.error('Login failed:', error);

            let errorMessage = 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';

            // Handle specific error messages from backend or status codes
            if (error.response) {
                const status = error.response.status;
                if (status === 401) {
                    errorMessage = 'E-posta veya şifre hatalı.';
                } else if (status === 400) {
                    errorMessage = 'Giriş bilgileri hatalı. Lütfen kontrol edin.';
                } else if (status === 403) {
                    errorMessage = 'Giriş yetkiniz yok.';
                } else if (status === 429) {
                    errorMessage = 'Çok fazla deneme yaptınız. Lütfen bekleyin.';
                } else if (status >= 500) {
                    errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message) {
                // Fallback for other errors
                if (error.message.includes('Network Error')) {
                    errorMessage = 'İnternet bağlantınızı kontrol edin.';
                }
            }

            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (step === 'password') {
            setStep('tenant-selection');
            setPassword('');
        } else if (step === 'tenant-selection') {
            setStep('email');
            setTenants([]);
            setSelectedTenant(null);
        }
    };

    const renderEmailStep = () => (
        <Animated.View entering={FadeInRight.springify().delay(300)} exiting={FadeOutLeft}>
            <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>E-posta</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.surfaceLight }]}>
                    <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, { color: colors.textPrimary }]}
                        placeholder="ornek@sirket.com"
                        placeholderTextColor={colors.textMuted}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoFocus
                    />
                </View>
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.accent, shadowColor: colors.accent }]}
                onPress={handleCheckEmail}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>Devam Et</Text>
            </TouchableOpacity>

            {isBiometricAvailable && (
                <TouchableOpacity
                    style={[styles.biometricButton, { borderColor: colors.primary }]}
                    onPress={handleBiometricLogin}
                >
                    <Ionicons name="finger-print" size={24} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={[styles.biometricButtonText, { color: colors.primary }]}>Biyometrik Giriş</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );

    const renderTenantSelectionStep = () => (
        <Animated.View entering={FadeInRight.springify().delay(300)} exiting={FadeOutLeft}>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Çalışma Alanı Seçin</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>{email} için bulunan hesaplar:</Text>

            <ScrollView style={{ maxHeight: 300 }}>
                {tenants.map((tenant) => (
                    <TouchableOpacity
                        key={tenant.code}
                        style={[styles.tenantCard, { backgroundColor: colors.surface, borderColor: colors.surfaceLight }]}
                        onPress={() => handleTenantSelect(tenant)}
                    >
                        <View style={styles.tenantIcon}>
                            <Text style={[styles.tenantIconText, { color: colors.primary }]}>
                                {tenant.name?.[0]?.toUpperCase() || tenant.code?.[0]?.toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.tenantInfo}>
                            <Text style={[styles.tenantName, { color: colors.textPrimary }]}>{tenant.name || tenant.code}</Text>
                            <Text style={[styles.tenantDomain, { color: colors.textSecondary }]}>{tenant.code}.stoocker.app</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>Farklı bir e-posta kullan</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderPasswordStep = () => (
        <Animated.View entering={FadeInRight.springify().delay(300)} exiting={FadeOutLeft}>
            <View style={[styles.selectedTenantContainer, { backgroundColor: colors.surfaceLight + '20', borderColor: colors.primary + '40' }]}>
                <View style={[styles.tenantIconSmall, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.tenantIconTextSmall, { color: colors.primary }]}>
                        {selectedTenant?.name?.[0]?.toUpperCase() || selectedTenant?.code?.[0]?.toUpperCase()}
                    </Text>
                </View>
                <View>
                    <Text style={[styles.selectedTenantName, { color: colors.textPrimary }]}>{selectedTenant?.name || selectedTenant?.code}</Text>
                    <Text style={[styles.selectedTenantDomain, { color: colors.textSecondary }]}>{selectedTenant?.code}.stoocker.app</Text>
                </View>
                <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => setStep('tenant-selection')}>
                    <Text style={{ color: colors.primary, fontSize: 12 }}>Değiştir</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Şifre</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.surfaceLight }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                        key={showPassword ? 'text' : 'password'}
                        style={[styles.input, { color: colors.textPrimary }]}
                        placeholder="******"
                        placeholderTextColor={colors.textMuted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="password"
                        keyboardType="default"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.accent, shadowColor: colors.accent }]}
                onPress={handleLogin}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>Giriş Yap</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>Geri Dön</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Loading visible={isLoading} text="İşlem yapılıyor..." />
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={hideToast}
            />
            {/* Background Elements */}
            <Animated.View style={[styles.bgGradientTop, blob1Style, { backgroundColor: colors.primary }]} />
            <Animated.View style={[styles.bgGradientBottom, blob2Style, { backgroundColor: colors.secondary }]} />
            <Animated.View style={[styles.bgGradientCenter, blob3Style, { backgroundColor: colors.accent }]} />

            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Animated.View
                                entering={FadeInUp.delay(200).duration(1000).springify()}
                                style={styles.logoContainer}
                            >
                                <Image
                                    source={require('../../assets/images/stoocker.png')}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </Animated.View>
                            <Animated.Text
                                entering={FadeInDown.delay(400).duration(1000).springify()}
                                style={[styles.title, { color: colors.textPrimary }]}
                            >
                                Stocker
                            </Animated.Text>
                            <Animated.Text
                                entering={FadeInDown.delay(600).duration(1000).springify()}
                                style={[styles.subtitle, { color: colors.textSecondary }]}
                            >
                                Modern İşletme Yönetimi
                            </Animated.Text>
                        </View>

                        <View style={styles.form}>
                            {step === 'email' && renderEmailStep()}
                            {step === 'tenant-selection' && renderTenantSelectionStep()}
                            {step === 'password' && renderPasswordStep()}

                            {step === 'email' && (
                                <View style={styles.footer}>
                                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>Hesabınız yok mu? </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                        <Text style={[styles.linkText, { color: colors.primary }]}>Kayıt Olun</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    } as ViewStyle,
    bgGradientTop: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        opacity: 0.08,
        transform: [{ scale: 1.2 }],
    } as ViewStyle,
    bgGradientBottom: {
        position: 'absolute',
        bottom: -100,
        right: -100,
        width: width,
        height: width,
        borderRadius: width * 0.5,
        opacity: 0.08,
        transform: [{ scale: 1.2 }],
    } as ViewStyle,
    bgGradientCenter: {
        position: 'absolute',
        top: '40%',
        left: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        opacity: 0.05,
        transform: [{ scale: 1.5 }],
    } as ViewStyle,
    safeArea: {
        flex: 1,
    } as ViewStyle,
    keyboardView: {
        flex: 1,
    } as ViewStyle,
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.l,
    } as ViewStyle,
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    } as ViewStyle,
    logoContainer: {
        width: 160,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.m,
    } as ViewStyle,
    logo: {
        width: '100%',
        height: '100%',
    } as ImageStyle,
    title: {
        ...typography.h1,
        marginBottom: spacing.xs,
    } as TextStyle,
    subtitle: {
        ...typography.body,
    } as TextStyle,
    form: {
        width: '100%',
        minHeight: 200, // Prevent layout jump
    } as ViewStyle,
    inputContainer: {
        marginBottom: spacing.l,
    } as ViewStyle,
    label: {
        marginBottom: spacing.s,
        fontSize: 14,
        fontWeight: '500',
    } as TextStyle,
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
    } as ViewStyle,
    inputIcon: {
        marginLeft: spacing.m,
        marginRight: spacing.s,
    } as TextStyle,
    input: {
        flex: 1,
        padding: spacing.m,
        fontSize: 16,
    } as TextStyle,
    passwordToggle: {
        padding: spacing.s,
        marginRight: spacing.xs,
    } as ViewStyle,
    button: {
        borderRadius: 12,
        padding: spacing.m,
        alignItems: 'center',
        marginTop: spacing.s,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    } as ViewStyle,
    buttonText: {
        color: '#0a1f2e',
        fontSize: 16,
        fontWeight: 'bold',
    } as TextStyle,
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.xl,
    } as ViewStyle,
    footerText: {
        fontSize: 14,
    } as TextStyle,
    linkText: {
        fontSize: 14,
        fontWeight: 'bold',
    } as TextStyle,
    stepTitle: {
        ...typography.h3,
        marginBottom: spacing.xs,
    } as TextStyle,
    stepSubtitle: {
        ...typography.body,
        marginBottom: spacing.l,
    } as TextStyle,
    tenantCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: 12,
        marginBottom: spacing.m,
        borderWidth: 1,
    } as ViewStyle,
    tenantIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    } as ViewStyle,
    tenantIconText: {
        fontSize: 20,
        fontWeight: 'bold',
    } as TextStyle,
    tenantInfo: {
        flex: 1,
    } as ViewStyle,
    tenantName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    } as TextStyle,
    tenantDomain: {
        fontSize: 12,
    } as TextStyle,
    backButton: {
        alignItems: 'center',
        padding: spacing.m,
        marginTop: spacing.s,
    } as ViewStyle,
    backButtonText: {
        fontSize: 14,
    } as TextStyle,
    selectedTenantContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: 12,
        marginBottom: spacing.l,
        borderWidth: 1,
    } as ViewStyle,
    tenantIconSmall: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    } as ViewStyle,
    tenantIconTextSmall: {
        fontSize: 14,
        fontWeight: 'bold',
    } as TextStyle,
    selectedTenantName: {
        fontSize: 14,
        fontWeight: 'bold',
    } as TextStyle,
    selectedTenantDomain: {
        fontSize: 12,
    } as TextStyle,
    biometricButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.m,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: spacing.m,
    } as ViewStyle,
    biometricButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    } as TextStyle,
});
