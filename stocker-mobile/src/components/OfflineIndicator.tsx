import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export const OfflineIndicator = () => {
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected ?? true);
        });

        return () => unsubscribe();
    }, []);

    if (isConnected) return null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Ionicons name="cloud-offline" size={20} color="#fff" />
                <Text style={styles.text}>Çevrimdışı Mod</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.error,
        zIndex: 9999,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 8,
    },
    text: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
