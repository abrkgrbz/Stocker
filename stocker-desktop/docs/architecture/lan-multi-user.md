# LAN Multi-User Architecture

## Overview

Stocker Desktop supports multi-user operation over LAN using a Host/Client architecture with dynamic seat enforcement.

## System Architecture

```mermaid
graph TB
    subgraph "Host PC (First to open DB)"
        H[Electron App - Host Mode]
        DB[(SQLite + SQLCipher)]
        HS[Socket.io Server :3847]
        SM[Session Manager]
        LM[License Manager]
        MDNS[mDNS Advertiser]

        H --> DB
        H --> HS
        HS --> SM
        SM --> LM
        H --> MDNS
    end

    subgraph "Client PC 1"
        C1[Electron App - Client Mode]
        SC1[Socket.io Client]
        MD1[mDNS Browser]

        C1 --> SC1
        C1 --> MD1
    end

    subgraph "Client PC 2"
        C2[Electron App - Client Mode]
        SC2[Socket.io Client]
        MD2[mDNS Browser]

        C2 --> SC2
        C2 --> MD2
    end

    MD1 -.->|Discover| MDNS
    MD2 -.->|Discover| MDNS
    SC1 -->|Actions| HS
    SC2 -->|Actions| HS
    HS -->|Events| SC1
    HS -->|Events| SC2
```

## Host-Client Handshake Flow

```mermaid
sequenceDiagram
    participant C as Client App
    participant D as mDNS Discovery
    participant H as Host Server
    participant SM as Session Manager
    participant LM as License Manager
    participant DB as Database

    Note over C: App Launch (Client Mode)
    C->>D: Start browsing for hosts
    D-->>C: Host found (192.168.1.50:3847)

    Note over C,H: Connection Phase
    C->>H: Connect via Socket.io
    H-->>C: Connection established

    Note over C,H: Authentication Phase
    C->>H: AUTH {userId, password, machineName}
    H->>LM: Check license validity
    LM-->>H: License valid (seats: 10)
    H->>SM: Check seat availability
    SM-->>H: 3/10 seats used
    H->>DB: Verify credentials
    DB-->>H: User valid
    H->>SM: Create session
    SM-->>H: Session created
    H-->>C: AUTH_RESPONSE {success, sessionId, permissions}

    Note over C,H: Operation Phase
    loop Heartbeat (every 10s)
        C->>H: HEARTBEAT {sessionId}
        H->>SM: Update heartbeat
        H-->>C: HEARTBEAT_RESPONSE
    end

    C->>H: ACTION {module, action, payload}
    H->>DB: Execute operation
    DB-->>H: Result
    H-->>C: ACTION_RESPONSE {data}
    H->>C: SERVER_EVENT {DATA_CHANGED}
```

## Seat Enforcement Logic

```mermaid
flowchart TD
    A[New Connection Request] --> B{License Valid?}
    B -->|No| C[Reject: LICENSE_EXPIRED]
    B -->|Yes| D{User Already Connected?}
    D -->|Yes| E[Reject: USER_ALREADY_CONNECTED]
    D -->|No| F{Active Sessions < Max Seats?}
    F -->|No| G[Reject: MAX_SEATS_REACHED]
    F -->|Yes| H{Credentials Valid?}
    H -->|No| I[Reject: INVALID_CREDENTIALS]
    H -->|Yes| J[Create Session]
    J --> K[Send Success Response]
    K --> L[Start Heartbeat Monitor]
```

## Zombie Session Cleanup

```mermaid
flowchart TD
    A[Heartbeat Check - Every 10s] --> B{Session exists?}
    B -->|No| C[Skip]
    B -->|Yes| D{Time since last heartbeat > 10s?}
    D -->|No| C
    D -->|Yes| E[Increment missed heartbeat count]
    E --> F{Missed >= 3?}
    F -->|No| G[Log warning]
    F -->|Yes| H[Evict session - Zombie Killer]
    H --> I[Free seat for other users]
    I --> J[Broadcast USER_DISCONNECTED]
```

## Component Details

### Network Manager (`network-manager.ts`)
- Coordinates host/client mode transitions
- Provides unified interface for network operations
- Handles role switching (standalone → host/client)

### Host Server (`host-server.ts`)
- Socket.io server on port 3847
- Handles authentication, heartbeats, and actions
- Broadcasts events to all connected clients
- Integrates with Session Manager and License Manager

### Session Manager (`session-manager.ts`)
- Tracks active client sessions
- Enforces seat limits based on license
- Implements zombie killer (30s timeout, 3 missed heartbeats)
- Provides admin operations (force disconnect)

### LAN Client (`lan-client.ts`)
- Socket.io client for connecting to host
- Handles authentication flow
- Sends heartbeats at 10s intervals
- Executes actions through host

### Discovery Service (`discovery.ts`)
- mDNS-based host discovery (primary)
- UDP broadcast fallback (for Windows without Bonjour)
- Automatic host detection on LAN
- Stale host cleanup

## Protocol Constants

| Constant | Value | Description |
|----------|-------|-------------|
| DEFAULT_PORT | 3847 | Socket.io server port |
| HEARTBEAT_INTERVAL | 10s | Time between heartbeats |
| HEARTBEAT_TIMEOUT | 30s | Max time without heartbeat |
| MAX_MISSED_HEARTBEATS | 3 | Misses before eviction |
| MDNS_SERVICE_TYPE | _stocker._tcp | mDNS service type |

## Message Types

### Client → Host
- `auth` - Authentication request
- `heartbeat` - Keep-alive signal
- `action` - Database/business operation

### Host → Client
- `auth:response` - Authentication result
- `heartbeat:response` - Heartbeat acknowledgment
- `action:response` - Operation result
- `server:event` - Push notifications (data changes, user events)

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_CREDENTIALS` | Wrong username/password |
| `MAX_SEATS_REACHED` | License seat limit exceeded |
| `USER_ALREADY_CONNECTED` | Same user on another device |
| `LICENSE_EXPIRED` | License not valid |
| `SESSION_EXPIRED` | Session timed out |
| `SERVER_ERROR` | Internal server error |
