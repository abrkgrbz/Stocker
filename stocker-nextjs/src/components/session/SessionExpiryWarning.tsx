'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/primitives/overlay/Modal';
import { ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

export function SessionExpiryWarning() {
  const { isAuthenticated, logout, refreshSession } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { showWarning, remainingSeconds, resetTimer } = useSessionTimer({
    isAuthenticated,
    onSessionExpired: () => {
      toast.error('Oturum süreniz doldu. Yeniden giriş yapmanız gerekiyor.');
      logout();
    },
  });

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const handleExtendSession = async () => {
    setIsRefreshing(true);
    try {
      await refreshSession();
      resetTimer();
      toast.success('Oturum süreniz uzatıldı.');
    } catch {
      toast.error('Oturum uzatılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) return null;

  return (
    <Modal
      open={showWarning}
      onClose={() => {}}
      size="sm"
      showClose={false}
      closeOnBackdrop={false}
    >
      <div className="flex flex-col items-center text-center py-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4">
          <ClockIcon className="w-6 h-6 text-amber-600" />
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Oturum Süresi Dolmak Üzere
        </h3>

        <p className="text-sm text-slate-500 mb-4">
          Oturumunuz kısa süre içinde sona erecek. Devam etmek için oturumunuzu uzatabilirsiniz.
        </p>

        <div className="text-3xl font-bold text-amber-600 mb-6 font-mono">
          {timeDisplay}
        </div>

        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md',
              'text-slate-700 bg-white border border-slate-300',
              'hover:bg-slate-50',
              'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2',
              'transition-colors'
            )}
            onClick={handleLogout}
            disabled={isRefreshing}
          >
            Çıkış Yap
          </button>
          <button
            type="button"
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md',
              'text-white bg-slate-900',
              'hover:bg-slate-800',
              'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2',
              'transition-colors',
              isRefreshing && 'opacity-50 cursor-not-allowed'
            )}
            onClick={handleExtendSession}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Uzatılıyor...' : 'Oturumu Uzat'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
