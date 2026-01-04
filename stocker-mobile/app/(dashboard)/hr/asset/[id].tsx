import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    ArrowLeft,
    Package,
    User,
    Calendar,
    Tag,
    Hash,
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    Wrench,
    XCircle,
    DollarSign,
    Shield
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useAsset } from '@/lib/api/hooks/useHR';
import type { AssetStatus } from '@/lib/api/types/hr.types';

const STATUS_CONFIG: Record<AssetStatus, { label: string; color: string; bgColor: string; icon: any }> = {
    available: { label: 'Kullanılabilir', color: '#22c55e', bgColor: '#dcfce7', icon: CheckCircle },
    assigned: { label: 'Atanmış', color: '#3b82f6', bgColor: '#dbeafe', icon: User },
    maintenance: { label: 'Bakımda', color: '#f59e0b', bgColor: '#fef3c7', icon: Wrench },
    retired: { label: 'Kullanım Dışı', color: '#64748b', bgColor: '#f1f5f9', icon: XCircle },
};

export default function AssetDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const {
        data: asset,
        isLoading,
        isError,
        refetch,
        isRefetching
    } = useAsset(id || '');

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return '-';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(value);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.modules.hr} />
                </View>
            </SafeAreaView>
        );
    }

    if (isError || !asset) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <AlertCircle size={48} color={colors.semantic.error} />
                    <Text style={{ color: colors.text.primary, fontSize: 16, marginTop: 16 }}>
                        Demirbaş bulunamadı
                    </Text>
                    <Pressable
                        onPress={() => router.back()}
                        style={{
                            marginTop: 16,
                            paddingHorizontal: 24,
                            paddingVertical: 12,
                            backgroundColor: colors.modules.hr,
                            borderRadius: 8
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '600' }}>Geri Dön</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const statusConfig = STATUS_CONFIG[asset.status];
    const StatusIcon = statusConfig.icon;

    const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border.primary }}>
            <Icon size={20} color={colors.text.tertiary} />
            <Text style={{ color: colors.text.secondary, fontSize: 14, marginLeft: 12, flex: 1 }}>{label}</Text>
            <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '500' }}>{value}</Text>
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
                        Demirbaş Detayı
                    </Text>
                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                        {asset.assetNumber}
                    </Text>
                </View>
            </Animated.View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={colors.modules.hr}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Asset Card */}
                <Animated.View
                    entering={FadeInDown.duration(400).delay(100)}
                    style={{
                        backgroundColor: colors.modules.hr,
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 16
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <View style={{
                            width: 64,
                            height: 64,
                            borderRadius: 32,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Package size={32} color="#ffffff" />
                        </View>
                        <View style={{ marginLeft: 16, flex: 1 }}>
                            <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '700' }}>
                                {asset.name}
                            </Text>
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>
                                {asset.categoryName}
                            </Text>
                        </View>
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 12,
                        alignSelf: 'flex-start'
                    }}>
                        <StatusIcon size={18} color="#ffffff" />
                        <Text style={{ color: '#ffffff', fontWeight: '600', marginLeft: 8 }}>
                            {statusConfig.label}
                        </Text>
                    </View>
                </Animated.View>

                {/* Assigned Employee */}
                {asset.assignedToId && (
                    <Animated.View
                        entering={FadeInDown.duration(400).delay(200)}
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 12
                        }}
                    >
                        <Pressable
                            onPress={() => router.push(`/hr/employee/${asset.assignedToId}` as any)}
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                            <View style={{
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                backgroundColor: colors.modules.hr + '20',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <User size={24} color={colors.modules.hr} />
                            </View>
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text style={{ color: colors.text.secondary, fontSize: 12 }}>Atanan Çalışan</Text>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginTop: 2 }}>
                                    {asset.assignedToName}
                                </Text>
                            </View>
                            <ArrowLeft size={20} color={colors.text.tertiary} style={{ transform: [{ rotate: '180deg' }] }} />
                        </Pressable>
                    </Animated.View>
                )}

                {/* Asset Information */}
                <Animated.View
                    entering={FadeInDown.duration(400).delay(300)}
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 12
                    }}
                >
                    <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                        Demirbaş Bilgileri
                    </Text>

                    <InfoRow icon={Hash} label="Demirbaş No" value={asset.assetNumber} />
                    <InfoRow icon={Tag} label="Kategori" value={asset.categoryName} />
                    {asset.serialNumber && (
                        <InfoRow icon={Hash} label="Seri No" value={asset.serialNumber} />
                    )}
                    {asset.assignedDate && (
                        <InfoRow icon={Calendar} label="Atama Tarihi" value={formatDate(asset.assignedDate)} />
                    )}
                </Animated.View>

                {/* Purchase Information */}
                <Animated.View
                    entering={FadeInDown.duration(400).delay(400)}
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 12
                    }}
                >
                    <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                        Satın Alma Bilgileri
                    </Text>

                    {asset.purchaseDate && (
                        <InfoRow icon={Calendar} label="Satın Alma Tarihi" value={formatDate(asset.purchaseDate)} />
                    )}
                    {asset.purchasePrice !== undefined && (
                        <InfoRow icon={DollarSign} label="Satın Alma Fiyatı" value={formatCurrency(asset.purchasePrice)} />
                    )}
                    {asset.warrantyExpiry && (
                        <InfoRow icon={Shield} label="Garanti Bitiş" value={formatDate(asset.warrantyExpiry)} />
                    )}
                </Animated.View>

                {/* Description */}
                {asset.description && (
                    <Animated.View
                        entering={FadeInDown.duration(400).delay(500)}
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 12
                        }}
                    >
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                            Açıklama
                        </Text>
                        <View style={{
                            backgroundColor: colors.background.secondary,
                            padding: 12,
                            borderRadius: 8,
                            flexDirection: 'row'
                        }}>
                            <FileText size={18} color={colors.text.secondary} />
                            <Text style={{ color: colors.text.primary, fontSize: 14, marginLeft: 10, flex: 1, lineHeight: 20 }}>
                                {asset.description}
                            </Text>
                        </View>
                    </Animated.View>
                )}

                {/* Notes */}
                {asset.notes && (
                    <Animated.View
                        entering={FadeInDown.duration(400).delay(600)}
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 12
                        }}
                    >
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                            Notlar
                        </Text>
                        <View style={{
                            backgroundColor: colors.background.secondary,
                            padding: 12,
                            borderRadius: 8,
                            flexDirection: 'row'
                        }}>
                            <FileText size={18} color={colors.text.secondary} />
                            <Text style={{ color: colors.text.primary, fontSize: 14, marginLeft: 10, flex: 1, lineHeight: 20 }}>
                                {asset.notes}
                            </Text>
                        </View>
                    </Animated.View>
                )}

                {/* Created At */}
                <Animated.View
                    entering={FadeInDown.duration(400).delay(700)}
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 32
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Clock size={18} color={colors.text.secondary} />
                        <Text style={{ color: colors.text.secondary, fontSize: 14, marginLeft: 8 }}>
                            Oluşturulma: {formatDate(asset.createdAt)}
                        </Text>
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
