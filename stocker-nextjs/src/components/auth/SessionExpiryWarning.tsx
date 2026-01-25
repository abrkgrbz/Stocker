'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Modal, Button } from 'antd';
import { ClockCircleOutlined, LogoutOutlined } from '@ant-design/icons';
import logger from '@/lib/utils/logger';

interface SessionExpiryWarningProps {
  /**
   * Time in milliseconds before session expiry to show warning
   * Default: 5 minutes (300000ms)
   */
  warningTimeMs?: number;
  /**
   * Session duration in milliseconds
   * Default: 30 minutes (1800000ms) - should match JWT token expiry
   */
  sessionDurationMs?: number;
}

export function SessionExpiryWarning({
  warningTimeMs = 5 * 60 * 1000, // 5 minutes before expiry
  sessionDurationMs = 30 * 60 * 1000, // 30 minutes total session
}: SessionExpiryWarningProps) {
  const { isAuthenticated, refreshSession, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update last activity on user interaction
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Calculate remaining time until session expires
  const calculateRemainingTime = useCallback(() => {
    const elapsed = Date.now() - lastActivityRef.current;
    const remaining = sessionDurationMs - elapsed;
    return Math.max(0, remaining);
  }, [sessionDurationMs]);

  // Handle session extension
  const handleExtendSession = async () => {
    setIsRefreshing(true);
    try {
      await refreshSession();
      lastActivityRef.current = Date.now();
      setShowWarning(false);
      logger.info('Session extended by user', { component: 'SessionExpiryWarning' });
    } catch (error) {
      logger.error('Failed to extend session', error instanceof Error ? error : new Error(String(error)), { component: 'SessionExpiryWarning' });
      // If refresh fails, logout
      await logout();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setShowWarning(false);
    await logout();
  };

  // Start countdown when warning is shown
  useEffect(() => {
    if (showWarning) {
      countdownTimerRef.current = setInterval(() => {
        const remaining = calculateRemainingTime();
        setRemainingTime(remaining);

        // If time is up, force logout
        if (remaining <= 0) {
          logger.info('Session expired - forcing logout', { component: 'SessionExpiryWarning' });
          setShowWarning(false);
          logout();
        }
      }, 1000);
    }

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [showWarning, calculateRemainingTime, logout]);

  // Main session monitoring effect
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Add activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Check session status periodically
    const checkSession = () => {
      const remaining = calculateRemainingTime();

      if (remaining <= warningTimeMs && remaining > 0 && !showWarning) {
        setRemainingTime(remaining);
        setShowWarning(true);
        logger.info('Session expiry warning triggered', {
          component: 'SessionExpiryWarning',
          metadata: { remainingMs: remaining }
        });
      }
    };

    // Check every 30 seconds
    warningTimerRef.current = setInterval(checkSession, 30000);

    // Initial check
    checkSession();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      if (warningTimerRef.current) {
        clearInterval(warningTimerRef.current);
      }
    };
  }, [isAuthenticated, warningTimeMs, calculateRemainingTime, updateActivity, showWarning]);

  // Format remaining time as MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Modal
      open={showWarning}
      closable={false}
      maskClosable={false}
      keyboard={false}
      centered
      width={400}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClockCircleOutlined style={{ color: '#f97316', fontSize: 20 }} />
          <span>Oturum Süresi Doluyor</span>
        </div>
      }
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Çıkış Yap
          </Button>
          <Button
            type="primary"
            onClick={handleExtendSession}
            loading={isRefreshing}
            style={{ background: '#1a1a1a' }}
          >
            Oturumu Uzat
          </Button>
        </div>
      }
    >
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <p style={{ color: '#666', marginBottom: 24 }}>
          Güvenliğiniz için oturumunuz yakında sona erecek. Devam etmek ister misiniz?
        </p>
        <div style={{
          fontSize: 48,
          fontWeight: 'bold',
          color: '#f97316',
          marginBottom: 8,
        }}>
          {formatTime(remainingTime)}
        </div>
        <div style={{ color: '#999', fontSize: 14 }}>
          kalan süre
        </div>
      </div>
    </Modal>
  );
}
