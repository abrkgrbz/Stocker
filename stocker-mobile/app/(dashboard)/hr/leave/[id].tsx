import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    RefreshControl,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    Briefcase,
    Heart,
    Baby,
    Gift,
    Umbrella,
    HelpCircle,
    X,
    Check,
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import {
    useLeaveRequest,
    useApproveLeaveRequest,
    useRejectLeaveRequest,
    useCancelLeaveRequest,
} from '@/lib/api/hooks/useHR';
import type { LeaveStatus, LeaveType } from '@/lib/api/types/hr.types';

const STATUS_CONFIG: Record<LeaveStatus, { label: string; color: string; bgColor: string; icon: any }> = {
    pending: { label: 'Beklemede', color: '#f59e0b', bgColor: '#fef3c7', icon: Clock },
    approved: { label: 'Onaylandı', color: '#22c55e', bgColor: '#dcfce7', icon: CheckCircle },
    rejected: { label: 'Reddedildi', color: '#ef4444', bgColor: '#fee2e2', icon: XCircle },
    cancelled: { label: 'İptal Edildi', color: '#64748b', bgColor: '#f1f5f9', icon: AlertCircle },
};

const LEAVE_TYPE_CONFIG: Record<LeaveType, { label: string; icon: any; color: string }> = {
    annual: { label: 'Yıllık İzin', icon: Calendar, color: '#3b82f6' },
    sick: { label: 'Hastalık İzni', icon: Heart, color: '#ef4444' },
    unpaid: { label: 'Ücretsiz İzin', icon: Briefcase, color: '#64748b' },
    maternity: { label: 'Doğum İzni', icon: Baby, color: '#ec4899' },
    paternity: { label: 'Babalık İzni', icon: Baby, color: '#8b5cf6' },
    marriage: { label: 'Evlilik İzni', icon: Gift, color: '#f59e0b' },
    bereavement: { label: 'Vefat İzni', icon: Umbrella, color: '#1f2937' },
    other: { label: 'Diğer', icon: HelpCircle, color: '#6b7280' },
};

export default function LeaveDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const { data: leave, isLoading, refetch } = useLeaveRequest(id);
    const approveRequest = useApproveLeaveRequest();
    const rejectRequest = useRejectLeaveRequest();
    const cancelRequest = useCancelLeaveRequest();

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleApprove = () => {
        Alert.alert(
            'İzin Talebi Onaylama',
            'Bu izin talebini onaylamak istediğinizden emin misiniz?',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Onayla',
                    onPress: async () => {
                        try {
                            await approveRequest.mutateAsync({ id });
                            Alert.alert('Başarılı', 'İzin talebi onaylandı');
                        } catch (error) {
                            Alert.alert('Hata', 'İzin talebi onaylanırken bir hata oluştu');
                        }
                    },
                },
            ]
        );
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            Alert.alert('Hata', 'Lütfen red nedenini girin');
            return;
        }

        try {
            await rejectRequest.mutateAsync({ id, data: { reason: rejectReason } });
            setShowRejectModal(false);
            setRejectReason('');
            Alert.alert('Başarılı', 'İzin talebi reddedildi');
        } catch (error) {
            Alert.alert('Hata', 'İzin talebi reddedilirken bir hata oluştu');
        }
    };

    const handleCancel = () => {
        Alert.alert(
            'İzin Talebi İptali',
            'Bu izin talebini iptal etmek istediğinizden emin misiniz?',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'İptal Et',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await cancelRequest.mutateAsync(id);
                            Alert.alert('Başarılı', 'İzin talebi iptal edildi');
                        } catch (error) {
                            Alert.alert('Hata', 'İzin talebi iptal edilirken bir hata oluştu');
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background.secondary }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.modules.hr} />
                </View>
            </SafeAreaView>
        );
    }

    if (!leave) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background.secondary }]}>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: colors.semantic.error }]}>
                        İzin talebi bulunamadı
                    </Text>
                    <Pressable
                        style={[styles.backButton, { backgroundColor: colors.modules.hr }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Geri Dön</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const statusConfig = STATUS_CONFIG[leave.status];
    const StatusIcon = statusConfig.icon;
    const typeConfig = LEAVE_TYPE_CONFIG[leave.type];
    const TypeIcon = typeConfig.icon;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background.secondary }]} edges={['top']}>
            {/* Header */}
            <Animated.View
                entering={FadeIn.duration(300)}
                style={[styles.header, { backgroundColor: colors.surface.primary, borderBottomColor: colors.border.primary }]}
            >
                <Pressable onPress={() => router.back()} style={styles.headerButton}>
                    <ArrowLeft size={24} color={colors.text.primary} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>İzin Talebi</Text>
                <View style={styles.headerButton} />
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.modules.hr} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Leave Type Card */}
                <Animated.View
                    entering={FadeInDown.duration(400).delay(100)}
                    style={[styles.typeCard, { backgroundColor: typeConfig.color }]}
                >
                    <View style={styles.typeIconContainer}>
                        <TypeIcon size={48} color="#ffffff" />
                    </View>
                    <Text style={styles.typeLabel}>{typeConfig.label}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <StatusIcon size={16} color="#ffffff" />
                        <Text style={styles.statusBadgeText}>{statusConfig.label}</Text>
                    </View>
                </Animated.View>

                {/* Employee Info */}
                <Animated.View
                    entering={FadeInDown.duration(400).delay(200)}
                    style={[styles.card, { backgroundColor: colors.surface.primary }]}
                >
                    <Pressable
                        style={styles.employeeRow}
                        onPress={() => router.push(`/hr/employee/${leave.employeeId}` as any)}
                    >
                        <View style={[styles.avatarContainer, { backgroundColor: colors.modules.hr + '20' }]}>
                            <User size={24} color={colors.modules.hr} />
                        </View>
                        <View style={styles.employeeInfo}>
                            <Text style={[styles.employeeName, { color: colors.text.primary }]}>
                                {leave.employeeName}
                            </Text>
                            <Text style={[styles.employeeSubtitle, { color: colors.text.secondary }]}>
                                Çalışan Profilini Görüntüle
                            </Text>
                        </View>
                        <ArrowLeft size={20} color={colors.text.tertiary} style={{ transform: [{ rotate: '180deg' }] }} />
                    </Pressable>
                </Animated.View>

                {/* Date Info */}
                <Animated.View
                    entering={FadeInDown.duration(400).delay(300)}
                    style={[styles.card, { backgroundColor: colors.surface.primary }]}
                >
                    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Tarih Bilgileri</Text>

                    <View style={styles.dateContainer}>
                        <View style={styles.dateBox}>
                            <Text style={[styles.dateLabel, { color: colors.text.secondary }]}>Başlangıç</Text>
                            <Text style={[styles.dateValue, { color: colors.text.primary }]}>
                                {formatDate(leave.startDate)}
                            </Text>
                        </View>
                        <View style={[styles.dateSeparator, { backgroundColor: colors.border.primary }]} />
                        <View style={styles.dateBox}>
                            <Text style={[styles.dateLabel, { color: colors.text.secondary }]}>Bitiş</Text>
                            <Text style={[styles.dateValue, { color: colors.text.primary }]}>
                                {formatDate(leave.endDate)}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.durationBadge, { backgroundColor: colors.modules.hr + '10' }]}>
                        <Calendar size={18} color={colors.modules.hr} />
                        <Text style={[styles.durationText, { color: colors.modules.hr }]}>
                            Toplam {leave.totalDays} gün
                        </Text>
                    </View>
                </Animated.View>

                {/* Reason */}
                {leave.reason && (
                    <Animated.View
                        entering={FadeInDown.duration(400).delay(400)}
                        style={[styles.card, { backgroundColor: colors.surface.primary }]}
                    >
                        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>İzin Nedeni</Text>
                        <View style={[styles.reasonBox, { backgroundColor: colors.background.secondary }]}>
                            <FileText size={18} color={colors.text.secondary} />
                            <Text style={[styles.reasonText, { color: colors.text.primary }]}>{leave.reason}</Text>
                        </View>
                    </Animated.View>
                )}

                {/* Approval Info */}
                {(leave.status === 'approved' || leave.status === 'rejected') && (
                    <Animated.View
                        entering={FadeInDown.duration(400).delay(500)}
                        style={[styles.card, { backgroundColor: colors.surface.primary }]}
                    >
                        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                            {leave.status === 'approved' ? 'Onay Bilgileri' : 'Red Bilgileri'}
                        </Text>

                        {leave.approvedByName && (
                            <View style={styles.infoRow}>
                                <User size={18} color={colors.text.secondary} />
                                <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>
                                    {leave.status === 'approved' ? 'Onaylayan:' : 'Reddeden:'}
                                </Text>
                                <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                                    {leave.approvedByName}
                                </Text>
                            </View>
                        )}

                        {leave.approvedAt && (
                            <View style={styles.infoRow}>
                                <Clock size={18} color={colors.text.secondary} />
                                <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Tarih:</Text>
                                <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                                    {formatDateTime(leave.approvedAt)}
                                </Text>
                            </View>
                        )}

                        {leave.rejectionReason && (
                            <View style={[styles.rejectionBox, { backgroundColor: '#fee2e2' }]}>
                                <AlertCircle size={18} color="#ef4444" />
                                <Text style={[styles.rejectionText, { color: '#dc2626' }]}>
                                    {leave.rejectionReason}
                                </Text>
                            </View>
                        )}
                    </Animated.View>
                )}

                {/* Created At */}
                <Animated.View
                    entering={FadeInDown.duration(400).delay(600)}
                    style={[styles.card, { backgroundColor: colors.surface.primary }]}
                >
                    <View style={styles.infoRow}>
                        <Clock size={18} color={colors.text.secondary} />
                        <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Oluşturulma:</Text>
                        <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                            {formatDateTime(leave.createdAt)}
                        </Text>
                    </View>
                </Animated.View>

                {/* Quick Actions */}
                {leave.status === 'pending' && (
                    <Animated.View
                        entering={FadeInDown.duration(400).delay(700)}
                        style={styles.actionsContainer}
                    >
                        <Pressable
                            style={[styles.actionButton, styles.approveButton]}
                            onPress={handleApprove}
                            disabled={approveRequest.isPending}
                        >
                            {approveRequest.isPending ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <>
                                    <Check size={20} color="#ffffff" />
                                    <Text style={styles.actionButtonText}>Onayla</Text>
                                </>
                            )}
                        </Pressable>

                        <Pressable
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => setShowRejectModal(true)}
                            disabled={rejectRequest.isPending}
                        >
                            <X size={20} color="#ffffff" />
                            <Text style={styles.actionButtonText}>Reddet</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.actionButton, styles.cancelButton, { backgroundColor: colors.surface.primary, borderColor: colors.border.primary, borderWidth: 1 }]}
                            onPress={handleCancel}
                            disabled={cancelRequest.isPending}
                        >
                            {cancelRequest.isPending ? (
                                <ActivityIndicator size="small" color={colors.text.primary} />
                            ) : (
                                <Text style={[styles.cancelButtonText, { color: colors.text.primary }]}>İptal Et</Text>
                            )}
                        </Pressable>
                    </Animated.View>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Reject Modal */}
            <Modal
                visible={showRejectModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowRejectModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface.primary }]}>
                        <Text style={[styles.modalTitle, { color: colors.text.primary }]}>İzin Talebini Reddet</Text>

                        <Text style={[styles.modalLabel, { color: colors.text.secondary }]}>
                            Red Nedeni *
                        </Text>
                        <TextInput
                            style={[
                                styles.modalInput,
                                {
                                    backgroundColor: colors.background.secondary,
                                    color: colors.text.primary,
                                    borderColor: colors.border.primary,
                                },
                            ]}
                            placeholder="Red nedenini yazın..."
                            placeholderTextColor={colors.text.secondary}
                            value={rejectReason}
                            onChangeText={setRejectReason}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        <View style={styles.modalActions}>
                            <Pressable
                                style={[styles.modalButton, { backgroundColor: colors.background.secondary }]}
                                onPress={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                }}
                            >
                                <Text style={[styles.modalButtonText, { color: colors.text.primary }]}>Vazgeç</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, { backgroundColor: '#ef4444' }]}
                                onPress={handleReject}
                                disabled={rejectRequest.isPending}
                            >
                                {rejectRequest.isPending ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>Reddet</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        marginBottom: 16,
    },
    backButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    typeCard: {
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
    },
    typeIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeLabel: {
        fontSize: 22,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    statusBadgeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    employeeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    employeeInfo: {
        flex: 1,
    },
    employeeName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    employeeSubtitle: {
        fontSize: 13,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 12,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    dateBox: {
        flex: 1,
        alignItems: 'center',
    },
    dateLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 15,
        fontWeight: '600',
    },
    dateSeparator: {
        width: 1,
        height: 40,
        marginHorizontal: 16,
    },
    durationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    durationText: {
        fontSize: 15,
        fontWeight: '600',
    },
    reasonBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 8,
        gap: 10,
    },
    reasonText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 6,
    },
    infoLabel: {
        fontSize: 14,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    rejectionBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 8,
        gap: 10,
        marginTop: 12,
    },
    rejectionText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 10,
        gap: 6,
    },
    approveButton: {
        backgroundColor: '#22c55e',
    },
    rejectButton: {
        backgroundColor: '#ef4444',
    },
    cancelButton: {
        flex: 0.7,
    },
    actionButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    bottomPadding: {
        height: 40,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 16,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    modalLabel: {
        fontSize: 14,
        marginBottom: 8,
    },
    modalInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        minHeight: 100,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
