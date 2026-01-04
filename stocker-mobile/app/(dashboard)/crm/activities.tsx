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
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import {
    X,
    Phone,
    Mail,
    Calendar,
    FileText,
    CheckSquare,
    User,
    Clock,
    XCircle,
    MessageSquare
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useActivities } from '@/lib/api/hooks/useCRM';
import type { Activity, ActivityType } from '@/lib/api/types/crm.types';

const ACTIVITY_CONFIG: Record<ActivityType, { label: string; color: string; icon: any }> = {
    call: { label: 'Arama', color: '#22c55e', icon: Phone },
    email: { label: 'E-posta', color: '#3b82f6', icon: Mail },
    meeting: { label: 'Toplantı', color: '#8b5cf6', icon: Calendar },
    task: { label: 'Görev', color: '#f59e0b', icon: CheckSquare },
    note: { label: 'Not', color: '#64748b', icon: FileText },
};

export default function ActivitiesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const [selectedType, setSelectedType] = useState<ActivityType | 'all'>('all');

    const {
        data: activitiesResponse,
        isLoading,
        isError,
        refetch,
        isRefetching
    } = useActivities({
        type: selectedType !== 'all' ? selectedType : undefined,
        pageSize: 100
    });

    const activities = activitiesResponse?.items || [];

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) {
            return 'Az önce';
        } else if (diffHours < 24) {
            return `${diffHours} saat önce`;
        } else if (diffDays < 7) {
            return `${diffDays} gün önce`;
        } else {
            return date.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short'
            });
        }
    };

    const formatDueDate = (dateString?: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const now = new Date();
        const isOverdue = date < now;

        return {
            text: date.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            }),
            isOverdue
        };
    };

    const TypeFilter = ({ type, label }: { type: ActivityType | 'all'; label: string }) => {
        const isSelected = selectedType === type;
        const config = type !== 'all' ? ACTIVITY_CONFIG[type] : null;

        return (
            <Pressable
                onPress={() => setSelectedType(type)}
                style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    backgroundColor: isSelected ? colors.modules.crm : colors.surface.primary,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.modules.crm : colors.border.primary,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}
            >
                {config && (
                    <View
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: config.color,
                            marginRight: 6
                        }}
                    />
                )}
                <Text style={{
                    color: isSelected ? '#fff' : colors.text.secondary,
                    fontSize: 13,
                    fontWeight: '500'
                }}>
                    {label}
                </Text>
            </Pressable>
        );
    };

    const ActivityCard = ({ activity, index }: { activity: Activity; index: number }) => {
        const config = ACTIVITY_CONFIG[activity.type];
        const ActivityIcon = config.icon;
        const dueInfo = formatDueDate(activity.dueDate);

        return (
            <Animated.View entering={FadeInRight.duration(300).delay(index * 50)}>
                <Pressable
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderRadius: 14,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: colors.border.primary,
                        borderLeftWidth: 4,
                        borderLeftColor: config.color
                    }}
                >
                    {/* Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                        <View
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 10,
                                backgroundColor: config.color + '20',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12
                            }}
                        >
                            <ActivityIcon size={20} color={config.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '600', marginBottom: 2 }}>
                                {activity.title}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <User size={12} color={colors.text.tertiary} />
                                <Text style={{ color: colors.text.secondary, fontSize: 12, marginLeft: 4 }}>
                                    {activity.customerName}
                                </Text>
                            </View>
                        </View>
                        <View
                            style={{
                                backgroundColor: config.color + '20',
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                borderRadius: 6
                            }}
                        >
                            <Text style={{ color: config.color, fontSize: 10, fontWeight: '600' }}>
                                {config.label}
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    {activity.description && (
                        <Text
                            style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 12, lineHeight: 18 }}
                            numberOfLines={2}
                        >
                            {activity.description}
                        </Text>
                    )}

                    {/* Footer */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Clock size={12} color={colors.text.tertiary} />
                            <Text style={{ color: colors.text.tertiary, fontSize: 11, marginLeft: 4 }}>
                                {formatDate(activity.createdAt)}
                            </Text>
                            <Text style={{ color: colors.text.tertiary, fontSize: 11, marginLeft: 4 }}>
                                • {activity.createdByName}
                            </Text>
                        </View>

                        {dueInfo && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Calendar size={12} color={dueInfo.isOverdue ? colors.semantic.error : colors.text.tertiary} />
                                <Text style={{
                                    color: dueInfo.isOverdue ? colors.semantic.error : colors.text.tertiary,
                                    fontSize: 11,
                                    marginLeft: 4,
                                    fontWeight: dueInfo.isOverdue ? '600' : '400'
                                }}>
                                    {dueInfo.text}
                                </Text>
                            </View>
                        )}

                        {activity.completedAt && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <CheckSquare size={12} color={colors.semantic.success} />
                                <Text style={{ color: colors.semantic.success, fontSize: 11, marginLeft: 4 }}>
                                    Tamamlandı
                                </Text>
                            </View>
                        )}
                    </View>
                </Pressable>
            </Animated.View>
        );
    };

    // Stats
    const stats = {
        total: activities.length,
        calls: activities.filter(a => a.type === 'call').length,
        emails: activities.filter(a => a.type === 'email').length,
        meetings: activities.filter(a => a.type === 'meeting').length,
        tasks: activities.filter(a => a.type === 'task').length,
    };

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
                <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700' }}>
                        Aktiviteler
                    </Text>
                    <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                        {stats.total} aktivite
                    </Text>
                </View>
                <Pressable
                    onPress={() => router.back()}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: colors.background.tertiary,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={22} color={colors.text.primary} />
                </Pressable>
            </Animated.View>

            {/* Stats Row */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
                >
                    <View
                        style={{
                            backgroundColor: colors.modules.crm,
                            borderRadius: 12,
                            padding: 14,
                            marginRight: 10,
                            minWidth: 90,
                            alignItems: 'center'
                        }}
                    >
                        <MessageSquare size={20} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 4 }}>{stats.total}</Text>
                        <Text style={{ color: '#fff', fontSize: 11, opacity: 0.8 }}>Toplam</Text>
                    </View>

                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 12,
                            padding: 14,
                            marginRight: 10,
                            minWidth: 90,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: colors.border.primary
                        }}
                    >
                        <Phone size={20} color="#22c55e" />
                        <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700', marginTop: 4 }}>{stats.calls}</Text>
                        <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Arama</Text>
                    </View>

                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 12,
                            padding: 14,
                            marginRight: 10,
                            minWidth: 90,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: colors.border.primary
                        }}
                    >
                        <Mail size={20} color="#3b82f6" />
                        <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700', marginTop: 4 }}>{stats.emails}</Text>
                        <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>E-posta</Text>
                    </View>

                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 12,
                            padding: 14,
                            marginRight: 10,
                            minWidth: 90,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: colors.border.primary
                        }}
                    >
                        <Calendar size={20} color="#8b5cf6" />
                        <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700', marginTop: 4 }}>{stats.meetings}</Text>
                        <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Toplantı</Text>
                    </View>

                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 12,
                            padding: 14,
                            minWidth: 90,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: colors.border.primary
                        }}
                    >
                        <CheckSquare size={20} color="#f59e0b" />
                        <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700', marginTop: 4 }}>{stats.tasks}</Text>
                        <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Görev</Text>
                    </View>
                </ScrollView>
            </Animated.View>

            {/* Type Filters */}
            <View style={{ paddingVertical: 8, paddingHorizontal: 16, backgroundColor: colors.surface.primary }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TypeFilter type="all" label="Tümü" />
                    <TypeFilter type="call" label="Arama" />
                    <TypeFilter type="email" label="E-posta" />
                    <TypeFilter type="meeting" label="Toplantı" />
                    <TypeFilter type="task" label="Görev" />
                    <TypeFilter type="note" label="Not" />
                </ScrollView>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 60 + insets.bottom + 24 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={colors.modules.crm}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                        <ActivityIndicator size="large" color={colors.modules.crm} />
                        <Text style={{ color: colors.text.secondary, fontSize: 14, marginTop: 12 }}>
                            Aktiviteler yükleniyor...
                        </Text>
                    </View>
                ) : isError ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
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
                            <XCircle size={28} color={colors.semantic.error} />
                        </View>
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                            Yükleme hatası
                        </Text>
                        <Pressable
                            onPress={() => refetch()}
                            style={{
                                backgroundColor: colors.modules.crm,
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                                borderRadius: 8,
                                marginTop: 12
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '600' }}>Tekrar Dene</Text>
                        </Pressable>
                    </View>
                ) : activities.length === 0 ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                        <View
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 16,
                                backgroundColor: colors.modules.crmLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16
                            }}
                        >
                            <MessageSquare size={28} color={colors.modules.crm} />
                        </View>
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                            Aktivite bulunamadı
                        </Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center' }}>
                            {selectedType !== 'all' ? 'Bu türde aktivite yok' : 'Henüz aktivite eklenmemiş'}
                        </Text>
                    </View>
                ) : (
                    activities.map((activity, index) => (
                        <ActivityCard key={activity.id} activity={activity} index={index} />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
