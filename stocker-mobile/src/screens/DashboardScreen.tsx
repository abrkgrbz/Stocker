import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Modal,
    TouchableWithoutFeedback,
    Alert,
    ViewStyle,
    TextStyle,
    ImageStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../stores/authStore';
import { colors, spacing, typography } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface ModuleCard {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    gradient: [string, string];
    path: string;
    description: string;
    badge?: string;
    disabled?: boolean;
}

export default function DashboardScreen({ navigation }: any) {
    const { user, logout } = useAuthStore();
    const [userMenuVisible, setUserMenuVisible] = useState(false);

    const modules: ModuleCard[] = [
        {
            id: 'crm',
            title: 'CRM',
            icon: 'people',
            color: '#7c3aed',
            gradient: ['#7c3aed', '#c026d3'],
            path: 'CRM',
            description: 'Müşteri ilişkileri yönetimi',
            badge: 'Aktif',
        },
        {
            id: 'dashboards',
            title: 'Dashboards',
            icon: 'stats-chart',
            color: '#c026d3',
            gradient: ['#c026d3', '#0891b2'],
            path: 'DashboardDetail',
            description: 'Analiz ve raporlar',
        },
        {
            id: 'apps',
            title: 'Uygulamalar',
            icon: 'apps',
            color: '#0891b2',
            gradient: ['#0891b2', '#7c3aed'],
            path: 'Modules',
            description: 'Modül yönetimi',
        },
        {
            id: 'settings',
            title: 'Ayarlar',
            icon: 'settings',
            color: '#6b7280',
            gradient: ['#6b7280', '#374151'],
            path: 'Settings',
            description: 'Sistem ayarları',
        },
        {
            id: 'messaging',
            title: 'Mesajlaşma',
            icon: 'chatbubbles',
            color: '#c026d3',
            gradient: ['#c026d3', '#e879f9'],
            path: 'Messaging',
            description: 'İletişim ve mesajlaşma',
            badge: 'Yakında',
            disabled: true,
        },
        {
            id: 'calendar',
            title: 'Takvim',
            icon: 'calendar',
            color: '#7c3aed',
            gradient: ['#7c3aed', '#a78bfa'],
            path: 'Calendar',
            description: 'Etkinlik ve toplantılar',
            badge: 'Yakında',
            disabled: true,
        },
        {
            id: 'contacts',
            title: 'Kontaklar',
            icon: 'person-circle',
            color: '#0891b2',
            gradient: ['#0891b2', '#22d3ee'],
            path: 'Contacts',
            description: 'Kişiler ve iletişim',
            badge: 'Yakında',
            disabled: true,
        },
        {
            id: 'inventory',
            title: 'Stok',
            icon: 'cube',
            color: '#10b981',
            gradient: ['#10b981', '#34d399'],
            path: 'Inventory',
            description: 'Envanter yönetimi',
            badge: 'Yakında',
            disabled: true,
        },
    ];

    const handleModuleClick = (module: ModuleCard) => {
        if (module.disabled) return;

        if (module.id === 'crm') {
            navigation.navigate('CRMDashboard');
            return;
        }

        Alert.alert(
            "Yakında",
            `${module.title} modülü henüz mobil uygulamada aktif değil.`,
            [{ text: "Tamam" }]
        );
    };

    const handleLogout = () => {
        setUserMenuVisible(false);
        Alert.alert(
            'Çıkış Yap',
            'Çıkış yapmak istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.error('Logout failed:', error);
                        }
                    }
                }
            ]
        );
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
                    <Text style={styles.tenantName}>{user?.tenantName || 'Stocker'}</Text>

                    <TouchableOpacity
                        style={styles.userBadge}
                        onPress={() => setUserMenuVisible(true)}
                    >
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={16} color="#fff" />
                        </View>
                        <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
                        <Ionicons name="chevron-down" size={12} color="rgba(255,255,255,0.7)" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Welcome Section */}
                    <Animated.View
                        entering={FadeInDown.delay(100).duration(800)}
                        style={styles.welcomeSection}
                    >
                        <Text style={styles.welcomeTitle}>Hoş Geldiniz! 👋</Text>
                        <Text style={styles.welcomeSubtitle}>İşletmenizi yönetmek için bir modül seçin</Text>
                    </Animated.View>

                    {/* Modules Grid */}
                    <View style={styles.gridContainer}>
                        {modules.map((module, index) => (
                            <Animated.View
                                key={module.id}
                                entering={FadeInDown.delay(200 + (index * 50)).duration(600)}
                                style={styles.gridItemWrapper}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.moduleCard,
                                        module.disabled && styles.moduleCardDisabled
                                    ]}
                                    onPress={() => handleModuleClick(module)}
                                    activeOpacity={0.8}
                                >
                                    {module.badge && (
                                        <View style={[
                                            styles.badge,
                                            module.disabled ? styles.badgeWarning : styles.badgeSuccess
                                        ]}>
                                            <Text style={styles.badgeText}>{module.badge}</Text>
                                        </View>
                                    )}

                                    <Ionicons
                                        name={module.icon}
                                        size={48}
                                        color={module.disabled ? 'rgba(255,255,255,0.5)' : '#fff'}
                                        style={styles.moduleIcon}
                                    />

                                    <Text style={[
                                        styles.moduleTitle,
                                        module.disabled && styles.textDisabled
                                    ]}>{module.title}</Text>

                                    <Text style={[
                                        styles.moduleDescription,
                                        module.disabled && styles.textDisabled
                                    ]} numberOfLines={2}>
                                        {module.description}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Ionicons name="rocket-outline" size={16} color="rgba(255,255,255,0.6)" style={{ marginRight: 8 }} />
                        <Text style={styles.footerText}>Stocker - Modern İşletme Yönetim Sistemi</Text>
                    </View>
                </ScrollView>

                {/* User Menu Modal */}
                <Modal
                    visible={userMenuVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setUserMenuVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setUserMenuVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback>
                                <View style={styles.menuContainer}>
                                    <TouchableOpacity style={styles.menuItem} onPress={() => {
                                        setUserMenuVisible(false);
                                        // navigation.navigate('Profile');
                                        Alert.alert('Bilgi', 'Profil sayfası yakında eklenecek.');
                                    }}>
                                        <Ionicons name="person-outline" size={20} color={colors.textPrimary} />
                                        <Text style={styles.menuText}>Profil</Text>
                                    </TouchableOpacity>

                                    <View style={styles.menuDivider} />

                                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                                        <Ionicons name="log-out-outline" size={20} color={colors.error} />
                                        <Text style={[styles.menuText, { color: colors.error }]}>Çıkış Yap</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
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
        marginBottom: spacing.m,
    } as ViewStyle,
    tenantName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    } as TextStyle,
    userBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    } as ViewStyle,
    avatarContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    } as ViewStyle,
    userName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    } as TextStyle,
    content: {
        paddingHorizontal: spacing.l,
        paddingBottom: spacing.xl,
    } as ViewStyle,
    welcomeSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
        marginTop: spacing.m,
    } as ViewStyle,
    welcomeTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: spacing.s,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    } as TextStyle,
    welcomeSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    } as TextStyle,
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing.m,
    } as ViewStyle,
    gridItemWrapper: {
        width: (width - (spacing.l * 2) - spacing.m) / 2,
        marginBottom: spacing.m,
    } as ViewStyle,
    moduleCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: spacing.m,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        height: 180,
        justifyContent: 'center',
    } as ViewStyle,
    moduleCardDisabled: {
        opacity: 0.6,
        backgroundColor: 'rgba(255,255,255,0.05)',
    } as ViewStyle,
    moduleIcon: {
        marginBottom: spacing.m,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    } as TextStyle,
    moduleTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
    } as TextStyle,
    moduleDescription: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        textAlign: 'center',
    } as TextStyle,
    textDisabled: {
        color: 'rgba(255,255,255,0.5)',
    } as TextStyle,
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    } as ViewStyle,
    badgeSuccess: {
        backgroundColor: 'rgba(16, 185, 129, 0.9)',
    } as ViewStyle,
    badgeWarning: {
        backgroundColor: 'rgba(250, 173, 20, 0.9)',
    } as ViewStyle,
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    } as TextStyle,
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.l,
        marginBottom: spacing.xl,
    } as ViewStyle,
    footerText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    } as TextStyle,
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    } as ViewStyle,
    menuContainer: {
        backgroundColor: colors.surface,
        width: 200,
        borderRadius: 12,
        marginTop: 100, // Adjust based on header height
        marginRight: spacing.l,
        padding: spacing.s,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    } as ViewStyle,
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: 8,
    } as ViewStyle,
    menuText: {
        marginLeft: spacing.m,
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '500',
    } as TextStyle,
    menuDivider: {
        height: 1,
        backgroundColor: colors.surfaceLight,
        marginVertical: spacing.xs,
    } as ViewStyle,
});
