import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { StandardCard } from '../../components/StandardCard';
import { LinearGradient } from 'expo-linear-gradient';

export default function QuoteListScreen({ navigation }: any) {
    const { colors, theme } = useTheme();
    const [quotes, setQuotes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadQuotes();
    }, []);

    const loadQuotes = async () => {
        try {
            const response = await apiService.sales.getQuotes();
            if (response.data.success) {
                setQuotes(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load quotes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return colors.success;
            case 'draft': return colors.textSecondary;
            case 'sent': return colors.info;
            case 'rejected': return colors.error;
            default: return colors.primary;
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'Onaylandı';
            case 'draft': return 'Taslak';
            case 'sent': return 'Gönderildi';
            case 'rejected': return 'Reddedildi';
            default: return status;
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <StandardCard
            title={item.customerName || 'İsimsiz Müşteri'}
            subtitle={`Teklif No: ${item.quoteNumber}`}
            status={getStatusText(item.status)}
            statusColor={getStatusColor(item.status)}
            rightText={`₺${item.totalAmount?.toLocaleString('tr-TR')}`}
            icon="document-text"
            onPress={() => navigation.navigate('QuoteDetail', { id: item.id })}
        />
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {theme === 'dark' ? (
                <LinearGradient
                    colors={['#10b981', '#064e3b']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFill, { opacity: 0.1 }]}
                />
            ) : null}

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : colors.surface }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Teklifler</Text>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate('CreateQuote')}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={quotes}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        !isLoading ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Henüz teklif bulunmuyor</Text>
                            </View>
                        ) : null
                    }
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    } as ViewStyle,
    safeArea: {
        flex: 1,
    } as ViewStyle,
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.m,
    } as ViewStyle,
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    } as TextStyle,
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    listContent: {
        padding: spacing.l,
    } as ViewStyle,
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.xxl,
    } as ViewStyle,
    emptyText: {
        marginTop: spacing.m,
        fontSize: 16,
    } as TextStyle,
});
