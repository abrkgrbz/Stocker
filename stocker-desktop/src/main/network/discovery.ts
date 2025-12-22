/**
 * mDNS Discovery - Auto-discovery of Host on LAN
 *
 * Uses mDNS (Bonjour/Avahi) for zero-configuration networking.
 * Allows clients to automatically find the Host without manual IP entry.
 *
 * Ported from specification: mDNS Discovery
 */

import { EventEmitter } from 'events';
import { networkInterfaces } from 'os';
import {
  NetworkConstants,
  DiscoveredHost,
  HostInfo,
} from './types';

// ============================================
// Types for mDNS (simplified to avoid complex generics)
// ============================================

interface MDNSInstance {
  on(event: string, callback: (data: unknown) => void): void;
  query(query: unknown): void;
  respond(response: unknown): void;
  destroy(): void;
}

// ============================================
// Discovery Service Class
// ============================================

export class DiscoveryService extends EventEmitter {
  private isAdvertising = false;
  private isBrowsing = false;
  private discoveredHosts: Map<string, DiscoveredHost> = new Map();
  private advertiseInfo: HostInfo | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  // mDNS instance (lazy loaded)
  private mdnsInstance: MDNSInstance | null = null;

  // Broadcast socket for fallback discovery
  private broadcastSocket: import('dgram').Socket | null = null;
  private readonly BROADCAST_PORT = 3848;

  constructor() {
    super();
  }

  // ============================================
  // Service Advertisement (Host)
  // ============================================

  /**
   * Start advertising this host on the network
   */
  async startAdvertising(hostInfo: HostInfo): Promise<boolean> {
    if (this.isAdvertising) {
      console.log('[Discovery] Already advertising');
      return true;
    }

    try {
      this.advertiseInfo = hostInfo;

      // Try to load multicast-dns
      await this.loadMDNS();

      if (this.mdnsInstance) {
        // Respond to queries for our service
        this.mdnsInstance.on('query', (query) => {
          this.handleQuery(query as { questions: Array<{ name: string; type: string }> });
        });

        // Announce our presence
        this.announceService();

        console.log(`[Discovery] Started advertising: ${hostInfo.hostName}`);
      } else {
        // Fallback: Use UDP broadcast for simpler discovery
        console.log('[Discovery] Using fallback broadcast discovery');
        await this.startBroadcastAdvertising();
      }

      this.isAdvertising = true;
      this.emit('advertising_started', hostInfo);

      return true;
    } catch (error) {
      console.error('[Discovery] Failed to start advertising:', error);
      return false;
    }
  }

  /**
   * Stop advertising
   */
  stopAdvertising(): void {
    if (!this.isAdvertising) {
      return;
    }

    if (this.mdnsInstance) {
      this.mdnsInstance.destroy();
      this.mdnsInstance = null;
    }

    if (this.broadcastSocket) {
      this.broadcastSocket.close();
      this.broadcastSocket = null;
    }

    this.isAdvertising = false;
    this.advertiseInfo = null;

    console.log('[Discovery] Stopped advertising');
    this.emit('advertising_stopped');
  }

  private async loadMDNS(): Promise<void> {
    try {
      // Dynamic import to avoid bundling issues
      const mdnsModule = await import('multicast-dns');
      const mdnsFactory = mdnsModule.default || mdnsModule;
      this.mdnsInstance = mdnsFactory() as MDNSInstance;
    } catch (error) {
      console.warn('[Discovery] multicast-dns not available:', error);
      this.mdnsInstance = null;
    }
  }

  private handleQuery(query: { questions: Array<{ name: string; type: string }> }): void {
    if (!this.advertiseInfo) return;

    const isOurService = query.questions?.some(
      (q) =>
        q.name === `${NetworkConstants.MDNS_SERVICE_NAME}.${NetworkConstants.MDNS_SERVICE_TYPE}.local` ||
        q.name === `${NetworkConstants.MDNS_SERVICE_TYPE}.local`
    );

    if (isOurService) {
      this.announceService();
    }
  }

  private announceService(): void {
    if (!this.mdnsInstance || !this.advertiseInfo) return;

    const localIP = this.getLocalIP();
    const serviceName = `${NetworkConstants.MDNS_SERVICE_NAME}.${NetworkConstants.MDNS_SERVICE_TYPE}.local`;

    this.mdnsInstance.respond({
      answers: [
        {
          name: serviceName,
          type: 'SRV',
          data: {
            port: this.advertiseInfo.port,
            weight: 0,
            priority: 0,
            target: `${this.advertiseInfo.hostName}.local`,
          },
        },
        {
          name: `${this.advertiseInfo.hostName}.local`,
          type: 'A',
          data: localIP,
        },
        {
          name: serviceName,
          type: 'TXT',
          data: [
            `hostId=${this.advertiseInfo.hostId}`,
            `version=${this.advertiseInfo.version}`,
            `sessions=${this.advertiseInfo.activeSessions}`,
            `maxSessions=${this.advertiseInfo.maxSessions}`,
          ],
        },
      ],
    });
  }

  // ============================================
  // Fallback Broadcast Discovery
  // ============================================

  private async startBroadcastAdvertising(): Promise<void> {
    const dgram = await import('dgram');
    this.broadcastSocket = dgram.createSocket('udp4');

    this.broadcastSocket.on('error', (err) => {
      console.error('[Discovery] Broadcast socket error:', err);
    });

    this.broadcastSocket.bind(this.BROADCAST_PORT, () => {
      this.broadcastSocket!.setBroadcast(true);

      // Announce periodically
      const announceInterval = setInterval(() => {
        if (!this.isAdvertising || !this.advertiseInfo) {
          clearInterval(announceInterval);
          return;
        }

        const message = JSON.stringify({
          type: 'STOCKER_HOST_ANNOUNCE',
          ...this.advertiseInfo,
          address: this.getLocalIP(),
        });

        const buffer = Buffer.from(message);
        this.broadcastSocket?.send(
          buffer,
          0,
          buffer.length,
          this.BROADCAST_PORT,
          '255.255.255.255'
        );
      }, 5000);
    });
  }

  // ============================================
  // Service Discovery (Client)
  // ============================================

  /**
   * Start browsing for hosts
   */
  async startBrowsing(): Promise<void> {
    if (this.isBrowsing) {
      console.log('[Discovery] Already browsing');
      return;
    }

    try {
      await this.loadMDNS();

      if (this.mdnsInstance) {
        this.mdnsInstance.on('response', (response) => {
          this.handleResponse(response as { answers: Array<{ name: string; type: string; data: unknown }> });
        });

        // Query for services
        this.queryServices();

        // Query periodically
        const queryInterval = setInterval(() => {
          if (this.isBrowsing) {
            this.queryServices();
          } else {
            clearInterval(queryInterval);
          }
        }, 10000);
      } else {
        // Fallback: Listen for broadcast announcements
        await this.startBroadcastBrowsing();
      }

      // Start cleanup interval for stale hosts
      this.cleanupInterval = setInterval(() => {
        this.cleanupStaleHosts();
      }, 30000);

      this.isBrowsing = true;
      console.log('[Discovery] Started browsing for hosts');
      this.emit('browsing_started');
    } catch (error) {
      console.error('[Discovery] Failed to start browsing:', error);
    }
  }

  /**
   * Stop browsing
   */
  stopBrowsing(): void {
    if (!this.isBrowsing) {
      return;
    }

    if (this.mdnsInstance) {
      this.mdnsInstance.destroy();
      this.mdnsInstance = null;
    }

    if (this.broadcastSocket) {
      this.broadcastSocket.close();
      this.broadcastSocket = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.isBrowsing = false;
    this.discoveredHosts.clear();

    console.log('[Discovery] Stopped browsing');
    this.emit('browsing_stopped');
  }

  private queryServices(): void {
    if (!this.mdnsInstance) return;

    this.mdnsInstance.query({
      questions: [
        {
          name: `${NetworkConstants.MDNS_SERVICE_TYPE}.local`,
          type: 'PTR',
        },
      ],
    });
  }

  private handleResponse(response: {
    answers: Array<{
      name: string;
      type: string;
      data: unknown;
    }>;
  }): void {
    if (!response.answers) return;

    // Parse mDNS response and extract host info
    const srvRecord = response.answers.find((a) => a.type === 'SRV');
    const aRecord = response.answers.find((a) => a.type === 'A');
    const txtRecord = response.answers.find((a) => a.type === 'TXT');

    if (srvRecord && aRecord) {
      const srvData = srvRecord.data as { port: number; target: string };
      const address = aRecord.data as string;
      const txtData = txtRecord?.data as string[] | undefined;

      const hostInfo = this.parseTxtRecord(txtData);

      const host: DiscoveredHost = {
        hostId: hostInfo.hostId || 'unknown',
        hostName: srvData.target?.replace('.local', '') || 'Unknown Host',
        address,
        port: srvData.port,
        version: hostInfo.version || '1.0.0',
        discovered: new Date(),
      };

      this.addDiscoveredHost(host);
    }
  }

  private parseTxtRecord(data: string[] | undefined): Record<string, string> {
    const result: Record<string, string> = {};

    if (!data) return result;

    for (const entry of data) {
      const [key, value] = entry.split('=');
      if (key && value) {
        result[key] = value;
      }
    }

    return result;
  }

  private async startBroadcastBrowsing(): Promise<void> {
    const dgram = await import('dgram');
    this.broadcastSocket = dgram.createSocket('udp4');

    this.broadcastSocket.on('message', (msg) => {
      try {
        const data = JSON.parse(msg.toString());

        if (data.type === 'STOCKER_HOST_ANNOUNCE') {
          const host: DiscoveredHost = {
            hostId: data.hostId,
            hostName: data.hostName,
            address: data.address,
            port: data.port,
            version: data.version,
            discovered: new Date(),
          };

          this.addDiscoveredHost(host);
        }
      } catch {
        // Ignore invalid messages
      }
    });

    this.broadcastSocket.on('error', (err) => {
      console.error('[Discovery] Broadcast listen error:', err);
    });

    this.broadcastSocket.bind(this.BROADCAST_PORT, () => {
      this.broadcastSocket!.setBroadcast(true);
    });
  }

  private addDiscoveredHost(host: DiscoveredHost): void {
    const existing = this.discoveredHosts.get(host.hostId);

    if (!existing) {
      console.log(`[Discovery] Found new host: ${host.hostName} at ${host.address}:${host.port}`);
      this.discoveredHosts.set(host.hostId, host);
      this.emit('host_found', host);
    } else {
      // Update existing host
      existing.discovered = host.discovered;
      existing.address = host.address;
      existing.port = host.port;
    }
  }

  private cleanupStaleHosts(): void {
    const now = Date.now();
    const staleThreshold = 60000; // 1 minute

    for (const [hostId, host] of this.discoveredHosts) {
      const age = now - host.discovered.getTime();

      if (age > staleThreshold) {
        console.log(`[Discovery] Removing stale host: ${host.hostName}`);
        this.discoveredHosts.delete(hostId);
        this.emit('host_lost', host);
      }
    }
  }

  // ============================================
  // Host Management
  // ============================================

  /**
   * Get all discovered hosts
   */
  getDiscoveredHosts(): DiscoveredHost[] {
    return Array.from(this.discoveredHosts.values());
  }

  /**
   * Get a specific host
   */
  getHost(hostId: string): DiscoveredHost | undefined {
    return this.discoveredHosts.get(hostId);
  }

  /**
   * Clear discovered hosts
   */
  clearDiscoveredHosts(): void {
    this.discoveredHosts.clear();
  }

  // ============================================
  // Utility
  // ============================================

  /**
   * Get local IP address
   */
  getLocalIP(): string {
    const interfaces = networkInterfaces();

    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name];
      if (!iface) continue;

      for (const info of iface) {
        // Skip internal and IPv6
        if (info.internal || info.family !== 'IPv4') continue;

        // Skip link-local addresses
        if (info.address.startsWith('169.254')) continue;

        return info.address;
      }
    }

    return '127.0.0.1';
  }

  /**
   * Get all local IP addresses
   */
  getAllLocalIPs(): string[] {
    const ips: string[] = [];
    const interfaces = networkInterfaces();

    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name];
      if (!iface) continue;

      for (const info of iface) {
        if (info.internal || info.family !== 'IPv4') continue;
        ips.push(info.address);
      }
    }

    return ips;
  }

  // ============================================
  // Status
  // ============================================

  /**
   * Check if advertising
   */
  isAdvertisingHost(): boolean {
    return this.isAdvertising;
  }

  /**
   * Check if browsing
   */
  isBrowsingForHosts(): boolean {
    return this.isBrowsing;
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    this.stopAdvertising();
    this.stopBrowsing();
    this.removeAllListeners();
  }
}

// ============================================
// Singleton Instance
// ============================================

let discoveryServiceInstance: DiscoveryService | null = null;

export function getDiscoveryService(): DiscoveryService {
  if (!discoveryServiceInstance) {
    discoveryServiceInstance = new DiscoveryService();
  }
  return discoveryServiceInstance;
}

export function resetDiscoveryService(): void {
  if (discoveryServiceInstance) {
    discoveryServiceInstance.cleanup();
    discoveryServiceInstance = null;
  }
}
