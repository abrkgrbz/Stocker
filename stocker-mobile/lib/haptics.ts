import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Impact haptic - alias for lightHaptic (used by animations)
 */
export const impactHaptic = () => {
    if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
        Haptics.selectionAsync();
    }
};

/**
 * Hafif dokunma geri bildirimi - butonlar, seçimler için
 */
export const lightHaptic = () => {
    if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
        Haptics.selectionAsync();
    }
};

/**
 * Orta dokunma geri bildirimi - önemli aksiyonlar için
 */
export const mediumHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

/**
 * Güçlü dokunma geri bildirimi - başarı/hata durumları için
 */
export const heavyHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

/**
 * Seçim geri bildirimi - toggle, checkbox, picker için
 */
export const selectionHaptic = () => {
    Haptics.selectionAsync();
};

/**
 * Başarı geri bildirimi
 */
export const successHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

/**
 * Uyarı geri bildirimi
 */
export const warningHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

/**
 * Hata geri bildirimi
 */
export const errorHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

/**
 * Tüm haptic fonksiyonlarını içeren obje
 */
export const haptics = {
    light: lightHaptic,
    medium: mediumHaptic,
    heavy: heavyHaptic,
    selection: selectionHaptic,
    success: successHaptic,
    warning: warningHaptic,
    error: errorHaptic,
};

export default haptics;
