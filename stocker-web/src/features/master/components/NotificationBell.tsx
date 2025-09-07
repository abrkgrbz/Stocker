import React, { useState } from 'react';
import { NotificationPanel } from './NotificationPanel';
import './notification-bell-modern.css';

export const NotificationBell: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [unreadCount] = useState(5); // Mock data - replace with real data

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button 
        className="notification-bell-button"
        onClick={togglePanel}
        aria-label="Bildirimler"
      >
        {/* Bell Icon */}
        <svg 
          className="bell-icon"
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none"
        >
          <path 
            d="M12 2C10.9 2 10 2.9 10 4C10 4.1 10.01 4.19 10.02 4.29C7.71 5.13 6 7.46 6 10.2V16L4 18V19H20V18L18 16V10.2C18 7.46 16.29 5.13 13.98 4.29C13.99 4.19 14 4.1 14 4C14 2.9 13.1 2 12 2Z" 
            fill="currentColor"
          />
          <path 
            d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" 
            fill="currentColor"
          />
        </svg>

        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </>
  );
};