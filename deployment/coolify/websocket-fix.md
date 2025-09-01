# WebSocket Configuration for Coolify

## Problem
WebSocket Error 1011 - Server terminates connection immediately after handshake

## Solution

### 1. Add Custom Labels in Coolify UI

In your API service configuration, add these custom labels:

```
traefik.http.services.{serviceName}.loadbalancer.server.port=5000
traefik.http.routers.{serviceName}.rule=Host(`api.stoocker.app`)
traefik.http.routers.{serviceName}.tls=true
traefik.http.routers.{serviceName}.tls.certresolver=letsencrypt
traefik.http.middlewares.{serviceName}-websocket.headers.customrequestheaders.X-Forwarded-Proto=https
traefik.http.middlewares.{serviceName}-websocket.headers.customrequestheaders.Connection=keep-alive
traefik.http.middlewares.{serviceName}-websocket.headers.customrequestheaders.Upgrade=websocket
traefik.http.routers.{serviceName}.middlewares={serviceName}-websocket
```

### 2. Alternative: Use Long Polling Instead

If WebSocket continues to fail, force SignalR to use Long Polling:

```javascript
// In signalr.service.ts
.withUrl(`${this.baseUrl}/hubs/validation`, {
  transport: signalR.HttpTransportType.LongPolling, // Force Long Polling
  withCredentials: false,
  headers: {
    'X-Tenant-Id': tenantId,
    'X-Bypass-Rate-Limit': 'true'
  }
})
```

### 3. Check Coolify Proxy Settings

Ensure these settings in Coolify:
- Proxy Type: Traefik v2
- WebSocket Support: Enabled
- Timeout: 3600 seconds (for long-running connections)

### 4. Environment Variables for API

Add these to fix CORS and WebSocket issues:

```
# Enable WebSocket keepalive
Kestrel__Limits__KeepAliveTimeout=00:02:00
Kestrel__Limits__RequestHeadersTimeout=00:02:00

# SignalR specific settings
SignalR__KeepAliveInterval=00:00:30
SignalR__ClientTimeoutInterval=00:01:00
SignalR__HandshakeTimeout=00:00:15
```

### 5. Test WebSocket Connection

Test directly with curl:

```bash
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" https://api.stoocker.app/hubs/validation
```

Expected response should include:
```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
```

If you get 404 or 503, the routing is incorrect.
If you get 101 then immediately disconnects, it's a server-side issue.