import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Building2,
    MapPin,
    Calendar,
    Camera,
    Check,
    X,
    Edit3,
    Save,
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { authStorage, User as UserType } from '@/lib/auth-store';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import api from '@/lib/axios';

interface ProfileFormData {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
}

export default function ProfileScreen() {
    const router = useRouter();
    const { colors } = useTheme();

    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const [formData, setFormData] = useState<ProfileFormData>({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
    });

    const [originalData, setOriginalData] = useState<ProfileFormData>({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        loadUserData();
    }, []);

    useEffect(() => {
        // Check for changes
        const changed =
            formData.firstName !== originalData.firstName ||
            formData.lastName !== originalData.lastName ||
            formData.phone !== originalData.phone ||
            formData.address !== originalData.address;
        setHasChanges(changed);
    }, [formData, originalData]);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const state = await authStorage.getAuthState();
            setUser(state.user);

            // Parse name into first and last
            const nameParts = (state.user?.name || '').split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            const data: ProfileFormData = {
                firstName,
                lastName,
                phone: state.user?.phone || '',
                address: state.user?.address || '',
            };

            setFormData(data);
            setOriginalData(data);
        } catch (error) {
            console.error('Failed to load user data:', error);
            Alert.alert('Hata', 'Profil bilgileri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof ProfileFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        if (hasChanges) {
            Alert.alert(
                'Değişiklikler Kaydedilmedi',
                'Değişiklikleri iptal etmek istediğinize emin misiniz?',
                [
                    { text: 'Hayır', style: 'cancel' },
                    {
                        text: 'Evet, İptal Et',
                        style: 'destructive',
                        onPress: () => {
                            setFormData(originalData);
                            setIsEditing(false);
                        },
                    },
                ]
            );
        } else {
            setIsEditing(false);
        }
    };

    const handleSave = async () => {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            Alert.alert('Hata', 'Ad ve soyad alanları zorunludur');
            return;
        }

        try {
            setSaving(true);

            // API call to update profile
            await api.put('/account/profile', {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
            });

            // Update local storage
            const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
            if (user) {
                const updatedUser = {
                    ...user,
                    name: fullName,
                    phone: formData.phone.trim(),
                    address: formData.address.trim(),
                };
                await authStorage.setUser(updatedUser);
                setUser(updatedUser);
            }

            setOriginalData(formData);
            setIsEditing(false);
            Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi');
        } catch (error: any) {
            console.error('Failed to save profile:', error);
            Alert.alert(
                'Hata',
                error.response?.data?.message || 'Profil güncellenirken bir hata oluştu'
            );
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name: string | undefined) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const InputField = ({
        icon: Icon,
        label,
        value,
        onChangeText,
        placeholder,
        keyboardType = 'default',
        editable = true,
        multiline = false,
    }: {
        icon: typeof User;
        label: string;
        value: string;
        onChangeText?: (text: string) => void;
        placeholder?: string;
        keyboardType?: 'default' | 'email-address' | 'phone-pad';
        editable?: boolean;
        multiline?: boolean;
    }) => (
        <View style={{ marginBottom: 16 }}>
            <Text
                style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color: colors.text.secondary,
                    marginBottom: 8,
                }}
            >
                {label}
            </Text>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isEditing && editable
                        ? colors.background.tertiary
                        : colors.surface.secondary,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    borderWidth: 1,
                    borderColor: isEditing && editable
                        ? colors.border.secondary
                        : 'transparent',
                }}
            >
                <Icon size={20} color={colors.text.tertiary} />
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType={keyboardType}
                    editable={isEditing && editable}
                    multiline={multiline}
                    style={{
                        flex: 1,
                        paddingVertical: multiline ? 16 : 14,
                        paddingHorizontal: 12,
                        color: colors.text.primary,
                        fontSize: 15,
                        minHeight: multiline ? 80 : undefined,
                        textAlignVertical: multiline ? 'top' : 'center',
                    }}
                />
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: colors.background.secondary,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <ActivityIndicator size="large" color={colors.brand.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <Animated.View
                    entering={FadeIn.duration(300)}
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border.primary,
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 16,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Pressable
                                onPress={() => {
                                    if (hasChanges && isEditing) {
                                        handleCancel();
                                    } else {
                                        router.back();
                                    }
                                }}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: colors.background.tertiary,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <ArrowLeft size={20} color={colors.text.primary} />
                            </Pressable>
                            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary }}>
                                Profil
                            </Text>
                        </View>

                        {!isEditing ? (
                            <Pressable
                                onPress={() => setIsEditing(true)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 6,
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: 20,
                                    backgroundColor: colors.brand.primary,
                                }}
                            >
                                <Edit3 size={16} color="#fff" />
                                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                                    Düzenle
                                </Text>
                            </Pressable>
                        ) : (
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <Pressable
                                    onPress={handleCancel}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        backgroundColor: colors.semantic.errorLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <X size={20} color={colors.semantic.error} />
                                </Pressable>
                                <Pressable
                                    onPress={handleSave}
                                    disabled={!hasChanges || saving}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        backgroundColor: hasChanges
                                            ? colors.semantic.success
                                            : colors.background.tertiary,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: hasChanges ? 1 : 0.5,
                                    }}
                                >
                                    {saving ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Check size={20} color={hasChanges ? '#fff' : colors.text.tertiary} />
                                    )}
                                </Pressable>
                            </View>
                        )}
                    </View>
                </Animated.View>

                <ScrollView
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Avatar Section */}
                    <Animated.View
                        entering={FadeInDown.duration(400).delay(100)}
                        style={{ alignItems: 'center', marginBottom: 32 }}
                    >
                        <View style={{ position: 'relative' }}>
                            <View
                                style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: 50,
                                    backgroundColor: colors.brand.primary,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 36,
                                        fontWeight: '700',
                                        color: '#fff',
                                    }}
                                >
                                    {getInitials(user?.name)}
                                </Text>
                            </View>
                            {isEditing && (
                                <Pressable
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        bottom: 0,
                                        width: 36,
                                        height: 36,
                                        borderRadius: 18,
                                        backgroundColor: colors.surface.primary,
                                        borderWidth: 3,
                                        borderColor: colors.background.secondary,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Camera size={18} color={colors.text.secondary} />
                                </Pressable>
                            )}
                        </View>
                        <Text
                            style={{
                                fontSize: 22,
                                fontWeight: '700',
                                color: colors.text.primary,
                                marginTop: 16,
                            }}
                        >
                            {`${formData.firstName} ${formData.lastName}`.trim() || 'Kullanıcı'}
                        </Text>
                        <Text
                            style={{
                                fontSize: 14,
                                color: colors.text.secondary,
                                marginTop: 4,
                            }}
                        >
                            {user?.email}
                        </Text>
                        {user?.role && (
                            <View
                                style={{
                                    marginTop: 8,
                                    paddingHorizontal: 12,
                                    paddingVertical: 4,
                                    borderRadius: 12,
                                    backgroundColor: colors.brand.primary + '20',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 12,
                                        fontWeight: '600',
                                        color: colors.brand.primary,
                                    }}
                                >
                                    {user.role}
                                </Text>
                            </View>
                        )}
                    </Animated.View>

                    {/* Form Section */}
                    <Animated.View
                        entering={FadeInDown.duration(400).delay(200)}
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: colors.border.primary,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: colors.text.primary,
                                marginBottom: 16,
                            }}
                        >
                            Kişisel Bilgiler
                        </Text>

                        <InputField
                            icon={User}
                            label="Ad"
                            value={formData.firstName}
                            onChangeText={(text) => handleInputChange('firstName', text)}
                            placeholder="Adınız"
                        />

                        <InputField
                            icon={User}
                            label="Soyad"
                            value={formData.lastName}
                            onChangeText={(text) => handleInputChange('lastName', text)}
                            placeholder="Soyadınız"
                        />

                        <InputField
                            icon={Mail}
                            label="E-posta"
                            value={user?.email || ''}
                            placeholder="E-posta adresiniz"
                            keyboardType="email-address"
                            editable={false}
                        />

                        <InputField
                            icon={Phone}
                            label="Telefon"
                            value={formData.phone}
                            onChangeText={(text) => handleInputChange('phone', text)}
                            placeholder="Telefon numaranız"
                            keyboardType="phone-pad"
                        />

                        <InputField
                            icon={MapPin}
                            label="Adres"
                            value={formData.address}
                            onChangeText={(text) => handleInputChange('address', text)}
                            placeholder="Adresiniz"
                            multiline
                        />
                    </Animated.View>

                    {/* Account Info */}
                    <Animated.View
                        entering={FadeInDown.duration(400).delay(300)}
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 16,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: colors.border.primary,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: colors.text.primary,
                                marginBottom: 16,
                            }}
                        >
                            Hesap Bilgileri
                        </Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: colors.background.tertiary,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12,
                                }}
                            >
                                <Building2 size={20} color={colors.text.tertiary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, color: colors.text.tertiary }}>
                                    Çalışma Alanı
                                </Text>
                                <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text.primary }}>
                                    {user?.tenantName || '-'}
                                </Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: colors.background.tertiary,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12,
                                }}
                            >
                                <Calendar size={20} color={colors.text.tertiary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, color: colors.text.tertiary }}>
                                    Kayıt Tarihi
                                </Text>
                                <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text.primary }}>
                                    {user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString('tr-TR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })
                                        : '-'
                                    }
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Save Button (Mobile-friendly at bottom) */}
                    {isEditing && hasChanges && (
                        <Animated.View
                            entering={SlideInRight.duration(300)}
                            style={{ marginTop: 24, marginBottom: 32 }}
                        >
                            <AnimatedButton
                                title="Değişiklikleri Kaydet"
                                loading={saving}
                                onPress={handleSave}
                                icon={<Save size={20} color="#fff" />}
                            />
                        </Animated.View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
