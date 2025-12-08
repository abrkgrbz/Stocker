import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useHRStore } from '../../stores/hrStore';
import { spacing } from '../../theme/theme';

export default function HRDashboardScreen({ navigation }: any) {
    const { colors, theme } = useTheme();
    const { todayAttendance, getDailyAttendance, isLoading } = useHRStore();

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        getDailyAttendance(today);
    }, []);

    const onRefresh = React.useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        getDailyAttendance(today);
    }, []);

    const ActionCard = ({ title, icon, color, onPress }: any) => (
        <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon} size={28} color={color} />
            </View>
            <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>İnsan Kaynakları</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                {/* Attendance Status */}
                <View style={[styles.statusCard, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Bugünkü Durum</Text>
                    <View style={styles.statusRow}>
                        <View style={styles.statusItem}>
                            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Giriş Saati</Text>
                            <Text style={[styles.statusValue, { color: colors.textPrimary }]}>
                                {todayAttendance?.checkInTime ? todayAttendance.checkInTime.substring(0, 5) : '--:--'}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statusItem}>
                            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Çıkış Saati</Text>
                            <Text style={[styles.statusValue, { color: colors.textPrimary }]}>
                                {todayAttendance?.checkOutTime ? todayAttendance.checkOutTime.substring(0, 5) : '--:--'}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.checkButton, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate('Attendance')}
                    >
                        <Text style={styles.checkButtonText}>Giriş/Çıkış Yap</Text>
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: spacing.l }]}>İşlemler</Text>
                <View style={styles.grid}>
                    <ActionCard
                        title="Çalışanlar"
                        icon="people"
                        color="#3b82f6"
                        onPress={() => navigation.navigate('EmployeeList')}
                    />
                    <ActionCard
                        title="İzin Talebi"
                        icon="calendar"
                        color="#10b981"
                        onPress={() => navigation.navigate('LeaveRequest')}
                    />
                    <ActionCard
                        title="Bordrolar"
                        icon="document-text"
                        color="#f59e0b"
                        onPress={() => { /* Navigate to Payrolls */ }}
                    />
                    <ActionCard
                        title="Duyurular"
                        icon="megaphone"
                        color="#8b5cf6"
                        onPress={() => { /* Navigate to Announcements */ }}
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
    statusCard: {
        padding: spacing.l,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: spacing.m,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    statusItem: {
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    statusValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: '#eee',
    },
    checkButton: {
        padding: spacing.m,
        borderRadius: 12,
        alignItems: 'center',
    },
    checkButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionCard: {
        width: '48%',
        padding: spacing.m,
        borderRadius: 12,
        marginBottom: spacing.m,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    iconContainer: {
        padding: 12,
        borderRadius: 12,
        marginBottom: spacing.s,
    },
    actionTitle: {
        fontWeight: '600',
        fontSize: 14,
    },
});
