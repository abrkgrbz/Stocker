import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useInventoryStore, StockCount } from '../../stores/inventoryStore';
import { apiService } from '../../services/api';
import { spacing } from '../../theme/theme';

export default function StockCountDetailScreen({ navigation, route }: any) {
    const { countId } = route.params;
    const { colors, theme } = useTheme();
    const { fetchStockCountDetails } = useInventoryStore();
    const [count, setCount] = useState<StockCount | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadCount();
    }, [countId]);

    const loadCount = async () => {
        setLoading(true);
        const data = await fetchStockCountDetails(countId);
        setCount(data);
        setLoading(false);
    };

    const handleUpdateCount = async (productId: number, quantity: string) => {
        const qty = parseInt(quantity);
        if (isNaN(qty)) return;

        setUpdating(true);
        try {
            await apiService.inventory.updateStockCount(countId, {
                items: [{ productId, countedQuantity: qty }]
            });
            // Refresh data
            const data = await fetchStockCountDetails(countId);
            setCount(data);
        } catch (error: any) {
            Alert.alert('Hata', 'Sayım güncellenemedi.');
        } finally {
            setUpdating(false);
        }
    };

    const handleComplete = async () => {
        Alert.alert(
            'Sayımı Tamamla',
            'Sayımı tamamlamak istediğinize emin misiniz? Bu işlem stokları güncelleyecektir.',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Tamamla',
                    onPress: async () => {
                        setUpdating(true);
                        try {
                            await apiService.inventory.completeStockCount(countId);
                            Alert.alert('Başarılı', 'Sayım tamamlandı.', [
                                { text: 'Tamam', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error: any) {
                            Alert.alert('Hata', 'Sayım tamamlanamadı.');
                        } finally {
                            setUpdating(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!count) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.textPrimary }}>Sayım bulunamadı</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Sayım Detayı</Text>
                {count.status === 'InProgress' && (
                    <TouchableOpacity onPress={handleComplete} disabled={updating}>
                        <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Info Card */}
                <View style={[styles.card, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
                    <Text style={[styles.warehouseName, { color: colors.textPrimary }]}>{count.warehouseName}</Text>
                    <Text style={[styles.date, { color: colors.textSecondary }]}>
                        {new Date(count.countDate).toLocaleDateString('tr-TR')}
                    </Text>
                    <Text style={[styles.status, { color: count.status === 'Completed' ? '#10b981' : '#3b82f6' }]}>
                        {count.status === 'Completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                    </Text>
                </View>

                {/* Items */}
                <View style={[styles.card, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Ürünler</Text>

                    {count.items.map((item) => (
                        <View key={item.id} style={[styles.itemRow, { borderBottomColor: colors.textSecondary + '20' }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.textPrimary, fontWeight: '500' }}>{item.productName}</Text>
                                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Beklenen: {item.expectedQuantity}</Text>
                            </View>

                            {count.status === 'InProgress' ? (
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={[styles.input, { color: colors.textPrimary, borderColor: colors.textSecondary + '40' }]}
                                        keyboardType="numeric"
                                        defaultValue={item.countedQuantity.toString()}
                                        onEndEditing={(e) => handleUpdateCount(item.productId, e.nativeEvent.text)}
                                    />
                                </View>
                            ) : (
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ color: colors.textPrimary, fontWeight: 'bold' }}>{item.countedQuantity}</Text>
                                    <Text style={{
                                        color: item.difference === 0 ? '#10b981' : item.difference < 0 ? '#ef4444' : '#f59e0b',
                                        fontSize: 12
                                    }}>
                                        Fark: {item.difference > 0 ? '+' : ''}{item.difference}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    },
    card: {
        padding: spacing.m,
        borderRadius: 12,
        marginBottom: spacing.m,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    warehouseName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        marginBottom: 8,
    },
    status: {
        fontSize: 14,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: spacing.m,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.m,
        borderBottomWidth: 1,
    },
    inputContainer: {
        width: 80,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        textAlign: 'center',
        fontSize: 16,
    },
});
