import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ViewStyle,
    TextStyle,
    Dimensions,
    SafeAreaView,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { apiService } from '../services/api';
import { colors, spacing, typography } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Loading } from '../components/Loading';
import { Toast } from '../components/Toast';

const { width } = Dimensions.get('window');

type SetupStep = 'package' | 'company' | 'complete';

interface PackageOption {
    id: string;
    name: string;
    description: string;
    basePrice: {
        amount: number;
        currency: string;
    };
    features: Array<{
        featureCode: string;
        featureName: string;
        isEnabled: boolean;
    }>;
    trialDays: number;
}

export default function SetupScreen({ navigation }: any) {
    const { user, updateUser, logout } = useAuthStore();
    const [currentStep, setCurrentStep] = useState<SetupStep>('package');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'error' as 'success' | 'error' | 'info' });

    // Package State
    const [packages, setPackages] = useState<PackageOption[]>([]);
    const [selectedPackageId, setSelectedPackageId] = useState<string>('');
    const [loadingPackages, setLoadingPackages] = useState(true);

    // Company State
    const [companyName, setCompanyName] = useState('');
    const [companyCode, setCompanyCode] = useState('');
    const [sector, setSector] = useState('');
    const [employeeCount, setEmployeeCount] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [address, setAddress] = useState('');
    const [taxOffice, setTaxOffice] = useState('');
    const [taxNumber, setTaxNumber] = useState('');

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
        setToast({ visible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, visible: false });
    };

    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = async () => {
        try {
            setLoadingPackages(true);
            const response = await apiService.public.getPackages();
            if (response.data.success && response.data.data) {
                setPackages(response.data.data);
                if (response.data.data.length > 0) {
                    setSelectedPackageId(response.data.data[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to load packages:', error);
            showToast('Paketler yüklenemedi', 'error');
        } finally {
            setLoadingPackages(false);
        }
    };

    const handlePackageNext = () => {
        if (!selectedPackageId) {
            showToast('Lütfen bir paket seçin', 'error');
            return;
        }
        setCurrentStep('company');
    };

    const handleCompanySubmit = async () => {
        if (!companyName.trim() || !companyCode.trim()) {
            showToast('Firma adı ve kodu zorunludur', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiService.setup.complete({
                packageId: selectedPackageId,
                companyName,
                companyCode,
                sector,
                employeeCount,
                contactPhone,
                address,
                taxOffice,
                taxNumber
            });

            if (response.data.success) {
                setCurrentStep('complete');
                // Update user state to remove requiresSetup
                if (user) {
                    updateUser({ ...user, requiresSetup: false });
                }
            } else {
                throw new Error(response.data.message || 'Kurulum tamamlanamadı');
            }
        } catch (error: any) {
            showToast(error.message || 'Kurulum sırasında hata oluştu', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinish = () => {
        // Navigate to Dashboard and reset stack
        navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard' }],
        });
    };

    const handleLogout = async () => {
        Alert.alert(
            'Çıkış Yap',
            'Kurulumu iptal edip çıkış yapmak istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.error('Logout failed:', error);
                        }
                    }
                }
            ]
        );
    };

    const renderStepIndicator = () => {
        const steps = [
            { key: 'package', label: 'Paket', icon: 'cube-outline' },
            { key: 'company', label: 'Firma', icon: 'business-outline' },
            { key: 'complete', label: 'Tamam', icon: 'checkmark-circle-outline' },
        ];

        return (
            <View style={styles.stepIndicator}>
                {steps.map((step, index) => {
                    const isActive = step.key === currentStep;
                    const isCompleted =
                        (currentStep === 'company' && index === 0) ||
                        (currentStep === 'complete');

                    return (
                        <View key={step.key} style={styles.stepItem}>
                            <View style={[
                                styles.stepIconContainer,
                                isActive && styles.stepIconActive,
                                isCompleted && styles.stepIconCompleted
                            ]}>
                                <Ionicons
                                    name={step.icon as any}
                                    size={20}
                                    color={isActive || isCompleted ? '#fff' : colors.textMuted}
                                />
                            </View>
                            <Text style={[
                                styles.stepLabel,
                                isActive && styles.stepLabelActive
                            ]}>{step.label}</Text>
                            {index < steps.length - 1 && (
                                <View style={[
                                    styles.stepLine,
                                    isCompleted && styles.stepLineCompleted
                                ]} />
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderPackageStep = () => (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
            <Text style={styles.title}>Paket Seçimi</Text>
            <Text style={styles.subtitle}>İşletmeniz için en uygun paketi seçin</Text>

            {loadingPackages ? (
                <View style={styles.loadingContainer}>
                    <Loading visible={true} text="Paketler yükleniyor..." />
                </View>
            ) : (
                <View>
                    {packages.map((pkg) => (
                        <TouchableOpacity
                            key={pkg.id}
                            style={[
                                styles.packageCard,
                                selectedPackageId === pkg.id && styles.packageCardSelected
                            ]}
                            onPress={() => setSelectedPackageId(pkg.id)}
                        >
                            <View style={styles.packageHeader}>
                                <Text style={styles.packageName}>{pkg.name}</Text>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.priceAmount}>₺{pkg.basePrice.amount}</Text>
                                    <Text style={styles.priceCurrency}>/ay</Text>
                                </View>
                            </View>

                            {pkg.trialDays > 0 && (
                                <Text style={styles.trialText}>{pkg.trialDays} gün ücretsiz deneme</Text>
                            )}

                            <Text style={styles.packageDescription}>{pkg.description}</Text>

                            <View style={styles.featuresList}>
                                {pkg.features.slice(0, 3).map((feature, idx) => (
                                    <View key={idx} style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                        <Text style={styles.featureText}>{feature.featureName}</Text>
                                    </View>
                                ))}
                            </View>

                            {selectedPackageId === pkg.id && (
                                <View style={styles.selectedBadge}>
                                    <Ionicons name="checkmark" size={16} color="#fff" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <TouchableOpacity style={styles.button} onPress={handlePackageNext}>
                <Text style={styles.buttonText}>Devam Et</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderCompanyStep = () => (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
            <Text style={styles.title}>Firma Bilgileri</Text>
            <Text style={styles.subtitle}>Firmanızı tanımlayın</Text>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Firma Adı *</Text>
                    <TextInput
                        style={styles.input}
                        value={companyName}
                        onChangeText={setCompanyName}
                        placeholder="Örn: ABC Teknoloji"
                        placeholderTextColor={colors.textMuted}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Firma Kodu *</Text>
                    <TextInput
                        style={styles.input}
                        value={companyCode}
                        onChangeText={setCompanyCode}
                        placeholder="Örn: ABC123"
                        placeholderTextColor={colors.textMuted}
                        autoCapitalize="characters"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Telefon</Text>
                    <TextInput
                        style={styles.input}
                        value={contactPhone}
                        onChangeText={setContactPhone}
                        placeholder="05XX XXX XX XX"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Vergi Dairesi</Text>
                    <TextInput
                        style={styles.input}
                        value={taxOffice}
                        onChangeText={setTaxOffice}
                        placeholder="Vergi Dairesi"
                        placeholderTextColor={colors.textMuted}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Vergi No</Text>
                    <TextInput
                        style={styles.input}
                        value={taxNumber}
                        onChangeText={setTaxNumber}
                        placeholder="Vergi Numarası"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="number-pad"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Adres</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Firma adresi"
                        placeholderTextColor={colors.textMuted}
                        multiline
                        numberOfLines={3}
                    />
                </View>
            </View>

            <View style={styles.buttonGroup}>
                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => setCurrentStep('package')}
                >
                    <Text style={styles.secondaryButtonText}>Geri</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={handleCompanySubmit}
                >
                    <Text style={styles.buttonText}>Kurulumu Tamamla</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    const renderCompleteStep = () => (
        <Animated.View entering={FadeInRight} style={styles.centerContent}>
            <View style={styles.successIcon}>
                <Ionicons name="rocket" size={64} color={colors.success} />
            </View>
            <Text style={styles.title}>Kurulum Tamamlandı! 🎉</Text>
            <Text style={[styles.subtitle, { textAlign: 'center' }]}>
                Hesabınız başarıyla oluşturuldu. Artık işletmenizi yönetmeye başlayabilirsiniz.
            </Text>

            <TouchableOpacity style={[styles.button, { width: '100%', marginTop: spacing.xl }]} onPress={handleFinish}>
                <Text style={styles.buttonText}>Dashboard'a Git</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <Loading visible={isLoading} text="İşlem yapılıyor..." />
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={hideToast}
            />
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Hesap Kurulumu</Text>
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                            <Ionicons name="log-out-outline" size={24} color={colors.error} />
                        </TouchableOpacity>
                    </View>

                    {renderStepIndicator()}

                    <ScrollView contentContainerStyle={styles.content}>
                        {currentStep === 'package' && renderPackageStep()}
                        {currentStep === 'company' && renderCompanyStep()}
                        {currentStep === 'complete' && renderCompleteStep()}
                    </ScrollView>
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
    keyboardView: {
        flex: 1,
    } as ViewStyle,
    header: {
        padding: spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceLight,
        position: 'relative',
    } as ViewStyle,
    headerTitle: {
        ...typography.h3,
        color: colors.textPrimary,
    } as TextStyle,
    logoutButton: {
        position: 'absolute',
        right: spacing.m,
        padding: spacing.xs,
    } as ViewStyle,
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: spacing.m,
        backgroundColor: colors.surface,
    } as ViewStyle,
    stepItem: {
        alignItems: 'center',
        width: 80,
    } as ViewStyle,
    stepIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
    } as ViewStyle,
    stepIconActive: {
        backgroundColor: colors.primary,
    } as ViewStyle,
    stepIconCompleted: {
        backgroundColor: colors.success,
    } as ViewStyle,
    stepLabel: {
        fontSize: 12,
        color: colors.textMuted,
    } as TextStyle,
    stepLabelActive: {
        color: colors.primary,
        fontWeight: 'bold',
    } as TextStyle,
    stepLine: {
        position: 'absolute',
        top: 16,
        left: 50,
        width: 60,
        height: 2,
        backgroundColor: colors.surfaceLight,
        zIndex: -1,
    } as ViewStyle,
    stepLineCompleted: {
        backgroundColor: colors.success,
    } as ViewStyle,
    content: {
        padding: spacing.l,
    } as ViewStyle,
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    } as TextStyle,
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.l,
    } as TextStyle,
    loadingContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    } as ViewStyle,
    packageCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.m,
        marginBottom: spacing.m,
        borderWidth: 2,
        borderColor: 'transparent',
    } as ViewStyle,
    packageCardSelected: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
    } as ViewStyle,
    packageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.s,
    } as ViewStyle,
    packageName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    } as TextStyle,
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    } as ViewStyle,
    priceAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    } as TextStyle,
    priceCurrency: {
        fontSize: 14,
        color: colors.textSecondary,
        marginLeft: 2,
    } as TextStyle,
    trialText: {
        color: colors.success,
        fontSize: 14,
        fontWeight: '500',
        marginBottom: spacing.s,
    } as TextStyle,
    packageDescription: {
        color: colors.textSecondary,
        marginBottom: spacing.m,
    } as TextStyle,
    featuresList: {
        marginTop: spacing.s,
    } as ViewStyle,
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    } as ViewStyle,
    featureText: {
        color: colors.textSecondary,
        marginLeft: spacing.s,
        fontSize: 14,
    } as TextStyle,
    selectedBadge: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: colors.primary,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    button: {
        backgroundColor: colors.primary,
        padding: spacing.m,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: spacing.m,
    } as ViewStyle,
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    } as TextStyle,
    form: {
        gap: spacing.m,
    } as ViewStyle,
    inputGroup: {
        marginBottom: spacing.s,
    } as ViewStyle,
    label: {
        color: colors.textPrimary,
        marginBottom: spacing.xs,
        fontSize: 14,
        fontWeight: '500',
    } as TextStyle,
    input: {
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: spacing.m,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    } as TextStyle,
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    } as TextStyle,
    buttonGroup: {
        flexDirection: 'row',
        gap: spacing.m,
        marginTop: spacing.l,
    } as ViewStyle,
    secondaryButton: {
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    } as ViewStyle,
    primaryButton: {
        flex: 2,
    } as ViewStyle,
    secondaryButtonText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    } as TextStyle,
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
    } as ViewStyle,
    successIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(82, 196, 26, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.l,
    } as ViewStyle,
});
