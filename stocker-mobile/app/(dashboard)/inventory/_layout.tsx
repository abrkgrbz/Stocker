import { Stack } from 'expo-router';
import { useTheme } from '@/lib/theme';

export default function InventoryLayout() {
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
            <Stack.Screen name="[id]" />
            <Stack.Screen
                name="scanner"
                options={{
                    presentation: 'fullScreenModal',
                    animation: 'slide_from_bottom',
                }}
            />
            <Stack.Screen name="stock-count" />
        </Stack>
    );
}
