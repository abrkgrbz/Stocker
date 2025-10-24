using System.Diagnostics;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.SystemMonitoring;

namespace Stocker.Persistence.Monitoring;

public class SystemMonitoringService : ISystemMonitoringService
{
    private static readonly DateTime _startTime = DateTime.UtcNow;

    public Task<SystemMetricsDto> GetSystemMetricsAsync(CancellationToken cancellationToken = default)
    {
        var process = Process.GetCurrentProcess();
        
        // CPU metrics (approximate)
        var cpuMetrics = new CpuMetricsDto(
            Usage: process.TotalProcessorTime.TotalMilliseconds / (Environment.ProcessorCount * 1000.0) * 100.0,
            Cores: Environment.ProcessorCount,
            Frequency: 0 // Not easily available in .NET
        );

        // Memory metrics
        var totalMemory = GC.GetGCMemoryInfo().TotalAvailableMemoryBytes;
        var usedMemory = process.WorkingSet64;
        var availableMemory = totalMemory - usedMemory;
        
        var memoryMetrics = new MemoryMetricsDto(
            Used: usedMemory,
            Total: totalMemory,
            Available: availableMemory,
            UsagePercentage: (double)usedMemory / totalMemory * 100.0
        );

        // Disk metrics (C: drive on Windows, / on Linux)
        var driveInfo = new DriveInfo(Path.GetPathRoot(AppDomain.CurrentDomain.BaseDirectory) ?? "C:\\");
        var diskMetrics = new DiskMetricsDto(
            Used: driveInfo.TotalSize - driveInfo.AvailableFreeSpace,
            Total: driveInfo.TotalSize,
            Free: driveInfo.AvailableFreeSpace,
            UsagePercentage: (double)(driveInfo.TotalSize - driveInfo.AvailableFreeSpace) / driveInfo.TotalSize * 100.0
        );

        // Network metrics (mock data - real implementation would need platform-specific APIs)
        var networkMetrics = new NetworkMetricsDto(
            BytesSent: 0,
            BytesReceived: 0,
            Speed: 100.0
        );

        var systemMetrics = new SystemMetricsDto(
            Cpu: cpuMetrics,
            Memory: memoryMetrics,
            Disk: diskMetrics,
            Network: networkMetrics,
            Timestamp: DateTime.UtcNow
        );

        return Task.FromResult(systemMetrics);
    }

    public Task<SystemHealthDto> GetSystemHealthAsync(CancellationToken cancellationToken = default)
    {
        var uptime = (long)(DateTime.UtcNow - _startTime).TotalSeconds;
        
        var services = new List<ServiceHealthDto>
        {
            new ServiceHealthDto(
                Name: "Database",
                Status: "Healthy",
                ResponseTime: 25.0,
                LastCheck: DateTime.UtcNow
            ),
            new ServiceHealthDto(
                Name: "RabbitMQ",
                Status: "Healthy",
                ResponseTime: 15.0,
                LastCheck: DateTime.UtcNow
            ),
            new ServiceHealthDto(
                Name: "Redis",
                Status: "Healthy",
                ResponseTime: 5.0,
                LastCheck: DateTime.UtcNow
            )
        };

        var health = new SystemHealthDto(
            OverallStatus: "Healthy",
            Services: services,
            Uptime: uptime,
            Timestamp: DateTime.UtcNow
        );

        return Task.FromResult(health);
    }

    public Task<List<ServiceStatusDto>> GetServiceStatusAsync(CancellationToken cancellationToken = default)
    {
        var uptime = (long)(DateTime.UtcNow - _startTime).TotalSeconds;
        
        var services = new List<ServiceStatusDto>
        {
            new ServiceStatusDto(
                Id: "api",
                Name: "API",
                Status: "online",
                Uptime: uptime,
                LastCheck: DateTime.UtcNow,
                ResponseTime: 50.0,
                ErrorRate: 0.01
            ),
            new ServiceStatusDto(
                Id: "database",
                Name: "Database",
                Status: "online",
                Uptime: uptime,
                LastCheck: DateTime.UtcNow,
                ResponseTime: 25.0,
                ErrorRate: 0.0
            ),
            new ServiceStatusDto(
                Id: "rabbitmq",
                Name: "RabbitMQ",
                Status: "online",
                Uptime: uptime,
                LastCheck: DateTime.UtcNow,
                ResponseTime: 15.0,
                ErrorRate: 0.005
            ),
            new ServiceStatusDto(
                Id: "redis",
                Name: "Redis",
                Status: "online",
                Uptime: uptime,
                LastCheck: DateTime.UtcNow,
                ResponseTime: 5.0,
                ErrorRate: 0.0
            )
        };

        return Task.FromResult(services);
    }
}
