import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useHRStore } from '../../stores/hrStore';
import { spacing } from '../../theme/theme';

export default function AttendanceScreen({ navigation }: any) {
    const { colors, theme } = useTheme();
    const { todayAttendance, checkIn, checkOut, isLoading, getDailyAttendance } = useHRStore();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        const today = new Date().toISOString().split('T')[0];
        getDailyAttendance(today);

        return () => clearInterval(timer);
    }, []);

    const handleCheckIn = async () => {
        try {
            await checkIn('Mobile App');
            Alert.alert('Başarılı', 'Giriş işleminiz kaydedildi.');
        } catch (error) {
            Alert.alert('Hata', 'Giriş işlemi başarısız oldu.');
        }
    };

    const handleCheckOut = async () => {
        try {
            await checkOut('Mobile App');
            Alert.alert('Başarılı', 'Çıkış işleminiz kaydedildi.');
        } catch (error) {
            Alert.alert('Hata', 'Çıkış işlemi başarısız oldu.');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Puantaj</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.clockContainer}>
                    <Text style={[styles.timeText, { color: colors.textPrimary }]}>
                        {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                        {currentTime.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </Text>
                </View>

                <View style={[styles.statusCard, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
                    <View style={styles.statusRow}>
                        <View style={styles.statusItem}>
                            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Giriş</Text>
                            <Text style={[styles.statusValue, { color: todayAttendance?.checkInTime ? '#10b981' : colors.textPrimary }]}>
                                {todayAttendance?.checkInTime ? todayAttendance.checkInTime.substring(0, 5) : '--:--'}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statusItem}>
                            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Çıkış</Text>
                            <Text style={[styles.statusValue, { color: todayAttendance?.checkOutTime ? '#ef4444' : colors.textPrimary }]}>
                                {todayAttendance?.checkOutTime ? todayAttendance.checkOutTime.substring(0, 5) : '--:--'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actions}>
                    {!todayAttendance?.checkInTime ? (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                            onPress={handleCheckIn}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="log-in-outline" size={32} color="#fff" />
                                    <Text style={styles.actionText}>Giriş Yap</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : !todayAttendance?.checkOutTime ? (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                            onPress={handleCheckOut}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="log-out-outline" size={32} color="#fff" />
                                    <Text style={styles.actionText}>Çıkış Yap</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.completedContainer}>
                            <Ionicons name="checkmark-circle" size={64} color="#10b981" />
                            <Text style={[styles.completedText, { color: colors.textPrimary }]}>
                                Bugünkü mesainiz tamamlandı.
                            </Text>
                        </View>
                    )}
                </View>
            </View>
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
        flex: 1,
        padding: spacing.xl,
        alignItems: 'center',
    },
    clockContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    timeText: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 18,
        marginTop: spacing.s,
    },
    statusCard: {
        width: '100%',
        padding: spacing.l,
        borderRadius: 16,
        marginBottom: spacing.xl,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statusItem: {
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 16,
        marginBottom: 8,
    },
    statusValue: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    divider: {
        width: 1,
        height: 50,
        backgroundColor: '#eee',
    },
    actions: {
        width: '100%',
        alignItems: 'center',
    },
    actionButton: {
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    actionText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: spacing.s,
    },
    completedContainer: {
        alignItems: 'center',
        marginTop: spacing.l,
    },
    completedText: {
        fontSize: 18,
        marginTop: spacing.m,
        textAlign: 'center',
    },
});
