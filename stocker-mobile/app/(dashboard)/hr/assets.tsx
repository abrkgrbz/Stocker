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
    Briefcase,
    Monitor,
    Smartphone,
    Car,
    Key,
    ChevronRight,
    User,
    Calendar,
    RefreshCw
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import type { Asset, AssetStatus } from '@/lib/api/types/hr.types';

// TODO: Replace with useAssets hook when API is available
// Assets API endpoint henüz backend'de mevcut değil

const STATUS_CONFIG: Record<AssetStatus, { label: string; color: string; bgColor: string }> = {
    available: { label: 'Müsait', color: '#22c55e', bgColor: '#dcfce7' },
    assigned: { label: 'Atanmış', color: '#3b82f6', bgColor: '#dbeafe' },
    maintenance: { label: 'Bakımda', color: '#f59e0b', bgColor: '#fef3c7' },
    retired: { label: 'Emekli', color: '#64748b', bgColor: '#f1f5f9' }
};

const CATEGORY_ICONS: Record<string, any> = {
    'Bilgisayar': Monitor,
    'Telefon': Smartphone,
    'Monitör': Monitor,
    'Araç': Car,
    'default': Briefcase
};

export default function AssetsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<AssetStatus | 'all'>('all');
    const [refreshing, setRefreshing] = useState(false);

    // TODO: Replace with useAssets hook when API is available
    // const { data: assetsResponse, isLoading, isError, refetch, isRefetching } = useAssets({ status: selectedStatus });
    const isLoading = false;
    const isError = false;
    const isRefetching = refreshing;
    const assets: Asset[] = []; // Boş array - API bağlandığında assetsResponse?.items kullanılacak

    const statusFilters: { key: AssetStatus | 'all'; label: string }[] = [
        { key: 'all', label: 'Tümü' },
        { key: 'assigned', label: 'Atanmış' },
        { key: 'available', label: 'Müsait' },
        { key: 'maintenance', label: 'Bakımda' }
    ];

    const filteredAssets = useMemo(() => {
        let filtered = assets;
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(asset => asset.status === selectedStatus);
        }
        if (!searchQuery) return filtered;
        return filtered.filter(asset => {
            const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                asset.assetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (asset.assignedToName?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
            return matchesSearch;
        });
    }, [assets, searchQuery, selectedStatus]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // TODO: Replace with refetch() when API is available
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

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
            month: 'short',
            year: 'numeric'
        });
    };

    const AssetCard = ({ item, index }: { item: Asset; index: number }) => {
        const statusConfig = STATUS_CONFIG[item.status];
        const CategoryIcon = CATEGORY_ICONS[item.categoryName] || CATEGORY_ICONS.default;

        return (
            <Animated.View entering={FadeInRight.duration(300).delay(index * 50)}>
                <Pressable
                    onPress={() => router.push(`/(dashboard)/hr/asset/${item.id}` as any)}
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
                        {/* Icon */}
                        <View
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                backgroundColor: colors.semantic.infoLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 14
                            }}
                        >
                            <CategoryIcon size={24} color={colors.semantic.info} />
                        </View>

                        {/* Info */}
                        <View style={{ flex: 1 }}>
                            <View className="flex-row items-start justify-between mb-1">
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '600' }}>
                                        {item.name}
                                    </Text>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                        {item.assetNumber} • {item.categoryName}
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        backgroundColor: statusConfig.bgColor,
                                        paddingHorizontal: 8,
                                        paddingVertical: 3,
                                        borderRadius: 6
                                    }}
                                >
                                    <Text style={{ color: statusConfig.color, fontSize: 11, fontWeight: '600' }}>
                                        {statusConfig.label}
                                    </Text>
                                </View>
                            </View>

                            {item.description && (
                                <Text style={{ color: colors.text.secondary, fontSize: 13, marginTop: 4 }} numberOfLines={1}>
                                    {item.description}
                                </Text>
                            )}

                            {/* Assignment Info */}
                            {item.status === 'assigned' && item.assignedToName && (
                                <View className="flex-row items-center mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.border.primary }}>
                                    <User size={14} color={colors.text.tertiary} />
                                    <Text style={{ color: colors.text.secondary, fontSize: 13, marginLeft: 6 }}>
                                        {item.assignedToName}
                                    </Text>
                                    {item.assignedDate && (
                                        <>
                                            <Text style={{ color: colors.text.tertiary, marginHorizontal: 8 }}>•</Text>
                                            <Calendar size={12} color={colors.text.tertiary} />
                                            <Text style={{ color: colors.text.tertiary, fontSize: 12, marginLeft: 4 }}>
                                                {formatDate(item.assignedDate)}
                                            </Text>
                                        </>
                                    )}
                                </View>
                            )}

                            {/* Maintenance Note */}
                            {item.status === 'maintenance' && item.notes && (
                                <View
                                    className="mt-3 pt-3"
                                    style={{ borderTopWidth: 1, borderTopColor: colors.border.primary }}
                                >
                                    <Text style={{ color: colors.semantic.warning, fontSize: 12 }}>
                                        {item.notes}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <ChevronRight size={18} color={colors.text.tertiary} style={{ marginLeft: 8 }} />
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
                            <Text style={{ color: colors.text.primary }} className="text-xl font-bold">Zimmetler</Text>
                            <Text style={{ color: colors.text.secondary }} className="text-sm">
                                {filteredAssets.length} demirbaş
                            </Text>
                        </View>
                    </View>
                    <Pressable
                        onPress={() => router.push('/(dashboard)/hr/asset/new' as any)}
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
                            Zimmet ara...
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

            {/* Assets List */}
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
                            Zimmetler yükleniyor...
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
                            Zimmetler yüklenemedi
                        </Text>
                        <Pressable
                            onPress={onRefresh}
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
                ) : filteredAssets.length === 0 ? (
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
                            <Briefcase size={28} color={colors.semantic.info} />
                        </View>
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                            Zimmet bulunamadı
                        </Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center' }}>
                            {searchQuery ? 'Arama kriterlerinize uygun zimmet yok' : 'Henüz zimmet eklenmemiş'}
                        </Text>
                    </View>
                ) : (
                    filteredAssets.map((asset, index) => (
                        <AssetCard key={asset.id} item={asset} index={index} />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
