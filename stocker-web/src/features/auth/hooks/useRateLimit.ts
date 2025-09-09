import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
  blockDurationMs?: number; // Block duration after max attempts
  storageKey: string;
}

interface RateLimitState {
  attempts: number;
  blockedUntil: number | null;
  lastAttemptTime: number;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const {
    maxAttempts,
    windowMs,
    blockDurationMs = 15 * 60 * 1000, // Default 15 minutes
    storageKey
  } = config;

  const [state, setState] = useState<RateLimitState>(() => {
    // Load state from localStorage
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { attempts: 0, blockedUntil: null, lastAttemptTime: 0 };
      }
    }
    return { attempts: 0, blockedUntil: null, lastAttemptTime: 0 };
  });

  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  // Check if currently blocked
  useEffect(() => {
    const checkBlocked = () => {
      const now = Date.now();
      
      if (state.blockedUntil && state.blockedUntil > now) {
        setIsBlocked(true);
        setRemainingTime(Math.ceil((state.blockedUntil - now) / 1000));
      } else if (state.blockedUntil && state.blockedUntil <= now) {
        // Unblock and reset
        setState({
          attempts: 0,
          blockedUntil: null,
          lastAttemptTime: 0
        });
        setIsBlocked(false);
        setRemainingTime(0);
      } else {
        setIsBlocked(false);
        setRemainingTime(0);
      }
    };

    checkBlocked();
    const interval = setInterval(checkBlocked, 1000);
    return () => clearInterval(interval);
  }, [state.blockedUntil]);

  const checkLimit = useCallback((): boolean => {
    const now = Date.now();

    // If blocked, return false
    if (state.blockedUntil && state.blockedUntil > now) {
      const minutes = Math.ceil((state.blockedUntil - now) / 60000);
      message.error(`Çok fazla deneme yaptınız. ${minutes} dakika sonra tekrar deneyin.`);
      return false;
    }

    // Check if window has expired
    if (now - state.lastAttemptTime > windowMs) {
      // Reset attempts if window expired
      setState({
        attempts: 1,
        blockedUntil: null,
        lastAttemptTime: now
      });
      return true;
    }

    // Check if max attempts reached
    if (state.attempts >= maxAttempts) {
      const blockedUntil = now + blockDurationMs;
      setState({
        ...state,
        blockedUntil,
        lastAttemptTime: now
      });
      message.error(`Çok fazla deneme yaptınız. ${Math.ceil(blockDurationMs / 60000)} dakika sonra tekrar deneyin.`);
      return false;
    }

    // Increment attempts
    setState({
      ...state,
      attempts: state.attempts + 1,
      lastAttemptTime: now
    });

    return true;
  }, [state, windowMs, maxAttempts, blockDurationMs]);

  const reset = useCallback(() => {
    setState({
      attempts: 0,
      blockedUntil: null,
      lastAttemptTime: 0
    });
    setIsBlocked(false);
    setRemainingTime(0);
  }, []);

  const getRemainingAttempts = useCallback(() => {
    return Math.max(0, maxAttempts - state.attempts);
  }, [maxAttempts, state.attempts]);

  return {
    checkLimit,
    reset,
    isBlocked,
    remainingTime,
    remainingAttempts: getRemainingAttempts(),
    attempts: state.attempts
  };
};

// Brute force protection hook
export const useBruteForceProtection = (identifier: string) => {
  const config: RateLimitConfig = {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes block
    storageKey: `brute_force_${identifier}`
  };

  return useRateLimit(config);
};

// Form submission rate limit
export const useFormRateLimit = (formName: string) => {
  const config: RateLimitConfig = {
    maxAttempts: 3,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000, // 5 minutes block
    storageKey: `form_limit_${formName}`
  };

  return useRateLimit(config);
};