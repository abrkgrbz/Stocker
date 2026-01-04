/**
 * Network Status Hook
 * Monitors network connectivity for auth screens and app-wide usage
 */
import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';

export interface NetworkStatus {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    type: NetInfoStateType;
    details: {
        isWifi: boolean;
        isCellular: boolean;
        strength?: number;
    };
}

export function useNetworkStatus(): NetworkStatus {
    const [status, setStatus] = useState<NetworkStatus>({
        isConnected: true,
        isInternetReachable: true,
        type: NetInfoStateType.unknown,
        details: {
            isWifi: false,
            isCellular: false,
        },
    });

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setStatus({
                isConnected: state.isConnected ?? true,
                isInternetReachable: state.isInternetReachable,
                type: state.type,
                details: {
                    isWifi: state.type === NetInfoStateType.wifi,
                    isCellular: state.type === NetInfoStateType.cellular,
                    strength: state.type === NetInfoStateType.wifi
                        ? (state.details as any)?.strength
                        : undefined,
                },
            });
        });

        // Initial fetch
        NetInfo.fetch().then((state) => {
            setStatus({
                isConnected: state.isConnected ?? true,
                isInternetReachable: state.isInternetReachable,
                type: state.type,
                details: {
                    isWifi: state.type === NetInfoStateType.wifi,
                    isCellular: state.type === NetInfoStateType.cellular,
                },
            });
        });

        return unsubscribe;
    }, []);

    return status;
}

/**
 * Simple hook for just checking if online
 */
export function useIsOnline(): boolean {
    const { isConnected, isInternetReachable } = useNetworkStatus();
    return isConnected && isInternetReachable !== false;
}

/**
 * Hook for retrying operations when coming back online
 */
export function useRetryOnReconnect(
    callback: () => void | Promise<void>,
    deps: any[] = []
): void {
    const isOnline = useIsOnline();
    const [wasOffline, setWasOffline] = useState(!isOnline);

    useEffect(() => {
        if (!isOnline) {
            setWasOffline(true);
        } else if (wasOffline && isOnline) {
            // Just came back online
            callback();
            setWasOffline(false);
        }
    }, [isOnline, wasOffline, callback, ...deps]);
}

/**
 * Hook for showing offline indicator with animation timing
 */
export function useOfflineIndicator() {
    const isOnline = useIsOnline();
    const [showOffline, setShowOffline] = useState(false);
    const [showBackOnline, setShowBackOnline] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            setShowOffline(true);
            setShowBackOnline(false);
        } else if (showOffline) {
            // Coming back online
            setShowBackOnline(true);
            setShowOffline(false);

            // Hide "back online" message after 3 seconds
            const timer = setTimeout(() => {
                setShowBackOnline(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isOnline, showOffline]);

    return {
        isOnline,
        showOffline,
        showBackOnline,
    };
}
