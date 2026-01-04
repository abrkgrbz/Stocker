import React, { useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Alert,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    ArrowLeft,
    Edit,
    Package,
    User,
    Calendar,
    Clock,
    ChevronRight,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    Send,
    ShoppingCart
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useQuote, useSendQuote, useAcceptQuote, useRejectQuote, useConvertQuoteToOrder } from '@/lib/api/hooks/useSales';
import type { QuoteStatus } from '@/lib/api/types/sales.types';

const STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string; bgColor: string; icon: any }> = {
    draft: { label: 'Taslak', color: '#64748b', bgColor: '#f1f5f9', icon: FileText },
    sent: { label: 'Gönderildi', color: '#3b82f6', bgColor: '#dbeafe', icon: Send },
    accepted: { label: 'Kabul Edildi', color: '#22c55e', bgColor: '#dcfce7', icon: CheckCircle },
    rejected: { label: 'Reddedildi', color: '#ef4444', bgColor: '#fee2e2', icon: XCircle },
    expired: { label: 'Süresi Doldu', color: '#f59e0b', bgColor: '#fef3c7', icon: Clock },
};

export default function QuoteDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const {
        data: quote,
        isLoading,
        isError,
        refetch,
        isRefetching
    } = useQuote(id || '');

    const { mutate: sendQuote, isPending: isSending } = useSendQuote();
    const { mutate: acceptQuote, isPending: isAccepting } = useAcceptQuote();
    const { mutate: rejectQuote, isPending: isRejecting } = useRejectQuote();
    const { mutate: convertToOrder, isPending: isConverting } = useConvertQuoteToOrder();

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleSend = () => {
        Alert.alert(
            'Teklifi Gönder',
            'Teklifi müşteriye göndermek istiyor musunuz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Gönder',
                    onPress: () => {
                        sendQuote(
                            { id: id || '' },
                            {
                                onSuccess: () => {
                                    Alert.alert('Başarılı', 'Teklif gönderildi');
                                    refetch();
                                },
                                onError: () => {
                                    Alert.alert('Hata', 'Teklif gönderilirken bir hata oluştu');
                                }
                            }
                        );
                    }
                }
            ]
        );
    };

    const handleAccept = () => {
        Alert.alert(
            'Teklifi Kabul Et',
            'Teklifi kabul etmek istiyor musunuz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Kabul Et',
                    onPress: () => {
                        acceptQuote(id || '', {
                            onSuccess: () => {
                                Alert.alert('Başarılı', 'Teklif kabul edildi');
                                refetch();
                            },
                            onError: () => {
                                Alert.alert('Hata', 'Teklif kabul edilirken bir hata oluştu');
                            }
                        });
                    }
                }
            ]
        );
    };

    const handleReject = () => {
        Alert.alert(
            'Teklifi Reddet',
            'Teklifi reddetmek istiyor musunuz?',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Reddet',
                    style: 'destructive',
                    onPress: () => {
                        rejectQuote(
                            { id: id || '' },
                            {
                                onSuccess: () => {
                                    Alert.alert('Başarılı', 'Teklif reddedildi');
                                    refetch();
                                },
                                onError: () => {
                                    Alert.alert('Hata', 'Teklif reddedilirken bir hata oluştu');
                                }
                            }
                        );
                    }
                }
            ]
        );
    };

    const handleConvertToOrder = () => {
        Alert.alert(
            'Siparişe Dönüştür',
            'Bu teklifi siparişe dönüştürmek istiyor musunuz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Dönüştür',
                    onPress: () => {
                        convertToOrder(id || '', {
                            onSuccess: () => {
                                Alert.alert('Başarılı', 'Teklif siparişe dönüştürüldü');
                                router.back();
                            },
                            onError: () => {
                                Alert.alert('Hata', 'Siparişe dönüştürülürken bir hata oluştu');
                            }
                        });
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colors.brand.primary} />
                    <Text style={{ color: colors.text.secondary, marginTop: 12 }}>
                        Teklif yükleniyor...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isError || !quote) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <AlertCircle size={48} color={colors.semantic.error} />
                    <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '600', marginTop: 16 }}>
                        Teklif bulunamadı
                    </Text>
                    <Pressable
                        onPress={() => router.back()}
                        style={{
                            marginTop: 24,
                            backgroundColor: colors.brand.primary,
                            paddingHorizontal: 24,
                            paddingVertical: 12,
                            borderRadius: 8
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '600' }}>Geri Dön</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const statusConfig = STATUS_CONFIG[quote.status];
    const StatusIcon = statusConfig.icon;
    const isExpired = quote.status === 'expired' || new Date(quote.validUntil) < new Date();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            {/* Header */}
            <Animated.View
                entering={FadeIn.duration(400)}
                className="px-4 py-3"
                style={{
                    backgroundColor: colors.surface.primary,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.primary
                }}
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <Pressable onPress={() => router.back()} className="mr-3 p-2 -ml-2">
                            <ArrowLeft size={24} color={colors.text.primary} />
                        </Pressable>
                        <View>
                            <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>
                                {quote.quoteNumber}
                            </Text>
                            <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                Teklif Detayı
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center">
                        <Pressable
                            onPress={() => router.push(`/(dashboard)/sales/edit-quote/${id}` as any)}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                backgroundColor: colors.background.tertiary,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 8
                            }}
                        >
                            <Edit size={20} color={colors.text.primary} />
                        </Pressable>
                    </View>
                </View>
            </Animated.View>

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
                contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
            >
                {/* Status Card */}
                <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 16,
                            padding: 20,
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: colors.border.primary
                        }}
                    >
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <View
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 14,
                                        backgroundColor: statusConfig.bgColor,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 14
                                    }}
                                >
                                    <StatusIcon size={24} color={statusConfig.color} />
                                </View>
                                <View>
                                    <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>
                                        {statusConfig.label}
                                    </Text>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                        {formatDate(quote.quoteDate)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={{ color: colors.brand.primary, fontSize: 24, fontWeight: '700' }}>
                                {formatCurrency(quote.totalAmount)}
                            </Text>
                        </View>

                        {/* Valid Until */}
                        <View
                            className="flex-row items-center justify-between py-3"
                            style={{ borderTopWidth: 1, borderTopColor: colors.border.primary }}
                        >
                            <View className="flex-row items-center">
                                <Calendar size={18} color={isExpired ? colors.semantic.error : colors.text.tertiary} />
                                <Text style={{ color: colors.text.secondary, marginLeft: 8 }}>
                                    Geçerlilik Tarihi
                                </Text>
                            </View>
                            <Text style={{
                                color: isExpired ? colors.semantic.error : colors.text.primary,
                                fontWeight: '600'
                            }}>
                                {formatDate(quote.validUntil)}
                                {isExpired && ' (Süresi Doldu)'}
                            </Text>
                        </View>

                        {/* Quick Actions */}
                        {quote.status !== 'rejected' && quote.status !== 'expired' && (
                            <View className="flex-row pt-4" style={{ borderTopWidth: 1, borderTopColor: colors.border.primary }}>
                                {quote.status === 'draft' && (
                                    <Pressable
                                        onPress={handleSend}
                                        disabled={isSending}
                                        style={{
                                            flex: 1,
                                            backgroundColor: colors.semantic.info,
                                            paddingVertical: 10,
                                            borderRadius: 8,
                                            alignItems: 'center',
                                            marginRight: 8,
                                            opacity: isSending ? 0.7 : 1
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: '600' }}>Gönder</Text>
                                    </Pressable>
                                )}
                                {quote.status === 'sent' && !isExpired && (
                                    <>
                                        <Pressable
                                            onPress={handleAccept}
                                            disabled={isAccepting}
                                            style={{
                                                flex: 1,
                                                backgroundColor: colors.semantic.success,
                                                paddingVertical: 10,
                                                borderRadius: 8,
                                                alignItems: 'center',
                                                marginRight: 8,
                                                opacity: isAccepting ? 0.7 : 1
                                            }}
                                        >
                                            <Text style={{ color: '#fff', fontWeight: '600' }}>Kabul Et</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={handleReject}
                                            disabled={isRejecting}
                                            style={{
                                                flex: 1,
                                                backgroundColor: colors.semantic.errorLight,
                                                paddingVertical: 10,
                                                borderRadius: 8,
                                                alignItems: 'center',
                                                opacity: isRejecting ? 0.7 : 1
                                            }}
                                        >
                                            <Text style={{ color: colors.semantic.error, fontWeight: '600' }}>Reddet</Text>
                                        </Pressable>
                                    </>
                                )}
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* Customer Info */}
                <Animated.View entering={FadeInDown.duration(400).delay(150)}>
                    <Pressable
                        onPress={() => router.push(`/(dashboard)/crm/${quote.customerId}` as any)}
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: colors.border.primary,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}
                    >
                        <View
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 14,
                                backgroundColor: colors.modules.crmLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 14
                            }}
                        >
                            <User size={24} color={colors.modules.crm} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>Müşteri</Text>
                            <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                {quote.customerName}
                            </Text>
                        </View>
                        <ChevronRight size={20} color={colors.text.tertiary} />
                    </Pressable>
                </Animated.View>

                {/* Quote Items */}
                <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: colors.border.primary
                        }}
                    >
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}>
                            Ürünler ({quote.items?.length || 0})
                        </Text>

                        {quote.items?.map((item, index) => (
                            <View
                                key={item.id || index}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 12,
                                    borderTopWidth: index > 0 ? 1 : 0,
                                    borderTopColor: colors.border.primary
                                }}
                            >
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: colors.modules.inventoryLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}
                                >
                                    <Package size={20} color={colors.modules.inventory} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.text.primary, fontWeight: '500' }}>
                                        {item.productName}
                                    </Text>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                        {item.quantity} x {formatCurrency(item.unitPrice)}
                                    </Text>
                                </View>
                                <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
                                    {formatCurrency(item.totalPrice)}
                                </Text>
                            </View>
                        ))}

                        {/* Totals */}
                        <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border.primary }}>
                            <View className="flex-row justify-between mb-2">
                                <Text style={{ color: colors.text.secondary }}>Ara Toplam</Text>
                                <Text style={{ color: colors.text.primary }}>{formatCurrency(quote.subtotal)}</Text>
                            </View>
                            {quote.discountAmount > 0 && (
                                <View className="flex-row justify-between mb-2">
                                    <Text style={{ color: colors.text.secondary }}>İndirim</Text>
                                    <Text style={{ color: colors.semantic.success }}>-{formatCurrency(quote.discountAmount)}</Text>
                                </View>
                            )}
                            <View className="flex-row justify-between mb-2">
                                <Text style={{ color: colors.text.secondary }}>KDV</Text>
                                <Text style={{ color: colors.text.primary }}>{formatCurrency(quote.taxAmount)}</Text>
                            </View>
                            <View className="flex-row justify-between pt-2" style={{ borderTopWidth: 1, borderTopColor: colors.border.primary }}>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>Toplam</Text>
                                <Text style={{ color: colors.brand.primary, fontSize: 18, fontWeight: '700' }}>{formatCurrency(quote.totalAmount)}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Notes */}
                {quote.notes && (
                    <Animated.View entering={FadeInDown.duration(400).delay(250)}>
                        <View
                            style={{
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: colors.border.primary
                            }}
                        >
                            <View className="flex-row items-start">
                                <FileText size={20} color={colors.text.tertiary} />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>Notlar</Text>
                                    <Text style={{ color: colors.text.primary, marginTop: 4 }}>
                                        {quote.notes}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                )}

                {/* Convert to Order Button */}
                {quote.status === 'accepted' && (
                    <Animated.View entering={FadeInDown.duration(400).delay(300)}>
                        <Pressable
                            onPress={handleConvertToOrder}
                            disabled={isConverting}
                            style={{
                                backgroundColor: colors.modules.sales,
                                paddingVertical: 16,
                                borderRadius: 12,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                opacity: isConverting ? 0.7 : 1
                            }}
                        >
                            {isConverting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <ShoppingCart size={20} color="#fff" />
                                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                                        Siparişe Dönüştür
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
