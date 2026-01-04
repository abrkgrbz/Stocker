/**
 * Accessibility Utilities for Stocker Mobile
 * Provides helpers for screen readers, reduced motion, and accessibility compliance
 */
import { AccessibilityInfo, Platform } from 'react-native';
import { useEffect, useState, useCallback } from 'react';

// Accessibility state types
interface AccessibilityState {
    isScreenReaderEnabled: boolean;
    isReduceMotionEnabled: boolean;
    isBoldTextEnabled: boolean;
    isGrayscaleEnabled: boolean;
    isInvertColorsEnabled: boolean;
    isReduceTransparencyEnabled: boolean;
}

// Default state
const defaultState: AccessibilityState = {
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    isBoldTextEnabled: false,
    isGrayscaleEnabled: false,
    isInvertColorsEnabled: false,
    isReduceTransparencyEnabled: false,
};

/**
 * Hook to get all accessibility settings
 */
export function useAccessibility(): AccessibilityState {
    const [state, setState] = useState<AccessibilityState>(defaultState);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const [
                    screenReader,
                    reduceMotion,
                    boldText,
                    grayscale,
                    invertColors,
                    reduceTransparency,
                ] = await Promise.all([
                    AccessibilityInfo.isScreenReaderEnabled(),
                    AccessibilityInfo.isReduceMotionEnabled(),
                    Platform.OS === 'ios' ? AccessibilityInfo.isBoldTextEnabled() : Promise.resolve(false),
                    Platform.OS === 'ios' ? AccessibilityInfo.isGrayscaleEnabled() : Promise.resolve(false),
                    Platform.OS === 'ios' ? AccessibilityInfo.isInvertColorsEnabled() : Promise.resolve(false),
                    Platform.OS === 'ios' ? AccessibilityInfo.isReduceTransparencyEnabled() : Promise.resolve(false),
                ]);

                setState({
                    isScreenReaderEnabled: screenReader,
                    isReduceMotionEnabled: reduceMotion,
                    isBoldTextEnabled: boldText,
                    isGrayscaleEnabled: grayscale,
                    isInvertColorsEnabled: invertColors,
                    isReduceTransparencyEnabled: reduceTransparency,
                });
            } catch (error) {
                console.error('Failed to fetch accessibility settings:', error);
            }
        };

        fetchSettings();

        // Listen for changes
        const screenReaderSubscription = AccessibilityInfo.addEventListener(
            'screenReaderChanged',
            (isEnabled) => setState(prev => ({ ...prev, isScreenReaderEnabled: isEnabled }))
        );

        const reduceMotionSubscription = AccessibilityInfo.addEventListener(
            'reduceMotionChanged',
            (isEnabled) => setState(prev => ({ ...prev, isReduceMotionEnabled: isEnabled }))
        );

        return () => {
            screenReaderSubscription.remove();
            reduceMotionSubscription.remove();
        };
    }, []);

    return state;
}

/**
 * Hook for reduced motion preference
 * Returns true if animations should be reduced/disabled
 */
export function useReducedMotion(): boolean {
    const [isReduced, setIsReduced] = useState(false);

    useEffect(() => {
        AccessibilityInfo.isReduceMotionEnabled().then(setIsReduced);

        const subscription = AccessibilityInfo.addEventListener(
            'reduceMotionChanged',
            setIsReduced
        );

        return () => subscription.remove();
    }, []);

    return isReduced;
}

/**
 * Hook for screen reader state
 */
export function useScreenReader(): boolean {
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        AccessibilityInfo.isScreenReaderEnabled().then(setIsEnabled);

        const subscription = AccessibilityInfo.addEventListener(
            'screenReaderChanged',
            setIsEnabled
        );

        return () => subscription.remove();
    }, []);

    return isEnabled;
}

/**
 * Announce message to screen reader
 */
export function announceForAccessibility(message: string): void {
    AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Generate accessibility props for interactive elements
 */
export interface AccessibleProps {
    accessible: boolean;
    accessibilityLabel: string;
    accessibilityHint?: string;
    accessibilityRole?: 'button' | 'link' | 'text' | 'image' | 'header' | 'search' | 'checkbox' | 'radio' | 'switch' | 'alert' | 'progressbar' | 'none';
    accessibilityState?: {
        disabled?: boolean;
        selected?: boolean;
        checked?: boolean | 'mixed';
        busy?: boolean;
        expanded?: boolean;
    };
}

export function createAccessibleProps(
    label: string,
    options?: {
        hint?: string;
        role?: AccessibleProps['accessibilityRole'];
        disabled?: boolean;
        selected?: boolean;
        checked?: boolean | 'mixed';
        busy?: boolean;
        expanded?: boolean;
    }
): AccessibleProps {
    const props: AccessibleProps = {
        accessible: true,
        accessibilityLabel: label,
    };

    if (options?.hint) {
        props.accessibilityHint = options.hint;
    }

    if (options?.role) {
        props.accessibilityRole = options.role;
    }

    const state: AccessibleProps['accessibilityState'] = {};
    if (options?.disabled !== undefined) state.disabled = options.disabled;
    if (options?.selected !== undefined) state.selected = options.selected;
    if (options?.checked !== undefined) state.checked = options.checked;
    if (options?.busy !== undefined) state.busy = options.busy;
    if (options?.expanded !== undefined) state.expanded = options.expanded;

    if (Object.keys(state).length > 0) {
        props.accessibilityState = state;
    }

    return props;
}

/**
 * Format currency for screen readers
 * Converts "₺1,234.56" to "1234 lira 56 kuruş"
 */
export function formatCurrencyForScreenReader(value: number, currency: string = 'TRY'): string {
    const whole = Math.floor(Math.abs(value));
    const decimal = Math.round((Math.abs(value) - whole) * 100);

    if (currency === 'TRY') {
        let result = `${whole} lira`;
        if (decimal > 0) {
            result += ` ${decimal} kuruş`;
        }
        if (value < 0) {
            result = `eksi ${result}`;
        }
        return result;
    }

    return value.toFixed(2);
}

/**
 * Format date for screen readers
 */
export function formatDateForScreenReader(date: Date): string {
    const day = date.getDate();
    const months = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
}

/**
 * Format phone number for screen readers
 * Converts "5301234567" to "5 3 0, 1 2 3, 4 5 6 7"
 */
export function formatPhoneForScreenReader(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits.split('').join(' ').replace(/(.{6})/g, '$1, ');
}

/**
 * Create accessible error message
 */
export function createErrorMessage(field: string, error: string): string {
    return `${field} alanında hata: ${error}`;
}

/**
 * Create accessible success message
 */
export function createSuccessMessage(action: string): string {
    return `${action} başarılı`;
}

/**
 * Hook for focus management
 */
export function useFocusAnnounce() {
    return useCallback((message: string) => {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
            announceForAccessibility(message);
        }, 100);
    }, []);
}

/**
 * Minimum touch target size (44x44 dp as per WCAG)
 */
export const MIN_TOUCH_TARGET = 44;

/**
 * Minimum contrast ratio for text (4.5:1 for normal text, 3:1 for large text)
 */
export const MIN_CONTRAST_RATIO = {
    normal: 4.5,
    large: 3,
};

/**
 * Calculate relative luminance
 */
function getLuminance(hex: string): number {
    const rgb = hex
        .replace('#', '')
        .match(/.{2}/g)
        ?.map(x => {
            const c = parseInt(x, 16) / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        }) || [0, 0, 0];

    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function meetsContrastRequirement(
    foreground: string,
    background: string,
    isLargeText: boolean = false
): boolean {
    const ratio = getContrastRatio(foreground, background);
    const required = isLargeText ? MIN_CONTRAST_RATIO.large : MIN_CONTRAST_RATIO.normal;
    return ratio >= required;
}
