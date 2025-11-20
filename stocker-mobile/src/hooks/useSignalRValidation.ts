import { useEffect, useRef, useCallback, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { API_URL } from '../constants';

export interface ValidationResult {
    isValid: boolean;
    message: string;
    details: Record<string, string>;
}

export interface PasswordStrength {
    score: number;
    level: string;
    color: string;
    suggestions: string[];
}

export interface TenantCodeValidationResult {
    isAvailable: boolean;
    message: string;
    code: string;
    suggestedCodes: string[];
}

export interface IdentityValidationResult {
    isValid: boolean;
    message: string;
    numberType: string;
    details: Record<string, string>;
}

export function useSignalRValidation() {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const debounceTimers = useRef<Record<string, any>>({});

    useEffect(() => {
        const hubUrl = `${API_URL}/hubs/validation`;

        // Validation hub doesn't require authentication (used in register/public forms)
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                skipNegotiation: false,
                transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
                // No accessTokenFactory - this hub is public
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    if (retryContext.previousRetryCount === 0) return 0;
                    if (retryContext.previousRetryCount === 1) return 2000;
                    if (retryContext.previousRetryCount === 2) return 10000;
                    if (retryContext.previousRetryCount === 3) return 30000;
                    return null;
                },
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('[SignalR] Validation Hub Connected - Connection ID:', connection.connectionId);
                    setIsConnected(true);
                })
                .catch(err => {
                    console.error('[SignalR] Validation Hub Connection Error:', err?.message || 'Unknown error', err);
                    setIsConnected(false);
                });

            connection.onclose((error) => {
                if (error) {
                    console.error('[SignalR] Validation Hub Disconnected with error:', error?.message || 'Unknown error');
                } else {
                    console.log('[SignalR] Validation Hub Disconnected gracefully');
                }
                setIsConnected(false);
            });

            connection.onreconnecting((error) => {
                console.log('[SignalR] Validation Hub Reconnecting...', error?.message || 'Unknown error');
                setIsConnected(false);
            });

            connection.onreconnected((connectionId) => {
                console.log('[SignalR] Validation Hub Reconnected - Connection ID:', connectionId);
                setIsConnected(true);
            });

            return () => {
                connection.stop();
            };
        }
    }, [connection]);

    const debounce = (key: string, callback: () => void, delay: number = 500) => {
        if (debounceTimers.current[key]) {
            clearTimeout(debounceTimers.current[key]);
        }
        debounceTimers.current[key] = setTimeout(callback, delay);
    };

    const validateEmail = useCallback((
        email: string,
        onResult: (result: ValidationResult) => void
    ) => {
        if (!connection || !isConnected || connection.state !== signalR.HubConnectionState.Connected) return;

        debounce('email', () => {
            const handler = (result: ValidationResult) => {
                onResult(result);
                connection.off('EmailValidated', handler);
            };

            connection.on('EmailValidated', handler);
            connection.invoke('ValidateEmail', email)
                .catch(err => console.error('[SignalR] Email validation error:', err));
        });
    }, [connection, isConnected]);

    const validatePhone = useCallback((
        phoneNumber: string,
        onResult: (result: ValidationResult) => void,
        countryCode: string = 'TR'
    ) => {
        if (!connection || !isConnected || connection.state !== signalR.HubConnectionState.Connected) return;

        debounce('phone', () => {
            const handler = (result: ValidationResult) => {
                onResult(result);
                connection.off('PhoneValidated', handler);
            };

            connection.on('PhoneValidated', handler);
            connection.invoke('ValidatePhone', phoneNumber, countryCode)
                .catch(err => console.error('[SignalR] Phone validation error:', err));
        });
    }, [connection, isConnected]);

    const checkPasswordStrength = useCallback((
        password: string,
        onResult: (result: PasswordStrength) => void
    ) => {
        if (!connection || !isConnected || connection.state !== signalR.HubConnectionState.Connected) return;

        debounce('password', () => {
            const handler = (result: PasswordStrength) => {
                onResult(result);
                connection.off('PasswordStrengthChecked', handler);
            };

            connection.on('PasswordStrengthChecked', handler);
            connection.invoke('CheckPasswordStrength', password)
                .catch(err => console.error('[SignalR] Password strength check error:', err));
        }, 300);
    }, [connection, isConnected]);

    const validateTenantCode = useCallback((
        code: string,
        onResult: (result: TenantCodeValidationResult) => void
    ) => {
        if (!connection || !isConnected || connection.state !== signalR.HubConnectionState.Connected) return;

        debounce('tenantCode', () => {
            const handler = (result: TenantCodeValidationResult) => {
                onResult(result);
                connection.off('TenantCodeValidated', handler);
            };

            connection.on('TenantCodeValidated', handler);
            connection.invoke('ValidateTenantCode', code)
                .catch(err => console.error('[SignalR] Tenant code validation error:', err));
        });
    }, [connection, isConnected]);

    const checkCompanyName = useCallback((
        companyName: string,
        onResult: (result: ValidationResult) => void
    ) => {
        if (!connection || !isConnected || connection.state !== signalR.HubConnectionState.Connected) return;

        debounce('companyName', () => {
            const handler = (result: ValidationResult) => {
                onResult(result);
                connection.off('CompanyNameChecked', handler);
            };

            connection.on('CompanyNameChecked', handler);
            connection.invoke('CheckCompanyName', companyName)
                .catch(err => console.error('[SignalR] Company name check error:', err));
        });
    }, [connection, isConnected]);

    return {
        isConnected,
        validateEmail,
        validatePhone,
        checkPasswordStrength,
        validateTenantCode,
        checkCompanyName
    };
}
