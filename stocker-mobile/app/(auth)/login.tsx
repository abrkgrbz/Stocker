import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { api } from '@/lib/axios';
import { authStorage, Tenant } from '@/lib/auth-store';
import { ArrowLeft, Building2, Mail, Lock, Eye, EyeOff, AlertTriangle, ChevronRight } from 'lucide-react-native';
import { Logo } from '@/components/ui/Logo';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

// Testimonials from stocker-nextjs
const TESTIMONIALS = [
    {
        id: 1,
        quote: "Stoocker ile stok yönetimimiz tamamen değişti. Artık her şey tek bir yerden takip ediliyor.",
        author: "Ahmet Yılmaz",
        role: "Operasyon Müdürü",
        company: "TechCorp",
        initials: "AY",
    },
    {
        id: 2,
        quote: "Envanter takibi hiç bu kadar kolay olmamıştı. Stok maliyetlerimizi %30 azalttık.",
        author: "Elif Demir",
        role: "Satın Alma Direktörü",
        company: "RetailPlus",
        initials: "ED",
    },
    {
        id: 3,
        quote: "Müşteri desteği mükemmel. Her sorumuz anında çözüme kavuşuyor.",
        author: "Mehmet Kaya",
        role: "Genel Müdür",
        company: "LogiTech",
        initials: "MK",
    },
];

export default function LoginScreen() {
    const router = useRouter();

    // State
    const [step, setStep] = useState<'email' | 'tenant-selection' | 'password'>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Testimonial slider
    const [testimonialIndex, setTestimonialIndex] = useState(0);

    // Auto-rotate testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    // Step 1: E-posta Kontrolü
    const handleEmailSubmit = async () => {
        if (!email) {
            setError('E-posta adresi gerekli');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/public/check-email', { email });
            const data = response.data;

            if (!data.success) {
                setError(data.message || 'E-posta bulunamadı');
                return;
            }

            // Check if user exists
            if (!data.data?.exists) {
                setError('Bu e-posta adresi ile kayıtlı hesap bulunamadı');
                return;
            }

            const tenantsList = data.data?.tenants || [];
            if (tenantsList.length === 0) {
                setError('Bu e-posta için çalışma alanı bulunamadı');
                return;
            }

            setTenants(tenantsList);
            setStep('tenant-selection');
        } catch (error: any) {
            console.error('Check email error:', error);
            const msg = error.response?.data?.message || 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.';
            setError(msg);
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
        if (!password || !selectedTenant) {
            setError('Şifre gerekli');
            return;
        }
        setLoading(true);
        setError('');

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

                if (accessToken) {
                    await authStorage.setTokens(accessToken, refreshToken);
                }
                if (user) {
                    await authStorage.setUser(user);
                }
                await authStorage.setTenant(selectedTenant);

                router.replace('/(dashboard)');
            } else {
                setError(data.message || 'E-posta veya şifre hatalı');
            }
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Giriş başarısız';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
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

    const currentTestimonial = TESTIMONIALS[testimonialIndex];

    return (
        <SafeAreaView className="flex-1 bg-white">
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
                            className="flex-row items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6"
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
                            style={{ gap: 16 }}
                        >
                            <View>
                                <Text className="text-sm font-medium text-slate-700 mb-2">E-posta Adresi</Text>
                                <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4">
                                    <Mail size={20} color="#94a3b8" />
                                    <TextInput
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="ornek@sirket.com"
                                        placeholderTextColor="#94a3b8"
                                        className="flex-1 py-4 ml-3 text-slate-900 text-base"
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        autoComplete="email"
                                        onSubmitEditing={handleEmailSubmit}
                                    />
                                </View>
                            </View>

                            <AnimatedButton
                                title="Devam et"
                                variant="primary"
                                loading={loading}
                                disabled={!email}
                                onPress={handleEmailSubmit}
                            />

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
                                <Animated.View
                                    key={t.code}
                                    entering={FadeInUp.duration(400).delay(index * 100)}
                                >
                                    <Pressable
                                        onPress={() => handleTenantSelect(t)}
                                        className="w-full p-4 bg-white border border-slate-200 rounded-xl active:bg-slate-50 flex-row items-center"
                                    >
                                        <View className="w-12 h-12 bg-slate-900 rounded-xl items-center justify-center">
                                            <Text className="text-white font-bold text-lg">{t.name?.[0]?.toUpperCase() || '?'}</Text>
                                        </View>
                                        <View className="flex-1 ml-4">
                                            <Text className="font-semibold text-slate-900 text-base">{t.name || t.code}</Text>
                                            <Text className="text-sm text-slate-500">{t.domain || `${t.code}.stoocker.app`}</Text>
                                        </View>
                                        <ChevronRight size={20} color="#94a3b8" />
                                    </Pressable>
                                </Animated.View>
                            ))}

                            <Pressable onPress={() => setStep('email')} className="mt-4 items-center py-3">
                                <Text className="text-slate-500 font-medium">← Farklı e-posta kullan</Text>
                            </Pressable>
                        </Animated.View>
                    )}

                    {step === 'password' && (
                        <Animated.View
                            entering={FadeInUp.duration(500)}
                            style={{ gap: 16 }}
                        >
                            <View>
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-sm font-medium text-slate-700">Şifre</Text>
                                    <Pressable>
                                        <Text className="text-sm text-slate-500">Şifremi unuttum</Text>
                                    </Pressable>
                                </View>
                                <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4">
                                    <Lock size={20} color="#94a3b8" />
                                    <TextInput
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        placeholder="••••••••"
                                        placeholderTextColor="#94a3b8"
                                        className="flex-1 py-4 ml-3 text-slate-900 text-base"
                                        autoComplete="password"
                                        onSubmitEditing={handleLogin}
                                    />
                                    <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2">
                                        {showPassword ? (
                                            <EyeOff size={20} color="#94a3b8" />
                                        ) : (
                                            <Eye size={20} color="#94a3b8" />
                                        )}
                                    </Pressable>
                                </View>
                            </View>

                            <AnimatedButton
                                title="Giriş yap"
                                variant="primary"
                                loading={loading}
                                disabled={!password}
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

                    {/* Testimonial Card - Only on email step */}
                    {step === 'email' && (
                        <Animated.View
                            entering={FadeInUp.duration(600).delay(500)}
                            className="mt-8 bg-slate-50 rounded-2xl p-5"
                        >
                            {/* Quote Icon */}
                            <Text className="text-slate-300 text-3xl font-serif mb-2">"</Text>

                            <Text className="text-slate-700 text-base leading-relaxed mb-4">
                                {currentTestimonial.quote}
                            </Text>

                            <View className="flex-row items-center">
                                <View className="w-9 h-9 bg-slate-900 rounded-full items-center justify-center mr-3">
                                    <Text className="text-white font-semibold text-sm">{currentTestimonial.initials}</Text>
                                </View>
                                <View>
                                    <Text className="text-slate-900 font-medium text-sm">{currentTestimonial.author}</Text>
                                    <Text className="text-slate-500 text-xs">{currentTestimonial.role}, {currentTestimonial.company}</Text>
                                </View>
                            </View>

                            {/* Dots */}
                            <View className="flex-row items-center justify-center mt-4" style={{ gap: 6 }}>
                                {TESTIMONIALS.map((_, i) => (
                                    <Pressable
                                        key={i}
                                        onPress={() => setTestimonialIndex(i)}
                                    >
                                        <View
                                            className={`h-1.5 rounded-full ${i === testimonialIndex ? 'w-6 bg-slate-900' : 'w-1.5 bg-slate-300'}`}
                                        />
                                    </Pressable>
                                ))}
                            </View>
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
    );
}
