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
    Receipt,
    Clock,
    CheckCircle,
    XCircle,
    Send,
    AlertTriangle,
    ChevronRight,
    RefreshCw
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useQuotes } from '@/lib/api/hooks/useSales';
import type { Quote, QuoteStatus } from '@/lib/api/types/sales.types';

const STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string; bgColor: string; icon: any }> = {
    draft: { label: 'Taslak', color: '#64748b', bgColor: '#f1f5f9', icon: Clock },
    sent: { label: 'Gönderildi', color: '#3b82f6', bgColor: '#dbeafe', icon: Send },
    accepted: { label: 'Kabul Edildi', color: '#22c55e', bgColor: '#dcfce7', icon: CheckCircle },
    rejected: { label: 'Reddedildi', color: '#ef4444', bgColor: '#fee2e2', icon: XCircle },
    expired: { label: 'Süresi Doldu', color: '#f59e0b', bgColor: '#fef3c7', icon: AlertTriangle }
};

export default function QuotesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<QuoteStatus | 'all'>('all');

    // Fetch quotes from API
    const {
        data: quotesResponse,
        isLoading,
        isError,
        refetch,
        isRefetching
    } = useQuotes({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        pageSize: 50
    });

    const quotes = quotesResponse?.items || [];

    const statusFilters: { key: QuoteStatus | 'all'; label: string }[] = [
        { key: 'all', label: 'Tümü' },
        { key: 'draft', label: 'Taslak' },
        { key: 'sent', label: 'Gönderildi' },
        { key: 'accepted', label: 'Kabul' },
        { key: 'rejected', label: 'Red' }
    ];

    const filteredQuotes = useMemo(() => {
        if (!searchQuery) return quotes;
        return quotes.filter(quote => {
            const matchesSearch = quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                quote.customerName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [quotes, searchQuery]);

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

    const getDaysUntilExpiry = (validUntil: string) => {
        const today = new Date();
        const expiry = new Date(validUntil);
        const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const QuoteCard = ({ item, index }: { item: Quote; index: number }) => {
        const statusConfig = STATUS_CONFIG[item.status];
        const StatusIcon = statusConfig.icon;
        const daysUntilExpiry = getDaysUntilExpiry(item.validUntil);

        return (
            <Animated.View entering={FadeInRight.duration(300).delay(index * 50)}>
                <Pressable
                    onPress={() => router.push(`/(dashboard)/sales/quote/${item.id}` as any)}
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: colors.border.primary
                    }}
                >
                    <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-row items-center">
                            <View
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    backgroundColor: colors.semantic.infoLight,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12
                                }}
                            >
                                <Receipt size={22} color={colors.semantic.info} />
                            </View>
                            <View>
                                <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '600' }}>
                                    {item.quoteNumber}
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

                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                Geçerlilik: {formatDate(item.validUntil)}
                            </Text>
                            {item.status === 'sent' && (
                                <Text style={{
                                    color: daysUntilExpiry <= 3 ? colors.semantic.warning :
                                        daysUntilExpiry <= 7 ? colors.semantic.info : colors.text.tertiary,
                                    fontSize: 11,
                                    marginTop: 2
                                }}>
                                    {daysUntilExpiry <= 0
                                        ? 'Süre doldu'
                                        : `${daysUntilExpiry} gün kaldı`}
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
                            <Text style={{ color: colors.text.primary }} className="text-xl font-bold">Teklifler</Text>
                            <Text style={{ color: colors.text.secondary }} className="text-sm">
                                {filteredQuotes.length} teklif
                            </Text>
                        </View>
                    </View>
                    <Pressable
                        onPress={() => router.push('/(dashboard)/sales/quote/new' as any)}
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
                            Teklif ara...
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

            {/* Quotes List */}
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
                            Teklifler yükleniyor...
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
                            Teklifler yüklenemedi
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
                ) : filteredQuotes.length === 0 ? (
                    <View className="items-center justify-center py-12">
                        <View
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 16,
                                backgroundColor: colors.semantic.infoLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16
                            }}
                        >
                            <Receipt size={28} color={colors.semantic.info} />
                        </View>
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                            Teklif bulunamadı
                        </Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center' }}>
                            {searchQuery ? 'Arama kriterlerinize uygun teklif yok' : 'Henüz teklif eklenmemiş'}
                        </Text>
                    </View>
                ) : (
                    filteredQuotes.map((quote, index) => (
                        <QuoteCard key={quote.id} item={quote} index={index} />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
