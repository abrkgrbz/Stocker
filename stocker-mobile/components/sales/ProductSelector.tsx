import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, ViewStyle } from 'react-native';
import { Control, Controller, FieldValues, Path, useFieldArray } from 'react-hook-form';
import { Package, Plus, Minus, Trash2, Search, X, ShoppingCart } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/lib/theme';
import { useProducts } from '@/lib/api/hooks/useInventory';
import { calculateTotal, type SalesItem } from '@/lib/validation/sales.schemas';

interface ProductSelectorProps<T extends FieldValues> {
    // react-hook-form integration
    name: Path<T>;
    control: Control<T>;

    // Core props
    label?: string;

    // Styling
    style?: ViewStyle;
    moduleColor?: string;
    moduleLightColor?: string;
}

export function ProductSelector<T extends FieldValues>({
    name,
    control,
    label = 'Ürünler *',
    style,
    moduleColor,
    moduleLightColor,
}: ProductSelectorProps<T>) {
    const { colors } = useTheme();
    const [showPicker, setShowPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const iconColor = moduleColor || colors.modules.inventory;
    const iconBgColor = moduleLightColor || colors.modules.inventoryLight;

    // Fetch products
    const { data: productsData, isLoading } = useProducts({ pageSize: 100 });
    const products = productsData?.items || [];

    // Filter products based on search
    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;
        const query = searchQuery.toLowerCase();
        return products.filter(
            (product) =>
                product.name.toLowerCase().includes(query) ||
                product.sku?.toLowerCase().includes(query)
        );
    }, [products, searchQuery]);

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: name as any,
    });

    const items = fields as unknown as (SalesItem & { id: string })[];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const addProduct = (productId: string) => {
        const product = products.find((p) => p.id === productId);
        if (!product) return;

        // Check if already added
        const existingIndex = items.findIndex((i) => i.productId === productId);
        if (existingIndex !== -1) {
            // Increase quantity
            const existingItem = items[existingIndex];
            update(existingIndex, {
                ...existingItem,
                quantity: existingItem.quantity + 1,
            });
        } else {
            // Add new item
            append({
                productId,
                productName: product.name,
                quantity: 1,
                unitPrice: product.price,
                discountPercent: 0,
                taxPercent: 18,
            } as any);
        }
        setShowPicker(false);
        setSearchQuery('');
    };

    const updateQuantity = (index: number, delta: number) => {
        const item = items[index];
        const newQuantity = Math.max(1, item.quantity + delta);
        update(index, { ...item, quantity: newQuantity });
    };

    const total = calculateTotal(items);

    return (
        <Controller
            name={name}
            control={control}
            render={({ fieldState: { error } }) => (
                <View style={style}>
                    {/* Header */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 16,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    backgroundColor: iconBgColor,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12,
                                }}
                            >
                                <ShoppingCart size={20} color={iconColor} />
                            </View>
                            <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                {label}
                            </Text>
                        </View>

                        <Pressable
                            onPress={() => setShowPicker(!showPicker)}
                            style={{
                                backgroundColor: colors.brand.primary,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <Plus size={16} color="#fff" />
                            <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 4, fontSize: 13 }}>
                                Ekle
                            </Text>
                        </Pressable>
                    </View>

                    {/* Product Picker Dropdown */}
                    {showPicker && (
                        <Animated.View
                            entering={FadeInDown.duration(200)}
                            style={{
                                marginBottom: 16,
                                backgroundColor: colors.surface.primary,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: colors.border.primary,
                                overflow: 'hidden',
                            }}
                        >
                            {/* Search */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 12,
                                    borderBottomWidth: 1,
                                    borderBottomColor: colors.border.primary,
                                }}
                            >
                                <Search size={18} color={colors.text.tertiary} />
                                <TextInput
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    placeholder="Ürün ara..."
                                    placeholderTextColor={colors.text.tertiary}
                                    style={{
                                        flex: 1,
                                        marginLeft: 8,
                                        color: colors.text.primary,
                                        fontSize: 14,
                                    }}
                                    autoFocus
                                />
                                {searchQuery.length > 0 && (
                                    <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                                        <X size={16} color={colors.text.tertiary} />
                                    </Pressable>
                                )}
                            </View>

                            {/* Product List */}
                            <ScrollView
                                style={{ maxHeight: 200 }}
                                nestedScrollEnabled
                                keyboardShouldPersistTaps="handled"
                            >
                                {isLoading ? (
                                    <View style={{ padding: 20, alignItems: 'center' }}>
                                        <Text style={{ color: colors.text.tertiary }}>Yükleniyor...</Text>
                                    </View>
                                ) : filteredProducts.length === 0 ? (
                                    <View style={{ padding: 20, alignItems: 'center' }}>
                                        <Text style={{ color: colors.text.tertiary }}>
                                            {searchQuery ? 'Ürün bulunamadı' : 'Henüz ürün yok'}
                                        </Text>
                                    </View>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <Pressable
                                            key={product.id}
                                            onPress={() => addProduct(product.id)}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: 12,
                                            }}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <Text
                                                    style={{
                                                        color: colors.text.primary,
                                                        fontSize: 14,
                                                        fontWeight: '500',
                                                    }}
                                                    numberOfLines={1}
                                                >
                                                    {product.name}
                                                </Text>
                                                <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                                    SKU: {product.sku} • Stok: {product.stockQuantity}
                                                </Text>
                                            </View>
                                            <Text style={{ color: colors.brand.primary, fontWeight: '600' }}>
                                                {formatCurrency(product.price)}
                                            </Text>
                                        </Pressable>
                                    ))
                                )}
                            </ScrollView>
                        </Animated.View>
                    )}

                    {/* Selected Items */}
                    {items.length === 0 ? (
                        <View
                            style={{
                                alignItems: 'center',
                                paddingVertical: 24,
                                borderWidth: error ? 1 : 0,
                                borderColor: error ? colors.semantic.error : undefined,
                                borderRadius: 12,
                                backgroundColor: colors.background.tertiary,
                            }}
                        >
                            <Package size={40} color={colors.text.tertiary} />
                            <Text style={{ color: colors.text.tertiary, marginTop: 8 }}>
                                Henüz ürün eklenmedi
                            </Text>
                        </View>
                    ) : (
                        <View>
                            {items.map((item, index) => (
                                <View
                                    key={item.id}
                                    style={{
                                        backgroundColor: colors.background.tertiary,
                                        borderRadius: 12,
                                        padding: 12,
                                        marginBottom: 8,
                                    }}
                                >
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: colors.text.primary,
                                                fontWeight: '600',
                                                flex: 1,
                                            }}
                                            numberOfLines={1}
                                        >
                                            {item.productName}
                                        </Text>
                                        <Pressable onPress={() => remove(index)} hitSlop={8}>
                                            <Trash2 size={18} color={colors.semantic.error} />
                                        </Pressable>
                                    </View>

                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        {/* Quantity Controls */}
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Pressable
                                                onPress={() => updateQuantity(index, -1)}
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 8,
                                                    backgroundColor: colors.surface.primary,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Minus size={16} color={colors.text.primary} />
                                            </Pressable>
                                            <Text
                                                style={{
                                                    color: colors.text.primary,
                                                    fontSize: 16,
                                                    fontWeight: '600',
                                                    marginHorizontal: 16,
                                                }}
                                            >
                                                {item.quantity}
                                            </Text>
                                            <Pressable
                                                onPress={() => updateQuantity(index, 1)}
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 8,
                                                    backgroundColor: colors.surface.primary,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Plus size={16} color={colors.text.primary} />
                                            </Pressable>
                                        </View>

                                        {/* Item Total */}
                                        <Text style={{ color: colors.text.primary, fontWeight: '700' }}>
                                            {formatCurrency(item.quantity * item.unitPrice)}
                                        </Text>
                                    </View>
                                </View>
                            ))}

                            {/* Total */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    paddingTop: 12,
                                    borderTopWidth: 1,
                                    borderTopColor: colors.border.primary,
                                    marginTop: 8,
                                }}
                            >
                                <Text
                                    style={{
                                        color: colors.text.secondary,
                                        fontSize: 16,
                                        fontWeight: '600',
                                    }}
                                >
                                    Toplam
                                </Text>
                                <Text
                                    style={{
                                        color: colors.brand.primary,
                                        fontSize: 20,
                                        fontWeight: '700',
                                    }}
                                >
                                    {formatCurrency(total)}
                                </Text>
                            </View>
                        </View>
                    )}

                    {error && (
                        <Text style={{ color: colors.semantic.error, fontSize: 12, marginTop: 8 }}>
                            {error.message}
                        </Text>
                    )}
                </View>
            )}
        />
    );
}
