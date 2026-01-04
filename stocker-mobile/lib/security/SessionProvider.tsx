/**
 * Session Timeout Provider
 * Wraps the app to provide session timeout functionality
 */
import React, { createContext, useContext, useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSessionTimeout, logSecurityEvent } from './index';
import { SessionTimeoutWarning } from '@/components/ui/SecurityBanner';
import { authStorage } from '@/lib/auth-store';

interface SessionContextValue {
    extendSession: () => void;
    recordActivity: () => void;
    isWarningVisible: boolean;
    remainingTime: number;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionProviderProps {
    children: React.ReactNode;
    timeoutMs?: number;
    warningMs?: number;
    enabled?: boolean;
}

export function SessionProvider({
    children,
    timeoutMs = 15 * 60 * 1000, // 15 minutes default
    warningMs = 2 * 60 * 1000, // 2 minutes warning
    enabled = true,
}: SessionProviderProps) {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleTimeout = useCallback(async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            logSecurityEvent({ type: 'session_timeout' });
            await authStorage.clearAuth();
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Error during session timeout:', error);
        } finally {
            setIsLoggingOut(false);
        }
    }, [router, isLoggingOut]);

    const handleWarning = useCallback(() => {
        // Warning is handled by showing the modal
    }, []);

    const handleLogout = useCallback(async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            logSecurityEvent({ type: 'logout' });
            await authStorage.clearAuth();
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            setIsLoggingOut(false);
        }
    }, [router, isLoggingOut]);

    const session = useSessionTimeout(
        handleTimeout,
        handleWarning,
        enabled ? { timeoutMs, warningMs, extendOnActivity: true } : { timeoutMs: Infinity, warningMs: 0, extendOnActivity: false }
    );

    if (!enabled) {
        return <>{children}</>;
    }

    return (
        <SessionContext.Provider
            value={{
                extendSession: session.extendSession,
                recordActivity: session.recordActivity,
                isWarningVisible: session.showWarning,
                remainingTime: session.remainingTime,
            }}
        >
            {children}
            <SessionTimeoutWarning
                visible={session.showWarning}
                remainingSeconds={session.remainingSeconds + (session.remainingMinutes * 60)}
                onExtend={session.extendSession}
                onLogout={handleLogout}
            />
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (!context) {
        // Return no-op functions if not within provider
        return {
            extendSession: () => {},
            recordActivity: () => {},
            isWarningVisible: false,
            remainingTime: 0,
        };
    }
    return context;
}
