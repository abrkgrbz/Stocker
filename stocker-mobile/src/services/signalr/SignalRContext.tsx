import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { HubConnectionState } from '@microsoft/signalr';
import { notificationHub, SignalRClient } from './SignalRClient';
import { useAuthStore } from '../../stores/authStore';
import { tokenStorage } from '../../utils/tokenStorage';

interface SignalRContextValue {
    notificationHub: SignalRClient;
    isNotificationConnected: boolean;
    connectAll: () => Promise<void>;
    disconnectAll: () => Promise<void>;
}

const SignalRContext = createContext<SignalRContextValue | undefined>(undefined);

export function SignalRProvider({ children }: { children: React.ReactNode }) {
    const [isNotificationConnected, setIsNotificationConnected] = useState(false);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const connectAll = useCallback(async () => {
        try {
            // Check if user is authenticated and has a token
            const token = await tokenStorage.getToken();
            if (!token) {
                console.log('[SignalR] No token available, skipping connection');
                return;
            }

            if (!notificationHub.isConnected) {
                await notificationHub.start();
                setIsNotificationConnected(notificationHub.isConnected);
            }
        } catch (error) {
            console.error('[SignalR] Connection error:', error);
            setIsNotificationConnected(false);
        }
    }, []);

    const disconnectAll = useCallback(async () => {
        try {
            await notificationHub.stop();
            setIsNotificationConnected(false);
        } catch (error) {
            console.error('[SignalR] Disconnect error:', error);
        }
    }, []);

    // Connect/disconnect based on authentication state
    useEffect(() => {
        if (isAuthenticated) {
            console.log('[SignalR] User authenticated, connecting...');
            connectAll();
        } else {
            console.log('[SignalR] User not authenticated, disconnecting...');
            disconnectAll();
        }

        return () => {
            disconnectAll();
        };
    }, [isAuthenticated, connectAll, disconnectAll]);

    // Monitor connection state
    useEffect(() => {
        const interval = setInterval(() => {
            const isConnected = notificationHub.state === HubConnectionState.Connected;
            setIsNotificationConnected(isConnected);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const value: SignalRContextValue = {
        notificationHub,
        isNotificationConnected,
        connectAll,
        disconnectAll,
    };

    return (
        <SignalRContext.Provider value={value}>
            {children}
        </SignalRContext.Provider>
    );
}

export function useSignalR() {
    const context = useContext(SignalRContext);
    if (!context) {
        throw new Error('useSignalR must be used within SignalRProvider');
    }
    return context;
}
