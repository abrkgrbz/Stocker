import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

class HapticService {
    /**
     * Trigger a light impact feedback (e.g., for button presses)
     */
    light() {
        if (Platform.OS === 'web') return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    /**
     * Trigger a medium impact feedback (e.g., for significant actions)
     */
    medium() {
        if (Platform.OS === 'web') return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    /**
     * Trigger a heavy impact feedback (e.g., for destructive actions)
     */
    heavy() {
        if (Platform.OS === 'web') return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    /**
     * Trigger a success notification feedback
     */
    success() {
        if (Platform.OS === 'web') return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    /**
     * Trigger a warning notification feedback
     */
    warning() {
        if (Platform.OS === 'web') return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    /**
     * Trigger an error notification feedback
     */
    error() {
        if (Platform.OS === 'web') return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    /**
     * Trigger a selection change feedback (e.g., for scroll wheels or sliders)
     */
    selection() {
        if (Platform.OS === 'web') return;
        Haptics.selectionAsync();
    }
}

export const hapticService = new HapticService();
