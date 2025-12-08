import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import { spacing } from '../theme/theme';
import { notificationService } from '../services/notification/NotificationService';

export default function SettingsScreen({ navigation }: any) {
    const { colors, theme, toggleTheme, setTheme, themePreference } = useTheme();
    const { user, logout, biometricEnabled, setBiometricEnabled } = useAuthStore();

    const handleLogout = () => {
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

    const SettingItem = ({ icon, title, subtitle, onPress, rightElement, color }: any) => (
        <TouchableOpacity
            style={[styles.item, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={[styles.iconContainer, { backgroundColor: (color || colors.primary) + '20' }]}>
                <Ionicons name={icon} size={22} color={color || colors.primary} />
            </View>
            <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{title}</Text>
                {subtitle && <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
            </View>
            {rightElement || <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Ayarlar</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Account Section */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Hesap</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="person-outline"
                        title="Profil Bilgileri"
                        subtitle={`${user?.firstName} ${user?.lastName}`}
                        onPress={() => navigation.navigate('Profile')}
                    />
                    <SettingItem
                        icon="lock-closed-outline"
                        title="Güvenlik"
                        subtitle="Şifre ve giriş yöntemleri"
                        onPress={() => { /* Navigate to Security */ }}
                    />
                </View>

                {/* App Settings */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Uygulama</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon={theme === 'dark' ? "moon-outline" : "sunny-outline"}
                        title="Karanlık Mod"
                        rightElement={
                            <Switch
                                value={theme === 'dark'}
                                onValueChange={toggleTheme}
                                trackColor={{ false: "#767577", true: colors.primary }}
                                thumbColor={theme === 'dark' ? "#fff" : "#f4f3f4"}
                            />
                        }
                    />
                    <SettingItem
                        icon="notifications-outline"
                        title="Bildirimler"
                        onPress={async () => {
                            await notificationService.scheduleLocalNotification('Test', 'Bildirimler çalışıyor!');
                        }}
                    />
                    <SettingItem
                        icon="language-outline"
                        title="Dil"
                        subtitle="Türkçe"
                    />
                </View>

                {/* Other */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Diğer</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="information-circle-outline"
                        title="Hakkında"
                        subtitle="Versiyon 1.0.0"
                        color="#8b5cf6"
                    />
                    <SettingItem
                        icon="log-out-outline"
                        title="Çıkış Yap"
                        onPress={handleLogout}
                        color="#ef4444"
                    />
                </View>
            </ScrollView>
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
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.m,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: spacing.l,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: spacing.s,
        marginLeft: spacing.s,
        textTransform: 'uppercase',
    },
    section: {
        marginBottom: spacing.l,
        borderRadius: 16,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        marginBottom: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    itemSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
});
