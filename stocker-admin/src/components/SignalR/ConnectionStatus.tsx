import React, { useState, useEffect } from 'react';
import { useSignalRConnection } from '../../hooks/useSignalR';

interface ConnectionStatusProps {
  showDetails?: boolean;
  position?: 'fixed' | 'relative';
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  showDetails = false,
  position = 'fixed',
  className = '',
}) => {
  const connection = useSignalRConnection();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReconnectButton, setShowReconnectButton] = useState(false);

  useEffect(() => {
    // Show reconnect button after multiple failed attempts
    if (connection.reconnectAttempts >= 3 && !connection.isConnected) {
      setShowReconnectButton(true);
    } else {
      setShowReconnectButton(false);
    }
  }, [connection.reconnectAttempts, connection.isConnected]);

  const getStatusColor = () => {
    if (connection.isConnected) return 'bg-green-500';
    if (connection.reconnectAttempts > 0) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (connection.isConnected) return 'Connected';
    if (connection.reconnectAttempts > 0) return `Reconnecting... (${connection.reconnectAttempts})`;
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (connection.isConnected) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    if (connection.reconnectAttempts > 0) {
      return (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  };

  const handleReconnect = async () => {
    setShowReconnectButton(false);
    await connection.connect();
  };

  const positionClasses = position === 'fixed' 
    ? 'fixed bottom-4 left-4 z-50' 
    : 'relative';

  return (
    <div className={`${positionClasses} ${className}`}>
      {/* Compact Status Indicator */}
      <div
        className={`flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl ${
          !connection.isConnected ? 'animate-pulse' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${connection.isConnected ? '' : 'animate-pulse'}`} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getStatusText()}
        </span>
        {showDetails && (
          <>
            {getStatusIcon()}
            <svg
              className={`w-4 h-4 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && showDetails && (
        <div className="absolute bottom-full mb-2 left-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Real-time Connection Details
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`font-medium ${connection.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {getStatusText()}
              </span>
            </div>
            
            {connection.connectionId && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Connection ID:</span>
                <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                  {connection.connectionId.substring(0, 8)}...
                </span>
              </div>
            )}
            
            {connection.reconnectAttempts > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Reconnect Attempts:</span>
                <span className="font-medium text-yellow-600">
                  {connection.reconnectAttempts}
                </span>
              </div>
            )}
            
            {connection.lastError && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                <p className="text-xs text-red-600 dark:text-red-400">
                  Error: {connection.lastError}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex space-x-2">
            {connection.isConnected ? (
              <button
                onClick={connection.disconnect}
                className="flex-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleReconnect}
                className="flex-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
              >
                Connect
              </button>
            )}
          </div>

          {/* Connection Features */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Active Features
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${connection.isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-gray-600 dark:text-gray-400">Notifications</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${connection.isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-gray-600 dark:text-gray-400">Live Updates</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${connection.isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-gray-600 dark:text-gray-400">Validation</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${connection.isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-gray-600 dark:text-gray-400">Activity Tracking</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reconnect Toast */}
      {showReconnectButton && !isExpanded && (
        <div className="absolute bottom-full mb-2 left-0 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
            Connection lost. Would you like to reconnect?
          </p>
          <button
            onClick={handleReconnect}
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors text-sm"
          >
            Reconnect Now
          </button>
        </div>
      )}
    </div>
  );
};