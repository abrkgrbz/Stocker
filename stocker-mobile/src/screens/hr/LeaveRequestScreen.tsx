import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useHRStore } from '../../stores/hrStore';
import { spacing } from '../../theme/theme';

export default function LeaveRequestScreen({ navigation }: any) {
    const { colors, theme } = useTheme();
    const { createLeave, isLoading } = useHRStore();

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [leaveTypeId, setLeaveTypeId] = useState('1'); // Default to Annual Leave for now

    const handleSubmit = async () => {
        if (!startDate || !endDate || !reason) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
            return;
        }

        try {
            await createLeave({
                leaveTypeId: parseInt(leaveTypeId),
                startDate,
                endDate,
                reason
            });
            Alert.alert('Başarılı', 'İzin talebiniz oluşturuldu.', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Hata', 'İzin talebi oluşturulamadı.');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>İzin Talebi</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.formCard, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Başlangıç Tarihi (YYYY-MM-DD)</Text>
                    <TextInput
                        style={[styles.input, { color: colors.textPrimary, borderColor: theme === 'dark' ? '#444' : '#ddd' }]}
                        placeholder="2024-01-01"
                        placeholderTextColor={colors.textSecondary}
                        value={startDate}
                        onChangeText={setStartDate}
                    />

                    <Text style={[styles.label, { color: colors.textSecondary }]}>Bitiş Tarihi (YYYY-MM-DD)</Text>
                    <TextInput
                        style={[styles.input, { color: colors.textPrimary, borderColor: theme === 'dark' ? '#444' : '#ddd' }]}
                        placeholder="2024-01-05"
                        placeholderTextColor={colors.textSecondary}
                        value={endDate}
                        onChangeText={setEndDate}
                    />

                    <Text style={[styles.label, { color: colors.textSecondary }]}>Açıklama</Text>
                    <TextInput
                        style={[styles.input, styles.textArea, { color: colors.textPrimary, borderColor: theme === 'dark' ? '#444' : '#ddd' }]}
                        placeholder="İzin nedeni..."
                        placeholderTextColor={colors.textSecondary}
                        value={reason}
                        onChangeText={setReason}
                        multiline
                        numberOfLines={4}
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: colors.primary }]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Talep Oluştur</Text>
                        )}
                    </TouchableOpacity>
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
    content: {
        padding: spacing.l,
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
    label: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: spacing.m,
        marginBottom: spacing.l,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        padding: spacing.m,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: spacing.s,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
