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
    ShoppingCart,
    Save,
    User,
    Package,
    Plus,
    Minus,
    Trash2,
    ChevronDown,
    Calendar,
    FileText
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useCreateOrder } from '@/lib/api/hooks/useSales';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import { useProducts } from '@/lib/api/hooks/useInventory';
import type { CreateOrderItemRequest } from '@/lib/api/types/sales.types';

interface OrderItem extends CreateOrderItemRequest {
    productName?: string;
}

export default function AddOrderScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const { mutate: createOrder, isPending } = useCreateOrder();
    const { data: customersData } = useCustomers({ pageSize: 100 });
    const { data: productsData } = useProducts({ pageSize: 100 });

    const customers = customersData?.items || [];
    const products = productsData?.items || [];

    const [formData, setFormData] = useState({
        customerId: '',
        deliveryDate: '',
        notes: '',
    });

    const [items, setItems] = useState<OrderItem[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showCustomerPicker, setShowCustomerPicker] = useState(false);
    const [showProductPicker, setShowProductPicker] = useState(false);

    const selectedCustomer = customers.find(c => c.id === formData.customerId);

    const addItem = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = items.find(i => i.productId === productId);
        if (existingItem) {
            setItems(items.map(i =>
                i.productId === productId
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            ));
        } else {
            setItems([...items, {
                productId,
                productName: product.name,
                quantity: 1,
                unitPrice: product.price,
                discountPercent: 0,
                taxPercent: 18,
            }]);
        }
        setShowProductPicker(false);
    };

    const updateItemQuantity = (productId: string, delta: number) => {
        setItems(items.map(item => {
            if (item.productId === productId) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeItem = (productId: string) => {
        setItems(items.filter(i => i.productId !== productId));
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => {
            const subtotal = item.quantity * item.unitPrice;
            const discount = subtotal * ((item.discountPercent || 0) / 100);
            const afterDiscount = subtotal - discount;
            const tax = afterDiscount * ((item.taxPercent || 0) / 100);
            return total + afterDiscount + tax;
        }, 0);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(value);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.customerId) {
            newErrors.customerId = 'Müşteri seçimi zorunludur';
        }
        if (items.length === 0) {
            newErrors.items = 'En az bir ürün eklemelisiniz';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        createOrder(
            {
                customerId: formData.customerId,
                deliveryDate: formData.deliveryDate || undefined,
                notes: formData.notes.trim() || undefined,
                items: items.map(({ productName, ...item }) => item),
            },
            {
                onSuccess: () => {
                    Alert.alert('Başarılı', 'Sipariş başarıyla oluşturuldu', [
                        { text: 'Tamam', onPress: () => router.back() }
                    ]);
                },
                onError: () => {
                    Alert.alert('Hata', 'Sipariş oluşturulurken bir hata oluştu');
                }
            }
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
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
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                            <Pressable onPress={() => router.back()} className="mr-3 p-2 -ml-2">
                                <ArrowLeft size={24} color={colors.text.primary} />
                            </Pressable>
                            <View>
                                <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>
                                    Yeni Sipariş
                                </Text>
                                <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                    Satış
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            onPress={handleSubmit}
                            disabled={isPending}
                            style={{
                                backgroundColor: colors.brand.primary,
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
                    {/* Customer Selection */}
                    <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                        <View
                            style={{
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: errors.customerId ? colors.semantic.error : colors.border.primary
                            }}
                        >
                            <View className="flex-row items-center mb-4">
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: colors.modules.crmLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}
                                >
                                    <User size={20} color={colors.modules.crm} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                    Müşteri *
                                </Text>
                            </View>

                            <Pressable
                                onPress={() => setShowCustomerPicker(!showCustomerPicker)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    backgroundColor: colors.background.tertiary,
                                    borderRadius: 12,
                                    padding: 14,
                                }}
                            >
                                <Text style={{
                                    color: selectedCustomer ? colors.text.primary : colors.text.tertiary,
                                    fontSize: 15
                                }}>
                                    {selectedCustomer?.name || 'Müşteri seçin'}
                                </Text>
                                <ChevronDown size={20} color={colors.text.tertiary} />
                            </Pressable>

                            {showCustomerPicker && (
                                <View style={{ marginTop: 8, maxHeight: 200 }}>
                                    <ScrollView nestedScrollEnabled>
                                        {customers.map((customer) => (
                                            <Pressable
                                                key={customer.id}
                                                onPress={() => {
                                                    setFormData(prev => ({ ...prev, customerId: customer.id }));
                                                    setShowCustomerPicker(false);
                                                }}
                                                style={{
                                                    padding: 12,
                                                    borderRadius: 8,
                                                    backgroundColor: formData.customerId === customer.id
                                                        ? colors.brand.primary + '20'
                                                        : 'transparent',
                                                }}
                                            >
                                                <Text style={{
                                                    color: formData.customerId === customer.id
                                                        ? colors.brand.primary
                                                        : colors.text.primary,
                                                    fontSize: 14,
                                                    fontWeight: '500'
                                                }}>
                                                    {customer.name}
                                                </Text>
                                                {customer.company && (
                                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                                        {customer.company}
                                                    </Text>
                                                )}
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {errors.customerId && (
                                <Text style={{ color: colors.semantic.error, fontSize: 12, marginTop: 8 }}>
                                    {errors.customerId}
                                </Text>
                            )}
                        </View>
                    </Animated.View>

                    {/* Order Items */}
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
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center">
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
                                        <ShoppingCart size={20} color={colors.modules.inventory} />
                                    </View>
                                    <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                        Ürünler *
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={() => setShowProductPicker(!showProductPicker)}
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

                            {showProductPicker && (
                                <View style={{ marginBottom: 16, maxHeight: 200, backgroundColor: colors.background.tertiary, borderRadius: 12, padding: 8 }}>
                                    <ScrollView nestedScrollEnabled>
                                        {products.map((product) => (
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
                                                        SKU: {product.sku} • Stok: {product.stockQuantity}
                                                    </Text>
                                                </View>
                                                <Text style={{ color: colors.brand.primary, fontWeight: '600' }}>
                                                    {formatCurrency(product.price)}
                                                </Text>
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
                                            <View className="flex-row items-center justify-between mb-2">
                                                <Text style={{ color: colors.text.primary, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                                                    {item.productName}
                                                </Text>
                                                <Pressable onPress={() => removeItem(item.productId)}>
                                                    <Trash2 size={18} color={colors.semantic.error} />
                                                </Pressable>
                                            </View>

                                            <View className="flex-row items-center justify-between">
                                                <View className="flex-row items-center">
                                                    <Pressable
                                                        onPress={() => updateItemQuantity(item.productId, -1)}
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
                                                    <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginHorizontal: 16 }}>
                                                        {item.quantity}
                                                    </Text>
                                                    <Pressable
                                                        onPress={() => updateItemQuantity(item.productId, 1)}
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

                                                <Text style={{ color: colors.text.primary, fontWeight: '700' }}>
                                                    {formatCurrency(item.quantity * item.unitPrice)}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}

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
                                        <Text style={{ color: colors.text.secondary, fontSize: 16, fontWeight: '600' }}>
                                            Toplam
                                        </Text>
                                        <Text style={{ color: colors.brand.primary, fontSize: 20, fontWeight: '700' }}>
                                            {formatCurrency(calculateTotal())}
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

                    {/* Delivery Date & Notes */}
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
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                                    Teslimat Tarihi (Opsiyonel)
                                </Text>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: colors.background.tertiary,
                                        borderRadius: 12,
                                        paddingHorizontal: 12,
                                    }}
                                >
                                    <Calendar size={20} color={colors.text.tertiary} />
                                    <TextInput
                                        value={formData.deliveryDate}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, deliveryDate: text }))}
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor={colors.text.tertiary}
                                        style={{
                                            flex: 1,
                                            paddingVertical: 14,
                                            paddingHorizontal: 12,
                                            color: colors.text.primary,
                                            fontSize: 15,
                                        }}
                                    />
                                </View>
                            </View>

                            <View>
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
                                        placeholder="Sipariş notları..."
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
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
