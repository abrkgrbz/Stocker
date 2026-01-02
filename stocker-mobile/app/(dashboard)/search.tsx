import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInRight, SlideInRight } from 'react-native-reanimated';
import {
    ArrowLeft,
    Search,
    Users,
    Package,
    UserCircle,
    ShoppingCart,
    FileText,
    FileCheck,
    Clock,
    X,
    TrendingUp,
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { SearchBar } from '@/components/ui';
import {
    useGlobalSearch,
    useRecentSearches,
    addRecentSearch,
    clearRecentSearches,
    SearchResult,
    SearchCategory,
    SEARCH_CATEGORIES,
} from '@/lib/api/hooks/useGlobalSearch';
import { useQueryClient } from '@tanstack/react-query';
import debounce from 'lodash.debounce';

// Icon mapping
const ICON_MAP: Record<string, typeof Search> = {
    Search,
    Users,
    Package,
    UserCircle,
    ShoppingCart,
    FileText,
    FileCheck,
};

// Result type colors
const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
    customer: { bg: '#dbeafe', text: '#2563eb' },
    product: { bg: '#dcfce7', text: '#16a34a' },
    employee: { bg: '#f3e8ff', text: '#9333ea' },
    order: { bg: '#fef3c7', text: '#d97706' },
    invoice: { bg: '#fee2e2', text: '#dc2626' },
    quote: { bg: '#e0e7ff', text: '#4f46e5' },
};

// Type labels
const TYPE_LABELS: Record<string, string> = {
    customer: 'Müşteri',
    product: 'Ürün',
    employee: 'Çalışan',
    order: 'Sipariş',
    invoice: 'Fatura',
    quote: 'Teklif',
};

export default function SearchScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');

    const { data: searchResults, isLoading, isFetching } = useGlobalSearch(debouncedQuery, selectedCategory);
    const { data: recentSearches = [] } = useRecentSearches();

    // Debounce search query
    const debouncedSetQuery = useCallback(
        debounce((query: string) => {
            setDebouncedQuery(query);
        }, 300),
        []
    );

    useEffect(() => {
        debouncedSetQuery(searchQuery);
    }, [searchQuery, debouncedSetQuery]);

    const handleResultPress = async (result: SearchResult) => {
        // Save to recent searches
        await addRecentSearch(searchQuery);
        queryClient.invalidateQueries({ queryKey: ['recentSearches'] });

        // Navigate to result
        router.push({
            pathname: result.route as any,
            params: { id: result.id },
        });
    };

    const handleRecentSearchPress = (query: string) => {
        setSearchQuery(query);
        setDebouncedQuery(query);
    };

    const handleClearRecent = async () => {
        await clearRecentSearches();
        queryClient.invalidateQueries({ queryKey: ['recentSearches'] });
    };

    const getIcon = (iconName: string) => {
        return ICON_MAP[iconName] || Search;
    };

    const renderSearchResult = ({ item, index }: { item: SearchResult; index: number }) => {
        const IconComponent = getIcon(item.icon);
        const typeColor = TYPE_COLORS[item.type] || { bg: colors.background.tertiary, text: colors.text.primary };

        return (
            <Animated.View entering={FadeInRight.duration(200).delay(index * 50)}>
                <Pressable
                    onPress={() => handleResultPress(item)}
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        borderWidth: 1,
                        borderColor: colors.border.primary,
                    }}
                >
                    <View
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: typeColor.bg,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <IconComponent size={22} color={typeColor.text} />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text
                            style={{ fontSize: 15, fontWeight: '600', color: colors.text.primary }}
                            numberOfLines={1}
                        >
                            {item.title}
                        </Text>
                        {item.subtitle && (
                            <Text
                                style={{ fontSize: 13, color: colors.text.secondary, marginTop: 2 }}
                                numberOfLines={1}
                            >
                                {item.subtitle}
                            </Text>
                        )}
                    </View>

                    <View
                        style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 6,
                            backgroundColor: typeColor.bg,
                        }}
                    >
                        <Text style={{ fontSize: 11, fontWeight: '600', color: typeColor.text }}>
                            {TYPE_LABELS[item.type]}
                        </Text>
                    </View>
                </Pressable>
            </Animated.View>
        );
    };

    const hasResults = searchResults && searchResults.totalCount > 0;
    const showRecentSearches = !searchQuery && recentSearches.length > 0;
    const showEmptyState = debouncedQuery.length >= 2 && !isLoading && !hasResults;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            {/* Header */}
            <Animated.View
                entering={FadeIn.duration(300)}
                style={{
                    backgroundColor: colors.surface.primary,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.primary,
                    padding: 16,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Pressable
                        onPress={() => router.back()}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: colors.background.tertiary,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <ArrowLeft size={20} color={colors.text.primary} />
                    </Pressable>

                    <View style={{ flex: 1 }}>
                        <SearchBar
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Müşteri, ürün, sipariş ara..."
                            autoFocus
                        />
                    </View>
                </View>

                {/* Category Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 12 }}
                    contentContainerStyle={{ paddingRight: 16 }}
                >
                    {SEARCH_CATEGORIES.map((category) => {
                        const isSelected = selectedCategory === category.key;
                        const CategoryIcon = getIcon(category.icon);

                        return (
                            <Pressable
                                key={category.key}
                                onPress={() => setSelectedCategory(category.key)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 6,
                                    paddingHorizontal: 14,
                                    paddingVertical: 8,
                                    borderRadius: 20,
                                    backgroundColor: isSelected
                                        ? colors.brand.primary
                                        : colors.background.tertiary,
                                    marginRight: 8,
                                }}
                            >
                                <CategoryIcon
                                    size={16}
                                    color={isSelected ? '#fff' : colors.text.secondary}
                                />
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontWeight: '500',
                                        color: isSelected ? '#fff' : colors.text.secondary,
                                    }}
                                >
                                    {category.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </Animated.View>

            {/* Loading Indicator */}
            {(isLoading || isFetching) && debouncedQuery.length >= 2 && (
                <View style={{ padding: 16, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={colors.brand.primary} />
                </View>
            )}

            {/* Recent Searches */}
            {showRecentSearches && (
                <Animated.View entering={FadeInDown.duration(300)} style={{ padding: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Clock size={18} color={colors.text.tertiary} />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.secondary }}>
                                Son Aramalar
                            </Text>
                        </View>
                        <Pressable onPress={handleClearRecent} hitSlop={8}>
                            <Text style={{ fontSize: 13, color: colors.brand.primary }}>
                                Temizle
                            </Text>
                        </Pressable>
                    </View>

                    {recentSearches.map((query, index) => (
                        <Animated.View
                            key={query}
                            entering={FadeInRight.duration(200).delay(index * 30)}
                        >
                            <Pressable
                                onPress={() => handleRecentSearchPress(query)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 12,
                                    borderBottomWidth: 1,
                                    borderBottomColor: colors.border.secondary,
                                }}
                            >
                                <Clock size={16} color={colors.text.tertiary} />
                                <Text
                                    style={{
                                        flex: 1,
                                        fontSize: 15,
                                        color: colors.text.primary,
                                        marginLeft: 12,
                                    }}
                                >
                                    {query}
                                </Text>
                                <TrendingUp size={16} color={colors.text.tertiary} />
                            </Pressable>
                        </Animated.View>
                    ))}
                </Animated.View>
            )}

            {/* Search Results */}
            {hasResults && (
                <FlatList
                    data={searchResults.all}
                    keyExtractor={(item) => `${item.type}-${item.id}`}
                    renderItem={renderSearchResult}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <Text style={{ fontSize: 14, color: colors.text.tertiary, marginBottom: 12 }}>
                            {searchResults.totalCount} sonuç bulundu
                        </Text>
                    }
                />
            )}

            {/* Empty State */}
            {showEmptyState && (
                <Animated.View
                    entering={FadeIn.duration(300)}
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 24,
                    }}
                >
                    <View
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            backgroundColor: colors.background.tertiary,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 16,
                        }}
                    >
                        <Search size={40} color={colors.text.tertiary} />
                    </View>
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: '600',
                            color: colors.text.primary,
                            marginBottom: 8,
                        }}
                    >
                        Sonuç Bulunamadı
                    </Text>
                    <Text
                        style={{
                            fontSize: 14,
                            color: colors.text.tertiary,
                            textAlign: 'center',
                        }}
                    >
                        "{debouncedQuery}" için sonuç bulunamadı.{'\n'}
                        Farklı anahtar kelimeler deneyin.
                    </Text>
                </Animated.View>
            )}

            {/* Initial State */}
            {!searchQuery && !showRecentSearches && (
                <Animated.View
                    entering={FadeIn.duration(300)}
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 24,
                    }}
                >
                    <View
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            backgroundColor: colors.background.tertiary,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 16,
                        }}
                    >
                        <Search size={40} color={colors.text.tertiary} />
                    </View>
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: '600',
                            color: colors.text.primary,
                            marginBottom: 8,
                        }}
                    >
                        Arama Yapın
                    </Text>
                    <Text
                        style={{
                            fontSize: 14,
                            color: colors.text.tertiary,
                            textAlign: 'center',
                        }}
                    >
                        Müşteri, ürün, çalışan, sipariş{'\n'}
                        veya fatura arayabilirsiniz
                    </Text>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}
