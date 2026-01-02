import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Linking,
    Alert
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
    Plus
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import type { Customer, Activity } from '@/lib/api/types/crm.types';

// Mock data
const MOCK_CUSTOMER: Customer = {
    id: '1',
    code: 'MUS-001',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@ornek.com',
    phone: '+90 532 123 4567',
    company: 'ABC Teknoloji',
    address: 'Atatürk Cad. No: 123',
    city: 'İstanbul',
    country: 'Türkiye',
    type: 'company',
    status: 'active',
    tags: ['VIP', 'Teknoloji'],
    notes: 'Önemli müşteri, hızlı teslimat tercih ediyor.',
    totalRevenue: 125000,
    totalOrders: 15,
    lastActivityDate: '2024-12-28',
    createdAt: '2024-01-15',
    updatedAt: '2024-12-28'
};

const MOCK_ACTIVITIES: Activity[] = [
    {
        id: '1',
        type: 'call',
        title: 'Telefon görüşmesi yapıldı',
        description: 'Yeni ürün tanıtımı için görüşme',
        customerId: '1',
        customerName: 'Ahmet Yılmaz',
        completedAt: '2024-12-28T14:30:00',
        createdBy: 'user1',
        createdByName: 'Mehmet Kara',
        createdAt: '2024-12-28T14:30:00'
    },
    {
        id: '2',
        type: 'meeting',
        title: 'Toplantı planlandı',
        description: 'Q1 2025 stratejisi görüşmesi',
        customerId: '1',
        customerName: 'Ahmet Yılmaz',
        dueDate: '2025-01-10T10:00:00',
        createdBy: 'user1',
        createdByName: 'Mehmet Kara',
        createdAt: '2024-12-27T09:00:00'
    },
    {
        id: '3',
        type: 'email',
        title: 'Teklif gönderildi',
        description: 'Yıllık bakım anlaşması teklifi',
        customerId: '1',
        customerName: 'Ahmet Yılmaz',
        completedAt: '2024-12-25T11:00:00',
        createdBy: 'user1',
        createdByName: 'Mehmet Kara',
        createdAt: '2024-12-25T11:00:00'
    }
];

export default function CustomerDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const customer = MOCK_CUSTOMER; // TODO: fetch by id
    const activities = MOCK_ACTIVITIES;

    const handleCall = () => {
        if (customer.phone) {
            Linking.openURL(`tel:${customer.phone}`);
        }
    };

    const handleEmail = () => {
        if (customer.email) {
            Linking.openURL(`mailto:${customer.email}`);
        }
    };

    const handleWhatsApp = () => {
        if (customer.phone) {
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
            case 'call': return Phone;
            case 'email': return Mail;
            case 'meeting': return Calendar;
            case 'task': return Clock;
            default: return MessageCircle;
        }
    };

    const getActivityColor = (type: Activity['type']) => {
        switch (type) {
            case 'call': return colors.semantic.success;
            case 'email': return colors.semantic.info;
            case 'meeting': return colors.modules.purchase;
            case 'task': return colors.semantic.warning;
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
                        {customer.code}
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
                contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
                showsVerticalScrollIndicator={false}
            >
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
                        {customer.type === 'company' ? (
                            <Building2 size={36} color={colors.modules.crm} />
                        ) : (
                            <User size={36} color={colors.modules.crm} />
                        )}
                    </View>
                    <Text style={{ color: colors.text.primary, fontSize: 22, fontWeight: '700', marginBottom: 4 }}>
                        {customer.name}
                    </Text>
                    {customer.company && (
                        <Text style={{ color: colors.text.secondary, fontSize: 15, marginBottom: 8 }}>
                            {customer.company}
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
                        label="Toplam Ciro"
                        value={formatCurrency(customer.totalRevenue || 0)}
                        icon={TrendingUp}
                    />
                    <StatCard
                        label="Sipariş"
                        value={`${customer.totalOrders || 0}`}
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

                {/* Notes */}
                {customer.notes && (
                    <Animated.View entering={FadeInDown.duration(400).delay(250)} className="px-4 mt-6">
                        <Text style={{ color: colors.text.tertiary }} className="text-xs font-bold uppercase mb-3 tracking-wider">
                            Notlar
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
                                {customer.notes}
                            </Text>
                        </View>
                    </Animated.View>
                )}

                {/* Recent Activities */}
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
                                            {activity.title}
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
            </ScrollView>
        </SafeAreaView>
    );
}
