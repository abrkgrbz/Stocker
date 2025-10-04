import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from '@/config/constants';
import { message } from 'antd';

interface TenantReadyEvent {
  tenantId: string;
  companyCode: string;
  companyName: string;
  message: string;
  timestamp: string;
}

interface UseTenantRegistrationSignalRProps {
  companyCode?: string;
  onTenantReady?: (data: TenantReadyEvent) => void;
}

export const useTenantRegistrationSignalR = ({
  companyCode,
  onTenantReady
}: UseTenantRegistrationSignalRProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!companyCode) return;

    const startConnection = async () => {
      try {
        // Create connection
        const connection = new signalR.HubConnectionBuilder()
          .withUrl(`${API_BASE_URL}/hubs/notification`, {
            transport: signalR.HttpTransportType.WebSockets |
                      signalR.HttpTransportType.ServerSentEvents |
                      signalR.HttpTransportType.LongPolling,
            withCredentials: false,
          })
          .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: (retryContext) => {
              if (retryContext.elapsedMilliseconds < 60000) {
                return Math.min(2000 + retryContext.previousRetryCount * 1000, 5000);
              }
              return null;
            }
          })
          .configureLogging(signalR.LogLevel.Information)
          .build();

        // Set up event handlers
        connection.on('TenantReady', (data: TenantReadyEvent) => {
          console.log('🎉 TenantReady event received:', data);
          message.success(data.message || 'Hesabınız hazır!');
          onTenantReady?.(data);
        });

        connection.on('Connected', (data: any) => {
          console.log('✅ Connected to notification hub:', data);
        });

        connection.onreconnecting(() => {
          console.log('🔄 Reconnecting to notification hub...');
          setIsConnected(false);
        });

        connection.onreconnected(() => {
          console.log('✅ Reconnected to notification hub');
          setIsConnected(true);
          // Rejoin group after reconnection
          if (companyCode) {
            connection.invoke('JoinGroup', `registration-${companyCode}`)
              .catch(err => console.error('Failed to rejoin group:', err));
          }
        });

        connection.onclose(() => {
          console.log('❌ Connection closed');
          setIsConnected(false);
        });

        // Start connection
        await connection.start();
        console.log('✅ SignalR connection started');
        setIsConnected(true);

        // Join registration group
        await connection.invoke('JoinGroup', `registration-${companyCode}`);
        console.log(`📢 Joined group: registration-${companyCode}`);

        connectionRef.current = connection;
      } catch (error) {
        console.error('❌ SignalR connection error:', error);
        setIsConnected(false);
      }
    };

    startConnection();

    // Cleanup
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop()
          .then(() => console.log('🛑 SignalR connection stopped'))
          .catch(err => console.error('Error stopping connection:', err));
      }
    };
  }, [companyCode, onTenantReady]);

  return {
    isConnected,
    connection: connectionRef.current
  };
};
