import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Modal
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    ArrowLeft,
    Save,
    Target,
    DollarSign,
    Calendar,
    User,
    FileText,
    ChevronDown,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    Building2,
    MoreVertical
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useDeal, useUpdateDeal, useUpdateDealStage, useDeleteDeal } from '@/lib/api/hooks/useCRM';
import { useToast } from '@/components/ui';
import type { DealStage } from '@/lib/api/types/crm.types';

const DEAL_STAGES: { value: DealStage; label: string; color: string; icon: any }[] = [
    { value: 'lead', label: 'Potansiyel', color: '#64748b', icon: Target },
    { value: 'qualified', label: 'Nitelikli', color: '#3b82f6', icon: CheckCircle },
    { value: 'proposal', label: 'Teklif', color: '#8b5cf6', icon: DollarSign },
    { value: 'negotiation', label: 'Müzakere', color: '#f59e0b', icon: Clock },
    { value: 'won', label: 'Kazanıldı', color: '#22c55e', icon: CheckCircle },
    { value: 'lost', label: 'Kaybedildi', color: '#ef4444', icon: XCircle },
];

const PROBABILITY_OPTIONS = [10, 25, 50, 75, 90, 100];

export default function DealDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const toast = useToast();

    const { data: deal, isLoading, isError, refetch } = useDeal(id!);
    const { mutate: updateDeal, isPending: isUpdating } = useUpdateDeal();
    const { mutate: updateStage, isPending: isUpdatingStage } = useUpdateDealStage();
    const { mutate: deleteDeal, isPending: isDeleting } = useDeleteDeal();

    const [isEditing, setIsEditing] = useState(false);
    const [showStagePicker, setShowStagePicker] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        value: '',
        probability: 50,
        expectedCloseDate: '',
        notes: '',
    });

    useEffect(() => {
        if (deal) {
            setFormData({
                title: deal.title,
                value: deal.value.toString(),
                probability: deal.probability,
                expectedCloseDate: deal.expectedCloseDate || '',
                notes: deal.notes || '',
            });
        }
    }, [deal]);

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
            month: 'long',
            year: 'numeric'
        });
    };

    const handleSave = () => {
        if (!formData.title.trim()) {
            toast.error('Hata', 'Fırsat adı zorunludur');
            return;
        }
        if (!formData.value || isNaN(parseFloat(formData.value))) {
            toast.error('Hata', 'Geçerli bir tutar girin');
            return;
        }

        updateDeal(
            {
                id: id!,
                data: {
                    title: formData.title.trim(),
                    value: parseFloat(formData.value),
                    probability: formData.probability,
                    expectedCloseDate: formData.expectedCloseDate || undefined,
                    notes: formData.notes.trim() || undefined,
                }
            },
            {
                onSuccess: () => {
                    toast.success('Başarılı', 'Fırsat güncellendi');
                    setIsEditing(false);
                    refetch();
                },
                onError: () => {
                    toast.error('Hata', 'Fırsat güncellenirken bir hata oluştu');
                }
            }
        );
    };

    const handleStageChange = (stage: DealStage) => {
        updateStage(
            { id: id!, stage },
            {
                onSuccess: () => {
                    toast.success('Başarılı', 'Aşama güncellendi');
                    setShowStagePicker(false);
                    refetch();
                },
                onError: () => {
                    toast.error('Hata', 'Aşama güncellenirken bir hata oluştu');
                }
            }
        );
    };

    const handleDelete = () => {
        Alert.alert(
            'Fırsatı Sil',
            'Bu fırsatı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: () => {
                        deleteDeal(id!, {
                            onSuccess: () => {
                                toast.success('Başarılı', 'Fırsat silindi');
                                router.back();
                            },
                            onError: () => {
                                toast.error('Hata', 'Fırsat silinirken bir hata oluştu');
                            }
                        });
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colors.brand.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (isError || !deal) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <XCircle size={48} color={colors.semantic.error} />
                    <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '600', marginTop: 16 }}>
                        Fırsat bulunamadı
                    </Text>
                    <Pressable
                        onPress={() => router.back()}
                        style={{
                            marginTop: 16,
                            paddingHorizontal: 24,
                            paddingVertical: 12,
                            backgroundColor: colors.brand.primary,
                            borderRadius: 10
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '600' }}>Geri Dön</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const stageConfig = DEAL_STAGES.find(s => s.value === deal.stage) || DEAL_STAGES[0];
    const StageIcon = stageConfig.icon;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <Animated.View
                    entering={FadeIn.duration(400)}
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        backgroundColor: colors.surface.primary,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border.primary
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <Pressable onPress={() => router.back()} style={{ marginRight: 12, padding: 8, marginLeft: -8 }}>
                                <ArrowLeft size={24} color={colors.text.primary} />
                            </Pressable>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }} numberOfLines={1}>
                                    {deal.title}
                                </Text>
                                <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                    {deal.customerName}
                                </Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            {isEditing ? (
                                <>
                                    <Pressable
                                        onPress={() => setIsEditing(false)}
                                        style={{
                                            paddingHorizontal: 16,
                                            paddingVertical: 10,
                                            borderRadius: 10,
                                            backgroundColor: colors.background.tertiary,
                                        }}
                                    >
                                        <Text style={{ color: colors.text.secondary, fontWeight: '600' }}>İptal</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={handleSave}
                                        disabled={isUpdating}
                                        style={{
                                            backgroundColor: colors.brand.primary,
                                            paddingHorizontal: 16,
                                            paddingVertical: 10,
                                            borderRadius: 10,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            opacity: isUpdating ? 0.7 : 1,
                                        }}
                                    >
                                        {isUpdating ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <>
                                                <Save size={18} color="#fff" />
                                                <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 6 }}>Kaydet</Text>
                                            </>
                                        )}
                                    </Pressable>
                                </>
                            ) : (
                                <Pressable
                                    onPress={() => setShowMenu(true)}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: colors.background.tertiary,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <MoreVertical size={20} color={colors.text.primary} />
                                </Pressable>
                            )}
                        </View>
                    </View>
                </Animated.View>

                <ScrollView
                    contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Stage Card */}
                    <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                        <Pressable
                            onPress={() => !isEditing && setShowStagePicker(true)}
                            style={{
                                backgroundColor: stageConfig.color,
                                borderRadius: 16,
                                padding: 20,
                                marginBottom: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <StageIcon size={24} color="#fff" />
                                <View style={{ marginLeft: 12 }}>
                                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Aşama</Text>
                                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
                                        {stageConfig.label}
                                    </Text>
                                </View>
                            </View>
                            {!isEditing && <ChevronDown size={24} color="rgba(255,255,255,0.8)" />}
                        </Pressable>
                    </Animated.View>

                    {/* Value Card */}
                    <Animated.View entering={FadeInDown.duration(400).delay(150)}>
                        <View
                            style={{
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 20,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: colors.border.primary,
                                flexDirection: 'row',
                            }}
                        >
                            <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: colors.border.primary, paddingRight: 16 }}>
                                <Text style={{ color: colors.text.tertiary, fontSize: 12, marginBottom: 4 }}>Değer</Text>
                                {isEditing ? (
                                    <TextInput
                                        value={formData.value}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, value: text }))}
                                        keyboardType="decimal-pad"
                                        style={{
                                            color: colors.text.primary,
                                            fontSize: 20,
                                            fontWeight: '700',
                                            padding: 0,
                                        }}
                                    />
                                ) : (
                                    <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700' }}>
                                        {formatCurrency(deal.value)}
                                    </Text>
                                )}
                            </View>
                            <View style={{ flex: 1, paddingLeft: 16 }}>
                                <Text style={{ color: colors.text.tertiary, fontSize: 12, marginBottom: 4 }}>Olasılık</Text>
                                <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700' }}>
                                    %{isEditing ? formData.probability : deal.probability}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Probability Selector (Edit Mode) */}
                    {isEditing && (
                        <Animated.View entering={FadeInDown.duration(400)}>
                            <View
                                style={{
                                    backgroundColor: colors.surface.primary,
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 16,
                                    borderWidth: 1,
                                    borderColor: colors.border.primary,
                                }}
                            >
                                <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 12 }}>
                                    Kazanma Olasılığı
                                </Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                    {PROBABILITY_OPTIONS.map((prob) => (
                                        <Pressable
                                            key={prob}
                                            onPress={() => setFormData(prev => ({ ...prev, probability: prob }))}
                                            style={{
                                                paddingHorizontal: 16,
                                                paddingVertical: 10,
                                                borderRadius: 8,
                                                backgroundColor: formData.probability === prob
                                                    ? colors.brand.primary
                                                    : colors.background.tertiary,
                                            }}
                                        >
                                            <Text style={{
                                                color: formData.probability === prob ? '#fff' : colors.text.secondary,
                                                fontSize: 14,
                                                fontWeight: '500'
                                            }}>
                                                %{prob}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        </Animated.View>
                    )}

                    {/* Details */}
                    <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                        <View
                            style={{
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: colors.border.primary
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: colors.modules.crmLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}
                                >
                                    <Target size={20} color={colors.modules.crm} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                    Detaylar
                                </Text>
                            </View>

                            {/* Title */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: colors.text.tertiary, fontSize: 12, marginBottom: 4 }}>Fırsat Adı</Text>
                                {isEditing ? (
                                    <TextInput
                                        value={formData.title}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                                        style={{
                                            color: colors.text.primary,
                                            fontSize: 15,
                                            padding: 12,
                                            backgroundColor: colors.background.tertiary,
                                            borderRadius: 8,
                                        }}
                                    />
                                ) : (
                                    <Text style={{ color: colors.text.primary, fontSize: 15 }}>{deal.title}</Text>
                                )}
                            </View>

                            {/* Customer */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: colors.text.tertiary, fontSize: 12, marginBottom: 4 }}>Müşteri</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Building2 size={16} color={colors.text.secondary} />
                                    <Text style={{ color: colors.text.primary, fontSize: 15, marginLeft: 8 }}>
                                        {deal.customerName}
                                    </Text>
                                </View>
                            </View>

                            {/* Expected Close Date */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: colors.text.tertiary, fontSize: 12, marginBottom: 4 }}>Beklenen Kapanış</Text>
                                {isEditing ? (
                                    <TextInput
                                        value={formData.expectedCloseDate}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, expectedCloseDate: text }))}
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor={colors.text.tertiary}
                                        style={{
                                            color: colors.text.primary,
                                            fontSize: 15,
                                            padding: 12,
                                            backgroundColor: colors.background.tertiary,
                                            borderRadius: 8,
                                        }}
                                    />
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Calendar size={16} color={colors.text.secondary} />
                                        <Text style={{ color: colors.text.primary, fontSize: 15, marginLeft: 8 }}>
                                            {formatDate(deal.expectedCloseDate)}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Assigned To */}
                            {deal.assignedToName && (
                                <View style={{ marginBottom: 16 }}>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12, marginBottom: 4 }}>Atanan Kişi</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <User size={16} color={colors.text.secondary} />
                                        <Text style={{ color: colors.text.primary, fontSize: 15, marginLeft: 8 }}>
                                            {deal.assignedToName}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Notes */}
                            <View>
                                <Text style={{ color: colors.text.tertiary, fontSize: 12, marginBottom: 4 }}>Notlar</Text>
                                {isEditing ? (
                                    <TextInput
                                        value={formData.notes}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                                        placeholder="Notlar..."
                                        placeholderTextColor={colors.text.tertiary}
                                        multiline
                                        style={{
                                            color: colors.text.primary,
                                            fontSize: 15,
                                            padding: 12,
                                            backgroundColor: colors.background.tertiary,
                                            borderRadius: 8,
                                            minHeight: 80,
                                            textAlignVertical: 'top',
                                        }}
                                    />
                                ) : (
                                    <Text style={{ color: colors.text.primary, fontSize: 15 }}>
                                        {deal.notes || '-'}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </Animated.View>

                    {/* Timestamps */}
                    <Animated.View entering={FadeInDown.duration(400).delay(250)}>
                        <View
                            style={{
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: colors.border.primary
                            }}
                        >
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12, marginBottom: 4 }}>Oluşturulma</Text>
                                    <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                                        {formatDate(deal.createdAt)}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12, marginBottom: 4 }}>Güncelleme</Text>
                                    <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                                        {formatDate(deal.updatedAt)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Stage Picker Modal */}
            <Modal
                visible={showStagePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowStagePicker(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            paddingBottom: insets.bottom + 16,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 16,
                                borderBottomWidth: 1,
                                borderBottomColor: colors.border.primary
                            }}
                        >
                            <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>
                                Aşama Değiştir
                            </Text>
                            <Pressable onPress={() => setShowStagePicker(false)}>
                                <XCircle size={24} color={colors.text.secondary} />
                            </Pressable>
                        </View>

                        <View style={{ padding: 16 }}>
                            {DEAL_STAGES.map((stage) => {
                                const Icon = stage.icon;
                                const isSelected = deal.stage === stage.value;
                                return (
                                    <Pressable
                                        key={stage.value}
                                        onPress={() => handleStageChange(stage.value)}
                                        disabled={isUpdatingStage}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            padding: 16,
                                            borderRadius: 12,
                                            marginBottom: 8,
                                            backgroundColor: isSelected ? stage.color + '20' : colors.background.tertiary,
                                            borderWidth: 2,
                                            borderColor: isSelected ? stage.color : 'transparent',
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 20,
                                                backgroundColor: stage.color + '30',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 12
                                            }}
                                        >
                                            <Icon size={20} color={stage.color} />
                                        </View>
                                        <Text style={{
                                            color: isSelected ? stage.color : colors.text.primary,
                                            fontSize: 16,
                                            fontWeight: isSelected ? '700' : '500'
                                        }}>
                                            {stage.label}
                                        </Text>
                                        {isSelected && (
                                            <CheckCircle size={20} color={stage.color} style={{ marginLeft: 'auto' }} />
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Menu Modal */}
            <Modal
                visible={showMenu}
                transparent
                animationType="fade"
                onRequestClose={() => setShowMenu(false)}
            >
                <Pressable
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onPress={() => setShowMenu(false)}
                >
                    <View
                        style={{
                            position: 'absolute',
                            top: insets.top + 60,
                            right: 16,
                            backgroundColor: colors.surface.primary,
                            borderRadius: 12,
                            paddingVertical: 8,
                            minWidth: 160,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 12,
                            elevation: 8,
                        }}
                    >
                        <Pressable
                            onPress={() => {
                                setShowMenu(false);
                                setIsEditing(true);
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                            }}
                        >
                            <Save size={18} color={colors.text.primary} />
                            <Text style={{ color: colors.text.primary, fontSize: 15, marginLeft: 12 }}>
                                Düzenle
                            </Text>
                        </Pressable>
                        <View style={{ height: 1, backgroundColor: colors.border.primary, marginHorizontal: 16 }} />
                        <Pressable
                            onPress={() => {
                                setShowMenu(false);
                                handleDelete();
                            }}
                            disabled={isDeleting}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                            }}
                        >
                            <Trash2 size={18} color={colors.semantic.error} />
                            <Text style={{ color: colors.semantic.error, fontSize: 15, marginLeft: 12 }}>
                                Sil
                            </Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
