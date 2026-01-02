import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import {
    ArrowLeft,
    Search,
    Plus,
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    Send,
    XCircle,
    ChevronRight,
    RefreshCw
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useInvoices } from '@/lib/api/hooks/useSales';
import type { Invoice, InvoiceStatus } from '@/lib/api/types/sales.types';

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bgColor: string; icon: any }> = {
    draft: { label: 'Taslak', color: '#64748b', bgColor: '#f1f5f9', icon: Clock },
    sent: { label: 'Gönderildi', color: '#3b82f6', bgColor: '#dbeafe', icon: Send },
    paid: { label: 'Ödendi', color: '#22c55e', bgColor: '#dcfce7', icon: CheckCircle },
    partial: { label: 'Kısmi Ödeme', color: '#f59e0b', bgColor: '#fef3c7', icon: Clock },
    overdue: { label: 'Vadesi Geçti', color: '#ef4444', bgColor: '#fee2e2', icon: AlertCircle },
    cancelled: { label: 'İptal', color: '#64748b', bgColor: '#f1f5f9', icon: XCircle }
};

export default function InvoicesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | 'all'>('all');

    // Fetch invoices from API
    const {
        data: invoicesResponse,
        isLoading,
        isError,
        refetch,
        isRefetching
    } = useInvoices({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        pageSize: 50
    });

    const invoices = invoicesResponse?.items || [];

    const statusFilters: { key: InvoiceStatus | 'all'; label: string }[] = [
        { key: 'all', label: 'Tümü' },
        { key: 'sent', label: 'Gönderildi' },
        { key: 'paid', label: 'Ödendi' },
        { key: 'partial', label: 'Kısmi' },
        { key: 'overdue', label: 'Vadesi Geçti' }
    ];

    const filteredInvoices = useMemo(() => {
        if (!searchQuery) return invoices;
        return invoices.filter(invoice => {
            const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [invoices, searchQuery]);

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
            month: 'short'
        });
    };

    const getDaysUntilDue = (dueDate: string) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const InvoiceCard = ({ item, index }: { item: Invoice; index: number }) => {
        const statusConfig = STATUS_CONFIG[item.status];
        const StatusIcon = statusConfig.icon;
        const daysUntilDue = getDaysUntilDue(item.dueDate);
        const remainingAmount = item.totalAmount - item.paidAmount;

        return (
            <Animated.View entering={FadeInRight.duration(300).delay(index * 50)}>
                <Pressable
                    onPress={() => router.push(`/(dashboard)/sales/invoice/${item.id}` as any)}
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: item.status === 'overdue' ? colors.semantic.error + '50' : colors.border.primary
                    }}
                >
                    <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-row items-center">
                            <View
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    backgroundColor: item.status === 'overdue' ? colors.semantic.errorLight : colors.semantic.successLight,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12
                                }}
                            >
                                <FileText size={22} color={item.status === 'overdue' ? colors.semantic.error : colors.semantic.success} />
                            </View>
                            <View>
                                <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '600' }}>
                                    {item.invoiceNumber}
                                </Text>
                                <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                    {item.customerName}
                                </Text>
                            </View>
                        </View>
                        <View
                            style={{
                                backgroundColor: statusConfig.bgColor,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 8,
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            <StatusIcon size={12} color={statusConfig.color} />
                            <Text style={{ color: statusConfig.color, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                                {statusConfig.label}
                            </Text>
                        </View>
                    </View>

                    {/* Progress bar for partial payments */}
                    {item.status === 'partial' && (
                        <View style={{ marginBottom: 12 }}>
                            <View className="flex-row justify-between mb-1">
                                <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>
                                    Ödenen: {formatCurrency(item.paidAmount)}
                                </Text>
                                <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>
                                    Kalan: {formatCurrency(remainingAmount)}
                                </Text>
                            </View>
                            <View
                                style={{
                                    height: 4,
                                    backgroundColor: colors.background.tertiary,
                                    borderRadius: 2
                                }}
                            >
                                <View
                                    style={{
                                        width: `${(item.paidAmount / item.totalAmount) * 100}%`,
                                        height: '100%',
                                        backgroundColor: colors.semantic.success,
                                        borderRadius: 2
                                    }}
                                />
                            </View>
                        </View>
                    )}

                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                Vade: {formatDate(item.dueDate)}
                            </Text>
                            {item.status !== 'paid' && item.status !== 'cancelled' && (
                                <Text style={{
                                    color: daysUntilDue < 0 ? colors.semantic.error :
                                        daysUntilDue <= 7 ? colors.semantic.warning : colors.text.tertiary,
                                    fontSize: 11,
                                    marginTop: 2
                                }}>
                                    {daysUntilDue < 0
                                        ? `${Math.abs(daysUntilDue)} gün gecikmiş`
                                        : daysUntilDue === 0
                                            ? 'Bugün'
                                            : `${daysUntilDue} gün kaldı`}
                                </Text>
                            )}
                        </View>
                        <View className="flex-row items-center">
                            <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '700' }}>
                                {formatCurrency(item.totalAmount)}
                            </Text>
                            <ChevronRight size={18} color={colors.text.tertiary} style={{ marginLeft: 4 }} />
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        );
    };

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
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                        <Pressable onPress={() => router.back()} className="mr-3 p-2 -ml-2">
                            <ArrowLeft size={24} color={colors.text.primary} />
                        </Pressable>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text.primary }} className="text-xl font-bold">Faturalar</Text>
                            <Text style={{ color: colors.text.secondary }} className="text-sm">
                                {filteredInvoices.length} fatura
                            </Text>
                        </View>
                    </View>
                    <Pressable
                        onPress={() => router.push('/(dashboard)/sales/invoice/new' as any)}
                        style={{
                            backgroundColor: colors.brand.primary,
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Plus size={22} color={colors.text.inverse} />
                    </Pressable>
                </View>

                {/* Search */}
                <View
                    style={{
                        backgroundColor: colors.background.tertiary,
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 12
                    }}
                >
                    <Search size={20} color={colors.text.tertiary} />
                    <Pressable style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8 }}>
                        <Text style={{ color: colors.text.tertiary, fontSize: 15 }}>
                            Fatura ara...
                        </Text>
                    </Pressable>
                </View>
            </Animated.View>

            {/* Status Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="py-3 px-4"
                style={{ maxHeight: 52, backgroundColor: colors.surface.primary }}
            >
                {statusFilters.map((filter) => (
                    <Pressable
                        key={filter.key}
                        onPress={() => setSelectedStatus(filter.key)}
                        style={{
                            backgroundColor: selectedStatus === filter.key
                                ? colors.brand.primary
                                : colors.background.tertiary,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 20,
                            marginRight: 8
                        }}
                    >
                        <Text
                            style={{
                                color: selectedStatus === filter.key
                                    ? colors.text.inverse
                                    : colors.text.secondary,
                                fontSize: 13,
                                fontWeight: '500'
                            }}
                        >
                            {filter.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Invoices List */}
            <ScrollView
                className="flex-1 px-4"
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
                contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 20 }}
            >
                {isLoading ? (
                    <View className="items-center justify-center py-12">
                        <ActivityIndicator size="large" color={colors.brand.primary} />
                        <Text style={{ color: colors.text.secondary, fontSize: 14, marginTop: 12 }}>
                            Faturalar yükleniyor...
                        </Text>
                    </View>
                ) : isError ? (
                    <View className="items-center justify-center py-12">
                        <View
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 16,
                                backgroundColor: colors.semantic.errorLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16
                            }}
                        >
                            <RefreshCw size={28} color={colors.semantic.error} />
                        </View>
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                            Bağlantı hatası
                        </Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
                            Faturalar yüklenemedi
                        </Text>
                        <Pressable
                            onPress={() => refetch()}
                            style={{
                                backgroundColor: colors.brand.primary,
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                                borderRadius: 8
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '600' }}>Tekrar Dene</Text>
                        </Pressable>
                    </View>
                ) : filteredInvoices.length === 0 ? (
                    <View className="items-center justify-center py-12">
                        <View
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 16,
                                backgroundColor: colors.semantic.successLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16
                            }}
                        >
                            <FileText size={28} color={colors.semantic.success} />
                        </View>
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                            Fatura bulunamadı
                        </Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center' }}>
                            {searchQuery ? 'Arama kriterlerinize uygun fatura yok' : 'Henüz fatura eklenmemiş'}
                        </Text>
                    </View>
                ) : (
                    filteredInvoices.map((invoice, index) => (
                        <InvoiceCard key={invoice.id} item={invoice} index={index} />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
