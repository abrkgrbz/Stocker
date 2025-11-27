import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SetupScreen from '../screens/SetupScreen';
import TenantProgressScreen from '../screens/TenantProgressScreen';
import CRMDashboardScreen from '../screens/crm/CRMDashboardScreen';
import CustomerListScreen from '../screens/crm/CustomerListScreen';
import CustomerDetailScreen from '../screens/crm/CustomerDetailScreen';
import AddCustomerScreen from '../screens/crm/AddCustomerScreen';
import DealListScreen from '../screens/crm/DealListScreen';
import DealDetailScreen from '../screens/crm/DealDetailScreen';
import ActivityListScreen from '../screens/crm/ActivityListScreen';
import SalesDashboardScreen from '../screens/sales/SalesDashboardScreen';
import QuoteListScreen from '../screens/sales/QuoteListScreen';
import OrderListScreen from '../screens/sales/OrderListScreen';
import InvoiceListScreen from '../screens/sales/InvoiceListScreen';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { isAuthenticated, isLoading, user } = useAuthStore();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0e27' }}>
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    // Auth Stack
                    <Stack.Group>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="TenantProgress" component={TenantProgressScreen} />
                    </Stack.Group>
                ) : (
                    // App Stack
                    user?.requiresSetup ? (
                        <Stack.Group>
                            <Stack.Screen name="Setup" component={SetupScreen} />
                        </Stack.Group>
                    ) : (
                        <Stack.Group>
                            <Stack.Screen name="Dashboard" component={DashboardScreen} />

                            {/* CRM Module */}
                            <Stack.Screen name="CRMDashboard" component={CRMDashboardScreen} />
                            <Stack.Screen name="CustomerList" component={CustomerListScreen} />
                            <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
                            <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
                            <Stack.Screen name="DealList" component={DealListScreen} />
                            <Stack.Screen name="DealDetail" component={DealDetailScreen} />
                            <Stack.Screen name="ActivityList" component={ActivityListScreen} />

                            {/* Sales Module */}
                            <Stack.Screen name="SalesDashboard" component={SalesDashboardScreen} />
                            <Stack.Screen name="QuoteList" component={QuoteListScreen} />
                            <Stack.Screen name="OrderList" component={OrderListScreen} />
                            <Stack.Screen name="InvoiceList" component={InvoiceListScreen} />
                        </Stack.Group>
                    )
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
