import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    RefreshControl,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import {
    X,
    TrendingUp,
    DollarSign,
    Calendar,
    User,
    Target,
    CheckCircle,
    XCircle,
    Clock,
    ArrowRight,
    Filter,
    ChevronDown,
    Plus
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useDeals, usePipelineStats } from '@/lib/api/hooks/useCRM';
import {
    SortSheet,
    SortButton,
    type SortOption,
    type SortValue
} from '@/components/ui';
import type { Opportunity, UIOpportunityStage } from '@/lib/api/types/crm.types';
import { UI_TO_BACKEND_STAGE, BACKEND_TO_UI_STAGE } from '@/lib/api/types/crm.types';

// Use UIOpportunityStage for UI and DealStage alias for backward compatibility
type DealStage = UIOpportunityStage;
type Deal = Opportunity & { title: string; value: number; stage: UIOpportunityStage };

const SORT_OPTIONS: SortOption[] = [
    { key: 'amount', label: 'Değer', icon: <DollarSign size={18} color="#64748b" /> },
    { key: 'probability', label: 'Olasılık', icon: <Target size={18} color="#64748b" /> },
    { key: 'expectedCloseDate', label: 'Kapanış Tarihi', icon: <Calendar size={18} color="#64748b" /> },
    { key: 'name', label: 'Başlık', icon: <TrendingUp size={18} color="#64748b" /> },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STAGE_CONFIG: Record<DealStage, { label: string; color: string; icon: any }> = {
    lead: { label: 'Potansiyel', color: '#64748b', icon: Target },
    qualified: { label: 'Nitelikli', color: '#3b82f6', icon: CheckCircle },
    proposal: { label: 'Teklif', color: '#8b5cf6', icon: DollarSign },
    negotiation: { label: 'Müzakere', color: '#f59e0b', icon: Clock },
    won: { label: 'Kazanıldı', color: '#22c55e', icon: CheckCircle },
    lost: { label: 'Kaybedildi', color: '#ef4444', icon: XCircle },
};

export default function DealsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const [selectedStage, setSelectedStage] = useState<DealStage | 'all'>('all');
    const [showSortSheet, setShowSortSheet] = useState(false);
    const [sortValue, setSortValue] = useState<SortValue | null>(null);

    const {
        data: dealsResponse,
        isLoading,
        isError,
        refetch,
        isRefetching
    } = useDeals({
        status: selectedStage !== 'all' ? UI_TO_BACKEND_STAGE[selectedStage] : undefined,
        pageSize: 100
    });

    const {
        data: pipelineStats,
        isLoading: isLoadingStats
    } = usePipelineStats();

    // Transform backend Opportunity to UI Deal format
    const deals: Deal[] = (dealsResponse?.items || []).map((opp) => ({
        ...opp,
        title: opp.name,
        value: opp.amount,
        stage: BACKEND_TO_UI_STAGE[opp.status],
    }));

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short'
        });
    };

    // Sort deals
    const sortedDeals = useMemo(() => {
        let result = [...deals];

        if (sortValue) {
            result.sort((a, b) => {
                let comparison = 0;
                switch (sortValue.key) {
                    case 'amount':
                    case 'value':
                        comparison = a.value - b.value;
                        break;
                    case 'probability':
                        comparison = a.probability - b.probability;
                        break;
                    case 'expectedCloseDate':
                        comparison = new Date(a.expectedCloseDate || 0).getTime() - new Date(b.expectedCloseDate || 0).getTime();
                        break;
                    case 'name':
                    case 'title':
                        comparison = a.title.localeCompare(b.title);
                        break;
                }
                return sortValue.order === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [deals, sortValue]);

    // Group deals by stage for pipeline view
    const dealsByStage = useMemo(() => {
        const grouped: Record<DealStage, Deal[]> = {
            lead: [],
            qualified: [],
            proposal: [],
            negotiation: [],
            won: [],
            lost: [],
        };

        deals.forEach(deal => {
            if (grouped[deal.stage]) {
                grouped[deal.stage].push(deal);
            }
        });

        return grouped;
    }, [deals]);

    const StageFilter = ({ stage, label }: { stage: DealStage | 'all'; label: string }) => {
        const isSelected = selectedStage === stage;
        const config = stage !== 'all' ? STAGE_CONFIG[stage] : null;

        return (
            <Pressable
                onPress={() => setSelectedStage(stage)}
                style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    backgroundColor: isSelected ? colors.brand.primary : colors.surface.primary,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.brand.primary : colors.border.primary,
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
                    color: isSelected ? colors.text.inverse : colors.text.secondary,
                    fontSize: 13,
                    fontWeight: '500'
                }}>
                    {label}
                </Text>
            </Pressable>
        );
    };

    const DealCard = ({ deal, index }: { deal: Deal; index: number }) => {
        const stageConfig = STAGE_CONFIG[deal.stage];
        const StageIcon = stageConfig.icon;

        return (
            <Animated.View entering={FadeInRight.duration(300).delay(index * 50)}>
                <Pressable
                    onPress={() => router.push(`/(dashboard)/crm/deal/${deal.id}`)}
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderRadius: 14,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: colors.border.primary,
                        borderLeftWidth: 4,
                        borderLeftColor: stageConfig.color
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                                {deal.title}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <User size={14} color={colors.text.tertiary} />
                                <Text style={{ color: colors.text.secondary, fontSize: 13, marginLeft: 4 }}>
                                    {deal.customerName}
                                </Text>
                            </View>
                        </View>
                        <View
                            style={{
                                backgroundColor: stageConfig.color + '20',
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 6,
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            <StageIcon size={12} color={stageConfig.color} />
                            <Text style={{ color: stageConfig.color, fontSize: 11, fontWeight: '600', marginLeft: 4 }}>
                                {stageConfig.label}
                            </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border.primary }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Değer</Text>
                            <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '700' }}>
                                {formatCurrency(deal.value)}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Olasılık</Text>
                            <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '700' }}>
                                %{deal.probability}
                            </Text>
                        </View>
                        {deal.expectedCloseDate && (
                            <View style={{ alignItems: 'flex-end', marginLeft: 16 }}>
                                <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Kapanış</Text>
                                <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '500' }}>
                                    {formatDate(deal.expectedCloseDate)}
                                </Text>
                            </View>
                        )}
                    </View>
                </Pressable>
            </Animated.View>
        );
    };

    const PipelineStatsCard = () => {
        if (isLoadingStats || !pipelineStats) return null;

        return (
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                <View
                    style={{
                        backgroundColor: colors.modules.crm,
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 16
                    }}
                >
                    <Text style={{ color: '#fff', fontSize: 14, opacity: 0.8, marginBottom: 8 }}>
                        Pipeline Özeti
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>
                            {formatCurrency(pipelineStats.totalValue)}
                        </Text>
                        <Text style={{ color: '#fff', fontSize: 14, opacity: 0.8, marginLeft: 8 }}>
                            toplam değer
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>Aktif Fırsatlar</Text>
                            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>
                                {pipelineStats.totalOpportunities}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>Bu Ay Kazanılan</Text>
                            <Text style={{ color: '#22c55e', fontSize: 20, fontWeight: '700' }}>
                                {pipelineStats.wonThisMonth}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>Bu Ay Kaybedilen</Text>
                            <Text style={{ color: '#ef4444', fontSize: 20, fontWeight: '700' }}>
                                {pipelineStats.lostThisMonth}
                            </Text>
                        </View>
                    </View>
                </View>
            </Animated.View>
        );
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
                        Fırsatlar
                    </Text>
                    <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                        {deals.length} fırsat
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                        onPress={() => router.push('/(dashboard)/crm/deal/new')}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: colors.brand.primary,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Plus size={22} color="#fff" />
                    </Pressable>
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
                </View>
            </Animated.View>

            {/* Stage Filters */}
            <View style={{ paddingVertical: 12, paddingHorizontal: 16, backgroundColor: colors.surface.primary }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <StageFilter stage="all" label="Tümü" />
                    <StageFilter stage="lead" label="Potansiyel" />
                    <StageFilter stage="qualified" label="Nitelikli" />
                    <StageFilter stage="proposal" label="Teklif" />
                    <StageFilter stage="negotiation" label="Müzakere" />
                    <StageFilter stage="won" label="Kazanıldı" />
                    <StageFilter stage="lost" label="Kaybedildi" />
                </ScrollView>
                {/* Sort Button */}
                <View style={{ marginTop: 12 }}>
                    <SortButton
                        onPress={() => setShowSortSheet(true)}
                        value={sortValue}
                        options={SORT_OPTIONS}
                    />
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 60 + insets.bottom + 24 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                        <ActivityIndicator size="large" color={colors.brand.primary} />
                        <Text style={{ color: colors.text.secondary, fontSize: 14, marginTop: 12 }}>
                            Fırsatlar yükleniyor...
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
                                backgroundColor: colors.brand.primary,
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                                borderRadius: 8,
                                marginTop: 12
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '600' }}>Tekrar Dene</Text>
                        </Pressable>
                    </View>
                ) : (
                    <>
                        <PipelineStatsCard />

                        {deals.length === 0 ? (
                            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
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
                                    <Target size={28} color={colors.modules.crm} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                                    Fırsat bulunamadı
                                </Text>
                                <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center' }}>
                                    {selectedStage !== 'all' ? 'Bu aşamada fırsat yok' : 'Henüz fırsat eklenmemiş'}
                                </Text>
                            </View>
                        ) : (
                            sortedDeals.map((deal, index) => (
                                <DealCard key={deal.id} deal={deal} index={index} />
                            ))
                        )}
                    </>
                )}
            </ScrollView>

            {/* Sort Sheet */}
            <SortSheet
                visible={showSortSheet}
                onClose={() => setShowSortSheet(false)}
                options={SORT_OPTIONS}
                value={sortValue}
                onChange={setSortValue}
                title="Sıralama"
            />
        </SafeAreaView>
    );
}
