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
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    Send,
    XCircle,
    ChevronRight,
    RefreshCw,
    X,
    Calendar,
    DollarSign,
    Hash
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useInvoices } from '@/lib/api/hooks/useSales';
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
import type { Invoice, InvoiceStatus } from '@/lib/api/types/sales.types';

const SORT_OPTIONS: SortOption[] = [
    { key: 'invoiceDate', label: 'Fatura Tarihi', icon: <Calendar size={18} color="#64748b" /> },
    { key: 'dueDate', label: 'Vade Tarihi', icon: <Clock size={18} color="#64748b" /> },
    { key: 'totalAmount', label: 'Tutar', icon: <DollarSign size={18} color="#64748b" /> },
    { key: 'invoiceNumber', label: 'Fatura No', icon: <Hash size={18} color="#64748b" /> },
];

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
    const [showSortSheet, setShowSortSheet] = useState(false);
    const [sortValue, setSortValue] = useState<SortValue | null>(null);

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

    // Filter chips configuration
    const statusFilters: FilterChip[] = [
        { key: 'all', label: 'Tümü' },
        { key: 'sent', label: 'Gönderildi' },
        { key: 'paid', label: 'Ödendi' },
        { key: 'partial', label: 'Kısmi' },
        { key: 'overdue', label: 'Vadesi Geçti' }
    ];

    const filteredInvoices = useMemo(() => {
        let result = invoices;

        // Search filter
        if (searchQuery) {
            result = result.filter(invoice => {
                const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesSearch;
            });
        }

        // Sorting
        if (sortValue) {
            result = [...result].sort((a, b) => {
                let comparison = 0;
                switch (sortValue.key) {
                    case 'invoiceDate':
                        comparison = new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime();
                        break;
                    case 'dueDate':
                        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                        break;
                    case 'totalAmount':
                        comparison = a.totalAmount - b.totalAmount;
                        break;
                    case 'invoiceNumber':
                        comparison = a.invoiceNumber.localeCompare(b.invoiceNumber);
                        break;
                }
                return sortValue.order === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [invoices, searchQuery, sortValue]);

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
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    backgroundColor: item.status === 'overdue' ? colors.semantic.errorLight : colors.modules.salesLight,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12
                                }}
                            >
                                <FileText size={22} color={item.status === 'overdue' ? colors.semantic.error : colors.modules.sales} />
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
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
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

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
                title="Faturalar"
                subtitle={`${filteredInvoices.length} fatura`}
                primaryAction={{
                    icon: Plus,
                    onPress: () => router.push('/(dashboard)/sales/add-invoice' as any),
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
                        placeholder="Fatura ara..."
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
                selectedKey={selectedStatus}
                onSelect={(key) => setSelectedStatus(key as InvoiceStatus | 'all')}
                moduleColor={colors.modules.sales}
            />

            {/* Invoices List */}
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
                            Faturalar yükleniyor...
                        </Text>
                    </View>
                ) : isError ? (
                    <ErrorState
                        title="Bağlantı hatası"
                        message="Faturalar yüklenemedi"
                        onRetry={refetch}
                    />
                ) : filteredInvoices.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="Fatura bulunamadı"
                        message={searchQuery ? 'Arama kriterlerinize uygun fatura yok' : 'Henüz fatura eklenmemiş'}
                        iconBgColor={colors.modules.salesLight}
                        iconColor={colors.modules.sales}
                    />
                ) : (
                    filteredInvoices.map((invoice, index) => (
                        <InvoiceCard key={invoice.id} item={invoice} index={index} />
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
