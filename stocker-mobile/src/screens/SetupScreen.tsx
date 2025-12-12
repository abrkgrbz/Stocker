import React, { useState, useEffect, useRef, useMemo } from 'react';
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
    Platform,
    KeyboardAvoidingView,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { apiService } from '../services/api';
import { colors, spacing, typography } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Loading } from '../components/Loading';
import { Toast } from '../components/Toast';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlert } from '../context/AlertContext';
import { usePricingSignalR } from '../hooks/usePricingSignalR';

const { width } = Dimensions.get('window');

type SetupStep = 'package-type' | 'package' | 'custom-package' | 'users' | 'storage' | 'addons' | 'industry' | 'company' | 'complete';
type PackageType = 'ready' | 'custom';
type BillingCycle = 'monthly' | 'quarterly' | 'semiannual' | 'annual';

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
    modules: Array<{
        moduleCode: string;
        moduleName: string;
        isIncluded: boolean;
    }>;
    trialDays: number;
}

interface ModuleDefinition {
    id: string;
    code: string;
    name: string;
    description?: string;
    icon?: string;
    monthlyPrice: number;
    currency: string;
    isCore: boolean;
    isActive: boolean;
    displayOrder: number;
    category?: string;
    dependencies: string[];
}

interface SetupOptions {
    userTiers: any[];
    storagePlans: any[];
    addOns: any[];
    industries: any[];
}

export default function SetupScreen({ navigation }: any) {
    const { showAlert } = useAlert();
    const { user, completeSetup, logout } = useAuthStore();
    const [currentStep, setCurrentStep] = useState<SetupStep>('package-type');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'error' as 'success' | 'error' | 'info' });

    // Package Type
    const [packageType, setPackageType] = useState<PackageType>('ready');

    // Message Handling
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
        setToast({ visible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, visible: false });
    };

    // Ready Package State
    const [packages, setPackages] = useState<PackageOption[]>([]);
    const [selectedPackageId, setSelectedPackageId] = useState<string>('');
    const [loadingPackages, setLoadingPackages] = useState(false);

    // Custom Package State
    const [modules, setModules] = useState<ModuleDefinition[]>([]);
    const [selectedModuleCodes, setSelectedModuleCodes] = useState<string[]>([]);
    const [loadingModules, setLoadingModules] = useState(false);
    const [setupOptions, setSetupOptions] = useState<SetupOptions | null>(null);
    const [loadingSetupOptions, setLoadingSetupOptions] = useState(false);

    // Custom Selections
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
    const [userCount, setUserCount] = useState<number>(1);
    const [selectedStoragePlanCode, setSelectedStoragePlanCode] = useState<string>('');
    const [selectedAddOnCodes, setSelectedAddOnCodes] = useState<string[]>([]);
    const [selectedIndustryCode, setSelectedIndustryCode] = useState<string>('');

    // Company State
    const [companyName, setCompanyName] = useState('');
    const [companyCode, setCompanyCode] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [address, setAddress] = useState('');
    const [taxOffice, setTaxOffice] = useState('');
    const [taxNumber, setTaxNumber] = useState('');

    // SignalR Hook
    const {
        connect,
        disconnect,
        calculatePrice,
        priceResult,
        isCalculating,
        isConnected
    } = usePricingSignalR();

    // Debounce Ref
    const priceCalculationTimeoutRef = useRef<any>(null);

    // --- Effects ---

    // Load initial data
    useEffect(() => {
        loadPackages();
    }, []);

    // Connect SignalR when Custom Package is selected
    useEffect(() => {
        if (packageType === 'custom') {
            connect();
            if (modules.length === 0) loadModules();
            if (!setupOptions) loadSetupOptions();
        } else {
            disconnect();
        }
    }, [packageType]);

    // Calculate Price when selections change
    useEffect(() => {
        if (packageType === 'custom' && isConnected && selectedModuleCodes.length > 0) {
            if (priceCalculationTimeoutRef.current) clearTimeout(priceCalculationTimeoutRef.current);

            priceCalculationTimeoutRef.current = setTimeout(() => {
                calculatePrice({
                    selectedModuleCodes,
                    userCount,
                    storagePlanCode: selectedStoragePlanCode || undefined,
                    selectedAddOnCodes: selectedAddOnCodes.length > 0 ? selectedAddOnCodes : undefined
                });
            }, 500);
        }
    }, [selectedModuleCodes, userCount, selectedStoragePlanCode, selectedAddOnCodes, isConnected]);

    // --- Loading Data ---

    const loadPackages = async () => {
        try {
            setLoadingPackages(true);
            const response = await apiService.public.getPackages();
            if (response.data.success && response.data.data) {
                setPackages(response.data.data);
                if (response.data.data.length > 0) setSelectedPackageId(response.data.data[0].id);
            }
        } catch (error) {
            console.error('Failed to load packages:', error);
            showToast('Paketler yüklenemedi', 'error');
        } finally {
            setLoadingPackages(false);
        }
    };

    const loadModules = async () => {
        try {
            setLoadingModules(true);
            const response = await apiService.public.getModules();
            if (response.data.success && response.data.data) {
                setModules(response.data.data);
                // Pre-select core modules
                const coreCodes = response.data.data.filter((m: ModuleDefinition) => m.isCore).map((m: any) => m.code);
                setSelectedModuleCodes(coreCodes);
            }
        } catch (error) {
            console.error('Failed to load modules:', error);
            showToast('Modüller yüklenemedi', 'error');
        } finally {
            setLoadingModules(false);
        }
    };

    const loadSetupOptions = async () => {
        try {
            setLoadingSetupOptions(true);
            const response = await apiService.public.getSetupOptions();
            if (response.data.success && response.data.data) {
                setSetupOptions(response.data.data);
                const defaultStorage = response.data.data.storagePlans.find((p: any) => p.isDefault);
                if (defaultStorage) setSelectedStoragePlanCode(defaultStorage.code);
            }
        } catch (error) {
            console.error('Failed to load setup options:', error);
            showToast('Seçenekler yüklenemedi', 'error');
        } finally {
            setLoadingSetupOptions(false);
        }
    };

    // --- Logic ---

    const toggleModule = (moduleCode: string) => {
        const module = modules.find(m => m.code === moduleCode);
        if (module?.isCore) return;

        setSelectedModuleCodes(prev => {
            if (prev.includes(moduleCode)) {
                // Deselect logic (check dependencies)
                const dependentModules = modules.filter(m => prev.includes(m.code) && m.dependencies.includes(moduleCode));
                if (dependentModules.length > 0) {
                    Alert.alert('Uyarı', `Bu modül şu modüller tarafından kullanılıyor: ${dependentModules.map(m => m.name).join(', ')}`);
                    return prev;
                }
                return prev.filter(c => c !== moduleCode);
            } else {
                // Select logic (add dependencies)
                const newCodes = [...prev, moduleCode];
                module?.dependencies.forEach(dep => {
                    if (!newCodes.includes(dep)) newCodes.push(dep);
                });
                return newCodes;
            }
        });
    };

    const handleNext = () => {
        switch (currentStep) {
            case 'package-type':
                if (packageType === 'ready') setCurrentStep('package');
                else setCurrentStep('custom-package');
                break;
            case 'package':
                if (!selectedPackageId) showToast('Lütfen bir paket seçin', 'error');
                else setCurrentStep('company');
                break;
            case 'custom-package':
                if (selectedModuleCodes.filter(c => !modules.find(m => m.code === c)?.isCore).length === 0) {
                    showToast('Lütfen en az bir modül seçin', 'error');
                } else {
                    setCurrentStep('users');
                }
                break;
            case 'users':
                if (userCount < 1) showToast('En az 1 kullanıcı seçmelisiniz', 'error');
                else setCurrentStep('storage');
                break;
            case 'storage':
                setCurrentStep('addons');
                break;
            case 'addons':
                setCurrentStep('industry');
                break;
            case 'industry':
                if (selectedIndustryCode && setupOptions) {
                    // Apply recommended modules
                    const industry = setupOptions.industries.find((i: any) => i.code === selectedIndustryCode);
                    if (industry) {
                        const newCodes = [...selectedModuleCodes];
                        industry.recommendedModules.forEach((m: string) => {
                            if (!newCodes.includes(m)) newCodes.push(m);
                        });
                        setSelectedModuleCodes(newCodes);
                    }
                }
                setCurrentStep('company');
                break;
            case 'company':
                handleCompanySubmit();
                break;
        }
    };

    const handleCompanySubmit = async () => {
        if (!companyName.trim() || !companyCode.trim()) {
            showToast('Firma adı ve kodu zorunludur', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const payload = packageType === 'ready'
                ? {
                    packageId: selectedPackageId,
                    companyName, companyCode, contactPhone, address, taxOffice, taxNumber
                }
                : {
                    customPackage: {
                        selectedModuleCodes,
                        billingCycle,
                        userCount,
                        storagePlanCode: selectedStoragePlanCode || null,
                        selectedAddOnCodes: selectedAddOnCodes.length > 0 ? selectedAddOnCodes : null,
                        industryCode: selectedIndustryCode || null
                    },
                    companyName, companyCode, contactPhone, address, taxOffice, taxNumber
                };

            const response = await apiService.setup.complete(payload);

            if (response.data.success) {
                setCurrentStep('complete');
                completeSetup();
            } else {
                throw new Error(response.data.message || 'Kurulum tamamlanamadı');
            }
        } catch (error: any) {
            showToast(error.message || 'Kurulum hatası', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        showAlert({
            title: 'Çıkış Yap',
            message: 'Kurulumu iptal etmek istiyor musunuz?',
            type: 'warning',
            buttons: [
                { text: 'İptal', style: 'cancel' },
                { text: 'Çıkış', style: 'destructive', onPress: logout }
            ]
        });
    };

    // --- Render Helpers ---

    const renderPriceSummary = () => {
        if (packageType !== 'custom' || !['custom-package', 'users', 'storage', 'addons', 'industry'].includes(currentStep)) return null;

        return (
            <View style={styles.pricePanel}>
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Toplam ({billingCycle === 'monthly' ? 'Aylık' : 'Dönemlik'})</Text>
                    {isCalculating ? (
                        <Loading visible={false} text="" /> // Just spinner
                    ) : (
                        <Text style={styles.priceValue}>
                            {priceResult
                                ? `₺${(billingCycle === 'monthly' ? priceResult.monthlyTotal : priceResult.annualTotal).toFixed(2)}`
                                : 'Hesaplanıyor...'}
                        </Text>
                    )}
                </View>
                {!isConnected && <Text style={styles.reconnecting}>Bağlanıyor...</Text>}
            </View>
        );
    };

    const renderFooter = () => {
        if (currentStep === 'complete') return null;

        return (
            <View style={styles.footer}>
                {currentStep !== 'package-type' && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setCurrentStep('package-type')} // Simplified back
                    >
                        <Text style={styles.backButtonText}>Geri</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>
                        {currentStep === 'company' ? 'Tamamla' : 'Devam Et'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    // --- Render Steps ---

    const renderPackageTypeStep = () => (
        <Animated.View entering={FadeInRight}>
            <Text style={styles.title}>Paketinizi Seçin</Text>
            <Text style={styles.subtitle}>İhtiyacınıza en uygun başlangıcı yapın.</Text>

            <TouchableOpacity
                style={[styles.bigCard, packageType === 'ready' && styles.bigCardSelected]}
                onPress={() => setPackageType('ready')}
            >
                <Ionicons name="gift-outline" size={32} color={colors.white} />
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Hazır Paketler</Text>
                    <Text style={styles.cardDesc}>Sizin için hazırlanmış avantajlı paketler.</Text>
                </View>
                {packageType === 'ready' && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.bigCard, packageType === 'custom' && styles.bigCardSelected]}
                onPress={() => setPackageType('custom')}
            >
                <Ionicons name="construct-outline" size={32} color={colors.white} />
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Kendi Paketini Oluştur</Text>
                    <Text style={styles.cardDesc}>İhtiyacınız olan modülleri seçin, sadece kullandığınızı ödeyin.</Text>
                </View>
                {packageType === 'custom' && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
            </TouchableOpacity>
        </Animated.View>
    );

    const renderCustomPackageStep = () => (
        <Animated.View entering={FadeInRight}>
            <Text style={styles.title}>Modül Seçimi</Text>
            <Text style={styles.subtitle}>İhtiyacınız olan modülleri ekleyin.</Text>

            {loadingModules ? <Loading visible={true} text="Modüller yükleniyor..." /> : (
                modules.map(module => (
                    <TouchableOpacity
                        key={module.code}
                        style={[styles.moduleCard, selectedModuleCodes.includes(module.code) && styles.moduleCardSelected]}
                        onPress={() => toggleModule(module.code)}
                        disabled={module.isCore}
                    >
                        <View style={styles.moduleHeader}>
                            <Text style={styles.moduleName}>{module.name}</Text>
                            <Text style={styles.modulePrice}>₺{module.monthlyPrice}/ay</Text>
                        </View>
                        <Text style={styles.moduleDesc}>{module.description || 'Açıklama yok'}</Text>
                        {module.isCore && <Text style={styles.coreBadge}>Zorunlu</Text>}
                    </TouchableOpacity>
                ))
            )}
        </Animated.View>
    );

    const renderUsersStep = () => (
        <Animated.View entering={FadeInRight}>
            <Text style={styles.title}>Kullanıcı Sayısı</Text>
            <Text style={styles.subtitle}>Sistemi kaç kişi kullanacak?</Text>

            <View style={styles.counterContainer}>
                <TouchableOpacity onPress={() => setUserCount(prev => Math.max(1, prev - 1))} style={styles.counterBtn}>
                    <Ionicons name="remove" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.counterText}>{userCount}</Text>
                <TouchableOpacity onPress={() => setUserCount(prev => prev + 1)} style={styles.counterBtn}>
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>
            <Text style={styles.infoText}>Kişi başı fiyat kullanıcı sayısı arttıkça düşer.</Text>
        </Animated.View>
    );

    const renderStorageStep = () => (
        <Animated.View entering={FadeInRight}>
            <Text style={styles.title}>Depolama Alanı</Text>
            <Text style={styles.subtitle}>Verileriniz için ne kadar alana ihtiyacınız var?</Text>

            {loadingSetupOptions ? <Loading visible={true} text="Seçenekler yükleniyor..." /> : (
                setupOptions?.storagePlans.map((plan: any) => (
                    <TouchableOpacity
                        key={plan.code}
                        style={[styles.moduleCard, selectedStoragePlanCode === plan.code && styles.moduleCardSelected]}
                        onPress={() => setSelectedStoragePlanCode(plan.code)}
                    >
                        <View style={styles.moduleHeader}>
                            <Text style={styles.moduleName}>{plan.name}</Text>
                            <Text style={styles.modulePrice}>
                                {plan.monthlyPrice === 0 ? 'Ücretsiz' : `₺${plan.monthlyPrice}/ay`}
                            </Text>
                        </View>
                        <Text style={styles.moduleDesc}>{plan.description || `${plan.capacity} GB Depolama Alanı`}</Text>
                    </TouchableOpacity>
                ))
            )}
        </Animated.View>
    );

    const renderAddonsStep = () => (
        <Animated.View entering={FadeInRight}>
            <Text style={styles.title}>Ek Özellikler</Text>
            <Text style={styles.subtitle}>İşletmenizi güçlendirecek ekler seçin.</Text>

            {loadingSetupOptions ? <Loading visible={true} /> : (
                setupOptions?.addOns.length === 0 ? (
                    <Text style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 20 }}>Ek özellik bulunmuyor.</Text>
                ) : (
                    setupOptions?.addOns.map((addon: any) => (
                        <TouchableOpacity
                            key={addon.code}
                            style={[styles.moduleCard, selectedAddOnCodes.includes(addon.code) && styles.moduleCardSelected]}
                            onPress={() => {
                                setSelectedAddOnCodes(prev =>
                                    prev.includes(addon.code)
                                        ? prev.filter(c => c !== addon.code)
                                        : [...prev, addon.code]
                                )
                            }}
                        >
                            <View style={styles.moduleHeader}>
                                <Text style={styles.moduleName}>{addon.name}</Text>
                                <Text style={styles.modulePrice}>₺{addon.monthlyPrice}/ay</Text>
                            </View>
                            <Text style={styles.moduleDesc}>{addon.description}</Text>
                        </TouchableOpacity>
                    ))
                )
            )}
        </Animated.View>
    );

    const renderIndustryStep = () => (
        <Animated.View entering={FadeInRight}>
            <Text style={styles.title}>Sektör Seçimi</Text>
            <Text style={styles.subtitle}>Size en uygun modülleri önerelim.</Text>

            {loadingSetupOptions ? <Loading visible={true} /> : (
                <View style={{ gap: 10 }}>
                    {setupOptions?.industries.map((industry: any) => (
                        <TouchableOpacity
                            key={industry.code}
                            style={[styles.moduleCard, selectedIndustryCode === industry.code && styles.moduleCardSelected]}
                            onPress={() => setSelectedIndustryCode(industry.code)}
                        >
                            <Text style={styles.moduleName}>{industry.name}</Text>
                            {industry.description && <Text style={styles.moduleDesc}>{industry.description}</Text>}
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        style={[styles.moduleCard, selectedIndustryCode === '' && styles.moduleCardSelected]}
                        onPress={() => setSelectedIndustryCode('')}
                    >
                        <Text style={styles.moduleName}>Diğer / Belirtmek İstemiyorum</Text>
                    </TouchableOpacity>
                </View>
            )}
        </Animated.View>
    );

    const renderCompanyStep = () => (
        <Animated.View entering={FadeInRight}>
            <Text style={styles.title}>Firma Bilgileri</Text>
            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Firma Adı *"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={companyName}
                    onChangeText={setCompanyName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Firma Kodu *"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={companyCode}
                    onChangeText={setCompanyCode}
                    autoCapitalize="characters"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Telefon"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={contactPhone}
                    onChangeText={setContactPhone}
                    keyboardType="phone-pad"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Vergi Dairesi"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={taxOffice}
                    onChangeText={setTaxOffice}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Vergi No"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={taxNumber}
                    onChangeText={setTaxNumber}
                    keyboardType="number-pad"
                />
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Adres"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={address}
                    onChangeText={setAddress}
                    multiline
                />
            </View>
        </Animated.View>
    );

    const renderPackageStep = () => (
        <Animated.View entering={FadeInRight}>
            <Text style={styles.title}>Paket Seçimi</Text>
            {loadingPackages ? <Loading visible={true} /> : (
                packages.map(pkg => (
                    <TouchableOpacity
                        key={pkg.id}
                        style={[styles.packageCard, selectedPackageId === pkg.id && styles.packageCardSelected]}
                        onPress={() => setSelectedPackageId(pkg.id)}
                    >
                        <View style={styles.packageHeader}>
                            <Text style={styles.packageName}>{pkg.name}</Text>
                            <Text style={styles.priceAmount}>₺{pkg.basePrice.amount}/ay</Text>
                        </View>
                        <Text style={styles.packageDescription}>{pkg.description}</Text>
                        {pkg.modules?.length > 0 && (
                            <View style={styles.featuresList}>
                                <Text style={styles.featureHeader}>Modüller:</Text>
                                {pkg.modules.slice(0, 3).map((m, i) => (
                                    <Text key={i} style={styles.featureText}>• {m.moduleName}</Text>
                                ))}
                            </View>
                        )}
                    </TouchableOpacity>
                ))
            )}
        </Animated.View>
    );

    return (
        <LinearGradient colors={['#28002D', '#1A315A']} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <Loading visible={isLoading} text="İşleniyor..." />
                <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardView}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Kurulum</Text>
                        <TouchableOpacity onPress={handleLogout}>
                            <Ionicons name="close-circle-outline" size={28} color={colors.error} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.contentContainer}>
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            {currentStep === 'package-type' && renderPackageTypeStep()}

                            {currentStep === 'package' && (
                                <>
                                    {packages.length === 0 && !loadingPackages && (
                                        <View style={styles.errorContainer}>
                                            <Text style={styles.errorText}>Paketler yüklenemedi.</Text>
                                            <TouchableOpacity style={styles.retryButton} onPress={loadPackages}>
                                                <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    {renderPackageStep()}
                                </>
                            )}

                            {currentStep === 'custom-package' && renderCustomPackageStep()}
                            {currentStep === 'users' && renderUsersStep()}
                            {currentStep === 'storage' && renderStorageStep()}
                            {currentStep === 'addons' && renderAddonsStep()}
                            {currentStep === 'industry' && renderIndustryStep()}
                            {currentStep === 'company' && renderCompanyStep()}
                            {currentStep === 'complete' && (
                                <View style={styles.centerContent}>
                                    <Ionicons name="checkmark-circle" size={80} color={colors.success} />
                                    <Text style={styles.title}>Tamamlandı!</Text>
                                    <Text style={styles.subtitle}>Yönlendiriliyorsunuz...</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>

                    {renderPriceSummary()}
                    {renderFooter()}

                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    keyboardView: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, alignItems: 'center', backgroundColor: 'transparent' },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },

    // Layout
    contentContainer: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 20 },

    title: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: 30 },

    // Error Handling
    errorContainer: { alignItems: 'center', marginVertical: 20 },
    errorText: { color: colors.error, marginBottom: 10 },
    retryButton: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 },
    retryButtonText: { color: 'white' },

    // Cards
    bigCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: 'transparent' },
    bigCardSelected: { borderColor: colors.primary, backgroundColor: 'rgba(102, 126, 234, 0.1)' },
    cardContent: { flex: 1, marginLeft: 15 },
    cardTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    cardDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 },

    // Modules
    moduleCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: 'transparent' },
    moduleCardSelected: { borderColor: colors.primary, backgroundColor: 'rgba(102, 126, 234, 0.2)' },
    moduleHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    moduleName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    modulePrice: { color: colors.success, fontWeight: 'bold' },
    moduleDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
    coreBadge: { position: 'absolute', top: -8, right: 10, backgroundColor: colors.warning, paddingHorizontal: 8, borderRadius: 4, fontSize: 10, color: 'black', fontWeight: 'bold', overflow: 'hidden' },

    // Counter
    counterContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 30 },
    counterBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 30 },
    counterText: { color: 'white', fontSize: 32, fontWeight: 'bold', marginHorizontal: 30 },
    infoText: { color: 'rgba(255,255,255,0.5)', textAlign: 'center' },

    // Form
    form: { gap: 15 },
    input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 15, color: 'white', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    textArea: { height: 100, textAlignVertical: 'top' },

    // Footer - Relative Layout
    footer: { flexDirection: 'row', padding: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', backgroundColor: 'transparent' },
    backButton: { padding: 15, marginRight: 15 },
    backButtonText: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
    nextButton: { flex: 1, backgroundColor: colors.primary, borderRadius: 10, padding: 15, alignItems: 'center' },
    nextButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    // Price Panel
    pricePanel: { marginHorizontal: 20, marginBottom: 10, backgroundColor: 'rgba(10, 14, 39, 0.9)', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: colors.primary },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    priceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
    priceValue: { color: colors.success, fontWeight: 'bold', fontSize: 20 },
    reconnecting: { color: colors.warning, fontSize: 12, marginTop: 5, textAlign: 'right' },

    centerContent: { alignItems: 'center', marginTop: 50 },

    packageCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: 'transparent' },
    packageCardSelected: { borderColor: colors.primary, backgroundColor: 'rgba(24, 144, 255, 0.1)' },
    packageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    packageName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    priceAmount: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
    packageDescription: { color: 'rgba(255,255,255,0.7)', marginBottom: 10 },
    featuresList: { marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 10 },
    featureHeader: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
    featureText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 2 },
});
