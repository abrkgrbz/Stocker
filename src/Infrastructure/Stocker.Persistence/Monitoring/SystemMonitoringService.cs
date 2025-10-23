using System.Diagnostics;
using System.Net.NetworkInformation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.SystemMonitoring;

namespace Stocker.Persistence.Monitoring;

public class SystemMonitoringService : ISystemMonitoringService
{
    private readonly IApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly DateTime _processStartTime;

    public SystemMonitoringService(
        IApplicationDbContext context,
        IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
        _processStartTime = Process.GetCurrentProcess().StartTime;
    }

    public async Task<SystemMetricsDto> GetSystemMetricsAsync(CancellationToken cancellationToken = default)
    {
        var currentProcess = Process.GetCurrentProcess();
        var allProcesses = Process.GetProcesses();

        // CPU Metrics
        var cpuMetrics = await GetCpuMetricsAsync(currentProcess);

        // Memory Metrics
        var memoryMetrics = GetMemoryMetrics(currentProcess);

        // Disk Metrics
        var diskMetrics = GetDiskMetrics();

        // Network Metrics
        var networkMetrics = GetNetworkMetrics();

        return new SystemMetricsDto
        {
            Cpu = cpuMetrics,
            Memory = memoryMetrics,
            Disk = diskMetrics,
            Network = networkMetrics,
            Timestamp = DateTime.UtcNow
        };
    }

    public async Task<List<ServiceStatusDto>> GetServiceStatusAsync(CancellationToken cancellationToken = default)
    {
        var services = new List<ServiceStatusDto>();

        // Database Service
        services.Add(await CheckDatabaseServiceAsync(cancellationToken));

        // Application Service
        services.Add(CheckApplicationService());

        // Add other services as needed
        return services;
    }

    public async Task<SystemHealthDto> GetSystemHealthAsync(CancellationToken cancellationToken = default)
    {
        var checks = new List<HealthCheck>();
        var overallStatus = HealthStatus.Healthy;

        // Database Health Check
        var dbCheck = await CheckDatabaseHealthAsync(cancellationToken);
        checks.Add(dbCheck);
        if (dbCheck.Status == HealthStatus.Unhealthy)
            overallStatus = HealthStatus.Unhealthy;
        else if (dbCheck.Status == HealthStatus.Degraded && overallStatus != HealthStatus.Unhealthy)
            overallStatus = HealthStatus.Degraded;

        // Memory Health Check
        var memoryCheck = CheckMemoryHealth();
        checks.Add(memoryCheck);
        if (memoryCheck.Status == HealthStatus.Degraded && overallStatus == HealthStatus.Healthy)
            overallStatus = HealthStatus.Degraded;

        // Disk Health Check
        var diskCheck = CheckDiskHealth();
        checks.Add(diskCheck);
        if (diskCheck.Status == HealthStatus.Degraded && overallStatus == HealthStatus.Healthy)
            overallStatus = HealthStatus.Degraded;

        var uptime = DateTime.UtcNow - _processStartTime;

        return new SystemHealthDto
        {
            OverallStatus = overallStatus,
            Message = overallStatus == HealthStatus.Healthy
                ? "All systems operational"
                : overallStatus == HealthStatus.Degraded
                    ? "Some systems degraded"
                    : "Critical systems down",
            CheckTime = DateTime.UtcNow,
            Uptime = uptime,
            Version = GetType().Assembly.GetName().Version?.ToString() ?? "Unknown",
            Environment = _configuration["ASPNETCORE_ENVIRONMENT"] ?? "Production",
            Checks = checks.ToArray()
        };
    }

    public Task<List<ServerMetricDto>> GetServerMetricsAsync(CancellationToken cancellationToken = default)
    {
        var metrics = new List<ServerMetricDto>
        {
            new ServerMetricDto
            {
                ServerName = Environment.MachineName,
                ServerType = "Application",
                CpuUsagePercentage = GetCpuUsagePercentage(),
                MemoryUsagePercentage = GetMemoryUsagePercentage(),
                DiskUsagePercentage = GetDiskUsagePercentage(),
                Network = new NetworkTraffic
                {
                    InboundMbps = 0, // Requires more complex calculation
                    OutboundMbps = 0
                },
                Status = ServerStatus.Healthy,
                Timestamp = DateTime.UtcNow
            }
        };

        return Task.FromResult(metrics);
    }

    #region Private Helper Methods

    private async Task<CpuMetrics> GetCpuMetricsAsync(Process process)
    {
        var processorCount = Environment.ProcessorCount;

        return new CpuMetrics
        {
            UsagePercentage = GetCpuUsagePercentage(),
            CoreCount = processorCount,
            PerCoreUsage = Array.Empty<double>(), // Requires PerformanceCounter on Windows
            ProcessorName = Environment.GetEnvironmentVariable("PROCESSOR_IDENTIFIER") ?? "Unknown"
        };
    }

    private MemoryMetrics GetMemoryMetrics(Process process)
    {
        var gcMemoryInfo = GC.GetGCMemoryInfo();
        var totalMemory = gcMemoryInfo.TotalAvailableMemoryBytes;
        var usedMemory = process.WorkingSet64;
        var availableMemory = totalMemory - usedMemory;

        return new MemoryMetrics
        {
            TotalBytes = totalMemory,
            UsedBytes = usedMemory,
            AvailableBytes = availableMemory,
            UsagePercentage = (double)usedMemory / totalMemory * 100,
            CachedBytes = 0 // Requires platform-specific implementation
        };
    }

    private DiskMetrics GetDiskMetrics()
    {
        var drives = DriveInfo.GetDrives()
            .Where(d => d.IsReady)
            .Select(d => new DiskInfo
            {
                Name = d.Name,
                VolumeLabel = d.VolumeLabel,
                TotalBytes = d.TotalSize,
                UsedBytes = d.TotalSize - d.AvailableFreeSpace,
                AvailableBytes = d.AvailableFreeSpace,
                UsagePercentage = (double)(d.TotalSize - d.AvailableFreeSpace) / d.TotalSize * 100,
                FileSystem = d.DriveFormat
            })
            .ToArray();

        var totalUsage = drives.Length > 0
            ? drives.Average(d => d.UsagePercentage)
            : 0;

        return new DiskMetrics
        {
            Drives = drives,
            TotalUsagePercentage = totalUsage
        };
    }

    private NetworkMetrics GetNetworkMetrics()
    {
        var interfaces = NetworkInterface.GetAllNetworkInterfaces()
            .Where(ni => ni.OperationalStatus == OperationalStatus.Up)
            .Select(ni =>
            {
                var stats = ni.GetIPv4Statistics();
                return new Stocker.SharedKernel.DTOs.SystemMonitoring.NetworkInterface
                {
                    Name = ni.Name,
                    Type = ni.NetworkInterfaceType.ToString(),
                    BytesReceived = stats.BytesReceived,
                    BytesSent = stats.BytesSent,
                    Status = ni.OperationalStatus.ToString(),
                    MacAddress = string.Join(":", ni.GetPhysicalAddress().GetAddressBytes().Select(b => b.ToString("X2")))
                };
            })
            .ToArray();

        var totalReceived = interfaces.Sum(i => i.BytesReceived);
        var totalSent = interfaces.Sum(i => i.BytesSent);

        return new NetworkMetrics
        {
            BytesReceived = totalReceived,
            BytesSent = totalSent,
            ReceiveMbps = 0, // Requires time-based calculation
            SendMbps = 0,
            Interfaces = interfaces
        };
    }

    private async Task<ServiceStatusDto> CheckDatabaseServiceAsync(CancellationToken cancellationToken)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = ServiceHealth.Online;
        var errorRate = 0.0;

        try
        {
            await _context.Database.CanConnectAsync(cancellationToken);
        }
        catch
        {
            status = ServiceHealth.Offline;
            errorRate = 100.0;
        }

        stopwatch.Stop();

        return new ServiceStatusDto
        {
            ServiceName = "Database",
            Status = status,
            UptimePercentage = status == ServiceHealth.Online ? 99.9 : 0,
            ResponseTimeMs = (int)stopwatch.ElapsedMilliseconds,
            ErrorRate = errorRate,
            LastCheckTime = DateTime.UtcNow,
            IncidentCount = 0
        };
    }

    private ServiceStatusDto CheckApplicationService()
    {
        var uptime = DateTime.UtcNow - _processStartTime;
        var uptimePercentage = Math.Min(99.99, uptime.TotalHours / 24 * 100);

        return new ServiceStatusDto
        {
            ServiceName = "Application",
            Status = ServiceHealth.Online,
            UptimePercentage = uptimePercentage,
            ResponseTimeMs = 50,
            ErrorRate = 0.01,
            LastCheckTime = DateTime.UtcNow,
            IncidentCount = 0
        };
    }

    private async Task<HealthCheck> CheckDatabaseHealthAsync(CancellationToken cancellationToken)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = HealthStatus.Healthy;
        var data = new Dictionary<string, object>();

        try
        {
            var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
            status = canConnect ? HealthStatus.Healthy : HealthStatus.Unhealthy;
            data["Connected"] = canConnect;
        }
        catch (Exception ex)
        {
            status = HealthStatus.Unhealthy;
            data["Error"] = ex.Message;
        }

        stopwatch.Stop();

        return new HealthCheck
        {
            Name = "Database",
            Status = status,
            Description = status == HealthStatus.Healthy
                ? "Database connection successful"
                : "Database connection failed",
            ResponseTimeMs = (int)stopwatch.ElapsedMilliseconds,
            Data = data
        };
    }

    private HealthCheck CheckMemoryHealth()
    {
        var gcMemoryInfo = GC.GetGCMemoryInfo();
        var usagePercentage = (double)Process.GetCurrentProcess().WorkingSet64 / gcMemoryInfo.TotalAvailableMemoryBytes * 100;

        var status = usagePercentage < 80
            ? HealthStatus.Healthy
            : usagePercentage < 95
                ? HealthStatus.Degraded
                : HealthStatus.Unhealthy;

        return new HealthCheck
        {
            Name = "Memory",
            Status = status,
            Description = $"Memory usage at {usagePercentage:F1}%",
            ResponseTimeMs = 0,
            Data = new Dictionary<string, object>
            {
                ["UsagePercentage"] = usagePercentage,
                ["WorkingSet"] = Process.GetCurrentProcess().WorkingSet64,
                ["TotalAvailable"] = gcMemoryInfo.TotalAvailableMemoryBytes
            }
        };
    }

    private HealthCheck CheckDiskHealth()
    {
        var drives = DriveInfo.GetDrives().Where(d => d.IsReady);
        var avgUsage = drives.Average(d => (double)(d.TotalSize - d.AvailableFreeSpace) / d.TotalSize * 100);

        var status = avgUsage < 85
            ? HealthStatus.Healthy
            : avgUsage < 95
                ? HealthStatus.Degraded
                : HealthStatus.Unhealthy;

        return new HealthCheck
        {
            Name = "Disk",
            Status = status,
            Description = $"Disk usage at {avgUsage:F1}%",
            ResponseTimeMs = 0,
            Data = new Dictionary<string, object>
            {
                ["AverageUsagePercentage"] = avgUsage,
                ["DriveCount"] = drives.Count()
            }
        };
    }

    private double GetCpuUsagePercentage()
    {
        var process = Process.GetCurrentProcess();
        var startTime = DateTime.UtcNow;
        var startCpuUsage = process.TotalProcessorTime;

        Thread.Sleep(100); // Sample for 100ms

        var endTime = DateTime.UtcNow;
        var endCpuUsage = process.TotalProcessorTime;

        var cpuUsedMs = (endCpuUsage - startCpuUsage).TotalMilliseconds;
        var totalMsPassed = (endTime - startTime).TotalMilliseconds;
        var cpuUsageTotal = cpuUsedMs / (Environment.ProcessorCount * totalMsPassed);

        return cpuUsageTotal * 100;
    }

    private double GetMemoryUsagePercentage()
    {
        var gcMemoryInfo = GC.GetGCMemoryInfo();
        var usedMemory = Process.GetCurrentProcess().WorkingSet64;
        var totalMemory = gcMemoryInfo.TotalAvailableMemoryBytes;

        return (double)usedMemory / totalMemory * 100;
    }

    private double GetDiskUsagePercentage()
    {
        var drives = DriveInfo.GetDrives().Where(d => d.IsReady);
        if (!drives.Any()) return 0;

        return drives.Average(d => (double)(d.TotalSize - d.AvailableFreeSpace) / d.TotalSize * 100);
    }

    #endregion
}
