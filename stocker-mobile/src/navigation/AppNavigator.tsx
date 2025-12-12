import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import TenantProgressScreen from '../screens/TenantProgressScreen';
import SetupScreen from '../screens/SetupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
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
import InventoryDashboardScreen from '../screens/inventory/InventoryDashboardScreen';
import ProductListScreen from '../screens/inventory/ProductListScreen';
import ProductDetailScreen from '../screens/inventory/ProductDetailScreen';
import StockMovementScreen from '../screens/inventory/StockMovementScreen';
import BarcodeScannerScreen from '../screens/inventory/BarcodeScannerScreen';
import StockTransferListScreen from '../screens/inventory/StockTransferListScreen';
import CreateStockTransferScreen from '../screens/inventory/CreateStockTransferScreen';
import StockCountListScreen from '../screens/inventory/StockCountListScreen';
import StockCountDetailScreen from '../screens/inventory/StockCountDetailScreen';
import HRDashboardScreen from '../screens/hr/HRDashboardScreen';
import EmployeeListScreen from '../screens/hr/EmployeeListScreen';
import AttendanceScreen from '../screens/hr/AttendanceScreen';
import LeaveRequestScreen from '../screens/hr/LeaveRequestScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    VerifyEmail: { email: string };
    TenantProgress: { registrationId: string };
    ForgotPassword: undefined;
    Setup: undefined;
    Dashboard: undefined;

    // CRM
    CRMDashboard: undefined;
    CustomerList: undefined;
    CustomerDetail: { id: string };
    AddCustomer: undefined;
    DealList: undefined;
    DealDetail: { id: string };
    ActivityList: undefined;

    // Sales
    SalesDashboard: undefined;
    QuoteList: undefined;
    OrderList: undefined;
    InvoiceList: undefined;

    // Inventory
    InventoryDashboard: undefined;
    ProductList: undefined;
    ProductDetail: { id: number };
    StockMovements: undefined;
    BarcodeScanner: undefined;
    StockTransfers: undefined;
    CreateStockTransfer: undefined;
    StockCounts: undefined;
    StockCountDetail: { id: number };

    // HR
    HRDashboard: undefined;
    EmployeeList: undefined;
    Attendance: undefined;
    LeaveRequest: undefined;
    Settings: undefined;
    Profile: undefined;
};

export default function AppNavigator() {
    const { isAuthenticated, isLoading, isInitializing, user } = useAuthStore();

    if (isInitializing || isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0e27' }}>
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    return (
        // @ts-ignore - React 19 types mismatch with NavigationContainer
        <NavigationContainer>
            {/* @ts-ignore - React 19 types mismatch with Stack.Navigator */}
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    // Auth Stack
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
                        <Stack.Screen name="TenantProgress" component={TenantProgressScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    </>
                ) : (
                    // App Stack
                    user?.requiresSetup ? (
                        <>
                            <Stack.Screen name="Setup" component={SetupScreen} />
                        </>
                    ) : (
                        <>
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

                            {/* Inventory Module */}
                            <Stack.Screen name="InventoryDashboard" component={InventoryDashboardScreen} />
                            <Stack.Screen name="ProductList" component={ProductListScreen} />
                            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
                            <Stack.Screen name="StockMovements" component={StockMovementScreen} />
                            <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
                            <Stack.Screen name="StockTransfers" component={StockTransferListScreen} />
                            <Stack.Screen name="CreateStockTransfer" component={CreateStockTransferScreen} />
                            <Stack.Screen name="StockCounts" component={StockCountListScreen} />
                            <Stack.Screen name="StockCountDetail" component={StockCountDetailScreen} />

                            {/* HR Module */}
                            <Stack.Screen name="HRDashboard" component={HRDashboardScreen} />
                            <Stack.Screen name="EmployeeList" component={EmployeeListScreen} />
                            <Stack.Screen name="Attendance" component={AttendanceScreen} />
                            <Stack.Screen name="LeaveRequest" component={LeaveRequestScreen} />
                            <Stack.Screen name="Settings" component={SettingsScreen} />
                            <Stack.Screen name="Profile" component={ProfileScreen} />
                        </>
                    )
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
