import { Stack } from 'expo-router';
import { useTheme } from '@/lib/theme';

export default function HRLayout() {
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
            <Stack.Screen name="employees" />
            <Stack.Screen name="leaves" />
            <Stack.Screen name="assets" />
            <Stack.Screen name="attendance" />
            <Stack.Screen name="employee/[id]" />
            <Stack.Screen name="leave/[id]" />
            <Stack.Screen name="asset/[id]" />
            <Stack.Screen name="add-leave" />
            <Stack.Screen name="add-employee" />
            <Stack.Screen name="edit-leave/[id]" />
            <Stack.Screen name="edit-employee/[id]" />
        </Stack>
    );
}
