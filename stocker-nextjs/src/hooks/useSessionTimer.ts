'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const SESSION_DURATION_MS = 60 * 60 * 1000; // 60 minutes
const WARNING_BEFORE_MS = 5 * 60 * 1000; // 5 minutes before expiry
const WARNING_TRIGGER_MS = SESSION_DURATION_MS - WARNING_BEFORE_MS; // 55 minutes

interface UseSessionTimerOptions {
  isAuthenticated: boolean;
  onSessionExpired: () => void;
}

interface UseSessionTimerReturn {
  showWarning: boolean;
  remainingSeconds: number;
  resetTimer: () => void;
  dismissWarning: () => void;
}

export function useSessionTimer({
  isAuthenticated,
  onSessionExpired,
}: UseSessionTimerOptions): UseSessionTimerReturn {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(300); // 5 minutes = 300 seconds

  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number>(Date.now());

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    setShowWarning(true);
    setRemainingSeconds(300);

    countdownRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearTimers();
          onSessionExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimers, onSessionExpired]);

  const startWarningTimer = useCallback(() => {
    clearTimers();
    sessionStartRef.current = Date.now();

    warningTimerRef.current = setTimeout(() => {
      startCountdown();
    }, WARNING_TRIGGER_MS);
  }, [clearTimers, startCountdown]);

  const resetTimer = useCallback(() => {
    setShowWarning(false);
    setRemainingSeconds(300);
    startWarningTimer();
  }, [startWarningTimer]);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
    clearTimers();
  }, [clearTimers]);

  // Handle Page Visibility API - recalculate remaining time when tab becomes active
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - sessionStartRef.current;

        if (elapsed >= SESSION_DURATION_MS) {
          // Session already expired
          clearTimers();
          onSessionExpired();
        } else if (elapsed >= WARNING_TRIGGER_MS) {
          // Should be showing warning
          const remainingMs = SESSION_DURATION_MS - elapsed;
          const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));

          if (!showWarning) {
            setShowWarning(true);
            setRemainingSeconds(remainingSec);

            if (countdownRef.current) clearInterval(countdownRef.current);
            countdownRef.current = setInterval(() => {
              setRemainingSeconds((prev) => {
                if (prev <= 1) {
                  clearTimers();
                  onSessionExpired();
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          } else {
            setRemainingSeconds(remainingSec);
          }
        }
        // else: still within safe period, timer is running
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, showWarning, clearTimers, onSessionExpired]);

  // Start timer when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      startWarningTimer();
    } else {
      clearTimers();
      setShowWarning(false);
      setRemainingSeconds(300);
    }

    return () => {
      clearTimers();
    };
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    showWarning,
    remainingSeconds,
    resetTimer,
    dismissWarning,
  };
}
