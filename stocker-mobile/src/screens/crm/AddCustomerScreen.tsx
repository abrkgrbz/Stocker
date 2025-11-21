import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';

export default function AddCustomerScreen({ navigation }: any) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        website: '',
        notes: '',
        customerType: 'Corporate', // Default
    });

    const handleSave = async () => {
        if (!formData.companyName || !formData.contactPerson) {
            Alert.alert('Hata', 'Şirket adı ve yetkili kişi alanları zorunludur.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiService.crm.createCustomer(formData);
            if (response.data) {
                Alert.alert('Başarılı', 'Müşteri başarıyla oluşturuldu.', [
                    { text: 'Tamam', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            console.error('Create customer error:', error);
            Alert.alert('Hata', 'Müşteri oluşturulurken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Yeni Müşteri</Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Kaydet</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.content}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Şirket Adı *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.companyName}
                                onChangeText={(text) => setFormData({ ...formData, companyName: text })}
                                placeholder="Örn: Acme A.Ş."
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Yetkili Kişi *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.contactPerson}
                                onChangeText={(text) => setFormData({ ...formData, contactPerson: text })}
                                placeholder="Örn: Ahmet Yılmaz"
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1, marginRight: spacing.s }]}>
                                <Text style={styles.label}>E-posta</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.email}
                                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                                    placeholder="ornek@sirket.com"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1, marginLeft: spacing.s }]}>
                                <Text style={styles.label}>Telefon</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.phone}
                                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                    placeholder="0555 555 55 55"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Web Sitesi</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.website}
                                onChangeText={(text) => setFormData({ ...formData, website: text })}
                                placeholder="www.sirket.com"
                                placeholderTextColor={colors.textMuted}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Adres</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.address}
                                onChangeText={(text) => setFormData({ ...formData, address: text })}
                                placeholder="Adres detayları..."
                                placeholderTextColor={colors.textMuted}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1, marginRight: spacing.s }]}>
                                <Text style={styles.label}>Şehir</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.city}
                                    onChangeText={(text) => setFormData({ ...formData, city: text })}
                                    placeholder="İstanbul"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1, marginLeft: spacing.s }]}>
                                <Text style={styles.label}>Ülke</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.country}
                                    onChangeText={(text) => setFormData({ ...formData, country: text })}
                                    placeholder="Türkiye"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Notlar</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.notes}
                                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                                placeholder="Müşteri hakkında notlar..."
                                placeholderTextColor={colors.textMuted}
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    } as ViewStyle,
    safeArea: {
        flex: 1,
    } as ViewStyle,
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceLight,
    } as ViewStyle,
    backButton: {
        padding: 4,
    } as ViewStyle,
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    } as TextStyle,
    saveButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.xs,
        borderRadius: 8,
    } as ViewStyle,
    saveButtonDisabled: {
        opacity: 0.7,
    } as ViewStyle,
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    } as TextStyle,
    content: {
        padding: spacing.l,
    } as ViewStyle,
    formGroup: {
        marginBottom: spacing.m,
    } as ViewStyle,
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    } as TextStyle,
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
        borderRadius: 8,
        padding: spacing.m,
        color: colors.textPrimary,
        fontSize: 16,
    } as TextStyle,
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    } as TextStyle,
    row: {
        flexDirection: 'row',
    } as ViewStyle,
});
