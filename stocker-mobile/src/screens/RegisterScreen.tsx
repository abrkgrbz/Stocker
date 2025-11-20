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
    Alert,
    ViewStyle,
    TextStyle,
    Dimensions,
    SafeAreaView,
} from 'react-native';
import { Loading } from '../components/Loading';
import { Toast } from '../components/Toast';
import { apiService } from '../services/api';
import { colors, spacing, typography } from '../theme/colors';
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
import { tokenStorage } from '../utils/tokenStorage';
import { useSignalRValidation, PasswordStrength } from '../hooks/useSignalRValidation';

const { width } = Dimensions.get('window');

type Step = 'email' | 'password' | 'teamName' | 'fullName' | 'verification' | 'complete';

export default function RegisterScreen({ navigation }: any) {
    const [currentStep, setCurrentStep] = useState<Step>('email');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'error' as 'success' | 'error' | 'info' });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
        setToast({ visible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, visible: false });
    };

    // SignalR Validation
    const {
        validateEmail: validateEmailSignalR,
        validateTenantCode,
        checkPasswordStrength,
        isConnected
    } = useSignalRValidation();

    // Debug: Log connection status
    useEffect(() => {
        console.log('[RegisterScreen] SignalR Validation Hub connected:', isConnected);
    }, [isConnected]);

    // Animation values for background blobs
    const blob1TranslateY = useSharedValue(0);
    const blob2TranslateY = useSharedValue(0);
    const blob3TranslateY = useSharedValue(0);

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

    // Form Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [teamName, setTeamName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    // Validation
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [teamNameError, setTeamNameError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);

    const validateEmail = async (text: string) => {
        setEmail(text);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(text)) {
            setEmailError('Geçerli bir e-posta adresi girin');
            return;
        }

        setEmailError('');

        if (isConnected) {
            console.log('[RegisterScreen] Validating email via SignalR:', text);
            validateEmailSignalR(text, (result) => {
                console.log('[RegisterScreen] Email validation result:', result);
                if (!result.isValid) {
                    setEmailError(result.message || 'E-posta kullanılamıyor');
                }
            });
        }
    };

    const validatePassword = (text: string) => {
        setPassword(text);

        // Basic client-side validation
        if (text.length < 8) {
            setPasswordError('En az 8 karakter olmalı');
            setPasswordStrength(null);
            return;
        }

        setPasswordError('');

        // Real-time password strength check via SignalR
        if (isConnected) {
            console.log('[RegisterScreen] Checking password strength via SignalR');
            checkPasswordStrength(text, (result) => {
                console.log('[RegisterScreen] Password strength result:', result);

                // Store strength for UI display
                setPasswordStrength(result);

                // Show strength-based feedback
                if (result.score < 2) {
                    // Weak - block registration
                    setPasswordError(`Şifre çok zayıf. ${result.suggestions.join(', ')}`);
                } else if (result.score === 2) {
                    // Fair - show warning but allow
                    setPasswordError(`Şifre orta seviyede. Öneriler: ${result.suggestions.join(', ')}`);
                } else {
                    // Strong - allow
                    setPasswordError('');
                }
            });
        } else {
            // SignalR not connected, use basic validation only
            setPasswordStrength(null);
        }
    };

    const validateTeamName = async (text: string) => {
        const formatted = text.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setTeamName(formatted);
        if (formatted.length < 3) {
            setTeamNameError('En az 3 karakter olmalı');
            return;
        }

        setTeamNameError('');

        if (isConnected) {
            console.log('[RegisterScreen] Validating tenant code via SignalR:', formatted);
            validateTenantCode(formatted, (result) => {
                console.log('[RegisterScreen] Tenant code validation result:', result);
                if (!result.isAvailable) {
                    setTeamNameError(result.message || 'Bu alan adı kullanılamıyor');
                }
            });
        }
    };

    const handleRegister = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.auth.register({
                email,
                password,
                teamName,
                firstName,
                lastName,
            });

            if (response.data.success) {
                if (response.data.data?.accessToken) {
                    await tokenStorage.setToken(response.data.data.accessToken);
                }
                setCurrentStep('verification');
            } else {
                throw new Error(response.data.message || 'Kayıt işlemi başarısız');
            }
        } catch (error: any) {
            showToast(error.message || 'Kayıt işlemi başarısız', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        if (verificationCode.length !== 6) {
            Alert.alert('Hata', 'Lütfen 6 haneli doğrulama kodunu giriniz.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiService.auth.verifyEmail({
                email,
                code: verificationCode,
            });

            if (response.data.success) {
                setCurrentStep('complete');
            } else {
                throw new Error(response.data.message || 'Doğrulama başarısız');
            }
        } catch (error: any) {
            showToast(error.message || 'Doğrulama işlemi başarısız', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = () => {
        switch (currentStep) {
            case 'email':
                if (email && !emailError) setCurrentStep('password');
                break;
            case 'password':
                if (password && !passwordError) setCurrentStep('teamName');
                break;
            case 'teamName':
                if (teamName && !teamNameError) setCurrentStep('fullName');
                break;
            case 'fullName':
                if (firstName && lastName) handleRegister();
                break;
            case 'verification':
                handleVerify();
                break;
        }
    };

    const handleBack = () => {
        switch (currentStep) {
            case 'password':
                setCurrentStep('email');
                break;
            case 'teamName':
                setCurrentStep('password');
                break;
            case 'fullName':
                setCurrentStep('teamName');
                break;
            case 'verification':
                Alert.alert(
                    'Dikkat',
                    'Geri dönerseniz kayıt işlemini yeniden başlatmanız gerekebilir. Emin misiniz?',
                    [
                        { text: 'İptal', style: 'cancel' },
                        { text: 'Evet', onPress: () => setCurrentStep('fullName') }
                    ]
                );
                break;
            case 'email':
                navigation.goBack();
                break;
        }
    };

    const renderStepIndicator = () => {
        if (currentStep === 'complete') return null;

        const steps: Step[] = ['email', 'password', 'teamName', 'fullName', 'verification'];
        const currentIndex = steps.indexOf(currentStep);

        return (
            <View style={styles.stepIndicator}>
                {steps.map((step, index) => (
                    <View
                        key={step}
                        style={[
                            styles.stepDot,
                            index <= currentIndex && styles.stepDotActive,
                        ]}
                    />
                ))}
            </View>
        );
    };

    const renderContent = () => {
        switch (currentStep) {
            case 'email':
                return (
                    <Animated.View entering={FadeInRight.springify()} exiting={FadeOutLeft.duration(200)}>
                        <Text style={styles.stepTitle}>İş e-postanızı girin</Text>
                        <Text style={styles.stepSubtitle}>Hesabınız bu e-posta ile oluşturulacak</Text>

                        <View style={styles.inputContainer}>
                            <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
                                <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="ornek@sirket.com"
                                    placeholderTextColor={colors.textMuted}
                                    value={email}
                                    onChangeText={validateEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    autoFocus
                                />
                            </View>
                            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                        </View>
                    </Animated.View>
                );

            case 'password':
                return (
                    <Animated.View entering={FadeInRight.springify()} exiting={FadeOutLeft.duration(200)}>
                        <Text style={styles.stepTitle}>Şifrenizi belirleyin</Text>
                        <Text style={styles.stepSubtitle}>Güçlü bir şifre oluşturun</Text>

                        <View style={styles.inputContainer}>
                            <View style={[styles.inputWrapper, passwordError ? styles.inputError : null]}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    key={showPassword ? 'text' : 'password'}
                                    style={styles.input}
                                    placeholder="En az 8 karakter"
                                    placeholderTextColor={colors.textMuted}
                                    value={password}
                                    onChangeText={validatePassword}
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
                            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                            {passwordStrength && !passwordError && (
                                <View style={styles.strengthContainer}>
                                    <View style={styles.strengthBarContainer}>
                                        <View
                                            style={[
                                                styles.strengthBar,
                                                {
                                                    width: `${(passwordStrength.score / 5) * 100}%`,
                                                    backgroundColor: passwordStrength.color
                                                }
                                            ]}
                                        />
                                    </View>
                                    <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                                        {passwordStrength.level}
                                    </Text>
                                    {passwordStrength.suggestions.length > 0 && (
                                        <View style={styles.suggestionsContainer}>
                                            {passwordStrength.suggestions.map((suggestion, index) => (
                                                <Text key={index} style={styles.suggestionText}>• {suggestion}</Text>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    </Animated.View>
                );

            case 'teamName':
                return (
                    <Animated.View entering={FadeInRight.springify()} exiting={FadeOutLeft.duration(200)}>
                        <Text style={styles.stepTitle}>Takım adınızı seçin</Text>
                        <Text style={styles.stepSubtitle}>Bu, sizin Stoocker adresiniz olacak</Text>

                        <View style={styles.inputContainer}>
                            <View style={[styles.inputWrapper, teamNameError ? styles.inputError : null]}>
                                <Ionicons name="people-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="sirketiniz"
                                    placeholderTextColor={colors.textMuted}
                                    value={teamName}
                                    onChangeText={validateTeamName}
                                    autoCapitalize="none"
                                    autoFocus
                                />
                                <Text style={styles.suffixText}>.stoocker.app</Text>
                            </View>
                            {teamNameError ? <Text style={styles.errorText}>{teamNameError}</Text> : null}
                        </View>
                    </Animated.View>
                );

            case 'fullName':
                return (
                    <Animated.View entering={FadeInRight.springify()} exiting={FadeOutLeft.duration(200)}>
                        <Text style={styles.stepTitle}>Adınız ve soyadınız</Text>
                        <Text style={styles.stepSubtitle}>Son adım! Hemen tamamlayın</Text>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Adınız"
                                    placeholderTextColor={colors.textMuted}
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    autoFocus
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Soyadınız"
                                    placeholderTextColor={colors.textMuted}
                                    value={lastName}
                                    onChangeText={setLastName}
                                />
                            </View>
                        </View>
                    </Animated.View>
                );

            case 'verification':
                return (
                    <Animated.View entering={FadeInRight.springify()} exiting={FadeOutLeft.duration(200)}>
                        <Text style={styles.stepTitle}>E-posta Doğrulama</Text>
                        <Text style={styles.stepSubtitle}>E-postanıza gönderilen 6 haneli kodu girin</Text>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="key-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="000000"
                                    placeholderTextColor={colors.textMuted}
                                    value={verificationCode}
                                    onChangeText={setVerificationCode}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    autoFocus
                                />
                            </View>
                        </View>
                    </Animated.View>
                );

            case 'complete':
                return (
                    <Animated.View style={styles.centerContent} entering={FadeInRight.springify()}>
                        <View style={styles.successIcon}>
                            <Ionicons name="checkmark" size={50} color={colors.success} />
                        </View>
                        <Text style={styles.stepTitle}>Hoş geldiniz, {firstName}!</Text>
                        <Text style={[styles.stepSubtitle, { textAlign: 'center' }]}>
                            Hesabınız başarıyla oluşturuldu.{'\n'}
                            <Text style={{ color: colors.primary }}>{teamName}.stoocker.app</Text> adresiniz hazır.
                        </Text>

                        <TouchableOpacity
                            style={[styles.button, { marginTop: spacing.xl, width: '100%' }]}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.buttonText}>Giriş Yap</Text>
                        </TouchableOpacity>
                    </Animated.View>
                );
        }
    };

    return (
        <View style={styles.container}>
            <Loading visible={isLoading} text="İşlem yapılıyor..." />
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={hideToast}
            />

            {/* Background Elements */}
            <Animated.View style={[styles.bgGradientTop, blob1Style]} />
            <Animated.View style={[styles.bgGradientBottom, blob2Style]} />
            <Animated.View style={[styles.bgGradientCenter, blob3Style]} />

            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.header}>
                        {currentStep !== 'complete' && (
                            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        )}
                        <Text style={styles.headerTitle}>Kayıt Ol</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    {renderStepIndicator()}

                    <ScrollView contentContainerStyle={styles.content}>
                        {renderContent()}
                    </ScrollView>

                    {currentStep !== 'complete' && (
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    (currentStep === 'email' && (!email || !!emailError)) ||
                                        (currentStep === 'password' && (!password || !!passwordError || (isConnected && passwordStrength && passwordStrength.score < 2))) ||
                                        (currentStep === 'teamName' && (!teamName || !!teamNameError)) ||
                                        (currentStep === 'fullName' && (!firstName || !lastName)) ||
                                        (currentStep === 'verification' && verificationCode.length !== 6)
                                        ? styles.buttonDisabled
                                        : null
                                ]}
                                onPress={handleNext}
                                disabled={isLoading}
                            >
                                <Text style={styles.buttonText}>
                                    {currentStep === 'fullName' ? 'Kayıt Ol' :
                                        currentStep === 'verification' ? 'Doğrula' : 'Devam Et'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    } as ViewStyle,
    safeArea: {
        flex: 1,
    } as ViewStyle,
    bgGradientTop: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        backgroundColor: colors.primary,
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
        backgroundColor: colors.secondary,
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
        backgroundColor: colors.accent,
        opacity: 0.05,
        transform: [{ scale: 1.5 }],
    } as ViewStyle,
    keyboardView: {
        flex: 1,
    } as ViewStyle,
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.m,
    } as ViewStyle,
    backButton: {
        padding: spacing.xs,
    } as ViewStyle,
    headerTitle: {
        ...typography.h3,
        color: colors.textPrimary,
    } as TextStyle,
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.s,
        marginBottom: spacing.l,
    } as ViewStyle,
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.surfaceLight,
    } as ViewStyle,
    stepDotActive: {
        backgroundColor: colors.primary,
        width: 24,
    } as ViewStyle,
    content: {
        padding: spacing.l,
    } as ViewStyle,
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
    } as ViewStyle,
    stepTitle: {
        ...typography.h1,
        color: colors.textPrimary,
        marginBottom: spacing.s,
    } as TextStyle,
    stepSubtitle: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    } as TextStyle,
    inputContainer: {
        marginBottom: spacing.l,
    } as ViewStyle,
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
    } as ViewStyle,
    inputError: {
        borderColor: colors.error,
    } as ViewStyle,
    inputIcon: {
        marginLeft: spacing.m,
        marginRight: spacing.s,
    } as TextStyle,
    input: {
        flex: 1,
        padding: spacing.m,
        color: colors.textPrimary,
        fontSize: 16,
    } as TextStyle,
    passwordToggle: {
        padding: spacing.s,
        marginRight: spacing.xs,
    } as ViewStyle,
    suffixText: {
        color: colors.textMuted,
        marginRight: spacing.m,
    } as TextStyle,
    errorText: {
        color: colors.error,
        fontSize: 12,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    } as TextStyle,
    footer: {
        padding: spacing.l,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceLight,
    } as ViewStyle,
    button: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        padding: spacing.m,
        alignItems: 'center',
    } as ViewStyle,
    buttonDisabled: {
        backgroundColor: colors.surfaceLight,
        opacity: 0.5,
    } as ViewStyle,
    buttonText: {
        color: '#0a1f2e',
        fontSize: 16,
        fontWeight: 'bold',
    } as TextStyle,
    successIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(82, 196, 26, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.l,
    } as ViewStyle,
    strengthContainer: {
        marginTop: spacing.s,
    } as ViewStyle,
    strengthBarContainer: {
        height: 4,
        backgroundColor: colors.surfaceLight,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: spacing.xs,
    } as ViewStyle,
    strengthBar: {
        height: '100%',
        borderRadius: 2,
    } as ViewStyle,
    strengthText: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: spacing.xs,
    } as TextStyle,
    suggestionsContainer: {
        marginTop: spacing.xs,
    } as ViewStyle,
    suggestionText: {
        color: colors.textSecondary,
        fontSize: 11,
        marginLeft: spacing.xs,
    } as TextStyle,
});
