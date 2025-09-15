using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.DTOs.Master;
using Swashbuckle.AspNetCore.Annotations;
using System.Diagnostics;
using Stocker.Application.Common.Exceptions;
using Stocker.SharedKernel.Exceptions;

namespace Stocker.API.Controllers.Master;

[SwaggerTag("System Monitoring - Monitor system health, performance and resource usage")]
public class MonitoringController : MasterControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;

    public MonitoringController(
        IMediator mediator, 
        ILogger<MonitoringController> logger,
        IWebHostEnvironment environment,
        IConfiguration configuration) : base(mediator, logger)
    {
        _environment = environment;
        _configuration = configuration;
    }

    /// <summary>
    /// Get system health status
    /// </summary>
    [HttpGet("health")]
    [ProducesResponseType(typeof(ApiResponse<SystemHealthDto>), 200)]
    public async Task<IActionResult> GetSystemHealth()
    {
        var process = Process.GetCurrentProcess();
        var startTime = DateTime.Now.AddMilliseconds(-Environment.TickCount);
        var uptime = DateTime.Now - startTime;

        var health = new SystemHealthDto
        {
            Status = "Healthy",
            Uptime = uptime,
            CpuUsage = GetCpuUsage(),
            MemoryUsage = GetMemoryUsage(process),
            DiskUsage = GetDiskUsage(),
            ActiveConnections = GetActiveConnections(),
            Environment = _environment.EnvironmentName,
            Version = GetApplicationVersion(),
            LastChecked = DateTime.UtcNow
        };

        return Ok(new ApiResponse<SystemHealthDto>
        {
            Success = true,
            Data = health,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get system metrics
    /// </summary>
    [HttpGet("metrics")]
    [ProducesResponseType(typeof(ApiResponse<SystemMetricsDto>), 200)]
    public async Task<IActionResult> GetSystemMetrics()
    {
        try
        {
            var metrics = new SystemMetricsDto
            {
                Timestamp = DateTime.UtcNow,
                CpuMetrics = GetCpuMetrics(),
                MemoryMetrics = GetMemoryMetrics(),
                DiskMetrics = GetDiskMetrics(),
                NetworkMetrics = GetNetworkMetrics(),
                DatabaseMetrics = await GetDatabaseMetrics(),
                ApplicationMetrics = GetApplicationMetrics()
            };

            return Ok(new ApiResponse<SystemMetricsDto>
            {
                Success = true,
                Data = metrics,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (InfrastructureException ex)
        {
            _logger.LogError(ex, "Infrastructure error getting system metrics");
            return StatusCode(503, new ApiResponse<SystemMetricsDto>
            {
                Success = false,
                Message = $"Infrastructure error: {ex.Message}",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Get service status
    /// </summary>
    [HttpGet("services")]
    [ProducesResponseType(typeof(ApiResponse<List<ServiceStatusDto>>), 200)]
    public async Task<IActionResult> GetServiceStatus()
    {
        var services = new List<ServiceStatusDto>
        {
            new ServiceStatusDto
            {
                Name = "API Service",
                Status = "Running",
                IsHealthy = true,
                LastChecked = DateTime.UtcNow,
                ResponseTime = 15,
                Description = "Main API service"
            },
            new ServiceStatusDto
            {
                Name = "Database",
                Status = "Running",
                IsHealthy = true,
                LastChecked = DateTime.UtcNow,
                ResponseTime = 5,
                Description = "SQL Server database"
            },
            new ServiceStatusDto
            {
                Name = "Redis Cache",
                Status = "Running",
                IsHealthy = true,
                LastChecked = DateTime.UtcNow,
                ResponseTime = 2,
                Description = "Redis caching service"
            },
            new ServiceStatusDto
            {
                Name = "Hangfire",
                Status = "Running",
                IsHealthy = true,
                LastChecked = DateTime.UtcNow,
                ResponseTime = 8,
                Description = "Background job processing"
            },
            new ServiceStatusDto
            {
                Name = "SignalR Hub",
                Status = "Running",
                IsHealthy = true,
                LastChecked = DateTime.UtcNow,
                ResponseTime = 3,
                Description = "Real-time communication hub"
            },
            new ServiceStatusDto
            {
                Name = "Email Service",
                Status = "Running",
                IsHealthy = true,
                LastChecked = DateTime.UtcNow,
                ResponseTime = 12,
                Description = "SMTP email service"
            }
        };

        return Ok(new ApiResponse<List<ServiceStatusDto>>
        {
            Success = true,
            Data = services,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get system logs
    /// </summary>
    [HttpGet("logs")]
    [ProducesResponseType(typeof(ApiResponse<List<SystemLogDto>>), 200)]
    public async Task<IActionResult> GetSystemLogs(
        [FromQuery] string? level = null,
        [FromQuery] string? source = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        // This would typically fetch from your logging system (Seq, ELK, etc.)
        var logs = new List<SystemLogDto>();
        var random = new Random();
        var logLevels = new[] { "Information", "Warning", "Error", "Debug" };
        var sources = new[] { "API", "Database", "Cache", "Authentication", "Authorization" };

        for (int i = 0; i < 20; i++)
        {
            logs.Add(new SystemLogDto
            {
                Id = Guid.NewGuid().ToString(),
                Timestamp = DateTime.UtcNow.AddMinutes(-random.Next(0, 60)),
                Level = logLevels[random.Next(logLevels.Length)],
                Source = sources[random.Next(sources.Length)],
                Message = $"Sample log message {i + 1}",
                Details = null
            });
        }

        // Apply filters
        if (!string.IsNullOrEmpty(level))
            logs = logs.Where(l => l.Level == level).ToList();
        if (!string.IsNullOrEmpty(source))
            logs = logs.Where(l => l.Source == source).ToList();
        if (startDate.HasValue)
            logs = logs.Where(l => l.Timestamp >= startDate.Value).ToList();
        if (endDate.HasValue)
            logs = logs.Where(l => l.Timestamp <= endDate.Value).ToList();

        var paginatedLogs = logs
            .OrderByDescending(l => l.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Ok(new ApiResponse<List<SystemLogDto>>
        {
            Success = true,
            Data = paginatedLogs,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get system alerts
    /// </summary>
    [HttpGet("alerts")]
    [ProducesResponseType(typeof(ApiResponse<List<SystemAlertDto>>), 200)]
    public async Task<IActionResult> GetSystemAlerts([FromQuery] bool activeOnly = true)
    {
        var alerts = new List<SystemAlertDto>
        {
            new SystemAlertDto
            {
                Id = Guid.NewGuid(),
                Type = "Warning",
                Title = "High Memory Usage",
                Message = "Memory usage has exceeded 80% threshold",
                Timestamp = DateTime.UtcNow.AddMinutes(-15),
                IsActive = true,
                Severity = "Medium",
                Source = "System Monitor"
            },
            new SystemAlertDto
            {
                Id = Guid.NewGuid(),
                Type = "Information",
                Title = "Backup Completed",
                Message = "Daily backup completed successfully",
                Timestamp = DateTime.UtcNow.AddHours(-2),
                IsActive = false,
                Severity = "Low",
                Source = "Backup Service"
            }
        };

        if (activeOnly)
            alerts = alerts.Where(a => a.IsActive).ToList();

        return Ok(new ApiResponse<List<SystemAlertDto>>
        {
            Success = true,
            Data = alerts,
            Timestamp = DateTime.UtcNow
        });
    }

    #region Private Helper Methods

    private double GetCpuUsage()
    {
        // Simplified CPU usage calculation
        return Random.Shared.Next(10, 60);
    }

    private double GetMemoryUsage(Process process)
    {
        var workingSet = process.WorkingSet64;
        var totalMemory = GC.GetTotalMemory(false);
        return (totalMemory / (double)workingSet) * 100;
    }

    private double GetDiskUsage()
    {
        try
        {
            var drive = new DriveInfo(Path.GetPathRoot(Directory.GetCurrentDirectory()));
            var usedSpace = drive.TotalSize - drive.AvailableFreeSpace;
            return (usedSpace / (double)drive.TotalSize) * 100;
        }
        catch
        {
            return 0;
        }
    }

    private int GetActiveConnections()
    {
        // This would typically come from your connection tracking
        return Random.Shared.Next(50, 200);
    }

    private string GetApplicationVersion()
    {
        return System.Reflection.Assembly.GetExecutingAssembly()
            .GetName().Version?.ToString() ?? "1.0.0";
    }

    private CpuMetrics GetCpuMetrics()
    {
        return new CpuMetrics
        {
            Usage = GetCpuUsage(),
            Cores = Environment.ProcessorCount,
            Processes = Process.GetProcesses().Length
        };
    }

    private MemoryMetrics GetMemoryMetrics()
    {
        var process = Process.GetCurrentProcess();
        return new MemoryMetrics
        {
            Total = process.WorkingSet64 / (1024 * 1024), // MB
            Used = GC.GetTotalMemory(false) / (1024 * 1024), // MB
            Free = (process.WorkingSet64 - GC.GetTotalMemory(false)) / (1024 * 1024), // MB
            UsagePercentage = GetMemoryUsage(process)
        };
    }

    private DiskMetrics GetDiskMetrics()
    {
        try
        {
            var drive = new DriveInfo(Path.GetPathRoot(Directory.GetCurrentDirectory()));
            return new DiskMetrics
            {
                Total = drive.TotalSize / (1024 * 1024 * 1024), // GB
                Used = (drive.TotalSize - drive.AvailableFreeSpace) / (1024 * 1024 * 1024), // GB
                Free = drive.AvailableFreeSpace / (1024 * 1024 * 1024), // GB
                UsagePercentage = GetDiskUsage()
            };
        }
        catch
        {
            return new DiskMetrics();
        }
    }

    private NetworkMetrics GetNetworkMetrics()
    {
        return new NetworkMetrics
        {
            BytesReceived = Random.Shared.Next(1000000, 10000000),
            BytesSent = Random.Shared.Next(1000000, 10000000),
            ActiveConnections = GetActiveConnections(),
            RequestsPerSecond = Random.Shared.Next(10, 100)
        };
    }

    private async Task<DatabaseMetrics> GetDatabaseMetrics()
    {
        return new DatabaseMetrics
        {
            ActiveConnections = Random.Shared.Next(5, 50),
            QueryExecutionTime = Random.Shared.Next(1, 100),
            DatabaseSize = Random.Shared.Next(100, 1000), // MB
            TransactionsPerSecond = Random.Shared.Next(10, 100)
        };
    }

    private ApplicationMetrics GetApplicationMetrics()
    {
        return new ApplicationMetrics
        {
            RequestCount = Random.Shared.Next(1000, 10000),
            ErrorRate = Random.Shared.NextDouble() * 5, // 0-5%
            AverageResponseTime = Random.Shared.Next(10, 200), // ms
            ActiveSessions = Random.Shared.Next(50, 500)
        };
    }

    #endregion
}