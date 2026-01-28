'use client';

/**
 * AlertBell Component
 * Shows notification bell with unread count badge
 * Opens alert dropdown on click
 */

import React, { useState, useRef, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/solid';
import { useUnreadAlertCount, useAlerts, useMarkAlertAsRead, useMarkAllAlertsAsRead, useDismissAlert } from '../hooks/useAlerts';
import { AlertItem } from './AlertItem';
import type { AlertFilterParams } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertBellProps {
  className?: string;
}

export function AlertBell({ className = '' }: AlertBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount = 0 } = useUnreadAlertCount();

  const filterParams: AlertFilterParams = {
    limit: 10,
    includeDismissed: false,
  };
  const { data: alerts, isLoading } = useAlerts(isOpen ? filterParams : undefined);

  const markAsReadMutation = useMarkAlertAsRead();
  const markAllAsReadMutation = useMarkAllAlertsAsRead();
  const dismissMutation = useDismissAlert();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDismiss = (id: number) => {
    dismissMutation.mutate(id);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative p-2.5 rounded-full transition-all duration-300 ${isOpen
          ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100'
          : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        aria-label={`Bildirimler ${unreadCount > 0 ? `(${unreadCount} okunmamış)` : ''}`}
      >
        <div className="relative">
          {unreadCount > 0 ? (
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            >
              <BellAlertIcon className="w-6 h-6" />
            </motion.div>
          ) : (
            <BellIcon className="w-6 h-6 group-hover:stroke-[2px] transition-all" />
          )}

          {/* Badge */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-1 -right-1 block"
              >
                <span className="relative flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl ring-1 ring-slate-900/5 overflow-hidden z-50 origin-top-right backdrop-blur-xl"
            style={{
              filter: 'drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08))'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-white/50 border-b border-slate-100 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <BellIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Bildirimler</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-100">
                    {unreadCount} Yeni
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                  className="text-xs text-slate-500 hover:text-indigo-600 font-medium disabled:opacity-50 transition-colors px-2 py-1 hover:bg-slate-50 rounded-md"
                >
                  Tümünü Okundu İşaretle
                </button>
              )}
            </div>

            {/* Alert List */}
            <div className="max-h-[450px] overflow-y-auto custom-scrollbar bg-slate-50/30">
              {isLoading ? (
                <div className="p-8 text-center text-slate-400">
                  <div className="animate-spin w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-xs font-medium">Yükleniyor...</p>
                </div>
              ) : alerts && alerts.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {alerts.map((alert) => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      onMarkAsRead={handleMarkAsRead}
                      onDismiss={handleDismiss}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <BellIcon className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">Bildiriminiz Yok</h4>
                  <p className="text-xs text-slate-500 max-w-[200px] mx-auto">
                    Şu anda görüntülenecek yeni bir bildirim bulunmuyor.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {alerts && alerts.length > 0 && (
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 relative group cursor-pointer hover:bg-slate-100 transition-colors">
                <a
                  href="/notifications"
                  className="block text-center text-xs text-slate-600 group-hover:text-indigo-600 font-medium transition-colors"
                >
                  Tüm Geçmişi Görüntüle
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
