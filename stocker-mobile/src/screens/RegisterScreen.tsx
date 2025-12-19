import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from '../components/Toast';
import { apiService } from '../services/api';
import { Colors } from '@/constants/theme';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInRight,
    FadeOutLeft,
    FadeIn,
    FadeInDown
} from 'react-native-reanimated';
import { useSignalRValidation } from '../hooks/useSignalRValidation';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { LinearGradient } from 'expo-linear-gradient';
import { DotBackground } from '../../components/ui/DotBackground';

const { width } = Dimensions.get('window');

type Step = 'email' | 'password' | 'teamName' | 'fullName' | 'complete';

export default function RegisterScreen({ navigation }: any) {
    const { colors, theme } = useTheme();
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
                        <Text style={[styles.title, { color: colors.textPrimary }]}>İş e-postanızı girin</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Hesabınız bu e-posta ile oluşturulacak</Text>

                        <Input
                            label="Email"
                            value={email}
                            onChangeText={(text) => setEmail(text.toLowerCase())}
                            placeholder="ornek@sirket.com"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            error={emailError}
                            autoFocus
                            containerStyle={{ marginBottom: 24 }}
                        />

                        {emailValid ? <Text style={[styles.successText, { color: colors.success }]}>✓ E-posta geçerli</Text> : null}

                        <Button
                            title="Devam Et"
                            onPress={() => setCurrentStep('password')}
                            disabled={!emailValid}
                            variant={emailValid ? 'primary' : 'secondary'}
                            style={{ marginTop: 8 }}
                            icon={<Ionicons name="arrow-forward" size={20} color={emailValid ? Colors.dark.text : colors.textSecondary} style={{ marginRight: 8 }} />}
                        />
                    </Animated.View>
                );

            case 'password':
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                        <TouchableOpacity onPress={() => setCurrentStep('email')} style={styles.backLink}>
                            <Text style={[styles.backLinkText, { color: colors.textSecondary }]}>← Geri</Text>
                        </TouchableOpacity>

                        <Text style={[styles.title, { color: colors.textPrimary }]}>Şifrenizi belirleyin</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Güçlü bir şifre oluşturun</Text>

                        <Input
                            label="Şifre"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="En az 8 karakter"
                            secureTextEntry={!showPassword}
                            error={passwordError}
                            containerStyle={{ marginBottom: 24 }}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: 10, top: 120, zIndex: 10 }} // Adjusted roughly for input height
                        >
                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
                        </TouchableOpacity>

                        {passwordValid ? <Text style={[styles.successText, { color: colors.success }]}>✓ Şifre güçlü</Text> : null}

                        <Button
                            title="Şifreyi Onayla"
                            onPress={() => setCurrentStep('teamName')}
                            disabled={!passwordValid}
                            variant={passwordValid ? 'primary' : 'secondary'}
                            style={{ marginTop: 8 }}
                            icon={<Ionicons name="arrow-forward" size={20} color={passwordValid ? Colors.dark.text : colors.textSecondary} style={{ marginRight: 8 }} />}
                        />
                    </Animated.View>
                );

            case 'teamName':
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                        <TouchableOpacity onPress={() => setCurrentStep('password')} style={styles.backLink}>
                            <Text style={[styles.backLinkText, { color: colors.textSecondary }]}>← Geri</Text>
                        </TouchableOpacity>

                        <Text style={[styles.title, { color: colors.textPrimary }]}>Takım adınızı seçin</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Bu, sizin Stoocker adresiniz olacak</Text>

                        <Input
                            label="Takım Adı"
                            value={teamName}
                            onChangeText={(text) => setTeamName(text.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            placeholder="sirketiniz"
                            autoCapitalize="none"
                            error={teamNameError}
                            containerStyle={{ marginBottom: 8 }}
                        />
                        <Text style={[styles.suffix, { color: colors.textSecondary, marginBottom: 24, textAlign: 'right' }]}>.stoocker.app</Text>

                        {teamNameValid ? <Text style={[styles.successText, { color: colors.success }]}>✓ Takım adı kullanılabilir</Text> : null}

                        <Button
                            title="Takım Adını Onayla"
                            onPress={() => setCurrentStep('fullName')}
                            disabled={!teamNameValid}
                            variant={teamNameValid ? 'primary' : 'secondary'}
                            style={{ marginTop: 8 }}
                            icon={<Ionicons name="arrow-forward" size={20} color={teamNameValid ? Colors.dark.text : colors.textSecondary} style={{ marginRight: 8 }} />}
                        />
                    </Animated.View>
                );

            case 'fullName':
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                        <TouchableOpacity onPress={() => setCurrentStep('teamName')} style={styles.backLink}>
                            <Text style={[styles.backLinkText, { color: colors.textSecondary }]}>← Geri</Text>
                        </TouchableOpacity>

                        <Text style={[styles.title, { color: colors.textPrimary }]}>Adınız ve soyadınız</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Son adım! Hemen tamamlayın</Text>

                        <Input
                            label="Ad"
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="Adınız"
                            containerStyle={{ marginBottom: 16 }}
                        />

                        <Input
                            label="Soyad"
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Soyadınız"
                            containerStyle={{ marginBottom: 24 }}
                        />

                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setAcceptTerms(!acceptTerms)}
                        >
                            <View style={[styles.checkbox, { borderColor: colors.primary }, acceptTerms && { backgroundColor: colors.primary }]}>
                                {acceptTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
                            </View>
                            <Text style={[styles.checkboxLabel, { color: colors.textSecondary }]}>Kullanım koşullarını kabul ediyorum</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setAcceptPrivacy(!acceptPrivacy)}
                        >
                            <View style={[styles.checkbox, { borderColor: colors.primary }, acceptPrivacy && { backgroundColor: colors.primary }]}>
                                {acceptPrivacy && <Ionicons name="checkmark" size={14} color="#fff" />}
                            </View>
                            <Text style={[styles.checkboxLabel, { color: colors.textSecondary }]}>Gizlilik politikasını kabul ediyorum</Text>
                        </TouchableOpacity>

                        <Button
                            title="Tamamla ve Başla"
                            onPress={handleComplete}
                            loading={isLoading}
                            disabled={!firstName || !lastName || !acceptTerms || !acceptPrivacy}
                            variant="primary"
                            style={{ marginTop: 16 }}
                            icon={<Ionicons name="checkmark-circle-outline" size={20} color={Colors.dark.text} style={{ marginRight: 8 }} />}
                        />
                    </Animated.View>
                );

            case 'complete':
                return (
                    <Animated.View entering={FadeInRight} style={styles.stepContainer}>
                        <View style={styles.successIconContainer}>
                            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
                        </View>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Hoş Geldiniz, {firstName}!</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Hesabınız başarıyla oluşturuldu.</Text>
                        <Text style={[styles.subtitle, { color: colors.primary, marginTop: 8 }]}>
                            {teamName}.stoocker.app
                        </Text>

                        <Button
                            title="Giriş Yap"
                            onPress={() => navigation.navigate('Login')}
                            variant="primary"
                            style={{ marginTop: 24 }}
                        />
                    </Animated.View>
                );
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Background Gradient */}
            <View style={StyleSheet.absoluteFill}>
                <DotBackground />
                <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', colors.background]}
                    locations={[0, 0.6, 1]}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.content}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
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
                            <Text style={[styles.appName, { color: colors.textPrimary }]}>Stoocker</Text>
                        </Animated.View>

                        {currentStep !== 'complete' && (
                            <View style={styles.progressContainer}>
                                {['email', 'password', 'teamName', 'fullName'].map((step, index) => {
                                    const steps: Step[] = ['email', 'password', 'teamName', 'fullName'];
                                    const currentIndex = steps.indexOf(currentStep);
                                    const isActive = index <= currentIndex;
                                    return (
                                        <View
                                            key={step}
                                            style={[
                                                styles.progressDot,
                                                isActive && styles.progressDotActive,
                                                { backgroundColor: isActive ? colors.primary : (theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)') }
                                            ]}
                                        />
                                    );
                                })}
                            </View>
                        )}

                        <Card variant="outlined" style={[styles.card, { backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : '#ffffff', borderColor: colors.border }]}>
                            {renderStepContent()}
                        </Card>

                        {currentStep === 'email' && (
                            <Animated.View entering={FadeIn.delay(500)} style={styles.footer}>
                                <Text style={[styles.footerText, { color: colors.textSecondary }]}>Zaten hesabınız var mı? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                    <Text style={[styles.link, { color: colors.primary }]}>Giriş Yapın</Text>
                                </TouchableOpacity>
                            </Animated.View>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 160,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logo: {
        width: '70%',
        height: '70%',
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        letterSpacing: -1,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
        gap: 8,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    progressDotActive: {
        width: 24,
    },
    stepContainer: {
        width: '100%',
    },
    card: {
        padding: 24,
        borderRadius: 24,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 32,
        textAlign: 'center',
    },
    suffix: {
        fontSize: 14,
    },
    backLink: {
        marginBottom: 16,
    },
    backLinkText: {
        fontSize: 14,
    },
    successText: {
        fontSize: 14,
        marginBottom: 16,
        marginLeft: 4,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxLabel: {
        fontSize: 14,
        flex: 1,
    },
    successIconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        fontSize: 14,
    },
    link: {
        fontWeight: 'bold',
        fontSize: 14,
    },
});
