using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.SystemMonitoring;

namespace Stocker.Persistence.Monitoring;

public class SystemMonitoringService : ISystemMonitoringService
{
    private readonly IMasterDbContext _masterContext;
    private static readonly DateTime _startTime = DateTime.UtcNow;
    private static DateTime _lastCpuCheck = DateTime.UtcNow;
    private static TimeSpan _lastTotalProcessorTime = TimeSpan.Zero;
    private static double _lastCpuUsage = 0.0;

    // In-memory storage for alerts (SystemAlert entity olmadığı için memory'de tutuyoruz)
    private static readonly List<AlertRecord> _alerts = new();
    private static readonly object _alertLock = new();
    private static DateTime _lastAlertCheck = DateTime.MinValue;

    private class AlertRecord
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public bool IsActive { get; set; }
        public string? AcknowledgedBy { get; set; }
        public DateTime? AcknowledgedAt { get; set; }
    }

    public SystemMonitoringService(IMasterDbContext masterContext)
    {
        _masterContext = masterContext;
    }

    public async Task<SystemMetricsDto> GetSystemMetricsAsync(CancellationToken cancellationToken = default)
    {
        var process = Process.GetCurrentProcess();

        // CPU metrics - Calculate based on delta time
        var currentTime = DateTime.UtcNow;
        var currentTotalProcessorTime = process.TotalProcessorTime;

        double cpuUsagePercent = 0.0;

        // Calculate CPU usage based on time delta
        if (_lastTotalProcessorTime != TimeSpan.Zero)
        {
            var timeDelta = (currentTime - _lastCpuCheck).TotalMilliseconds;
            var cpuDelta = (currentTotalProcessorTime - _lastTotalProcessorTime).TotalMilliseconds;

            if (timeDelta > 0)
            {
                // CPU usage as percentage of one core
                cpuUsagePercent = (cpuDelta / timeDelta) * 100.0;

                // Ensure it's within valid range (0-100%)
                cpuUsagePercent = Math.Max(0, Math.Min(100, cpuUsagePercent));
            }
        }

        // Update last values for next calculation
        _lastCpuCheck = currentTime;
        _lastTotalProcessorTime = currentTotalProcessorTime;
        _lastCpuUsage = cpuUsagePercent;

        var cpuMetrics = new CpuMetricsDto(
            Usage: cpuUsagePercent,
            Cores: Environment.ProcessorCount,
            Frequency: 0 // Not easily available in .NET
        );

        // Memory metrics
        var totalMemory = GC.GetGCMemoryInfo().TotalAvailableMemoryBytes;
        var usedMemory = process.WorkingSet64;
        var availableMemory = totalMemory - usedMemory;
        var memoryUsagePercentage = (double)usedMemory / totalMemory * 100.0;

        var memoryMetrics = new MemoryMetricsDto(
            Used: usedMemory,
            Total: totalMemory,
            Available: availableMemory,
            UsagePercentage: memoryUsagePercentage
        );

        // Disk metrics (C: drive on Windows, / on Linux)
        var driveInfo = new DriveInfo(Path.GetPathRoot(AppDomain.CurrentDomain.BaseDirectory) ?? "C:\\");
        var diskUsagePercentage = (double)(driveInfo.TotalSize - driveInfo.AvailableFreeSpace) / driveInfo.TotalSize * 100.0;

        var diskMetrics = new DiskMetricsDto(
            Used: driveInfo.TotalSize - driveInfo.AvailableFreeSpace,
            Total: driveInfo.TotalSize,
            Free: driveInfo.AvailableFreeSpace,
            UsagePercentage: diskUsagePercentage
        );

        // Network metrics (real implementation would need platform-specific APIs)
        var networkMetrics = new NetworkMetricsDto(
            BytesSent: 0,
            BytesReceived: 0,
            Speed: 100.0
        );

        // Check for alerts based on current metrics
        await CheckAndGenerateAlertsAsync(memoryUsagePercentage, diskUsagePercentage, cancellationToken);

        var systemMetrics = new SystemMetricsDto(
            Cpu: cpuMetrics,
            Memory: memoryMetrics,
            Disk: diskMetrics,
            Network: networkMetrics,
            Timestamp: DateTime.UtcNow
        );

        return systemMetrics;
    }

    public async Task<SystemHealthDto> GetSystemHealthAsync(CancellationToken cancellationToken = default)
    {
        var uptime = (long)(DateTime.UtcNow - _startTime).TotalSeconds;
        var services = new List<ServiceHealthDto>();
        var overallStatus = "Healthy";

        // Database health check - gerçek bağlantı kontrolü
        var dbStopwatch = Stopwatch.StartNew();
        try
        {
            // Basit bir sorgu ile veritabanı bağlantısını kontrol et
            await _masterContext.Tenants.Take(1).ToListAsync(cancellationToken);
            dbStopwatch.Stop();

            services.Add(new ServiceHealthDto(
                Name: "PostgreSQL Veritabanı",
                Status: "Healthy",
                ResponseTime: dbStopwatch.ElapsedMilliseconds,
                LastCheck: DateTime.UtcNow
            ));
        }
        catch (Exception ex)
        {
            dbStopwatch.Stop();
            overallStatus = "Unhealthy";

            services.Add(new ServiceHealthDto(
                Name: "PostgreSQL Veritabanı",
                Status: "Unhealthy",
                ResponseTime: dbStopwatch.ElapsedMilliseconds,
                LastCheck: DateTime.UtcNow
            ));

            // Veritabanı hatası için alert oluştur
            AddAlert("error", "critical", "Veritabanı Bağlantı Hatası",
                $"PostgreSQL veritabanına bağlanılamadı: {ex.Message}", "SystemMonitor");
        }

        // API service health (always healthy since we're responding)
        services.Add(new ServiceHealthDto(
            Name: "API Servisi",
            Status: "Healthy",
            ResponseTime: 1,
            LastCheck: DateTime.UtcNow
        ));

        // Memory check
        var memoryInfo = GC.GetGCMemoryInfo();
        var usedMemory = Process.GetCurrentProcess().WorkingSet64;
        var memoryUsage = (double)usedMemory / memoryInfo.TotalAvailableMemoryBytes * 100.0;
        var memoryStatus = memoryUsage > 90 ? "Unhealthy" : memoryUsage > 75 ? "Degraded" : "Healthy";

        if (memoryStatus != "Healthy")
        {
            overallStatus = memoryStatus == "Unhealthy" ? "Unhealthy" :
                           (overallStatus == "Healthy" ? "Degraded" : overallStatus);
        }

        services.Add(new ServiceHealthDto(
            Name: "Bellek Durumu",
            Status: memoryStatus,
            ResponseTime: 0,
            LastCheck: DateTime.UtcNow
        ));

        // Disk check
        var driveInfo = new DriveInfo(Path.GetPathRoot(AppDomain.CurrentDomain.BaseDirectory) ?? "C:\\");
        var diskUsage = (double)(driveInfo.TotalSize - driveInfo.AvailableFreeSpace) / driveInfo.TotalSize * 100.0;
        var diskStatus = diskUsage > 95 ? "Unhealthy" : diskUsage > 85 ? "Degraded" : "Healthy";

        if (diskStatus != "Healthy")
        {
            overallStatus = diskStatus == "Unhealthy" ? "Unhealthy" :
                           (overallStatus == "Healthy" ? "Degraded" : overallStatus);
        }

        services.Add(new ServiceHealthDto(
            Name: "Disk Durumu",
            Status: diskStatus,
            ResponseTime: 0,
            LastCheck: DateTime.UtcNow
        ));

        var health = new SystemHealthDto(
            OverallStatus: overallStatus,
            Services: services,
            Uptime: uptime,
            Timestamp: DateTime.UtcNow
        );

        return health;
    }

    public async Task<List<ServiceStatusDto>> GetServiceStatusAsync(CancellationToken cancellationToken = default)
    {
        var uptime = (long)(DateTime.UtcNow - _startTime).TotalSeconds;
        var services = new List<ServiceStatusDto>();

        // API Service - always online since we're responding
        services.Add(new ServiceStatusDto(
            Id: "api",
            Name: "API",
            Status: "online",
            Uptime: uptime,
            LastCheck: DateTime.UtcNow,
            ResponseTime: 1.0,
            ErrorRate: 0.0
        ));

        // Database Service - gerçek kontrol
        var dbStopwatch = Stopwatch.StartNew();
        string dbStatus = "online";
        double dbErrorRate = 0.0;

        try
        {
            await _masterContext.Tenants.Take(1).ToListAsync(cancellationToken);
            dbStopwatch.Stop();
        }
        catch
        {
            dbStopwatch.Stop();
            dbStatus = "offline";
            dbErrorRate = 1.0;
        }

        services.Add(new ServiceStatusDto(
            Id: "database",
            Name: "PostgreSQL",
            Status: dbStatus,
            Uptime: dbStatus == "online" ? uptime : 0,
            LastCheck: DateTime.UtcNow,
            ResponseTime: dbStopwatch.ElapsedMilliseconds,
            ErrorRate: dbErrorRate
        ));

        // Identity Service
        services.Add(new ServiceStatusDto(
            Id: "identity",
            Name: "Kimlik Doğrulama",
            Status: "online",
            Uptime: uptime,
            LastCheck: DateTime.UtcNow,
            ResponseTime: 5.0,
            ErrorRate: 0.0
        ));

        // Background Jobs (Hangfire)
        services.Add(new ServiceStatusDto(
            Id: "hangfire",
            Name: "Arkaplan İşleri",
            Status: "online",
            Uptime: uptime,
            LastCheck: DateTime.UtcNow,
            ResponseTime: 10.0,
            ErrorRate: 0.0
        ));

        return services;
    }

    public async Task<SystemLogsResponseDto> GetSystemLogsAsync(
        string? level = null,
        string? source = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int page = 1,
        int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var start = startDate ?? DateTime.UtcNow.AddDays(-7);
        var end = endDate ?? DateTime.UtcNow;

        // SecurityAuditLogs tablosundan gerçek logları çek
        var query = _masterContext.SecurityAuditLogs
            .Where(l => l.Timestamp >= start && l.Timestamp <= end);

        // Level filtresi - Event türüne göre eşleştirme
        if (!string.IsNullOrEmpty(level))
        {
            query = level.ToLower() switch
            {
                "error" => query.Where(l => l.Blocked || l.RiskScore >= 70 || l.Event.Contains("failed") || l.Event.Contains("error")),
                "warning" => query.Where(l => l.RiskScore >= 40 && l.RiskScore < 70 || l.Event.Contains("rate_limit")),
                "debug" => query.Where(l => l.Event.Contains("debug") || l.Event.Contains("trace")),
                _ => query // Information - tümü
            };
        }

        // Source filtresi
        if (!string.IsNullOrEmpty(source))
        {
            query = query.Where(l =>
                (l.GdprCategory != null && l.GdprCategory.Contains(source)) ||
                (l.Event != null && l.Event.Contains(source)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var auditLogs = await query
            .OrderByDescending(l => l.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        // AuditLog'ları SystemLogEntryDto'ya dönüştür
        var logs = auditLogs.Select(l => new SystemLogEntryDto(
            Id: l.Id.ToString(),
            Timestamp: l.Timestamp,
            Level: DetermineLogLevel(l),
            Source: l.GdprCategory ?? "System",
            Message: FormatLogMessage(l),
            CorrelationId: l.RequestId,
            Exception: l.Blocked ? $"Engellendi - Risk Skoru: {l.RiskScore}" : null,
            Properties: new Dictionary<string, object>
            {
                ["Event"] = l.Event,
                ["Email"] = l.Email ?? "",
                ["TenantCode"] = l.TenantCode ?? "",
                ["IpAddress"] = l.IpAddress ?? "",
                ["RiskScore"] = l.RiskScore ?? 0,
                ["DurationMs"] = l.DurationMs ?? 0
            }
        )).ToList();

        // Özet istatistikler
        var allLogsForSummary = await _masterContext.SecurityAuditLogs
            .Where(l => l.Timestamp >= start && l.Timestamp <= end)
            .ToListAsync(cancellationToken);

        var summary = new LogSummaryDto(
            ErrorCount: allLogsForSummary.Count(l => l.Blocked || l.RiskScore >= 70),
            WarningCount: allLogsForSummary.Count(l => l.RiskScore >= 40 && l.RiskScore < 70),
            InfoCount: allLogsForSummary.Count(l => l.RiskScore == null || l.RiskScore < 40),
            DebugCount: 0
        );

        return new SystemLogsResponseDto(
            Logs: logs,
            TotalCount: totalCount,
            PageNumber: page,
            PageSize: pageSize,
            TotalPages: (int)Math.Ceiling(totalCount / (double)pageSize),
            Summary: summary
        );
    }

    public Task<List<SystemAlertDto>> GetSystemAlertsAsync(bool activeOnly = true, CancellationToken cancellationToken = default)
    {
        List<AlertRecord> alerts;
        lock (_alertLock)
        {
            alerts = activeOnly
                ? _alerts.Where(a => a.IsActive).ToList()
                : _alerts.ToList();
        }

        var result = alerts
            .OrderByDescending(a => a.Timestamp)
            .Select(a => new SystemAlertDto(
                Id: a.Id,
                Type: a.Type,
                Severity: a.Severity,
                Title: a.Title,
                Message: a.Message,
                Source: a.Source,
                Timestamp: a.Timestamp,
                IsActive: a.IsActive,
                AcknowledgedBy: a.AcknowledgedBy,
                AcknowledgedAt: a.AcknowledgedAt
            ))
            .ToList();

        return Task.FromResult(result);
    }

    public Task<SystemAlertDto?> AcknowledgeAlertAsync(string alertId, string acknowledgedBy, CancellationToken cancellationToken = default)
    {
        lock (_alertLock)
        {
            var alert = _alerts.FirstOrDefault(a => a.Id == alertId);
            if (alert == null)
            {
                return Task.FromResult<SystemAlertDto?>(null);
            }

            alert.AcknowledgedBy = acknowledgedBy;
            alert.AcknowledgedAt = DateTime.UtcNow;

            var result = new SystemAlertDto(
                Id: alert.Id,
                Type: alert.Type,
                Severity: alert.Severity,
                Title: alert.Title,
                Message: alert.Message,
                Source: alert.Source,
                Timestamp: alert.Timestamp,
                IsActive: alert.IsActive,
                AcknowledgedBy: alert.AcknowledgedBy,
                AcknowledgedAt: alert.AcknowledgedAt
            );

            return Task.FromResult<SystemAlertDto?>(result);
        }
    }

    public Task<bool> DismissAlertAsync(string alertId, string dismissedBy, CancellationToken cancellationToken = default)
    {
        lock (_alertLock)
        {
            var alert = _alerts.FirstOrDefault(a => a.Id == alertId);
            if (alert == null)
            {
                return Task.FromResult(false);
            }

            alert.IsActive = false;
            alert.AcknowledgedBy = dismissedBy;
            alert.AcknowledgedAt = DateTime.UtcNow;

            return Task.FromResult(true);
        }
    }

    #region Private Helper Methods

    private static string DetermineLogLevel(Domain.Master.Entities.SecurityAuditLog log)
    {
        if (log.Blocked || log.RiskScore >= 70)
            return "Error";
        if (log.RiskScore >= 40 || log.Event.Contains("rate_limit", StringComparison.OrdinalIgnoreCase))
            return "Warning";
        if (log.Event.Contains("debug", StringComparison.OrdinalIgnoreCase))
            return "Debug";
        return "Information";
    }

    private static string FormatLogMessage(Domain.Master.Entities.SecurityAuditLog log)
    {
        var eventTranslations = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["login_success"] = "Başarılı giriş",
            ["login_failed"] = "Başarısız giriş denemesi",
            ["login_rate_limit_email"] = "E-posta için hız limiti aşıldı",
            ["login_rate_limit_ip"] = "IP adresi için hız limiti aşıldı",
            ["logout"] = "Çıkış yapıldı",
            ["password_reset_requested"] = "Şifre sıfırlama talep edildi",
            ["password_changed"] = "Şifre değiştirildi",
            ["token_refresh"] = "Token yenilendi",
            ["multiple_tenant_access"] = "Çoklu tenant erişimi",
            ["login_invalid_signature"] = "Geçersiz imza ile giriş denemesi"
        };

        var eventName = eventTranslations.TryGetValue(log.Event, out var translated)
            ? translated
            : log.Event;

        var parts = new List<string> { eventName };

        if (!string.IsNullOrEmpty(log.Email))
            parts.Add($"Kullanıcı: {log.Email}");

        if (!string.IsNullOrEmpty(log.TenantCode))
            parts.Add($"Tenant: {log.TenantCode}");

        if (!string.IsNullOrEmpty(log.IpAddress))
            parts.Add($"IP: {log.IpAddress}");

        if (log.RiskScore.HasValue && log.RiskScore > 0)
            parts.Add($"Risk: {log.RiskScore}");

        return string.Join(" | ", parts);
    }

    private Task CheckAndGenerateAlertsAsync(double memoryUsage, double diskUsage, CancellationToken cancellationToken)
    {
        // Her 5 dakikada bir kontrol et (sürekli alert spam'i önlemek için)
        if ((DateTime.UtcNow - _lastAlertCheck).TotalMinutes < 5)
            return Task.CompletedTask;

        _lastAlertCheck = DateTime.UtcNow;

        // Bellek uyarısı
        if (memoryUsage > 80)
        {
            var severity = memoryUsage > 90 ? "critical" : "medium";
            var type = memoryUsage > 90 ? "error" : "warning";
            AddAlert(type, severity, "Yüksek Bellek Kullanımı",
                $"Bellek kullanımı %{memoryUsage:F1} seviyesine ulaştı", "SystemMonitor");
        }

        // Disk uyarısı
        if (diskUsage > 85)
        {
            var severity = diskUsage > 95 ? "critical" : "medium";
            var type = diskUsage > 95 ? "error" : "warning";
            AddAlert(type, severity, "Yüksek Disk Kullanımı",
                $"Disk kullanımı %{diskUsage:F1} seviyesine ulaştı", "SystemMonitor");
        }

        return Task.CompletedTask;
    }

    private static void AddAlert(string type, string severity, string title, string message, string source)
    {
        lock (_alertLock)
        {
            // Aynı başlıkla aktif alert varsa yeni ekleme
            if (_alerts.Any(a => a.IsActive && a.Title == title))
                return;

            // Maksimum 100 alert tut
            if (_alerts.Count >= 100)
            {
                var oldestInactive = _alerts
                    .Where(a => !a.IsActive)
                    .OrderBy(a => a.Timestamp)
                    .FirstOrDefault();

                if (oldestInactive != null)
                    _alerts.Remove(oldestInactive);
            }

            _alerts.Add(new AlertRecord
            {
                Id = Guid.NewGuid().ToString(),
                Type = type,
                Severity = severity,
                Title = title,
                Message = message,
                Source = source,
                Timestamp = DateTime.UtcNow,
                IsActive = true,
                AcknowledgedBy = null,
                AcknowledgedAt = null
            });
        }
    }

    #endregion
}
