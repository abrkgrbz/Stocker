import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Image,
    ScrollView,
    TouchableOpacity,
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
} from 'react-native-reanimated';
import { Loading } from '../components/Loading';
import { Toast } from '../components/Toast';
import { biometricService } from '../services/biometric';
import { hapticService } from '../services/haptic';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { LinearGradient } from 'expo-linear-gradient';
import { DotBackground } from '../../components/ui/DotBackground';

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
    const { colors, theme, toggleTheme } = useTheme();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tenants, setTenants] = useState<TenantInfo[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<TenantInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'error' as 'success' | 'error' | 'info' });
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
        setToast({ visible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, visible: false });
    };

    const { login, biometricEnabled } = useAuthStore();

    useEffect(() => {
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
        } catch (error: any) {
            console.error('Login failed:', error);
            let errorMessage = 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';

            if (error.response) {
                const status = error.response.status;
                if (status === 401) {
                    errorMessage = 'E-posta veya şifre hatalı.';
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
            <Input
                label="E-posta"
                placeholder="ornek@sirket.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoFocus
                containerStyle={{ marginBottom: 24 }}
            />

            <Button
                title="Devam Et"
                onPress={handleCheckEmail}
                loading={isLoading}
                variant="primary"
                style={styles.mainButton}
            />

            {isBiometricAvailable && (
                <Button
                    title="Biyometrik Giriş"
                    onPress={handleBiometricLogin}
                    variant="ghost"
                    icon={<Ionicons name="finger-print" size={20} color={colors.primary} />}
                    style={{ marginTop: 12 }}
                />
            )}
        </Animated.View>
    );

    const renderTenantSelectionStep = () => (
        <Animated.View entering={FadeInRight.springify().delay(300)} exiting={FadeOutLeft}>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Çalışma Alanı Seçin</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>{email} için bulunan hesaplar:</Text>

            <ScrollView style={{ maxHeight: 300 }}>
                {tenants.map((tenant) => (
                    <Card
                        key={tenant.code}
                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                        // @ts-ignore
                        onTouchEnd={() => handleTenantSelect(tenant)}
                    >
                        <View style={[styles.tenantIcon, { backgroundColor: theme === 'dark' ? '#4B5563' : '#E5E7EB' }]}>
                            <Text style={[styles.tenantIconText, { color: theme === 'dark' ? '#F3F4F6' : '#1F2937' }]}>
                                {tenant.name?.[0]?.toUpperCase() || tenant.code?.[0]?.toUpperCase()}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.tenantName, { color: theme === 'dark' ? '#F3F4F6' : '#1F2937' }]}>{tenant.name || tenant.code}</Text>
                            <Text style={[styles.tenantDomain, { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }]}>{tenant.code}.stoocker.app</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                    </Card>
                ))}
            </ScrollView>

            <Button
                title="Farklı bir e-posta kullan"
                onPress={handleBack}
                variant="ghost"
                style={{ marginTop: 16 }}
            />
        </Animated.View>
    );

    const renderPasswordStep = () => (
        <Animated.View entering={FadeInRight.springify().delay(300)} exiting={FadeOutLeft}>
            <View style={[styles.selectedTenantContainer, {
                backgroundColor: theme === 'dark' ? '#374151' : '#F9FAFB', // Dark: Gray 700, Light: Light Gray 50
                borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB' // Dark: Gray 600, Light: Gray 200
            }]}>
                <View style={[styles.tenantIconSmall, { backgroundColor: theme === 'dark' ? '#4B5563' : '#E5E7EB' }]}>
                    <Text style={[styles.tenantIconTextSmall, { color: theme === 'dark' ? '#F3F4F6' : '#1F2937' }]}>
                        {selectedTenant?.name?.[0]?.toUpperCase() || selectedTenant?.code?.[0]?.toUpperCase()}
                    </Text>
                </View>
                <View>
                    <Text style={[styles.selectedTenantName, { color: theme === 'dark' ? '#F3F4F6' : '#1F2937' }]}>{selectedTenant?.name || selectedTenant?.code}</Text>
                    <Text style={[styles.selectedTenantDomain, { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }]}>{selectedTenant?.code}.stoocker.app</Text>
                </View>
                <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => setStep('tenant-selection')}>
                    <Text style={{ color: theme === 'dark' ? '#60A5FA' : '#2563EB', fontSize: 13, fontWeight: '600' }}>Değiştir</Text>
                </TouchableOpacity>
            </View>

            <Input
                label="Şifre"
                placeholder="******"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                containerStyle={{ marginBottom: 24 }}
            />

            <Button
                title="Giriş Yap"
                onPress={handleLogin}
                loading={isLoading}
                variant="primary"
                style={styles.mainButton}
            />

            <Button
                title="Şifremi Unuttum"
                onPress={() => navigation.navigate('ForgotPassword')}
                variant="ghost"
                style={{ marginTop: 12 }}
            />

            <Button
                title="Geri Dön"
                onPress={handleBack}
                variant="ghost"
                style={{ marginTop: 4 }}
            />
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

            {/* Background Pattern similar to Web Landing */}
            <View style={StyleSheet.absoluteFill}>
                <DotBackground />
                <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', colors.background]}
                    locations={[0, 0.6, 1]}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            <SafeAreaView style={styles.safeArea}>
                {/* Theme Toggle Button */}
                <TouchableOpacity
                    style={styles.themeToggle}
                    onPress={toggleTheme}
                >
                    <Ionicons
                        name={theme === 'dark' ? 'moon' : 'sunny'}
                        size={24}
                        color={colors.textSecondary}
                    />
                </TouchableOpacity>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.header}>
                            <Animated.View
                                entering={FadeInUp.delay(200).duration(1000).springify()}
                                style={styles.logoContainer}
                            >
                                <Image
                                    source={
                                        theme === 'dark'
                                            ? require('../../assets/images/stoocker_white.png')
                                            : require('../../assets/images/stoocker_black.png')
                                    }
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </Animated.View>
                            {/* Removed redundant "Stoocker" text */}
                            <Animated.Text
                                entering={FadeInDown.delay(600).duration(1000).springify()}
                                style={[
                                    styles.subtitle,
                                    {
                                        color: theme === 'dark' ? '#F3F4F6' : colors.textSecondary, // Ensure visibility in dark mode
                                        marginTop: 12
                                    }
                                ]}
                            >
                                Modern İşletme Yönetimi
                            </Animated.Text>
                        </View>

                        <View style={styles.formCard}>
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
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    themeToggle: {
        position: 'absolute',
        top: 50, // Adjust based on SafeArea
        right: 24,
        zIndex: 10,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.l,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logoContainer: {
        width: '100%', // Allow full width
        height: 300, // Increased to 300 to allow square/tall logos to grow significantly (2.5x of previous 120)
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
    },
    formCard: {
        width: '100%',
    },
    mainButton: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    stepSubtitle: {
        fontSize: 14,
        marginBottom: 24,
    },
    tenantIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    tenantIconText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    tenantName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    tenantDomain: {
        fontSize: 12,
    },
    selectedTenantContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
    },
    tenantIconSmall: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    tenantIconTextSmall: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    selectedTenantName: {
        fontSize: 14,
        fontWeight: '600',
    },
    selectedTenantDomain: {
        fontSize: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        fontSize: 14,
    },
    linkText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
