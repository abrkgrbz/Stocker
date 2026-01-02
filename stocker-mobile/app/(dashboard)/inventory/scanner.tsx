import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import {
    ArrowLeft,
    Flashlight,
    FlashlightOff,
    X,
    Package,
    Plus,
    Minus,
    Check,
    ScanLine
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import type { Product } from '@/lib/api/types/inventory.types';

// Mock product database for barcode lookup
const MOCK_PRODUCTS: Record<string, Product> = {
    '8691234567890': {
        id: '1',
        sku: 'PRD-001',
        barcode: '8691234567890',
        name: 'Laptop Dell Inspiron 15',
        description: '15.6" FHD, Intel Core i5, 8GB RAM, 256GB SSD',
        categoryName: 'Bilgisayarlar',
        brandName: 'Dell',
        unitName: 'Adet',
        price: 28500,
        cost: 24000,
        currency: 'TRY',
        stockQuantity: 15,
        minStockLevel: 5,
        status: 'active',
        createdAt: '2024-01-10',
        updatedAt: '2024-12-28'
    },
    '8691234567891': {
        id: '2',
        sku: 'PRD-002',
        barcode: '8691234567891',
        name: 'iPhone 15 Pro',
        description: '256GB, Natural Titanium',
        categoryName: 'Telefonlar',
        brandName: 'Apple',
        unitName: 'Adet',
        price: 75000,
        cost: 68000,
        currency: 'TRY',
        stockQuantity: 3,
        minStockLevel: 10,
        status: 'active',
        createdAt: '2024-02-15',
        updatedAt: '2024-12-29'
    },
    '8691234567892': {
        id: '3',
        sku: 'PRD-003',
        barcode: '8691234567892',
        name: 'Samsung Galaxy Tab S9',
        description: '11" AMOLED, 128GB',
        categoryName: 'Tabletler',
        brandName: 'Samsung',
        unitName: 'Adet',
        price: 22000,
        cost: 18500,
        currency: 'TRY',
        stockQuantity: 0,
        minStockLevel: 5,
        status: 'out_of_stock',
        createdAt: '2024-03-20',
        updatedAt: '2024-12-20'
    },
};

export default function BarcodeScannerScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [permission, requestPermission] = useCameraPermissions();
    const [torch, setTorch] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const lastScannedRef = useRef<string>('');
    const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (scanTimeoutRef.current) {
                clearTimeout(scanTimeoutRef.current);
            }
        };
    }, []);

    const handleBarCodeScanned = (result: BarcodeScanningResult) => {
        const { data } = result;

        // Prevent duplicate scans
        if (scanned || data === lastScannedRef.current) return;

        lastScannedRef.current = data;
        setScanned(true);

        // Haptic feedback
        Vibration.vibrate(100);

        // Look up product
        const product = MOCK_PRODUCTS[data];

        if (product) {
            setScannedProduct(product);
            setQuantity(1);
        } else {
            Alert.alert(
                'Ürün Bulunamadı',
                `Barkod: ${data}\n\nBu barkod sistemde kayıtlı değil. Yeni ürün eklemek ister misiniz?`,
                [
                    { text: 'İptal', onPress: resetScanner },
                    {
                        text: 'Yeni Ürün Ekle',
                        onPress: () => {
                            resetScanner();
                            router.push({
                                pathname: '/(dashboard)/inventory/add' as any,
                                params: { barcode: data }
                            });
                        }
                    }
                ]
            );
        }
    };

    const resetScanner = () => {
        setScanned(false);
        setScannedProduct(null);
        setQuantity(1);
        lastScannedRef.current = '';

        // Small delay before allowing next scan
        scanTimeoutRef.current = setTimeout(() => {
            lastScannedRef.current = '';
        }, 1000) as unknown as NodeJS.Timeout;
    };

    const handleUpdateStock = (type: 'add' | 'remove') => {
        if (!scannedProduct) return;

        const newStock = type === 'add'
            ? scannedProduct.stockQuantity + quantity
            : Math.max(0, scannedProduct.stockQuantity - quantity);

        Alert.alert(
            'Stok Güncelle',
            `${scannedProduct.name}\n\nMevcut: ${scannedProduct.stockQuantity} ${scannedProduct.unitName}\n${type === 'add' ? 'Ekle' : 'Çıkar'}: ${quantity}\nYeni: ${newStock} ${scannedProduct.unitName}`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Onayla',
                    onPress: () => {
                        // API call would go here
                        Alert.alert('Başarılı', 'Stok güncellendi');
                        resetScanner();
                    }
                }
            ]
        );
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(value);
    };

    const getStockStatusColor = (product: Product) => {
        if (product.stockQuantity === 0) return colors.semantic.error;
        if (product.stockQuantity <= (product.minStockLevel || 0)) return colors.semantic.warning;
        return colors.semantic.success;
    };

    // Permission handling
    if (!permission) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
                <View className="flex-1 items-center justify-center p-6">
                    <Text style={{ color: colors.text.primary }}>Kamera izni kontrol ediliyor...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
                <View className="flex-1 items-center justify-center p-6">
                    <View
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 20,
                            backgroundColor: colors.semantic.warningLight,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 24
                        }}
                    >
                        <ScanLine size={40} color={colors.semantic.warning} />
                    </View>
                    <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
                        Kamera İzni Gerekli
                    </Text>
                    <Text style={{ color: colors.text.secondary, fontSize: 15, textAlign: 'center', marginBottom: 24 }}>
                        Barkod taramak için kamera erişimine izin vermeniz gerekiyor.
                    </Text>
                    <Pressable
                        onPress={requestPermission}
                        style={{
                            backgroundColor: colors.brand.primary,
                            paddingHorizontal: 32,
                            paddingVertical: 14,
                            borderRadius: 12
                        }}
                    >
                        <Text style={{ color: colors.text.inverse, fontSize: 16, fontWeight: '600' }}>
                            İzin Ver
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => router.back()}
                        style={{ marginTop: 16 }}
                    >
                        <Text style={{ color: colors.text.tertiary, fontSize: 15 }}>Geri Dön</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                enableTorch={torch}
                barcodeScannerSettings={{
                    barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'code93', 'qr'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            {/* Overlay */}
            <View style={StyleSheet.absoluteFillObject}>
                {/* Top Bar */}
                <SafeAreaView edges={['top']}>
                    <Animated.View
                        entering={FadeIn.duration(300)}
                        className="flex-row items-center justify-between px-4 py-3"
                    >
                        <Pressable
                            onPress={() => router.back()}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <ArrowLeft size={24} color="#fff" />
                        </Pressable>

                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
                            Barkod Tara
                        </Text>

                        <Pressable
                            onPress={() => setTorch(!torch)}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: torch ? colors.semantic.warning : 'rgba(0,0,0,0.5)',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {torch ? (
                                <Flashlight size={24} color="#fff" />
                            ) : (
                                <FlashlightOff size={24} color="#fff" />
                            )}
                        </Pressable>
                    </Animated.View>
                </SafeAreaView>

                {/* Scan Area Frame */}
                {!scannedProduct && (
                    <View className="flex-1 items-center justify-center">
                        <View
                            style={{
                                width: 280,
                                height: 180,
                                borderWidth: 2,
                                borderColor: colors.brand.primary,
                                borderRadius: 16,
                                position: 'relative'
                            }}
                        >
                            {/* Corner decorations */}
                            <View style={{ position: 'absolute', top: -2, left: -2, width: 30, height: 30, borderTopWidth: 4, borderLeftWidth: 4, borderColor: colors.brand.primary, borderTopLeftRadius: 16 }} />
                            <View style={{ position: 'absolute', top: -2, right: -2, width: 30, height: 30, borderTopWidth: 4, borderRightWidth: 4, borderColor: colors.brand.primary, borderTopRightRadius: 16 }} />
                            <View style={{ position: 'absolute', bottom: -2, left: -2, width: 30, height: 30, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: colors.brand.primary, borderBottomLeftRadius: 16 }} />
                            <View style={{ position: 'absolute', bottom: -2, right: -2, width: 30, height: 30, borderBottomWidth: 4, borderRightWidth: 4, borderColor: colors.brand.primary, borderBottomRightRadius: 16 }} />

                            {/* Scan line animation would go here */}
                            <View
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: 20,
                                    right: 20,
                                    height: 2,
                                    backgroundColor: colors.brand.primary,
                                    opacity: 0.8
                                }}
                            />
                        </View>
                        <Text style={{ color: '#fff', fontSize: 14, marginTop: 16, textAlign: 'center' }}>
                            Barkodu çerçeve içine hizalayın
                        </Text>
                    </View>
                )}

                {/* Scanned Product Card */}
                {scannedProduct && (
                    <Animated.View
                        entering={FadeInDown.duration(400)}
                        exiting={FadeOut.duration(200)}
                        className="flex-1 justify-end"
                    >
                        <View
                            style={{
                                backgroundColor: colors.surface.primary,
                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                                padding: 20,
                                paddingBottom: 40
                            }}
                        >
                            {/* Close button */}
                            <Pressable
                                onPress={resetScanner}
                                style={{
                                    position: 'absolute',
                                    top: 12,
                                    right: 12,
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    backgroundColor: colors.background.tertiary,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={18} color={colors.text.tertiary} />
                            </Pressable>

                            {/* Product Info */}
                            <View className="flex-row mb-4">
                                <View
                                    style={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: 12,
                                        backgroundColor: colors.modules.inventoryLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}
                                >
                                    <Package size={28} color={colors.modules.inventory} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.text.primary, fontSize: 17, fontWeight: '600' }} numberOfLines={2}>
                                        {scannedProduct.name}
                                    </Text>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 13, marginTop: 2 }}>
                                        SKU: {scannedProduct.sku} • {scannedProduct.barcode}
                                    </Text>
                                    <View className="flex-row items-center mt-2">
                                        <View
                                            style={{
                                                backgroundColor: getStockStatusColor(scannedProduct) + '20',
                                                paddingHorizontal: 8,
                                                paddingVertical: 2,
                                                borderRadius: 4
                                            }}
                                        >
                                            <Text style={{ color: getStockStatusColor(scannedProduct), fontSize: 12, fontWeight: '600' }}>
                                                Stok: {scannedProduct.stockQuantity} {scannedProduct.unitName}
                                            </Text>
                                        </View>
                                        <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '700', marginLeft: 12 }}>
                                            {formatCurrency(scannedProduct.price)}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Quantity Selector */}
                            <View
                                style={{
                                    backgroundColor: colors.background.tertiary,
                                    borderRadius: 12,
                                    padding: 16,
                                    marginBottom: 16
                                }}
                            >
                                <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 12 }}>
                                    İşlem Miktarı
                                </Text>
                                <View className="flex-row items-center justify-center">
                                    <Pressable
                                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 12,
                                            backgroundColor: colors.surface.primary,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderWidth: 1,
                                            borderColor: colors.border.primary
                                        }}
                                    >
                                        <Minus size={20} color={colors.text.primary} />
                                    </Pressable>
                                    <Text style={{ color: colors.text.primary, fontSize: 28, fontWeight: '700', marginHorizontal: 32 }}>
                                        {quantity}
                                    </Text>
                                    <Pressable
                                        onPress={() => setQuantity(quantity + 1)}
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 12,
                                            backgroundColor: colors.surface.primary,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderWidth: 1,
                                            borderColor: colors.border.primary
                                        }}
                                    >
                                        <Plus size={20} color={colors.text.primary} />
                                    </Pressable>
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View className="flex-row">
                                <Pressable
                                    onPress={() => handleUpdateStock('remove')}
                                    style={{
                                        flex: 1,
                                        backgroundColor: colors.semantic.errorLight,
                                        borderRadius: 12,
                                        paddingVertical: 14,
                                        alignItems: 'center',
                                        marginRight: 8
                                    }}
                                >
                                    <View className="flex-row items-center">
                                        <Minus size={18} color={colors.semantic.error} />
                                        <Text style={{ color: colors.semantic.error, fontSize: 15, fontWeight: '600', marginLeft: 6 }}>
                                            Stok Çıkışı
                                        </Text>
                                    </View>
                                </Pressable>
                                <Pressable
                                    onPress={() => handleUpdateStock('add')}
                                    style={{
                                        flex: 1,
                                        backgroundColor: colors.semantic.success,
                                        borderRadius: 12,
                                        paddingVertical: 14,
                                        alignItems: 'center',
                                        marginLeft: 8
                                    }}
                                >
                                    <View className="flex-row items-center">
                                        <Plus size={18} color="#fff" />
                                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 6 }}>
                                            Stok Girişi
                                        </Text>
                                    </View>
                                </Pressable>
                            </View>

                            {/* View Product Details */}
                            <Pressable
                                onPress={() => {
                                    resetScanner();
                                    router.push(`/(dashboard)/inventory/${scannedProduct.id}` as any);
                                }}
                                style={{
                                    marginTop: 12,
                                    paddingVertical: 12,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: colors.brand.primary, fontSize: 15, fontWeight: '600' }}>
                                    Ürün Detaylarını Gör
                                </Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                )}
            </View>
        </View>
    );
}
