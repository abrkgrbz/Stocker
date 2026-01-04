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
    Truck,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    MoreVertical,
    Receipt
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useToast } from '@/components/ui';
import { useOrder, useUpdateOrderStatus, useCancelOrder, useConvertOrderToInvoice } from '@/lib/api/hooks/useSales';
import type { OrderStatus } from '@/lib/api/types/sales.types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: any }> = {
    draft: { label: 'Taslak', color: '#64748b', bgColor: '#f1f5f9', icon: FileText },
    pending: { label: 'Beklemede', color: '#f59e0b', bgColor: '#fef3c7', icon: Clock },
    confirmed: { label: 'Onaylandı', color: '#3b82f6', bgColor: '#dbeafe', icon: CheckCircle },
    processing: { label: 'İşleniyor', color: '#8b5cf6', bgColor: '#ede9fe', icon: Package },
    shipped: { label: 'Kargoda', color: '#06b6d4', bgColor: '#cffafe', icon: Truck },
    delivered: { label: 'Teslim Edildi', color: '#22c55e', bgColor: '#dcfce7', icon: CheckCircle },
    cancelled: { label: 'İptal', color: '#ef4444', bgColor: '#fee2e2', icon: XCircle },
};

export default function OrderDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const toast = useToast();

    const {
        data: order,
        isLoading,
        isError,
        refetch,
        isRefetching
    } = useOrder(id || '');

    const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateOrderStatus();
    const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();
    const { mutate: convertToInvoice, isPending: isConverting } = useConvertOrderToInvoice();

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

    const handleStatusChange = (newStatus: OrderStatus) => {
        Alert.alert(
            'Durumu Değiştir',
            `Sipariş durumunu "${STATUS_CONFIG[newStatus].label}" olarak değiştirmek istiyor musunuz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Değiştir',
                    onPress: () => {
                        updateStatus(
                            { id: id || '', status: newStatus },
                            {
                                onSuccess: () => {
                                    toast.success('Başarılı', 'Sipariş durumu güncellendi');
                                    refetch();
                                },
                                onError: () => {
                                    toast.error('Hata', 'Durum güncellenirken bir hata oluştu');
                                }
                            }
                        );
                    }
                }
            ]
        );
    };

    const handleCancel = () => {
        Alert.alert(
            'Siparişi İptal Et',
            'Bu siparişi iptal etmek istediğinizden emin misiniz?',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'İptal Et',
                    style: 'destructive',
                    onPress: () => {
                        cancelOrder(
                            { id: id || '' },
                            {
                                onSuccess: () => {
                                    toast.success('Başarılı', 'Sipariş iptal edildi');
                                    refetch();
                                },
                                onError: () => {
                                    toast.error('Hata', 'Sipariş iptal edilirken bir hata oluştu');
                                }
                            }
                        );
                    }
                }
            ]
        );
    };

    const handleConvertToInvoice = () => {
        Alert.alert(
            'Faturaya Dönüştür',
            'Bu siparişi faturaya dönüştürmek istiyor musunuz? Sipariş bilgileri faturaya aktarılacak.',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Dönüştür',
                    onPress: () => {
                        convertToInvoice(id || '', {
                            onSuccess: (invoice) => {
                                toast.success('Başarılı', 'Sipariş faturaya dönüştürüldü');
                                // Navigate to the new invoice
                                router.replace(`/(dashboard)/sales/invoice/${invoice.id}` as any);
                            },
                            onError: () => {
                                toast.error('Hata', 'Faturaya dönüştürülürken bir hata oluştu');
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
                        Sipariş yükleniyor...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isError || !order) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <AlertCircle size={48} color={colors.semantic.error} />
                    <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '600', marginTop: 16 }}>
                        Sipariş bulunamadı
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

    const statusConfig = STATUS_CONFIG[order.status];
    const StatusIcon = statusConfig.icon;

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
                                {order.orderNumber}
                            </Text>
                            <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                Sipariş Detayı
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center">
                        <Pressable
                            onPress={() => router.push(`/(dashboard)/sales/edit-order/${id}` as any)}
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
                                        {formatDate(order.orderDate)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={{ color: colors.brand.primary, fontSize: 24, fontWeight: '700' }}>
                                {formatCurrency(order.totalAmount)}
                            </Text>
                        </View>

                        {/* Quick Actions */}
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <View className="flex-row pt-4" style={{ borderTopWidth: 1, borderTopColor: colors.border.primary }}>
                                {order.status === 'pending' && (
                                    <Pressable
                                        onPress={() => handleStatusChange('confirmed')}
                                        style={{
                                            flex: 1,
                                            backgroundColor: colors.semantic.success,
                                            paddingVertical: 10,
                                            borderRadius: 8,
                                            alignItems: 'center',
                                            marginRight: 8
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: '600' }}>Onayla</Text>
                                    </Pressable>
                                )}
                                {order.status === 'confirmed' && (
                                    <Pressable
                                        onPress={() => handleStatusChange('processing')}
                                        style={{
                                            flex: 1,
                                            backgroundColor: colors.brand.primary,
                                            paddingVertical: 10,
                                            borderRadius: 8,
                                            alignItems: 'center',
                                            marginRight: 8
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: '600' }}>İşleme Al</Text>
                                    </Pressable>
                                )}
                                {order.status === 'processing' && (
                                    <Pressable
                                        onPress={() => handleStatusChange('shipped')}
                                        style={{
                                            flex: 1,
                                            backgroundColor: colors.semantic.info,
                                            paddingVertical: 10,
                                            borderRadius: 8,
                                            alignItems: 'center',
                                            marginRight: 8
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: '600' }}>Kargoya Ver</Text>
                                    </Pressable>
                                )}
                                {order.status === 'shipped' && (
                                    <Pressable
                                        onPress={() => handleStatusChange('delivered')}
                                        style={{
                                            flex: 1,
                                            backgroundColor: colors.semantic.success,
                                            paddingVertical: 10,
                                            borderRadius: 8,
                                            alignItems: 'center',
                                            marginRight: 8
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: '600' }}>Teslim Edildi</Text>
                                    </Pressable>
                                )}
                                <Pressable
                                    onPress={handleCancel}
                                    style={{
                                        flex: 1,
                                        backgroundColor: colors.semantic.errorLight,
                                        paddingVertical: 10,
                                        borderRadius: 8,
                                        alignItems: 'center'
                                    }}
                                >
                                    <Text style={{ color: colors.semantic.error, fontWeight: '600' }}>İptal Et</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* Customer Info */}
                <Animated.View entering={FadeInDown.duration(400).delay(150)}>
                    <Pressable
                        onPress={() => router.push(`/(dashboard)/crm/${order.customerId}` as any)}
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
                                {order.customerName}
                            </Text>
                        </View>
                        <ChevronRight size={20} color={colors.text.tertiary} />
                    </Pressable>
                </Animated.View>

                {/* Order Items */}
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
                            Ürünler ({order.items?.length || 0})
                        </Text>

                        {order.items?.map((item, index) => (
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
                                <Text style={{ color: colors.text.primary }}>{formatCurrency(order.subtotal)}</Text>
                            </View>
                            {order.discountAmount > 0 && (
                                <View className="flex-row justify-between mb-2">
                                    <Text style={{ color: colors.text.secondary }}>İndirim</Text>
                                    <Text style={{ color: colors.semantic.success }}>-{formatCurrency(order.discountAmount)}</Text>
                                </View>
                            )}
                            <View className="flex-row justify-between mb-2">
                                <Text style={{ color: colors.text.secondary }}>KDV</Text>
                                <Text style={{ color: colors.text.primary }}>{formatCurrency(order.taxAmount)}</Text>
                            </View>
                            <View className="flex-row justify-between pt-2" style={{ borderTopWidth: 1, borderTopColor: colors.border.primary }}>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>Toplam</Text>
                                <Text style={{ color: colors.brand.primary, fontSize: 18, fontWeight: '700' }}>{formatCurrency(order.totalAmount)}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Delivery & Notes */}
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
                        {order.deliveryDate && (
                            <View className="flex-row items-center mb-4">
                                <Truck size={20} color={colors.text.tertiary} />
                                <View style={{ marginLeft: 12 }}>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>Teslimat Tarihi</Text>
                                    <Text style={{ color: colors.text.primary, fontWeight: '500' }}>
                                        {formatDate(order.deliveryDate)}
                                    </Text>
                                </View>
                            </View>
                        )}
                        {order.notes && (
                            <View className="flex-row items-start">
                                <FileText size={20} color={colors.text.tertiary} />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>Notlar</Text>
                                    <Text style={{ color: colors.text.primary }}>
                                        {order.notes}
                                    </Text>
                                </View>
                            </View>
                        )}
                        {!order.deliveryDate && !order.notes && (
                            <Text style={{ color: colors.text.tertiary, textAlign: 'center' }}>
                                Ek bilgi bulunmuyor
                            </Text>
                        )}
                    </View>
                </Animated.View>

                {/* Convert to Invoice Button */}
                {(order.status === 'delivered' || order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped') && (
                    <Animated.View entering={FadeInDown.duration(400).delay(300)}>
                        <Pressable
                            onPress={handleConvertToInvoice}
                            disabled={isConverting}
                            style={{
                                backgroundColor: colors.modules.sales,
                                paddingVertical: 16,
                                borderRadius: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: isConverting ? 0.7 : 1,
                                shadowColor: colors.modules.sales,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 4
                            }}
                        >
                            {isConverting ? (
                                <>
                                    <ActivityIndicator color="#fff" />
                                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                                        Dönüştürülüyor...
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Receipt size={20} color="#fff" />
                                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                                        Faturaya Dönüştür
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
