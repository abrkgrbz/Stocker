import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    FlatList,
    Pressable,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    Alert
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import {
    ArrowLeft,
    Search,
    Plus,
    ShoppingCart,
    Clock,
    CheckCircle,
    Truck,
    Package,
    XCircle,
    ChevronRight,
    RefreshCw,
    X,
    Calendar,
    DollarSign,
    Hash,
    Trash2,
    FileText,
    RotateCcw
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useInfiniteOrders, useUpdateOrderStatus } from '@/lib/api/hooks/useSales';
import type { Order, OrderStatus } from '@/lib/api/types/sales.types';
import {
    FilterSheet,
    FilterButton,
    SortSheet,
    SortButton,
    SelectionBar,
    SelectionCheckbox,
    SelectionModeButton,
    BulkActionSheet,
    type FilterConfig,
    type FilterValues,
    type SortOption,
    type SortValue,
    type BulkAction
} from '@/components/ui';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: any }> = {
    draft: { label: 'Taslak', color: '#64748b', bgColor: '#f1f5f9', icon: Clock },
    pending: { label: 'Bekliyor', color: '#f59e0b', bgColor: '#fef3c7', icon: Clock },
    confirmed: { label: 'Onaylandı', color: '#3b82f6', bgColor: '#dbeafe', icon: CheckCircle },
    processing: { label: 'Hazırlanıyor', color: '#8b5cf6', bgColor: '#ede9fe', icon: Package },
    shipped: { label: 'Kargoda', color: '#06b6d4', bgColor: '#cffafe', icon: Truck },
    delivered: { label: 'Teslim Edildi', color: '#22c55e', bgColor: '#dcfce7', icon: CheckCircle },
    cancelled: { label: 'İptal', color: '#ef4444', bgColor: '#fee2e2', icon: XCircle }
};

// Filter and Sort Configuration
const FILTER_CONFIG: FilterConfig[] = [
    {
        key: 'status',
        label: 'Durum',
        type: 'multiselect',
        options: [
            { value: 'draft', label: 'Taslak' },
            { value: 'pending', label: 'Bekliyor' },
            { value: 'confirmed', label: 'Onaylandı' },
            { value: 'processing', label: 'Hazırlanıyor' },
            { value: 'shipped', label: 'Kargoda' },
            { value: 'delivered', label: 'Teslim Edildi' },
            { value: 'cancelled', label: 'İptal' },
        ],
    },
    {
        key: 'dateRange',
        label: 'Tarih Aralığı',
        type: 'daterange',
    },
];

const SORT_OPTIONS: SortOption[] = [
    { key: 'orderDate', label: 'Sipariş Tarihi', icon: <Calendar size={18} color="#64748b" /> },
    { key: 'totalAmount', label: 'Tutar', icon: <DollarSign size={18} color="#64748b" /> },
    { key: 'orderNumber', label: 'Sipariş No', icon: <Hash size={18} color="#64748b" /> },
];

export default function OrdersScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
    const [showFilterSheet, setShowFilterSheet] = useState(false);
    const [showSortSheet, setShowSortSheet] = useState(false);
    const [filterValues, setFilterValues] = useState<FilterValues>({});
    const [sortValue, setSortValue] = useState<SortValue | null>(null);

    // Selection mode state
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [showBulkActionSheet, setShowBulkActionSheet] = useState(false);

    // Fetch orders from API with infinite scroll
    const {
        data: ordersData,
        isLoading,
        isError,
        refetch,
        isRefetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteOrders({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        pageSize: 20
    });

    // Flatten paginated data
    const orders = useMemo(() => {
        return ordersData?.pages.flatMap(page => page.items) || [];
    }, [ordersData]);

    // Bulk status update mutation
    const updateStatusMutation = useUpdateOrderStatus();

    const statusFilters: { key: OrderStatus | 'all'; label: string }[] = [
        { key: 'all', label: 'Tümü' },
        { key: 'pending', label: 'Bekliyor' },
        { key: 'confirmed', label: 'Onaylı' },
        { key: 'shipped', label: 'Kargoda' },
        { key: 'delivered', label: 'Teslim' }
    ];

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = 0;
        const statuses = filterValues.status as string[] | undefined;
        const dateRange = filterValues.dateRange as { start?: string; end?: string } | undefined;
        if (statuses && statuses.length > 0) count++;
        if (dateRange && (dateRange.start || dateRange.end)) count++;
        return count;
    }, [filterValues]);

    const filteredOrders = useMemo(() => {
        let result = orders;

        // Search filter
        if (searchQuery) {
            result = result.filter(order =>
                order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Advanced filters
        const statuses = filterValues.status as string[] | undefined;
        if (statuses && statuses.length > 0) {
            result = result.filter(order => statuses.includes(order.status));
        }

        const dateRange = filterValues.dateRange as { start?: string; end?: string } | undefined;
        if (dateRange) {
            if (dateRange.start) {
                result = result.filter(order => order.orderDate >= dateRange.start!);
            }
            if (dateRange.end) {
                result = result.filter(order => order.orderDate <= dateRange.end!);
            }
        }

        // Sorting
        if (sortValue) {
            result = [...result].sort((a, b) => {
                let comparison = 0;
                switch (sortValue.key) {
                    case 'orderDate':
                        comparison = new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
                        break;
                    case 'totalAmount':
                        comparison = a.totalAmount - b.totalAmount;
                        break;
                    case 'orderNumber':
                        comparison = a.orderNumber.localeCompare(b.orderNumber);
                        break;
                }
                return sortValue.order === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [orders, searchQuery, filterValues, sortValue]);

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    // Selection handlers
    const toggleOrderSelection = useCallback((orderId: string) => {
        setSelectedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    }, []);

    const selectAllOrders = useCallback(() => {
        setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }, [filteredOrders]);

    const deselectAllOrders = useCallback(() => {
        setSelectedOrders(new Set());
    }, []);

    const exitSelectionMode = useCallback(() => {
        setIsSelectionMode(false);
        setSelectedOrders(new Set());
    }, []);

    // Bulk action handlers
    const handleBulkStatusChange = useCallback(async (newStatus: OrderStatus) => {
        const selectedIds = Array.from(selectedOrders);
        if (selectedIds.length === 0) return;

        Alert.alert(
            'Durum Değiştir',
            `${selectedIds.length} siparişin durumu "${STATUS_CONFIG[newStatus].label}" olarak değiştirilecek. Onaylıyor musunuz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Onayla',
                    onPress: async () => {
                        try {
                            // Process each order
                            for (const orderId of selectedIds) {
                                await updateStatusMutation.mutateAsync({ id: orderId, status: newStatus });
                            }
                            exitSelectionMode();
                            refetch();
                            Alert.alert('Başarılı', `${selectedIds.length} sipariş güncellendi`);
                        } catch (error) {
                            Alert.alert('Hata', 'Bazı siparişler güncellenemedi');
                        }
                    }
                }
            ]
        );
    }, [selectedOrders, updateStatusMutation, exitSelectionMode, refetch]);

    const handleBulkCancel = useCallback(() => {
        handleBulkStatusChange('cancelled');
    }, [handleBulkStatusChange]);

    // Bulk actions for SelectionBar
    const bulkActions: BulkAction[] = useMemo(() => [
        {
            key: 'confirm',
            label: 'Onayla',
            icon: <CheckCircle size={20} color={colors.semantic.success} />,
            onPress: () => handleBulkStatusChange('confirmed'),
        },
        {
            key: 'ship',
            label: 'Kargola',
            icon: <Truck size={20} color={colors.brand.primary} />,
            onPress: () => handleBulkStatusChange('shipped'),
        },
        {
            key: 'cancel',
            label: 'İptal Et',
            icon: <XCircle size={20} color={colors.semantic.error} />,
            variant: 'danger' as const,
            onPress: handleBulkCancel,
        },
    ], [colors, handleBulkStatusChange, handleBulkCancel]);

    // Extended bulk actions for sheet
    const extendedBulkActions: BulkAction[] = useMemo(() => [
        ...bulkActions,
        {
            key: 'deliver',
            label: 'Teslim Et',
            icon: <Package size={20} color={colors.semantic.success} />,
            onPress: () => handleBulkStatusChange('delivered'),
        },
        {
            key: 'pending',
            label: 'Beklemede',
            icon: <Clock size={20} color={colors.semantic.warning} />,
            onPress: () => handleBulkStatusChange('pending'),
        },
    ], [bulkActions, colors, handleBulkStatusChange]);

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

    const renderOrderItem = useCallback(({ item, index }: { item: Order; index: number }) => {
        const statusConfig = STATUS_CONFIG[item.status];
        const StatusIcon = statusConfig.icon;
        const isSelected = selectedOrders.has(item.id);

        const handlePress = () => {
            if (isSelectionMode) {
                toggleOrderSelection(item.id);
            } else {
                router.push(`/(dashboard)/sales/order/${item.id}` as any);
            }
        };

        const handleLongPress = () => {
            if (!isSelectionMode) {
                setIsSelectionMode(true);
                setSelectedOrders(new Set([item.id]));
            }
        };

        return (
            <Animated.View entering={FadeInRight.duration(300).delay(Math.min(index, 10) * 50)}>
                <Pressable
                    onPress={handlePress}
                    onLongPress={handleLongPress}
                    delayLongPress={300}
                    style={{
                        backgroundColor: isSelected ? `${colors.brand.primary}10` : colors.surface.primary,
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected ? colors.brand.primary : colors.border.primary,
                        flexDirection: 'row',
                        alignItems: 'flex-start'
                    }}
                >
                    {isSelectionMode && (
                        <View style={{ marginRight: 12, paddingTop: 10 }}>
                            <SelectionCheckbox
                                selected={isSelected}
                                onToggle={() => toggleOrderSelection(item.id)}
                            />
                        </View>
                    )}
                    <View style={{ flex: 1 }}>
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
                                    <ShoppingCart size={22} color={colors.modules.sales} />
                                </View>
                                <View>
                                    <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '600' }}>
                                        {item.orderNumber}
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
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                    {formatDate(item.orderDate)}
                                </Text>
                                {item.deliveryDate && (
                                    <>
                                        <Text style={{ color: colors.text.tertiary, marginHorizontal: 6 }}>→</Text>
                                        <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                            {formatDate(item.deliveryDate)}
                                        </Text>
                                    </>
                                )}
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '700' }}>
                                    {formatCurrency(item.totalAmount)}
                                </Text>
                                {!isSelectionMode && (
                                    <ChevronRight size={18} color={colors.text.tertiary} style={{ marginLeft: 4 }} />
                                )}
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        );
    }, [colors, isSelectionMode, selectedOrders, toggleOrderSelection, router, formatCurrency, formatDate]);

    const ListEmptyComponent = useCallback(() => {
        if (isLoading) {
            return (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
                    <ActivityIndicator size="large" color={colors.brand.primary} />
                    <Text style={{ color: colors.text.secondary, fontSize: 14, marginTop: 12 }}>
                        Siparişler yükleniyor...
                    </Text>
                </View>
            );
        }

        if (isError) {
            return (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
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
                        Siparişler yüklenemedi
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
            );
        }

        return (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
                <View
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        backgroundColor: colors.modules.salesLight,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16
                    }}
                >
                    <ShoppingCart size={28} color={colors.modules.sales} />
                </View>
                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                    Sipariş bulunamadı
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center' }}>
                    {searchQuery ? 'Arama kriterlerinize uygun sipariş yok' : 'Henüz sipariş eklenmemiş'}
                </Text>
            </View>
        );
    }, [colors, isLoading, isError, searchQuery, refetch]);

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
                            <Text style={{ color: colors.text.primary }} className="text-xl font-bold">Siparişler</Text>
                            <Text style={{ color: colors.text.secondary }} className="text-sm">
                                {filteredOrders.length} sipariş
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {!isSelectionMode && filteredOrders.length > 0 && (
                            <SelectionModeButton onPress={() => setIsSelectionMode(true)} />
                        )}
                        <Pressable
                            onPress={() => router.push('/(dashboard)/sales/order/new' as any)}
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
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Sipariş ara..."
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

                {/* Filter & Sort Buttons */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    <FilterButton
                        onPress={() => setShowFilterSheet(true)}
                        activeCount={activeFilterCount}
                    />
                    <SortButton
                        onPress={() => setShowSortSheet(true)}
                        value={sortValue}
                        options={SORT_OPTIONS}
                    />
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

            {/* Orders List */}
            <FlatList
                data={isLoading || isError ? [] : filteredOrders}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderItem}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: isSelectionMode ? 160 + insets.bottom : 60 + insets.bottom + 24,
                    flexGrow: filteredOrders.length === 0 || isLoading || isError ? 1 : undefined
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching && !isFetchingNextPage}
                        onRefresh={onRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={ListEmptyComponent}
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                            <ActivityIndicator size="small" color={colors.brand.primary} />
                            <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 8 }}>
                                Daha fazla yükleniyor...
                            </Text>
                        </View>
                    ) : null
                }
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage && !searchQuery) {
                        fetchNextPage();
                    }
                }}
                onEndReachedThreshold={0.3}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                extraData={[isSelectionMode, selectedOrders]}
            />

            {/* Filter Sheet */}
            <FilterSheet
                visible={showFilterSheet}
                onClose={() => setShowFilterSheet(false)}
                filters={FILTER_CONFIG}
                values={filterValues}
                onChange={setFilterValues}
                onReset={() => setFilterValues({})}
                title="Sipariş Filtreleri"
            />

            {/* Sort Sheet */}
            <SortSheet
                visible={showSortSheet}
                onClose={() => setShowSortSheet(false)}
                options={SORT_OPTIONS}
                value={sortValue}
                onChange={setSortValue}
                title="Sıralama"
            />

            {/* Selection Bar */}
            <SelectionBar
                visible={isSelectionMode}
                selectedCount={selectedOrders.size}
                totalCount={filteredOrders.length}
                onSelectAll={selectAllOrders}
                onDeselectAll={deselectAllOrders}
                onCancel={exitSelectionMode}
                actions={bulkActions}
            />

            {/* Bulk Action Sheet */}
            <BulkActionSheet
                visible={showBulkActionSheet}
                onClose={() => setShowBulkActionSheet(false)}
                actions={extendedBulkActions}
                selectedCount={selectedOrders.size}
            />
        </SafeAreaView>
    );
}
