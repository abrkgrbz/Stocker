'use client';

import React from 'react';

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  children: React.ReactNode;
  showZero?: boolean;
}

export default function NotificationBadge({
  count,
  maxCount = 99,
  children,
  showZero = false,
}: NotificationBadgeProps) {
  const displayCount = count > maxCount ? `${maxCount}+` : count;
  const showBadge = count > 0 || showZero;

  return (
    <div className="relative inline-flex">
      {children}
      {showBadge && (
        <span
          className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 flex items-center justify-center px-1.5 text-[11px] font-semibold text-white rounded-full animate-pulse-subtle"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            boxShadow: '0 2px 8px -2px rgba(239, 68, 68, 0.5)',
            border: '2px solid white',
          }}
        >
          {displayCount}
        </span>
      )}

      {/* Ping animation for unread notifications */}
      {count > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 rounded-full animate-ping opacity-30"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          }}
        />
      )}

      <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
