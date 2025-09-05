import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationPanel } from './NotificationPanel';
import './notification-bell-modern.css';

export const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleClick = () => {
    setIsPanelOpen(!isPanelOpen);
    // Add click animation
    const button = document.querySelector('.notification-bell');
    button?.classList.add('active');
    setTimeout(() => button?.classList.remove('active'), 200);
  };

  return (
    <>
      <button 
        className={`notification-bell ${unreadCount > 0 ? 'has-new' : ''}`}
        onClick={handleClick}
        aria-label={`Bildirimler ${unreadCount > 0 ? `(${unreadCount} yeni)` : ''}`}
        data-tooltip={unreadCount > 0 ? `${unreadCount} yeni bildirim` : 'Bildirimler'}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="bell-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      <NotificationPanel 
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </>
  );
};