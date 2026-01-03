import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    ArrowLeft,
    Package,
    Save,
    Barcode,
    Tag,
    DollarSign,
    Boxes,
    FileText,
    ChevronDown
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useProduct, useUpdateProduct, useCategories } from '@/lib/api/hooks/useInventory';

export default function EditProductScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const { data: product, isLoading: isLoadingProduct } = useProduct(id || '');
    const { mutate: updateProduct, isPending } = useUpdateProduct();
    const { data: categories } = useCategories();

    const [formData, setFormData] = useState({
        sku: '',
        barcode: '',
        name: '',
        description: '',
        categoryId: '',
        price: '',
        cost: '',
        minStockLevel: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                sku: product.sku || '',
                barcode: product.barcode || '',
                name: product.name || '',
                description: product.description || '',
                categoryId: product.categoryId || '',
                price: product.price?.toString() || '',
                cost: product.cost?.toString() || '',
                minStockLevel: product.minStockLevel?.toString() || '',
            });
        }
    }, [product]);

    const selectedCategory = categories?.find(c => c.id === formData.categoryId);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.sku.trim()) {
            newErrors.sku = 'SKU zorunludur';
        }
        if (!formData.name.trim()) {
            newErrors.name = 'Ürün adı zorunludur';
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Geçerli bir fiyat girin';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        updateProduct(
            {
                id: id || '',
                data: {
                    sku: formData.sku.trim(),
                    barcode: formData.barcode.trim() || undefined,
                    name: formData.name.trim(),
                    description: formData.description.trim() || undefined,
                    categoryId: formData.categoryId || undefined,
                    price: parseFloat(formData.price),
                    cost: formData.cost ? parseFloat(formData.cost) : undefined,
                    minStockLevel: formData.minStockLevel ? parseInt(formData.minStockLevel, 10) : undefined,
                }
            },
            {
                onSuccess: () => {
                    Alert.alert('Başarılı', 'Ürün başarıyla güncellendi', [
                        { text: 'Tamam', onPress: () => router.back() }
                    ]);
                },
                onError: () => {
                    Alert.alert('Hata', 'Ürün güncellenirken bir hata oluştu');
                }
            }
        );
    };

    const FormInput = ({
        label,
        value,
        onChangeText,
        placeholder,
        error,
        keyboardType = 'default',
        icon: Icon,
        multiline = false,
    }: {
        label: string;
        value: string;
        onChangeText: (text: string) => void;
        placeholder: string;
        error?: string;
        keyboardType?: 'default' | 'numeric' | 'decimal-pad';
        icon: any;
        multiline?: boolean;
    }) => (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                {label}
            </Text>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.surface.primary,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: error ? colors.semantic.error : colors.border.primary,
                    paddingHorizontal: 12,
                }}
            >
                <Icon size={20} color={colors.text.tertiary} />
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType={keyboardType}
                    multiline={multiline}
                    style={{
                        flex: 1,
                        paddingVertical: 14,
                        paddingHorizontal: 12,
                        color: colors.text.primary,
                        fontSize: 15,
                        minHeight: multiline ? 80 : undefined,
                        textAlignVertical: multiline ? 'top' : 'center',
                    }}
                />
            </View>
            {error && (
                <Text style={{ color: colors.semantic.error, fontSize: 12, marginTop: 4 }}>
                    {error}
                </Text>
            )}
        </View>
    );

    if (isLoadingProduct) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.brand.primary} />
                    <Text style={{ color: colors.text.secondary, marginTop: 12 }}>
                        Ürün yükleniyor...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

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
                                    Ürünü Düzenle
                                </Text>
                                <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                    {product?.sku || id}
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
                                        Kaydet
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
                    {/* Basic Info */}
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
                            <View className="flex-row items-center mb-4">
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
                                    Temel Bilgiler
                                </Text>
                            </View>

                            <FormInput
                                label="SKU *"
                                value={formData.sku}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, sku: text }))}
                                placeholder="Ör: PRD-001"
                                error={errors.sku}
                                icon={Tag}
                            />

                            <FormInput
                                label="Barkod"
                                value={formData.barcode}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, barcode: text }))}
                                placeholder="Ör: 8691234567890"
                                icon={Barcode}
                            />

                            <FormInput
                                label="Ürün Adı *"
                                value={formData.name}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                                placeholder="Ürün adını girin"
                                error={errors.name}
                                icon={Package}
                            />

                            <FormInput
                                label="Açıklama"
                                value={formData.description}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                                placeholder="Ürün açıklaması (opsiyonel)"
                                icon={FileText}
                                multiline
                            />
                        </View>
                    </Animated.View>

                    {/* Category */}
                    <Animated.View entering={FadeInDown.duration(400).delay(150)}>
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
                            <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                                Kategori
                            </Text>
                            <Pressable
                                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
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
                                    color: selectedCategory ? colors.text.primary : colors.text.tertiary,
                                    fontSize: 15
                                }}>
                                    {selectedCategory?.name || 'Kategori seçin'}
                                </Text>
                                <ChevronDown size={20} color={colors.text.tertiary} />
                            </Pressable>

                            {showCategoryPicker && categories && (
                                <View style={{ marginTop: 8 }}>
                                    {categories.map((category) => (
                                        <Pressable
                                            key={category.id}
                                            onPress={() => {
                                                setFormData(prev => ({ ...prev, categoryId: category.id }));
                                                setShowCategoryPicker(false);
                                            }}
                                            style={{
                                                padding: 12,
                                                borderRadius: 8,
                                                backgroundColor: formData.categoryId === category.id
                                                    ? colors.brand.primary + '20'
                                                    : 'transparent',
                                            }}
                                        >
                                            <Text style={{
                                                color: formData.categoryId === category.id
                                                    ? colors.brand.primary
                                                    : colors.text.primary,
                                                fontSize: 14
                                            }}>
                                                {category.name}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>
                    </Animated.View>

                    {/* Pricing */}
                    <Animated.View entering={FadeInDown.duration(400).delay(200)}>
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
                            <View className="flex-row items-center mb-4">
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: colors.semantic.successLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}
                                >
                                    <DollarSign size={20} color={colors.semantic.success} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                    Fiyatlandırma
                                </Text>
                            </View>

                            <View className="flex-row">
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <FormInput
                                        label="Satış Fiyatı *"
                                        value={formData.price}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                                        placeholder="0.00"
                                        error={errors.price}
                                        keyboardType="decimal-pad"
                                        icon={DollarSign}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <FormInput
                                        label="Maliyet"
                                        value={formData.cost}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, cost: text }))}
                                        placeholder="0.00"
                                        keyboardType="decimal-pad"
                                        icon={DollarSign}
                                    />
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Stock Settings */}
                    <Animated.View entering={FadeInDown.duration(400).delay(250)}>
                        <View
                            style={{
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: colors.border.primary
                            }}
                        >
                            <View className="flex-row items-center mb-4">
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: colors.semantic.warningLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}
                                >
                                    <Boxes size={20} color={colors.semantic.warning} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                    Stok Ayarları
                                </Text>
                            </View>

                            <FormInput
                                label="Minimum Stok Seviyesi"
                                value={formData.minStockLevel}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, minStockLevel: text }))}
                                placeholder="Ör: 10"
                                keyboardType="numeric"
                                icon={Boxes}
                            />
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
