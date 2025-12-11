import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useInventoryStore, Warehouse, Product } from '../../stores/inventoryStore';
import { apiService } from '../../services/api';
import { spacing } from '../../theme/theme';

export default function CreateStockTransferScreen({ navigation }: any) {
    const { colors, theme } = useTheme();
    const { warehouses, products, fetchWarehouses, fetchProducts } = useInventoryStore();

    const [sourceWarehouseId, setSourceWarehouseId] = useState<number | null>(null);
    const [destinationWarehouseId, setDestinationWarehouseId] = useState<number | null>(null);
    const [selectedItems, setSelectedItems] = useState<{ productId: number; quantity: number; productName: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reference, setReference] = useState('');
    const [description, setDescription] = useState('');

    // Modal states for selection (simplified for this example)
    const [showWarehouseSelector, setShowWarehouseSelector] = useState<'source' | 'destination' | null>(null);
    const [showProductSelector, setShowProductSelector] = useState(false);

    useEffect(() => {
        fetchWarehouses();
        fetchProducts();
    }, []);

    const handleAddItem = (product: Product) => {
        if (selectedItems.some(item => item.productId === product.id)) {
            Alert.alert('Uyarı', 'Bu ürün zaten listeye eklenmiş.');
            return;
        }
        setSelectedItems([...selectedItems, { productId: product.id, quantity: 1, productName: product.name }]);
        setShowProductSelector(false);
    };

    const handleUpdateQuantity = (productId: number, quantity: string) => {
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty < 1) return;

        setSelectedItems(selectedItems.map(item =>
            item.productId === productId ? { ...item, quantity: qty } : item
        ));
    };

    const handleRemoveItem = (productId: number) => {
        setSelectedItems(selectedItems.filter(item => item.productId !== productId));
    };

    const handleSubmit = async () => {
        if (!sourceWarehouseId || !destinationWarehouseId) {
            Alert.alert('Hata', 'Lütfen çıkış ve varış depolarını seçin.');
            return;
        }
        if (sourceWarehouseId === destinationWarehouseId) {
            Alert.alert('Hata', 'Çıkış ve varış depoları aynı olamaz.');
            return;
        }
        if (selectedItems.length === 0) {
            Alert.alert('Hata', 'Lütfen en az bir ürün ekleyin.');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                sourceWarehouseId,
                destinationWarehouseId,
                reference,
                description,
                items: selectedItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            };

            const response = await apiService.inventory.createStockTransfer(payload);
            if (response.data?.success) {
                Alert.alert('Başarılı', 'Transfer oluşturuldu.', [
                    { text: 'Tamam', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Hata', response.data?.message || 'Transfer oluşturulamadı.');
            }
        } catch (error: any) {
            Alert.alert('Hata', error.message || 'Bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderWarehouseSelector = () => {
        if (!showWarehouseSelector) return null;

        return (
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Depo Seç</Text>
                    <ScrollView style={{ maxHeight: 300 }}>
                        {warehouses.map(w => (
                            <TouchableOpacity
                                key={w.id}
                                style={styles.modalItem}
                                onPress={() => {
                                    if (showWarehouseSelector === 'source') setSourceWarehouseId(w.id);
                                    else setDestinationWarehouseId(w.id);
                                    setShowWarehouseSelector(null);
                                }}
                            >
                                <Text style={{ color: colors.textPrimary }}>{w.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: colors.background }]}
                        onPress={() => setShowWarehouseSelector(null)}
                    >
                        <Text style={{ color: colors.textPrimary }}>Kapat</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderProductSelector = () => {
        if (!showProductSelector) return null;

        return (
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Ürün Seç</Text>
                    <ScrollView style={{ maxHeight: 400 }}>
                        {products.map(p => (
                            <TouchableOpacity
                                key={p.id}
                                style={styles.modalItem}
                                onPress={() => handleAddItem(p)}
                            >
                                <Text style={{ color: colors.textPrimary, fontWeight: 'bold' }}>{p.name}</Text>
                                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{p.code} - Stok: {p.currentStock}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: colors.background }]}
                        onPress={() => setShowProductSelector(false)}
                    >
                        <Text style={{ color: colors.textPrimary }}>Kapat</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Yeni Transfer</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Warehouses */}
                <View style={[styles.section, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Depo Bilgileri</Text>

                    <TouchableOpacity
                        style={[styles.selector, { borderColor: colors.textSecondary + '40' }]}
                        onPress={() => setShowWarehouseSelector('source')}
                    >
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Çıkış Deposu</Text>
                        <Text style={[styles.value, { color: sourceWarehouseId ? colors.textPrimary : colors.textSecondary }]}>
                            {warehouses.find(w => w.id === sourceWarehouseId)?.name || 'Seçiniz'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.selector, { borderColor: colors.textSecondary + '40' }]}
                        onPress={() => setShowWarehouseSelector('destination')}
                    >
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Varış Deposu</Text>
                        <Text style={[styles.value, { color: destinationWarehouseId ? colors.textPrimary : colors.textSecondary }]}>
                            {warehouses.find(w => w.id === destinationWarehouseId)?.name || 'Seçiniz'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Details */}
                <View style={[styles.section, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Detaylar</Text>
                    <TextInput
                        style={[styles.input, { color: colors.textPrimary, borderColor: colors.textSecondary + '40' }]}
                        placeholder="Referans No (Opsiyonel)"
                        placeholderTextColor={colors.textSecondary}
                        value={reference}
                        onChangeText={setReference}
                    />
                    <TextInput
                        style={[styles.input, { color: colors.textPrimary, borderColor: colors.textSecondary + '40' }]}
                        placeholder="Açıklama (Opsiyonel)"
                        placeholderTextColor={colors.textSecondary}
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {/* Items */}
                <View style={[styles.section, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>Ürünler</Text>
                        <TouchableOpacity onPress={() => setShowProductSelector(true)}>
                            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>+ Ekle</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedItems.map((item, index) => (
                        <View key={item.productId} style={[styles.itemRow, { borderBottomColor: colors.textSecondary + '20' }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.textPrimary, fontWeight: '500' }}>{item.productName}</Text>
                            </View>
                            <View style={styles.quantityContainer}>
                                <TextInput
                                    style={[styles.quantityInput, { color: colors.textPrimary, borderColor: colors.textSecondary + '40' }]}
                                    keyboardType="numeric"
                                    value={item.quantity.toString()}
                                    onChangeText={(text) => handleUpdateQuantity(item.productId, text)}
                                />
                                <TouchableOpacity onPress={() => handleRemoveItem(item.productId)} style={{ marginLeft: 8 }}>
                                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    {selectedItems.length === 0 && (
                        <Text style={{ color: colors.textSecondary, textAlign: 'center', padding: 20 }}>
                            Henüz ürün eklenmedi.
                        </Text>
                    )}
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 }]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Transfer Oluştur</Text>
                    )}
                </TouchableOpacity>
            </View>

            {renderWarehouseSelector()}
            {renderProductSelector()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.m,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: spacing.m,
        paddingBottom: 100,
    },
    section: {
        padding: spacing.m,
        borderRadius: 12,
        marginBottom: spacing.m,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: spacing.m,
    },
    selector: {
        padding: spacing.m,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: spacing.s,
    },
    label: {
        fontSize: 12,
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
    },
    input: {
        padding: spacing.m,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: spacing.s,
        fontSize: 16,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.s,
        borderBottomWidth: 1,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityInput: {
        width: 60,
        padding: 8,
        borderWidth: 1,
        borderRadius: 8,
        textAlign: 'center',
    },
    footer: {
        padding: spacing.m,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    submitButton: {
        padding: spacing.m,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        borderRadius: 12,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    closeButton: {
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
});
