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
    Dimensions,
    Image,
    ViewStyle,
    TextStyle,
    ImageStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { colors, spacing, typography } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading } = useAuthStore();

    const handleLogin = async () => {
        if (!email || !password) return;
        await login(email, password);
    };

    return (
        <View style={styles.container}>
            {/* Background Elements */}
            <View style={styles.bgGradientTop} />
            <View style={styles.bgGradientBottom} />

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
                                style={styles.title}
                            >
                                Stocker
                            </Animated.Text>
                            <Animated.Text
                                entering={FadeInDown.delay(600).duration(1000).springify()}
                                style={styles.subtitle}
                            >
                                Modern İşletme Yönetimi
                            </Animated.Text>
                        </View>

                        <Animated.View
                            entering={FadeInDown.delay(800).duration(1000).springify()}
                            style={styles.form}
                        >
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>E-posta</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="ornek@sirket.com"
                                        placeholderTextColor={colors.textMuted}
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Şifre</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="******"
                                        placeholderTextColor={colors.textMuted}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#0a1f2e" />
                                ) : (
                                    <Text style={styles.buttonText}>Giriş Yap</Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Hesabınız yok mu? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                    <Text style={styles.linkText}>Kayıt Olun</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
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
    bgGradientTop: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: colors.primary,
        opacity: 0.1,
        transform: [{ scale: 1.5 }],
    } as ViewStyle,
    bgGradientBottom: {
        position: 'absolute',
        bottom: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: colors.secondary,
        opacity: 0.1,
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
        width: 100,
        height: 100,
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
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    } as TextStyle,
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
    } as TextStyle,
    form: {
        width: '100%',
    } as ViewStyle,
    inputContainer: {
        marginBottom: spacing.l,
    } as ViewStyle,
    label: {
        color: colors.textPrimary,
        marginBottom: spacing.s,
        fontSize: 14,
        fontWeight: '500',
    } as TextStyle,
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
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
    button: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        padding: spacing.m,
        alignItems: 'center',
        marginTop: spacing.s,
        shadowColor: colors.accent,
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
        color: colors.textSecondary,
        fontSize: 14,
    } as TextStyle,
    linkText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: 'bold',
    } as TextStyle,
});
