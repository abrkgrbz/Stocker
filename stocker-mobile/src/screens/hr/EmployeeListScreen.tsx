import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useHRStore, Employee } from '../../stores/hrStore';
import { spacing } from '../../theme/theme';

export default function EmployeeListScreen({ navigation }: any) {
    const { colors, theme } = useTheme();
    const { employees, isLoading, fetchEmployees } = useHRStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const filtered = employees.filter(e =>
                e.firstName.toLowerCase().includes(query) ||
                e.lastName.toLowerCase().includes(query) ||
                e.positionName?.toLowerCase().includes(query)
            );
            setFilteredEmployees(filtered);
        } else {
            setFilteredEmployees(employees);
        }
    }, [employees, searchQuery]);

    const renderItem = ({ item }: { item: Employee }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}
            onPress={() => { /* Navigate to Employee Detail */ }}
        >
            <View style={styles.avatarContainer}>
                {item.avatarUrl ? (
                    <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                ) : (
                    <View style={[styles.placeholderAvatar, { backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' }]}>
                        <Text style={[styles.initials, { color: colors.textSecondary }]}>
                            {item.firstName[0]}{item.lastName[0]}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{item.firstName} {item.lastName}</Text>
                <Text style={[styles.position, { color: colors.textSecondary }]}>{item.positionName || 'Pozisyon Yok'}</Text>
                <Text style={[styles.department, { color: colors.primary }]}>{item.departmentName || 'Departman Yok'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={[styles.searchContainer, { backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.textPrimary }]}
                        placeholder="Çalışan Ara..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {isLoading && employees.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredEmployees}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={{ color: colors.textSecondary }}>Çalışan bulunamadı</Text>
                        </View>
                    }
                />
            )}
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
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.m,
        gap: spacing.m,
    },
    backButton: {
        padding: 4,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.m,
        height: 40,
        borderRadius: 20,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.s,
        fontSize: 16,
    },
    listContent: {
        padding: spacing.l,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: 12,
        marginBottom: spacing.m,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    avatarContainer: {
        marginRight: spacing.m,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    placeholderAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardContent: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    position: {
        fontSize: 14,
        marginBottom: 2,
    },
    department: {
        fontSize: 12,
        fontWeight: '500',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
});
