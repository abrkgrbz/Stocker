import React from 'react';
import {
    View,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    Text,
    Pressable,
    ViewStyle,
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { SearchBar } from './SearchBar';
import { FilterChips, FilterChip } from './FilterChips';
import { EmptyState } from './EmptyState';

interface DataTableProps<T> {
    // Data
    data: T[];
    keyExtractor: (item: T, index: number) => string;
    renderItem: (item: T, index: number) => React.ReactNode;

    // Search
    searchEnabled?: boolean;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;

    // Filters
    filters?: FilterChip<string>[];
    selectedFilter?: string;
    onFilterChange?: (filter: string) => void;
    filterModuleColor?: string;

    // States
    isLoading?: boolean;
    isRefreshing?: boolean;
    isError?: boolean;
    onRefresh?: () => void;
    onRetry?: () => void;

    // Empty state
    emptyIcon?: React.ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: { label: string; onPress: () => void };
    searchEmptyTitle?: string;

    // Pagination
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    ListFooterComponent?: React.ReactNode;

    // Animation
    animated?: boolean;
    animationDelay?: number;

    // Styling
    style?: ViewStyle;
    contentContainerStyle?: ViewStyle;
    listStyle?: ViewStyle;
    showSearchBar?: boolean;
    showFilters?: boolean;
}

export function DataTable<T>({
    data,
    keyExtractor,
    renderItem,
    searchEnabled = false,
    searchValue = '',
    onSearchChange,
    searchPlaceholder = 'Ara...',
    filters,
    selectedFilter,
    onFilterChange,
    filterModuleColor,
    isLoading = false,
    isRefreshing = false,
    isError = false,
    onRefresh,
    onRetry,
    emptyIcon,
    emptyTitle = 'Veri bulunamadı',
    emptyDescription = 'Henüz kayıt bulunmuyor',
    emptyAction,
    searchEmptyTitle = 'Sonuç bulunamadı',
    onEndReached,
    onEndReachedThreshold = 0.5,
    ListFooterComponent,
    animated = true,
    animationDelay = 50,
    style,
    contentContainerStyle,
    listStyle,
    showSearchBar = true,
    showFilters = true,
}: DataTableProps<T>) {
    const { colors } = useTheme();

    // Render loading state
    if (isLoading && !isRefreshing) {
        return (
            <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, style]}>
                <ActivityIndicator size="large" color={colors.brand.primary} />
                <Text style={{ color: colors.text.tertiary, marginTop: 12 }}>Yükleniyor...</Text>
            </View>
        );
    }

    // Render error state
    if (isError) {
        return (
            <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }, style]}>
                <Text style={{ color: colors.semantic.error, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                    Bir hata oluştu
                </Text>
                <Text style={{ color: colors.text.tertiary, textAlign: 'center', marginBottom: 16 }}>
                    Veriler yüklenirken bir sorun oluştu
                </Text>
                {onRetry && (
                    <Pressable
                        onPress={onRetry}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: colors.brand.primary,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 8,
                        }}
                    >
                        <RefreshCw size={16} color="#fff" />
                        <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 8 }}>
                            Tekrar Dene
                        </Text>
                    </Pressable>
                )}
            </View>
        );
    }

    // Render empty state
    const renderEmptyComponent = () => {
        // If searching and no results
        if (searchValue && searchValue.length > 0 && data.length === 0) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                        {searchEmptyTitle}
                    </Text>
                    <Text style={{ color: colors.text.tertiary, textAlign: 'center' }}>
                        "{searchValue}" için sonuç bulunamadı
                    </Text>
                </View>
            );
        }

        // Default empty state
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                {emptyIcon && <View style={{ marginBottom: 16 }}>{emptyIcon}</View>}
                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                    {emptyTitle}
                </Text>
                <Text style={{ color: colors.text.tertiary, textAlign: 'center', marginBottom: 16 }}>
                    {emptyDescription}
                </Text>
                {emptyAction && (
                    <Pressable
                        onPress={emptyAction.onPress}
                        style={{
                            backgroundColor: colors.brand.primary,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 8,
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '600' }}>
                            {emptyAction.label}
                        </Text>
                    </Pressable>
                )}
            </View>
        );
    };

    // Render item with animation
    const renderAnimatedItem = ({ item, index }: { item: T; index: number }) => {
        const content = renderItem(item, index);

        if (animated) {
            return (
                <Animated.View entering={FadeInRight.duration(300).delay(index * animationDelay)}>
                    {content}
                </Animated.View>
            );
        }

        return <>{content}</>;
    };

    return (
        <View style={[{ flex: 1 }, style]}>
            {/* Search Bar */}
            {searchEnabled && showSearchBar && onSearchChange && (
                <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                    <SearchBar
                        value={searchValue}
                        onChangeText={onSearchChange}
                        placeholder={searchPlaceholder}
                    />
                </View>
            )}

            {/* Filter Chips */}
            {filters && filters.length > 0 && showFilters && onFilterChange && selectedFilter && (
                <View style={{ marginVertical: 8 }}>
                    <FilterChips
                        filters={filters}
                        selected={selectedFilter}
                        onSelect={onFilterChange}
                        moduleColor={filterModuleColor}
                    />
                </View>
            )}

            {/* List */}
            <FlatList
                data={data}
                keyExtractor={keyExtractor}
                renderItem={renderAnimatedItem}
                style={listStyle}
                contentContainerStyle={[
                    {
                        padding: 16,
                        paddingTop: 8,
                        flexGrow: data.length === 0 ? 1 : undefined,
                    },
                    contentContainerStyle,
                ]}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.brand.primary}
                            colors={[colors.brand.primary]}
                        />
                    ) : undefined
                }
                ListEmptyComponent={renderEmptyComponent}
                onEndReached={onEndReached}
                onEndReachedThreshold={onEndReachedThreshold}
                ListFooterComponent={ListFooterComponent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
