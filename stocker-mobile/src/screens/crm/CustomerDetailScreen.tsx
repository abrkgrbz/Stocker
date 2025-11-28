import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { Loading } from '../../components/Loading';
import { LinearGradient } from 'expo-linear-gradient';

export default function CustomerDetailScreen({ route, navigation }: any) {
    const { id, name } = route.params;
    const [customer, setCustomer] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadCustomer = async () => {
            try {
                const response = await apiService.crm.getCustomer(id);
                if (response.data) {
                    setCustomer(response.data);
                }
            } catch (error) {
                console.error('Failed to load customer details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCustomer();
    }, [id]);

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    const handleEmail = (email: string) => {
        Linking.openURL(`mailto:${email}`);
    };

    const handleWebsite = (website: string) => {
        if (!website) return;
        let url = website;
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }
        Linking.openURL(url);
    };

    if (isLoading) return <Loading visible={true} />;

    if (!customer) return (
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
                    <Text style={styles.headerTitle}>Müşteri</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Müşteri bilgileri yüklenemedi.</Text>
                </View>
            </SafeAreaView>
        </View>
    );

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
                    <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('AddCustomer', { id: customer.id })}
                    >
                        <Ionicons name="create-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {customer.companyName?.substring(0, 2).toUpperCase()}
                            </Text>
                        </View>
                        <Text style={styles.companyName}>{customer.companyName}</Text>
                        <Text style={styles.customerType}>{customer.customerType === 'Corporate' ? 'Kurumsal' : 'Bireysel'}</Text>

                        <View style={styles.actionButtons}>
                            {customer.phone && (
                                <TouchableOpacity style={styles.actionButton} onPress={() => handleCall(customer.phone)}>
                                    <LinearGradient
                                        colors={colors.gradientGreen as [string, string]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.iconCircle}
                                    >
                                        <Ionicons name="call" size={20} color="#fff" />
                                    </LinearGradient>
                                    <Text style={styles.actionText}>Ara</Text>
                                </TouchableOpacity>
                            )}
                            {customer.email && (
                                <TouchableOpacity style={styles.actionButton} onPress={() => handleEmail(customer.email)}>
                                    <LinearGradient
                                        colors={colors.gradientViolet as [string, string]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.iconCircle}
                                    >
                                        <Ionicons name="mail" size={20} color="#fff" />
                                    </LinearGradient>
                                    <Text style={styles.actionText}>E-posta</Text>
                                </TouchableOpacity>
                            )}
                            {customer.website && (
                                <TouchableOpacity style={styles.actionButton} onPress={() => handleWebsite(customer.website)}>
                                    <LinearGradient
                                        colors={colors.gradientCyan as [string, string]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.iconCircle}
                                    >
                                        <Ionicons name="globe" size={20} color="#fff" />
                                    </LinearGradient>
                                    <Text style={styles.actionText}>Web</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Details Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>İletişim Bilgileri</Text>
                        <View style={styles.infoCard}>
                            <InfoRow icon="person-outline" label="Yetkili" value={customer.contactPerson} />
                            <InfoRow icon="call-outline" label="Telefon" value={customer.phone} />
                            <InfoRow icon="mail-outline" label="E-posta" value={customer.email} />
                            <InfoRow icon="globe-outline" label="Web Sitesi" value={customer.website} />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Adres Bilgileri</Text>
                        <View style={styles.infoCard}>
                            <InfoRow icon="location-outline" label="Adres" value={customer.address} />
                            <InfoRow icon="map-outline" label="Şehir/Ülke" value={`${customer.city || ''} / ${customer.country || ''}`} />
                        </View>
                    </View>

                    {customer.notes && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Notlar</Text>
                            <View style={styles.infoCard}>
                                <Text style={styles.noteText}>{customer.notes}</Text>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const InfoRow = ({ icon, label, value }: any) => {
    if (!value) return null;
    return (
        <View style={styles.infoRow}>
            <Ionicons name={icon} size={20} color={colors.textMuted} style={styles.infoIcon as TextStyle} />
            <View>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );
};

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
    profileCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.l,
        alignItems: 'center',
        marginBottom: spacing.l,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    } as ViewStyle,
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.m,
    } as ViewStyle,
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
    } as TextStyle,
    companyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4,
        textAlign: 'center',
    } as TextStyle,
    customerType: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: spacing.l,
    } as TextStyle,
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.xl,
        width: '100%',
    } as ViewStyle,
    actionButton: {
        alignItems: 'center',
    } as ViewStyle,
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.s,
    } as ViewStyle,
    actionText: {
        fontSize: 12,
        color: colors.textSecondary,
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
    infoCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.m,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    } as ViewStyle,
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.m,
    } as ViewStyle,
    infoIcon: {
        marginRight: spacing.m,
    } as ViewStyle,
    infoLabel: {
        fontSize: 12,
        color: colors.textMuted,
        marginBottom: 2,
    } as TextStyle,
    infoValue: {
        fontSize: 14,
        color: colors.textPrimary,
    } as TextStyle,
    noteText: {
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
