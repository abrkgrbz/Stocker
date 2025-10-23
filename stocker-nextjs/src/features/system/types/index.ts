export interface SystemMetrics {
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  network: NetworkMetrics;
  timestamp: string;
}

export interface CpuMetrics {
  usagePercentage: number;
  coreCount: number;
  perCoreUsage: number[];
  processorName: string;
}

export interface MemoryMetrics {
  totalBytes: number;
  usedBytes: number;
  availableBytes: number;
  usagePercentage: number;
  cachedBytes: number;
}

export interface DiskMetrics {
  drives: DiskInfo[];
  totalUsagePercentage: number;
}

export interface DiskInfo {
  name: string;
  volumeLabel: string;
  totalBytes: number;
  usedBytes: number;
  availableBytes: number;
  usagePercentage: number;
  fileSystem: string;
}

export interface NetworkMetrics {
  bytesReceived: number;
  bytesSent: number;
  receiveMbps: number;
  sendMbps: number;
  interfaces: NetworkInterface[];
}

export interface NetworkInterface {
  name: string;
  type: string;
  bytesReceived: number;
  bytesSent: number;
  status: string;
  macAddress: string;
}

export interface ServiceStatus {
  serviceName: string;
  status: ServiceHealth;
  uptimePercentage: number;
  responseTimeMs: number;
  errorRate: number;
  lastCheckTime: string;
  incidentCount: number;
  additionalInfo: Record<string, string>;
}

export enum ServiceHealth {
  Online = 0,
  Degraded = 1,
  Offline = 2,
  Maintenance = 3,
}

export interface SystemHealth {
  overallStatus: HealthStatus;
  message: string;
  checkTime: string;
  uptime: string;
  version: string;
  environment: string;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: HealthStatus;
  description: string;
  responseTimeMs: number;
  data: Record<string, unknown>;
}

export enum HealthStatus {
  Healthy = 0,
  Degraded = 1,
  Unhealthy = 2,
}

export interface ServerMetric {
  serverName: string;
  serverType: string;
  cpuUsagePercentage: number;
  memoryUsagePercentage: number;
  diskUsagePercentage: number;
  network: NetworkTraffic;
  status: ServerStatus;
  timestamp: string;
}

export interface NetworkTraffic {
  inboundMbps: number;
  outboundMbps: number;
}

export enum ServerStatus {
  Healthy = 0,
  Warning = 1,
  Critical = 2,
  Offline = 3,
}
