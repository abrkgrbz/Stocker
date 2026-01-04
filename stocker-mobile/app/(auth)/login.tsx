import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    FadeOut,
    SlideInRight,
    SlideOutLeft,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolateColor,
} from 'react-native-reanimated';
import { api } from '@/lib/axios';
import { authStorage, Tenant } from '@/lib/auth-store';
import {
    checkBiometricStatus,
    getBiometricCredentials,
    getBiometricName,
    isBiometricEnabled,
    hasBiometricCredentials,
    BiometricStatus,
} from '@/lib/biometric-auth';
import { ArrowLeft, Building2, Mail, Lock, Eye, EyeOff, AlertTriangle, ChevronRight, Check, Fingerprint, ScanFace } from 'lucide-react-native';
import { Logo } from '@/components/ui/Logo';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { selectionHaptic, lightHaptic, successHaptic, errorHaptic } from '@/lib/haptics';
import { shakeAnimation } from '@/lib/animations';
import { ValueCarouselCompact } from '@/components/landing/ValueCarousel';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { GlassCard } from '@/components/ui/GlassContainer';
import { useTheme } from '@/lib/theme';
import { useRateLimiter, logSecurityEvent } from '@/lib/security';
import { SecurityBanner } from '@/components/ui/SecurityBanner';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Step indicator component - refined with softer styling
function StepIndicator({ currentStep, isDark }: { currentStep: 'email' | 'tenant-selection' | 'password'; isDark?: boolean }) {
    const steps = ['email', 'tenant-selection', 'password'];
    const currentIndex = steps.indexOf(currentStep);

    const activeColor = isDark ? '#f8fafc' : '#0f172a';
    const inactiveColor = isDark ? '#334155' : '#f1f5f9';
    const lineColor = isDark ? '#475569' : '#e2e8f0';
    const textColor = isDark ? '#94a3b8' : '#94a3b8';

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
            {steps.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isInactive = !isCompleted && !isCurrent;

                return (
                    <View key={step} style={{ flexDirection: 'row', alignItems: 'center', opacity: isInactive ? 0.4 : 1 }}>
                        <View
                            style={{
                                width: 26,
                                height: 26,
                                borderRadius: 13,
                                backgroundColor: isCompleted || isCurrent ? activeColor : inactiveColor,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {isCompleted ? (
                                <Check size={12} color={isDark ? '#0f172a' : '#fff'} strokeWidth={3} />
                            ) : (
                                <Text style={{ color: isCurrent ? (isDark ? '#0f172a' : '#fff') : textColor, fontSize: 11, fontWeight: '600' }}>
                                    {index + 1}
                                </Text>
                            )}
                        </View>
                        {index < steps.length - 1 && (
                            <View
                                style={{
                                    width: 28,
                                    height: 1.5,
                                    backgroundColor: index < currentIndex ? activeColor : lineColor,
                                    marginLeft: 8,
                                }}
                            />
                        )}
                    </View>
                );
            })}
        </View>
    );
}

// Animated Input component with modern styling
function AnimatedInput({
    value,
    onChangeText,
    placeholder,
    icon: Icon,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
    autoComplete,
    onSubmitEditing,
    rightElement,
    autoFocus,
}: {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    icon: any;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address';
    autoCapitalize?: 'none' | 'sentences';
    autoComplete?: 'email' | 'password';
    onSubmitEditing?: () => void;
    rightElement?: React.ReactNode;
    autoFocus?: boolean;
}) {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useSharedValue(0);
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        focusAnim.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    }, [isFocused]);

    useEffect(() => {
        if (autoFocus) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [autoFocus]);

    const animatedContainerStyle = useAnimatedStyle(() => {
        'worklet';
        return {
            borderColor: interpolateColor(
                focusAnim.value,
                [0, 1],
                ['transparent', '#6366f1']
            ),
            borderWidth: 1.5,
            // Shadow removed to prevent jitter - using border only
        };
    });

    return (
        <Animated.View
            style={[
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    height: 56,
                },
                animatedContainerStyle,
            ]}
        >
            <Icon size={20} color={isFocused ? '#6366f1' : '#94a3b8'} />
            <TextInput
                ref={inputRef}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                style={{
                    flex: 1,
                    marginLeft: 12,
                    color: '#0f172a',
                    fontSize: 16,
                }}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                autoComplete={autoComplete}
                onSubmitEditing={onSubmitEditing}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
            {rightElement}
        </Animated.View>
    );
}

// Animated Tenant Card with refined styling
function TenantCard({
    tenant,
    onPress,
    delay = 0,
}: {
    tenant: Tenant;
    onPress: () => void;
    delay?: number;
}) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(scale.value, { damping: 15, stiffness: 400 }) }],
    }));

    const handlePressIn = () => {
        scale.value = 0.97;
    };

    const handlePressOut = () => {
        scale.value = 1;
    };

    const handlePress = () => {
        selectionHaptic();
        onPress();
    };

    return (
        <Animated.View entering={FadeInUp.duration(400).delay(delay)}>
            <AnimatedPressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    {
                        width: '100%',
                        padding: 16,
                        backgroundColor: 'rgba(255, 255, 255, 0.4)',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                    },
                    animatedStyle,
                ]}
            >
                <View
                    style={{
                        width: 48,
                        height: 48,
                        backgroundColor: '#0f172a',
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>
                        {tenant.name?.[0]?.toUpperCase() || '?'}
                    </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={{ fontWeight: '600', color: '#0f172a', fontSize: 16 }}>
                        {tenant.name || tenant.code}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                        {tenant.domain || `${tenant.code}.stoocker.app`}
                    </Text>
                </View>
                <ChevronRight size={20} color="#94a3b8" />
            </AnimatedPressable>
        </Animated.View>
    );
}

export default function LoginScreen() {
    const router = useRouter();
    const { isDark, colors } = useTheme();

    // Theme-aware colors
    const textPrimary = isDark ? '#f8fafc' : '#0f172a';
    const textSecondary = isDark ? '#94a3b8' : '#64748b';
    const textTertiary = isDark ? '#64748b' : '#94a3b8';
    const inputBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.4)';
    const inputBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.3)';

    // State
    const [step, setStep] = useState<'email' | 'tenant-selection' | 'password'>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Biometric state
    const [biometricStatus, setBiometricStatus] = useState<BiometricStatus | null>(null);
    const [biometricAvailable, setBiometricAvailable] = useState(false);

    // Rate limiter for login attempts
    const rateLimiter = useRateLimiter('login', {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
        lockoutMs: 30 * 60 * 1000, // 30 minutes lockout
    });

    // Animation values
    const formShake = useSharedValue(0);
    const formShakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: formShake.value }],
    }));

    // Trigger shake animation on error
    const triggerShake = useCallback(() => {
        errorHaptic();
        shakeAnimation(formShake);
    }, []);

    // Check biometric availability on mount
    useEffect(() => {
        const checkBiometric = async () => {
            const status = await checkBiometricStatus();
            setBiometricStatus(status);

            if (status.isAvailable && status.isEnrolled) {
                const enabled = await isBiometricEnabled();
                const hasCredentials = await hasBiometricCredentials();
                setBiometricAvailable(enabled && hasCredentials);
            }
        };
        checkBiometric();
    }, []);

    // Handle biometric login
    const handleBiometricLogin = async () => {
        if (!biometricAvailable || !biometricStatus) return;

        setLoading(true);
        setError('');

        try {
            const credentials = await getBiometricCredentials();

            if (!credentials) {
                setError('Biyometrik giriş iptal edildi');
                setLoading(false);
                return;
            }

            // Use stored credentials to login
            const response = await api.post('/auth/login-with-token', {
                email: credentials.email,
                tenantCode: credentials.tenantCode,
                authToken: credentials.authToken,
            });

            const data = response.data;

            if (data.success || data.data) {
                const { accessToken, refreshToken, user } = data.data || data;

                if (accessToken) {
                    await authStorage.setTokens(accessToken, refreshToken);
                }
                if (user) {
                    await authStorage.setUser(user);
                }

                successHaptic();
                router.replace('/(dashboard)');
            } else {
                setError('Biyometrik giriş başarısız. Lütfen şifrenizle giriş yapın.');
            }
        } catch (error: any) {
            console.error('Biometric login error:', error);
            setError('Biyometrik giriş başarısız. Lütfen şifrenizle giriş yapın.');
        } finally {
            setLoading(false);
        }
    };

    // Email validation helper
    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Step 1: E-posta Kontrolü
    const handleEmailSubmit = async () => {
        if (!email) {
            setError('E-posta adresi gerekli');
            triggerShake();
            return;
        }

        if (!isValidEmail(email)) {
            setError('Geçerli bir e-posta adresi girin');
            triggerShake();
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/public/check-email', { email });
            const data = response.data;

            if (!data.success) {
                setError(data.message || 'E-posta bulunamadı');
                triggerShake();
                return;
            }

            // Check if user exists
            if (!data.data?.exists) {
                setError('Bu e-posta adresi ile kayıtlı hesap bulunamadı');
                triggerShake();
                return;
            }

            const tenantsList = data.data?.tenants || [];
            if (tenantsList.length === 0) {
                setError('Bu e-posta için çalışma alanı bulunamadı');
                triggerShake();
                return;
            }

            setTenants(tenantsList);
            setStep('tenant-selection');
        } catch (error: any) {
            console.error('Check email error:', error);
            const msg = error.response?.data?.message || 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.';
            setError(msg);
            triggerShake();
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Çalışma Alanı Seçimi
    const handleTenantSelect = (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setStep('password');
        setError('');
    };

    // Step 3: Giriş
    const handleLogin = async () => {
        // Check rate limit before attempting login
        if (rateLimiter.isLocked) {
            setError(rateLimiter.message || 'Çok fazla deneme. Lütfen bekleyin.');
            triggerShake();
            return;
        }

        if (!password || !selectedTenant) {
            setError('Şifre gerekli');
            triggerShake();
            return;
        }
        setLoading(true);
        setError('');

        // Log login attempt
        logSecurityEvent({ type: 'login_attempt', details: { email, tenant: selectedTenant.code } });

        try {
            const payload = {
                email,
                password,
                tenantCode: selectedTenant.code,
                tenantSignature: selectedTenant.signature || '',
                tenantTimestamp: selectedTenant.timestamp || Date.now(),
            };

            const response = await api.post('/auth/login', payload);
            const data = response.data;

            if (data.success || data.data) {
                const { accessToken, refreshToken, user } = data.data || data;

                // Record successful attempt - resets rate limit
                await rateLimiter.recordAttempt(true);
                logSecurityEvent({ type: 'login_success', details: { email, tenant: selectedTenant.code } });

                if (accessToken) {
                    await authStorage.setTokens(accessToken, refreshToken);
                }
                if (user) {
                    await authStorage.setUser(user);
                }
                await authStorage.setTenant(selectedTenant);

                successHaptic();
                router.replace('/(dashboard)');
            } else {
                // Record failed attempt
                const result = await rateLimiter.recordAttempt(false);
                logSecurityEvent({ type: 'login_failure', details: { email, tenant: selectedTenant.code } });

                if (result?.message) {
                    setError(result.message);
                } else {
                    setError(data.message || 'E-posta veya şifre hatalı');
                }
                triggerShake();
            }
        } catch (error: any) {
            console.error(error);
            // Record failed attempt
            const result = await rateLimiter.recordAttempt(false);
            logSecurityEvent({ type: 'login_failure', details: { email, error: error.message } });

            if (result?.message) {
                setError(result.message);
            } else {
                const msg = error.response?.data?.message || 'Giriş başarısız';
                setError(msg);
            }
            triggerShake();
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        lightHaptic();
        setError('');
        if (step === 'password') {
            setStep('tenant-selection');
            setPassword('');
        } else if (step === 'tenant-selection') {
            setStep('email');
            setTenants([]);
        } else {
            router.back();
        }
    };

    return (
        <AuroraBackground variant="subtle">
            <SafeAreaView className="flex-1">
                {/* Rate Limit Security Banner */}
                <SecurityBanner
                    type={rateLimiter.isLocked ? 'locked' : 'rate_limit'}
                    message={rateLimiter.message || `${rateLimiter.remainingAttempts} deneme hakkınız kaldı`}
                    visible={rateLimiter.isLocked || (rateLimiter.remainingAttempts < 3 && rateLimiter.remainingAttempts > 0)}
                    remainingTime={rateLimiter.lockoutRemainingMs ? Math.ceil(rateLimiter.lockoutRemainingMs / 1000) : undefined}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    {/* Header */}
                    <Animated.View
                        entering={FadeIn.duration(300)}
                        className="px-6 py-4 flex-row items-center"
                    >
                        <Pressable onPress={goBack} className="p-2 -ml-2 active:opacity-70">
                            <ArrowLeft size={24} color="#0f172a" />
                        </Pressable>
                    </Animated.View>

                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Logo */}
                        <Animated.View
                            entering={FadeInDown.duration(500).delay(100)}
                            className="items-center mb-6"
                        >
                            <Logo size="lg" variant="color" showText={false} />
                        </Animated.View>

                        {/* Step Indicator */}
                        <Animated.View entering={FadeInDown.duration(400).delay(150)}>
                            <StepIndicator currentStep={step} />
                        </Animated.View>

                        {/* Header Text */}
                        <Animated.View
                            entering={FadeInDown.duration(500).delay(200)}
                            className="mb-6"
                        >
                            <Text className="text-2xl font-bold text-slate-900 mb-2">
                                {step === 'email' && 'Hesabınıza giriş yapın'}
                                {step === 'tenant-selection' && 'Çalışma alanı seçin'}
                                {step === 'password' && 'Şifrenizi girin'}
                            </Text>
                            <Text className="text-slate-500">
                                {step === 'email' && 'E-posta adresinizi girerek başlayın'}
                                {step === 'tenant-selection' && `${email} için erişilebilir alanlar`}
                                {step === 'password' && `${selectedTenant?.name || selectedTenant?.code} hesabına giriş`}
                            </Text>
                        </Animated.View>

                    {/* Selected Tenant Badge (Password Step) */}
                    {step === 'password' && selectedTenant && (
                        <Animated.View
                            entering={FadeInDown.duration(400)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                                padding: 16,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                marginBottom: 24,
                            }}
                        >
                            <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 bg-slate-900 rounded-lg items-center justify-center mr-3">
                                    <Building2 size={20} color="#ffffff" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-semibold text-slate-900">{selectedTenant.name}</Text>
                                    <Text className="text-xs text-slate-500">{selectedTenant.code}.stoocker.app</Text>
                                </View>
                            </View>
                            <Pressable onPress={() => setStep('tenant-selection')} className="p-2">
                                <Text className="text-slate-900 font-medium">Değiştir</Text>
                            </Pressable>
                        </Animated.View>
                    )}

                    {/* Error Message */}
                    {error ? (
                        <Animated.View
                            entering={FadeIn.duration(300)}
                            className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex-row items-start"
                        >
                            <AlertTriangle size={20} color="#ef4444" style={{ marginRight: 12, marginTop: 2 }} />
                            <Text className="text-sm text-red-600 flex-1">{error}</Text>
                        </Animated.View>
                    ) : null}

                    {/* Forms */}
                    {step === 'email' && (
                        <Animated.View
                            entering={FadeInUp.duration(500).delay(300)}
                            style={[{ gap: 16 }, formShakeStyle]}
                        >
                            <View>
                                <Text className="text-sm font-medium text-slate-700 mb-2">E-posta Adresi</Text>
                                <AnimatedInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="ornek@sirket.com"
                                    icon={Mail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    onSubmitEditing={handleEmailSubmit}
                                    autoFocus={true}
                                />
                            </View>

                            <AnimatedButton
                                title="Devam et"
                                variant="primary"
                                loading={loading}
                                disabled={!email}
                                onPress={handleEmailSubmit}
                            />

                            {/* Biometric Login Button */}
                            {biometricAvailable && biometricStatus && (
                                <Animated.View
                                    entering={FadeIn.duration(300).delay(400)}
                                    style={{ marginTop: 8 }}
                                >
                                    <Pressable
                                        onPress={handleBiometricLogin}
                                        disabled={loading}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            paddingVertical: 14,
                                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                            borderRadius: 16,
                                            borderWidth: 1,
                                            borderColor: 'rgba(99, 102, 241, 0.2)',
                                            gap: 10,
                                        }}
                                    >
                                        {biometricStatus.biometricType === 'facial' ? (
                                            <ScanFace size={22} color="#6366f1" />
                                        ) : (
                                            <Fingerprint size={22} color="#6366f1" />
                                        )}
                                        <Text style={{ color: '#6366f1', fontWeight: '600', fontSize: 15 }}>
                                            {getBiometricName(biometricStatus.biometricType)} ile giriş yap
                                        </Text>
                                    </Pressable>
                                </Animated.View>
                            )}

                            {/* Divider */}
                            {biometricAvailable && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
                                    <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(148, 163, 184, 0.3)' }} />
                                    <Text style={{ marginHorizontal: 16, color: '#94a3b8', fontSize: 13 }}>veya</Text>
                                    <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(148, 163, 184, 0.3)' }} />
                                </View>
                            )}

                            <View className="flex-row items-center justify-center mt-2">
                                <Text className="text-slate-500 text-sm">Hesabınız yok mu? </Text>
                                <Pressable onPress={() => router.push('/(auth)/register')}>
                                    <Text className="text-slate-900 font-semibold text-sm">Ücretsiz başlayın</Text>
                                </Pressable>
                            </View>
                        </Animated.View>
                    )}

                    {step === 'tenant-selection' && (
                        <Animated.View
                            entering={FadeInUp.duration(500)}
                            style={{ gap: 12 }}
                        >
                            {tenants.map((t, index) => (
                                <TenantCard
                                    key={t.code}
                                    tenant={t}
                                    onPress={() => handleTenantSelect(t)}
                                    delay={index * 100}
                                />
                            ))}

                            <Pressable onPress={() => setStep('email')} className="mt-4 items-center py-3">
                                <Text className="text-slate-500 font-medium">← Farklı e-posta kullan</Text>
                            </Pressable>
                        </Animated.View>
                    )}

                    {step === 'password' && (
                        <Animated.View
                            entering={FadeInUp.duration(500)}
                            style={[{ gap: 16 }, formShakeStyle]}
                        >
                            <View>
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-sm font-medium text-slate-700">Şifre</Text>
                                    <Pressable>
                                        <Text className="text-sm text-slate-500">Şifremi unuttum</Text>
                                    </Pressable>
                                </View>
                                <AnimatedInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="••••••••"
                                    icon={Lock}
                                    secureTextEntry={!showPassword}
                                    autoComplete="password"
                                    onSubmitEditing={handleLogin}
                                    autoFocus={true}
                                    rightElement={
                                        <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2">
                                            {showPassword ? (
                                                <EyeOff size={20} color="#94a3b8" />
                                            ) : (
                                                <Eye size={20} color="#94a3b8" />
                                            )}
                                        </Pressable>
                                    }
                                />
                            </View>

                            <AnimatedButton
                                title={rateLimiter.isLocked ? 'Hesap Kilitli' : 'Giriş yap'}
                                variant="primary"
                                loading={loading}
                                disabled={!password || rateLimiter.isLocked}
                                onPress={handleLogin}
                            />

                            <Pressable
                                onPress={() => {
                                    setStep('email');
                                    setSelectedTenant(null);
                                    setPassword('');
                                    setTenants([]);
                                }}
                                className="items-center py-3"
                            >
                                <Text className="text-slate-500 font-medium">← Farklı hesap kullan</Text>
                            </Pressable>
                        </Animated.View>
                    )}

                        {/* Value Carousel - Only on email step */}
                        {step === 'email' && (
                            <Animated.View
                                entering={FadeInUp.duration(600).delay(500)}
                                className="mt-8"
                            >
                                <GlassCard padding={16} style={{ borderRadius: 20 }}>
                                    <ValueCarouselCompact />
                                </GlassCard>
                            </Animated.View>
                        )}

                        {/* Footer */}
                        <Animated.View
                            entering={FadeIn.duration(500).delay(600)}
                            className="mt-auto pt-8 pb-4"
                        >
                            <View className="flex-row items-center justify-center" style={{ gap: 24 }}>
                                <Pressable>
                                    <Text className="text-slate-400 text-sm">Gizlilik</Text>
                                </Pressable>
                                <Pressable>
                                    <Text className="text-slate-400 text-sm">Şartlar</Text>
                                </Pressable>
                                <Pressable>
                                    <Text className="text-slate-400 text-sm">Yardım</Text>
                                </Pressable>
                            </View>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </AuroraBackground>
    );
}
