import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Linking, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    CreditCard,
    Crown,
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Pause,
    Play,
    ExternalLink,
    ChevronLeft,
    Sparkles,
    Zap,
    Shield,
    Users,
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { billingService } from '@/lib/api/services/billing.service';
import type { SubscriptionInfo, Plan, TrialInfo } from '@/lib/api/types/billing.types';

export default function BillingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const tabBarHeight = 60 + insets.bottom;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [trialInfo, setTrialInfo] = useState<TrialInfo>({ isInTrial: false, daysRemaining: 0 });
    const [actionLoading, setActionLoading] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [subData, plansData] = await Promise.all([
                billingService.getSubscription(),
                billingService.getPlans(),
            ]);
            setSubscription(subData);
            setPlans(plansData);
            if (subData) {
                setTrialInfo(billingService.getTrialInfo(subData));
            }
        } catch (error) {
            console.error('Failed to load billing data:', error);
            Alert.alert('Hata', 'Fatura bilgileri yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const handleSelectPlan = async (plan: Plan) => {
        try {
            setActionLoading(true);
            const response = await billingService.createCheckout({
                variantId: plan.variantId,
            });
            if (response.checkoutUrl) {
                await Linking.openURL(response.checkoutUrl);
            }
        } catch (error) {
            console.error('Checkout failed:', error);
            Alert.alert('Hata', 'Ödeme sayfası açılamadı');
        } finally {
            setActionLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        try {
            setActionLoading(true);
            const portalUrl = await billingService.getPortalUrl();
            if (portalUrl) {
                await Linking.openURL(portalUrl);
            } else {
                Alert.alert('Bilgi', 'Abonelik yönetim portalı bulunamadı');
            }
        } catch (error) {
            console.error('Portal URL failed:', error);
            Alert.alert('Hata', 'Portal açılamadı');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelSubscription = () => {
        Alert.alert(
            'Aboneliği İptal Et',
            'Aboneliğinizi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'İptal Et',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setActionLoading(true);
                            await billingService.cancelSubscription();
                            Alert.alert('Başarılı', 'Aboneliğiniz iptal edildi');
                            loadData();
                        } catch (error) {
                            console.error('Cancel failed:', error);
                            Alert.alert('Hata', 'Abonelik iptal edilemedi');
                        } finally {
                            setActionLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handlePauseSubscription = async () => {
        try {
            setActionLoading(true);
            await billingService.pauseSubscription();
            Alert.alert('Başarılı', 'Aboneliğiniz duraklatıldı');
            loadData();
        } catch (error) {
            console.error('Pause failed:', error);
            Alert.alert('Hata', 'Abonelik duraklatılamadı');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResumeSubscription = async () => {
        try {
            setActionLoading(true);
            await billingService.resumeSubscription();
            Alert.alert('Başarılı', 'Aboneliğiniz devam ettirildi');
            loadData();
        } catch (error) {
            console.error('Resume failed:', error);
            Alert.alert('Hata', 'Abonelik devam ettirilemedi');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return <CheckCircle size={16} color="#059669" />;
            case 'trial':
                return <Clock size={16} color="#2563eb" />;
            case 'cancelled':
            case 'expired':
                return <XCircle size={16} color="#dc2626" />;
            case 'paused':
                return <Pause size={16} color="#d97706" />;
            default:
                return <AlertTriangle size={16} color="#d97706" />;
        }
    };

    const renderTrialBanner = () => {
        if (!trialInfo.isInTrial) return null;

        const isUrgent = trialInfo.daysRemaining <= 3;

        return (
            <Animated.View entering={FadeInDown.duration(500).delay(100)}>
                <View
                    className="rounded-2xl p-5 mb-6"
                    style={{
                        backgroundColor: isUrgent ? '#fef2f2' : '#eff6ff',
                        borderWidth: 1,
                        borderColor: isUrgent ? '#fecaca' : '#bfdbfe',
                    }}
                >
                    <View className="flex-row items-center mb-3">
                        <View
                            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                            style={{ backgroundColor: isUrgent ? '#fee2e2' : '#dbeafe' }}
                        >
                            {isUrgent ? (
                                <AlertTriangle size={20} color="#dc2626" />
                            ) : (
                                <Clock size={20} color="#2563eb" />
                            )}
                        </View>
                        <View className="flex-1">
                            <Text
                                style={{ color: isUrgent ? '#dc2626' : '#1d4ed8' }}
                                className="font-bold text-base"
                            >
                                Deneme Süreci
                            </Text>
                            <Text
                                style={{ color: isUrgent ? '#b91c1c' : '#1e40af' }}
                                className="text-sm"
                            >
                                {trialInfo.daysRemaining} gün kaldı
                            </Text>
                        </View>
                    </View>
                    <Text
                        style={{ color: isUrgent ? '#991b1b' : '#1e3a8a' }}
                        className="text-sm leading-5"
                    >
                        {isUrgent
                            ? 'Deneme süreniz yakında sona erecek. Hizmetlerinizin kesintisiz devam etmesi için bir plan seçin.'
                            : 'Tüm özelliklerden yararlanmaya devam etmek için deneme süreniz dolmadan bir plan seçin.'}
                    </Text>
                </View>
            </Animated.View>
        );
    };

    const renderCurrentSubscription = () => {
        if (!subscription || trialInfo.isInTrial) return null;

        const statusColors = billingService.getStatusColor(subscription.status);
        const statusText = billingService.getStatusText(subscription.status);

        return (
            <Animated.View entering={FadeInDown.duration(500).delay(150)}>
                <View
                    className="rounded-2xl p-5 mb-6"
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderWidth: 1,
                        borderColor: colors.border.primary,
                    }}
                >
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View
                                className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                                style={{ backgroundColor: colors.brand.primary }}
                            >
                                <Crown size={24} color="#ffffff" />
                            </View>
                            <View>
                                <Text
                                    style={{ color: colors.text.primary }}
                                    className="font-bold text-lg"
                                >
                                    {subscription.productName}
                                </Text>
                                <Text style={{ color: colors.text.secondary }} className="text-sm">
                                    {subscription.variantName}
                                </Text>
                            </View>
                        </View>
                        <View
                            className="px-3 py-1.5 rounded-full flex-row items-center"
                            style={{ backgroundColor: statusColors.bg }}
                        >
                            {getStatusIcon(subscription.status)}
                            <Text
                                style={{ color: statusColors.text }}
                                className="text-xs font-medium ml-1"
                            >
                                {statusText}
                            </Text>
                        </View>
                    </View>

                    <View
                        className="rounded-xl p-4 mb-4"
                        style={{ backgroundColor: colors.background.secondary }}
                    >
                        <View className="flex-row justify-between mb-2">
                            <Text style={{ color: colors.text.secondary }} className="text-sm">
                                Ücret
                            </Text>
                            <Text style={{ color: colors.text.primary }} className="font-semibold">
                                {subscription.unitPrice / 100} {subscription.currency} /{' '}
                                {subscription.billingInterval === 'month' ? 'ay' : 'yıl'}
                            </Text>
                        </View>
                        {subscription.renewsAt && (
                            <View className="flex-row justify-between mb-2">
                                <Text style={{ color: colors.text.secondary }} className="text-sm">
                                    Yenileme Tarihi
                                </Text>
                                <Text style={{ color: colors.text.primary }} className="font-medium">
                                    {new Date(subscription.renewsAt).toLocaleDateString('tr-TR')}
                                </Text>
                            </View>
                        )}
                        {subscription.cardBrand && subscription.cardLastFour && (
                            <View className="flex-row justify-between">
                                <Text style={{ color: colors.text.secondary }} className="text-sm">
                                    Ödeme Yöntemi
                                </Text>
                                <View className="flex-row items-center">
                                    <CreditCard size={14} color={colors.text.secondary} />
                                    <Text
                                        style={{ color: colors.text.primary }}
                                        className="font-medium ml-1"
                                    >
                                        {subscription.cardBrand} •••• {subscription.cardLastFour}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    <View className="flex-row gap-3">
                        <Pressable
                            onPress={handleManageSubscription}
                            disabled={actionLoading}
                            className="flex-1 py-3 rounded-xl flex-row items-center justify-center"
                            style={{ backgroundColor: colors.brand.primary }}
                        >
                            <ExternalLink size={16} color="#ffffff" />
                            <Text className="text-white font-semibold ml-2">Yönet</Text>
                        </Pressable>
                        {subscription.isPaused ? (
                            <Pressable
                                onPress={handleResumeSubscription}
                                disabled={actionLoading}
                                className="flex-1 py-3 rounded-xl flex-row items-center justify-center"
                                style={{
                                    backgroundColor: colors.background.secondary,
                                    borderWidth: 1,
                                    borderColor: colors.border.primary,
                                }}
                            >
                                <Play size={16} color={colors.text.primary} />
                                <Text
                                    style={{ color: colors.text.primary }}
                                    className="font-semibold ml-2"
                                >
                                    Devam Et
                                </Text>
                            </Pressable>
                        ) : (
                            <Pressable
                                onPress={handlePauseSubscription}
                                disabled={actionLoading}
                                className="flex-1 py-3 rounded-xl flex-row items-center justify-center"
                                style={{
                                    backgroundColor: colors.background.secondary,
                                    borderWidth: 1,
                                    borderColor: colors.border.primary,
                                }}
                            >
                                <Pause size={16} color={colors.text.primary} />
                                <Text
                                    style={{ color: colors.text.primary }}
                                    className="font-semibold ml-2"
                                >
                                    Duraklat
                                </Text>
                            </Pressable>
                        )}
                    </View>

                    {!subscription.isCancelled && (
                        <Pressable
                            onPress={handleCancelSubscription}
                            disabled={actionLoading}
                            className="mt-3 py-2"
                        >
                            <Text className="text-center text-sm text-red-500">
                                Aboneliği İptal Et
                            </Text>
                        </Pressable>
                    )}
                </View>
            </Animated.View>
        );
    };

    const renderPlans = () => {
        if (plans.length === 0) return null;

        const planFeatures: Record<string, string[]> = {
            starter: ['5 Kullanıcı', '1.000 Ürün', 'Temel Raporlar', 'E-posta Desteği'],
            professional: [
                '25 Kullanıcı',
                '10.000 Ürün',
                'Gelişmiş Raporlar',
                'Öncelikli Destek',
                'API Erişimi',
            ],
            enterprise: [
                'Sınırsız Kullanıcı',
                'Sınırsız Ürün',
                'Özel Raporlar',
                '7/24 Destek',
                'API & Entegrasyonlar',
                'Özel Eğitim',
            ],
        };

        const getPlanIcon = (name: string) => {
            const lowerName = name.toLowerCase();
            if (lowerName.includes('enterprise')) return Sparkles;
            if (lowerName.includes('professional') || lowerName.includes('pro')) return Zap;
            return Shield;
        };

        return (
            <Animated.View entering={FadeInDown.duration(500).delay(200)}>
                <Text
                    style={{ color: colors.text.tertiary }}
                    className="text-xs font-bold uppercase mb-3 tracking-wider"
                >
                    Planlar
                </Text>
                {plans.map((plan, index) => {
                    const IconComponent = getPlanIcon(plan.productName);
                    const features =
                        planFeatures[plan.productName.toLowerCase()] ||
                        planFeatures['starter'] ||
                        [];
                    const isPopular =
                        plan.productName.toLowerCase().includes('professional') ||
                        plan.productName.toLowerCase().includes('pro');

                    return (
                        <Animated.View
                            key={plan.variantId}
                            entering={FadeInDown.duration(400).delay(250 + index * 50)}
                        >
                            <View
                                className="rounded-2xl p-5 mb-4"
                                style={{
                                    backgroundColor: colors.surface.primary,
                                    borderWidth: isPopular ? 2 : 1,
                                    borderColor: isPopular
                                        ? colors.brand.primary
                                        : colors.border.primary,
                                }}
                            >
                                {isPopular && (
                                    <View
                                        className="absolute -top-3 right-4 px-3 py-1 rounded-full"
                                        style={{ backgroundColor: colors.brand.primary }}
                                    >
                                        <Text className="text-white text-xs font-bold">
                                            Popüler
                                        </Text>
                                    </View>
                                )}

                                <View className="flex-row items-center mb-3">
                                    <View
                                        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                                        style={{
                                            backgroundColor: isPopular
                                                ? colors.brand.primary
                                                : colors.background.tertiary,
                                        }}
                                    >
                                        <IconComponent
                                            size={24}
                                            color={isPopular ? '#ffffff' : colors.text.secondary}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text
                                            style={{ color: colors.text.primary }}
                                            className="font-bold text-lg"
                                        >
                                            {plan.productName}
                                        </Text>
                                        <Text
                                            style={{ color: colors.text.secondary }}
                                            className="text-sm"
                                        >
                                            {plan.variantName}
                                        </Text>
                                    </View>
                                    <View className="items-end">
                                        <Text
                                            style={{ color: colors.text.primary }}
                                            className="font-bold text-xl"
                                        >
                                            {plan.priceFormatted || `${plan.price / 100} TRY`}
                                        </Text>
                                        <Text
                                            style={{ color: colors.text.secondary }}
                                            className="text-xs"
                                        >
                                            / {plan.interval === 'month' ? 'ay' : 'yıl'}
                                        </Text>
                                    </View>
                                </View>

                                <View className="mb-4">
                                    {features.map((feature, fIndex) => (
                                        <View
                                            key={fIndex}
                                            className="flex-row items-center py-1.5"
                                        >
                                            <CheckCircle
                                                size={14}
                                                color={colors.semantic.success}
                                            />
                                            <Text
                                                style={{ color: colors.text.secondary }}
                                                className="text-sm ml-2"
                                            >
                                                {feature}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                <Pressable
                                    onPress={() => handleSelectPlan(plan)}
                                    disabled={actionLoading}
                                    className="py-3 rounded-xl"
                                    style={{
                                        backgroundColor: isPopular
                                            ? colors.brand.primary
                                            : colors.background.tertiary,
                                    }}
                                >
                                    <Text
                                        className="text-center font-semibold"
                                        style={{
                                            color: isPopular ? '#ffffff' : colors.text.primary,
                                        }}
                                    >
                                        {trialInfo.isInTrial ? 'Planı Seç' : 'Yükselt'}
                                    </Text>
                                </Pressable>
                            </View>
                        </Animated.View>
                    );
                })}
            </Animated.View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView
                style={{ flex: 1, backgroundColor: colors.background.secondary }}
                edges={['top']}
            >
                <View className="flex-1 items-center justify-center">
                    <Text style={{ color: colors.text.secondary }}>Yükleniyor...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: colors.background.secondary }}
            edges={['top']}
        >
            {/* Header */}
            <Animated.View
                entering={FadeIn.duration(400)}
                className="flex-row items-center px-4 py-4"
                style={{
                    backgroundColor: colors.surface.primary,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.primary,
                }}
            >
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: colors.background.tertiary }}
                >
                    <ChevronLeft size={20} color={colors.text.primary} />
                </Pressable>
                <View className="flex-1">
                    <Text style={{ color: colors.text.primary }} className="text-xl font-bold">
                        Abonelik & Faturalama
                    </Text>
                    <Text style={{ color: colors.text.secondary }} className="text-sm">
                        Plan ve ödeme yönetimi
                    </Text>
                </View>
            </Animated.View>

            <ScrollView
                contentContainerStyle={{ padding: 24, paddingBottom: tabBarHeight + 24 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {renderTrialBanner()}
                {renderCurrentSubscription()}
                {renderPlans()}

                {/* FAQ or Help Section */}
                <Animated.View entering={FadeInDown.duration(500).delay(400)}>
                    <View
                        className="rounded-xl p-4 mt-2"
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderWidth: 1,
                            borderColor: colors.border.primary,
                        }}
                    >
                        <Text style={{ color: colors.text.primary }} className="font-semibold mb-2">
                            Yardıma mı ihtiyacınız var?
                        </Text>
                        <Text style={{ color: colors.text.secondary }} className="text-sm mb-3">
                            Abonelik ve faturalama ile ilgili sorularınız için destek ekibimize
                            ulaşabilirsiniz.
                        </Text>
                        <Pressable
                            onPress={() => Linking.openURL('mailto:destek@stoocker.app')}
                            className="flex-row items-center"
                        >
                            <Text style={{ color: colors.brand.primary }} className="font-medium">
                                destek@stoocker.app
                            </Text>
                            <ExternalLink
                                size={14}
                                color={colors.brand.primary}
                                style={{ marginLeft: 4 }}
                            />
                        </Pressable>
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
