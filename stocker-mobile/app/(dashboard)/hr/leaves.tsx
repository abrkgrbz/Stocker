import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    RefreshControl,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import {
    ArrowLeft,
    Search,
    Plus,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Check,
    X,
    ChevronRight,
    RefreshCw
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useLeaveRequests, useApproveLeaveRequest, useRejectLeaveRequest } from '@/lib/api/hooks/useHR';
import type { LeaveRequest, LeaveStatus, LeaveType } from '@/lib/api/types/hr.types';

const LEAVE_TYPE_CONFIG: Record<LeaveType, { label: string; color: string }> = {
    annual: { label: 'Yıllık İzin', color: '#3b82f6' },
    sick: { label: 'Sağlık', color: '#ef4444' },
    unpaid: { label: 'Ücretsiz', color: '#64748b' },
    maternity: { label: 'Doğum', color: '#ec4899' },
    paternity: { label: 'Babalık', color: '#8b5cf6' },
    marriage: { label: 'Evlilik', color: '#f59e0b' },
    bereavement: { label: 'Vefat', color: '#1e293b' },
    other: { label: 'Diğer', color: '#6b7280' }
};

const STATUS_CONFIG: Record<LeaveStatus, { label: string; color: string; bgColor: string; icon: any }> = {
    pending: { label: 'Bekliyor', color: '#f59e0b', bgColor: '#fef3c7', icon: Clock },
    approved: { label: 'Onaylandı', color: '#22c55e', bgColor: '#dcfce7', icon: CheckCircle },
    rejected: { label: 'Reddedildi', color: '#ef4444', bgColor: '#fee2e2', icon: XCircle },
    cancelled: { label: 'İptal', color: '#64748b', bgColor: '#f1f5f9', icon: XCircle }
};

export default function LeavesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<LeaveStatus | 'all'>('all');

    // Fetch leave requests from API
    const {
        data: leavesResponse,
        isLoading,
        isError,
        refetch,
        isRefetching
    } = useLeaveRequests({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        pageSize: 50
    });

    // Mutations for approve/reject
    const approveMutation = useApproveLeaveRequest();
    const rejectMutation = useRejectLeaveRequest();

    const leaves = leavesResponse?.items || [];

    const statusFilters: { key: LeaveStatus | 'all'; label: string }[] = [
        { key: 'all', label: 'Tümü' },
        { key: 'pending', label: 'Bekliyor' },
        { key: 'approved', label: 'Onaylı' },
        { key: 'rejected', label: 'Reddedildi' }
    ];

    const filteredLeaves = useMemo(() => {
        if (!searchQuery) return leaves;
        return leaves.filter(leave => {
            const matchesSearch = leave.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [leaves, searchQuery]);

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short'
        });
    };

    const handleApprove = (leave: LeaveRequest) => {
        Alert.alert(
            'İzni Onayla',
            `${leave.employeeName} adlı çalışanın ${leave.totalDays} günlük izin talebini onaylamak istiyor musunuz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Onayla',
                    onPress: () => {
                        approveMutation.mutate(
                            { id: leave.id },
                            {
                                onSuccess: () => Alert.alert('Başarılı', 'İzin talebi onaylandı'),
                                onError: () => Alert.alert('Hata', 'İzin talebi onaylanamadı')
                            }
                        );
                    }
                }
            ]
        );
    };

    const handleReject = (leave: LeaveRequest) => {
        Alert.alert(
            'İzni Reddet',
            `${leave.employeeName} adlı çalışanın izin talebini reddetmek istiyor musunuz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Reddet',
                    style: 'destructive',
                    onPress: () => {
                        rejectMutation.mutate(
                            { id: leave.id, data: { reason: 'Talep reddedildi' } },
                            {
                                onSuccess: () => Alert.alert('Başarılı', 'İzin talebi reddedildi'),
                                onError: () => Alert.alert('Hata', 'İzin talebi reddedilemedi')
                            }
                        );
                    }
                }
            ]
        );
    };

    const LeaveCard = ({ item, index }: { item: LeaveRequest; index: number }) => {
        const statusConfig = STATUS_CONFIG[item.status];
        const typeConfig = LEAVE_TYPE_CONFIG[item.type];
        const StatusIcon = statusConfig.icon;

        return (
            <Animated.View entering={FadeInRight.duration(300).delay(index * 50)}>
                <View
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: item.status === 'pending' ? colors.semantic.warning + '50' : colors.border.primary
                    }}
                >
                    <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-row items-center flex-1">
                            <View
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    backgroundColor: colors.modules.hrLight,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12
                                }}
                            >
                                <Calendar size={22} color={colors.modules.hr} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '600' }}>
                                    {item.employeeName}
                                </Text>
                                <View className="flex-row items-center mt-1">
                                    <View
                                        style={{
                                            backgroundColor: typeConfig.color + '20',
                                            paddingHorizontal: 6,
                                            paddingVertical: 2,
                                            borderRadius: 4
                                        }}
                                    >
                                        <Text style={{ color: typeConfig.color, fontSize: 11, fontWeight: '500' }}>
                                            {typeConfig.label}
                                        </Text>
                                    </View>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12, marginLeft: 8 }}>
                                        {item.totalDays} gün
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View
                            style={{
                                backgroundColor: statusConfig.bgColor,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 8,
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            <StatusIcon size={12} color={statusConfig.color} />
                            <Text style={{ color: statusConfig.color, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                                {statusConfig.label}
                            </Text>
                        </View>
                    </View>

                    {/* Date Range */}
                    <View className="flex-row items-center mb-3">
                        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                            {formatDate(item.startDate)} - {formatDate(item.endDate)}
                        </Text>
                    </View>

                    {/* Reason */}
                    {item.reason && (
                        <Text style={{ color: colors.text.tertiary, fontSize: 13, marginBottom: 12 }} numberOfLines={2}>
                            {item.reason}
                        </Text>
                    )}

                    {/* Rejection reason */}
                    {item.status === 'rejected' && item.rejectionReason && (
                        <View
                            style={{
                                backgroundColor: colors.semantic.errorLight,
                                padding: 10,
                                borderRadius: 8,
                                marginBottom: 12
                            }}
                        >
                            <Text style={{ color: colors.semantic.error, fontSize: 12 }}>
                                Red Nedeni: {item.rejectionReason}
                            </Text>
                        </View>
                    )}

                    {/* Approval Actions */}
                    {item.status === 'pending' && (
                        <View className="flex-row pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.border.primary }}>
                            <Pressable
                                onPress={() => handleReject(item)}
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingVertical: 10,
                                    marginRight: 8,
                                    backgroundColor: colors.semantic.errorLight,
                                    borderRadius: 10
                                }}
                            >
                                <X size={16} color={colors.semantic.error} />
                                <Text style={{ color: colors.semantic.error, fontSize: 14, fontWeight: '600', marginLeft: 6 }}>
                                    Reddet
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => handleApprove(item)}
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingVertical: 10,
                                    backgroundColor: colors.semantic.success,
                                    borderRadius: 10
                                }}
                            >
                                <Check size={16} color="#fff" />
                                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 6 }}>
                                    Onayla
                                </Text>
                            </Pressable>
                        </View>
                    )}

                    {/* Approved/Rejected By */}
                    {(item.status === 'approved' || item.status === 'rejected') && item.approvedByName && (
                        <View className="pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.border.primary }}>
                            <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                {item.status === 'approved' ? 'Onaylayan' : 'Reddeden'}: {item.approvedByName}
                            </Text>
                        </View>
                    )}
                </View>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            {/* Header */}
            <Animated.View
                entering={FadeIn.duration(400)}
                className="px-4 py-3"
                style={{
                    backgroundColor: colors.surface.primary,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.primary
                }}
            >
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                        <Pressable onPress={() => router.back()} className="mr-3 p-2 -ml-2">
                            <ArrowLeft size={24} color={colors.text.primary} />
                        </Pressable>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text.primary }} className="text-xl font-bold">İzin Talepleri</Text>
                            <Text style={{ color: colors.text.secondary }} className="text-sm">
                                {filteredLeaves.filter(l => l.status === 'pending').length} bekleyen
                            </Text>
                        </View>
                    </View>
                    <Pressable
                        onPress={() => router.push('/(dashboard)/hr/leave/new' as any)}
                        style={{
                            backgroundColor: colors.brand.primary,
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Plus size={22} color={colors.text.inverse} />
                    </Pressable>
                </View>

                {/* Search */}
                <View
                    style={{
                        backgroundColor: colors.background.tertiary,
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 12
                    }}
                >
                    <Search size={20} color={colors.text.tertiary} />
                    <Pressable style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8 }}>
                        <Text style={{ color: colors.text.tertiary, fontSize: 15 }}>
                            Çalışan ara...
                        </Text>
                    </Pressable>
                </View>
            </Animated.View>

            {/* Status Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="py-3 px-4"
                style={{ maxHeight: 52, backgroundColor: colors.surface.primary }}
            >
                {statusFilters.map((filter) => (
                    <Pressable
                        key={filter.key}
                        onPress={() => setSelectedStatus(filter.key)}
                        style={{
                            backgroundColor: selectedStatus === filter.key
                                ? colors.brand.primary
                                : colors.background.tertiary,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 20,
                            marginRight: 8
                        }}
                    >
                        <Text
                            style={{
                                color: selectedStatus === filter.key
                                    ? colors.text.inverse
                                    : colors.text.secondary,
                                fontSize: 13,
                                fontWeight: '500'
                            }}
                        >
                            {filter.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Leaves List */}
            <ScrollView
                className="flex-1 px-4"
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
                contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 20 }}
            >
                {isLoading ? (
                    <View className="items-center justify-center py-12">
                        <ActivityIndicator size="large" color={colors.brand.primary} />
                        <Text style={{ color: colors.text.secondary, fontSize: 14, marginTop: 12 }}>
                            İzin talepleri yükleniyor...
                        </Text>
                    </View>
                ) : isError ? (
                    <View className="items-center justify-center py-12">
                        <View
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 16,
                                backgroundColor: colors.semantic.errorLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16
                            }}
                        >
                            <RefreshCw size={28} color={colors.semantic.error} />
                        </View>
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                            Bağlantı hatası
                        </Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
                            İzin talepleri yüklenemedi
                        </Text>
                        <Pressable
                            onPress={() => refetch()}
                            style={{
                                backgroundColor: colors.brand.primary,
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                                borderRadius: 8
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '600' }}>Tekrar Dene</Text>
                        </Pressable>
                    </View>
                ) : filteredLeaves.length === 0 ? (
                    <View className="items-center justify-center py-12">
                        <View
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 16,
                                backgroundColor: colors.modules.hrLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16
                            }}
                        >
                            <Calendar size={28} color={colors.modules.hr} />
                        </View>
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                            İzin talebi bulunamadı
                        </Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center' }}>
                            {searchQuery ? 'Arama kriterlerinize uygun izin talebi yok' : 'Henüz izin talebi yok'}
                        </Text>
                    </View>
                ) : (
                    filteredLeaves.map((leave, index) => (
                        <LeaveCard key={leave.id} item={leave} index={index} />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
