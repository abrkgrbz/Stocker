import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { Loading } from '../../components/Loading';
import { LinearGradient } from 'expo-linear-gradient';

export default function DealDetailScreen({ route, navigation }: any) {
    const { id, title } = route.params;
    const [deal, setDeal] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDeal = async () => {
            try {
                const response = await apiService.crm.getDeal(id);
                if (response.data && response.data.success) {
                    setDeal(response.data.data);
                }
            } catch (error) {
                console.error('Failed to load deal details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDeal();
    }, [id]);

    if (isLoading) return <Loading visible={true} />;

    if (!deal) return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#28002D', '#1A315A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Fırsat</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Fırsat bilgileri yüklenemedi.</Text>
                </View>
            </SafeAreaView>
        </View>
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Won': return colors.success;
            case 'Lost': return colors.error;
            case 'Negotiation': return colors.warning;
            default: return colors.primary;
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#28002D', '#1A315A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('AddDeal', { id: deal.id })}
                    >
                        <Ionicons name="create-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Main Info Card */}
                    <View style={styles.card}>
                        <View style={styles.dealHeader}>
                            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                                <Ionicons name="briefcase" size={32} color={colors.primary} />
                            </View>
                            <Text style={styles.dealValue}>
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(deal.value || 0)}
                            </Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(deal.stage) + '20' }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(deal.stage) }]}>
                                    {deal.stage}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Müşteri</Text>
                            <Text style={styles.value}>{deal.customerName}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Olasılık</Text>
                            <Text style={styles.value}>%{deal.probability || 0}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Kapanış Tarihi</Text>
                            <Text style={styles.value}>{new Date(deal.expectedCloseDate || deal.createdAt).toLocaleDateString('tr-TR')}</Text>
                        </View>
                    </View>

                    {/* Description */}
                    {deal.description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Açıklama</Text>
                            <View style={styles.card}>
                                <Text style={styles.descriptionText}>{deal.description}</Text>
                            </View>
                        </View>
                    )}

                </ScrollView>
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
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    } as ViewStyle,
    editButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    } as ViewStyle,
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: spacing.m,
    } as TextStyle,
    content: {
        padding: spacing.m,
    } as ViewStyle,
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.l,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
        marginBottom: spacing.l,
    } as ViewStyle,
    dealHeader: {
        alignItems: 'center',
        marginBottom: spacing.l,
    } as ViewStyle,
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.m,
    } as ViewStyle,
    dealValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.s,
    } as TextStyle,
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    } as ViewStyle,
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
    } as TextStyle,
    divider: {
        height: 1,
        backgroundColor: colors.surfaceLight,
        marginVertical: spacing.m,
    } as ViewStyle,
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.s,
    } as ViewStyle,
    label: {
        fontSize: 14,
        color: colors.textSecondary,
    } as TextStyle,
    value: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.textPrimary,
    } as TextStyle,
    section: {
        marginBottom: spacing.l,
    } as ViewStyle,
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.s,
        marginLeft: spacing.s,
    } as TextStyle,
    descriptionText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    } as TextStyle,
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    emptyText: {
        color: colors.textSecondary,
    } as TextStyle,
});
