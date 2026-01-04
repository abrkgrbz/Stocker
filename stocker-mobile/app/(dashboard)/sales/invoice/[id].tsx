import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Alert,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    Modal
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    ArrowLeft,
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
    CreditCard,
    DollarSign,
    X
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useInvoice, useSendInvoice, useMarkInvoiceAsPaid, useCancelInvoice, useCreatePayment } from '@/lib/api/hooks/useSales';
import type { InvoiceStatus, PaymentMethod } from '@/lib/api/types/sales.types';

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bgColor: string; icon: any }> = {
    draft: { label: 'Taslak', color: '#64748b', bgColor: '#f1f5f9', icon: FileText },
    sent: { label: 'Gönderildi', color: '#3b82f6', bgColor: '#dbeafe', icon: Send },
    paid: { label: 'Ödendi', color: '#22c55e', bgColor: '#dcfce7', icon: CheckCircle },
    partial: { label: 'Kısmi Ödeme', color: '#f59e0b', bgColor: '#fef3c7', icon: DollarSign },
    overdue: { label: 'Gecikmiş', color: '#ef4444', bgColor: '#fee2e2', icon: AlertCircle },
    cancelled: { label: 'İptal', color: '#64748b', bgColor: '#f1f5f9', icon: XCircle },
};

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
    { value: 'cash', label: 'Nakit' },
    { value: 'credit_card', label: 'Kredi Kartı' },
    { value: 'bank_transfer', label: 'Banka Transferi' },
    { value: 'check', label: 'Çek' },
    { value: 'other', label: 'Diğer' },
];

export default function InvoiceDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

    const {
        data: invoice,
        isLoading,
        isError,
        refetch,
        isRefetching
    } = useInvoice(id || '');

    const { mutate: sendInvoice, isPending: isSending } = useSendInvoice();
    const { mutate: markAsPaid, isPending: isMarkingPaid } = useMarkInvoiceAsPaid();
    const { mutate: cancelInvoice, isPending: isCancelling } = useCancelInvoice();
    const { mutate: createPayment, isPending: isCreatingPayment } = useCreatePayment();

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
            'Faturayı Gönder',
            'Faturayı müşteriye göndermek istiyor musunuz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Gönder',
                    onPress: () => {
                        sendInvoice(
                            { id: id || '' },
                            {
                                onSuccess: () => {
                                    Alert.alert('Başarılı', 'Fatura gönderildi');
                                    refetch();
                                },
                                onError: () => {
                                    Alert.alert('Hata', 'Fatura gönderilirken bir hata oluştu');
                                }
                            }
                        );
                    }
                }
            ]
        );
    };

    const handleMarkAsPaid = () => {
        Alert.alert(
            'Ödendi Olarak İşaretle',
            'Faturayı tamamen ödenmiş olarak işaretlemek istiyor musunuz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'İşaretle',
                    onPress: () => {
                        markAsPaid(id || '', {
                            onSuccess: () => {
                                Alert.alert('Başarılı', 'Fatura ödendi olarak işaretlendi');
                                refetch();
                            },
                            onError: () => {
                                Alert.alert('Hata', 'İşlem sırasında bir hata oluştu');
                            }
                        });
                    }
                }
            ]
        );
    };

    const handleCancel = () => {
        Alert.alert(
            'Faturayı İptal Et',
            'Bu faturayı iptal etmek istediğinizden emin misiniz?',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'İptal Et',
                    style: 'destructive',
                    onPress: () => {
                        cancelInvoice(
                            { id: id || '' },
                            {
                                onSuccess: () => {
                                    Alert.alert('Başarılı', 'Fatura iptal edildi');
                                    refetch();
                                },
                                onError: () => {
                                    Alert.alert('Hata', 'Fatura iptal edilirken bir hata oluştu');
                                }
                            }
                        );
                    }
                }
            ]
        );
    };

    const handleAddPayment = () => {
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Hata', 'Geçerli bir tutar girin');
            return;
        }

        createPayment(
            {
                invoiceId: id || '',
                amount,
                paymentDate: new Date().toISOString().split('T')[0],
                paymentMethod,
            },
            {
                onSuccess: () => {
                    Alert.alert('Başarılı', 'Ödeme kaydedildi');
                    setShowPaymentModal(false);
                    setPaymentAmount('');
                    refetch();
                },
                onError: () => {
                    Alert.alert('Hata', 'Ödeme kaydedilirken bir hata oluştu');
                }
            }
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colors.brand.primary} />
                    <Text style={{ color: colors.text.secondary, marginTop: 12 }}>
                        Fatura yükleniyor...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isError || !invoice) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <AlertCircle size={48} color={colors.semantic.error} />
                    <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '600', marginTop: 16 }}>
                        Fatura bulunamadı
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

    const statusConfig = STATUS_CONFIG[invoice.status];
    const StatusIcon = statusConfig.icon;
    const remainingAmount = invoice.totalAmount - invoice.paidAmount;
    const isOverdue = invoice.status === 'overdue' || (invoice.status !== 'paid' && invoice.status !== 'cancelled' && new Date(invoice.dueDate) < new Date());

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
                                {invoice.invoiceNumber}
                            </Text>
                            <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                Fatura Detayı
                            </Text>
                        </View>
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
                                        {formatDate(invoice.invoiceDate)}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ color: colors.brand.primary, fontSize: 24, fontWeight: '700' }}>
                                    {formatCurrency(invoice.totalAmount)}
                                </Text>
                                {invoice.paidAmount > 0 && invoice.status !== 'paid' && (
                                    <Text style={{ color: colors.semantic.success, fontSize: 12 }}>
                                        Ödenen: {formatCurrency(invoice.paidAmount)}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Due Date */}
                        <View
                            className="flex-row items-center justify-between py-3"
                            style={{ borderTopWidth: 1, borderTopColor: colors.border.primary }}
                        >
                            <View className="flex-row items-center">
                                <Calendar size={18} color={isOverdue ? colors.semantic.error : colors.text.tertiary} />
                                <Text style={{ color: colors.text.secondary, marginLeft: 8 }}>
                                    Vade Tarihi
                                </Text>
                            </View>
                            <Text style={{
                                color: isOverdue ? colors.semantic.error : colors.text.primary,
                                fontWeight: '600'
                            }}>
                                {formatDate(invoice.dueDate)}
                                {isOverdue && ' (Gecikmiş)'}
                            </Text>
                        </View>

                        {/* Remaining Amount */}
                        {remainingAmount > 0 && invoice.status !== 'cancelled' && (
                            <View
                                className="flex-row items-center justify-between py-3"
                                style={{ borderTopWidth: 1, borderTopColor: colors.border.primary }}
                            >
                                <View className="flex-row items-center">
                                    <DollarSign size={18} color={colors.semantic.warning} />
                                    <Text style={{ color: colors.text.secondary, marginLeft: 8 }}>
                                        Kalan Tutar
                                    </Text>
                                </View>
                                <Text style={{ color: colors.semantic.warning, fontWeight: '700', fontSize: 16 }}>
                                    {formatCurrency(remainingAmount)}
                                </Text>
                            </View>
                        )}

                        {/* Quick Actions */}
                        {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                            <View className="flex-row pt-4" style={{ borderTopWidth: 1, borderTopColor: colors.border.primary }}>
                                {invoice.status === 'draft' && (
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
                                {(invoice.status === 'sent' || invoice.status === 'partial' || invoice.status === 'overdue') && (
                                    <>
                                        <Pressable
                                            onPress={() => setShowPaymentModal(true)}
                                            style={{
                                                flex: 1,
                                                backgroundColor: colors.semantic.success,
                                                paddingVertical: 10,
                                                borderRadius: 8,
                                                alignItems: 'center',
                                                marginRight: 8
                                            }}
                                        >
                                            <Text style={{ color: '#fff', fontWeight: '600' }}>Ödeme Ekle</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={handleMarkAsPaid}
                                            disabled={isMarkingPaid}
                                            style={{
                                                flex: 1,
                                                backgroundColor: colors.brand.primary,
                                                paddingVertical: 10,
                                                borderRadius: 8,
                                                alignItems: 'center',
                                                marginRight: 8,
                                                opacity: isMarkingPaid ? 0.7 : 1
                                            }}
                                        >
                                            <Text style={{ color: '#fff', fontWeight: '600' }}>Tamamla</Text>
                                        </Pressable>
                                    </>
                                )}
                                <Pressable
                                    onPress={handleCancel}
                                    disabled={isCancelling}
                                    style={{
                                        flex: 1,
                                        backgroundColor: colors.semantic.errorLight,
                                        paddingVertical: 10,
                                        borderRadius: 8,
                                        alignItems: 'center',
                                        opacity: isCancelling ? 0.7 : 1
                                    }}
                                >
                                    <Text style={{ color: colors.semantic.error, fontWeight: '600' }}>İptal</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* Customer Info */}
                <Animated.View entering={FadeInDown.duration(400).delay(150)}>
                    <Pressable
                        onPress={() => router.push(`/(dashboard)/crm/${invoice.customerId}` as any)}
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
                                {invoice.customerName}
                            </Text>
                        </View>
                        <ChevronRight size={20} color={colors.text.tertiary} />
                    </Pressable>
                </Animated.View>

                {/* Invoice Items */}
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
                            Kalemler ({invoice.items?.length || 0})
                        </Text>

                        {invoice.items?.map((item, index) => (
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
                                <Text style={{ color: colors.text.primary }}>{formatCurrency(invoice.subtotal)}</Text>
                            </View>
                            {invoice.discountAmount > 0 && (
                                <View className="flex-row justify-between mb-2">
                                    <Text style={{ color: colors.text.secondary }}>İndirim</Text>
                                    <Text style={{ color: colors.semantic.success }}>-{formatCurrency(invoice.discountAmount)}</Text>
                                </View>
                            )}
                            <View className="flex-row justify-between mb-2">
                                <Text style={{ color: colors.text.secondary }}>KDV</Text>
                                <Text style={{ color: colors.text.primary }}>{formatCurrency(invoice.taxAmount)}</Text>
                            </View>
                            <View className="flex-row justify-between pt-2" style={{ borderTopWidth: 1, borderTopColor: colors.border.primary }}>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>Toplam</Text>
                                <Text style={{ color: colors.brand.primary, fontSize: 18, fontWeight: '700' }}>{formatCurrency(invoice.totalAmount)}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Notes */}
                {invoice.notes && (
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
                                        {invoice.notes}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                )}
            </ScrollView>

            {/* Payment Modal */}
            <Modal
                visible={showPaymentModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowPaymentModal(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            padding: 24,
                            paddingBottom: insets.bottom + 24
                        }}
                    >
                        <View className="flex-row items-center justify-between mb-6">
                            <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700' }}>
                                Ödeme Ekle
                            </Text>
                            <Pressable onPress={() => setShowPaymentModal(false)}>
                                <X size={24} color={colors.text.tertiary} />
                            </Pressable>
                        </View>

                        <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 8 }}>
                            Kalan Tutar: {formatCurrency(remainingAmount)}
                        </Text>

                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                                Ödeme Tutarı *
                            </Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: colors.background.tertiary,
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                }}
                            >
                                <DollarSign size={20} color={colors.text.tertiary} />
                                <TextInput
                                    value={paymentAmount}
                                    onChangeText={setPaymentAmount}
                                    placeholder="0.00"
                                    placeholderTextColor={colors.text.tertiary}
                                    keyboardType="numeric"
                                    style={{
                                        flex: 1,
                                        paddingVertical: 14,
                                        paddingHorizontal: 12,
                                        color: colors.text.primary,
                                        fontSize: 18,
                                        fontWeight: '600'
                                    }}
                                />
                                <Text style={{ color: colors.text.tertiary }}>TRY</Text>
                            </View>
                        </View>

                        <View style={{ marginBottom: 24 }}>
                            <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 8 }}>
                                Ödeme Yöntemi
                            </Text>
                            <View className="flex-row flex-wrap">
                                {PAYMENT_METHODS.map((method) => (
                                    <Pressable
                                        key={method.value}
                                        onPress={() => setPaymentMethod(method.value)}
                                        style={{
                                            backgroundColor: paymentMethod === method.value
                                                ? colors.brand.primary
                                                : colors.background.tertiary,
                                            paddingHorizontal: 16,
                                            paddingVertical: 10,
                                            borderRadius: 8,
                                            marginRight: 8,
                                            marginBottom: 8
                                        }}
                                    >
                                        <Text style={{
                                            color: paymentMethod === method.value
                                                ? '#fff'
                                                : colors.text.primary,
                                            fontWeight: '500'
                                        }}>
                                            {method.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <Pressable
                            onPress={handleAddPayment}
                            disabled={isCreatingPayment}
                            style={{
                                backgroundColor: colors.semantic.success,
                                paddingVertical: 16,
                                borderRadius: 12,
                                alignItems: 'center',
                                opacity: isCreatingPayment ? 0.7 : 1
                            }}
                        >
                            {isCreatingPayment ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                                    Ödeme Kaydet
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
