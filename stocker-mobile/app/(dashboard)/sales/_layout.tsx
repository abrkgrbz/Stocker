import { Stack } from 'expo-router';
import { useTheme } from '@/lib/theme';

export default function SalesLayout() {
    const { colors } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background.secondary },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="invoices" />
            <Stack.Screen name="quotes" />
            <Stack.Screen name="order/[id]" />
            <Stack.Screen name="invoice/[id]" />
            <Stack.Screen name="quote/[id]" />
            <Stack.Screen name="add-order" />
            <Stack.Screen name="add-quote" />
            <Stack.Screen name="edit-order/[id]" />
            <Stack.Screen name="edit-quote/[id]" />
            <Stack.Screen name="add-invoice" />
            <Stack.Screen name="edit-invoice/[id]" />
        </Stack>
    );
}
