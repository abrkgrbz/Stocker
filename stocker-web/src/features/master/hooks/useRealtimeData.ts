import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

interface RealtimeConfig {
  interval?: number; // milliseconds
  enabled?: boolean;
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
}

export function useRealtimeData<T>(
  fetcher: () => Promise<T>,
  config: RealtimeConfig = {}
) {
  const {
    interval = 30000, // 30 seconds default
    enabled = true,
    onError,
    onSuccess
  } = config;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetcher();
      setData(result);
      setError(null);
      setLastUpdate(new Date());
      onSuccess?.(result);
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      message.error('Veri güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [fetcher, onError, onSuccess]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchData();

    // Set up interval only if interval > 0
    if (interval > 0) {
      const intervalId = setInterval(fetchData, interval);
      return () => clearInterval(intervalId);
    }
  }, [fetchData, interval, enabled]);

  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
    isStale: Date.now() - lastUpdate.getTime() > interval
  };
}

// WebSocket bağlantısı için hook
export function useWebSocketData<T>(
  url: string,
  options: {
    reconnect?: boolean;
    reconnectInterval?: number;
    onMessage?: (data: T) => void;
    onError?: (error: Event) => void;
    onOpen?: () => void;
    onClose?: () => void;
  } = {}
) {
  const {
    reconnect = true,
    reconnectInterval = 5000,
    onMessage,
    onError,
    onOpen,
    onClose
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(url);

        ws.onopen = () => {
                    setConnected(true);
          onOpen?.();
        };

        ws.onmessage = (event) => {
          try {
            const messageData = JSON.parse(event.data) as T;
            setData(messageData);
            onMessage?.(messageData);
          } catch (error) {
            // Error handling removed for production
          }
        };

        ws.onerror = (error) => {
          // Error handling removed for production
          onError?.(error);
        };

        ws.onclose = () => {
                    setConnected(false);
          onClose?.();

          if (reconnect) {
            reconnectTimeout = setTimeout(connect, reconnectInterval);
          }
        };

        setSocket(ws);
      } catch (error) {
        // Error handling removed for production
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [url, reconnect, reconnectInterval, onMessage, onError, onOpen, onClose]);

  const send = useCallback((data: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    } else {}
  }, [socket]);

  return {
    data,
    connected,
    send
  };
}

// Server-Sent Events (SSE) için hook
export function useSSE<T>(
  url: string,
  options: {
    onMessage?: (data: T) => void;
    onError?: (error: Event) => void;
    onOpen?: () => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
            setConnected(true);
      options.onOpen?.();
    };

    eventSource.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data) as T;
        setData(messageData);
        options.onMessage?.(messageData);
      } catch (error) {
        // Error handling removed for production
      }
    };

    eventSource.onerror = (error) => {
      // Error handling removed for production
      setConnected(false);
      options.onError?.(error);
    };

    return () => {
      eventSource.close();
    };
  }, [url, options]);

  return {
    data,
    connected
  };
}