import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import { spacing } from '../theme/theme';

export default function ProfileScreen({ navigation }: any) {
    const { colors, theme } = useTheme();
    const { user, updateProfile, isLoading } = useAuthStore();

    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = async () => {
        if (!firstName || !lastName || !email) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
            return;
        }

        try {
            await updateProfile({ firstName, lastName, email });
            setIsEditing(false);
            Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
        } catch (error) {
            Alert.alert('Hata', 'Profil güncellenemedi.');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Profil</Text>
                <TouchableOpacity
                    onPress={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Text style={[styles.editButton, { color: colors.primary }]}>
                            {isEditing ? 'Kaydet' : 'Düzenle'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.avatarSection}>
                    <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarText}>
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </Text>
                    </View>
                    <Text style={[styles.name, { color: colors.textPrimary }]}>
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text style={[styles.role, { color: colors.textSecondary }]}>
                        {user?.role}
                    </Text>
                </View>

                <View style={[styles.formCard, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Ad</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: colors.textPrimary,
                                    borderColor: theme === 'dark' ? '#444' : '#ddd',
                                    backgroundColor: isEditing ? (theme === 'dark' ? '#333' : '#f9f9f9') : 'transparent'
                                }
                            ]}
                            value={firstName}
                            onChangeText={setFirstName}
                            editable={isEditing}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Soyad</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: colors.textPrimary,
                                    borderColor: theme === 'dark' ? '#444' : '#ddd',
                                    backgroundColor: isEditing ? (theme === 'dark' ? '#333' : '#f9f9f9') : 'transparent'
                                }
                            ]}
                            value={lastName}
                            onChangeText={setLastName}
                            editable={isEditing}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>E-posta</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: colors.textPrimary,
                                    borderColor: theme === 'dark' ? '#444' : '#ddd',
                                    backgroundColor: isEditing ? (theme === 'dark' ? '#333' : '#f9f9f9') : 'transparent'
                                }
                            ]}
                            value={email}
                            onChangeText={setEmail}
                            editable={isEditing}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.m,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    editButton: {
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        padding: spacing.l,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.m,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    role: {
        fontSize: 16,
        textTransform: 'capitalize',
    },
    formCard: {
        padding: spacing.l,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    inputGroup: {
        marginBottom: spacing.m,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: spacing.m,
        fontSize: 16,
    },
});
