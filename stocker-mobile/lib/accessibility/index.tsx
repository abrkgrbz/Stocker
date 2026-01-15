/**
 * Accessibility Utilities for Stocker Mobile
 * Provides helpers for screen readers, reduced motion, and accessibility compliance
 */
import React, { useEffect, useState, useCallback, createContext, useContext, useMemo, useRef, ReactNode } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

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

// ============================================
// Accessibility Provider & Context
// ============================================

interface AccessibilityContextValue {
    /** All accessibility settings */
    settings: AccessibilityState;
    /** Announce message to screen reader */
    announce: (message: string, delay?: number) => void;
    /** Announce loading state */
    announceLoading: (isLoading: boolean, loadingMessage?: string, doneMessage?: string) => void;
    /** Announce list changes */
    announceListChange: (count: number, itemType?: string) => void;
    /** Announce page navigation */
    announcePage: (pageName: string) => void;
    /** Announce form error */
    announceFormError: (fieldName: string, error: string) => void;
    /** Announce action result */
    announceActionResult: (success: boolean, action: string, errorMessage?: string) => void;
    /** Check if animations should be reduced */
    shouldReduceMotion: boolean;
    /** Check if screen reader is active */
    isScreenReaderActive: boolean;
    /** Set focus to an element (requires ref) */
    setFocus: (ref: React.RefObject<any>) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

interface AccessibilityProviderProps {
    children: ReactNode;
}

/**
 * AccessibilityProvider Component
 *
 * Provides accessibility context and utilities throughout the app.
 * Wrap your app root with this provider to enable accessibility features.
 */
export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
    const settings = useAccessibility();
    const lastAnnouncementRef = useRef<string>('');

    const announce = useCallback((message: string, delay: number = 100) => {
        // Prevent duplicate announcements
        if (message === lastAnnouncementRef.current) return;
        lastAnnouncementRef.current = message;

        setTimeout(() => {
            announceForAccessibility(message);
            // Reset after delay to allow same message to be announced again later
            setTimeout(() => {
                lastAnnouncementRef.current = '';
            }, 1000);
        }, delay);
    }, []);

    const announceLoading = useCallback((
        isLoading: boolean,
        loadingMessage: string = 'Yükleniyor',
        doneMessage: string = 'Yükleme tamamlandı'
    ) => {
        if (settings.isScreenReaderEnabled) {
            announce(isLoading ? loadingMessage : doneMessage);
        }
    }, [announce, settings.isScreenReaderEnabled]);

    const announceListChange = useCallback((count: number, itemType: string = 'öğe') => {
        if (settings.isScreenReaderEnabled) {
            const message = count === 0
                ? `${itemType} bulunamadı`
                : `${count} ${itemType} listelendi`;
            announce(message);
        }
    }, [announce, settings.isScreenReaderEnabled]);

    const announcePage = useCallback((pageName: string) => {
        if (settings.isScreenReaderEnabled) {
            announce(`${pageName} sayfası`);
        }
    }, [announce, settings.isScreenReaderEnabled]);

    const announceFormError = useCallback((fieldName: string, error: string) => {
        if (settings.isScreenReaderEnabled) {
            announce(createErrorMessage(fieldName, error));
        }
    }, [announce, settings.isScreenReaderEnabled]);

    const announceActionResult = useCallback((
        success: boolean,
        action: string,
        errorMessage?: string
    ) => {
        if (settings.isScreenReaderEnabled) {
            const message = success
                ? createSuccessMessage(action)
                : `${action} başarısız${errorMessage ? `: ${errorMessage}` : ''}`;
            announce(message);
        }
    }, [announce, settings.isScreenReaderEnabled]);

    const setFocus = useCallback((ref: React.RefObject<any>) => {
        if (ref.current && settings.isScreenReaderEnabled) {
            ref.current.focus?.();
            // Also set accessibility focus on iOS
            if (Platform.OS === 'ios') {
                AccessibilityInfo.setAccessibilityFocus(ref.current);
            }
        }
    }, [settings.isScreenReaderEnabled]);

    const value = useMemo<AccessibilityContextValue>(() => ({
        settings,
        announce,
        announceLoading,
        announceListChange,
        announcePage,
        announceFormError,
        announceActionResult,
        shouldReduceMotion: settings.isReduceMotionEnabled,
        isScreenReaderActive: settings.isScreenReaderEnabled,
        setFocus,
    }), [
        settings,
        announce,
        announceLoading,
        announceListChange,
        announcePage,
        announceFormError,
        announceActionResult,
        setFocus,
    ]);

    return (
        <AccessibilityContext.Provider value={value}>
            {children}
        </AccessibilityContext.Provider>
    );
}

/**
 * Hook to access accessibility context
 */
export function useAccessibilityContext(): AccessibilityContextValue {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
    }
    return context;
}

// ============================================
// Additional Accessibility Hooks
// ============================================

/**
 * Hook for announcing loading state changes
 * Automatically announces when loading starts and ends
 */
export function useLoadingAnnouncement(
    isLoading: boolean,
    options?: {
        loadingMessage?: string;
        doneMessage?: string;
        entityName?: string;
    }
) {
    const prevLoadingRef = useRef(isLoading);
    const { isScreenReaderEnabled } = useAccessibility();

    useEffect(() => {
        if (!isScreenReaderEnabled) return;

        const wasLoading = prevLoadingRef.current;
        prevLoadingRef.current = isLoading;

        if (isLoading && !wasLoading) {
            // Started loading
            const message = options?.loadingMessage
                || (options?.entityName ? `${options.entityName} yükleniyor` : 'Yükleniyor');
            announceForAccessibility(message);
        } else if (!isLoading && wasLoading) {
            // Finished loading
            const message = options?.doneMessage
                || (options?.entityName ? `${options.entityName} yüklendi` : 'Yükleme tamamlandı');
            announceForAccessibility(message);
        }
    }, [isLoading, isScreenReaderEnabled, options]);
}

/**
 * Hook for focus management on modal/sheet open
 * Moves focus to specified element when component mounts
 */
export function useFocusOnMount(
    ref: React.RefObject<any>,
    options?: {
        enabled?: boolean;
        delay?: number;
        announcement?: string;
    }
) {
    const { isScreenReaderEnabled } = useAccessibility();
    const enabled = options?.enabled ?? true;

    useEffect(() => {
        if (!enabled || !isScreenReaderEnabled) return;

        const timeoutId = setTimeout(() => {
            if (ref.current) {
                ref.current.focus?.();
                if (Platform.OS === 'ios') {
                    AccessibilityInfo.setAccessibilityFocus(ref.current);
                }
                if (options?.announcement) {
                    announceForAccessibility(options.announcement);
                }
            }
        }, options?.delay ?? 300);

        return () => clearTimeout(timeoutId);
    }, [enabled, isScreenReaderEnabled, options?.delay, options?.announcement, ref]);
}

/**
 * Hook for announcing list item count changes
 */
export function useListAnnouncement<T>(
    items: T[],
    options?: {
        itemType?: string;
        enabled?: boolean;
    }
) {
    const prevCountRef = useRef(items.length);
    const { isScreenReaderEnabled } = useAccessibility();
    const enabled = options?.enabled ?? true;
    const itemType = options?.itemType ?? 'öğe';

    useEffect(() => {
        if (!enabled || !isScreenReaderEnabled) return;

        const prevCount = prevCountRef.current;
        const currentCount = items.length;
        prevCountRef.current = currentCount;

        // Only announce if count changed
        if (prevCount !== currentCount) {
            const message = currentCount === 0
                ? `${itemType} bulunamadı`
                : `${currentCount} ${itemType} listelendi`;
            announceForAccessibility(message);
        }
    }, [items.length, enabled, isScreenReaderEnabled, itemType]);
}

/**
 * Hook for announcing form validation errors
 */
export function useFormErrorAnnouncement(
    errors: Record<string, string | undefined>,
    fieldLabels?: Record<string, string>
) {
    const prevErrorsRef = useRef<Record<string, string | undefined>>({});
    const { isScreenReaderEnabled } = useAccessibility();

    useEffect(() => {
        if (!isScreenReaderEnabled) return;

        const prevErrors = prevErrorsRef.current;
        prevErrorsRef.current = errors;

        // Find new errors
        const newErrors = Object.entries(errors).filter(([field, error]) => {
            return error && error !== prevErrors[field];
        });

        if (newErrors.length > 0) {
            const [field, error] = newErrors[0];
            const fieldLabel = fieldLabels?.[field] || field;
            announceForAccessibility(createErrorMessage(fieldLabel, error!));
        }
    }, [errors, fieldLabels, isScreenReaderEnabled]);
}

/**
 * Hook for announcing page/screen changes
 */
export function usePageAnnouncement(pageName: string) {
    const { isScreenReaderEnabled } = useAccessibility();

    useEffect(() => {
        if (isScreenReaderEnabled && pageName) {
            // Delay to ensure screen is rendered
            const timeoutId = setTimeout(() => {
                announceForAccessibility(`${pageName} sayfası`);
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [pageName, isScreenReaderEnabled]);
}

/**
 * Hook for getting animation duration based on reduced motion preference
 */
export function useAnimationDuration(normalDuration: number): number {
    const isReduced = useReducedMotion();
    return isReduced ? 0 : normalDuration;
}

/**
 * Hook for safely running animations respecting reduced motion
 */
export function useSafeAnimation() {
    const isReduced = useReducedMotion();

    const getAnimationConfig = useCallback(<T extends object>(config: T): T | { duration: 0 } => {
        if (isReduced) {
            return { duration: 0 } as any;
        }
        return config;
    }, [isReduced]);

    const shouldAnimate = !isReduced;

    return {
        shouldAnimate,
        getAnimationConfig,
        duration: (ms: number) => isReduced ? 0 : ms,
    };
}
