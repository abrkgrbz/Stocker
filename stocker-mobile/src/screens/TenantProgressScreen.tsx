import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInDown,
    FadeInRight,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    Easing
} from 'react-native-reanimated';
import { signalRService, TenantCreationProgress } from '../services/signalr';
import { colors, spacing, typography } from '../theme/colors';

const { width } = Dimensions.get('window');

// Step configuration with icons and messages
const stepConfig: Record<string, { message: string; icon: string }> = {
    'EmailVerified': { message: 'E-posta doğrulandı', icon: 'mail-outline' },
    'Starting': { message: 'Başlatılıyor', icon: 'rocket-outline' },
    'CreatingTenant': { message: 'Şirket kaydı oluşturuluyor', icon: 'business-outline' },
    'CreatingSubscription': { message: 'Abonelik hazırlanıyor', icon: 'card-outline' },
    'CreatingMasterUser': { message: 'Kullanıcı hesabı oluşturuluyor', icon: 'person-add-outline' },
    'CreatingDatabase': { message: 'Veritabanı oluşturuluyor', icon: 'server-outline' },
    'RunningMigrations': { message: 'Veritabanı yapılandırılıyor', icon: 'settings-outline' },
    'SeedingData': { message: 'İlk veriler yükleniyor', icon: 'stats-chart-outline' },
    'ActivatingModules': { message: 'Modüller aktifleştiriliyor', icon: 'extension-puzzle-outline' },
    'ActivatingTenant': { message: 'Hesabınız aktifleştiriliyor', icon: 'flash-outline' },
    'SendingWelcomeEmail': { message: 'Hoşgeldin e-postası gönderiliyor', icon: 'mail-unread-outline' },
    'Completed': { message: 'Tamamlandı', icon: 'checkmark-circle-outline' },
    'Failed': { message: 'Hata oluştu', icon: 'alert-circle-outline' }
};

interface ProgressState {
    step: string;
    message: string;
    percentage: number;
    isCompleted: boolean;
    hasError: boolean;
    errorMessage?: string;
}

export default function TenantProgressScreen({ route, navigation }: any) {
    const { registrationId } = route.params || {};

    const [progress, setProgress] = useState<ProgressState>({
        step: 'Starting',
        message: 'Hazırlanıyor...',
        percentage: 0,
        isCompleted: false,
        hasError: false,
    });

    const [connectionError, setConnectionError] = useState<string | null>(null);

    // Animation values
    const progressValue = useSharedValue(0);

    useEffect(() => {
        progressValue.value = withTiming(progress.percentage, { duration: 500 });
    }, [progress.percentage]);

    useEffect(() => {
        if (!registrationId) {
            setConnectionError('Kayıt bilgisi bulunamadı');
            return;
        }

        let isSubscribed = true;

        const setupSignalR = async () => {
            try {
                await signalRService.connect();

                if (!isSubscribed) return;

                signalRService.onTenantCreationProgress((data) => {
                    setProgress({
                        step: data.step,
                        message: data.message,
                        percentage: data.progressPercentage,
                        isCompleted: data.isCompleted,
                        hasError: data.hasError,
                        errorMessage: data.errorMessage,
                    });

                    if (data.isCompleted && !data.hasError) {
                        // Wait a bit before navigating to let user see 100%
                        setTimeout(() => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login', params: { message: 'Hesabınız oluşturuldu. Giriş yapabilirsiniz.' } }],
                            });
                        }, 2000);
                    }
                });

                await signalRService.joinRegistrationGroup(registrationId);

            } catch (error) {
                console.error('SignalR setup failed:', error);
                if (isSubscribed) {
                    setConnectionError('Bağlantı kurulamadı. Lütfen tekrar deneyin.');
                }
            }
        };

        setupSignalR();

        return () => {
            isSubscribed = false;
            signalRService.offTenantCreationProgress();
            signalRService.leaveRegistrationGroup(registrationId).catch(console.error);
            signalRService.disconnect().catch(console.error);
        };
    }, [registrationId]);

    const handleRetry = () => {
        setConnectionError(null);
        // Re-run effect logic by forcing re-render or extracting logic
        // For simplicity, just navigation.replace to self
        navigation.replace('TenantProgress', { registrationId });
    };

    const visibleSteps = Object.entries(stepConfig).filter(
        ([key]) => key !== 'EmailVerified' && key !== 'Failed'
    );

    const renderStep = (stepKey: string, config: { message: string; icon: string }, index: number) => {
        const stepIndex = Object.keys(stepConfig).indexOf(stepKey);
        const currentStepIndex = Object.keys(stepConfig).indexOf(progress.step);
        const isCompleted = stepIndex < currentStepIndex || progress.isCompleted;
        const isCurrent = stepKey === progress.step;

        return (
            <Animated.View
                key={stepKey}
                entering={FadeInDown.delay(index * 100)}
                style={[
                    styles.stepItem,
                    isCurrent && styles.stepItemActive,
                    isCompleted && styles.stepItemCompleted
                ]}
            >
                <View style={[
                    styles.stepIconContainer,
                    isCompleted && styles.stepIconCompletedBg,
                    isCurrent && styles.stepIconActiveBg
                ]}>
                    <Ionicons
                        name={isCompleted ? 'checkmark' : config.icon as any}
                        size={20}
                        color={isCompleted || isCurrent ? '#fff' : 'rgba(255,255,255,0.5)'}
                    />
                </View>
                <Text style={[
                    styles.stepText,
                    isCurrent && styles.stepTextActive,
                    isCompleted && styles.stepTextCompleted
                ]}>
                    {config.message}
                </Text>
                {isCurrent && (
                    <View style={styles.loadingIndicator}>
                        <Ionicons name="sync" size={16} color={colors.primary} />
                    </View>
                )}
            </Animated.View>
        );
    };

    if (connectionError) {
        return (
            <LinearGradient
                colors={['#28002D', '#1A315A']}
                style={styles.container}
            >
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={64} color={colors.error} />
                    <Text style={styles.errorTitle}>Bağlantı Hatası</Text>
                    <Text style={styles.errorMessage}>{connectionError}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                        <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['#28002D', '#1A315A']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.progressCircleContainer}>
                            <Text style={styles.progressPercentage}>{Math.round(progress.percentage)}%</Text>
                            <Text style={styles.progressStatus}>
                                {progress.isCompleted ? 'Tamamlandı!' : 'Oluşturuluyor...'}
                            </Text>
                        </View>

                        <View style={styles.progressBarContainer}>
                            <Animated.View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${progress.percentage}%` }
                                ]}
                            />
                        </View>
                    </View>

                    <ScrollView
                        style={styles.stepsList}
                        contentContainerStyle={styles.stepsContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {visibleSteps.map(([key, config], index) => renderStep(key, config, index))}
                    </ScrollView>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Lütfen bu ekranı kapatmayın. İşlem tamamlandığında otomatik olarak yönlendirileceksiniz.
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    } as ViewStyle,
    safeArea: {
        flex: 1,
    } as ViewStyle,
    content: {
        flex: 1,
        padding: spacing.l,
    } as ViewStyle,
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
        marginTop: spacing.xl,
    } as ViewStyle,
    progressCircleContainer: {
        alignItems: 'center',
        marginBottom: spacing.l,
    } as ViewStyle,
    progressPercentage: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: spacing.xs,
    } as TextStyle,
    progressStatus: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.8)',
    } as TextStyle,
    progressBarContainer: {
        width: '100%',
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    } as ViewStyle,
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 3,
    } as ViewStyle,
    stepsList: {
        flex: 1,
    } as ViewStyle,
    stepsContent: {
        paddingBottom: spacing.xl,
    } as ViewStyle,
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        marginBottom: spacing.s,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    } as ViewStyle,
    stepItemActive: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: colors.primary,
    } as ViewStyle,
    stepItemCompleted: {
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        borderColor: 'rgba(40, 167, 69, 0.3)',
    } as ViewStyle,
    stepIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    } as ViewStyle,
    stepIconActiveBg: {
        backgroundColor: colors.primary,
    } as ViewStyle,
    stepIconCompletedBg: {
        backgroundColor: colors.success,
    } as ViewStyle,
    stepText: {
        flex: 1,
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
    } as TextStyle,
    stepTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    } as TextStyle,
    stepTextCompleted: {
        color: '#fff',
    } as TextStyle,
    loadingIndicator: {
        marginLeft: spacing.s,
    } as ViewStyle,
    footer: {
        marginTop: spacing.m,
        padding: spacing.m,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
    } as ViewStyle,
    footerText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        textAlign: 'center',
    } as TextStyle,
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    } as ViewStyle,
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: spacing.l,
        marginBottom: spacing.s,
    } as TextStyle,
    errorMessage: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginBottom: spacing.xl,
    } as TextStyle,
    retryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.m,
        borderRadius: 12,
    } as ViewStyle,
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    } as TextStyle,
});
