import * as signalR from '@microsoft/signalr';
import { API_URL } from '../../constants';
import { tokenStorage } from '../../utils/tokenStorage';

export class SignalRClient {
    private connection: signalR.HubConnection | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 5000; // 5 seconds

    constructor(private hubUrl: string) { }

    async start(): Promise<void> {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            console.log('[SignalR] Already connected to', this.hubUrl);
            return;
        }

        const connectionBuilder = new signalR.HubConnectionBuilder()
            .withUrl(`${API_URL}${this.hubUrl}`, {
                accessTokenFactory: async () => {
                    const token = await tokenStorage.getToken();
                    if (!token) {
                        console.warn('[SignalR] No token available for authentication');
                    }
                    return token || '';
                },
                skipNegotiation: false,
                transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    if (retryContext.previousRetryCount === 0) return 0;
                    if (retryContext.previousRetryCount === 1) return 2000;
                    if (retryContext.previousRetryCount === 2) return 10000;
                    if (retryContext.previousRetryCount === 3) return 30000;
                    if (retryContext.previousRetryCount === 4) return 60000;
                    return null;
                },
            })
            .configureLogging(signalR.LogLevel.Information);

        this.connection = connectionBuilder.build();

        // Connection event handlers
        this.connection.onreconnecting((error) => {
            console.warn('[SignalR] Reconnecting to', this.hubUrl, '...', error?.message || 'Unknown error');
            this.reconnectAttempts++;
        });

        this.connection.onreconnected((connectionId) => {
            console.log('[SignalR] Reconnected to', this.hubUrl, '- Connection ID:', connectionId);
            this.reconnectAttempts = 0;
        });

        this.connection.onclose(async (error) => {
            if (error) {
                console.warn('[SignalR] Connection closed for', this.hubUrl, ':', error?.message || 'Unknown error');
            } else {
                console.log('[SignalR] Disconnected gracefully from', this.hubUrl);
            }

            if (error && this.reconnectAttempts < this.maxReconnectAttempts) {
                const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 60000);
                console.log(`[SignalR] Attempting manual reconnect to ${this.hubUrl} in ${delay}ms...`);

                setTimeout(() => {
                    this.start();
                }, delay);
            } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('[SignalR] Max reconnection attempts reached for', this.hubUrl, '. Giving up.');
            }
        });

        try {
            console.log('[SignalR] Connecting to', `${API_URL}${this.hubUrl}`);
            await this.connection.start();
            console.log('[SignalR] Connected successfully to', this.hubUrl, '- Connection ID:', this.connection.connectionId);
            this.reconnectAttempts = 0;
        } catch (error: any) {
            this.reconnectAttempts++;
            console.error('[SignalR] Connection failed for', this.hubUrl, ':', error?.message || 'Unknown error', error);
            throw error;
        }
    }

    async stop(): Promise<void> {
        if (this.connection) {
            await this.connection.stop();
            console.log('SignalR disconnected');
        }
    }

    on(eventName: string, handler: (...args: any[]) => void): void {
        if (!this.connection) {
            throw new Error('SignalR connection not initialized');
        }
        this.connection.on(eventName, handler);
    }

    off(eventName: string, handler?: (...args: any[]) => void): void {
        if (!this.connection) {
            throw new Error('SignalR connection not initialized');
        }
        if (handler) {
            this.connection.off(eventName, handler);
        } else {
            this.connection.off(eventName);
        }
    }

    async invoke(methodName: string, ...args: any[]): Promise<any> {
        if (!this.connection) {
            throw new Error('SignalR connection not initialized');
        }

        if (this.connection.state !== signalR.HubConnectionState.Connected) {
            throw new Error('SignalR not connected');
        }

        return await this.connection.invoke(methodName, ...args);
    }

    get state(): signalR.HubConnectionState | null {
        return this.connection?.state || null;
    }

    get isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }
}

export const notificationHub = new SignalRClient('/hubs/notification');
