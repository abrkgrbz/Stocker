import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    RefreshControl,
    ActivityIndicator,
    Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Location from 'expo-location';
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Users,
    Calendar,
    MapPin,
    LogIn,
    LogOut,
    Coffee,
    Home,
    Palmtree,
    Navigation
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useToast } from '@/components/ui';
import {
    useMyTodayAttendance,
    useTodayAttendance,
    useCheckIn,
    useCheckOut,
    useDailyAttendanceSummary
} from '@/lib/api/hooks/useHR';
import type { AttendanceStatus } from '@/lib/api/types/hr.types';

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bgColor: string; icon: any }> = {
    present: { label: 'Mevcut', color: '#22c55e', bgColor: '#dcfce7', icon: CheckCircle },
    absent: { label: 'Yok', color: '#ef4444', bgColor: '#fee2e2', icon: XCircle },
    late: { label: 'Geç', color: '#f59e0b', bgColor: '#fef3c7', icon: AlertCircle },
    half_day: { label: 'Yarım Gün', color: '#8b5cf6', bgColor: '#ede9fe', icon: Coffee },
    remote: { label: 'Uzaktan', color: '#3b82f6', bgColor: '#dbeafe', icon: Home },
    holiday: { label: 'Tatil', color: '#ec4899', bgColor: '#fce7f3', icon: Palmtree },
    leave: { label: 'İzinli', color: '#64748b', bgColor: '#f1f5f9', icon: Calendar },
};

export default function AttendanceScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const toast = useToast();

    const { data: myAttendance, isLoading: isLoadingMy, refetch: refetchMy } = useMyTodayAttendance();
    const { data: todayAttendance, isLoading: isLoadingToday, refetch: refetchToday } = useTodayAttendance();
    const { data: summary, isLoading: isLoadingSummary, refetch: refetchSummary } = useDailyAttendanceSummary();

    const checkIn = useCheckIn();
    const checkOut = useCheckOut();

    const [refreshing, setRefreshing] = useState(false);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    // Request location permission on mount
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationError('Konum izni verilmedi');
            }
        })();
    }, []);

    const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
        setIsGettingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationError('Konum izni verilmedi');
                toast.warning('Uyarı', 'Konum izni olmadan devam edilecek');
                return null;
            }

            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });

            const coords = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude
            };
            setLocation(coords);
            setLocationError(null);
            return coords;
        } catch (error) {
            setLocationError('Konum alınamadı');
            toast.warning('Uyarı', 'Konum alınamadı, konum olmadan devam edilecek');
            return null;
        } finally {
            setIsGettingLocation(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetchMy(), refetchToday(), refetchSummary()]);
        setRefreshing(false);
    }, [refetchMy, refetchToday, refetchSummary]);

    const handleCheckIn = async () => {
        try {
            const coords = await getCurrentLocation();
            await checkIn.mutateAsync({
                employeeId: '',
                latitude: coords?.latitude,
                longitude: coords?.longitude
            });
            toast.success('Başarılı', 'Giriş kaydınız oluşturuldu');
            refetchMy();
        } catch (error) {
            toast.error('Hata', 'Giriş kaydı oluşturulurken bir hata oluştu');
        }
    };

    const handleCheckOut = async () => {
        try {
            const coords = await getCurrentLocation();
            await checkOut.mutateAsync({
                employeeId: '',
                latitude: coords?.latitude,
                longitude: coords?.longitude
            });
            toast.success('Başarılı', 'Çıkış kaydınız oluşturuldu');
            refetchMy();
        } catch (error) {
            toast.error('Hata', 'Çıkış kaydı oluşturulurken bir hata oluştu');
        }
    };

    const formatTime = (timeStr?: string) => {
        if (!timeStr) return '--:--';
        return new Date(timeStr).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isLoading = isLoadingMy || isLoadingToday || isLoadingSummary;

    const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) => (
        <View style={{
            flex: 1,
            backgroundColor: colors.surface.primary,
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.border.primary
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Icon size={18} color={color} />
                <Text style={{ color: colors.text.secondary, fontSize: 12, marginLeft: 6 }}>{label}</Text>
            </View>
            <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '700' }}>{value}</Text>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            {/* Header */}
            <Animated.View
                entering={FadeIn.duration(400)}
                style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.surface.primary,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.primary
                }}
            >
                <Pressable onPress={() => router.back()} style={{ marginRight: 12, padding: 8, marginLeft: -8 }}>
                    <ArrowLeft size={24} color={colors.text.primary} />
                </Pressable>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>
                        Devam Takibi
                    </Text>
                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                        {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </Text>
                </View>
            </Animated.View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.modules.hr}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
                        <ActivityIndicator size="large" color={colors.modules.hr} />
                    </View>
                ) : (
                    <>
                        {/* My Attendance Card */}
                        <Animated.View
                            entering={FadeInDown.duration(400).delay(100)}
                            style={{
                                backgroundColor: colors.modules.hr,
                                borderRadius: 16,
                                padding: 20,
                                marginBottom: 16
                            }}
                        >
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8 }}>
                                Bugünkü Durumum
                            </Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <LogIn size={20} color="#ffffff" />
                                        <Text style={{ color: '#ffffff', fontSize: 14, marginLeft: 8 }}>Giriş</Text>
                                        <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '700', marginLeft: 12 }}>
                                            {formatTime(myAttendance?.checkIn)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <LogOut size={20} color="#ffffff" />
                                        <Text style={{ color: '#ffffff', fontSize: 14, marginLeft: 8 }}>Çıkış</Text>
                                        <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '700', marginLeft: 12 }}>
                                            {formatTime(myAttendance?.checkOut)}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Location Status */}
                            {location && (
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: 12,
                                    backgroundColor: 'rgba(255,255,255,0.15)',
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 8,
                                    alignSelf: 'flex-start'
                                }}>
                                    <Navigation size={14} color="#ffffff" />
                                    <Text style={{ color: '#ffffff', fontSize: 12, marginLeft: 6 }}>
                                        Konum alındı
                                    </Text>
                                </View>
                            )}

                            {/* Check In/Out Buttons */}
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                {!myAttendance?.checkIn ? (
                                    <Pressable
                                        onPress={handleCheckIn}
                                        disabled={checkIn.isPending || isGettingLocation}
                                        style={{
                                            flex: 1,
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            paddingVertical: 14,
                                            borderRadius: 12,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: (checkIn.isPending || isGettingLocation) ? 0.7 : 1
                                        }}
                                    >
                                        {checkIn.isPending || isGettingLocation ? (
                                            <>
                                                <ActivityIndicator size="small" color="#ffffff" />
                                                <Text style={{ color: '#ffffff', fontWeight: '600', marginLeft: 8 }}>
                                                    {isGettingLocation ? 'Konum alınıyor...' : 'İşleniyor...'}
                                                </Text>
                                            </>
                                        ) : (
                                            <>
                                                <LogIn size={20} color="#ffffff" />
                                                <Text style={{ color: '#ffffff', fontWeight: '600', marginLeft: 8 }}>
                                                    Giriş Yap
                                                </Text>
                                            </>
                                        )}
                                    </Pressable>
                                ) : !myAttendance?.checkOut ? (
                                    <Pressable
                                        onPress={handleCheckOut}
                                        disabled={checkOut.isPending || isGettingLocation}
                                        style={{
                                            flex: 1,
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            paddingVertical: 14,
                                            borderRadius: 12,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: (checkOut.isPending || isGettingLocation) ? 0.7 : 1
                                        }}
                                    >
                                        {checkOut.isPending || isGettingLocation ? (
                                            <>
                                                <ActivityIndicator size="small" color="#ffffff" />
                                                <Text style={{ color: '#ffffff', fontWeight: '600', marginLeft: 8 }}>
                                                    {isGettingLocation ? 'Konum alınıyor...' : 'İşleniyor...'}
                                                </Text>
                                            </>
                                        ) : (
                                            <>
                                                <LogOut size={20} color="#ffffff" />
                                                <Text style={{ color: '#ffffff', fontWeight: '600', marginLeft: 8 }}>
                                                    Çıkış Yap
                                                </Text>
                                            </>
                                        )}
                                    </Pressable>
                                ) : (
                                    <View style={{
                                        flex: 1,
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        paddingVertical: 14,
                                        borderRadius: 12,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <CheckCircle size={20} color="#ffffff" />
                                        <Text style={{ color: '#ffffff', fontWeight: '600', marginLeft: 8 }}>
                                            Gün Tamamlandı
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </Animated.View>

                        {/* Daily Summary */}
                        {summary && (
                            <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                                    Günlük Özet
                                </Text>
                                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                                    <StatCard
                                        icon={Users}
                                        label="Toplam"
                                        value={summary.totalEmployees}
                                        color={colors.modules.hr}
                                    />
                                    <StatCard
                                        icon={CheckCircle}
                                        label="Mevcut"
                                        value={summary.presentCount}
                                        color="#22c55e"
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                                    <StatCard
                                        icon={XCircle}
                                        label="Yok"
                                        value={summary.absentCount}
                                        color="#ef4444"
                                    />
                                    <StatCard
                                        icon={AlertCircle}
                                        label="Geç"
                                        value={summary.lateCount}
                                        color="#f59e0b"
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                                    <StatCard
                                        icon={Calendar}
                                        label="İzinli"
                                        value={summary.onLeaveCount}
                                        color="#64748b"
                                    />
                                    <StatCard
                                        icon={Clock}
                                        label="Devam Oranı"
                                        value={`%${Math.round(summary.attendanceRate)}`}
                                        color={colors.modules.hr}
                                    />
                                </View>
                            </Animated.View>
                        )}

                        {/* Today's Attendance List */}
                        {todayAttendance && todayAttendance.length > 0 && (
                            <Animated.View entering={FadeInDown.duration(400).delay(300)}>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                                    Bugünkü Devam
                                </Text>
                                {todayAttendance.slice(0, 10).map((attendance, index) => {
                                    const statusConfig = STATUS_CONFIG[attendance.status];
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <Pressable
                                            key={attendance.id}
                                            onPress={() => router.push(`/hr/employee/${attendance.employeeId}` as any)}
                                            style={{
                                                backgroundColor: colors.surface.primary,
                                                borderRadius: 12,
                                                padding: 14,
                                                marginBottom: 8,
                                                flexDirection: 'row',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <View style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 20,
                                                backgroundColor: statusConfig.bgColor,
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                <StatusIcon size={20} color={statusConfig.color} />
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 12 }}>
                                                <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600' }}>
                                                    {attendance.employeeName}
                                                </Text>
                                                <Text style={{ color: colors.text.secondary, fontSize: 12, marginTop: 2 }}>
                                                    {formatTime(attendance.checkIn)} - {formatTime(attendance.checkOut)}
                                                </Text>
                                            </View>
                                            <View style={{
                                                backgroundColor: statusConfig.bgColor,
                                                paddingHorizontal: 10,
                                                paddingVertical: 4,
                                                borderRadius: 6
                                            }}>
                                                <Text style={{ color: statusConfig.color, fontSize: 12, fontWeight: '600' }}>
                                                    {statusConfig.label}
                                                </Text>
                                            </View>
                                        </Pressable>
                                    );
                                })}
                                {todayAttendance.length > 10 && (
                                    <Pressable
                                        style={{
                                            backgroundColor: colors.surface.primary,
                                            borderRadius: 12,
                                            padding: 14,
                                            alignItems: 'center',
                                            marginBottom: 8
                                        }}
                                    >
                                        <Text style={{ color: colors.modules.hr, fontWeight: '600' }}>
                                            +{todayAttendance.length - 10} kişi daha
                                        </Text>
                                    </Pressable>
                                )}
                            </Animated.View>
                        )}

                        <View style={{ height: 32 }} />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
