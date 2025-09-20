import React, { useState, useEffect } from 'react';
import { useSignalRNotifications } from '../../hooks/useSignalR';
import { NotificationMessage } from '../../services/signalr/signalRService';
import Swal from 'sweetalert2';

interface NotificationCenterProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxNotifications?: number;
  autoHideDuration?: number;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  position = 'top-right',
  maxNotifications = 5,
  autoHideDuration = 5000,
}) => {
  const { notifications, latestNotification, clearNotifications } = useSignalRNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState<NotificationMessage[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Show toast for new notifications
  useEffect(() => {
    if (latestNotification) {
      showToast(latestNotification);
      
      // Add to visible notifications
      setVisibleNotifications(prev => 
        [latestNotification, ...prev].slice(0, maxNotifications)
      );

      // Auto-hide after duration
      if (autoHideDuration > 0) {
        setTimeout(() => {
          removeNotification(latestNotification.id);
        }, autoHideDuration);
      }
    }
  }, [latestNotification]);

  const showToast = (notification: NotificationMessage) => {
    const Toast = Swal.mixin({
      toast: true,
      position: position.includes('top') ? 'top-end' : 'bottom-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: notification.type,
      title: notification.title,
      text: notification.message,
    });
  };

  const removeNotification = (id: string) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getPositionClasses = () => {
    const classes = ['fixed', 'z-50'];
    
    switch (position) {
      case 'top-right':
        classes.push('top-20', 'right-4');
        break;
      case 'top-left':
        classes.push('top-20', 'left-4');
        break;
      case 'bottom-right':
        classes.push('bottom-4', 'right-4');
        break;
      case 'bottom-left':
        classes.push('bottom-4', 'left-4');
        break;
    }
    
    return classes.join(' ');
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  const getBorderColorForType = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-400';
      case 'error':
        return 'border-red-400';
      case 'warning':
        return 'border-yellow-400';
      case 'info':
      default:
        return 'border-blue-400';
    }
  };

  const unreadCount = notifications.length;

  return (
    <>
      {/* Notification Badge/Button */}
      <div className={getPositionClasses()}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <svg
            className="w-6 h-6 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Expanded Notification List */}
        {isExpanded && (
          <div className="absolute mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden"
            style={{ 
              right: position.includes('right') ? 0 : 'auto',
              left: position.includes('left') ? 0 : 'auto',
            }}
          >
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Notifications</h3>
                <button
                  onClick={clearNotifications}
                  className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p>No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-l-4 ${getBorderColorForType(notification.type)}`}
                    >
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">
                          {getIconForType(notification.type)}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Individual notification cards (visible notifications) */}
      <div className={`${getPositionClasses()} pointer-events-none`} style={{ marginTop: '80px' }}>
        <div className="space-y-2">
          {visibleNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`pointer-events-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm transform transition-all duration-300 hover:scale-105 border-l-4 ${getBorderColorForType(notification.type)}`}
            >
              <div className="flex items-start">
                <span className="text-xl mr-3">{getIconForType(notification.type)}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};