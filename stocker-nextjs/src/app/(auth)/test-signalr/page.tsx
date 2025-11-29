'use client';

import { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

export default function TestSignalRPage() {
  const [status, setStatus] = useState<string>('Disconnected');
  const [logs, setLogs] = useState<string[]>([]);
  const [registrationId, setRegistrationId] = useState<string>('');
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const connectToHub = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5249';
    const hubUrl = `${apiUrl}/hubs/notification`;

    addLog(`Connecting to: ${hubUrl}`);
    setStatus('Connecting...');

    try {
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets |
                     signalR.HttpTransportType.ServerSentEvents |
                     signalR.HttpTransportType.LongPolling,
          withCredentials: true,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Event handlers
      newConnection.onclose((error) => {
        addLog(`Connection closed: ${error?.message || 'No error'}`);
        setStatus('Disconnected');
      });

      newConnection.onreconnecting((error) => {
        addLog(`Reconnecting: ${error?.message || 'No error'}`);
        setStatus('Reconnecting...');
      });

      newConnection.onreconnected((connectionId) => {
        addLog(`Reconnected with ID: ${connectionId}`);
        setStatus('Connected');
      });

      // Listen for tenant creation progress
      newConnection.on('TenantCreationProgress', (data) => {
        addLog(`📊 Progress: ${JSON.stringify(data)}`);
      });

      newConnection.on('JoinedRegistrationGroup', (data) => {
        addLog(`✅ Joined group: ${JSON.stringify(data)}`);
      });

      newConnection.on('LeftRegistrationGroup', (data) => {
        addLog(`👋 Left group: ${JSON.stringify(data)}`);
      });

      newConnection.on('ReceiveNotification', (data) => {
        addLog(`🔔 Notification: ${JSON.stringify(data)}`);
      });

      await newConnection.start();
      addLog(`✅ Connected! Connection ID: ${newConnection.connectionId}`);
      setStatus('Connected');
      setConnection(newConnection);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`❌ Connection failed: ${errorMessage}`);
      setStatus(`Error: ${errorMessage}`);
    }
  };

  const disconnect = async () => {
    if (connection) {
      await connection.stop();
      setConnection(null);
      addLog('Disconnected manually');
      setStatus('Disconnected');
    }
  };

  const joinRegistrationGroup = async () => {
    if (!connection || !registrationId) {
      addLog('❌ No connection or registration ID');
      return;
    }

    try {
      addLog(`Joining registration group: ${registrationId}`);
      await connection.invoke('JoinRegistrationGroup', registrationId);
      addLog('✅ JoinRegistrationGroup invoked');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`❌ Failed to join group: ${errorMessage}`);
    }
  };

  const leaveRegistrationGroup = async () => {
    if (!connection || !registrationId) {
      addLog('❌ No connection or registration ID');
      return;
    }

    try {
      addLog(`Leaving registration group: ${registrationId}`);
      await connection.invoke('LeaveRegistrationGroup', registrationId);
      addLog('✅ LeaveRegistrationGroup invoked');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`❌ Failed to leave group: ${errorMessage}`);
    }
  };

  useEffect(() => {
    // Get registrationId from URL if present
    const params = new URLSearchParams(window.location.search);
    const regId = params.get('registrationId');
    if (regId) {
      setRegistrationId(regId);
    }

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">SignalR Connection Test</h1>

        {/* Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className={`text-lg font-medium ${
            status === 'Connected' ? 'text-green-600' :
            status === 'Disconnected' ? 'text-red-600' :
            'text-yellow-600'
          }`}>
            {status}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5249'}
          </div>
          <div className="text-sm text-gray-500">
            Hub URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5249'}/hubs/notification
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>

          <div className="flex gap-4 mb-4">
            <button
              onClick={connectToHub}
              disabled={status === 'Connected'}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Connect
            </button>
            <button
              onClick={disconnect}
              disabled={status !== 'Connected'}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              Disconnect
            </button>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium mb-2">Registration Group Test</h3>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={registrationId}
                onChange={(e) => setRegistrationId(e.target.value)}
                placeholder="Registration ID (GUID)"
                className="flex-1 px-3 py-2 border rounded"
              />
              <button
                onClick={joinRegistrationGroup}
                disabled={status !== 'Connected' || !registrationId}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                Join Group
              </button>
              <button
                onClick={leaveRegistrationGroup}
                disabled={status !== 'Connected' || !registrationId}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400"
              >
                Leave Group
              </button>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Logs</h2>
            <button
              onClick={() => setLogs([])}
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Click Connect to start.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Test Instructions:</h3>
          <ol className="list-decimal list-inside text-yellow-700 space-y-1">
            <li>Click &quot;Connect&quot; to establish SignalR connection</li>
            <li>If you get 401 error, the backend hasn&apos;t been redeployed yet</li>
            <li>If connected, enter a Registration ID and click &quot;Join Group&quot;</li>
            <li>Watch for TenantCreationProgress events in the logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
