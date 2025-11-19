import React, { useState } from 'react';
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
} from 'react-native';
import { Loading } from '../components/Loading';
const [currentStep, setCurrentStep] = useState<Step>('email');
const [isLoading, setIsLoading] = useState(false);

// ... (keep existing code)

return (
    <View style={styles.container}>
        <Loading visible={isLoading} text="İşlem yapılıyor..." />

        {/* Background Elements */}
        <Animated.View style={[styles.bgGradientTop, blob1Style]} />
        {/* ... (keep rest of the render) */}

        {currentStep !== 'complete' && (
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        (currentStep === 'email' && (!email || !!emailError)) ||
                            (currentStep === 'password' && (!password || !!passwordError)) ||
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
                        withTiming(30, {duration: 4000, easing: Easing.inOut(Easing.ease) }),
                        withTiming(0, {duration: 4000, easing: Easing.inOut(Easing.ease) })
                        ),
                        -1,
                        true
                        );
                        blob3TranslateY.value = withRepeat(
                        withSequence(
                        withTiming(-25, {duration: 3500, easing: Easing.inOut(Easing.ease) }),
                        withTiming(0, {duration: 3500, easing: Easing.inOut(Easing.ease) })
                        ),
                        -1,
                        true
                        );
    }, []);

    const blob1Style = useAnimatedStyle(() => ({
                            transform: [{translateY: blob1TranslateY.value }],
    }));

    const blob2Style = useAnimatedStyle(() => ({
                            transform: [{translateY: blob2TranslateY.value }],
    }));

    const blob3Style = useAnimatedStyle(() => ({
                            transform: [{translateY: blob3TranslateY.value }],
    }));

                        // Form Data
                        const [email, setEmail] = useState('');
                        const [password, setPassword] = useState('');
                        const [teamName, setTeamName] = useState('');
                        const [firstName, setFirstName] = useState('');
                        const [lastName, setLastName] = useState('');

                        // Validation
                        const [emailError, setEmailError] = useState('');
                        const [passwordError, setPasswordError] = useState('');
                        const [teamNameError, setTeamNameError] = useState('');

    const validateEmail = async (text: string) => {
                            setEmail(text);
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(text)) {
                            setEmailError('Geçerli bir e-posta adresi girin');
                        return;
        }

                        setEmailError('');
                        try {
            const response = await apiService.public.validateEmail(text);
                        if (!response.data.success) {
                            setEmailError(response.data.message || 'E-posta kullanılamıyor');
            }
        } catch (error) {
                            // Ignore network errors during typing
                        }
    };

    const validatePassword = (text: string) => {
                            setPassword(text);
                        if (text.length < 8) {
                            setPasswordError('En az 8 karakter olmalı');
        } else {
                            setPasswordError('');
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
                        try {
            const response = await apiService.public.validateCompanyCode(formatted);
                        if (!response.data.success) {
                            setTeamNameError(response.data.message || 'Bu alan adı kullanılamıyor');
            }
        } catch (error) {
                            // Ignore network errors during typing
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
                        case 'email':
                        navigation.goBack();
                        break;
        }
    };

    const handleRegister = async () => {
                            setIsLoading(true);
                        try {
                            await apiService.auth.register({
                                email,
                                password,
                                teamName,
                                firstName,
                                lastName,
                            });

                        setCurrentStep('complete');
        } catch (error: any) {
                            Alert.alert('Hata', error.message || 'Kayıt işlemi başarısız');
        } finally {
                            setIsLoading(false);
        }
    };

    const renderStepIndicator = () => {
        if (currentStep === 'complete') return null;

                        const steps: Step[] = ['email', 'password', 'teamName', 'fullName'];
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
                                        style={styles.input}
                                        placeholder="En az 8 karakter"
                                        placeholderTextColor={colors.textMuted}
                                        value={password}
                                        onChangeText={validatePassword}
                                        secureTextEntry
                                        autoFocus
                                    />
                                </View>
                                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
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
                                                        (currentStep === 'password' && (!password || !!passwordError)) ||
                                                        (currentStep === 'teamName' && (!teamName || !!teamNameError)) ||
                                                        (currentStep === 'fullName' && (!firstName || !lastName))
                                                        ? styles.buttonDisabled
                                                        : null
                                                ]}
                                                onPress={handleNext}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <ActivityIndicator color="#0a1f2e" />
                                                ) : (
                                                    <Text style={styles.buttonText}>
                                                        {currentStep === 'fullName' ? 'Tamamla' : 'Devam Et'}
                                                    </Text>
                                                )}
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
                        transform: [{scale: 1.2 }],
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
                        transform: [{scale: 1.2 }],
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
                        transform: [{scale: 1.5 }],
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
});
