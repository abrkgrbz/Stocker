import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { api } from '@/lib/axios';
import { ArrowLeft, Check, Mail, Lock, Building2, User, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { Logo } from '@/components/ui/Logo';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

// Testimonials from stocker-nextjs register page
const TESTIMONIALS = [
    {
        id: 1,
        quote: "Kurulum 5 dakika sürdü. İlk gün tüm ekip kullanmaya başladı.",
        author: "Elif Kaya",
        role: "Kurucu Ortak",
        company: "ModernBiz",
        initials: "EK",
    },
    {
        id: 2,
        quote: "Rakiplerden geçiş çok kolay oldu. Tüm verilerimizi sorunsuz aktardık.",
        author: "Can Özdemir",
        role: "IT Direktörü",
        company: "FastGrowth",
        initials: "CÖ",
    },
    {
        id: 3,
        quote: "14 günlük deneme süresi yeterli oldu. Ekibimiz ürünü o kadar sevdi ki hemen premium'a geçtik.",
        author: "Selin Arslan",
        role: "Finans Müdürü",
        company: "SmartRetail",
        initials: "SA",
    },
];

type Step = 'email' | 'password' | 'teamName' | 'fullName' | 'complete';

const STEPS = [
    { id: 'email', label: 'E-posta', number: 1 },
    { id: 'password', label: 'Şifre', number: 2 },
    { id: 'teamName', label: 'Takım', number: 3 },
    { id: 'fullName', label: 'Bilgiler', number: 4 },
];

export default function RegisterScreen() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('email');
    const [loading, setLoading] = useState(false);

    // Form Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [teamName, setTeamName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Validation states
    const [emailValid, setEmailValid] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordValid, setPasswordValid] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [teamNameValid, setTeamNameValid] = useState(false);
    const [teamNameError, setTeamNameError] = useState('');

    // Testimonial slider
    const [testimonialIndex, setTestimonialIndex] = useState(0);

    // Auto-rotate testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    // Email validation
    useEffect(() => {
        if (!email) {
            setEmailValid(false);
            setEmailError('');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailValid(false);
            setEmailError('Geçerli bir e-posta adresi girin');
        } else {
            setEmailValid(true);
            setEmailError('');
        }
    }, [email]);

    // Password validation
    useEffect(() => {
        if (!password) {
            setPasswordValid(false);
            setPasswordError('');
            setPasswordStrength(0);
            return;
        }

        let strength = 0;
        let error = '';

        if (password.length >= 8) strength++;
        else error = 'En az 8 karakter olmalı';

        if (/[A-Z]/.test(password)) strength++;
        else if (!error) error = 'En az bir büyük harf içermeli';

        if (/[a-z]/.test(password)) strength++;
        else if (!error) error = 'En az bir küçük harf içermeli';

        if (/[0-9]/.test(password)) strength++;
        else if (!error) error = 'En az bir rakam içermeli';

        if (/[^A-Za-z0-9]/.test(password)) strength++;

        setPasswordStrength(strength);
        setPasswordValid(strength >= 3);
        setPasswordError(strength >= 3 ? '' : error);
    }, [password]);

    // Team name validation
    useEffect(() => {
        if (!teamName) {
            setTeamNameValid(false);
            setTeamNameError('');
            return;
        }

        const teamNameRegex = /^[a-z0-9-]+$/;
        if (!teamNameRegex.test(teamName)) {
            setTeamNameValid(false);
            setTeamNameError('Sadece küçük harf, rakam ve tire (-) kullanın');
        } else if (teamName.length < 3) {
            setTeamNameValid(false);
            setTeamNameError('En az 3 karakter olmalı');
        } else {
            setTeamNameValid(true);
            setTeamNameError('');
        }
    }, [teamName]);

    const getCurrentStepIndex = () => {
        return STEPS.findIndex(s => s.id === step);
    };

    const handleEmailContinue = () => {
        if (emailValid) setStep('password');
    };

    const handlePasswordContinue = () => {
        if (passwordValid) setStep('teamName');
    };

    const handleTeamNameContinue = () => {
        if (teamNameValid) setStep('fullName');
    };

    const handleRegister = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert('Eksik Bilgi', 'Lütfen ad ve soyadınızı girin.');
            return;
        }
        if (!acceptTerms || !acceptPrivacy) {
            Alert.alert('Şartlar', 'Devam etmek için şartları kabul etmelisiniz.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                email,
                password,
                teamName,
                firstName,
                lastName,
                acceptTerms,
                acceptPrivacyPolicy: acceptPrivacy,
            };

            const response = await api.post('/auth/register', payload);
            const data = response.data;

            if (data.success || data.data) {
                setStep('complete');
            } else {
                Alert.alert('Kayıt Başarısız', data.message || 'Bilinmeyen hata');
            }
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Kayıt başarısız';
            Alert.alert('Hata', msg);
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        switch (step) {
            case 'password':
                setStep('email');
                break;
            case 'teamName':
                setStep('password');
                break;
            case 'fullName':
                setStep('teamName');
                break;
            default:
                router.back();
        }
    };

    const currentTestimonial = TESTIMONIALS[testimonialIndex];

    // Tamamlandı ekranı
    if (step === 'complete') {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <Animated.View
                    entering={FadeIn.duration(500)}
                    className="flex-1 items-center justify-center p-6"
                >
                    <Animated.View
                        entering={FadeInDown.duration(600).delay(100)}
                        className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-6"
                    >
                        <Check size={40} color="#059669" />
                    </Animated.View>
                    <Animated.Text
                        entering={FadeInDown.duration(600).delay(200)}
                        className="text-2xl font-bold text-slate-900 mb-2"
                    >
                        Hoş geldin, {firstName}!
                    </Animated.Text>
                    <Animated.Text
                        entering={FadeInDown.duration(600).delay(300)}
                        className="text-slate-500 text-center mb-2"
                    >
                        Hesabın başarıyla oluşturuldu.
                    </Animated.Text>
                    <Animated.Text
                        entering={FadeInDown.duration(600).delay(400)}
                        className="font-semibold text-slate-700 mb-8"
                    >
                        {teamName}.stoocker.app
                    </Animated.Text>
                    <Animated.View
                        entering={FadeInUp.duration(600).delay(500)}
                        className="w-full"
                    >
                        <AnimatedButton
                            title="Giriş Yap"
                            variant="primary"
                            onPress={() => router.replace('/(auth)/login')}
                        />
                    </Animated.View>
                </Animated.View>
            </SafeAreaView>
        );
    }

    const getStrengthColor = () => {
        if (passwordStrength >= 4) return 'bg-emerald-500';
        if (passwordStrength >= 3) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getStrengthText = () => {
        if (passwordStrength >= 4) return 'Güçlü şifre';
        if (passwordStrength >= 3) return 'Orta güçlükte';
        return 'Zayıf şifre';
    };

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
                    {/* Progress Steps */}
                    <Animated.View
                        entering={FadeInDown.duration(500).delay(100)}
                        className="mb-8"
                    >
                        <View className="flex-row items-center justify-between relative">
                            {/* Progress Line Background */}
                            <View className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200" />
                            {/* Progress Line Active */}
                            <View
                                className="absolute top-4 left-4 h-0.5 bg-slate-900"
                                style={{ width: `${(getCurrentStepIndex() / (STEPS.length - 1)) * 92}%` }}
                            />

                            {STEPS.map((s, index) => {
                                const isActive = getCurrentStepIndex() >= index;
                                const isCurrent = s.id === step;
                                const isCompleted = getCurrentStepIndex() > index;
                                return (
                                    <View key={s.id} className="items-center z-10">
                                        <View
                                            className={`w-8 h-8 rounded-full items-center justify-center ${isActive ? 'bg-slate-900' : 'bg-slate-200'
                                                } ${isCurrent ? 'border-4 border-slate-200' : ''}`}
                                        >
                                            {isCompleted ? (
                                                <Check size={16} color="#ffffff" />
                                            ) : (
                                                <Text className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>
                                                    {s.number}
                                                </Text>
                                            )}
                                        </View>
                                        <Text className={`mt-2 text-xs font-medium ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                                            {s.label}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </Animated.View>

                    {/* Header Text */}
                    <Animated.View
                        entering={FadeInDown.duration(500).delay(200)}
                        className="mb-6"
                    >
                        <Text className="text-2xl font-bold text-slate-900 mb-2">
                            Hesabınızı oluşturun
                        </Text>
                        <Text className="text-slate-500">
                            14 gün ücretsiz deneyin, kredi kartı gerekmez
                        </Text>
                    </Animated.View>

                    {/* Step Content */}
                    {step === 'email' && (
                        <Animated.View
                            entering={FadeInUp.duration(500).delay(300)}
                            style={{ gap: 16 }}
                        >
                            <View>
                                <Text className="text-sm font-medium text-slate-700 mb-2">İş e-posta adresiniz</Text>
                                <View className={`flex-row items-center bg-white border rounded-xl px-4 ${email && !emailValid ? 'border-red-300' : 'border-slate-200'}`}>
                                    <Mail size={20} color="#94a3b8" />
                                    <TextInput
                                        value={email}
                                        onChangeText={text => setEmail(text.toLowerCase())}
                                        placeholder="ornek@sirket.com"
                                        placeholderTextColor="#94a3b8"
                                        className="flex-1 py-4 ml-3 text-slate-900 text-base"
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        autoComplete="email"
                                        onSubmitEditing={handleEmailContinue}
                                    />
                                </View>
                                {emailError ? (
                                    <View className="flex-row items-center mt-2" style={{ gap: 4 }}>
                                        <AlertTriangle size={14} color="#ef4444" />
                                        <Text className="text-sm text-red-600">{emailError}</Text>
                                    </View>
                                ) : emailValid ? (
                                    <View className="flex-row items-center mt-2" style={{ gap: 4 }}>
                                        <CheckCircle size={14} color="#10b981" />
                                        <Text className="text-sm text-emerald-600">E-posta geçerli</Text>
                                    </View>
                                ) : null}
                            </View>

                            <AnimatedButton
                                title="Devam et"
                                variant="primary"
                                disabled={!emailValid}
                                onPress={handleEmailContinue}
                            />

                            <View className="flex-row items-center justify-center mt-2">
                                <Text className="text-slate-500 text-sm">Zaten hesabınız var mı? </Text>
                                <Pressable onPress={() => router.push('/(auth)/login')}>
                                    <Text className="text-slate-900 font-semibold text-sm">Giriş yapın</Text>
                                </Pressable>
                            </View>
                        </Animated.View>
                    )}

                    {step === 'password' && (
                        <Animated.View
                            entering={FadeInUp.duration(500)}
                            style={{ gap: 16 }}
                        >
                            <View>
                                <Text className="text-sm font-medium text-slate-700 mb-2">Şifrenizi belirleyin</Text>
                                <View className={`flex-row items-center bg-white border rounded-xl px-4 ${password && !passwordValid ? 'border-red-300' : 'border-slate-200'}`}>
                                    <Lock size={20} color="#94a3b8" />
                                    <TextInput
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        placeholder="En az 8 karakter"
                                        placeholderTextColor="#94a3b8"
                                        className="flex-1 py-4 ml-3 text-slate-900 text-base"
                                        onSubmitEditing={handlePasswordContinue}
                                    />
                                    <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2">
                                        {showPassword ? (
                                            <EyeOff size={20} color="#94a3b8" />
                                        ) : (
                                            <Eye size={20} color="#94a3b8" />
                                        )}
                                    </Pressable>
                                </View>
                                {passwordError ? (
                                    <Text className="text-sm text-red-600 mt-2">{passwordError}</Text>
                                ) : null}
                                {password && !passwordError ? (
                                    <View className="mt-3" style={{ gap: 6 }}>
                                        <View className="flex-row" style={{ gap: 4 }}>
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <View
                                                    key={level}
                                                    className={`h-1 flex-1 rounded-full ${passwordStrength >= level ? getStrengthColor() : 'bg-slate-200'}`}
                                                />
                                            ))}
                                        </View>
                                        <Text className="text-xs text-slate-500">{getStrengthText()}</Text>
                                    </View>
                                ) : null}
                            </View>

                            <AnimatedButton
                                title="Devam et"
                                variant="primary"
                                disabled={!passwordValid}
                                onPress={handlePasswordContinue}
                            />

                            <Pressable onPress={() => setStep('email')} className="items-center py-3">
                                <Text className="text-slate-500 font-medium">← Geri</Text>
                            </Pressable>
                        </Animated.View>
                    )}

                    {step === 'teamName' && (
                        <Animated.View
                            entering={FadeInUp.duration(500)}
                            style={{ gap: 16 }}
                        >
                            <View>
                                <Text className="text-sm font-medium text-slate-700 mb-2">Çalışma alanı adresiniz</Text>
                                <View className="flex-row items-center border border-slate-200 rounded-xl overflow-hidden">
                                    <View className="flex-row items-center flex-1 px-4">
                                        <Building2 size={20} color="#94a3b8" />
                                        <TextInput
                                            value={teamName}
                                            onChangeText={t => setTeamName(t.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                            placeholder="sirketiniz"
                                            placeholderTextColor="#94a3b8"
                                            className="flex-1 py-4 ml-3 text-slate-900 text-base"
                                            autoCapitalize="none"
                                            onSubmitEditing={handleTeamNameContinue}
                                        />
                                    </View>
                                    <View className="bg-slate-100 px-4 py-4 border-l border-slate-200">
                                        <Text className="text-slate-500 text-sm">.stoocker.app</Text>
                                    </View>
                                </View>
                                {teamName ? (
                                    <Text className="mt-2 text-sm text-slate-500">
                                        Adresiniz: <Text className="font-medium text-slate-700">{teamName}.stoocker.app</Text>
                                    </Text>
                                ) : null}
                                {teamNameError ? (
                                    <View className="flex-row items-center mt-2" style={{ gap: 4 }}>
                                        <AlertTriangle size={14} color="#ef4444" />
                                        <Text className="text-sm text-red-600">{teamNameError}</Text>
                                    </View>
                                ) : teamNameValid ? (
                                    <View className="flex-row items-center mt-2" style={{ gap: 4 }}>
                                        <CheckCircle size={14} color="#10b981" />
                                        <Text className="text-sm text-emerald-600">Bu adres kullanılabilir</Text>
                                    </View>
                                ) : null}
                            </View>

                            <AnimatedButton
                                title="Devam et"
                                variant="primary"
                                disabled={!teamNameValid}
                                onPress={handleTeamNameContinue}
                            />

                            <Pressable onPress={() => setStep('password')} className="items-center py-3">
                                <Text className="text-slate-500 font-medium">← Geri</Text>
                            </Pressable>
                        </Animated.View>
                    )}

                    {step === 'fullName' && (
                        <Animated.View
                            entering={FadeInUp.duration(500)}
                            style={{ gap: 16 }}
                        >
                            <View>
                                <Text className="text-sm font-medium text-slate-700 mb-2">Adınız</Text>
                                <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4">
                                    <User size={20} color="#94a3b8" />
                                    <TextInput
                                        value={firstName}
                                        onChangeText={setFirstName}
                                        placeholder="Adınız"
                                        placeholderTextColor="#94a3b8"
                                        className="flex-1 py-4 ml-3 text-slate-900 text-base"
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-sm font-medium text-slate-700 mb-2">Soyadınız</Text>
                                <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4">
                                    <User size={20} color="#94a3b8" />
                                    <TextInput
                                        value={lastName}
                                        onChangeText={setLastName}
                                        placeholder="Soyadınız"
                                        placeholderTextColor="#94a3b8"
                                        className="flex-1 py-4 ml-3 text-slate-900 text-base"
                                    />
                                </View>
                            </View>

                            {/* Checkboxes */}
                            <View style={{ gap: 12 }} className="mt-2">
                                <Pressable
                                    onPress={() => setAcceptTerms(!acceptTerms)}
                                    className="flex-row items-start"
                                    style={{ gap: 12 }}
                                >
                                    <View
                                        className={`w-5 h-5 rounded border-2 items-center justify-center mt-0.5 ${acceptTerms ? 'bg-slate-900 border-slate-900' : 'border-slate-300'}`}
                                    >
                                        {acceptTerms && <Check size={12} color="#ffffff" />}
                                    </View>
                                    <Text className="text-slate-600 flex-1 text-sm">
                                        <Text className="text-slate-900 font-medium">Kullanım Koşulları</Text>'nı okudum ve kabul ediyorum
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => setAcceptPrivacy(!acceptPrivacy)}
                                    className="flex-row items-start"
                                    style={{ gap: 12 }}
                                >
                                    <View
                                        className={`w-5 h-5 rounded border-2 items-center justify-center mt-0.5 ${acceptPrivacy ? 'bg-slate-900 border-slate-900' : 'border-slate-300'}`}
                                    >
                                        {acceptPrivacy && <Check size={12} color="#ffffff" />}
                                    </View>
                                    <Text className="text-slate-600 flex-1 text-sm">
                                        <Text className="text-slate-900 font-medium">Gizlilik Politikası</Text>'nı okudum ve kabul ediyorum
                                    </Text>
                                </Pressable>
                            </View>

                            <AnimatedButton
                                title="Hesabı oluştur"
                                variant="primary"
                                loading={loading}
                                disabled={!firstName.trim() || !lastName.trim() || !acceptTerms || !acceptPrivacy}
                                onPress={handleRegister}
                            />

                            <Pressable onPress={() => setStep('teamName')} className="items-center py-3">
                                <Text className="text-slate-500 font-medium">← Geri</Text>
                            </Pressable>
                        </Animated.View>
                    )}

                    {/* Testimonial Card - Only on first step */}
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

                    {/* Stats - Show on email step */}
                    {step === 'email' && (
                        <Animated.View
                            entering={FadeInUp.duration(600).delay(600)}
                            className="flex-row justify-center items-center mt-6 mb-4"
                            style={{ gap: 24 }}
                        >
                            <View className="items-center">
                                <Text className="text-slate-900 font-bold text-lg">5 dk</Text>
                                <Text className="text-slate-500 text-xs">Kurulum</Text>
                            </View>
                            <View className="w-px h-8 bg-slate-200" />
                            <View className="items-center">
                                <Text className="text-slate-900 font-bold text-lg">14 gün</Text>
                                <Text className="text-slate-500 text-xs">Ücretsiz</Text>
                            </View>
                            <View className="w-px h-8 bg-slate-200" />
                            <View className="items-center">
                                <Text className="text-slate-900 font-bold text-lg">7/24</Text>
                                <Text className="text-slate-500 text-xs">Destek</Text>
                            </View>
                        </Animated.View>
                    )}

                    {/* Footer */}
                    <Animated.View
                        entering={FadeIn.duration(500).delay(700)}
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
