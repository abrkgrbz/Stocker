/**
 * Security Utilities
 * Rate limiting, session timeout, and security monitoring
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

// ============================================
// Rate Limiting
// ============================================

interface RateLimitConfig {
    maxAttempts: number;
    windowMs: number;
    lockoutMs: number;
}

interface RateLimitState {
    attempts: number;
    firstAttemptTime: number;
    lockedUntil: number | null;
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lockoutMs: 30 * 60 * 1000, // 30 minutes lockout
};

const RATE_LIMIT_STORAGE_KEY = '@security/rate_limit';

/**
 * Rate limiter for login attempts and sensitive operations
 */
export class RateLimiter {
    private config: RateLimitConfig;
    private key: string;
    private state: RateLimitState;

    constructor(key: string, config: Partial<RateLimitConfig> = {}) {
        this.key = `${RATE_LIMIT_STORAGE_KEY}:${key}`;
        this.config = { ...DEFAULT_RATE_LIMIT, ...config };
        this.state = {
            attempts: 0,
            firstAttemptTime: 0,
            lockedUntil: null,
        };
    }

    async initialize(): Promise<void> {
        try {
            const stored = await AsyncStorage.getItem(this.key);
            if (stored) {
                this.state = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load rate limit state:', error);
        }
    }

    private async save(): Promise<void> {
        try {
            await AsyncStorage.setItem(this.key, JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to save rate limit state:', error);
        }
    }

    async checkLimit(): Promise<{
        allowed: boolean;
        remainingAttempts: number;
        lockoutRemainingMs: number | null;
        message?: string;
    }> {
        const now = Date.now();

        // Check if currently locked out
        if (this.state.lockedUntil && now < this.state.lockedUntil) {
            const remainingMs = this.state.lockedUntil - now;
            const remainingMinutes = Math.ceil(remainingMs / 60000);
            return {
                allowed: false,
                remainingAttempts: 0,
                lockoutRemainingMs: remainingMs,
                message: `Çok fazla deneme. ${remainingMinutes} dakika sonra tekrar deneyin.`,
            };
        }

        // Clear lockout if expired
        if (this.state.lockedUntil && now >= this.state.lockedUntil) {
            this.state = {
                attempts: 0,
                firstAttemptTime: 0,
                lockedUntil: null,
            };
            await this.save();
        }

        // Reset window if expired
        if (this.state.firstAttemptTime && now - this.state.firstAttemptTime > this.config.windowMs) {
            this.state = {
                attempts: 0,
                firstAttemptTime: 0,
                lockedUntil: null,
            };
            await this.save();
        }

        const remainingAttempts = this.config.maxAttempts - this.state.attempts;

        return {
            allowed: remainingAttempts > 0,
            remainingAttempts: Math.max(0, remainingAttempts),
            lockoutRemainingMs: null,
        };
    }

    async recordAttempt(success: boolean): Promise<{
        allowed: boolean;
        remainingAttempts: number;
        lockoutRemainingMs: number | null;
        message?: string;
    }> {
        const now = Date.now();

        if (success) {
            // Reset on successful attempt
            this.state = {
                attempts: 0,
                firstAttemptTime: 0,
                lockedUntil: null,
            };
            await this.save();
            return {
                allowed: true,
                remainingAttempts: this.config.maxAttempts,
                lockoutRemainingMs: null,
            };
        }

        // Record failed attempt
        if (this.state.attempts === 0) {
            this.state.firstAttemptTime = now;
        }
        this.state.attempts++;

        // Check if should be locked out
        if (this.state.attempts >= this.config.maxAttempts) {
            this.state.lockedUntil = now + this.config.lockoutMs;
            await this.save();

            const remainingMinutes = Math.ceil(this.config.lockoutMs / 60000);
            return {
                allowed: false,
                remainingAttempts: 0,
                lockoutRemainingMs: this.config.lockoutMs,
                message: `Hesabınız ${remainingMinutes} dakika boyunca kilitlendi.`,
            };
        }

        await this.save();
        const remainingAttempts = this.config.maxAttempts - this.state.attempts;

        return {
            allowed: true,
            remainingAttempts,
            lockoutRemainingMs: null,
            message: `${remainingAttempts} deneme hakkınız kaldı.`,
        };
    }

    async reset(): Promise<void> {
        this.state = {
            attempts: 0,
            firstAttemptTime: 0,
            lockedUntil: null,
        };
        await this.save();
    }
}

/**
 * Hook for rate limiting
 */
export function useRateLimiter(key: string, config?: Partial<RateLimitConfig>) {
    const limiter = useRef<RateLimiter | null>(null);
    const [state, setState] = useState({
        allowed: true,
        remainingAttempts: config?.maxAttempts ?? DEFAULT_RATE_LIMIT.maxAttempts,
        lockoutRemainingMs: null as number | null,
        message: undefined as string | undefined,
        isLocked: false,
    });

    useEffect(() => {
        limiter.current = new RateLimiter(key, config);
        limiter.current.initialize().then(() => {
            limiter.current?.checkLimit().then((result) => {
                setState({
                    ...result,
                    message: result.message,
                    isLocked: !result.allowed,
                });
            });
        });
    }, [key]);

    // Update lockout timer
    useEffect(() => {
        if (!state.lockoutRemainingMs) return;

        const interval = setInterval(() => {
            setState((prev) => {
                if (!prev.lockoutRemainingMs) return prev;

                const remaining = prev.lockoutRemainingMs - 1000;
                if (remaining <= 0) {
                    limiter.current?.checkLimit().then((result) => {
                        setState({
                            ...result,
                            message: result.message,
                            isLocked: !result.allowed,
                        });
                    });
                    return prev;
                }

                const remainingMinutes = Math.ceil(remaining / 60000);
                return {
                    ...prev,
                    lockoutRemainingMs: remaining,
                    message: `Çok fazla deneme. ${remainingMinutes} dakika sonra tekrar deneyin.`,
                };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [state.lockoutRemainingMs]);

    const recordAttempt = useCallback(async (success: boolean) => {
        if (!limiter.current) return;

        const result = await limiter.current.recordAttempt(success);
        setState({
            ...result,
            message: result.message,
            isLocked: !result.allowed,
        });
        return result;
    }, []);

    const checkLimit = useCallback(async () => {
        if (!limiter.current) return state;

        const result = await limiter.current.checkLimit();
        setState({
            ...result,
            message: result.message,
            isLocked: !result.allowed,
        });
        return result;
    }, [state]);

    const reset = useCallback(async () => {
        if (!limiter.current) return;

        await limiter.current.reset();
        setState({
            allowed: true,
            remainingAttempts: config?.maxAttempts ?? DEFAULT_RATE_LIMIT.maxAttempts,
            lockoutRemainingMs: null,
            message: undefined,
            isLocked: false,
        });
    }, [config?.maxAttempts]);

    return {
        ...state,
        recordAttempt,
        checkLimit,
        reset,
    };
}

// ============================================
// Session Timeout
// ============================================

interface SessionConfig {
    timeoutMs: number;
    warningMs: number;
    extendOnActivity: boolean;
}

const DEFAULT_SESSION_CONFIG: SessionConfig = {
    timeoutMs: 15 * 60 * 1000, // 15 minutes
    warningMs: 2 * 60 * 1000, // 2 minutes warning
    extendOnActivity: true,
};

const SESSION_STORAGE_KEY = '@security/session';

/**
 * Hook for session timeout management
 */
export function useSessionTimeout(
    onTimeout: () => void,
    onWarning?: () => void,
    config?: Partial<SessionConfig>
) {
    const mergedConfig = { ...DEFAULT_SESSION_CONFIG, ...config };
    const lastActivityRef = useRef(Date.now());
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showWarning, setShowWarning] = useState(false);
    const [remainingTime, setRemainingTime] = useState(mergedConfig.timeoutMs);

    const clearTimers = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (warningRef.current) {
            clearTimeout(warningRef.current);
            warningRef.current = null;
        }
    }, []);

    const startTimers = useCallback(() => {
        clearTimers();

        const warningTime = mergedConfig.timeoutMs - mergedConfig.warningMs;

        warningRef.current = setTimeout(() => {
            setShowWarning(true);
            onWarning?.();

            // Start countdown
            const countdownInterval = setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev <= 1000) {
                        clearInterval(countdownInterval);
                        return 0;
                    }
                    return prev - 1000;
                });
            }, 1000);
        }, warningTime);

        timeoutRef.current = setTimeout(() => {
            setShowWarning(false);
            onTimeout();
        }, mergedConfig.timeoutMs);

        setRemainingTime(mergedConfig.timeoutMs);
    }, [mergedConfig.timeoutMs, mergedConfig.warningMs, onTimeout, onWarning, clearTimers]);

    const extendSession = useCallback(() => {
        lastActivityRef.current = Date.now();
        setShowWarning(false);
        startTimers();

        // Save last activity time
        AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
            lastActivity: lastActivityRef.current,
        })).catch(console.error);
    }, [startTimers]);

    const recordActivity = useCallback(() => {
        if (mergedConfig.extendOnActivity) {
            extendSession();
        }
    }, [mergedConfig.extendOnActivity, extendSession]);

    // Handle app state changes
    useEffect(() => {
        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                // Check if session expired while app was in background
                try {
                    const stored = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
                    if (stored) {
                        const { lastActivity } = JSON.parse(stored);
                        const elapsed = Date.now() - lastActivity;

                        if (elapsed >= mergedConfig.timeoutMs) {
                            onTimeout();
                            return;
                        }
                    }
                } catch (error) {
                    console.error('Failed to check session:', error);
                }

                // Resume timers
                extendSession();
            } else if (nextAppState === 'background') {
                // Save current state
                AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
                    lastActivity: lastActivityRef.current,
                })).catch(console.error);
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Start initial timer
        extendSession();

        return () => {
            subscription.remove();
            clearTimers();
        };
    }, [mergedConfig.timeoutMs, onTimeout, extendSession, clearTimers]);

    return {
        showWarning,
        remainingTime,
        remainingMinutes: Math.ceil(remainingTime / 60000),
        remainingSeconds: Math.ceil(remainingTime / 1000) % 60,
        extendSession,
        recordActivity,
    };
}

// ============================================
// Security Monitoring
// ============================================

interface SecurityEvent {
    type: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'session_timeout' | 'rate_limit' | 'suspicious_activity';
    timestamp: number;
    details?: Record<string, any>;
}

const SECURITY_LOG_KEY = '@security/log';
const MAX_LOG_ENTRIES = 100;

/**
 * Log security events
 */
export async function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
    try {
        const storedLog = await AsyncStorage.getItem(SECURITY_LOG_KEY);
        const log: SecurityEvent[] = storedLog ? JSON.parse(storedLog) : [];

        log.unshift({
            ...event,
            timestamp: Date.now(),
        });

        // Keep only last N entries
        const trimmedLog = log.slice(0, MAX_LOG_ENTRIES);

        await AsyncStorage.setItem(SECURITY_LOG_KEY, JSON.stringify(trimmedLog));
    } catch (error) {
        console.error('Failed to log security event:', error);
    }
}

/**
 * Get security log
 */
export async function getSecurityLog(): Promise<SecurityEvent[]> {
    try {
        const storedLog = await AsyncStorage.getItem(SECURITY_LOG_KEY);
        return storedLog ? JSON.parse(storedLog) : [];
    } catch (error) {
        console.error('Failed to get security log:', error);
        return [];
    }
}

/**
 * Clear security log
 */
export async function clearSecurityLog(): Promise<void> {
    try {
        await AsyncStorage.removeItem(SECURITY_LOG_KEY);
    } catch (error) {
        console.error('Failed to clear security log:', error);
    }
}

// ============================================
// Input Sanitization
// ============================================

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/[<>]/g, '') // Remove HTML brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
}

/**
 * Check for suspicious patterns in input
 */
export function detectSuspiciousInput(input: string): boolean {
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /\beval\s*\(/i,
        /\bexec\s*\(/i,
        /union\s+select/i,
        /drop\s+table/i,
        /--\s*$/,
        /;\s*--/,
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(input));
}

// ============================================
// Secure Storage Helpers
// ============================================

/**
 * Mask sensitive data for display
 */
export function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return email;

    const maskedLocal = local.length > 2
        ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
        : local[0] + '*';

    return `${maskedLocal}@${domain}`;
}

/**
 * Mask phone number
 */
export function maskPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return phone;

    return '*'.repeat(digits.length - 4) + digits.slice(-4);
}

/**
 * Generate a simple device fingerprint
 */
export function generateDeviceFingerprint(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
}

// ============================================
// Exports
// ============================================

export {
    RateLimitConfig,
    SessionConfig,
    SecurityEvent,
};
