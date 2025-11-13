using Hangfire;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SignalR.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Stocker.Infrastructure.BackgroundJobs;

/// <summary>
/// Background job for collecting and pushing system monitoring metrics via SignalR
/// </summary>
public class MonitoringMetricsJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MonitoringMetricsJob> _logger;

    public MonitoringMetricsJob(
        IServiceProvider serviceProvider,
        ILogger<MonitoringMetricsJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>
    /// Collects system metrics and pushes them to all connected monitoring clients
    /// </summary>
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 5, 10, 30 })]
    public async Task CollectAndPushMetrics()
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var monitoringService = scope.ServiceProvider.GetRequiredService<ISystemMonitoringService>();
            var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<MonitoringHub>>();

            _logger.LogDebug("Starting metrics collection for real-time monitoring");

            // Collect all metrics in parallel for better performance
            var metricsTask = monitoringService.GetSystemMetricsAsync();
            var healthTask = monitoringService.GetSystemHealthAsync();
            var servicesTask = monitoringService.GetServiceStatusAsync();

            await Task.WhenAll(metricsTask, healthTask, servicesTask);

            var metrics = await metricsTask;
            var health = await healthTask;
            var services = await servicesTask;

            // Prepare the monitoring data package
            var monitoringData = new
            {
                metrics = new
                {
                    cpu = metrics.Cpu,
                    memory = metrics.Memory,
                    disk = metrics.Disk,
                    network = metrics.Network,
                    timestamp = metrics.Timestamp
                },
                health = new
                {
                    overallStatus = health.OverallStatus,
                    services = health.Services,
                    uptime = health.Uptime,
                    timestamp = health.Timestamp
                },
                services = services,
                collectedAt = DateTime.UtcNow
            };

            // Push to all connected admin monitoring clients
            await hubContext.Clients.Group("admin-monitoring")
                .SendAsync("ReceiveMetricsUpdate", monitoringData);

            // Also push to system-metrics subscribers
            await hubContext.Clients.Group("system-metrics")
                .SendAsync("SystemMetricsUpdate", metrics);

            // Push service health to health subscribers
            await hubContext.Clients.Group("service-health")
                .SendAsync("ServiceHealthUpdate", health);

            _logger.LogDebug("Successfully pushed monitoring metrics to {GroupCount} groups", 3);

            // Check for alerts based on thresholds
            await CheckAndSendAlerts(metrics, health, hubContext);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error collecting and pushing monitoring metrics");
            throw; // Let Hangfire handle retries
        }
    }

    /// <summary>
    /// Check metrics against thresholds and send alerts if necessary
    /// </summary>
    private async Task CheckAndSendAlerts(
        dynamic metrics,
        dynamic health,
        IHubContext<MonitoringHub> hubContext)
    {
        try
        {
            var alerts = new List<object>();

            // Check CPU threshold (>80% warning, >90% critical)
            if (metrics.Cpu.Usage > 90)
            {
                alerts.Add(new
                {
                    id = Guid.NewGuid().ToString(),
                    severity = "critical",
                    metric = "cpu",
                    value = metrics.Cpu.Usage,
                    threshold = 90,
                    message = $"Critical: CPU usage is {metrics.Cpu.Usage:F1}%",
                    timestamp = DateTime.UtcNow
                });
            }
            else if (metrics.Cpu.Usage > 80)
            {
                alerts.Add(new
                {
                    id = Guid.NewGuid().ToString(),
                    severity = "warning",
                    metric = "cpu",
                    value = metrics.Cpu.Usage,
                    threshold = 80,
                    message = $"Warning: CPU usage is {metrics.Cpu.Usage:F1}%",
                    timestamp = DateTime.UtcNow
                });
            }

            // Check Memory threshold (>85% warning, >95% critical)
            if (metrics.Memory.UsagePercentage > 95)
            {
                alerts.Add(new
                {
                    id = Guid.NewGuid().ToString(),
                    severity = "critical",
                    metric = "memory",
                    value = metrics.Memory.UsagePercentage,
                    threshold = 95,
                    message = $"Critical: Memory usage is {metrics.Memory.UsagePercentage:F1}%",
                    timestamp = DateTime.UtcNow
                });
            }
            else if (metrics.Memory.UsagePercentage > 85)
            {
                alerts.Add(new
                {
                    id = Guid.NewGuid().ToString(),
                    severity = "warning",
                    metric = "memory",
                    value = metrics.Memory.UsagePercentage,
                    threshold = 85,
                    message = $"Warning: Memory usage is {metrics.Memory.UsagePercentage:F1}%",
                    timestamp = DateTime.UtcNow
                });
            }

            // Check Disk threshold (>90% warning, >95% critical)
            if (metrics.Disk.UsagePercentage > 95)
            {
                alerts.Add(new
                {
                    id = Guid.NewGuid().ToString(),
                    severity = "critical",
                    metric = "disk",
                    value = metrics.Disk.UsagePercentage,
                    threshold = 95,
                    message = $"Critical: Disk usage is {metrics.Disk.UsagePercentage:F1}%",
                    timestamp = DateTime.UtcNow
                });
            }
            else if (metrics.Disk.UsagePercentage > 90)
            {
                alerts.Add(new
                {
                    id = Guid.NewGuid().ToString(),
                    severity = "warning",
                    metric = "disk",
                    value = metrics.Disk.UsagePercentage,
                    threshold = 90,
                    message = $"Warning: Disk usage is {metrics.Disk.UsagePercentage:F1}%",
                    timestamp = DateTime.UtcNow
                });
            }

            // Check service health
            if (health.OverallStatus != "Healthy")
            {
                alerts.Add(new
                {
                    id = Guid.NewGuid().ToString(),
                    severity = health.OverallStatus == "Degraded" ? "warning" : "critical",
                    metric = "health",
                    value = health.OverallStatus,
                    threshold = "Healthy",
                    message = $"System health is {health.OverallStatus}",
                    timestamp = DateTime.UtcNow
                });
            }

            // Send alerts if any
            if (alerts.Any())
            {
                await hubContext.Clients.Group("monitoring-alerts")
                    .SendAsync("MonitoringAlert", new
                    {
                        alerts = alerts,
                        timestamp = DateTime.UtcNow
                    });

                _logger.LogWarning("Sent {AlertCount} monitoring alerts", alerts.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking and sending monitoring alerts");
        }
    }

    /// <summary>
    /// Collect and push Docker container stats
    /// </summary>
    [AutomaticRetry(Attempts = 2, DelaysInSeconds = new[] { 10, 30 })]
    public async Task CollectAndPushDockerStats()
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var dockerService = scope.ServiceProvider.GetService<IDockerManagementService>();
            var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<MonitoringHub>>();

            if (dockerService == null)
            {
                _logger.LogWarning("Docker management service not available");
                return;
            }

            _logger.LogDebug("Starting Docker stats collection");

            var dockerStats = await dockerService.GetDockerStatsAsync(CancellationToken.None);

            var dockerData = new
            {
                containers = dockerStats.Containers,
                images = dockerStats.Images,
                volumes = dockerStats.Volumes,
                networks = dockerStats.Networks,
                cacheInfo = dockerStats.CacheInfo,
                timestamp = DateTime.UtcNow
            };

            // Push Docker stats to monitoring clients
            await hubContext.Clients.Group("admin-monitoring")
                .SendAsync("DockerStatsUpdate", dockerData);

            _logger.LogDebug("Successfully pushed Docker stats to monitoring clients");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error collecting and pushing Docker stats");
            // Don't rethrow - Docker stats are optional
        }
    }
}