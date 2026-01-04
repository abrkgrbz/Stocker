import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    RefreshControl,
    ActivityIndicator,
    TextInput
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInRight } from 'react-native-reanimated';
import {
    Search,
    Plus,
    Receipt,
    Clock,
    CheckCircle,
    XCircle,
    Send,
    AlertTriangle,
    ChevronRight,
    X,
    Calendar,
    DollarSign,
    Hash
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useQuotes } from '@/lib/api/hooks/useSales';
import {
    PageHeader,
    FilterChips,
    type FilterChip,
    EmptyState,
    ErrorState,
    SortSheet,
    SortButton,
    type SortOption,
    type SortValue
} from '@/components/ui';
import type { Quote, QuoteStatus } from '@/lib/api/types/sales.types';

const SORT_OPTIONS: SortOption[] = [
    { key: 'quoteDate', label: 'Teklif Tarihi', icon: <Calendar size={18} color="#64748b" /> },
    { key: 'validUntil', label: 'Geçerlilik Tarihi', icon: <Clock size={18} color="#64748b" /> },
    { key: 'totalAmount', label: 'Tutar', icon: <DollarSign size={18} color="#64748b" /> },
    { key: 'quoteNumber', label: 'Teklif No', icon: <Hash size={18} color="#64748b" /> },
];

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
    const [showSortSheet, setShowSortSheet] = useState(false);
    const [sortValue, setSortValue] = useState<SortValue | null>(null);

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

    // Filter chips configuration
    const statusFilters: FilterChip[] = [
        { key: 'all', label: 'Tümü' },
        { key: 'draft', label: 'Taslak' },
        { key: 'sent', label: 'Gönderildi' },
        { key: 'accepted', label: 'Kabul' },
        { key: 'rejected', label: 'Red' }
    ];

    const filteredQuotes = useMemo(() => {
        let result = quotes;

        // Search filter
        if (searchQuery) {
            result = result.filter(quote => {
                const matchesSearch = quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    quote.customerName.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesSearch;
            });
        }

        // Sorting
        if (sortValue) {
            result = [...result].sort((a, b) => {
                let comparison = 0;
                switch (sortValue.key) {
                    case 'quoteDate':
                        comparison = new Date(a.quoteDate).getTime() - new Date(b.quoteDate).getTime();
                        break;
                    case 'validUntil':
                        comparison = new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime();
                        break;
                    case 'totalAmount':
                        comparison = a.totalAmount - b.totalAmount;
                        break;
                    case 'quoteNumber':
                        comparison = a.quoteNumber.localeCompare(b.quoteNumber);
                        break;
                }
                return sortValue.order === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [quotes, searchQuery, sortValue]);

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
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    backgroundColor: colors.modules.salesLight,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12
                                }}
                            >
                                <Receipt size={22} color={colors.modules.sales} />
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

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
            <PageHeader
                title="Teklifler"
                subtitle={`${filteredQuotes.length} teklif`}
                primaryAction={{
                    icon: Plus,
                    onPress: () => router.push('/(dashboard)/sales/add-quote' as any),
                    backgroundColor: colors.modules.sales,
                }}
            />

            {/* Search */}
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingBottom: 12,
                    backgroundColor: colors.surface.primary,
                }}
            >
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
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Teklif ara..."
                        placeholderTextColor={colors.text.tertiary}
                        style={{
                            flex: 1,
                            paddingVertical: 12,
                            paddingHorizontal: 8,
                            color: colors.text.primary,
                            fontSize: 15
                        }}
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery('')}>
                            <X size={18} color={colors.text.tertiary} />
                        </Pressable>
                    )}
                </View>

                {/* Sort Button */}
                <View style={{ marginTop: 12 }}>
                    <SortButton
                        onPress={() => setShowSortSheet(true)}
                        value={sortValue}
                        options={SORT_OPTIONS}
                    />
                </View>
            </View>

            {/* Status Filters */}
            <FilterChips
                filters={statusFilters}
                selected={selectedStatus}
                onSelect={(key) => setSelectedStatus(key as QuoteStatus | 'all')}
                moduleColor={colors.modules.sales}
            />

            {/* Quotes List */}
            <ScrollView
                style={{ flex: 1, paddingHorizontal: 16 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={colors.modules.sales}
                    />
                }
                contentContainerStyle={{ paddingTop: 12, paddingBottom: 60 + insets.bottom + 24 }}
            >
                {isLoading ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
                        <ActivityIndicator size="large" color={colors.modules.sales} />
                        <Text style={{ color: colors.text.secondary, fontSize: 14, marginTop: 12 }}>
                            Teklifler yükleniyor...
                        </Text>
                    </View>
                ) : isError ? (
                    <ErrorState
                        title="Bağlantı hatası"
                        message="Teklifler yüklenemedi"
                        onRetry={refetch}
                    />
                ) : filteredQuotes.length === 0 ? (
                    <EmptyState
                        icon={<Receipt size={32} color={colors.modules.sales} />}
                        title="Teklif bulunamadı"
                        description={searchQuery ? 'Arama kriterlerinize uygun teklif yok' : 'Henüz teklif eklenmemiş'}
                        iconBgColor={colors.modules.salesLight}
                    />
                ) : (
                    filteredQuotes.map((quote, index) => (
                        <QuoteCard key={quote.id} item={quote} index={index} />
                    ))
                )}
            </ScrollView>

            {/* Sort Sheet */}
            <SortSheet
                visible={showSortSheet}
                onClose={() => setShowSortSheet(false)}
                options={SORT_OPTIONS}
                value={sortValue}
                onChange={setSortValue}
                title="Sıralama"
            />
        </SafeAreaView>
    );
}
