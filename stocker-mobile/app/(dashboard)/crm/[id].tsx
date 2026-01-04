import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Linking,
    Alert,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    ArrowLeft,
    Phone,
    Mail,
    MessageCircle,
    MapPin,
    Building2,
    User,
    Edit,
    MoreVertical,
    Calendar,
    TrendingUp,
    ShoppingCart,
    Clock,
    ChevronRight,
    Plus,
    RefreshCw
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useCustomer, useCustomerActivities } from '@/lib/api/hooks/useCRM';
import type { Customer, Activity } from '@/lib/api/types/crm.types';

export default function CustomerDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    // Fetch customer and activities from API
    const {
        data: customer,
        isLoading,
        isError,
        refetch,
        isRefetching
    } = useCustomer(id || '');

    const {
        data: activities,
        refetch: refetchActivities
    } = useCustomerActivities(id || '');

    // Tab bar height for scroll padding
    const tabBarHeight = 60 + insets.bottom;

    const onRefresh = useCallback(() => {
        refetch();
        refetchActivities();
    }, [refetch, refetchActivities]);

    const handleCall = () => {
        if (customer?.phone) {
            Linking.openURL(`tel:${customer.phone}`);
        }
    };

    const handleEmail = () => {
        if (customer?.email) {
            Linking.openURL(`mailto:${customer.email}`);
        }
    };

    const handleWhatsApp = () => {
        if (customer?.phone) {
            const phoneNumber = customer.phone.replace(/\s+/g, '').replace('+', '');
            Linking.openURL(`whatsapp://send?phone=${phoneNumber}`);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getActivityIcon = (type: Activity['type']) => {
        switch (type) {
            case 'Call': return Phone;
            case 'Email': return Mail;
            case 'Meeting': return Calendar;
            case 'Task': return Clock;
            default: return MessageCircle;
        }
    };

    const getActivityColor = (type: Activity['type']) => {
        switch (type) {
            case 'Call': return colors.semantic.success;
            case 'Email': return colors.semantic.info;
            case 'Meeting': return colors.modules.purchase;
            case 'Task': return colors.semantic.warning;
            default: return colors.text.tertiary;
        }
    };

    const QuickActionButton = ({ icon: Icon, label, color, onPress }: {
        icon: any;
        label: string;
        color: string;
        onPress: () => void;
    }) => (
        <Pressable
            onPress={onPress}
            style={{ alignItems: 'center', flex: 1 }}
        >
            <View
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: color + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6
                }}
            >
                <Icon size={22} color={color} />
            </View>
            <Text style={{ color: colors.text.secondary, fontSize: 12, fontWeight: '500' }}>
                {label}
            </Text>
        </Pressable>
    );

    const StatCard = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => (
        <View
            style={{
                flex: 1,
                backgroundColor: colors.surface.primary,
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: colors.border.primary
            }}
        >
            <View className="flex-row items-center mb-2">
                <Icon size={16} color={colors.text.tertiary} />
                <Text style={{ color: colors.text.tertiary, fontSize: 12, marginLeft: 6 }}>{label}</Text>
            </View>
            <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>{value}</Text>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            {/* Header */}
            <Animated.View
                entering={FadeIn.duration(400)}
                className="px-4 py-3 flex-row items-center"
                style={{
                    backgroundColor: colors.surface.primary,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.primary
                }}
            >
                <Pressable onPress={() => router.back()} className="mr-3 p-2 -ml-2">
                    <ArrowLeft size={24} color={colors.text.primary} />
                </Pressable>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text.primary }} className="text-lg font-bold">
                        Müşteri Detayı
                    </Text>
                    <Text style={{ color: colors.text.tertiary }} className="text-xs">
                        {customer?.companyName || id}
                    </Text>
                </View>
                <Pressable
                    onPress={() => router.push(`/(dashboard)/crm/edit/${id}` as any)}
                    className="p-2"
                >
                    <Edit size={22} color={colors.text.secondary} />
                </Pressable>
                <Pressable className="p-2">
                    <MoreVertical size={22} color={colors.text.secondary} />
                </Pressable>
            </Animated.View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
            >
                {isLoading ? (
                    <View className="items-center justify-center py-20">
                        <ActivityIndicator size="large" color={colors.brand.primary} />
                        <Text style={{ color: colors.text.secondary, fontSize: 14, marginTop: 12 }}>
                            Müşteri yükleniyor...
                        </Text>
                    </View>
                ) : isError || !customer ? (
                    <View className="items-center justify-center py-20">
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
                            Müşteri bulunamadı
                        </Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
                            Müşteri bilgileri yüklenemedi
                        </Text>
                        <Pressable
                            onPress={onRefresh}
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
                ) : (
                    <>
                {/* Profile Section */}
                <Animated.View
                    entering={FadeInDown.duration(400).delay(100)}
                    style={{
                        backgroundColor: colors.surface.primary,
                        padding: 20,
                        alignItems: 'center'
                    }}
                >
                    <View
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 20,
                            backgroundColor: colors.modules.crmLight,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 12
                        }}
                    >
                        {customer.customerType === 'Corporate' ? (
                            <Building2 size={36} color={colors.modules.crm} />
                        ) : (
                            <User size={36} color={colors.modules.crm} />
                        )}
                    </View>
                    <Text style={{ color: colors.text.primary, fontSize: 22, fontWeight: '700', marginBottom: 4 }}>
                        {customer.companyName}
                    </Text>
                    {customer.contactPerson && (
                        <Text style={{ color: colors.text.secondary, fontSize: 15, marginBottom: 8 }}>
                            {customer.contactPerson}
                        </Text>
                    )}
                    <View
                        style={{
                            backgroundColor: colors.semantic.success + '20',
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                            borderRadius: 8
                        }}
                    >
                        <Text style={{ color: colors.semantic.success, fontSize: 13, fontWeight: '600' }}>
                            Aktif Müşteri
                        </Text>
                    </View>

                    {/* Quick Actions */}
                    <View className="flex-row mt-6 w-full">
                        <QuickActionButton
                            icon={Phone}
                            label="Ara"
                            color={colors.semantic.success}
                            onPress={handleCall}
                        />
                        <QuickActionButton
                            icon={Mail}
                            label="E-posta"
                            color={colors.semantic.info}
                            onPress={handleEmail}
                        />
                        <QuickActionButton
                            icon={MessageCircle}
                            label="WhatsApp"
                            color="#25D366"
                            onPress={handleWhatsApp}
                        />
                    </View>
                </Animated.View>

                {/* Stats */}
                <Animated.View
                    entering={FadeInDown.duration(400).delay(150)}
                    className="flex-row px-4 py-4 gap-3"
                >
                    <StatCard
                        label="Yıllık Ciro"
                        value={formatCurrency(customer.annualRevenue || 0)}
                        icon={TrendingUp}
                    />
                    <StatCard
                        label="Kredi Limiti"
                        value={formatCurrency(customer.creditLimit || 0)}
                        icon={ShoppingCart}
                    />
                </Animated.View>

                {/* Contact Info */}
                <Animated.View entering={FadeInDown.duration(400).delay(200)} className="px-4">
                    <Text style={{ color: colors.text.tertiary }} className="text-xs font-bold uppercase mb-3 tracking-wider">
                        İletişim Bilgileri
                    </Text>
                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: colors.border.primary,
                            overflow: 'hidden'
                        }}
                    >
                        {customer.phone && (
                            <Pressable
                                onPress={handleCall}
                                className="flex-row items-center p-4"
                                style={{ borderBottomWidth: 1, borderBottomColor: colors.border.primary }}
                            >
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: colors.semantic.successLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}
                                >
                                    <Phone size={18} color={colors.semantic.success} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>Telefon</Text>
                                    <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '500' }}>
                                        {customer.phone}
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={colors.text.tertiary} />
                            </Pressable>
                        )}

                        {customer.email && (
                            <Pressable
                                onPress={handleEmail}
                                className="flex-row items-center p-4"
                                style={{ borderBottomWidth: 1, borderBottomColor: colors.border.primary }}
                            >
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: colors.semantic.infoLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}
                                >
                                    <Mail size={18} color={colors.semantic.info} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>E-posta</Text>
                                    <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '500' }}>
                                        {customer.email}
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={colors.text.tertiary} />
                            </Pressable>
                        )}

                        {(customer.address || customer.city) && (
                            <View className="flex-row items-center p-4">
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: colors.modules.salesLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}
                                >
                                    <MapPin size={18} color={colors.modules.sales} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>Adres</Text>
                                    <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '500' }}>
                                        {[customer.address, customer.city, customer.country].filter(Boolean).join(', ')}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* Description */}
                {customer.description && (
                    <Animated.View entering={FadeInDown.duration(400).delay(250)} className="px-4 mt-6">
                        <Text style={{ color: colors.text.tertiary }} className="text-xs font-bold uppercase mb-3 tracking-wider">
                            Açıklama
                        </Text>
                        <View
                            style={{
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: colors.border.primary
                            }}
                        >
                            <Text style={{ color: colors.text.primary, fontSize: 14, lineHeight: 22 }}>
                                {customer.description}
                            </Text>
                        </View>
                    </Animated.View>
                )}

                {/* Recent Activities */}
                {activities && activities.length > 0 && (
                    <Animated.View entering={FadeInDown.duration(400).delay(300)} className="px-4 mt-6">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text style={{ color: colors.text.tertiary }} className="text-xs font-bold uppercase tracking-wider">
                                Son Aktiviteler
                            </Text>
                            <Pressable>
                                <Text style={{ color: colors.brand.accent, fontSize: 13, fontWeight: '600' }}>
                                    Tümünü Gör
                                </Text>
                            </Pressable>
                        </View>
                        <View
                            style={{
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: colors.border.primary,
                                overflow: 'hidden'
                            }}
                        >
                            {activities.map((activity, index) => {
                                const Icon = getActivityIcon(activity.type);
                                const iconColor = getActivityColor(activity.type);
                                return (
                                    <View
                                        key={activity.id}
                                        className="flex-row items-start p-4"
                                        style={index < activities.length - 1 ? {
                                            borderBottomWidth: 1,
                                            borderBottomColor: colors.border.primary
                                        } : undefined}
                                    >
                                        <View
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 10,
                                                backgroundColor: iconColor + '20',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 12
                                            }}
                                        >
                                            <Icon size={16} color={iconColor} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '500' }}>
                                                {activity.subject}
                                            </Text>
                                            {activity.description && (
                                                <Text style={{ color: colors.text.secondary, fontSize: 13, marginTop: 2 }} numberOfLines={2}>
                                                    {activity.description}
                                                </Text>
                                            )}
                                            <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 4 }}>
                                                {formatDate(activity.completedAt || activity.createdAt)}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </Animated.View>
                )}

                {/* Add Activity Button */}
                <Animated.View entering={FadeInDown.duration(400).delay(350)} className="px-4 mt-6">
                    <Pressable
                        style={{
                            backgroundColor: colors.brand.primary,
                            borderRadius: 14,
                            paddingVertical: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Plus size={20} color={colors.text.inverse} />
                        <Text style={{ color: colors.text.inverse, fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                            Aktivite Ekle
                        </Text>
                    </Pressable>
                </Animated.View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
