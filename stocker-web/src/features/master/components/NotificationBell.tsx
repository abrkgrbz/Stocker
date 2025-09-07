import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationPanel } from './NotificationPanel';
import './notification-bell-modern.css';

export const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bellRef.current && 
        panelRef.current &&
        !bellRef.current.contains(event.target as Node) &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsPanelOpen(false);
      }
    };

    if (isPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPanelOpen]);

  // Animate bell when new notification arrives
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  const handleClick = () => {
    setIsPanelOpen(!isPanelOpen);
    
    // Haptic feedback effect
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <>
      <div className="notification-bell-container">
        <button 
          ref={bellRef}
          className={`
            notification-bell-modern 
            ${unreadCount > 0 ? 'has-notifications' : ''} 
            ${isPanelOpen ? 'active' : ''}
            ${isAnimating ? 'animating' : ''}
          `}
          onClick={handleClick}
          aria-label={`Bildirimler ${unreadCount > 0 ? `(${unreadCount} yeni)` : ''}`}
        >
          <div className="bell-icon-wrapper">
            {/* Main Bell Icon */}
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
                className="bell-body"
              />
              <path 
                d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" 
                fill="currentColor"
                className="bell-clapper"
              />
            </svg>

            {/* Animated Ring Effect */}
            {unreadCount > 0 && (
              <div className="bell-ring-container">
                <span className="bell-ring bell-ring-1"></span>
                <span className="bell-ring bell-ring-2"></span>
              </div>
            )}

            {/* Badge */}
            {unreadCount > 0 && (
              <div className="bell-badge-modern">
                <span className="badge-number">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
                <span className="badge-pulse"></span>
              </div>
            )}
          </div>

          {/* Tooltip */}
          <div className="bell-tooltip">
            {unreadCount > 0 ? `${unreadCount} yeni bildirim` : 'Bildirimler'}
          </div>
        </button>
      </div>

      {/* Notification Panel */}
      <div ref={panelRef}>
        <NotificationPanel 
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
        />
      </div>
    </>
  );
};