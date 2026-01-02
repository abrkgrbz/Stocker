import { Stack } from 'expo-router';
import { useTheme } from '@/lib/theme';

export default function CRMLayout() {
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
            <Stack.Screen name="add" />
            <Stack.Screen
                name="deals"
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            />
        </Stack>
    );
}
