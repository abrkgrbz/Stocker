import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SetupScreen from '../screens/SetupScreen';
import CRMDashboardScreen from '../screens/crm/CRMDashboardScreen';
import CustomerListScreen from '../screens/crm/CustomerListScreen';
import CustomerDetailScreen from '../screens/crm/CustomerDetailScreen';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { isAuthenticated, isInitializing, user } = useAuthStore();

    if (isInitializing) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0e27' }}>
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    user?.requiresSetup ? (
                        <Stack.Screen name="Setup" component={SetupScreen} />
                    ) : (
                        <>
                            <Stack.Screen name="Dashboard" component={DashboardScreen} />
                            <Stack.Screen name="CRMDashboard" component={CRMDashboardScreen} />
                            <Stack.Screen name="CustomerList" component={CustomerListScreen} />
                            <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
                        </>
                    )
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
