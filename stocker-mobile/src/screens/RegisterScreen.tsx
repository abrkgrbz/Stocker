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
    ScrollView,
    Dimensions,
    SafeAreaView,
} from 'react-native';
import { Toast } from '../components/Toast';
import { apiService } from '../services/api';
import { colors, spacing } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInRight,
    FadeOutLeft,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing
} from 'react-native-reanimated';
import { useSignalRValidation } from '../hooks/useSignalRValidation';

const { width } = Dimensions.get('window');

type Step = 'email' | 'password' | 'teamName' | 'fullName' | 'complete';

export default function RegisterScreen({ navigation }: any) {
    const [currentStep, setCurrentStep] = useState<Step>('email');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'error' as 'success' | 'error' | 'info' });

    // Form Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [teamName, setTeamName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);

    // Validation States
    const [emailValid, setEmailValid] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordValid, setPasswordValid] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [teamNameValid, setTeamNameValid] = useState(false);
    const [teamNameError, setTeamNameError] = useState('');

    const {
        validateEmail: validateEmailSignalR,
        validateTenantCode,
        checkPasswordStrength,
        isConnected
    } = useSignalRValidation();

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
        setToast({ visible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, visible: false });
    };

    // Background Animation
    const blob1TranslateY = useSharedValue(0);
    const blob2TranslateY = useSharedValue(0);

    useEffect(() => {
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
    }, []);

    const blob1Style = useAnimatedStyle(() => ({
        transform: [{ translateY: blob1TranslateY.value }],
    }));

    const blob2Style = useAnimatedStyle(() => ({
        transform: [{ translateY: blob2TranslateY.value }],
    }));

    // Email Validation
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
            return;
        }

        if (isConnected) {
            validateEmailSignalR(email, (result) => {
                setEmailValid(result.isValid);
                setEmailError(result.isValid ? '' : result.message);
            });
        } else {
            setEmailValid(true);
            setEmailError('');
        }
    }, [email, isConnected]);

    // Password Validation
    useEffect(() => {
        if (!password) {
            setPasswordValid(false);
            setPasswordError('');
            setPasswordStrength(0);
            return;
        }

        if (isConnected) {
            checkPasswordStrength(password, (result) => {
                setPasswordStrength(result.score);
                setPasswordValid(result.score >= 3);
                setPasswordError(result.score >= 3 ? '' : (result.suggestions[0] || 'Şifre güçlendirilmeli'));
            });
        } else {
            if (password.length < 8) {
                setPasswordValid(false);
                setPasswordError('En az 8 karakter olmalı');
            } else if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
                setPasswordValid(false);
                setPasswordError('Büyük harf ve rakam içermeli');
            } else {
                setPasswordValid(true);
                setPasswordError('');
                setPasswordStrength(4);
            }
        }
    }, [password, isConnected]);

    // Team Name Validation
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
            return;
        }

        if (teamName.length < 3) {
            setTeamNameValid(false);
            setTeamNameError('En az 3 karakter olmalı');
            return;
        }

        if (isConnected) {
            validateTenantCode(teamName, (result) => {
                setTeamNameValid(result.isAvailable);
                setTeamNameError(result.isAvailable ? '' : result.message);
            });
        } else {
            setTeamNameValid(true);
            setTeamNameError('');
        }
    }, [teamName, isConnected]);

    const handleComplete = async () => {
        if (!firstName.trim() || !lastName.trim()) return;

        setIsLoading(true);
        try {
            const response = await apiService.auth.register({
                email,
                password,
                teamName,
                firstName,
                lastName,
                acceptTerms,
                acceptPrivacyPolicy: acceptPrivacy
            });

            if (response.data?.success) {
                // Navigate to VerifyEmail screen with email
                navigation.navigate('VerifyEmail', { email });
            } else {
                showToast(response.data?.message || 'Kayıt başarısız', 'error');
            }
        } catch (error: any) {
            showToast(error.message || 'Kayıt sırasında bir hata oluştu', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'email':
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                        <Text style={styles.title}>İş e-postanızı girin</Text>
                        <Text style={styles.subtitle}>Hesabınız bu e-posta ile oluşturulacak</Text>

                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="ornek@sirket.com"
                                placeholderTextColor={colors.textSecondary}
                                value={email}
                                onChangeText={(text) => setEmail(text.toLowerCase())}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                        {emailValid ? <Text style={styles.successText}>✓ E-posta geçerli</Text> : null}

                        <TouchableOpacity
                            style={[styles.button, !emailValid && styles.buttonDisabled]}
                            onPress={() => setCurrentStep('password')}
                            disabled={!emailValid}
                        >
                            <Text style={styles.buttonText}>Devam Et</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>
                    </Animated.View>
                );

            case 'password':
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                        <TouchableOpacity onPress={() => setCurrentStep('email')} style={styles.backLink}>
                            <Text style={styles.backLinkText}>← Geri</Text>
                        </TouchableOpacity>

                        <Text style={styles.title}>Şifrenizi belirleyin</Text>
                        <Text style={styles.subtitle}>Güçlü bir şifre oluşturun</Text>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="En az 8 karakter"
                                placeholderTextColor={colors.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                        {passwordValid ? <Text style={styles.successText}>✓ Şifre güçlü</Text> : null}

                        <TouchableOpacity
                            style={[styles.button, !passwordValid && styles.buttonDisabled]}
                            onPress={() => setCurrentStep('teamName')}
                            disabled={!passwordValid}
                        >
                            <Text style={styles.buttonText}>Şifreyi Onayla</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>
                    </Animated.View>
                );

            case 'teamName':
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                        <TouchableOpacity onPress={() => setCurrentStep('password')} style={styles.backLink}>
                            <Text style={styles.backLinkText}>← Geri</Text>
                        </TouchableOpacity>

                        <Text style={styles.title}>Takım adınızı seçin</Text>
                        <Text style={styles.subtitle}>Bu, sizin Stoocker adresiniz olacak</Text>

                        <View style={styles.inputContainer}>
                            <Ionicons name="people-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="sirketiniz"
                                placeholderTextColor={colors.textSecondary}
                                value={teamName}
                                onChangeText={(text) => setTeamName(text.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                autoCapitalize="none"
                            />
                            <Text style={styles.suffix}>.stoocker.app</Text>
                        </View>
                        {teamNameError ? <Text style={styles.errorText}>{teamNameError}</Text> : null}
                        {teamNameValid ? <Text style={styles.successText}>✓ Takım adı kullanılabilir</Text> : null}

                        <TouchableOpacity
                            style={[styles.button, !teamNameValid && styles.buttonDisabled]}
                            onPress={() => setCurrentStep('fullName')}
                            disabled={!teamNameValid}
                        >
                            <Text style={styles.buttonText}>Takım Adını Onayla</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>
                    </Animated.View>
                );

            case 'fullName':
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                        <TouchableOpacity onPress={() => setCurrentStep('teamName')} style={styles.backLink}>
                            <Text style={styles.backLinkText}>← Geri</Text>
                        </TouchableOpacity>

                        <Text style={styles.title}>Adınız ve soyadınız</Text>
                        <Text style={styles.subtitle}>Son adım! Hemen tamamlayın</Text>

                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Adınız"
                                placeholderTextColor={colors.textSecondary}
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Soyadınız"
                                placeholderTextColor={colors.textSecondary}
                                value={lastName}
                                onChangeText={setLastName}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setAcceptTerms(!acceptTerms)}
                        >
                            <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                                {acceptTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
                            </View>
                            <Text style={styles.checkboxLabel}>Kullanım koşullarını kabul ediyorum</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setAcceptPrivacy(!acceptPrivacy)}
                        >
                            <View style={[styles.checkbox, acceptPrivacy && styles.checkboxChecked]}>
                                {acceptPrivacy && <Ionicons name="checkmark" size={14} color="#fff" />}
                            </View>
                            <Text style={styles.checkboxLabel}>Gizlilik politikasını kabul ediyorum</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, (!firstName || !lastName || !acceptTerms || !acceptPrivacy) && styles.buttonDisabled]}
                            onPress={handleComplete}
                            disabled={!firstName || !lastName || !acceptTerms || !acceptPrivacy || isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>Tamamla ve Başla</Text>
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                );

            case 'complete':
                return (
                    <Animated.View entering={FadeInRight} style={styles.stepContainer}>
                        <View style={styles.successIconContainer}>
                            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
                        </View>
                        <Text style={styles.title}>Hoş Geldiniz, {firstName}!</Text>
                        <Text style={styles.subtitle}>Hesabınız başarıyla oluşturuldu.</Text>
                        <Text style={[styles.subtitle, { color: colors.primary, marginTop: 8 }]}>
                            {teamName}.stoocker.app
                        </Text>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.buttonText}>Giriş Yap</Text>
                        </TouchableOpacity>
                    </Animated.View>
                );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.background}>
                <Animated.View style={[styles.blob, styles.blob1, blob1Style]} />
                <Animated.View style={[styles.blob, styles.blob2, blob2Style]} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.appName}>Stocker</Text>
                    </View>

                    {currentStep !== 'complete' && (
                        <View style={styles.progressContainer}>
                            {['email', 'password', 'teamName', 'fullName'].map((step, index) => {
                                const steps: Step[] = ['email', 'password', 'teamName', 'fullName'];
                                const currentIndex = steps.indexOf(currentStep);
                                const isActive = index <= currentIndex;
                                return (
                                    <View key={step} style={[styles.progressDot, isActive && styles.progressDotActive]} />
                                );
                            })}
                        </View>
                    )}

                    {renderStepContent()}

                    {currentStep === 'email' && (
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Zaten hesabınız var mı? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.link}>Giriş Yapın</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
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
    background: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    blob: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.3,
    },
    blob1: {
        top: -100,
        right: -100,
        backgroundColor: '#667eea',
    },
    blob2: {
        bottom: -100,
        left: -100,
        backgroundColor: '#764ba2',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.l,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 1,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: spacing.xl,
        gap: 8,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    progressDotActive: {
        backgroundColor: colors.primary,
        width: 24,
    },
    stepContainer: {
        width: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: spacing.s,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        paddingHorizontal: spacing.m,
        marginBottom: spacing.m,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        height: 56,
    },
    inputIcon: {
        marginRight: spacing.s,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
    suffix: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.m,
        gap: 8,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backLink: {
        marginBottom: spacing.m,
    },
    backLinkText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        marginBottom: spacing.m,
        marginLeft: spacing.xs,
    },
    successText: {
        color: colors.success,
        fontSize: 14,
        marginBottom: spacing.m,
        marginLeft: spacing.xs,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: colors.primary,
        marginRight: spacing.s,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
    },
    checkboxLabel: {
        color: colors.textSecondary,
        fontSize: 14,
        flex: 1,
    },
    successIconContainer: {
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.xl,
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    link: {
        color: colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
});
