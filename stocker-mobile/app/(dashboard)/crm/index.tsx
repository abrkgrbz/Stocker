import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    Pressable,
    TextInput,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import {
    ArrowLeft,
    Search,
    Plus,
    Phone,
    Mail,
    Building2,
    User,
    Filter,
    ChevronRight,
    X,
    RefreshCw,
    WifiOff,
    Target,
    Calendar,
    DollarSign,
    Hash
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import { useSync } from '@/lib/sync/SyncContext';
import {
    SortSheet,
    SortButton,
    type SortOption,
    type SortValue
} from '@/components/ui';
import type { Customer, CustomerStatus } from '@/lib/api/types/crm.types';

const SORT_OPTIONS: SortOption[] = [
    { key: 'companyName', label: 'Şirket Adı', icon: <Building2 size={18} color="#64748b" /> },
    { key: 'createdAt', label: 'Eklenme Tarihi', icon: <Calendar size={18} color="#64748b" /> },
    { key: 'creditLimit', label: 'Kredi Limiti', icon: <DollarSign size={18} color="#64748b" /> },
    { key: 'annualRevenue', label: 'Yıllık Ciro', icon: <DollarSign size={18} color="#64748b" /> },
];

export default function CustomerListScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { isOnline } = useSync();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<CustomerStatus | 'all'>('all');
    const [showSortSheet, setShowSortSheet] = useState(false);
    const [sortValue, setSortValue] = useState<SortValue | null>(null);

    // Fetch customers from API
    const {
        data: customersResponse,
        isLoading,
        isError,
        refetch,
        isRefetching
    } = useCustomers({
        search: searchQuery.length >= 2 ? searchQuery : undefined,
        status: selectedFilter !== 'all' ? selectedFilter : undefined,
        pageSize: 50
    });

    const customers = customersResponse?.items || [];

    // Filter customers locally for immediate search feedback
    const filteredCustomers = useMemo(() => {
        let result = customers;

        if (searchQuery.length < 2 && selectedFilter !== 'all') {
            result = result.filter(c => c.status === selectedFilter);
        }

        // Sorting
        if (sortValue) {
            result = [...result].sort((a, b) => {
                let comparison = 0;
                switch (sortValue.key) {
                    case 'companyName':
                        comparison = a.companyName.localeCompare(b.companyName);
                        break;
                    case 'createdAt':
                        comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
                        break;
                    case 'creditLimit':
                        comparison = (a.creditLimit || 0) - (b.creditLimit || 0);
                        break;
                    case 'annualRevenue':
                        comparison = (a.annualRevenue || 0) - (b.annualRevenue || 0);
                        break;
                }
                return sortValue.order === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [customers, searchQuery, selectedFilter, sortValue]);

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const getStatusColor = (status: CustomerStatus) => {
        switch (status) {
            case 'Active': return colors.semantic.success;
            case 'Prospect': return colors.semantic.warning;
            case 'Inactive': return colors.text.tertiary;
            case 'Suspended': return colors.semantic.error;
            default: return colors.text.tertiary;
        }
    };

    const getStatusLabel = (status: CustomerStatus) => {
        switch (status) {
            case 'Active': return 'Aktif';
            case 'Prospect': return 'Aday';
            case 'Inactive': return 'Pasif';
            case 'Suspended': return 'Askıda';
            default: return status;
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(value);
    };

    const FilterChip = ({ label, value }: { label: string; value: CustomerStatus | 'all' }) => (
        <Pressable
            onPress={() => setSelectedFilter(value)}
            style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor: selectedFilter === value ? colors.brand.primary : colors.surface.primary,
                borderWidth: 1,
                borderColor: selectedFilter === value ? colors.brand.primary : colors.border.primary
            }}
        >
            <Text style={{
                color: selectedFilter === value ? colors.text.inverse : colors.text.secondary,
                fontSize: 13,
                fontWeight: '500'
            }}>
                {label}
            </Text>
        </Pressable>
    );

    const CustomerCard = ({ item, index }: { item: Customer; index: number }) => (
        <Animated.View entering={FadeInRight.duration(300).delay(index * 50)}>
            <Pressable
                onPress={() => router.push(`/(dashboard)/crm/${item.id}` as any)}
                style={{
                    backgroundColor: colors.surface.primary,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: colors.border.primary
                }}
            >
                <View className="flex-row items-start">
                    {/* Avatar */}
                    <View
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            backgroundColor: colors.modules.crmLight,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12
                        }}
                    >
                        {item.customerType === 'Corporate' ? (
                            <Building2 size={22} color={colors.modules.crm} />
                        ) : (
                            <User size={22} color={colors.modules.crm} />
                        )}
                    </View>

                    {/* Info */}
                    <View style={{ flex: 1 }}>
                        <View className="flex-row items-center justify-between mb-1">
                            <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                {item.companyName}
                            </Text>
                            <View
                                style={{
                                    backgroundColor: getStatusColor(item.status) + '20',
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderRadius: 6
                                }}
                            >
                                <Text style={{
                                    color: getStatusColor(item.status),
                                    fontSize: 11,
                                    fontWeight: '600'
                                }}>
                                    {getStatusLabel(item.status)}
                                </Text>
                            </View>
                        </View>

                        {item.contactPerson && (
                            <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 4 }}>
                                {item.contactPerson}
                            </Text>
                        )}

                        {/* Contact Info */}
                        <View className="flex-row items-center mt-2">
                            {item.phone && (
                                <Pressable
                                    className="flex-row items-center mr-4"
                                    onPress={() => { /* Open phone */ }}
                                >
                                    <Phone size={14} color={colors.text.tertiary} />
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12, marginLeft: 4 }}>
                                        {item.phone}
                                    </Text>
                                </Pressable>
                            )}
                        </View>

                        {/* Stats */}
                        {(item.annualRevenue || 0) > 0 && (
                            <View className="flex-row items-center mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.border.primary }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Yıllık Ciro</Text>
                                    <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600' }}>
                                        {formatCurrency(item.annualRevenue || 0)}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Kredi Limiti</Text>
                                    <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600' }}>
                                        {formatCurrency(item.creditLimit)}
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={colors.text.tertiary} style={{ marginLeft: 8 }} />
                            </View>
                        )}
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );

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
                <View className="flex-row items-center mb-3">
                    <Pressable
                        onPress={() => router.back()}
                        className="mr-3 p-2 -ml-2"
                    >
                        <ArrowLeft size={24} color={colors.text.primary} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text.primary }} className="text-xl font-bold">Müşteriler</Text>
                        <Text style={{ color: colors.text.secondary }} className="text-sm">
                            {filteredCustomers.length} müşteri
                        </Text>
                    </View>
                    <Pressable
                        onPress={() => router.push('/(dashboard)/crm/add' as any)}
                        style={{
                            backgroundColor: colors.modules.crm,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 10,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}
                    >
                        <Plus size={16} color="#fff" />
                        <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 4, fontSize: 13 }}>
                            Müşteri
                        </Text>
                    </Pressable>
                </View>

                {/* Quick Actions */}
                <View className="flex-row mt-3 mb-3">
                    <Pressable
                        onPress={() => router.push('/(dashboard)/crm/deals' as any)}
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: colors.background.tertiary,
                            paddingVertical: 10,
                            paddingHorizontal: 14,
                            borderRadius: 10,
                            marginRight: 8
                        }}
                    >
                        <Target size={16} color={colors.modules.crm} />
                        <Text style={{ color: colors.text.secondary, fontSize: 13, fontWeight: '500', marginLeft: 6 }}>
                            Fırsatlar
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => router.push('/(dashboard)/crm/activities' as any)}
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: colors.background.tertiary,
                            paddingVertical: 10,
                            paddingHorizontal: 14,
                            borderRadius: 10
                        }}
                    >
                        <Phone size={16} color={colors.modules.crm} />
                        <Text style={{ color: colors.text.secondary, fontSize: 13, fontWeight: '500', marginLeft: 6 }}>
                            Aktiviteler
                        </Text>
                    </Pressable>
                </View>

                {/* Search Bar */}
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
                        placeholder="Müşteri ara..."
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

                {/* Filter Chips */}
                <Animated.ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-3"
                    contentContainerStyle={{ paddingRight: 16 }}
                >
                    <FilterChip label="Tümü" value="all" />
                    <FilterChip label="Aktif" value="Active" />
                    <FilterChip label="Aday" value="Prospect" />
                    <FilterChip label="Pasif" value="Inactive" />
                    <FilterChip label="Askıda" value="Suspended" />
                </Animated.ScrollView>
            </Animated.View>

            {/* Customer List */}
            <FlatList
                data={filteredCustomers}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => <CustomerCard item={item} index={index} />}
                contentContainerStyle={{
                    padding: 16,
                    paddingBottom: insets.bottom + 100
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
                ListEmptyComponent={() => (
                    <View className="items-center justify-center py-12">
                        {isLoading ? (
                            <>
                                <ActivityIndicator size="large" color={colors.brand.primary} />
                                <Text style={{ color: colors.text.secondary, fontSize: 14, marginTop: 12 }}>
                                    Müşteriler yükleniyor...
                                </Text>
                            </>
                        ) : isError ? (
                            <>
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
                                    {isOnline ? (
                                        <RefreshCw size={28} color={colors.semantic.error} />
                                    ) : (
                                        <WifiOff size={28} color={colors.semantic.error} />
                                    )}
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                                    {isOnline ? 'Bağlantı hatası' : 'Çevrimdışı'}
                                </Text>
                                <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
                                    {isOnline ? 'Müşteriler yüklenemedi' : 'İnternet bağlantınızı kontrol edin'}
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
                            </>
                        ) : (
                            <>
                                <View
                                    style={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: 16,
                                        backgroundColor: colors.modules.crmLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 16
                                    }}
                                >
                                    <User size={28} color={colors.modules.crm} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                                    Müşteri bulunamadı
                                </Text>
                                <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center' }}>
                                    {searchQuery ? 'Arama kriterlerinize uygun müşteri yok' : 'Henüz müşteri eklenmemiş'}
                                </Text>
                            </>
                        )}
                    </View>
                )}
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
        </SafeAreaView>
    );
}
