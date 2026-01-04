import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    ArrowLeft,
    ArrowRightLeft,
    Save,
    Warehouse,
    Package,
    Plus,
    Minus,
    Trash2,
    ChevronDown,
    FileText,
    ArrowRight
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useCreateStockTransfer, useWarehouses, useProducts } from '@/lib/api/hooks/useInventory';
import type { Warehouse as WarehouseType, Product } from '@/lib/api/types/inventory.types';

interface TransferItem {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    availableStock: number;
}

export default function AddTransferScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const { mutate: createTransfer, isPending } = useCreateStockTransfer();
    const { data: warehouses } = useWarehouses();
    const { data: productsData } = useProducts({ pageSize: 100 });

    const products = productsData?.items || [];

    const [formData, setFormData] = useState({
        fromWarehouseId: '',
        toWarehouseId: '',
        notes: '',
    });

    const [items, setItems] = useState<TransferItem[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showFromWarehousePicker, setShowFromWarehousePicker] = useState(false);
    const [showToWarehousePicker, setShowToWarehousePicker] = useState(false);
    const [showProductPicker, setShowProductPicker] = useState(false);

    const selectedFromWarehouse = warehouses?.find((w: WarehouseType) => w.id === formData.fromWarehouseId);
    const selectedToWarehouse = warehouses?.find((w: WarehouseType) => w.id === formData.toWarehouseId);

    // Filter out already selected warehouse from options
    const availableToWarehouses = warehouses?.filter((w: WarehouseType) => w.id !== formData.fromWarehouseId);
    const availableFromWarehouses = warehouses?.filter((w: WarehouseType) => w.id !== formData.toWarehouseId);

    const addItem = (productId: string) => {
        const product = products.find((p: Product) => p.id === productId);
        if (!product) return;

        const existingItem = items.find(i => i.productId === productId);
        if (existingItem) {
            setItems(items.map(i =>
                i.productId === productId
                    ? { ...i, quantity: Math.min(i.quantity + 1, i.availableStock) }
                    : i
            ));
        } else {
            setItems([...items, {
                productId,
                productName: product.name,
                sku: product.sku,
                quantity: 1,
                availableStock: product.stockQuantity,
            }]);
        }
        setShowProductPicker(false);
    };

    const updateItemQuantity = (productId: string, delta: number) => {
        setItems(items.map(item => {
            if (item.productId === productId) {
                const newQuantity = Math.max(1, Math.min(item.quantity + delta, item.availableStock));
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeItem = (productId: string) => {
        setItems(items.filter(i => i.productId !== productId));
    };

    const getTotalQuantity = () => {
        return items.reduce((sum, item) => sum + item.quantity, 0);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fromWarehouseId) {
            newErrors.fromWarehouseId = 'Kaynak depo seçimi zorunludur';
        }
        if (!formData.toWarehouseId) {
            newErrors.toWarehouseId = 'Hedef depo seçimi zorunludur';
        }
        if (formData.fromWarehouseId === formData.toWarehouseId && formData.fromWarehouseId) {
            newErrors.toWarehouseId = 'Kaynak ve hedef depo aynı olamaz';
        }
        if (items.length === 0) {
            newErrors.items = 'En az bir ürün eklemelisiniz';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        createTransfer(
            {
                fromWarehouseId: formData.fromWarehouseId,
                toWarehouseId: formData.toWarehouseId,
                notes: formData.notes.trim() || undefined,
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
            },
            {
                onSuccess: () => {
                    Alert.alert('Başarılı', 'Transfer talebi oluşturuldu', [
                        { text: 'Tamam', onPress: () => router.back() }
                    ]);
                },
                onError: () => {
                    Alert.alert('Hata', 'Transfer oluşturulurken bir hata oluştu');
                }
            }
        );
    };

    const WarehousePickerField = ({
        label,
        value,
        placeholder,
        onPress,
        error,
        type
    }: {
        label: string;
        value?: WarehouseType;
        placeholder: string;
        onPress: () => void;
        error?: string;
        type: 'from' | 'to';
    }) => (
        <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                {label}
            </Text>
            <Pressable
                onPress={onPress}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.background.tertiary,
                    borderRadius: 12,
                    padding: 14,
                    borderWidth: error ? 1 : 0,
                    borderColor: colors.semantic.error
                }}
            >
                <Warehouse size={18} color={type === 'from' ? colors.semantic.error : colors.semantic.success} />
                <Text
                    style={{
                        flex: 1,
                        marginLeft: 10,
                        fontSize: 14,
                        color: value ? colors.text.primary : colors.text.tertiary
                    }}
                    numberOfLines={1}
                >
                    {value?.name || placeholder}
                </Text>
                <ChevronDown size={18} color={colors.text.tertiary} />
            </Pressable>
            {error && (
                <Text style={{ color: colors.semantic.error, fontSize: 11, marginTop: 4 }}>
                    {error}
                </Text>
            )}
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <Animated.View
                    entering={FadeIn.duration(400)}
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        backgroundColor: colors.surface.primary,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border.primary
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <Pressable onPress={() => router.back()} style={{ marginRight: 12, padding: 8, marginLeft: -8 }}>
                                <ArrowLeft size={24} color={colors.text.primary} />
                            </Pressable>
                            <View>
                                <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>
                                    Yeni Transfer
                                </Text>
                                <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                    Stok Yönetimi
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            onPress={handleSubmit}
                            disabled={isPending}
                            style={{
                                backgroundColor: colors.modules.inventory,
                                paddingHorizontal: 16,
                                paddingVertical: 10,
                                borderRadius: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                                opacity: isPending ? 0.7 : 1,
                            }}
                        >
                            {isPending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Save size={18} color="#fff" />
                                    <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 6 }}>
                                        Oluştur
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                </Animated.View>

                <ScrollView
                    contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Warehouse Selection */}
                    <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                        <View
                            style={{
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: colors.border.primary
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: colors.modules.inventoryLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}
                                >
                                    <ArrowRightLeft size={20} color={colors.modules.inventory} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                    Depolar
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <WarehousePickerField
                                    label="Kaynak Depo *"
                                    value={selectedFromWarehouse}
                                    placeholder="Seçin"
                                    onPress={() => setShowFromWarehousePicker(!showFromWarehousePicker)}
                                    error={errors.fromWarehouseId}
                                    type="from"
                                />

                                <View style={{ paddingHorizontal: 12, paddingTop: 36 }}>
                                    <ArrowRight size={20} color={colors.modules.inventory} />
                                </View>

                                <WarehousePickerField
                                    label="Hedef Depo *"
                                    value={selectedToWarehouse}
                                    placeholder="Seçin"
                                    onPress={() => setShowToWarehousePicker(!showToWarehousePicker)}
                                    error={errors.toWarehouseId}
                                    type="to"
                                />
                            </View>

                            {showFromWarehousePicker && (
                                <View style={{ marginTop: 12, backgroundColor: colors.background.tertiary, borderRadius: 12, maxHeight: 150 }}>
                                    <ScrollView nestedScrollEnabled>
                                        {availableFromWarehouses?.map((warehouse: WarehouseType) => (
                                            <Pressable
                                                key={warehouse.id}
                                                onPress={() => {
                                                    setFormData(prev => ({ ...prev, fromWarehouseId: warehouse.id }));
                                                    setShowFromWarehousePicker(false);
                                                }}
                                                style={{
                                                    padding: 12,
                                                    borderBottomWidth: 1,
                                                    borderBottomColor: colors.border.primary
                                                }}
                                            >
                                                <Text style={{ color: colors.text.primary, fontSize: 14 }}>
                                                    {warehouse.name}
                                                </Text>
                                                {warehouse.address && (
                                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                                        {warehouse.address}
                                                    </Text>
                                                )}
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {showToWarehousePicker && (
                                <View style={{ marginTop: 12, backgroundColor: colors.background.tertiary, borderRadius: 12, maxHeight: 150 }}>
                                    <ScrollView nestedScrollEnabled>
                                        {availableToWarehouses?.map((warehouse: WarehouseType) => (
                                            <Pressable
                                                key={warehouse.id}
                                                onPress={() => {
                                                    setFormData(prev => ({ ...prev, toWarehouseId: warehouse.id }));
                                                    setShowToWarehousePicker(false);
                                                }}
                                                style={{
                                                    padding: 12,
                                                    borderBottomWidth: 1,
                                                    borderBottomColor: colors.border.primary
                                                }}
                                            >
                                                <Text style={{ color: colors.text.primary, fontSize: 14 }}>
                                                    {warehouse.name}
                                                </Text>
                                                {warehouse.address && (
                                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                                        {warehouse.address}
                                                    </Text>
                                                )}
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    </Animated.View>

                    {/* Products */}
                    <Animated.View entering={FadeInDown.duration(400).delay(150)}>
                        <View
                            style={{
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: errors.items ? colors.semantic.error : colors.border.primary
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 10,
                                            backgroundColor: colors.modules.inventoryLight,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 12
                                        }}
                                    >
                                        <Package size={20} color={colors.modules.inventory} />
                                    </View>
                                    <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                        Ürünler *
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={() => setShowProductPicker(!showProductPicker)}
                                    style={{
                                        backgroundColor: colors.modules.inventory,
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

                            {showProductPicker && (
                                <View style={{ marginBottom: 16, maxHeight: 200, backgroundColor: colors.background.tertiary, borderRadius: 12, padding: 8 }}>
                                    <ScrollView nestedScrollEnabled>
                                        {products.filter((p: Product) => p.stockQuantity > 0).map((product: Product) => (
                                            <Pressable
                                                key={product.id}
                                                onPress={() => addItem(product.id)}
                                                style={{
                                                    padding: 12,
                                                    borderRadius: 8,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                }}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '500' }}>
                                                        {product.name}
                                                    </Text>
                                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                                        SKU: {product.sku}
                                                    </Text>
                                                </View>
                                                <View style={{ alignItems: 'flex-end' }}>
                                                    <Text style={{ color: colors.modules.inventory, fontWeight: '600' }}>
                                                        {product.stockQuantity}
                                                    </Text>
                                                    <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>
                                                        stok
                                                    </Text>
                                                </View>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {items.length === 0 ? (
                                <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                                    <Package size={40} color={colors.text.tertiary} />
                                    <Text style={{ color: colors.text.tertiary, marginTop: 8 }}>
                                        Henüz ürün eklenmedi
                                    </Text>
                                </View>
                            ) : (
                                <View>
                                    {items.map((item) => (
                                        <View
                                            key={item.productId}
                                            style={{
                                                backgroundColor: colors.background.tertiary,
                                                borderRadius: 12,
                                                padding: 12,
                                                marginBottom: 8,
                                            }}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ color: colors.text.primary, fontWeight: '600' }} numberOfLines={1}>
                                                        {item.productName}
                                                    </Text>
                                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                                        SKU: {item.sku} | Mevcut: {item.availableStock}
                                                    </Text>
                                                </View>
                                                <Pressable onPress={() => removeItem(item.productId)}>
                                                    <Trash2 size={18} color={colors.semantic.error} />
                                                </Pressable>
                                            </View>

                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Pressable
                                                        onPress={() => updateItemQuantity(item.productId, -1)}
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: 8,
                                                            backgroundColor: colors.surface.primary,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <Minus size={18} color={colors.text.primary} />
                                                    </Pressable>
                                                    <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700', marginHorizontal: 20 }}>
                                                        {item.quantity}
                                                    </Text>
                                                    <Pressable
                                                        onPress={() => updateItemQuantity(item.productId, 1)}
                                                        disabled={item.quantity >= item.availableStock}
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: 8,
                                                            backgroundColor: item.quantity >= item.availableStock
                                                                ? colors.background.tertiary
                                                                : colors.surface.primary,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <Plus size={18} color={item.quantity >= item.availableStock ? colors.text.tertiary : colors.text.primary} />
                                                    </Pressable>
                                                </View>

                                                {item.quantity === item.availableStock && (
                                                    <Text style={{ color: colors.semantic.warning, fontSize: 12 }}>
                                                        Maksimum
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    ))}

                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            paddingTop: 12,
                                            borderTopWidth: 1,
                                            borderTopColor: colors.border.primary,
                                            marginTop: 8,
                                        }}
                                    >
                                        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                                            Toplam: {items.length} ürün
                                        </Text>
                                        <Text style={{ color: colors.modules.inventory, fontSize: 18, fontWeight: '700' }}>
                                            {getTotalQuantity()} adet
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {errors.items && (
                                <Text style={{ color: colors.semantic.error, fontSize: 12, marginTop: 8 }}>
                                    {errors.items}
                                </Text>
                            )}
                        </View>
                    </Animated.View>

                    {/* Notes */}
                    <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                        <View
                            style={{
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: colors.border.primary
                            }}
                        >
                            <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                                Notlar (Opsiyonel)
                            </Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'flex-start',
                                    backgroundColor: colors.background.tertiary,
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                }}
                            >
                                <FileText size={20} color={colors.text.tertiary} style={{ marginTop: 14 }} />
                                <TextInput
                                    value={formData.notes}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                                    placeholder="Transfer notları..."
                                    placeholderTextColor={colors.text.tertiary}
                                    multiline
                                    style={{
                                        flex: 1,
                                        paddingVertical: 14,
                                        paddingHorizontal: 12,
                                        color: colors.text.primary,
                                        fontSize: 15,
                                        minHeight: 80,
                                        textAlignVertical: 'top',
                                    }}
                                />
                            </View>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
