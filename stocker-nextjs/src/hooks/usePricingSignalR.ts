/**
 * Real-time pricing calculation hook using SignalR
 * Provides live price updates for setup wizard custom package configuration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

export interface PriceCalculationRequest {
  selectedModuleCodes: string[];
  userCount: number;
  storagePlanCode?: string;
  selectedAddOnCodes?: string[];
}

// Matches backend CustomPackagePriceResponseDto
export interface ModulePriceBreakdown {
  moduleCode: string;
  moduleName: string;
  monthlyPrice: number;
  isCore: boolean;
  isRequired: boolean;
}

export interface UserPricing {
  userCount: number;
  tierCode: string;
  tierName: string;
  pricePerUser: number;
  basePrice: number;
  totalMonthly: number;
}

export interface StoragePricing {
  planCode: string;
  planName: string;
  storageGB: number;
  monthlyPrice: number;
}

export interface AddOnPricing {
  code: string;
  name: string;
  monthlyPrice: number;
}

export interface PriceCalculationResult {
  monthlyTotal: number;
  quarterlyTotal: number;
  semiAnnualTotal: number;
  annualTotal: number;
  currency: string;
  breakdown: ModulePriceBreakdown[];
  quarterlyDiscount: number;
  semiAnnualDiscount: number;
  annualDiscount: number;
  userPricing?: UserPricing;
  storagePricing?: StoragePricing;
  addOns: AddOnPricing[];
}

export interface PriceCalculationResponse {
  success: boolean;
  data?: PriceCalculationResult;
  error?: string;
}

interface UsePricingSignalRReturn {
  isConnected: boolean;
  isCalculating: boolean;
  priceResult: PriceCalculationResult | null;
  error: string | null;
  calculatePrice: (request: PriceCalculationRequest) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function usePricingSignalR(): UsePricingSignalRReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [priceResult, setPriceResult] = useState<PriceCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const pendingRequestRef = useRef<PriceCalculationRequest | null>(null);

  const connect = useCallback(async () => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      console.log('[PricingSignalR] Already connected');
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5249';
      const hubUrl = `${baseUrl}/hubs/pricing`;

      console.log(`[PricingSignalR] Connecting to: ${hubUrl}`);

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets |
                     signalR.HttpTransportType.ServerSentEvents |
                     signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount === 0) return 0;
            if (retryContext.previousRetryCount === 1) return 2000;
            if (retryContext.previousRetryCount === 2) return 5000;
            return 10000;
          }
        })
        .withServerTimeout(60000)
        .withKeepAliveInterval(15000)
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Handle connection events
      connection.on('Connected', (data: { connectionId: string; message: string }) => {
        console.log('[PricingSignalR] Connected event received:', data);
      });

      // Handle price calculation results
      connection.on('PriceCalculated', (response: PriceCalculationResponse) => {
        console.log('[PricingSignalR] Price calculated:', response);
        setIsCalculating(false);

        if (response.success && response.data) {
          setPriceResult(response.data);
          setError(null);
        } else {
          setError(response.error || 'Fiyat hesaplanamadı');
          setPriceResult(null);
        }
      });

      connection.onreconnecting((err) => {
        console.warn('[PricingSignalR] Reconnecting...', err?.message);
        setIsConnected(false);
      });

      connection.onreconnected((connectionId) => {
        console.log('[PricingSignalR] Reconnected:', connectionId);
        setIsConnected(true);

        // Re-send pending request if any
        if (pendingRequestRef.current) {
          connection.invoke('CalculatePrice', pendingRequestRef.current)
            .catch(err => console.error('[PricingSignalR] Failed to resend pending request:', err));
        }
      });

      connection.onclose((err) => {
        console.log('[PricingSignalR] Connection closed:', err?.message);
        setIsConnected(false);
      });

      await connection.start();
      connectionRef.current = connection;
      setIsConnected(true);
      setError(null);
      console.log('[PricingSignalR] Connected successfully');
    } catch (err) {
      console.error('[PricingSignalR] Connection failed:', err);
      setError('SignalR bağlantısı kurulamadı');
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (connectionRef.current) {
      try {
        await connectionRef.current.stop();
        connectionRef.current = null;
        setIsConnected(false);
        console.log('[PricingSignalR] Disconnected');
      } catch (err) {
        console.error('[PricingSignalR] Disconnect error:', err);
      }
    }
  }, []);

  const calculatePrice = useCallback((request: PriceCalculationRequest) => {
    if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      console.warn('[PricingSignalR] Not connected, storing pending request');
      pendingRequestRef.current = request;
      setError('SignalR bağlantısı bekleniyor...');
      return;
    }

    setIsCalculating(true);
    setError(null);
    pendingRequestRef.current = request;

    console.log('[PricingSignalR] Calculating price:', request);

    connectionRef.current.invoke('CalculatePrice', request)
      .catch(err => {
        console.error('[PricingSignalR] Calculate price error:', err);
        setIsCalculating(false);
        setError('Fiyat hesaplama hatası');
      });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return {
    isConnected,
    isCalculating,
    priceResult,
    error,
    calculatePrice,
    connect,
    disconnect,
  };
}
